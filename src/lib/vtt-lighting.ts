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
 * Uses the classic 2D raycasting approach: cast rays toward each wall endpoint
 * (plus slight offsets), find nearest intersection, and collect the hull.
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
  const numWalls = walls.length;
  // 4 bounding box walls + N regular walls
  const totalWalls = numWalls + 4;

  // Flatten wall segments into primitive array for faster access
  // Structure: [x1, y1, x2, y2, dx, dy, ...]
  const wallData = new Float64Array(totalWalls * 6);

  let wallIdx = 0;
  for (let i = 0; i < numWalls; i++) {
    const w = walls[i];
    if (!w) continue;
    wallData[wallIdx++] = w.a.x;
    wallData[wallIdx++] = w.a.y;
    wallData[wallIdx++] = w.b.x;
    wallData[wallIdx++] = w.b.y;
    wallData[wallIdx++] = w.b.x - w.a.x;
    wallData[wallIdx++] = w.b.y - w.a.y;
  }

  // Add bounding box walls (unconditionally included)
  const bw = bounds.width;
  const bh = bounds.height;

  wallData[wallIdx++] = 0; wallData[wallIdx++] = 0; wallData[wallIdx++] = bw; wallData[wallIdx++] = 0; wallData[wallIdx++] = bw; wallData[wallIdx++] = 0;
  wallData[wallIdx++] = bw; wallData[wallIdx++] = 0; wallData[wallIdx++] = bw; wallData[wallIdx++] = bh; wallData[wallIdx++] = 0; wallData[wallIdx++] = bh;
  wallData[wallIdx++] = bw; wallData[wallIdx++] = bh; wallData[wallIdx++] = 0; wallData[wallIdx++] = bh; wallData[wallIdx++] = -bw; wallData[wallIdx++] = 0;
  wallData[wallIdx++] = 0; wallData[wallIdx++] = bh; wallData[wallIdx++] = 0; wallData[wallIdx++] = 0; wallData[wallIdx++] = 0; wallData[wallIdx++] = -bh;

  // Max 2 endpoints per wall, 3 angles per endpoint (exact, -0.0001, +0.0001)
  const maxAngles = totalWalls * 2 * 3;
  const angles = new Float64Array(maxAngles);
  let angleCount = 0;

  const ox = origin.x;
  const oy = origin.y;

  // Collect angles toward every endpoint
  for (let i = 0; i < totalWalls * 6; i += 6) {
    const ax = wallData[i];
    const ay = wallData[i + 1];
    const bx = wallData[i + 2];
    const by = wallData[i + 3];

    // A point
    const angleA = Math.atan2(ay - oy, ax - ox);
    angles[angleCount++] = angleA;
    angles[angleCount++] = angleA - 0.0001;
    angles[angleCount++] = angleA + 0.0001;

    // B point
    const angleB = Math.atan2(by - oy, bx - ox);
    angles[angleCount++] = angleB;
    angles[angleCount++] = angleB - 0.0001;
    angles[angleCount++] = angleB + 0.0001;
  }

  // Sort and deduplicate angles
  const validAngles = angles.subarray(0, angleCount);
  validAngles.sort();

  let uniqueCount = 0;
  if (angleCount > 0) {
    let lastAngle = validAngles[0]!;
    validAngles[uniqueCount++] = lastAngle;

    for (let i = 1; i < angleCount; i++) {
      const a = validAngles[i]!;
      // Small epsilon for deduplication
      if (a - lastAngle > 1e-8) {
        lastAngle = a;
        validAngles[uniqueCount++] = a;
      }
    }
  }

  // Cast rays
  const points: Point[] = [];
  const limitRadius = maxRadius !== undefined ? maxRadius : Infinity;

  for (let i = 0; i < uniqueCount; i++) {
    const angle = validAngles[i]!;
    const dirX = Math.cos(angle);
    const dirY = Math.sin(angle);

    let closestT = limitRadius;

    for (let j = 0; j < totalWalls * 6; j += 6) {
      const ax = wallData[j]!;
      const ay = wallData[j + 1]!;
      const dx = wallData[j + 4]!;
      const dy = wallData[j + 5]!;

      // Inline raySegmentIntersect (Cramer's rule)
      const denom = dirX * dy - dirY * dx;
      if (Math.abs(denom) < 1e-10) continue;

      const diffX = ax - ox;
      const diffY = ay - oy;

      const t = (diffX * dy - diffY * dx) / denom;
      if (t < 0 || t >= closestT) continue;

      const u = (diffX * dirY - diffY * dirX) / denom;
      if (u >= 0 && u <= 1) {
        closestT = t;
      }
    }

    if (closestT < Infinity) {
      points.push({
        x: ox + dirX * closestT,
        y: oy + dirY * closestT,
      });
    }
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
