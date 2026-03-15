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
  // Add bounding box walls
  const allWalls: Segment[] = [
    ...walls,
    { a: { x: 0, y: 0 }, b: { x: bounds.width, y: 0 } },
    { a: { x: bounds.width, y: 0 }, b: { x: bounds.width, y: bounds.height } },
    { a: { x: bounds.width, y: bounds.height }, b: { x: 0, y: bounds.height } },
    { a: { x: 0, y: bounds.height }, b: { x: 0, y: 0 } },
  ];

  // Collect unique angles toward every endpoint
  const angles = new Set<number>();
  for (const wall of allWalls) {
    for (const point of [wall.a, wall.b]) {
      const angle = Math.atan2(point.y - origin.y, point.x - origin.x);
      angles.add(angle);
      // Slight offsets to peek around corners
      angles.add(angle - 0.0001);
      angles.add(angle + 0.0001);
    }
  }

  // Cast rays
  const points: Array<{ angle: number; point: Point }> = [];

  for (const angle of angles) {
    const dir: Point = { x: Math.cos(angle), y: Math.sin(angle) };

    let closestT = Infinity;
    for (const wall of allWalls) {
      const t = raySegmentIntersect(origin, dir, wall);
      if (t !== null && t < closestT) {
        closestT = t;
      }
    }

    if (closestT === Infinity) continue;

    // Clamp to max radius if specified
    if (maxRadius !== undefined && closestT > maxRadius) {
      closestT = maxRadius;
    }

    points.push({
      angle,
      point: {
        x: origin.x + dir.x * closestT,
        y: origin.y + dir.y * closestT,
      },
    });
  }

  // Sort by angle
  points.sort((a, b) => a.angle - b.angle);

  return points.map((p) => p.point);
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
