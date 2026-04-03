import {
  ATTRIBUTES,
  calculateAttributeBudget,
  calculateDefense,
  calculateFocus,
  calculateHP,
  calculateInitiative,
  calculateLeap,
  calculateRecovery,
  calculateResolve,
  calculateRun,
  calculateStamina,
  calculateStun,
  calculateVigor,
  calculateWoundThreshold,
  calculateEncumbrance,
  getModifier,
  xpForLevel,
  type AttributeKey,
} from "@/lib/rpg-utils";
import { NOIR_CHRONICLE_DEFAULTS, createNoirChronicleInitialValues } from "@/lib/sheets/noir-chronicle-sheet";
import type {
  AttributeStore,
  CharacterSheetDraft,
  RepeatingRow,
  SheetDefinition,
  SheetEngineState,
  SheetFieldDefinition,
  SheetImportPayload,
  SheetScalarValue,
  SheetStepValidation,
} from "@/lib/sheets/types";
import type { CharacterRecord } from "@/lib/rpg-ui";

function nowIso() {
  return new Date().toISOString();
}

function numericValue(value: SheetScalarValue, fallback = 0) {
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

function stringValue(value: SheetScalarValue, fallback = "") {
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
  const attributes = ATTRIBUTES.reduce<Record<string, number>>((accumulator, attribute) => {
    accumulator[attribute.key] = numericValue(
      values[attribute.key],
      numericValue(NOIR_CHRONICLE_DEFAULTS.attributes[attribute.key], 5),
    );
    return accumulator;
  }, {});

  return {
    name: stringValue(values.name, NOIR_CHRONICLE_DEFAULTS.name),
    race: stringValue(values.race, NOIR_CHRONICLE_DEFAULTS.race),
    class: stringValue(values.class, NOIR_CHRONICLE_DEFAULTS.class),
    level: Math.max(1, numericValue(values.level, NOIR_CHRONICLE_DEFAULTS.level)),
    experience: Math.max(0, numericValue(values.experience, NOIR_CHRONICLE_DEFAULTS.experience)),
    gold: Math.max(0, numericValue(values.gold, NOIR_CHRONICLE_DEFAULTS.gold)),
    speed: Math.max(0, numericValue(values.speed, NOIR_CHRONICLE_DEFAULTS.speed)),
    homeland: stringValue(values.homeland, String(NOIR_CHRONICLE_DEFAULTS.homeland ?? "Temeria")),
    school: stringValue(values.school, String(NOIR_CHRONICLE_DEFAULTS.school ?? "Lobo")),
    background: stringValue(values.background, NOIR_CHRONICLE_DEFAULTS.background),
    lifepath: stringValue(values.lifepath, String(NOIR_CHRONICLE_DEFAULTS.lifepath ?? "")),
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

function getEquippedStoppingPower(repeaters: Record<string, RepeatingRow[]>) {
  return (repeaters.inventory ?? []).reduce((sum, row) => {
    const equipped = row.values.equipped === true;
    const stoppingPower = numericValue(row.values.stopping_power, 0) || numericValue(row.values.armor_bonus, 0);
    return sum + (equipped ? stoppingPower : 0);
  }, 0);
}

export function runDerivedValues(
  definition: SheetDefinition,
  values: Record<string, SheetScalarValue>,
  repeaters: Record<string, RepeatingRow[]>,
) {
  const draft = buildDraftFromValues(values);
  const attributes = draft.attributes as Record<AttributeKey, number>;
  const derived: Record<string, SheetScalarValue> = {};
  const stoppingPower = getEquippedStoppingPower(repeaters);
  const hpMax = calculateHP(attributes.body);
  const staMax = calculateStamina(attributes.body);
  const resolveMax = calculateResolve(attributes.will, attributes.int);
  const focusMax = calculateFocus(attributes.will, attributes.int);
  const vigorMax = calculateVigor(draft.class);
  const defense = calculateDefense(attributes.ref, attributes.dex) + stoppingPower;
  const initiative = calculateInitiative(attributes.ref);
  const run = calculateRun(attributes.spd);
  const leap = calculateLeap(attributes.spd);
  const enc = calculateEncumbrance(attributes.body);
  const rec = calculateRecovery(attributes.body, attributes.will);
  const woundThreshold = calculateWoundThreshold(attributes.body, attributes.will);
  const stun = calculateStun(attributes.body, attributes.will);

  for (const field of definition.derivedFields) {
    switch (field.compute) {
      case "hp":
        derived.hp_max = hpMax;
        derived.hp_current = Math.min(numericValue(values.hp_current, hpMax), hpMax);
        break;
      case "sta":
        derived.sta_max = staMax;
        derived.sta_current = Math.min(numericValue(values.sta_current, staMax), staMax);
        break;
      case "resolve":
        derived.resolve_max = resolveMax;
        derived.resolve_current = Math.min(numericValue(values.resolve_current, resolveMax), resolveMax);
        break;
      case "focus":
        derived.focus_max = focusMax;
        derived.focus_current = Math.min(numericValue(values.focus_current, focusMax), focusMax);
        break;
      case "vigor":
        derived.vigor_max = vigorMax;
        derived.vigor_current = Math.min(numericValue(values.vigor_current, vigorMax), vigorMax);
        break;
      case "defense":
        derived.armor_class = defense;
        break;
      case "initiative":
        derived.initiative_bonus = initiative;
        break;
      case "run":
        derived.run = run;
        break;
      case "leap":
        derived.leap = leap;
        break;
      case "enc":
        derived.enc = enc;
        break;
      case "rec":
        derived.rec = rec;
        break;
      case "wound-threshold":
        derived.wound_threshold = woundThreshold;
        break;
      case "stun":
        derived.stun = stun;
        break;
      case "xp-next":
        derived.xp_next = xpForLevel(draft.level + 1);
        break;
      case "point-budget":
        derived.point_budget_used = calculateAttributeBudget(attributes);
        break;
      case "attribute-modifier":
        if (field.attributeKey) {
          derived[field.binding] = getModifier(attributes[field.attributeKey as AttributeKey] ?? 5);
        }
        break;
      default:
        break;
    }
  }

  return derived;
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

    if (pointsUsed > 60) {
      errors.attributes = "Os atributos iniciais nao podem passar de 60 pontos.";
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

export function buildAttributeValuesFromCharacterRow(character: CharacterRecord) {
  const homelandLine = character.background?.split("\n\n")[0] ?? "";
  return {
    name: character.name,
    race: character.race,
    class: character.class,
    level: character.level,
    experience: character.experience,
    gold: character.gold,
    speed: character.speed,
    homeland: homelandLine.includes("Temeria") ? "Temeria" : "Temeria",
    school: character.class === "witcher" ? "Lobo" : "Lobo",
    background: character.background ?? "",
    lifepath: "",
    appearance: character.appearance ?? "",
    int: Math.max(2, character.inteligencia),
    ref: Math.max(2, character.destreza),
    dex: Math.max(2, character.destreza),
    body: Math.max(2, character.constituicao),
    spd: Math.max(2, Math.floor(character.speed / 3) || 5),
    emp: Math.max(2, character.carisma),
    cra: 5,
    will: Math.max(2, character.sabedoria),
    luck: 5,
    hp_current: character.hp_current,
    focus_current: character.mp_current,
  } satisfies Record<string, SheetScalarValue>;
}

export function buildSheetStateFromCharacter(
  definition: SheetDefinition,
  character: CharacterRecord,
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
