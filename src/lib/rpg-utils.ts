// RPG utility functions

export const RACES = [
  { value: "humano", label: "Humano", bonus: { any: 1 }, desc: "Versatil e adaptavel" },
  { value: "elfo", label: "Elfo", bonus: { destreza: 2 }, desc: "Gracioso e perceptivo" },
  { value: "anao", label: "Anao", bonus: { constituicao: 2 }, desc: "Resistente e robusto" },
  { value: "orc", label: "Orc", bonus: { forca: 2 }, desc: "Forte e feroz" },
  { value: "tiefling", label: "Tiefling", bonus: { carisma: 2 }, desc: "Infernal e carismatico" },
  { value: "draconato", label: "Draconato", bonus: { forca: 2 }, desc: "Descendente de dragoes" },
  { value: "halfling", label: "Halfling", bonus: { destreza: 2 }, desc: "Pequeno e sortudo" },
  { value: "gnomo", label: "Gnomo", bonus: { inteligencia: 2 }, desc: "Inventivo e curioso" },
] as const;

export const CLASSES = [
  { value: "guerreiro", label: "Guerreiro", hitDie: 10, primaryAttr: "forca", mpBase: 0 },
  { value: "mago", label: "Mago", hitDie: 6, primaryAttr: "inteligencia", mpBase: 10 },
  { value: "ladino", label: "Ladino", hitDie: 8, primaryAttr: "destreza", mpBase: 0 },
  { value: "clerigo", label: "Clerigo", hitDie: 8, primaryAttr: "sabedoria", mpBase: 6 },
  { value: "ranger", label: "Ranger", hitDie: 10, primaryAttr: "destreza", mpBase: 4 },
  { value: "paladino", label: "Paladino", hitDie: 10, primaryAttr: "carisma", mpBase: 4 },
  { value: "barbaro", label: "Barbaro", hitDie: 12, primaryAttr: "forca", mpBase: 0 },
  { value: "bardo", label: "Bardo", hitDie: 8, primaryAttr: "carisma", mpBase: 8 },
  { value: "druida", label: "Druida", hitDie: 8, primaryAttr: "sabedoria", mpBase: 8 },
  { value: "feiticeiro", label: "Feiticeiro", hitDie: 6, primaryAttr: "carisma", mpBase: 10 },
  { value: "bruxo", label: "Bruxo", hitDie: 8, primaryAttr: "carisma", mpBase: 6 },
  { value: "monge", label: "Monge", hitDie: 8, primaryAttr: "sabedoria", mpBase: 2 },
] as const;

export const ATTRIBUTES = [
  { key: "forca", label: "Forca", abbr: "FOR", icon: "sword" },
  { key: "destreza", label: "Destreza", abbr: "DES", icon: "crosshair" },
  { key: "constituicao", label: "Constituicao", abbr: "CON", icon: "shield" },
  { key: "inteligencia", label: "Inteligencia", abbr: "INT", icon: "brain" },
  { key: "sabedoria", label: "Sabedoria", abbr: "SAB", icon: "eye" },
  { key: "carisma", label: "Carisma", abbr: "CAR", icon: "sparkles" },
] as const;

export type AttributeKey = (typeof ATTRIBUTES)[number]["key"];
export type CharacterRace = (typeof RACES)[number]["value"];
export type CharacterClass = (typeof CLASSES)[number]["value"];

export function getModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export function rollDice(sides: number, count: number = 1): { results: number[]; total: number } {
  const results: number[] = [];

  for (let index = 0; index < count; index += 1) {
    results.push(Math.floor(Math.random() * sides) + 1);
  }

  return { results, total: results.reduce((sum, value) => sum + value, 0) };
}

export function parseDiceNotation(notation: string): { count: number; sides: number; modifier: number } {
  const match = notation.match(/^(\d+)?d(\d+)([+-]\d+)?$/i);

  if (!match) {
    return { count: 1, sides: 20, modifier: 0 };
  }

  return {
    count: Number.parseInt(match[1] || "1", 10),
    sides: Number.parseInt(match[2], 10),
    modifier: Number.parseInt(match[3] || "0", 10),
  };
}

export function calculateHP(classValue: string, conMod: number, level: number): number {
  const selectedClass = CLASSES.find((characterClass) => characterClass.value === classValue);

  if (!selectedClass) {
    return 10;
  }

  return (
    selectedClass.hitDie +
    conMod +
    (level - 1) * (Math.ceil(selectedClass.hitDie / 2) + 1 + conMod)
  );
}

export function calculateMP(classValue: string, primaryMod: number): number {
  const selectedClass = CLASSES.find((characterClass) => characterClass.value === classValue);

  if (!selectedClass) {
    return 0;
  }

  return Math.max(0, selectedClass.mpBase + primaryMod);
}

export function calculateAC(dexMod: number, armorBonus: number = 0): number {
  return 10 + dexMod + armorBonus;
}

export function xpForLevel(level: number): number {
  const thresholds = [
    0,
    300,
    900,
    2700,
    6500,
    14000,
    23000,
    34000,
    48000,
    64000,
    85000,
    100000,
    120000,
    140000,
    165000,
    195000,
    225000,
    265000,
    305000,
    355000,
  ];

  return thresholds[Math.min(level, thresholds.length - 1)] || 355000;
}

export const RARITY_COLORS: Record<string, string> = {
  comum: "text-muted-foreground",
  incomum: "text-green-400",
  raro: "text-blue-400",
  epico: "text-purple-400",
  lendario: "text-gold-light",
};
