import { describe, expect, it } from "vitest";

import {
  buildAtlasBattlemapTransition,
  buildAtlasRoute,
  getAtlasBattlemapById,
  getAtlasFocusFromRoute,
  getAllAtlasLocations,
  inferAtlasZoomStage,
  loadAtlasWorld,
  searchAtlasWorld,
} from "@/lib/hierarchical-atlas";

describe("hierarchical atlas", () => {
  it("loads a world with hierarchical regions, subregions, and locations", () => {
    const world = loadAtlasWorld();

    expect(world.regions.length).toBeGreaterThanOrEqual(4);
    expect(world.regions.every((region) => region.subRegions.length > 0)).toBe(true);
    expect(getAllAtlasLocations(world).length).toBeGreaterThanOrEqual(10);
  });

  it("resolves route focus down to a location", () => {
    const world = loadAtlasWorld();
    const focus = getAtlasFocusFromRoute(
      world,
      "zerrikania",
      "sands-zerrikania",
      "arena-das-areias",
    );

    expect(focus.region?.name).toBe("Zerrikania");
    expect(focus.subRegion?.name).toBe("Areias de Zerrikania");
    expect(focus.location?.name).toBe("Arena das Areias");
  });

  it("finds locations and battlemaps in search", () => {
    const world = loadAtlasWorld();
    const locationResults = searchAtlasWorld(world, "Novigrad");
    const battlemapResults = searchAtlasWorld(world, "Velkyn");

    expect(locationResults.some((result) => result.label === "Novigrad")).toBe(true);
    expect(battlemapResults.some((result) => result.kind === "battlemap")).toBe(true);
  });

  it("builds route and battlemap transition data", () => {
    const world = loadAtlasWorld();
    const route = buildAtlasRoute(world, "location-novigrad", "location-arena-areias");
    const battlemap = getAtlasBattlemapById(world, "battlemap-arena-das-areias");
    const transition = buildAtlasBattlemapTransition(world, "battlemap-arena-das-areias");

    expect(route?.distanceKm).toBeGreaterThan(0);
    expect(battlemap?.name).toBe("Arena das Areias");
    expect(transition?.href).toBe("/mesa?atlasBattlemap=battlemap-arena-das-areias");
  });

  it("infers zoom stages progressively", () => {
    expect(inferAtlasZoomStage(1)).toBe("world");
    expect(inferAtlasZoomStage(2.3)).toBe("region");
    expect(inferAtlasZoomStage(3.7)).toBe("subregion");
    expect(inferAtlasZoomStage(4.8)).toBe("location");
    expect(inferAtlasZoomStage(6)).toBe("battlemap");
  });
});
