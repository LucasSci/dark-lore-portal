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
 * Fast ray-segment intersection avoiding object allocations.
 * Returns distance t along ray (0-1+), or null.
 */
function fastIntersect(
  originX: number,
  originY: number,
  dirX: number,
  dirY: number,
  segAX: number,
  segAY: number,
  segBX: number,
  segBY: number
): number | null {
  const dx = segBX - segAX;
  const dy = segBY - segAY;

  const denom = dirX * dy - dirY * dx;
  if (Math.abs(denom) < 1e-10) return null;

  const diffX = segAX - originX;
  const diffY = segAY - originY;

  const t = (diffX * dy - diffY * dx) / denom;
  const u = (diffX * dirY - diffY * dirX) / denom;

  if (t >= 0 && u >= 0 && u <= 1) return t;
  return null;
}

/**
 * Compute a visibility polygon from `origin` given a set of wall segments.
 * ⚡ Performance optimizations:
 * - Pre-filters walls using an AABB (Axis-Aligned Bounding Box) check against maxRadius.
 * - Uses a pre-allocated Float64Array instead of Set to avoid object allocation and GC overhead for angles.
 * - Inlines intersection coordinate variables directly into math operations to avoid Point object allocations.
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

  const allWalls: Segment[] = [];

  if (maxRadius !== undefined) {
    const minX = ox - maxRadius;
    const maxX = ox + maxRadius;
    const minY = oy - maxRadius;
    const maxY = oy + maxRadius;

    // Fast AABB filter to discard walls definitely out of reach
    for (let i = 0; i < walls.length; i++) {
      const w = walls[i];
      if ((w.a.x < minX && w.b.x < minX) ||
          (w.a.x > maxX && w.b.x > maxX) ||
          (w.a.y < minY && w.b.y < minY) ||
          (w.a.y > maxY && w.b.y > maxY)) {
        continue;
      }
      allWalls.push(w);
    }
  } else {
    for (let i = 0; i < walls.length; i++) {
      allWalls.push(walls[i]);
    }
  }

  // ALWAYS add map bounding box walls. The 2D raycasting algorithm relies on
  // casting rays towards the 4 corners of the map to establish a full 360-degree
  // angular sweep for the resulting polygon. If these are omitted when maxRadius
  // is small, the vision polygon collapses into a thin sliver or vanishes entirely.
  allWalls.push({ a: { x: 0, y: 0 }, b: { x: bounds.width, y: 0 } });
  allWalls.push({ a: { x: bounds.width, y: 0 }, b: { x: bounds.width, y: bounds.height } });
  allWalls.push({ a: { x: bounds.width, y: bounds.height }, b: { x: 0, y: bounds.height } });
  allWalls.push({ a: { x: 0, y: bounds.height }, b: { x: 0, y: 0 } });

  const numWalls = allWalls.length;
  if (numWalls === 0) return [];

  // Each wall segment has 2 endpoints. For each endpoint, we cast 3 rays:
  // directly at it, and slightly offset left/right to peek around corners.
  const angles = new Float64Array(numWalls * 6);
  let angleCount = 0;

  for (let i = 0; i < numWalls; i++) {
    const wall = allWalls[i];

    const angleA = Math.atan2(wall.a.y - oy, wall.a.x - ox);
    angles[angleCount++] = angleA;
    angles[angleCount++] = angleA - 0.0001;
    angles[angleCount++] = angleA + 0.0001;

    const angleB = Math.atan2(wall.b.y - oy, wall.b.x - ox);
    angles[angleCount++] = angleB;
    angles[angleCount++] = angleB - 0.0001;
    angles[angleCount++] = angleB + 0.0001;
  }

  // Sort numeric array in place (much faster than converting Sets to Arrays)
  angles.sort();

  const points: Point[] = [];

  let prevAngle = -Infinity;
  for (let a = 0; a < angleCount; a++) {
    const angle = angles[a];
    // Skip duplicate angles to save on raycasts
    if (angle === prevAngle) continue;
    prevAngle = angle;

    const dirX = Math.cos(angle);
    const dirY = Math.sin(angle);

    let closestT = Infinity;
    for (let i = 0; i < numWalls; i++) {
      const wall = allWalls[i];
      const t = fastIntersect(
        ox, oy, dirX, dirY, wall.a.x, wall.a.y, wall.b.x, wall.b.y
      );
      if (t !== null && t < closestT) {
        closestT = t;
      }
    }

    if (closestT === Infinity) continue;

    // Clamp ray length to vision maxRadius
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
