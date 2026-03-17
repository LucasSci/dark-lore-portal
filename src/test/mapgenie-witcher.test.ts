import { describe, expect, it } from "vitest";

import {
  getMapGenieWitcherMap,
  getLocalWitcherTileUrl,
  getRegionalMapGenieMaps,
  resolveAtlasRegionToRegionalMapId,
  resolveLocalWitcherTileY,
  resolveMapGenieWitcherMapId,
  searchMapGenieWitcherMaps,
  witcherAtlasAttributionNote,
  witcherAtlasSources,
} from "@/lib/mapgenie-witcher";

describe("mapgenie witcher helpers", () => {
  it("resolves Novigrad to the combined Velen map", () => {
    expect(resolveMapGenieWitcherMapId("novigrad")).toBe("velen-novigrad");
  });

  it("falls back to the nearest regional map for a landmark", () => {
    expect(resolveMapGenieWitcherMapId("redania", "novigrad")).toBe("velen-novigrad");
  });

  it("routes global and local aliases to the right atlas maps", () => {
    expect(resolveMapGenieWitcherMapId("continente")).toBe("mundi");
    expect(resolveMapGenieWitcherMapId("pomar branco")).toBe("white-orchard");
  });

  it("finds maps by search aliases", () => {
    const results = searchMapGenieWitcherMaps("reinos do norte");

    expect(results[0]?.id).toBe("velen-novigrad");
  });

  it("finds the mundi map by global aliases", () => {
    const results = searchMapGenieWitcherMaps("continente");

    expect(results[0]?.id).toBe("mundi");
  });

  it("returns the active map entry by id", () => {
    expect(getMapGenieWitcherMap("skellige").tileFolder).toBe("skellige");
    expect(getMapGenieWitcherMap("skellige").imagePath).toContain("/maps/regions/skellige.jpg");
    expect(getMapGenieWitcherMap("velen-novigrad").tileFolder).toBe("hos_velen");
    expect(getMapGenieWitcherMap("velen-novigrad").imagePath).toContain("/maps/regions/velen-novigrad.jpg");
    expect(getMapGenieWitcherMap("mundi").imagePath).toContain("/maps/witcher-mundi.png");
    expect(getMapGenieWitcherMap("white-orchard").tileFolder).toBe("white_orchard");
    expect(getMapGenieWitcherMap("white-orchard").imagePath).toContain("/maps/regions/white-orchard.png");
  });

  it("builds a local tile url for the active map", () => {
    expect(getLocalWitcherTileUrl("kaer-morhen")).toContain("/local-witcher3map/kaer_morhen/");
  });

  it("inverts simple-map tile rows using the real row count for each zoom", () => {
    expect(resolveLocalWitcherTileY("kaer-morhen", 3, 0)).toBe(4);
    expect(resolveLocalWitcherTileY("toussaint", 3, 4)).toBe(0);
    expect(resolveLocalWitcherTileY("skellige", 3, 2)).toBe(2);
  });

  it("exposes attribution sources for the local atlas", () => {
    expect(witcherAtlasSources).toHaveLength(2);
    expect(witcherAtlasAttributionNote).toContain("nao comercial");
  });

  it("lists regional maps and resolves atlas regions to high-resolution maps", () => {
    expect(getRegionalMapGenieMaps().every((entry) => entry.id !== "mundi")).toBe(true);
    expect(resolveAtlasRegionToRegionalMapId("northern-kingdoms")).toBe("velen-novigrad");
    expect(resolveAtlasRegionToRegionalMapId("skellige")).toBe("skellige");
    expect(resolveAtlasRegionToRegionalMapId("zerrikania")).toBe(null);
  });
});
