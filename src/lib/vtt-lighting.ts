/**
 * VTT Dynamic Lighting Engine
 *
 * Implements 2D raycasting for line-of-sight and dynamic lighting.
 * Walls are line segments that block vision/light.
 * Light sources and tokens emit visibility polygons.
 */

export interface Point {
  x: number;
  y: number;
}

export interface Segment {
  a: Point;
  b: Point;
}

export interface LightDef {
  origin: Point;
  radius: number;
  color: number;
  intensity: number;
}

export interface VisionDef {
  origin: Point;
  radius: number;
}

/**
 * Compute a visibility polygon from `origin` given a set of wall segments.
 * ⚡ Performance optimizations:
 * - Pre-filters walls using an AABB (Axis-Aligned Bounding Box) check against maxRadius.
 * - Uses a pre-allocated Float64Array instead of Set to avoid object allocation and GC overhead for angles.
 * - Inlines intersection coordinate variables directly into math operations to avoid Point object allocations.
 *
 * ⚡ Bolt: Replaced object allocations (Set, objects) with pre-allocated Float64Array
 * and unrolled vector math to reduce GC pressure in the hot loop.
 */
export function computeVisibilityPolygon(
  origin: Point,
  walls: Segment[],
  bounds: { width: number; height: number },
  maxRadius?: number,
): Point[] {
  // ⚡ Bolt: AABB filter and unrolled vector math for dynamic lighting raycasting
  const ox = origin.x;
  const oy = origin.y;

  // AABB for quick rejection of distant walls
  let minX = -Infinity, maxX = Infinity, minY = -Infinity, maxY = Infinity;
  if (maxRadius !== undefined) {
    minX = ox - maxRadius;
    maxX = ox + maxRadius;
    minY = oy - maxRadius;
    maxY = oy + maxRadius;
  }

  // Add bounding box walls unconditionally to the end so they are never filtered
  const allWalls: Segment[] = [
    ...walls,
    { a: { x: 0, y: 0 }, b: { x: bounds.width, y: 0 } },
    { a: { x: bounds.width, y: 0 }, b: { x: bounds.width, y: bounds.height } },
    { a: { x: bounds.width, y: bounds.height }, b: { x: 0, y: bounds.height } },
    { a: { x: 0, y: bounds.height }, b: { x: 0, y: 0 } },
  ];

  // ⚡ Bolt: Filter active walls and pre-extract coordinates to avoid object lookups
  const activeWalls: Segment[] = [];
  for (let i = 0; i < allWalls.length; i++) {
    const w = allWalls[i];

    // Unconditionally include the 4 boundary walls (the last 4 in the array)
    if (i >= allWalls.length - 4) {
      activeWalls.push(w);
      continue;
    }

    // AABB check
    if (maxRadius !== undefined) {
      const wMinX = Math.min(w.a.x, w.b.x);
      const wMaxX = Math.max(w.a.x, w.b.x);
      const wMinY = Math.min(w.a.y, w.b.y);
      const wMaxY = Math.max(w.a.y, w.b.y);

      if (wMaxX < minX || wMinX > maxX || wMaxY < minY || wMinY > maxY) {
        continue; // Skip wall if strictly outside AABB
      }
    }
    activeWalls.push(w);
  }

  const activeWallsCount = activeWalls.length;

  // ⚡ Bolt: Use Typed Arrays to avoid Garbage Collection (GC) overhead during Set iteration
  // Each wall contributes up to 2 endpoints * 3 angles = 6 angles
  const angles = new Float64Array(activeWallsCount * 6);
  let angleCount = 0;

  const wallAx = new Float64Array(activeWallsCount);
  const wallAy = new Float64Array(activeWallsCount);
  const wallDx = new Float64Array(activeWallsCount);
  const wallDy = new Float64Array(activeWallsCount);
  const wallDiffX = new Float64Array(activeWallsCount);
  const wallDiffY = new Float64Array(activeWallsCount);

  for (let i = 0; i < activeWallsCount; i++) {
    const wall = activeWalls[i];

    wallAx[i] = wall.a.x;
    wallAy[i] = wall.a.y;
    wallDx[i] = wall.b.x - wall.a.x;
    wallDy[i] = wall.b.y - wall.a.y;
    wallDiffX[i] = wall.a.x - ox;
    wallDiffY[i] = wall.a.y - oy;

    let angle = Math.atan2(wall.a.y - oy, wall.a.x - ox);
    angles[angleCount++] = angle;
    angles[angleCount++] = angle - 0.0001;
    angles[angleCount++] = angle + 0.0001;

    angle = Math.atan2(wall.b.y - oy, wall.b.x - ox);
    angles[angleCount++] = angle;
    angles[angleCount++] = angle - 0.0001;
    angles[angleCount++] = angle + 0.0001;
  }

  // Deduplicate angles using a sorted view
  const anglesView = angles.subarray(0, angleCount);
  anglesView.sort();

  const points: Point[] = [];
  let lastAngle = -Infinity;

  for (let i = 0; i < angleCount; i++) {
    const angle = anglesView[i];

    // Deduplication step
    if (angle - lastAngle < 1e-8) {
      continue;
    }
    lastAngle = angle;

    const dirX = Math.cos(angle);
    const dirY = Math.sin(angle);

    let closestT = Infinity;

    // ⚡ Bolt: Inline ray-segment intersection math (Cramer's rule) for maximum performance
    for (let j = 0; j < activeWallsCount; j++) {
      const dx = wallDx[j];
      const dy = wallDy[j];

      const denom = dirX * dy - dirY * dx;
      // Skip if lines are parallel or collinear
      if (denom > -1e-10 && denom < 1e-10) continue;

      // ⚡ Bolt: Use precomputed diffs (Loop Invariant Code Motion)
      const diffX = wallDiffX[j];
      const diffY = wallDiffY[j];

      const u = (diffX * dirY - diffY * dirX) / denom;
      if (u < 0 || u > 1) continue;

      const t = (diffX * dy - diffY * dx) / denom;
      if (t >= 0 && t < closestT) {
        closestT = t;
      }
    }

    if (closestT === Infinity) continue;

    if (maxRadius !== undefined && closestT > maxRadius) {
      closestT = maxRadius;
    }

    points.push({
      x: ox + dirX * closestT,
      y: oy + dirY * closestT,
    });
  }

  return points;
}

/**
 * Merge multiple visibility polygons by computing each independently.
 * Returns an array of polygon point arrays.
 */
export function computeMultipleVisionAreas(
  sources: VisionDef[],
  walls: Segment[],
  bounds: { width: number; height: number },
): Point[][] {
  return sources.map((src) =>
    computeVisibilityPolygon(
      src.origin,
      walls,
      bounds,
      src.radius,
    ),
  );
}

/**
 * Convert grid-cell wall definitions (cell edge segments) to pixel-space segments.
 */
export function wallObjectsToSegments(
  wallPoints: Array<{ x1: number; y1: number; x2: number; y2: number }>,
  gridSize: number,
): Segment[] {
  return wallPoints.map((w) => ({
    a: { x: w.x1 * gridSize, y: w.y1 * gridSize },
    b: { x: w.x2 * gridSize, y: w.y2 * gridSize },
  }));
}
