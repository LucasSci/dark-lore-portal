import {
  WITCHER_ATTRIBUTES,
  WITCHER_BACKGROUNDS,
  WITCHER_HIT_LOCATIONS,
  WITCHER_HOMELANDS,
  WITCHER_INVENTORY,
  WITCHER_PROFESSIONS,
  WITCHER_RACES,
  WITCHER_SCHOOLS,
  WITCHER_SIMPLE_CRITICALS,
  WITCHER_SPELLS,
  buildRandomAttributeSpread,
  buildRandomWitcherBackground,
  getWitcherCritical,
  getWitcherHitLocation,
  getWitcherProfession,
  getWitcherRace,
  type WitcherAttributeKey,
} from "@/lib/witcher-trpg-system";

export const RACES = WITCHER_RACES;
export const CLASSES = WITCHER_PROFESSIONS;
export const ATTRIBUTES = WITCHER_ATTRIBUTES;
export const SPELLS = WITCHER_SPELLS;
export const INVENTORY_ITEMS = WITCHER_INVENTORY;
export const HOMELANDS = [...WITCHER_HOMELANDS];
export const WITCHER_SCHOOLS_LIST = [...WITCHER_SCHOOLS];
export const WITCHER_LIFEPATH_PROMPTS = WITCHER_BACKGROUNDS;
export const WITCHER_SIMPLE_CRITICAL_TABLE = WITCHER_SIMPLE_CRITICALS;
export const WITCHER_HIT_LOCATION_TABLE = WITCHER_HIT_LOCATIONS;

export type AttributeKey = WitcherAttributeKey;
export type CharacterRace = (typeof RACES)[number]["value"];
export type CharacterClass = (typeof CLASSES)[number]["value"];

export function getModifier(score: number): number {
  return Math.floor((score - 5) / 2);
}

export function formatModifier(modifier: number): string {
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
}

export function rollDice(sides: number, count = 1) {
  const results: number[] = [];

  for (let index = 0; index < count; index += 1) {
    results.push(Math.floor(Math.random() * sides) + 1);
  }

  return {
    results,
    total: results.reduce((sum, value) => sum + value, 0),
  };
}

export function parseDiceNotation(notation: string) {
  const match = notation.trim().match(/^(\d+)?d(\d+)([+-]\d+)?$/i);

  if (!match) {
    return { count: 1, sides: 10, modifier: 0 };
  }

  return {
    count: Number.parseInt(match[1] || "1", 10),
    sides: Number.parseInt(match[2], 10),
    modifier: Number.parseInt(match[3] || "0", 10),
  };
}

export function rollDiceFormula(notation: string) {
  const { count, sides, modifier } = parseDiceNotation(notation);
  const base = rollDice(sides, count);

  return {
    ...base,
    modifier,
    total: base.total + modifier,
  };
}

export function calculateHP(body: number) {
  return Math.max(10, body * 5);
}

export function calculateStamina(body: number) {
  return Math.max(10, body * 5);
}

export function calculateResolve(will: number, int: number) {
  return Math.max(5, (will + int) * 5);
}

export function calculateFocus(will: number, int: number) {
  return Math.max(3, (will + int) * 3);
}

export function calculateVigor(classValue: string) {
  return getWitcherProfession(classValue)?.vigor ?? 0;
}

export function calculateRun(spd: number) {
  return spd * 3;
}

export function calculateLeap(spd: number) {
  return Math.floor((spd * 3) / 5);
}

export function calculateEncumbrance(body: number) {
  return body * 10;
}

export function calculateRecovery(body: number, will: number) {
  return Math.max(1, Math.floor((body + will) / 2));
}

export function calculateWoundThreshold(body: number, will: number) {
  return Math.max(1, Math.floor((body + will) / 2));
}

export function calculateStun(body: number, will: number) {
  return Math.max(1, Math.min(10, Math.floor((body + will) / 2)));
}

export function calculateDefense(ref: number, dex: number) {
  return ref + Math.max(0, Math.floor(dex / 2));
}

export function calculateInitiative(ref: number, awareness = 0) {
  return ref + awareness;
}

export function calculateAttributeBudget(values: Record<string, number>) {
  return ATTRIBUTES.reduce((sum, attribute) => sum + (values[attribute.key] ?? 0), 0);
}

export function xpForLevel(level: number) {
  const thresholds = [
    0,
    40,
    80,
    120,
    160,
    200,
    240,
    280,
    320,
    360,
    400,
  ];

  return thresholds[Math.min(level, thresholds.length - 1)] ?? thresholds.at(-1) ?? 400;
}

export function createRandomWitcherAttributes() {
  return buildRandomAttributeSpread();
}

export function createRandomWitcherBackground() {
  return buildRandomWitcherBackground();
}

export function getHitLocation(rollTotal: number) {
  return getWitcherHitLocation(rollTotal);
}

export function getSimpleCritical(rollTotal: number) {
  return getWitcherCritical(rollTotal);
}

export function getRaceByValue(raceValue: string) {
  return getWitcherRace(raceValue);
}

export function getProfessionByValue(classValue: string) {
  return getWitcherProfession(classValue);
}

export const RARITY_COLORS: Record<string, string> = {
  comum: "text-muted-foreground",
  incomum: "text-emerald-300",
  raro: "text-sky-300",
  epico: "text-amber-300",
};
