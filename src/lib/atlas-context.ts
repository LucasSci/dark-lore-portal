import type { EncyclopediaEntry } from "@/lib/encyclopedia";
import { getEncyclopediaEntry } from "@/lib/encyclopedia";
import {
  getAllAtlasLocations,
  getAtlasFocusFromRoute,
  loadAtlasWorld,
  type AtlasLocation,
  type AtlasRegion,
  type AtlasSubRegion,
  type AtlasZoomStage,
} from "@/lib/hierarchical-atlas";
import {
  getMapGenieWitcherMap,
  resolveAtlasRegionToRegionalMapId,
} from "@/lib/mapgenie-witcher";
import type { CampaignPublication } from "@/lib/publications";
import type { PortalAtlasFocusState } from "@/lib/portal-state";

export interface AtlasContextMetric {
  label: string;
  value: string;
  tone?: "neutral" | "good" | "warn" | "bad" | "info";
}

export interface AtlasContextLink {
  label: string;
  href: string;
  description?: string;
}

export interface AtlasContextAction {
  label: string;
  href: string;
  variant?: "primary" | "outline" | "secondary";
}

export interface AtlasContextModel {
  eyebrow: string;
  title: string;
  description: string;
  stage: AtlasZoomStage;
  href: string;
  image: string;
  breadcrumbs: { label: string; to?: string }[];
  metrics: AtlasContextMetric[];
  actions: AtlasContextAction[];
  related: AtlasContextLink[];
  orientationHint: string;
}

type AtlasFocusInput = {
  regionSlug?: string;
  subRegionSlug?: string;
  locationSlug?: string;
};

const world = loadAtlasWorld();

const atlasLoreIndex: Record<string, string[]> = {
  zerrikania: ["zerrikania-de-areia-negra", "nashara", "profecia-de-nashara", "guardioes-do-veu"],
  "sands-zerrikania": ["zerrikania-de-areia-negra", "nashara", "guardioes-do-veu", "fragmentos-de-luna"],
  "nashara-gate": ["nashara", "zerrikania-de-areia-negra", "profecia-de-nashara"],
  "arena-das-areias": ["sorrow-noxmourn", "guardioes-do-veu", "zerrikania-de-areia-negra"],
  "cripta-de-velkyn": ["fragmentos-de-luna", "guardioes-do-veu", "elarion"],
  "northern-kingdoms": ["cedencia-do-veu", "conclaves-do-veu", "fragmentos-de-luna"],
  novigrad: ["novigrad-subterranea", "alaric-dorne", "fragmentos-de-luna"],
  skellige: ["cedencia-do-veu", "guardioes-do-veu"],
  toussaint: ["profecia-de-nashara", "fragmentos-de-luna"],
};

const encyclopediaAtlasIndex: Record<string, AtlasFocusInput> = {
  "zerrikania-de-areia-negra": { regionSlug: "zerrikania", subRegionSlug: "sands-zerrikania" },
  nashara: {
    regionSlug: "zerrikania",
    subRegionSlug: "sands-zerrikania",
    locationSlug: "nashara-gate",
  },
  "sorrow-noxmourn": {
    regionSlug: "zerrikania",
    subRegionSlug: "sands-zerrikania",
    locationSlug: "arena-das-areias",
  },
  "hauz-darnen": {
    regionSlug: "zerrikania",
    subRegionSlug: "sands-zerrikania",
    locationSlug: "nashara-gate",
  },
  "alaric-dorne": {
    regionSlug: "northern-kingdoms",
    subRegionSlug: "pontar-redania",
    locationSlug: "novigrad",
  },
  "novigrad-subterranea": {
    regionSlug: "northern-kingdoms",
    subRegionSlug: "pontar-redania",
    locationSlug: "novigrad",
  },
  elarion: { regionSlug: "zerrikania", subRegionSlug: "sands-zerrikania" },
  "fragmentos-de-luna": {
    regionSlug: "zerrikania",
    subRegionSlug: "sands-zerrikania",
    locationSlug: "cripta-de-velkyn",
  },
  "guardioes-do-veu": {
    regionSlug: "zerrikania",
    subRegionSlug: "sands-zerrikania",
    locationSlug: "cripta-de-velkyn",
  },
  "profecia-de-nashara": { regionSlug: "zerrikania", subRegionSlug: "sands-zerrikania" },
};

