export type WorldTravelMode = "foot" | "mounted" | "caravan";
export type CardinalDirection = "north" | "east" | "south" | "west";

export interface WorldMapMarker {
  id: string;
  label: string;
  region: string;
  description: string;
  xPercent: number;
  yPercent: number;
  href?: string;
  tone?: "city" | "wilds" | "quest" | "frontier";
}

export interface WorldRegionLandmark {
  id: string;
  label: string;
  description: string;
  xPercent: number;
  yPercent: number;
}

export interface WorldRegionDefinition {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  summary: string;
  atlasXPercent: number;
  atlasYPercent: number;
  atlasWidthPercent: number;
  atlasHeightPercent: number;
  hue: "primary" | "warning" | "info" | "success";
  landmarks: WorldRegionLandmark[];
}

export interface WorldPosition {
  xKm: number;
  yKm: number;
}

export interface WorldRouteStop extends WorldPosition {
  timestamp: string;
  label: string;
}

export interface WorldGeolocationState {
  position: WorldPosition;
  waypoint: WorldPosition | null;
  mode: WorldTravelMode;
  routeTrail: WorldRouteStop[];
}

export interface WorldMapCustomLayer {
  id: string;
  name: string;
  src: string;
  position: WorldPosition;
  widthKm: number;
  heightKm: number;
  opacity: number;
  locked?: boolean;
}

export const WORLD_MAP_DIMENSIONS = {
  widthKm: 3600,
  heightKm: 2200,
  svgWidth: 1000,
  svgHeight: 620,
} as const;

export const WORLD_TRAVEL_SPEEDS: Record<WorldTravelMode, number> = {
  foot: 32,
  mounted: 64,
  caravan: 46,
};

export const WORLD_MAP_STORAGE_KEY = "dark-lore-world-geolocation";
export const WORLD_MAP_CUSTOM_LAYERS_STORAGE_KEY = "dark-lore-world-custom-layers";
export const WORLD_MAP_BASE_IMAGE_STORAGE_KEY = "dark-lore-world-base-image";

export const worldMapMarkers: WorldMapMarker[] = [
  {
    id: "skellige",
    label: "Skellige",
    region: "Ilhas do Oeste",
    description: "Arquipelagos frios, juramentos antigos e nevoeiros que escondem mais do que rochedo.",
    xPercent: 10,
    yPercent: 18,
    tone: "wilds",
  },
  {
    id: "kaer-morhen",
    label: "Kaer Morhen",
    region: "Montanhas do Norte",
    description: "Fortaleza isolada onde trilhas estreitas e neve definem o ritmo de qualquer viagem.",
    xPercent: 34,
    yPercent: 12,
    tone: "frontier",
  },
  {
    id: "novigrad",
    label: "Novigrad",
    region: "Norte Livre",
    description: "Portos, mercados e rumores que viajam mais rapido do que as moedas mudam de mao.",
    xPercent: 25,
    yPercent: 24,
    href: "/universo/novigrad-rachada",
    tone: "city",
  },
  {
    id: "oxenfurt",
    label: "Oxenfurt",
    region: "Pontes Centrais",
    description: "Cidade de pontes, academias e contratos que ligam o norte ao sul por rios e estradas.",
    xPercent: 31,
    yPercent: 27,
    tone: "city",
  },
  {
    id: "vizima",
    label: "Vizima",
    region: "Temeria",
    description: "Corte, intriga e corredores politicos onde cada quilometro pode custar um aliado.",
    xPercent: 30,
    yPercent: 34,
    tone: "city",
  },
  {
    id: "nilfgaard",
    label: "Nilfgaard",
    region: "Imperio do Sul",
    description: "Estradas longas, exércitos disciplinados e um poder que mede o mundo em fronteiras.",
    xPercent: 46,
    yPercent: 66,
    tone: "city",
  },
  {
    id: "korath",
    label: "Korath",
    region: "Mar de Areia",
    description: "Dunas letais, rotas quebradas e o tipo de silencio que faz o mapa parecer ainda maior.",
    xPercent: 67,
    yPercent: 42,
    tone: "wilds",
  },
  {
    id: "zerrikania",
    label: "Zerrikania",
    region: "Areias Negras",
    description: "Eixo da campanha atual, onde caravanas, ruinas e profecias dividem o mesmo horizonte.",
    xPercent: 80,
    yPercent: 56,
    href: "/universo/zerrikania-de-areia-negra",
    tone: "quest",
  },
  {
    id: "elarion",
    label: "Elarion",
    region: "Fronteira Rasgada",
    description: "Ponto de convergencia da campanha, cercado por ecos, vigias e areia tocada pelo Veu.",
    xPercent: 77,
    yPercent: 34,
    href: "/universo/elarion",
    tone: "quest",
  },
  {
    id: "velkyn",
    label: "Cripta de Velkyn",
    region: "Velkyn",
    description: "Ruina subterranea usada como ponto de mesa e leitura tática dentro da campanha.",
    xPercent: 73,
    yPercent: 38,
    tone: "frontier",
  },
];

