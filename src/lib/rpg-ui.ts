import { LOCAL_USER_ID, SEED_CHARACTER_ID } from "@/lib/local-identities";
import { generateSecureShortId } from "@/lib/utils";
import {
  ATTRIBUTES,
  calculateDefense,
  calculateFocus,
  calculateHP,
  calculateInitiative,
  calculateRun,
  calculateVigor,
  createRandomWitcherBackground,
  getProfessionByValue,
  type AttributeKey,
} from "@/lib/rpg-utils";

export type ResourceTone = "good" | "warn" | "bad" | "info";

export interface CharacterRecord {
  appearance: string | null;
  armor_class: number;
  background: string | null;
  carisma: number;
  class: string;
  constituicao: number;
  created_at: string;
  destreza: number;
  experience: number;
  forca: number;
  gold: number;
  hp_current: number;
  hp_max: number;
  id: string;
  initiative_bonus: number;
  inteligencia: number;
  is_active: boolean;
  level: number;
  mp_current: number;
  mp_max: number;
  name: string;
  portrait_url: string | null;
  race: string;
  sabedoria: number;
  speed: number;
  updated_at: string;
  user_id: string;
}

export interface CharacterDraftData {
  name: string;
  race: string;
  class: string;
  attributes: Record<AttributeKey, number>;
  background: string;
  appearance: string;
  homeland?: string;
  school?: string;
  lifepath?: string;
  level?: number;
  experience?: number;
  gold?: number;
  speed?: number;
}

export function clampPercent(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, value));
}

export function getResourceTone(percent: number): ResourceTone {
  const normalized = clampPercent(percent);

  if (normalized > 70) {
    return "good";
  }

  if (normalized > 30) {
    return "warn";
  }

  return "bad";
}

function mapWitcherDraftToLegacyColumns(attributes: Record<AttributeKey, number>) {
  return {
    forca: attributes.body,
    destreza: attributes.ref,
    constituicao: attributes.body,
    inteligencia: attributes.int,
    sabedoria: attributes.will,
    carisma: attributes.emp,
  };
}

function createSeedAttributes(): Record<AttributeKey, number> {
  return {
    int: 7,
    ref: 8,
    dex: 7,
    body: 8,
    spd: 7,
    emp: 5,
    cra: 6,
    will: 7,
    luck: 5,
  };
}

export function buildSeedCharacter(overrides: Partial<CharacterRecord> = {}): CharacterRecord {
  const now = new Date().toISOString();
  const attributes = createSeedAttributes();
  const hp = calculateHP(attributes.body);
  const focus = calculateFocus(attributes.will, attributes.int);
  const initiative = calculateInitiative(attributes.ref);
  const defense = calculateDefense(attributes.ref, attributes.dex);
  const legacy = mapWitcherDraftToLegacyColumns(attributes);

  return {
    appearance:
      "Cabelos presos, cicatrizes de trilha e o tipo de postura que denuncia escola e contrato.",
    armor_class: defense,
    background:
      "Bruxa de estrada marcada por um contrato que terminou com o vilarejo salvo e a companhia em ruinas.",
    ...legacy,
    class: "witcher",
    created_at: now,
    experience: 120,
    gold: 240,
    hp_current: hp,
    hp_max: hp,
    id: SEED_CHARACTER_ID,
    initiative_bonus: initiative,
    is_active: true,
    level: 2,
    mp_current: focus,
    mp_max: focus,
    name: "Maelis de Kaedwen",
    portrait_url: null,
    race: "humano",
    speed: calculateRun(attributes.spd),
    updated_at: now,
    user_id: LOCAL_USER_ID,
    ...overrides,
  };
}

export function buildCharacterFromCreator(draft: CharacterDraftData): CharacterRecord {
  const createdAt = new Date().toISOString();
  const safeName = draft.name.trim() || "Viajante sem nome";
  const level = draft.level ?? 1;
  const experience = draft.experience ?? 0;
  const gold = draft.gold ?? 120;
  const backgroundSegments = [draft.homeland, draft.school, draft.lifepath, draft.background]
    .filter(Boolean)
    .join("\n\n");
  const hp = calculateHP(draft.attributes.body);
  const focus = calculateFocus(draft.attributes.will, draft.attributes.int);
  const defense = calculateDefense(draft.attributes.ref, draft.attributes.dex);
  const initiative = calculateInitiative(draft.attributes.ref);
  const legacy = mapWitcherDraftToLegacyColumns(draft.attributes);

  return {
    appearance: draft.appearance.trim() || null,
    armor_class: defense,
    background: backgroundSegments.trim() || createRandomWitcherBackground(),
    ...legacy,
    class: draft.class,
    created_at: createdAt,
    experience,
    gold,
    hp_current: hp,
    hp_max: hp,
    id: `local-character-${generateSecureShortId()}`,
    initiative_bonus: initiative,
    is_active: true,
    level,
    mp_current: focus,
    mp_max: focus,
    name: safeName,
    portrait_url: null,
    race: draft.race,
    speed: draft.speed ?? calculateRun(draft.attributes.spd),
    updated_at: createdAt,
    user_id: LOCAL_USER_ID,
  };
}

export function buildLegacyRecordFromWitcherValues(values: Record<string, number | string | boolean | null>) {
  const attributes = ATTRIBUTES.reduce<Record<AttributeKey, number>>((accumulator, attribute) => {
    accumulator[attribute.key] = Number(values[attribute.key] ?? 5);
    return accumulator;
  }, {} as Record<AttributeKey, number>);

  const legacy = mapWitcherDraftToLegacyColumns(attributes);
  const profession = getProfessionByValue(String(values.class ?? "witcher"));
  const focus = calculateFocus(attributes.will, attributes.int);
  const vigor = calculateVigor(String(values.class ?? "witcher"));
  const hp = calculateHP(attributes.body);

  return {
    ...legacy,
    armor_class: calculateDefense(attributes.ref, attributes.dex),
    hp_current: Number(values.hp_current ?? hp),
    hp_max: hp,
    initiative_bonus: calculateInitiative(attributes.ref),
    mp_current: Number(values.focus_current ?? focus),
    mp_max: Number(values.focus_max ?? focus),
    class: String(values.class ?? "witcher"),
    race: String(values.race ?? "humano"),
    speed: Number(values.run ?? calculateRun(attributes.spd)),
    gold: Number(values.gold ?? 120),
    level: Number(values.level ?? 1),
    experience: Number(values.experience ?? 0),
    name: String(values.name ?? "Viajante sem nome"),
    background: String(values.background ?? ""),
    appearance: String(values.appearance ?? ""),
    professionLabel: profession?.label ?? "Profissao",
    vigor,
  };
}
