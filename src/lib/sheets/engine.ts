import type { Database } from "@/integrations/supabase/types";
import {
  ATTRIBUTES,
  calculateAC,
  calculateHP,
  calculateMP,
  CLASSES,
  getModifier,
  xpForLevel,
  type AttributeKey,
  type CharacterClass,
  type CharacterRace,
} from "@/lib/rpg-utils";
import {
  createNoirChronicleInitialValues,
  NOIR_CHRONICLE_DEFAULTS,
} from "@/lib/sheets/noir-chronicle-sheet";
import type {
  AttributeStore,
  CharacterSheetDraft,
  DerivedBinding,
  RepeatingRow,
  SheetDefinition,
  SheetEngineState,
  SheetFieldDefinition,
  SheetImportPayload,
  SheetScalarValue,
  SheetStepValidation,
} from "@/lib/sheets/types";

type CharacterRow = Database["public"]["Tables"]["characters"]["Row"];

function nowIso() {
  return new Date().toISOString();
}

function numericValue(value: SheetScalarValue, fallback: number = 0) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

function stringValue(value: SheetScalarValue, fallback: string = "") {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return fallback;
}

function getField(definition: SheetDefinition, binding: string) {
  return definition.fields.find((field) => field.binding === binding);
}

function buildDraftFromValues(values: Record<string, SheetScalarValue>): CharacterSheetDraft {
  const attributes = ATTRIBUTES.reduce<Record<AttributeKey, number>>((accumulator, attribute) => {
    accumulator[attribute.key] = numericValue(values[attribute.key], NOIR_CHRONICLE_DEFAULTS.attributes[attribute.key]);
    return accumulator;
  }, {} as Record<AttributeKey, number>);

  return {
    name: stringValue(values.name, NOIR_CHRONICLE_DEFAULTS.name),
    race: stringValue(values.race, NOIR_CHRONICLE_DEFAULTS.race) as CharacterRace,
    class: stringValue(values.class, NOIR_CHRONICLE_DEFAULTS.class) as CharacterClass,
    level: Math.max(1, numericValue(values.level, NOIR_CHRONICLE_DEFAULTS.level)),
    experience: Math.max(0, numericValue(values.experience, NOIR_CHRONICLE_DEFAULTS.experience)),
    gold: Math.max(0, numericValue(values.gold, NOIR_CHRONICLE_DEFAULTS.gold)),
    speed: Math.max(0, numericValue(values.speed, NOIR_CHRONICLE_DEFAULTS.speed)),
    background: stringValue(values.background, NOIR_CHRONICLE_DEFAULTS.background),
    appearance: stringValue(values.appearance, NOIR_CHRONICLE_DEFAULTS.appearance),
    attributes,
  };
}

function clampNumberForField(field: SheetFieldDefinition | undefined, value: SheetScalarValue) {
  if (!field || field.type !== "number") {
    return value;
  }

  const parsed = numericValue(value, numericValue(field.defaultValue, 0));
  const min = typeof field.min === "number" ? field.min : parsed;
  const max = typeof field.max === "number" ? field.max : parsed;

  return Math.max(min, Math.min(max, parsed));
}

function getPrimaryMod(characterClass: CharacterClass, attributes: Record<AttributeKey, number>) {
  const selectedClass = CLASSES.find((entry) => entry.value === characterClass);
  const primaryAttribute = (selectedClass?.primaryAttr ?? "inteligencia") as AttributeKey;
  return getModifier(attributes[primaryAttribute] ?? 10);
}

function getEquippedArmorBonus(repeaters: Record<string, RepeatingRow[]>) {
  return (repeaters.inventory ?? []).reduce((sum, row) => {
    const equipped = row.values.equipped === true;
    return sum + (equipped ? numericValue(row.values.armor_bonus, 0) : 0);
  }, 0);
}

