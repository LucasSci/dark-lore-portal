import type { AttributeKey, CharacterClass, CharacterRace } from "@/lib/rpg-utils";

export type SheetScalarValue = string | number | boolean | null;
export type SheetSectionKind = "identity" | "resources" | "combat" | "attributes" | "narrative" | "attachments";
export type SheetFieldType = "text" | "textarea" | "number" | "select";
export type SheetBinding =
  | "name"
  | "race"
  | "class"
  | "level"
  | "experience"
  | "gold"
  | "speed"
  | "background"
  | "appearance"
  | AttributeKey;

export type DerivedBinding =
  | "hp_max"
  | "hp_current"
  | "mp_max"
  | "mp_current"
  | "armor_class"
  | "initiative_bonus"
  | "xp_next"
  | "point_budget_used"
  | `modifier.${AttributeKey}`;

export interface SheetOption {
  label: string;
  value: string;
}

export interface SheetValidationRule {
  id: string;
  scope: "field" | "step" | "sheet";
  target: string;
  message: string;
}

export interface SheetFormulaDependency {
  binding: DerivedBinding;
  dependsOn: Array<SheetBinding | DerivedBinding>;
}

export interface SheetPresentationHint {
  binding: SheetBinding | DerivedBinding | string;
  surface?: "card" | "panel" | "metric" | "quiet";
  emphasis?: "default" | "strong" | "muted";
  icon?: string;
}

export interface SheetSectionDefinition {
  id: string;
  label: string;
  kind: SheetSectionKind;
  description?: string;
}

export interface SheetFieldDefinition {
  id: string;
  label: string;
  binding: SheetBinding;
  type: SheetFieldType;
  sectionId: string;
  stepId?: string;
  required?: boolean;
  min?: number;
  max?: number;
  defaultValue?: SheetScalarValue;
  options?: SheetOption[];
  helpText?: string;
}

export interface DerivedFieldDefinition {
  id: string;
  label: string;
  binding: DerivedBinding;
  dependencies: Array<SheetBinding | DerivedBinding>;
  compute: "hit-points" | "mana-points" | "armor-class" | "initiative" | "xp-next" | "point-budget" | "attribute-modifier";
  attributeKey?: AttributeKey;
}

export interface WizardStepDefinition {
  id: string;
  label: string;
  fieldBindings: SheetBinding[];
}

export interface SheetRepeatingGroupDefinition {
  id: string;
  label: string;
  binding: string;
  itemType: "inventory" | "spellbook";
}

export interface SheetDefinition {
  id: string;
  slug: string;
  version: number;
  sections: SheetSectionDefinition[];
  fields: SheetFieldDefinition[];
  wizardSteps: WizardStepDefinition[];
  derivedFields: DerivedFieldDefinition[];
  repeatingGroups: SheetRepeatingGroupDefinition[];
  validationRules?: SheetValidationRule[];
  formulaDeps?: SheetFormulaDependency[];
  presentationHints?: SheetPresentationHint[];
  bindings: {
    inventory: string;
    spellbook: string;
  };
}

export interface RepeatingRow {
  id: string;
  values: Record<string, SheetScalarValue>;
}

export interface AttributeStore {
  characterId: string;
  values: Record<string, SheetScalarValue>;
  derived: Record<string, SheetScalarValue>;
  dirtyKeys: string[];
  repeaters: Record<string, RepeatingRow[]>;
  revision: number;
  updatedAt: string;
}

export interface SheetStepValidation {
  stepId: string;
  valid: boolean;
  errors: Record<string, string>;
}

export interface CharacterSheetDraft {
  name: string;
  race: CharacterRace;
  class: CharacterClass;
  level: number;
  experience: number;
  gold: number;
  speed: number;
  background: string;
  appearance: string;
  attributes: Record<AttributeKey, number>;
}

export interface SheetImportPayload {
  id: string;
  kind: "inventory" | "spellbook";
  values: Record<string, SheetScalarValue>;
}

export interface SheetEngineState {
  definition: SheetDefinition;
  store: AttributeStore;
  lastValidation?: SheetStepValidation;
}

export type SheetEngineRequest =
  | {
      requestId: string;
      type: "INIT_SHEET";
      payload: {
        definition: SheetDefinition;
        characterId: string;
        initialValues?: Record<string, SheetScalarValue>;
        repeaters?: Record<string, RepeatingRow[]>;
      };
    }
  | {
      requestId: string;
      type: "SET_ATTRIBUTE";
      payload: {
        definition: SheetDefinition;
        store: AttributeStore;
        key: string;
        value: SheetScalarValue;
      };
    }
  | {
      requestId: string;
      type: "RUN_DERIVATIONS";
      payload: {
        definition: SheetDefinition;
        store: AttributeStore;
      };
    }
  | {
      requestId: string;
      type: "IMPORT_COMPENDIUM_DATA";
      payload: {
        definition: SheetDefinition;
        store: AttributeStore;
        binding: string;
        entry: SheetImportPayload;
      };
    }
  | {
      requestId: string;
      type: "VALIDATE_STEP";
      payload: {
        definition: SheetDefinition;
        store: AttributeStore;
        stepId: string;
      };
    };

export interface SheetEngineResponse {
  requestId: string;
  ok: boolean;
  store?: AttributeStore;
  validation?: SheetStepValidation;
  error?: string;
}
