import { describe, expect, it } from "vitest";

import {
  WORLD_TRAVEL_SPEEDS,
  advanceTowardsWaypoint,
  clampWorldLayerPosition,
  createWorldLayerSize,
  createInitialWorldGeolocationState,
  createWorldLandmarkBaseImageStorageKey,
  createWorldRegionBaseImageStorageKey,
  describeWorldQuadrant,
  distanceBetweenWorldPositions,
  findNearestWorldMarker,
  getWorldRegion,
  getWorldRegionLandmark,
  moveWorldPosition,
  percentToWorldPosition,
} from "@/lib/world-map";

describe("world map helpers", () => {
  it("measures distance between world positions in kilometers", () => {
    const from = percentToWorldPosition(10, 10);
    const to = percentToWorldPosition(20, 10);

    expect(distanceBetweenWorldPositions(from, to)).toBeCloseTo(360, 3);
  });

  it("finds the nearest known marker for the expedition", () => {
    const nearest = findNearestWorldMarker(percentToWorldPosition(79, 54));

    expect(nearest?.id).toBe("zerrikania");
    expect(nearest?.distanceKm).toBeLessThan(80);
  });

  it("advances toward a waypoint without overshooting the destination", () => {
    const start = percentToWorldPosition(77, 50);
    const destination = percentToWorldPosition(77, 34);
    const moved = advanceTowardsWaypoint(start, destination, WORLD_TRAVEL_SPEEDS.mounted);

    expect(moved.yKm).toBeLessThan(start.yKm);
    expect(moved.yKm).toBeGreaterThan(destination.yKm);

    const arrived = advanceTowardsWaypoint(start, destination, 9999);
    expect(arrived).toEqual(destination);
  });

  it("moves cardinally and keeps coordinates inside the world bounds", () => {
    const moved = moveWorldPosition(percentToWorldPosition(1, 1), "west", 400);

    expect(moved.xKm).toBe(0);
    expect(moved.yKm).toBeGreaterThanOrEqual(0);
  });

  it("describes the starting expedition quadrant", () => {
    const initial = createInitialWorldGeolocationState();

    expect(describeWorldQuadrant(initial.position)).toBe("G4");
  });

  it("creates proportional custom layer sizes for atlas images", () => {
    const size = createWorldLayerSize(420, 16 / 9);

    expect(size.widthKm).toBe(420);
    expect(size.heightKm).toBeCloseTo(236.3, 1);
  });

  it("keeps custom layers inside the world bounds", () => {
    const clamped = clampWorldLayerPosition(
      percentToWorldPosition(1, 1),
      500,
      280,
    );

    expect(clamped.xKm).toBe(250);
    expect(clamped.yKm).toBe(140);
  });

  it("resolves a region for hierarchical atlas navigation", () => {
    const region = getWorldRegion("zerrikania");

    expect(region?.name).toBe("Zerrikania");
    expect(region?.landmarks.length).toBeGreaterThan(1);
  });

  it("creates a stable storage key for region map attachments", () => {
    expect(createWorldRegionBaseImageStorageKey("korath")).toBe(
      "dark-lore-world-region-korath-base-image",
    );
  });

  it("resolves a landmark inside a region for local atlas navigation", () => {
    const entry = getWorldRegionLandmark("zerrikania", "elarion");

    expect(entry?.region.slug).toBe("zerrikania");
    expect(entry?.landmark.label).toBe("Elarion");
  });

  it("creates a stable storage key for local map attachments", () => {
    expect(createWorldLandmarkBaseImageStorageKey("zerrikania", "elarion")).toBe(
      "dark-lore-world-region-zerrikania-landmark-elarion-base-image",
    );
  });
});