const campaignLocationAtlasIndex: Record<string, AtlasFocusInput> = {
  elarion: { regionSlug: "zerrikania", subRegionSlug: "sands-zerrikania" },
  korath: { regionSlug: "zerrikania", subRegionSlug: "sands-zerrikania" },
  vazhir: { regionSlug: "zerrikania", subRegionSlug: "sands-zerrikania" },
  "vaz-hir": { regionSlug: "zerrikania", subRegionSlug: "sands-zerrikania" },
};

function normalize(value?: string | null) {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildHref(focus?: AtlasFocusInput) {
  if (!focus?.regionSlug) {
    return "/mapa";
  }

  if (!focus.subRegionSlug) {
    return `/mapa/${focus.regionSlug}`;
  }

  if (!focus.locationSlug) {
    return `/mapa/${focus.regionSlug}/${focus.subRegionSlug}`;
  }

  return `/mapa/${focus.regionSlug}/${focus.subRegionSlug}/${focus.locationSlug}`;
}

function buildRelatedLinks(key: string) {
  return (atlasLoreIndex[key] ?? [])
    .map((slug) => getEncyclopediaEntry(slug))
    .filter((entry): entry is EncyclopediaEntry => Boolean(entry))
    .map((entry) => ({
      label: entry.title,
      href: `/universo/${entry.slug}`,
      description: entry.subtitle,
    }));
}

function resolveImage(region?: AtlasRegion) {
  const regionalMapId = resolveAtlasRegionToRegionalMapId(region?.slug);

  if (regionalMapId) {
    const map = getMapGenieWitcherMap(regionalMapId);
    return map.imagePath ?? world.imageUrl;
  }

  return world.imageUrl;
}

function getFocusStage(focus: AtlasFocusInput): AtlasZoomStage {
  if (focus.locationSlug) {
    return "location";
  }

  if (focus.subRegionSlug) {
    return "subregion";
  }

  if (focus.regionSlug) {
    return "region";
  }

  return "world";
}

function buildBreadcrumbs(
  region?: AtlasRegion | null,
  subRegion?: AtlasSubRegion | null,
  location?: AtlasLocation | null,
) {
  const breadcrumbs: { label: string; to?: string }[] = [{ label: "Atlas do Continente", to: "/mapa" }];

  if (region) {
    breadcrumbs.push({ label: region.name, to: `/mapa/${region.slug}` });
  }

  if (subRegion) {
    breadcrumbs.push({
      label: subRegion.name,
      to: `/mapa/${region?.slug}/${subRegion.slug}`,
    });
  }

  if (location) {
    breadcrumbs.push({
      label: location.name,
      to: `/mapa/${region?.slug}/${subRegion?.slug}/${location.slug}`,
    });
  }

  return breadcrumbs.map((entry, index, list) =>
    index === list.length - 1 ? { label: entry.label } : entry,
  );
}

export function buildAtlasContextModel(focus: AtlasFocusInput = {}): AtlasContextModel {
  const currentFocus = getAtlasFocusFromRoute(
    world,
    focus.regionSlug,
    focus.subRegionSlug,
    focus.locationSlug,
  );

  const stage = getFocusStage(focus);
  const region = currentFocus.region;
  const subRegion = currentFocus.subRegion;
  const location = currentFocus.location;

  if (location && subRegion && region) {
    return {
      eyebrow: "Local em foco",
      title: location.name,
      description: location.description,
      stage,
      href: buildHref(focus),
      image: resolveImage(region),
      breadcrumbs: buildBreadcrumbs(region, subRegion, location),
      metrics: [
        { label: "Tipo", value: location.type },
        { label: "Facao", value: location.faction },
        { label: "POIs", value: String(location.pois.length), tone: "info" },
        {
          label: "Battlemap",
          value: location.battlemapId ? "Disponivel" : "Nao vinculado",
          tone: location.battlemapId ? "good" : "warn",
        },
      ],
      actions: [
        { label: "Abrir no atlas", href: buildHref(focus), variant: "primary" },
        { label: "Levar para a mesa", href: "/mesa", variant: "outline" },
        { label: "Ver campanha", href: "/campanha", variant: "secondary" },
      ],
      related: buildRelatedLinks(location.slug),
      orientationHint:
        "No celular, gire o aparelho para enxergar melhor o mapa, os distritos e os atalhos de rota.",
    };
  }

  if (subRegion && region) {
    return {
      eyebrow: "Sub-regiao em foco",
      title: subRegion.name,
      description: subRegion.description,
      stage,
      href: buildHref(focus),
      image: resolveImage(region),
      breadcrumbs: buildBreadcrumbs(region, subRegion, null),
      metrics: [
        { label: "Terreno", value: subRegion.terrainType },
        { label: "Clima", value: subRegion.climate },
        { label: "Perigo", value: `${subRegion.dangerLevel}/5`, tone: "warn" },
        { label: "Locais", value: String(subRegion.locations.length), tone: "info" },
      ],
      actions: [
        { label: "Abrir sub-regiao", href: buildHref(focus), variant: "primary" },
        { label: "Ver no universo", href: "/universo", variant: "outline" },
        { label: "Continuar campanha", href: "/campanha", variant: "secondary" },
      ],
      related: buildRelatedLinks(subRegion.slug),
      orientationHint:
        "Use os atalhos por camadas para descer de mundo para regiao, sub-regiao e local sem perder contexto.",
    };
  }

  if (region) {
    return {
      eyebrow: "Regiao em foco",
      title: region.name,
      description: region.description,
      stage,
      href: buildHref(focus),
      image: resolveImage(region),
      breadcrumbs: buildBreadcrumbs(region, null, null),
      metrics: [
        { label: "Bioma", value: region.biomeType },
        { label: "Clima", value: region.climate },
        { label: "Perigo", value: `${region.dangerLevel}/5`, tone: "warn" },
        { label: "Sub-regioes", value: String(region.subRegions.length), tone: "info" },
      ],
      actions: [
        { label: "Abrir regiao", href: buildHref(focus), variant: "primary" },
        {
          label: "Carta regional",
          href: resolveAtlasRegionToRegionalMapId(region.slug)
            ? `/mapa/regional/${resolveAtlasRegionToRegionalMapId(region.slug)}`
            : buildHref(focus),
          variant: "outline",
        },
        { label: "Abrir dossies", href: "/universo", variant: "secondary" },
      ],
      related: buildRelatedLinks(region.slug),
      orientationHint:
        "Quando estiver no atlas, mantenha a leitura curta no topo e a exploracao longa dentro do mapa.",
    };
  }

  return {
    eyebrow: "Mappa mundi",
    title: world.name,
    description: world.description,
    stage,
    href: "/mapa",
    image: world.imageUrl,
    breadcrumbs: [{ label: "Atlas do Continente" }],
    metrics: [
      { label: "Regioes", value: String(world.regions.length), tone: "info" },
      { label: "Locais catalogados", value: String(getAllAtlasLocations(world).length) },
      { label: "Battlemaps", value: String(world.battlemaps.length), tone: "good" },
      { label: "Modo", value: "Leitura progressiva por camadas" },
    ],
    actions: [
      { label: "Entrar no atlas", href: "/mapa", variant: "primary" },
      { label: "Abrir universo", href: "/universo", variant: "outline" },
      { label: "Seguir campanha", href: "/campanha", variant: "secondary" },
    ],
    related: buildRelatedLinks("zerrikania"),
    orientationHint:
      "No celular, prefira explorar o atlas em modo paisagem para ganhar area util de toque e leitura.",
  };
}

export function getAtlasContextForCampaignPublication(publication: CampaignPublication) {
  const focus = campaignLocationAtlasIndex[normalize(publication.location)];

  return focus ? buildAtlasContextModel(focus) : null;
}

export function getAtlasContextForEntry(entry: EncyclopediaEntry) {
  const focus = encyclopediaAtlasIndex[entry.slug];

  return focus ? buildAtlasContextModel(focus) : null;
}

export function toPortalAtlasFocusState(context: AtlasContextModel): PortalAtlasFocusState {
  const segments = context.href.split("/").filter(Boolean);

  return {
    regionSlug: segments[1],
    subRegionSlug: segments[2],
    locationSlug: segments[3],
    stage: context.stage,
    title: context.title,
    description: context.description,
    href: context.href,
  };
}
