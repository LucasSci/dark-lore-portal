import type { Database } from "@/integrations/supabase/types";
import {
  calculateAC,
  calculateHP,
  calculateMP,
  CLASSES,
  getModifier,
  type AttributeKey,
} from "@/lib/rpg-utils";

export type CharacterRow = Database["public"]["Tables"]["characters"]["Row"];
export type ResourceTone = "good" | "warn" | "bad" | "info";

export interface CharacterDraftData {
  name: string;
  race: CharacterRow["race"];
  class: CharacterRow["class"];
  attributes: Record<AttributeKey, number>;
  background: string;
  appearance: string;
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

export function buildDemoCharacter(overrides: Partial<CharacterRow> = {}): CharacterRow {
  const now = new Date().toISOString();

  return {
    appearance:
      "Uma veterana de campanha com armadura escura, olhos atentos e postura de quem sobreviveu a mais de um cerco.",
    armor_class: 17,
    background:
      "Ex-capita de patrulha das fronteiras, agora atua como cronista armada a servico de casas nobres e companhias de aventureiros.",
    carisma: 14,
    class: "guerreiro",
    constituicao: 16,
    created_at: now,
    destreza: 14,
    experience: 4200,
    forca: 17,
    gold: 240,
    hp_current: 46,
    hp_max: 58,
    id: "demo-character",
    initiative_bonus: 3,
    inteligencia: 12,
    is_active: true,
    level: 5,
    mp_current: 4,
    mp_max: 4,
    name: "Maelis Varn",
    portrait_url: null,
    race: "humano",
    sabedoria: 13,
    speed: 30,
    updated_at: now,
    user_id: "demo-user",
    ...overrides,
  };
}

export function buildCharacterFromCreator(draft: CharacterDraftData): CharacterRow {
  const selectedClass = CLASSES.find((item) => item.value === draft.class);
  const createdAt = new Date().toISOString();
  const conMod = getModifier(draft.attributes.constituicao);
  const dexMod = getModifier(draft.attributes.destreza);
  const primaryKey = (selectedClass?.primaryAttr ?? "inteligencia") as AttributeKey;
  const primaryMod = getModifier(draft.attributes[primaryKey] ?? 10);
  const level = draft.level ?? 1;
  const experience = draft.experience ?? 0;
  const gold = draft.gold ?? 35;
  const speed = draft.speed ?? 30;
  const hp = calculateHP(draft.class, conMod, level);
  const mp = calculateMP(draft.class, primaryMod);
  const armorClass = calculateAC(dexMod);
  const safeName = draft.name.trim() || "Aventureiro sem nome";

  return {
    appearance: draft.appearance.trim() || null,
    armor_class: armorClass,
    background: draft.background.trim() || null,
    carisma: draft.attributes.carisma,
    class: draft.class,
    constituicao: draft.attributes.constituicao,
    created_at: createdAt,
    destreza: draft.attributes.destreza,
    experience,
    forca: draft.attributes.forca,
    gold,
    hp_current: hp,
    hp_max: hp,
    id: `demo-${Date.now()}`,
    initiative_bonus: dexMod,
    inteligencia: draft.attributes.inteligencia,
    is_active: true,
    level,
    mp_current: mp,
    mp_max: mp,
    name: safeName,
    portrait_url: null,
    race: draft.race,
    sabedoria: draft.attributes.sabedoria,
    speed,
    updated_at: createdAt,
    user_id: "demo-user",
  };
}
