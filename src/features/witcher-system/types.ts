export type WitcherAttributeKey =
  | "int"
  | "ref"
  | "dex"
  | "body"
  | "spd"
  | "emp"
  | "cra"
  | "will"
  | "luck";

export interface WitcherAttributeDefinition {
  key: WitcherAttributeKey;
  label: string;
  abbr: string;
  description: string;
}

export interface WitcherRaceDefinition {
  value: string;
  label: string;
  socialStanding: string;
  desc: string;
  trait: string;
}

export interface WitcherProfessionDefinition {
  value: string;
  label: string;
  desc: string;
  definingSkill: string;
  role: string;
  vigor: number;
  paths: [string, string, string];
  favoredAttributes: WitcherAttributeKey[];
  starterGear: string[];
}

export interface WitcherSpellDefinition {
  id: string;
  name: string;
  tradition: "sinal" | "magia" | "ritual" | "hex";
  professionTags: string[];
  description: string;
  range: string;
  duration: string;
  damage: string | null;
  vigorCost: number;
  difficulty: string;
}

export interface WitcherInventoryItem {
  id: string;
  name: string;
  category: "arma" | "armadura" | "alquimico" | "ferramenta" | "bomba" | "material";
  rarity: "comum" | "incomum" | "raro" | "epico";
  weight: number;
  value: number;
  damage: string | null;
  stoppingPower: number;
  effect: string | null;
  description: string;
  hands?: "uma" | "duas";
}

export interface WitcherHitLocation {
  label: string;
  attackPenalty: number;
  damageMultiplier: number;
}

export interface WitcherCriticalEntry {
  range: [number, number];
  title: string;
  description: string;
}

export interface WitcherBackgroundPrompt {
  title: string;
  detail: string;
}

export interface WitcherCampaignLink {
  label: string;
  href: string;
  tone?: "chronicle" | "atlas" | "dossier" | "oracle" | "sheet" | "tool";
}

export interface WitcherCampaignPlayer {
  id: string;
  name: string;
  role: string;
  sheetHref?: string;
}

export interface WitcherCampaignSceneSeed {
  id: string;
  name: string;
  region: string;
  chronicleHref?: string;
  dossierHref?: string;
  atlasHref?: string;
  intro: string;
  briefing: string;
  threatLabels: string[];
  supportLinks: WitcherCampaignLink[];
}

export interface WitcherCampaign {
  id: string;
  title: string;
  summary: string;
  gmLabel: string;
  stageLabel: string;
  sceneIds: string[];
  defaultSceneId: string;
  players: WitcherCampaignPlayer[];
  supportLinks: WitcherCampaignLink[];
  atmosphere: string;
}
