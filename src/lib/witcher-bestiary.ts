import monsterIllustration from "@/assets/encyclopedia/monster-illustration.svg";
import rawMonsters from "@/data/witcher-bestiary-data.js";
import { witcherBestiaryImageManifest } from "@/data/witcher-bestiary-image-manifest";
import type {
  EncyclopediaEntry,
  EncyclopediaTimelineEvent,
  EncyclopediaVttProfile,
} from "@/lib/encyclopedia";

interface RawBestiaryMonster {
  nome: string;
  tipo: string;
  descricao: string;
  fraqueza: string[];
  regiao: string[];
  nivelDePerigo: number;
  imageUrl: string;
}

export interface WitcherBestiaryMetadata {
  slug: string;
  title: string;
  type: string;
  regions: string[];
  dangerLevel: number;
  weaknesses: string[];
  image: string;
}

const dangerLabels: Record<number, string> = {
  1: "baixo",
  2: "contido",
  3: "elevado",
  4: "grave",
  5: "letal",
};

const dangerColors: Record<number, string> = {
  1: "#4ade80",
  2: "#84cc16",
  3: "#f59e0b",
  4: "#f97316",
  5: "#dc2626",
};

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function summarize(description: string) {
  const [firstSentence] = description.split(/(?<=[.!?])\s+/);

  if (firstSentence && firstSentence.length <= 180) {
    return firstSentence;
  }

  if (description.length <= 180) {
    return description;
  }

  return `${description.slice(0, 177).trimEnd()}...`;
}

function buildTimeline(monster: RawBestiaryMonster): EncyclopediaTimelineEvent[] {
  const regions = monster.regiao.length > 0 ? monster.regiao.join(", ") : "territorio incerto";
  const weaknesses =
    monster.fraqueza.length > 0 ? monster.fraqueza.join(", ") : "nenhuma contramedida registrada";

  return [
    {
      period: "Registro de campo",
      title: `${monster.nome} entra no dossie do bestiario`,
      description: `Avistamentos recorrentes ligam a criatura a ${regions}.`,
    },
    {
      period: "Doutrina de caca",
      title: "Bruxos consolidam as contramedidas",
      description: `Os relatos recomendam ${weaknesses} durante o confronto.`,
    },
  ];
}

function buildVttProfile(monster: RawBestiaryMonster): EncyclopediaVttProfile {
  const hp = 24 + monster.nivelDePerigo * 18;
  const ac = 10 + monster.nivelDePerigo * 2;
  const initiativeBonus = Math.max(1, monster.nivelDePerigo - 1);
  const weaknesses =
    monster.fraqueza.length > 0 ? monster.fraqueza.join(", ") : "sem fraquezas catalogadas";

  return {
    hp,
    ac,
    initiativeBonus,
    role: monster.tipo,
    note: `Fraquezas conhecidas: ${weaknesses}.`,
    color: dangerColors[monster.nivelDePerigo] ?? dangerColors[3],
  };
}

function buildStats(monster: RawBestiaryMonster) {
  return [
    { label: "Tipo", value: monster.tipo },
    {
      label: "Nivel de perigo",
      value: `${monster.nivelDePerigo}/5 - ${dangerLabels[monster.nivelDePerigo] ?? "desconhecido"}`,
    },
    {
      label: "Fraquezas",
      value:
        monster.fraqueza.length > 0 ? monster.fraqueza.join(", ") : "Nenhuma fraqueza registrada",
    },
    {
      label: "Regioes",
      value: monster.regiao.length > 0 ? monster.regiao.join(", ") : "Regiao nao catalogada",
    },
  ];
}

const slugCounts = new Map<string, number>();

export const witcherBestiaryEntries: EncyclopediaEntry[] = (rawMonsters as RawBestiaryMonster[]).map(
  (monster) => {
    const baseSlug = slugify(monster.nome);
    const seenCount = (slugCounts.get(baseSlug) ?? 0) + 1;
    slugCounts.set(baseSlug, seenCount);

    const slug = seenCount === 1 ? baseSlug : `${baseSlug}-${seenCount}`;
    const weaknesses =
      monster.fraqueza.length > 0 ? monster.fraqueza.join(", ") : "Nenhuma fraqueza registrada";
    const regions = monster.regiao.length > 0 ? monster.regiao.join(", ") : "Regiao nao catalogada";

    return {
      slug,
      title: monster.nome,
      category: "monstros",
      subtitle: `${monster.tipo} - ameaca ${monster.nivelDePerigo}/5 (${dangerLabels[monster.nivelDePerigo] ?? "desconhecido"})`,
      summary: summarize(monster.descricao),
      image: witcherBestiaryImageManifest[slug] ?? monsterIllustration,
      imageAlt: `Ilustracao de bestiario para ${monster.nome}.`,
      narrative: [
        {
          heading: "Descricao do dossie",
          body: monster.descricao,
        },
        {
          heading: "Fraquezas conhecidas",
          body: `Bruxos recomendam ${weaknesses.toLowerCase()} para reduzir a vantagem da criatura em combate.`,
        },
        {
          heading: "Regioes de ocorrencia",
          body: `Os relatos reunidos pela enciclopedia posicionam ${monster.nome} em ${regions}.`,
        },
      ],
      internalLinks: [],
      timeline: buildTimeline(monster),
      stats: buildStats(monster),
      vtt: buildVttProfile(monster),
    };
  },
);

export const witcherBestiaryMetadata = witcherBestiaryEntries.map((entry, index) => {
  const rawMonster = (rawMonsters as RawBestiaryMonster[])[index];

  return {
    slug: entry.slug,
    title: entry.title,
    type: rawMonster.tipo,
    regions: rawMonster.regiao,
    dangerLevel: rawMonster.nivelDePerigo,
    weaknesses: rawMonster.fraqueza,
    image: entry.image,
  } satisfies WitcherBestiaryMetadata;
});

export const witcherBestiaryMetadataBySlug = Object.fromEntries(
  witcherBestiaryMetadata.map((monster) => [monster.slug, monster]),
) satisfies Record<string, WitcherBestiaryMetadata>;

export const witcherBestiaryTypes = Array.from(
  new Set(witcherBestiaryMetadata.map((monster) => monster.type)),
).sort((left, right) => left.localeCompare(right));

export const witcherBestiaryRegions = Array.from(
  new Set(witcherBestiaryMetadata.flatMap((monster) => monster.regions)),
).sort((left, right) => left.localeCompare(right));

export function getWitcherBestiaryMetadata(slug: string) {
  return witcherBestiaryMetadataBySlug[slug] ?? null;
}