export const worldRegions: WorldRegionDefinition[] = [
  {
    id: "skellige",
    slug: "skellige",
    name: "Skellige",
    subtitle: "Ilhas, fiordes e portos sob vento frio.",
    summary:
      "Arquipelago de nevoeiro, juramentos e rotas maritimas agressivas. Funciona bem como mapa de costas, aldeias e enseadas.",
    atlasXPercent: 11,
    atlasYPercent: 18,
    atlasWidthPercent: 19,
    atlasHeightPercent: 22,
    hue: "info",
    landmarks: [
      {
        id: "kaer-trolde",
        label: "Kaer Trolde",
        description: "Centro politico e porto dominante das ilhas.",
        xPercent: 42,
        yPercent: 48,
      },
      {
        id: "aro-kriug",
        label: "Ard Skellig",
        description: "Ilha central e eixo de navegacao do norte.",
        xPercent: 32,
        yPercent: 32,
      },
    ],
  },
  {
    id: "kovir-poviss",
    slug: "kovir-poviss",
    name: "Kovir e Poviss",
    subtitle: "Mercadores, neve e fortalezas do extremo norte.",
    summary:
      "Reino frio e mercantil, ideal para mapas de montanha, minas e corredores comerciais.",
    atlasXPercent: 32,
    atlasYPercent: 18,
    atlasWidthPercent: 19,
    atlasHeightPercent: 18,
    hue: "info",
    landmarks: [
      {
        id: "pont-vanis",
        label: "Pont Vanis",
        description: "Cidade de comercio e navios do reino setentrional.",
        xPercent: 56,
        yPercent: 42,
      },
      {
        id: "hengfors",
        label: "Hengfors",
        description: "Nucleo continental ao sul das rotas frias.",
        xPercent: 36,
        yPercent: 54,
      },
    ],
  },
  {
    id: "redania",
    slug: "redania",
    name: "Redania",
    subtitle: "Coroa, estradas centrais e intriga urbana.",
    summary:
      "Regiao de transicao entre cidades densas, rios e corredores politicos do norte.",
    atlasXPercent: 43,
    atlasYPercent: 31,
    atlasWidthPercent: 17,
    atlasHeightPercent: 15,
    hue: "primary",
    landmarks: [
      {
        id: "novigrad",
        label: "Novigrad",
        description: "Portos, ruas estreitas e poder religioso.",
        xPercent: 42,
        yPercent: 63,
      },
      {
        id: "pont-vanis-sul",
        label: "Fronteira de Pont Vanis",
        description: "Passagem para o norte mercantil.",
        xPercent: 24,
        yPercent: 36,
      },
    ],
  },
  {
    id: "kaedwen",
    slug: "kaedwen",
    name: "Kaedwen",
    subtitle: "Campos frios, fortalezas e montanhas azuis.",
    summary:
      "Faixa militar e montanhosa, boa para mapas de vales, fortalezas e linhas de defesa.",
    atlasXPercent: 56,
    atlasYPercent: 27,
    atlasWidthPercent: 18,
    atlasHeightPercent: 16,
    hue: "warning",
    landmarks: [
      {
        id: "ban-ard",
        label: "Ban Ard",
        description: "Centro arcano e politico do reino.",
        xPercent: 55,
        yPercent: 58,
      },
      {
        id: "montanhas-azuis",
        label: "Montanhas Azuis",
        description: "Barreira geologica dominante da regiao.",
        xPercent: 72,
        yPercent: 24,
      },
    ],
  },
  {
    id: "temeria",
    slug: "temeria",
    name: "Temeria",
    subtitle: "Estradas, florestas e a corte ao sul do norte livre.",
    summary:
      "Mapa de fronteira classico para aldeias, florestas fechadas, fortes e trilhas comerciais.",
    atlasXPercent: 45,
    atlasYPercent: 48,
    atlasWidthPercent: 20,
    atlasHeightPercent: 18,
    hue: "success",
    landmarks: [
      {
        id: "vizima",
        label: "Vizima",
        description: "Capital, muralhas e nodo de campanhas.",
        xPercent: 40,
        yPercent: 56,
      },
      {
        id: "vengerberg",
        label: "Vengerberg",
        description: "Centro urbano oriental e ponto de conexao.",
        xPercent: 66,
        yPercent: 52,
      },
    ],
  },
  {
    id: "lyria-rivia",
    slug: "lyria-rivia",
    name: "Lyria e Rivia",
    subtitle: "Rios, encostas e passagens de fronteira.",
    summary:
      "Regiao quebrada por rios e cristas, adequada para mapas de marcha e combates em travessias.",
    atlasXPercent: 62,
    atlasYPercent: 41,
    atlasWidthPercent: 15,
    atlasHeightPercent: 14,
    hue: "info",
    landmarks: [
      {
        id: "lyria-passagem",
        label: "Travessia de Lyria",
        description: "Corredor de deslocamento e escaramuca.",
        xPercent: 44,
        yPercent: 58,
      },
      {
        id: "rivia-rio",
        label: "Rio de Rivia",
        description: "Curso d'agua que define rotas e bloqueios.",
        xPercent: 62,
        yPercent: 44,
      },
    ],
  },
  {
    id: "nilfgaard",
    slug: "nilfgaard",
    name: "Imperio Nilfgaardiano",
    subtitle: "Sul amplo, estradas longas e centros imperiais.",
    summary:
      "Macrorregiao de campanha com campos vastos, estruturas imperiais e transicoes para desertos.",
    atlasXPercent: 52,
    atlasYPercent: 67,
    atlasWidthPercent: 31,
    atlasHeightPercent: 24,
    hue: "warning",
    landmarks: [
      {
        id: "cidade-nilfgaard",
        label: "Nilfgaard",
        description: "Coracao do imperio e foco administrativo.",
        xPercent: 46,
        yPercent: 46,
      },
      {
        id: "nilfgaard-litoral",
        label: "Litoral Sul",
        description: "Portos e saidas maritimas do imperio.",
        xPercent: 28,
        yPercent: 72,
      },
    ],
  },
  {
    id: "korath",
    slug: "korath",
    name: "Deserto de Korath",
    subtitle: "Dunas vastas, ruinas e rotas quebradas.",
    summary:
      "Deserto letal e expansivo, perfeito para mapas de marcha, oasis e ruinas expostas.",
    atlasXPercent: 75,
    atlasYPercent: 69,
    atlasWidthPercent: 19,
    atlasHeightPercent: 18,
    hue: "warning",
    landmarks: [
      {
        id: "gorthur-gvaed",
        label: "Gorthur Gvaed",
        description: "Ponto duro no leste de Korath.",
        xPercent: 74,
        yPercent: 50,
      },
      {
        id: "mar-de-areia",
        label: "Mar de Areia",
        description: "Extensao central de calor e visibilidade quebrada.",
        xPercent: 44,
        yPercent: 42,
      },
    ],
  },
  {
    id: "ofir",
    slug: "ofir",
    name: "Ofir",
    subtitle: "Costa distante, cultura propria e rotas do extremo sul.",
    summary:
      "Regiao costeira para mapas exoticos, portos, enseadas e complexos urbanos fora do eixo central.",
    atlasXPercent: 71,
    atlasYPercent: 84,
    atlasWidthPercent: 16,
    atlasHeightPercent: 14,
    hue: "success",
    landmarks: [
      {
        id: "porto-ofir",
        label: "Porto de Ofir",
        description: "Entrada maritima e ponte com outras campanhas.",
        xPercent: 48,
        yPercent: 60,
      },
      {
        id: "cidade-ofir",
        label: "Cidade de Ofir",
        description: "Centro urbano e comercial do sul distante.",
        xPercent: 62,
        yPercent: 42,
      },
    ],
  },
  {
    id: "zerrikania",
    slug: "zerrikania",
    name: "Zerrikania",
    subtitle: "Areias negras, ruinas e o eixo atual da campanha.",
    summary:
      "O coracao da campanha atual. Aqui o mapa regional precisa suportar oasis, ruinas, cidades partidas e trilhas de deserto.",
    atlasXPercent: 83,
    atlasYPercent: 58,
    atlasWidthPercent: 19,
    atlasHeightPercent: 20,
    hue: "primary",
    landmarks: [
      {
        id: "elarion",
        label: "Elarion",
        description: "Ponto de convergencia da campanha.",
        xPercent: 44,
        yPercent: 28,
      },
      {
        id: "velkyn",
        label: "Cripta de Velkyn",
        description: "Ruina subterranea ligada as expedicoes.",
        xPercent: 36,
        yPercent: 40,
      },
      {
        id: "areias-negras",
        label: "Areias Negras",
        description: "Horizonte de travessias, profecias e ruinas.",
        xPercent: 58,
        yPercent: 62,
      },
    ],
  },
];

