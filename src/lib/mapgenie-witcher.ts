export const LOCAL_WITCHER_TILE_PREFIX = "/local-witcher3map";
export const WITCHER_MAP_ASSET_VERSION = "20260317-maxnative";

export type MapGenieWitcherMapId =
  | "mundi"
  | "skellige"
  | "velen-novigrad"
  | "kaer-morhen"
  | "toussaint"
  | "white-orchard";

export interface WitcherAtlasHotspot {
  id: string;
  label: string;
  targetMapId: Exclude<MapGenieWitcherMapId, "mundi">;
  southWest: [number, number];
  northEast: [number, number];
}

export interface MapGenieWitcherMap {
  id: MapGenieWitcherMapId;
  title: string;
  subtitle: string;
  description: string;
  kind: "tiles" | "image";
  tileFolder: string;
  initialZoom: number;
  maxZoom: number;
  crs: "simple" | "geo";
  center: [number, number];
  southWest: [number, number];
  northEast: [number, number];
  aliases: string[];
  regions: string[];
  tileRowsByZoom?: Partial<Record<number, number>>;
  imagePath?: string;
  imageNativeZoom?: number;
  imageSize?: {
    width: number;
    height: number;
  };
  hotspots?: WitcherAtlasHotspot[];
}

export interface WitcherAtlasSource {
  label: string;
  href: string;
  detail: string;
}

