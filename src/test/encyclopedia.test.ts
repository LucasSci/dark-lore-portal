import { describe, expect, it } from "vitest";
import {
  encyclopediaCategories,
  encyclopediaEntries,
  getEncyclopediaEntry,
  getVttReadyEntries,
} from "@/lib/encyclopedia";

describe("encyclopedia data", () => {
  it("covers every category with at least one entry", () => {
    for (const category of Object.keys(encyclopediaCategories)) {
      expect(
        encyclopediaEntries.some((entry) => entry.category === category),
      ).toBe(true);
    }
  });

  it("ensures each entry has narrative blocks, image and timeline", () => {
    for (const entry of encyclopediaEntries) {
      expect(entry.image.length).toBeGreaterThan(0);
      expect(entry.narrative.length).toBeGreaterThan(0);
      expect(entry.timeline.length).toBeGreaterThan(0);
    }
  });

  it("keeps internal links pointing to valid encyclopedia entries", () => {
    for (const entry of encyclopediaEntries) {
      for (const slug of entry.internalLinks) {
        expect(getEncyclopediaEntry(slug)).not.toBeNull();
      }
    }
  });

  it("exposes VTT-ready entries with HP and CA for codex spawning", () => {
    const spawnableEntries = getVttReadyEntries();

    expect(spawnableEntries.length).toBeGreaterThan(0);
    for (const entry of spawnableEntries) {
      expect(entry.vtt.hp).toBeGreaterThan(0);
      expect(entry.vtt.ac).toBeGreaterThan(0);
    }
  });
});