export function clampWorldPosition(position: WorldPosition): WorldPosition {
  return {
    xKm: Math.max(0, Math.min(WORLD_MAP_DIMENSIONS.widthKm, Number(position.xKm.toFixed(1)))),
    yKm: Math.max(0, Math.min(WORLD_MAP_DIMENSIONS.heightKm, Number(position.yKm.toFixed(1)))),
  };
}

export function percentToWorldPosition(xPercent: number, yPercent: number): WorldPosition {
  return clampWorldPosition({
    xKm: (xPercent / 100) * WORLD_MAP_DIMENSIONS.widthKm,
    yKm: (yPercent / 100) * WORLD_MAP_DIMENSIONS.heightKm,
  });
}

export function worldPositionToSvg(position: WorldPosition) {
  return {
    x: (position.xKm / WORLD_MAP_DIMENSIONS.widthKm) * WORLD_MAP_DIMENSIONS.svgWidth,
    y: (position.yKm / WORLD_MAP_DIMENSIONS.heightKm) * WORLD_MAP_DIMENSIONS.svgHeight,
  };
}

export function svgToWorldPosition(x: number, y: number): WorldPosition {
  return clampWorldPosition({
    xKm: (x / WORLD_MAP_DIMENSIONS.svgWidth) * WORLD_MAP_DIMENSIONS.widthKm,
    yKm: (y / WORLD_MAP_DIMENSIONS.svgHeight) * WORLD_MAP_DIMENSIONS.heightKm,
  });
}