export const mapGenieWitcherMaps: MapGenieWitcherMap[] = [
  {
    id: "mundi",
    title: "Mundi do Continente",
    subtitle: "Visao composta de todas as grandes areas cartografadas em uma unica placa.",
    description:
      "Painel geral do continente para leitura macro. Use este recorte para se orientar e depois aprofunde a navegacao nas regioes individuais.",
    kind: "image",
    tileFolder: "",
    imagePath: `/maps/witcher-mundi.png?v=${WITCHER_MAP_ASSET_VERSION}`,
    imageNativeZoom: 3,
    imageSize: {
      width: 4278,
      height: 3175,
    },
    initialZoom: 2,
    maxZoom: 5,
    crs: "simple",
    center: [818, 1093],
    southWest: [1635, 0],
    northEast: [0, 2186],
    aliases: ["mundi", "continente", "mundo", "atlas geral", "world"],
    regions: ["continent", "world", "global"],
    hotspots: [
      {
        id: "mundi-skellige",
        label: "Skellige",
        targetMapId: "skellige",
        southWest: [1211, 88],
        northEast: [295, 1004],
      },
      {
        id: "mundi-velen",
        label: "Reinos do Norte",
        targetMapId: "velen-novigrad",
        southWest: [1389, 558],
        northEast: [75, 1725],
      },
      {
        id: "mundi-kaer",
        label: "Kaer Morhen",
        targetMapId: "kaer-morhen",
        southWest: [748, 1658],
        northEast: [145, 2139],
      },
      {
        id: "mundi-toussaint",
        label: "Toussaint",
        targetMapId: "toussaint",
        southWest: [1506, 908],
        northEast: [965, 1449],
      },
    ],
  },
  {
    id: "velen-novigrad",
    title: "Coracao dos Reinos do Norte",
    subtitle: "Velen, Novigrad e as rotas centrais entre Redania e Temeria.",
    description:
      "Panorama amplo das terras centrais do norte, util para consultar cidades, estradas e travessias importantes do continente.",
    kind: "tiles",
    tileFolder: "hos_velen",
    initialZoom: 3,
    maxZoom: 6,
    crs: "simple",
    center: [120, 120],
    southWest: [0, 0],
    northEast: [256, 224],
    aliases: [
      "velen",
      "hos velen",
      "novigrad",
      "redania",
      "temeria",
      "reinos do norte",
      "northern kingdoms",
      "pontar",
    ],
    regions: ["velen", "novigrad", "redania", "temeria", "northern-kingdoms"],
    imagePath: `/maps/regions/velen-novigrad.jpg?v=${WITCHER_MAP_ASSET_VERSION}`,
    imageNativeZoom: 4,
    imageSize: {
      width: 4096,
      height: 4608,
    },
    tileRowsByZoom: {
      1: 3,
      2: 5,
      3: 9,
      4: 18,
      5: 36,
      6: 72,
    },
  },
  {
    id: "skellige",
    title: "Skellige",
    subtitle: "Arquipelago, fiordes, portos e travessias maritimas.",
    description:
      "Referencia para navegar entre ilhas, enseadas, aldeias costeiras e fortalezas dos clas.",
    kind: "tiles",
    tileFolder: "skellige",
    initialZoom: 3,
    maxZoom: 6,
    crs: "geo",
    center: [-35, -10],
    southWest: [-85.05, -180],
    northEast: [79.3, 135],
    aliases: ["skellige", "ard skellig", "an skellig", "kaer trolde"],
    regions: ["skellige"],
    imagePath: `/maps/regions/skellige.jpg?v=${WITCHER_MAP_ASSET_VERSION}`,
    imageNativeZoom: 4,
    imageSize: {
      width: 3840,
      height: 3840,
    },
  },
  {
    id: "kaer-morhen",
    title: "Vale de Kaer Morhen",
    subtitle: "Fortaleza antiga, vales fechados e trilhas nas Montanhas Azuis.",
    description:
      "Recorte montanhoso para consultar o vale, a fortaleza e os caminhos estreitos do extremo nordeste.",
    kind: "tiles",
    tileFolder: "kaer_morhen",
    initialZoom: 3,
    maxZoom: 6,
    crs: "simple",
    center: [64, 58],
    southWest: [0, 0],
    northEast: [160, 128],
    aliases: ["kaer morhen", "blue mountains", "montanhas azuis"],
    regions: ["kaer-morhen", "blue-mountains"],
    imagePath: `/maps/regions/kaer-morhen.png?v=${WITCHER_MAP_ASSET_VERSION}`,
    imageNativeZoom: 5,
    imageSize: {
      width: 4096,
      height: 5120,
    },
    tileRowsByZoom: {
      2: 3,
      3: 5,
      4: 10,
      5: 20,
      6: 40,
    },
  },
  {
    id: "toussaint",
    title: "Toussaint",
    subtitle: "Vales, vinhedos, castelos e estradas meridionais.",
    description:
      "Consulta regional do ducado, util para orientar deslocamentos entre Beauclair e os dominios vizinhos.",
    kind: "tiles",
    tileFolder: "toussaint",
    initialZoom: 3,
    maxZoom: 6,
    crs: "simple",
    center: [64, 58],
    southWest: [0, 0],
    northEast: [144, 144],
    aliases: ["toussaint", "beauclair", "ducado", "ducado de toussaint"],
    regions: ["toussaint", "beauclair"],
    imagePath: `/maps/regions/toussaint.png?v=${WITCHER_MAP_ASSET_VERSION}`,
    imageNativeZoom: 5,
    imageSize: {
      width: 4608,
      height: 4608,
    },
    tileRowsByZoom: {
      2: 3,
      3: 5,
      4: 9,
      5: 18,
      6: 36,
    },
  },
  {
    id: "white-orchard",
    title: "White Orchard",
    subtitle: "Vale inicial, estradas rurais, pomares e trilhas de fronteira.",
    description:
      "Recorte compacto para consulta de White Orchard como ponto local dentro da malha maior dos Reinos do Norte.",
    kind: "tiles",
    tileFolder: "white_orchard",
    initialZoom: 3,
    maxZoom: 6,
    crs: "simple",
    center: [64, 96],
    southWest: [0, 0],
    northEast: [128, 192],
    aliases: ["white orchard", "pomar branco", "pomar", "orchard"],
    regions: ["white-orchard", "pomar-branco"],
    imagePath: `/maps/regions/white-orchard.png?v=${WITCHER_MAP_ASSET_VERSION}`,
    imageNativeZoom: 5,
    imageSize: {
      width: 5120,
      height: 4096,
    },
    tileRowsByZoom: {
      2: 2,
      3: 4,
      4: 8,
      5: 16,
      6: 32,
    },
  },
];

