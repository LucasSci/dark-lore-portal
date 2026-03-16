import { describe, expect, it } from "vitest";
import rawMonsters from "@/data/witcher-bestiary-data.js";
import { encyclopediaEntries } from "@/lib/encyclopedia";
import { witcherBestiaryEntries } from "@/lib/witcher-bestiary";

describe("witcher bestiary import", () => {
  it("imports every monster from the source seed into the encyclopedia", () => {
    const monsterEntries = encyclopediaEntries.filter((entry) => entry.category === "monstros");
    const encyclopediaSlugs = new Set(encyclopediaEntries.map((entry) => entry.slug));

    expect(witcherBestiaryEntries).toHaveLength((rawMonsters as unknown[]).length);
    expect(monsterEntries.length).toBeGreaterThanOrEqual((rawMonsters as unknown[]).length);
    for (const entry of witcherBestiaryEntries) {
      expect(encyclopediaSlugs.has(entry.slug)).toBe(true);
    }
  });

  it("keeps image, weaknesses and regions for every imported creature", () => {
    const localizedImages = witcherBestiaryEntries.filter((entry) => entry.image.startsWith("/bestiary/"));

    for (const entry of witcherBestiaryEntries) {
      const statLabels = entry.stats.map((stat) => stat.label);

      expect(entry.image.length).toBeGreaterThan(0);
      expect(statLabels).toContain("Fraquezas");
      expect(statLabels).toContain("Regioes");
      expect(entry.narrative).toHaveLength(3);
      expect(entry.vtt?.hp ?? 0).toBeGreaterThan(0);
    }

    expect(localizedImages.length).toBeGreaterThanOrEqual(witcherBestiaryEntries.length - 1);
  });
});