export function distanceBetweenWorldPositions(from: WorldPosition, to: WorldPosition) {
  const dx = to.xKm - from.xKm;
  const dy = to.yKm - from.yKm;
  return Math.sqrt(dx * dx + dy * dy);
}

export function estimateTravelDays(distanceKm: number, mode: WorldTravelMode) {
  return Number((distanceKm / WORLD_TRAVEL_SPEEDS[mode]).toFixed(1));
}

export function findNearestWorldMarker(position: WorldPosition) {
  let nearest: (WorldMapMarker & { distanceKm: number }) | null = null;

  for (const marker of worldMapMarkers) {
    const markerPosition = percentToWorldPosition(marker.xPercent, marker.yPercent);
    const distanceKm = distanceBetweenWorldPositions(position, markerPosition);

    if (!nearest || distanceKm < nearest.distanceKm) {
      nearest = {
        ...marker,
        distanceKm: Number(distanceKm.toFixed(1)),
      };
    }
  }

  return nearest;
}

export function describeWorldQuadrant(position: WorldPosition) {
  const columnCount = 8;
  const rowCount = 6;
  const column = Math.min(
    columnCount - 1,
    Math.floor((position.xKm / WORLD_MAP_DIMENSIONS.widthKm) * columnCount),
  );
  const row = Math.min(
    rowCount - 1,
    Math.floor((position.yKm / WORLD_MAP_DIMENSIONS.heightKm) * rowCount),
  );

  return `${String.fromCharCode(65 + column)}${row + 1}`;
}

