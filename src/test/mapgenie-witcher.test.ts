import { describe, expect, it } from "vitest";

import {
  getMapGenieWitcherMap,
  resolveMapGenieWitcherMapId,
  searchMapGenieWitcherMaps,
} from "@/lib/mapgenie-witcher";

describe("mapgenie witcher helpers", () => {
  it("resolves Novigrad to the combined Velen map", () => {
    expect(resolveMapGenieWitcherMapId("novigrad")).toBe("velen-novigrad");
  });

  it("falls back to the nearest regional map for a landmark", () => {
    expect(resolveMapGenieWitcherMapId("redania", "novigrad")).toBe("velen-novigrad");
  });

  it("finds maps by search aliases", () => {
    const results = searchMapGenieWitcherMaps("pomar branco");

    expect(results[0]?.id).toBe("white-orchard");
  });

  it("returns the active map entry by id", () => {
    expect(getMapGenieWitcherMap("skellige").externalUrl).toContain("/skellige");
  });
});