export const witcherAtlasSources: WitcherAtlasSource[] = [
  {
    label: "witcher3map",
    href: "https://github.com/witcher3map/witcher3map",
    detail: "Projeto-base usado para estruturar o atlas local e a navegacao cartografica.",
  },
  {
    label: "witcher3map-maps",
    href: "https://github.com/witcher3map/witcher3map-maps/releases/tag/1.1",
    detail: "Pacote de tiles usado como base visual local para Velen, Skellige, Kaer Morhen e Toussaint.",
  },
];

export const witcherAtlasAttributionNote =
  "Base local integrada para consulta geografica dentro deste projeto de mesa, com creditos visiveis as fontes e uso contextualizado para referencia nao comercial.";

function normalize(value?: string | null) {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getMapGenieWitcherMap(mapId: MapGenieWitcherMapId) {
  return mapGenieWitcherMaps.find((entry) => entry.id === mapId) ?? mapGenieWitcherMaps[0];
}

export function getLocalWitcherTileUrl(mapId: MapGenieWitcherMapId) {
  const map = getMapGenieWitcherMap(mapId);
  return `${LOCAL_WITCHER_TILE_PREFIX}/${map.tileFolder}/{z}/{x}/{y}.png`;
}

export function resolveLocalWitcherTileY(
  mapId: MapGenieWitcherMapId,
  zoom: number,
  y: number,
) {
  const map = getMapGenieWitcherMap(mapId);
  const rowCount = map.tileRowsByZoom?.[zoom];

  if (!rowCount) {
    return y;
  }

  return rowCount - 1 - y;
}

export function searchMapGenieWitcherMaps(query: string) {
  const normalizedQuery = normalize(query);

  if (!normalizedQuery) {
    return mapGenieWitcherMaps;
  }

  return mapGenieWitcherMaps.filter((entry) => {
    const searchable = [
      entry.id,
      entry.title,
      entry.subtitle,
      entry.description,
      ...entry.aliases,
      ...entry.regions,
    ]
      .map((value) => normalize(value))
      .join(" ");

    return searchable.includes(normalizedQuery);
  });
}

export function resolveMapGenieWitcherMapId(
  regionSlug?: string | null,
  landmarkId?: string | null,
): MapGenieWitcherMapId {
  const region = normalize(regionSlug);
  const landmark = normalize(landmarkId);
  const combined = [region, landmark].filter(Boolean);

  const entry = mapGenieWitcherMaps.find((candidate) => {
    const haystack = [candidate.id, ...candidate.aliases, ...candidate.regions].map(normalize);

    return combined.some((token) => haystack.includes(token));
  });

  return entry?.id ?? "mundi";
}

export function getRegionalMapGenieMaps() {
  return mapGenieWitcherMaps.filter((entry) => entry.id !== "mundi");
}

export function resolveAtlasRegionToRegionalMapId(
  regionSlug?: string | null,
  subRegionSlug?: string | null,
  locationSlug?: string | null,
): MapGenieWitcherMapId | null {
  const region = normalize(regionSlug);
  const subRegion = normalize(subRegionSlug);
  const location = normalize(locationSlug);

  if (region === "white-orchard" || location === "white-orchard") {
    return "white-orchard";
  }

  if (region === "northern-kingdoms" || subRegion === "velen-temeria" || subRegion === "pontar-redania") {
    return "velen-novigrad";
  }

  if (region === "skellige" || subRegion === "ard-skellig") {
    return "skellige";
  }

  if (region === "kaer-morhen" || subRegion === "kaer-morhen-vale" || location === "kaer-morhen") {
    return "kaer-morhen";
  }

  if (region === "toussaint" || subRegion === "beauclair-marches") {
    return "toussaint";
  }

  if (location === "kaer-trolde") {
    return "skellige";
  }

  return null;
}
