import { describe, expect, it } from "vitest";

import {
  createAttributeStore,
  importCompendiumRow,
  setAttributeValue,
  validateWizardStep,
} from "@/lib/sheets/engine";
import { SEED_CHARACTER_ID } from "@/lib/local-identities";
import { NOIR_CHRONICLE_SHEET } from "@/lib/sheets/noir-chronicle-sheet";

describe("sheet engine", () => {
  it("derives combat stats from the attribute store", () => {
    const store = createAttributeStore(NOIR_CHRONICLE_SHEET, SEED_CHARACTER_ID, {
      class: "guerreiro",
      level: 3,
      constituicao: 16,
      destreza: 14,
      inteligencia: 10,
      sabedoria: 10,
      carisma: 10,
    });

    expect(store.derived.hp_max).toBeGreaterThan(20);
    expect(store.derived.armor_class).toBe(12);
    expect(store.derived.initiative_bonus).toBe(2);
  });

  it("recalculates derived values when an attribute changes", () => {
    const initial = createAttributeStore(NOIR_CHRONICLE_SHEET, SEED_CHARACTER_ID, {
      class: "mago",
      inteligencia: 12,
      destreza: 10,
    });

    const updated = setAttributeValue(
      NOIR_CHRONICLE_SHEET,
      initial,
      "inteligencia",
      18,
    );

    expect(updated.derived.mp_max).toBeGreaterThan(initial.derived.mp_max as number);
    expect(updated.revision).toBe(initial.revision + 1);
  });

  it("blocks wizard progression when required fields are missing", () => {
    const store = createAttributeStore(NOIR_CHRONICLE_SHEET, SEED_CHARACTER_ID);
    const result = validateWizardStep(NOIR_CHRONICLE_SHEET, store, "identity");

    expect(result.valid).toBe(false);
    expect(result.errors.name).toContain("obrigatorio");
  });

  it("imports compendium rows into repeating groups", () => {
    const store = createAttributeStore(NOIR_CHRONICLE_SHEET, SEED_CHARACTER_ID);
    const next = importCompendiumRow(NOIR_CHRONICLE_SHEET, store, "inventory", {
      id: "item-sword",
      kind: "inventory",
      values: {
        name: "Espada longa",
        armor_bonus: 0,
        equipped: true,
      },
    });

    expect(next.repeaters.inventory).toHaveLength(1);
    expect(next.repeaters.inventory?.[0]?.values.name).toBe("Espada longa");
  });
});
