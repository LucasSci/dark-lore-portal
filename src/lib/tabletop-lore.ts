import {
  encyclopediaCategories,
  encyclopediaEntries,
  getEncyclopediaEntry,
  getVttReadyEntries,
  type EncyclopediaEntry,
  type EncyclopediaVttProfile,
} from "@/lib/encyclopedia";
import {
  buildAtlasContextModel,
  getAtlasContextForEntry,
  type AtlasContextModel,
} from "@/lib/atlas-context";
import { universePublications, type UniversePublication } from "@/lib/universe-publications";

export type TabletopSpawnEntry = EncyclopediaEntry & { vtt: EncyclopediaVttProfile };

export interface TabletopSpawnGroup {
  category: string;
  label: string;
  entries: TabletopSpawnEntry[];
}

export interface TabletopLoreDossier {
  slug: string;
  title: string;
  categoryLabel: string;
  summary: string;
  href: string;
  atlasHref?: string | null;
  quickSpawnHref?: string | null;
  image: string;
}

export interface TabletopChronicleReference {
  slug: string;
  title: string;
  chapterLabel: string;
  excerpt: string;
  href: string;
  location: string;
  mentionLinks: Array<{ label: string; href: string }>;
}

export interface TabletopAtlasReference {
  title: string;
  description: string;
  href: string;
  battlemapHref?: string | null;
  metrics: string[];
}

export interface TabletopSessionSeed {
  slug: string;
  title: string;
  summary: string;
  dossierHref: string;
  chronicleHref: string;
  atlasHref: string;
  battlemapHref?: string | null;
  quickSpawnHref?: string | null;
  tags: string[];
}

export interface TabletopLoreCompendium {
  spawnEntries: TabletopSpawnEntry[];
  spawnGroups: TabletopSpawnGroup[];
  dossiers: TabletopLoreDossier[];
  chronicles: TabletopChronicleReference[];
  atlasReferences: TabletopAtlasReference[];
  sessionSeeds: TabletopSessionSeed[];
}

function sortEntries(entries: TabletopSpawnEntry[]) {
  return [...entries].sort((left, right) => left.title.localeCompare(right.title, "pt-BR"));
}

function buildSpawnGroups(entries: TabletopSpawnEntry[]): TabletopSpawnGroup[] {
  const grouped = entries.reduce<Record<string, TabletopSpawnEntry[]>>((accumulator, entry) => {
    accumulator[entry.category] ??= [];
    accumulator[entry.category].push(entry);
    return accumulator;
  }, {});

  return Object.entries(grouped).map(([category, groupedEntries]) => ({
    category,
    label: encyclopediaCategories[category as keyof typeof encyclopediaCategories]?.label ?? "Arquivo",
    entries: sortEntries(groupedEntries),
  }));
}

function pickDossier(slug: string, quickSpawnSlug?: string): TabletopLoreDossier | null {
  const entry = getEncyclopediaEntry(slug);

  if (!entry) {
    return null;
  }

  const atlasContext = getAtlasContextForEntry(entry);

  return {
    slug: entry.slug,
    title: entry.title,
    categoryLabel: encyclopediaCategories[entry.category].label,
    summary: entry.summary,
    href: `/universo/${entry.slug}`,
    atlasHref: atlasContext?.href ?? null,
    quickSpawnHref: quickSpawnSlug ? `/mesa?spawn=${quickSpawnSlug}` : entry.vtt ? `/mesa?spawn=${entry.slug}` : null,
    image: entry.image,
  };
}

function findPublication(chapterNumber: number) {
  return universePublications.find((publication) => publication.chapterNumber === chapterNumber) ?? null;
}

function pickChronicle(publication: UniversePublication | null): TabletopChronicleReference | null {
  if (!publication) {
    return null;
  }

  return {
    slug: publication.slug,
    title: publication.title,
    chapterLabel: publication.chapterLabel,
    excerpt: publication.excerpt,
    href: `/cronicas#${publication.slug}`,
    location: publication.location,
    mentionLinks: publication.mentions.map((mention) => ({
      label: mention.label,
      href: `/universo/${mention.slug}`,
    })),
  };
}

function pickAtlasReference(context: AtlasContextModel, battlemapHref?: string | null): TabletopAtlasReference {
  return {
    title: context.title,
    description: context.description,
    href: context.href,
    battlemapHref: battlemapHref ?? null,
    metrics: context.metrics.slice(0, 3).map((metric) => `${metric.label}: ${metric.value}`),
  };
}

const featuredDossiers = [
  pickDossier("merlin"),
  pickDossier("nashara"),
  pickDossier("alaric-dorne"),
  pickDossier("fragmentos-de-luna"),
  pickDossier("elarion"),
  pickDossier("zerrikania-de-areia-negra"),
].filter((entry): entry is TabletopLoreDossier => Boolean(entry));

