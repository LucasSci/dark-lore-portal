export type MapGenieWitcherMapId =
  | "skellige"
  | "white-orchard"
  | "velen-novigrad"
  | "kaer-morhen"
  | "toussaint"
  | "fablesphere"
  | "isle-of-mists";

export interface MapGenieWitcherMap {
  id: MapGenieWitcherMapId;
  title: string;
  subtitle: string;
  description: string;
  iframeSrc: string;
  externalUrl: string;
  aliases: string[];
  regions: string[];
}

export const mapGenieWitcherMaps: MapGenieWitcherMap[] = [
  {
    id: "velen-novigrad",
    title: "Velen e Novigrad",
    subtitle: "Planicies devastadas, estradas de guerra e a cidade livre.",
    description:
      "Mapa central para Velen, Novigrad e boa parte das rotas mais movimentadas de Witcher 3.",
    iframeSrc: "https://mapgenie.io/witcher-3/maps/velen-novigrad?embed=light",
    externalUrl: "https://mapgenie.io/witcher-3/maps/velen-novigrad",
    aliases: [
      "velen",
      "novigrad",
      "crows perch",
      "crookback bog",
      "ard skellig route",
      "white bridge",
    ],
    regions: ["velen", "novigrad", "redania", "temeria"],
  },
  {
    id: "white-orchard",
    title: "White Orchard",
    subtitle: "A fronteira inicial entre vila, moinho e trilhas de guerra.",
    description:
      "Bom ponto de entrada para zonas rurais compactas, trilhas curtas e landmarks mais proximos.",
    iframeSrc: "https://mapgenie.io/witcher-3/maps/white-orchard?embed=light",
    externalUrl: "https://mapgenie.io/witcher-3/maps/white-orchard",
    aliases: ["white orchard", "pomar branco", "orchard"],
    regions: ["white-orchard", "temeria"],
  },
  {
    id: "skellige",
    title: "Skellige",
    subtitle: "Arquipelago, falésias, portos, ruinas e rotas maritimas.",
    description:
      "Mapa ideal para navegar entre ilhas, vilarejos costeiros, fortalezas e mares perigosos.",
    iframeSrc: "https://mapgenie.io/witcher-3/maps/skellige?embed=light",
    externalUrl: "https://mapgenie.io/witcher-3/maps/skellige",
    aliases: ["skellige", "ard skellig", "an skellig", "kaer trolde"],
    regions: ["skellige"],
  },
  {
    id: "kaer-morhen",
    title: "Kaer Morhen",
    subtitle: "Fortaleza, vale, trilhas elevadas e ruinas ligadas aos witchers.",
    description:
      "Mapa focado na escola do lobo e na area montanhosa ao redor da fortaleza.",
    iframeSrc: "https://mapgenie.io/witcher-3/maps/kaer-morhen?embed=light",
    externalUrl: "https://mapgenie.io/witcher-3/maps/kaer-morhen",
    aliases: ["kaer morhen", "wolf school", "escola do lobo"],
    regions: ["kaer-morhen", "blue-mountains"],
  },
  {
    id: "toussaint",
    title: "Toussaint",
    subtitle: "Vinhedos, castelos, vales ensolarados e cortes nobres.",
    description:
      "Mapa dedicado a Toussaint, Beauclair e arredores, com foco em pontos nobres e rotas de DLC.",
    iframeSrc: "https://mapgenie.io/witcher-3/maps/toussaint?embed=light",
    externalUrl: "https://mapgenie.io/witcher-3/maps/toussaint",
    aliases: ["toussaint", "beauclair", "duchy of toussaint"],
    regions: ["toussaint", "beauclair"],
  },
  {
    id: "fablesphere",
    title: "Fablesphere",
    subtitle: "Cenario excepcional, isolado e voltado a uma experiencia especifica.",
    description:
      "Mapa especial para a Fablesphere, util quando a campanha atravessar espacos mais fantásticos.",
    iframeSrc: "https://mapgenie.io/witcher-3/maps/fablesphere?embed=light",
    externalUrl: "https://mapgenie.io/witcher-3/maps/fablesphere",
    aliases: ["fablesphere", "land of a thousand fables"],
    regions: ["fablesphere"],
  },
  {
    id: "isle-of-mists",
    title: "Isle of Mists",
    subtitle: "Area isolada, nebulosa e fortemente roteirizada.",
    description:
      "Mapa especial para momentos pontuais de exploracao em uma area pequena e fechada.",
    iframeSrc: "https://mapgenie.io/witcher-3/maps/isle-of-mists?embed=light",
    externalUrl: "https://mapgenie.io/witcher-3/maps/isle-of-mists",
    aliases: ["isle of mists", "ilha da nevoa", "mists"],
    regions: ["isle-of-mists"],
  },
];

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

  return entry?.id ?? "velen-novigrad";
}