export function runDerivedValues(
  definition: SheetDefinition,
  values: Record<string, SheetScalarValue>,
  repeaters: Record<string, RepeatingRow[]>,
) {
  const draft = buildDraftFromValues(values);
  const derived: Record<string, SheetScalarValue> = {};
  const armorBonus = getEquippedArmorBonus(repeaters);
  const conMod = getModifier(draft.attributes.constituicao);
  const dexMod = getModifier(draft.attributes.destreza);
  const primaryMod = getPrimaryMod(draft.class, draft.attributes);

  for (const field of definition.derivedFields) {
    switch (field.compute) {
      case "hit-points": {
        const hpMax = calculateHP(draft.class, conMod, draft.level);
        derived.hp_max = hpMax;
        derived.hp_current = Math.min(numericValue(values.hp_current, hpMax), hpMax);
        break;
      }
      case "mana-points": {
        const mpMax = calculateMP(draft.class, primaryMod);
        derived.mp_max = mpMax;
        derived.mp_current = Math.min(numericValue(values.mp_current, mpMax), mpMax);
        break;
      }
      case "armor-class":
        derived.armor_class = calculateAC(dexMod, armorBonus);
        break;
      case "initiative":
        derived.initiative_bonus = dexMod;
        break;
      case "xp-next":
        derived.xp_next = xpForLevel(draft.level);
        break;
      case "point-budget":
        derived.point_budget_used = ATTRIBUTES.reduce((sum, attribute) => {
          return sum + Math.max(0, draft.attributes[attribute.key] - 8);
        }, 0);
        break;
      case "attribute-modifier":
        if (field.attributeKey) {
          derived[field.binding] = getModifier(draft.attributes[field.attributeKey]);
        }
        break;
      default:
        break;
    }
  }

  return derived as Record<DerivedBinding, SheetScalarValue>;
}

export function createAttributeStore(
  definition: SheetDefinition,
  characterId: string,
  initialValues: Record<string, SheetScalarValue> = createNoirChronicleInitialValues(),
  repeaters: Record<string, RepeatingRow[]> = {},
): AttributeStore {
  const values = { ...createNoirChronicleInitialValues(), ...initialValues };

  return {
    characterId,
    values,
    derived: runDerivedValues(definition, values, repeaters),
    dirtyKeys: [],
    repeaters,
    revision: 1,
    updatedAt: nowIso(),
  };
}

export function setAttributeValue(
  definition: SheetDefinition,
  store: AttributeStore,
  key: string,
  value: SheetScalarValue,
) {
  const field = getField(definition, key);
  const nextValue = clampNumberForField(field, value);
  const values = {
    ...store.values,
    [key]: nextValue,
  };

  return {
    ...store,
    values,
    derived: runDerivedValues(definition, values, store.repeaters),
    dirtyKeys: Array.from(new Set([...store.dirtyKeys, key])),
    revision: store.revision + 1,
    updatedAt: nowIso(),
  };
}

export function importCompendiumRow(
  definition: SheetDefinition,
  store: AttributeStore,
  binding: string,
  entry: SheetImportPayload,
) {
  const group = definition.repeatingGroups.find((item) => item.binding === binding);

  if (!group) {
    return store;
  }

  const nextRow: RepeatingRow = {
    id: entry.id,
    values: entry.values,
  };

  const nextRepeaters = {
    ...store.repeaters,
    [binding]: [...(store.repeaters[binding] ?? []), nextRow],
  };

  return {
    ...store,
    repeaters: nextRepeaters,
    derived: runDerivedValues(definition, store.values, nextRepeaters),
    revision: store.revision + 1,
    updatedAt: nowIso(),
  };
}

export function validateWizardStep(
  definition: SheetDefinition,
  store: AttributeStore,
  stepId: string,
): SheetStepValidation {
  const step = definition.wizardSteps.find((entry) => entry.id === stepId);
  const errors: Record<string, string> = {};

  if (!step) {
    return { stepId, valid: true, errors };
  }

  for (const binding of step.fieldBindings) {
    const field = getField(definition, binding);
    const value = store.values[binding];

    if (field?.required && !stringValue(value).trim()) {
      errors[binding] = `${field.label} e obrigatorio.`;
    }
  }

  if (stepId === "attributes") {
    const pointsUsed = numericValue(store.derived.point_budget_used, 0);

    if (pointsUsed > 27) {
      errors.attributes = "O point-buy excedeu o limite de 27 pontos.";
    }
  }

  return {
    stepId,
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function buildCharacterDraftFromStore(store: AttributeStore): CharacterSheetDraft {
  return buildDraftFromValues(store.values);
}

export function buildAttributeValuesFromCharacterRow(character: CharacterRow) {
  return {
    name: character.name,
    race: character.race,
    class: character.class,
    level: character.level,
    experience: character.experience,
    gold: character.gold,
    speed: character.speed,
    background: character.background ?? "",
    appearance: character.appearance ?? "",
    forca: character.forca,
    destreza: character.destreza,
    constituicao: character.constituicao,
    inteligencia: character.inteligencia,
    sabedoria: character.sabedoria,
    carisma: character.carisma,
    hp_current: character.hp_current,
    mp_current: character.mp_current,
  } satisfies Record<string, SheetScalarValue>;
}

export function buildSheetStateFromCharacter(
  definition: SheetDefinition,
  character: CharacterRow,
): SheetEngineState {
  return {
    definition,
    store: createAttributeStore(
      definition,
      character.id,
      buildAttributeValuesFromCharacterRow(character),
    ),
  };
}
