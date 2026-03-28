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

/** Ray-segment intersection. Returns distance t along ray (0–1+), or null. */
function raySegmentIntersect(
  origin: Point,
  dir: Point,
  seg: Segment,
): number | null {
  const dx = seg.b.x - seg.a.x;
  const dy = seg.b.y - seg.a.y;

  const denom = dir.x * dy - dir.y * dx;
  if (Math.abs(denom) < 1e-10) return null;

  const t = ((seg.a.x - origin.x) * dy - (seg.a.y - origin.y) * dx) / denom;
  const u = ((seg.a.x - origin.x) * dir.y - (seg.a.y - origin.y) * dir.x) / denom;

  if (t >= 0 && u >= 0 && u <= 1) return t;
  return null;
}

/**
 * Compute a visibility polygon from `origin` given a set of wall segments.
 * Uses the classic 2D raycasting approach: cast rays toward each wall endpoint
 * (plus slight offsets), find nearest intersection, and collect the hull.
 *
 * Returns an array of points forming the visibility polygon, sorted by angle.
 */
export function computeVisibilityPolygon(
  origin: Point,
  walls: Segment[],
  bounds: { width: number; height: number },
  maxRadius?: number,
): Point[] {
  const ox = origin.x;
  const oy = origin.y;

  // Filter walls by AABB if maxRadius is provided to reduce O(n^2) workload.
  // We allocate a flat typed array to avoid object GC overhead in the hot loop.
  const numOriginalWalls = walls.length;
  let activeWallsCount = 0;

  const flatWalls = new Float64Array((numOriginalWalls + 4) * 4);

  for (let i = 0; i < numOriginalWalls; i++) {
    const w = walls[i];

    if (maxRadius !== undefined) {
      const minX = Math.min(w.a.x, w.b.x);
      const maxX = Math.max(w.a.x, w.b.x);
      const minY = Math.min(w.a.y, w.b.y);
      const maxY = Math.max(w.a.y, w.b.y);

      if (minX > ox + maxRadius || maxX < ox - maxRadius ||
          minY > oy + maxRadius || maxY < oy - maxRadius) {
        continue; // Wall is completely outside the vision/light radius AABB
      }
    }

    const idx = activeWallsCount * 4;
    flatWalls[idx] = w.a.x;
    flatWalls[idx + 1] = w.a.y;
    flatWalls[idx + 2] = w.b.x;
    flatWalls[idx + 3] = w.b.y;
    activeWallsCount++;
  }

  // Add bounds (must be unconditionally included for full 360-degree raycasting)
  let idx = activeWallsCount * 4;
  flatWalls[idx++] = 0; flatWalls[idx++] = 0; flatWalls[idx++] = bounds.width; flatWalls[idx++] = 0;
  flatWalls[idx++] = bounds.width; flatWalls[idx++] = 0; flatWalls[idx++] = bounds.width; flatWalls[idx++] = bounds.height;
  flatWalls[idx++] = bounds.width; flatWalls[idx++] = bounds.height; flatWalls[idx++] = 0; flatWalls[idx++] = bounds.height;
  flatWalls[idx++] = 0; flatWalls[idx++] = bounds.height; flatWalls[idx++] = 0; flatWalls[idx++] = 0;

  activeWallsCount += 4;

  // Replace Set<number> with Float64Array to minimize GC pauses
  const rawAngles = new Float64Array(activeWallsCount * 6);
  let angleCount = 0;

  for (let i = 0; i < activeWallsCount * 4; i += 4) {
    const ax = flatWalls[i];
    const ay = flatWalls[i+1];
    const bx = flatWalls[i+2];
    const by = flatWalls[i+3];

    const angleA = Math.atan2(ay - oy, ax - ox);
    rawAngles[angleCount++] = angleA;
    rawAngles[angleCount++] = angleA - 0.0001;
    rawAngles[angleCount++] = angleA + 0.0001;

    const angleB = Math.atan2(by - oy, bx - ox);
    rawAngles[angleCount++] = angleB;
    rawAngles[angleCount++] = angleB - 0.0001;
    rawAngles[angleCount++] = angleB + 0.0001;
  }

  rawAngles.sort();

  const points: Point[] = [];

  for (let i = 0; i < angleCount; i++) {
    const angle = rawAngles[i];
    // Skip duplicate angles to save work
    if (i > 0 && angle === rawAngles[i - 1]) continue;

    const dx = Math.cos(angle);
    const dy = Math.sin(angle);

    let closestT = Infinity;

    for (let j = 0; j < activeWallsCount * 4; j += 4) {
      const ax = flatWalls[j];
      const ay = flatWalls[j+1];
      const bx = flatWalls[j+2];
      const by = flatWalls[j+3];

      const wdx = bx - ax;
      const wdy = by - ay;

      // Inlined raySegmentIntersect logic
      const denom = dx * wdy - dy * wdx;
      if (Math.abs(denom) < 1e-10) continue;

      const t = ((ax - ox) * wdy - (ay - oy) * wdx) / denom;
      const u = ((ax - ox) * dy - (ay - oy) * dx) / denom;

      if (t >= 0 && u >= 0 && u <= 1 && t < closestT) {
        closestT = t;
      }
    }

    if (closestT === Infinity) continue;

    // Clamp to max radius if specified
    if (maxRadius !== undefined && closestT > maxRadius) {
      closestT = maxRadius;
    }

    points.push({
      x: ox + dx * closestT,
      y: oy + dy * closestT,
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