export function moveWorldPosition(
  position: WorldPosition,
  direction: CardinalDirection,
  distanceKm: number,
) {
  const delta = Math.max(1, distanceKm);

  return clampWorldPosition({
    xKm:
      direction === "east"
        ? position.xKm + delta
        : direction === "west"
          ? position.xKm - delta
          : position.xKm,
    yKm:
      direction === "south"
        ? position.yKm + delta
        : direction === "north"
          ? position.yKm - delta
          : position.yKm,
  });
}

export function advanceTowardsWaypoint(
  position: WorldPosition,
  waypoint: WorldPosition,
  distanceKm: number,
) {
  const totalDistance = distanceBetweenWorldPositions(position, waypoint);

  if (totalDistance <= distanceKm) {
    return clampWorldPosition(waypoint);
  }

  const ratio = distanceKm / totalDistance;

  return clampWorldPosition({
    xKm: position.xKm + (waypoint.xKm - position.xKm) * ratio,
    yKm: position.yKm + (waypoint.yKm - position.yKm) * ratio,
  });
}

export function createInitialWorldGeolocationState(): WorldGeolocationState {
  const initialPosition = percentToWorldPosition(79, 53);

  return {
    position: initialPosition,
    waypoint: percentToWorldPosition(77, 34),
    mode: "mounted",
    routeTrail: [
      {
        ...initialPosition,
        timestamp: new Date().toISOString(),
        label: "Companhia em marcha",
      },
    ],
  };
}

export function appendWorldRouteStop(
  trail: WorldRouteStop[],
  position: WorldPosition,
  label: string,
) {
  const nextStop: WorldRouteStop = {
    ...position,
    timestamp: new Date().toISOString(),
    label,
  };

  return [...trail.slice(-23), nextStop];
}

export function getWorldRegion(regionSlug: string) {
  return worldRegions.find((region) => region.slug === regionSlug) ?? null;
}

export function getWorldRegionLandmark(regionSlug: string, landmarkId: string) {
  const region = getWorldRegion(regionSlug);

  if (!region) {
    return null;
  }

  const landmark = region.landmarks.find((entry) => entry.id === landmarkId) ?? null;

  if (!landmark) {
    return null;
  }

  return { region, landmark };
}

export function createWorldRegionBaseImageStorageKey(regionSlug: string) {
  return `dark-lore-world-region-${regionSlug}-base-image`;
}

export function createWorldRegionLayersStorageKey(regionSlug: string) {
  return `dark-lore-world-region-${regionSlug}-layers`;
}

export function createWorldLandmarkBaseImageStorageKey(
  regionSlug: string,
  landmarkId: string,
) {
  return `dark-lore-world-region-${regionSlug}-landmark-${landmarkId}-base-image`;
}

export function createWorldLayerSize(widthKm: number, aspectRatio: number) {
  const clampedWidth = Math.max(80, Math.min(1200, Number(widthKm.toFixed(1))));
  const safeAspectRatio = Math.max(0.1, aspectRatio);

  return {
    widthKm: clampedWidth,
    heightKm: Number((clampedWidth / safeAspectRatio).toFixed(1)),
  };
}

export function clampWorldLayerPosition(
  position: WorldPosition,
  widthKm: number,
  heightKm: number,
) {
  const halfWidth = Math.max(1, widthKm / 2);
  const halfHeight = Math.max(1, heightKm / 2);

  return clampWorldPosition({
    xKm: Math.max(
      halfWidth,
      Math.min(WORLD_MAP_DIMENSIONS.widthKm - halfWidth, position.xKm),
    ),
    yKm: Math.max(
      halfHeight,
      Math.min(WORLD_MAP_DIMENSIONS.heightKm - halfHeight, position.yKm),
    ),
  });
}