const featuredChronicles = [
  pickChronicle(findPublication(0)),
  pickChronicle(findPublication(8)),
  pickChronicle(findPublication(12)),
  pickChronicle(findPublication(16)),
].filter((entry): entry is TabletopChronicleReference => Boolean(entry));

const prologuePublication = findPublication(0);
const nasharaPublication = findPublication(8);
const alaricPublication = findPublication(12);
const velkynPublication = findPublication(16);

const featuredAtlasReferences = [
  pickAtlasReference(buildAtlasContextModel(), null),
  pickAtlasReference(
    buildAtlasContextModel({
      regionSlug: "zerrikania",
      subRegionSlug: "sands-zerrikania",
      locationSlug: "nashara-gate",
    }),
    null,
  ),
  pickAtlasReference(
    buildAtlasContextModel({
      regionSlug: "zerrikania",
      subRegionSlug: "sands-zerrikania",
      locationSlug: "arena-das-areias",
    }),
    "/mesa?atlasBattlemap=battlemap-arena-das-areias",
  ),
  pickAtlasReference(
    buildAtlasContextModel({
      regionSlug: "zerrikania",
      subRegionSlug: "sands-zerrikania",
      locationSlug: "cripta-de-velkyn",
    }),
    "/mesa?atlasBattlemap=battlemap-cripta-velkyn",
  ),
  pickAtlasReference(
    buildAtlasContextModel({
      regionSlug: "northern-kingdoms",
      subRegionSlug: "pontar-redania",
      locationSlug: "novigrad",
    }),
    null,
  ),
];

const sessionSeeds: TabletopSessionSeed[] = [
  {
    slug: "vigilia-da-costa",
    title: "Vigilia da costa",
    summary: "Abra o prologo, consulte Merlin e leve uma ameaca inicial para o palco da sessao.",
    dossierHref: "/universo/merlin",
    chronicleHref: prologuePublication ? `/cronicas#${prologuePublication.slug}` : "/cronicas",
    atlasHref: "/mapa",
    quickSpawnHref: "/mesa?spawn=grifo",
    tags: ["Prologo", "Costa", "Entrada rapida"],
  },
  {
    slug: "portao-de-nashara",
    title: "Portao de Nashara",
    summary: "Cruze a profecia, o patio de caravanas e a areia negra numa sessao orientada por rota e dossie.",
    dossierHref: "/universo/nashara",
    chronicleHref: nasharaPublication ? `/cronicas#${nasharaPublication.slug}` : "/cronicas",
    atlasHref: "/mapa/zerrikania/sands-zerrikania/nashara-gate",
    battlemapHref: "/mesa?atlasBattlemap=battlemap-arena-das-areias",
    quickSpawnHref: "/mesa?spawn=silvano",
    tags: ["Profecia", "Zerrikania", "Caravana"],
  },
  {
    slug: "cripta-de-velkyn",
    title: "Cripta de Velkyn",
    summary: "Leve os Fragmentos de Luna para o tabuleiro e abra a cripta como cena pronta.",
    dossierHref: "/universo/fragmentos-de-luna",
    chronicleHref: velkynPublication ? `/cronicas#${velkynPublication.slug}` : "/cronicas",
    atlasHref: "/mapa/zerrikania/sands-zerrikania/cripta-de-velkyn",
    battlemapHref: "/mesa?atlasBattlemap=battlemap-cripta-velkyn",
    quickSpawnHref: "/mesa?spawn=bruxa-lamuriosa",
    tags: ["Cripta", "Fragmentos", "Cena pronta"],
  },
  {
    slug: "novigrad-subterranea",
    title: "Adega de Novigrad",
    summary: "Abra Alaric, o Grimorio Lunar e a rota subterranea antes de puxar a mesa para um ritual urbano.",
    dossierHref: "/universo/alaric-dorne",
    chronicleHref: alaricPublication ? `/cronicas#${alaricPublication.slug}` : "/cronicas",
    atlasHref: "/mapa/northern-kingdoms/pontar-redania/novigrad",
    quickSpawnHref: "/mesa?spawn=doppler",
    tags: ["Novigrad", "Ritual", "Investigacao"],
  },
];

export function getTabletopLoreCompendium(): TabletopLoreCompendium {
  const spawnEntries = sortEntries(getVttReadyEntries() as TabletopSpawnEntry[]);

  return {
    spawnEntries,
    spawnGroups: buildSpawnGroups(spawnEntries),
    dossiers: featuredDossiers,
    chronicles: featuredChronicles,
    atlasReferences: featuredAtlasReferences,
    sessionSeeds,
  };
}
