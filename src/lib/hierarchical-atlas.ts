export type AtlasZoomStage = "world" | "region" | "subregion" | "location" | "battlemap";

export type AtlasLocationType =
  | "city"
  | "village"
  | "dungeon"
  | "ruin"
  | "tradepost"
  | "fortress"
  | "harbor"
  | "wilderness";

export type AtlasPoiType =
  | "tavern"
  | "blacksmith"
  | "temple"
  | "market"
  | "alchemist"
  | "notice-board"
  | "harbor"
  | "hideout";

export type AtlasLayerId =
  | "biomes"
  | "roads"
  | "rivers"
  | "forests"
  | "settlements"
  | "pois"
  | "npcs"
  | "factions"
  | "events"
  | "battlemaps";

export interface AtlasCoordinate {
  x: number;
  y: number;
}

export interface AtlasBounds {
  southWest: AtlasCoordinate;
  northEast: AtlasCoordinate;
}

export interface AtlasPolylineFeature {
  id: string;
  name: string;
  points: AtlasCoordinate[];
  detail?: string;
}

export interface AtlasPolygonFeature {
  id: string;
  name: string;
  points: AtlasCoordinate[];
  detail?: string;
}

export interface AtlasNpc {
  id: string;
  name: string;
  role: string;
  description: string;
}

export interface AtlasShop {
  id: string;
  name: string;
  specialty: string;
  description: string;
}

export interface AtlasQuest {
  id: string;
  title: string;
  status: "rumor" | "active" | "resolved";
  description: string;
}

export interface AtlasPointOfInterest {
  id: string;
  locationId: string;
  type: AtlasPoiType;
  name: string;
  description: string;
  icon: string;
  coordinates: AtlasCoordinate;
}

export interface AtlasBattlemap {
  id: string;
  name: string;
  imageUrl: string;
  gridSize: number;
  scale: number;
  bounds: AtlasBounds;
  linkedLocationId: string;
  description: string;
  rotation?: number;
}

export interface AtlasLocation {
  id: string;
  slug: string;
  subRegionId: string;
  name: string;
  type: AtlasLocationType;
  coordinates: AtlasCoordinate;
  population: string;
  faction: string;
  description: string;
  districts: string[];
  npcs: AtlasNpc[];
  shops: AtlasShop[];
  quests: AtlasQuest[];
  events: string[];
  battlemapId?: string;
  pois: AtlasPointOfInterest[];
}

export interface AtlasSubRegion {
  id: string;
  slug: string;
  regionId: string;
  name: string;
  description: string;
  polygonCoordinates: AtlasCoordinate[];
  terrainType: string;
  biomeType: string;
  climate: string;
  dangerLevel: number;
  roads: AtlasPolylineFeature[];
  rivers: AtlasPolylineFeature[];
  forests: AtlasPolygonFeature[];
  settlements: AtlasCoordinate[];
  secrets: string[];
  events: string[];
  locations: AtlasLocation[];
}

export interface AtlasRegion {
  id: string;
  slug: string;
  name: string;
  description: string;
  polygonCoordinates: AtlasCoordinate[];
  biomeType: string;
  climate: string;
  dangerLevel: number;
  subRegions: AtlasSubRegion[];
}

export interface AtlasWorld {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  bounds: AtlasBounds;
  regions: AtlasRegion[];
  battlemaps: AtlasBattlemap[];
}

export interface AtlasSearchResult {
  id: string;
  label: string;
  kind: "region" | "subregion" | "location" | "poi" | "battlemap";
  path: {
    regionSlug?: string;
    subRegionSlug?: string;
    locationSlug?: string;
  };
  coordinates: AtlasCoordinate;
  description: string;
}

export interface AtlasCluster {
  id: string;
  coordinates: AtlasCoordinate;
  count: number;
  locationIds: string[];
  label: string;
}

export interface AtlasRoutePlan {
  startLocationId: string;
  endLocationId: string;
  path: AtlasCoordinate[];
  distanceKm: number;
  estimatedDays: number;
  risk: "low" | "moderate" | "high";
  commonThreats: string[];
}

export interface AtlasRuntimeState {
  world: AtlasWorld;
  updatedAt: string;
}

export interface AtlasBattlemapTransition {
  battlemapId: string;
  href: string;
  gridSize: number;
  scale: number;
  imageUrl: string;
}

export const ATLAS_STORAGE_KEY = "dark-lore.atlas.world.v1";
export const ATLAS_WORLD_IMAGE_URL = "/maps/witcher-mundi.png?v=20260317-maxnative";

export const LAYERS_BY_STAGE: Record<AtlasZoomStage, AtlasLayerId[]> = {
  world: ["biomes", "rivers", "forests", "settlements"],
  region: ["biomes", "rivers", "forests", "roads", "settlements", "factions"],
  subregion: ["biomes", "rivers", "forests", "roads", "settlements", "events", "pois"],
  location: ["roads", "settlements", "pois", "npcs", "events", "battlemaps"],
  battlemap: ["battlemaps"],
};

function point(x: number, y: number): AtlasCoordinate {
  return { x, y };
}

function line(id: string, name: string, points: AtlasCoordinate[], detail?: string): AtlasPolylineFeature {
  return { id, name, points, detail };
}

function polygon(id: string, name: string, points: AtlasCoordinate[], detail?: string): AtlasPolygonFeature {
  return { id, name, points, detail };
}

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const baseWorld: AtlasWorld = {
  id: "witcher-world",
  name: "Continente conhecido",
  description:
    "Atlas hierarquico do Continente, com regioes, sub-regioes, localidades, POIs e ligacoes de battlemaps jogaveis.",
  imageUrl: ATLAS_WORLD_IMAGE_URL,
  bounds: {
    southWest: point(0, 700),
    northEast: point(1000, 0),
  },
  regions: [
    {
      id: "region-northern-kingdoms",
      slug: "northern-kingdoms",
      name: "Reinos do Norte",
      description: "Corredor central do Continente, dominado por reinos rivais, trilhas de guerra e comercio fluvial.",
      polygonCoordinates: [
        point(210, 120),
        point(640, 100),
        point(760, 245),
        point(710, 410),
        point(410, 470),
        point(220, 345),
      ],
      biomeType: "florestas temperadas e planicies aluviais",
      climate: "temperado umido com invernos pesados",
      dangerLevel: 4,
      subRegions: [],
    },
    {
      id: "region-skellige",
      slug: "skellige",
      name: "Skellige",
      description: "Arquipelago de falesias, clas, portos frios e tempestades constantes.",
      polygonCoordinates: [point(70, 40), point(200, 70), point(250, 190), point(170, 250), point(40, 210)],
      biomeType: "costas frias e montanhas insulares",
      climate: "oceanico severo",
      dangerLevel: 4,
      subRegions: [],
    },
    {
      id: "region-toussaint",
      slug: "toussaint",
      name: "Toussaint",
      description: "Ducado meridional de vinhedos, castelos, torneios e intrigas cortesas.",
      polygonCoordinates: [point(520, 470), point(710, 442), point(810, 514), point(760, 620), point(570, 630), point(495, 560)],
      biomeType: "vales ferteis e colinas ensolaradas",
      climate: "temperado quente",
      dangerLevel: 3,
      subRegions: [],
    },
    {
      id: "region-zerrikania",
      slug: "zerrikania",
      name: "Zerrikania",
      description: "Desertos, corredores de vidro, ruinas ancestrais e cidades fronteira sob sol inclemente.",
      polygonCoordinates: [point(760, 220), point(938, 260), point(972, 466), point(878, 640), point(760, 620), point(690, 452), point(700, 292)],
      biomeType: "deserto, mesas rochosas e oasis raros",
      climate: "arido extremo",
      dangerLevel: 5,
      subRegions: [],
    },
  ],
  battlemaps: [
    {
      id: "battlemap-arena-das-areias",
      name: "Arena das Areias",
      imageUrl: "/maps/battlemaps/arena-das-areias.svg",
      gridSize: 72,
      scale: 1.5,
      bounds: { southWest: point(824, 478), northEast: point(864, 438) },
      linkedLocationId: "location-arena-areias",
      description: "Anfiteatro circular com arquibancadas rachadas, corredores de servico e poco central.",
    },
    {
      id: "battlemap-cripta-velkyn",
      name: "Cripta de Velkyn",
      imageUrl: "/maps/battlemaps/cripta-de-velkyn.svg",
      gridSize: 72,
      scale: 1.5,
      bounds: { southWest: point(748, 586), northEast: point(782, 552) },
      linkedLocationId: "location-velkyn-crypt",
      description: "Cripta subterranea com santuario central, corredores estreitos e camaras secundarias.",
    },
    {
      id: "battlemap-kaer-trolde-harbor",
      name: "Porto de Kaer Trolde",
      imageUrl: "/maps/battlemaps/kaer-trolde-harbor.svg",
      gridSize: 72,
      scale: 1.5,
      bounds: { southWest: point(126, 134), northEast: point(148, 112) },
      linkedLocationId: "location-kaer-trolde",
      description: "Cais, pontes de madeira e passarelas elevadas junto ao salao do cla.",
    },
    {
      id: "battlemap-whispering-crypt",
      name: "Whispering Crypt",
      imageUrl: "/maps/battlemaps/whispering-crypt.svg",
      gridSize: 72,
      scale: 1.5,
      bounds: { southWest: point(544, 484), northEast: point(576, 452) },
      linkedLocationId: "location-whispering-crypt",
      description: "Nivel subterraneo inundado por nevoa com altar quebrado e tuneis estreitos.",
    },
  ],
};

const northernSubRegions: AtlasSubRegion[] = [
  {
    id: "subregion-pontar-redania",
    slug: "pontar-redania",
    regionId: "region-northern-kingdoms",
    name: "Pontar e Redania",
    description: "Bacia do Pontar, centros universitarios e o pulso comercial do norte.",
    polygonCoordinates: [
      point(285, 120),
      point(625, 130),
      point(680, 250),
      point(540, 330),
      point(320, 300),
      point(250, 205),
    ],
    terrainType: "rios largos, rotas comerciais e marismas urbanas",
    biomeType: "planicie fluvial",
    climate: "temperado",
    dangerLevel: 3,
    roads: [
      line("road-novigrad-oxenfurt", "Estrada do Pontar", [point(362, 188), point(420, 214), point(474, 238)]),
      line("road-oxenfurt-brokilon", "Trilha do Manto Verde", [point(474, 238), point(560, 254), point(602, 292)]),
    ],
    rivers: [
      line("river-pontar", "Pontar", [point(286, 152), point(390, 183), point(520, 226), point(635, 266)], "Principal via de comercio do norte."),
    ],
    forests: [
      polygon("forest-brokilon-edge", "Borda de Brokilon", [point(560, 254), point(626, 258), point(656, 312), point(592, 334)]),
    ],
    settlements: [point(362, 188), point(474, 238), point(602, 292)],
    secrets: ["Rotas de contrabandistas sob o Pontar.", "Capelas arruinadas de cultos antigos."],
    events: ["Pressao militar entre Redania e os portos livres.", "Fluxo constante de refugiados vindos do sul."],
    locations: [
      {
        id: "location-novigrad",
        slug: "novigrad",
        subRegionId: "subregion-pontar-redania",
        name: "Novigrad",
        type: "city",
        coordinates: point(362, 188),
        population: "30000+",
        faction: "Conselhos mercantis e cultos urbanos",
        description: "Metropole portuaria com distritos ricos, becos densos e mercado negro pulsando a noite.",
        districts: ["Docas", "Mercado Alto", "Ponte Velha", "Bairro dos Sigilos"],
        npcs: [
          { id: "npc-novigrad-1", name: "Irena Holt", role: "cartografa", description: "Mantem mapas clandestinos das rotas fluviais." },
          { id: "npc-novigrad-2", name: "Bors Lem", role: "capitao de doca", description: "Controla acesso aos ancoradouros particulares." },
        ],
        shops: [
          { id: "shop-novigrad-1", name: "A Balanca de Ambar", specialty: "especiarias e pergaminhos", description: "Mercado de luxo para nobres e magos." },
          { id: "shop-novigrad-2", name: "Arsenal do Corvo", specialty: "armas e reparos", description: "Ferreiro acostumado a vender para cacadores de monstros." },
        ],
        quests: [
          { id: "quest-novigrad-1", title: "Silencio nas docas", status: "active", description: "Carregamentos desaparecem ao longo do Pontar." },
        ],
        events: ["Tensao entre templos e mercadores.", "Execucoes publicas reacendem protestos."],
        pois: [
          { id: "poi-novigrad-1", locationId: "location-novigrad", type: "market", name: "Mercado Alto", description: "Centro de compra de reliquias, ervas e rumores.", icon: "market", coordinates: point(368, 194) },
          { id: "poi-novigrad-2", locationId: "location-novigrad", type: "tavern", name: "Galo de Sal", description: "Taverna favorita de barqueiros e informantes.", icon: "tavern", coordinates: point(358, 184) },
        ],
      },
      {
        id: "location-oxenfurt",
        slug: "oxenfurt",
        subRegionId: "subregion-pontar-redania",
        name: "Oxenfurt",
        type: "city",
        coordinates: point(474, 238),
        population: "12000",
        faction: "Universidade de Oxenfurt",
        description: "Cidade academica murada onde estradas, pontes e debates politicos se cruzam o tempo todo.",
        districts: ["Campus Velho", "Ponte dos Mestres", "Bairro dos Copistas"],
        npcs: [{ id: "npc-oxenfurt-1", name: "Magda Vell", role: "reitora", description: "Protege arquivos proibidos da universidade." }],
        shops: [{ id: "shop-oxenfurt-1", name: "Tintas de Lem", specialty: "livros e mapas", description: "Atende eruditos, diplomatas e espioes." }],
        quests: [{ id: "quest-oxenfurt-1", title: "Provas desaparecidas", status: "rumor", description: "Documentos sobre linhagens antigas sumiram do arquivo." }],
        events: ["Debates sobre neutralidade academica.", "Agentes estrangeiros competem por informacao."],
        pois: [{ id: "poi-oxenfurt-1", locationId: "location-oxenfurt", type: "temple", name: "Arquivo Profundo", description: "Biblioteca subterranea com acesso restrito.", icon: "temple", coordinates: point(478, 242) }],
      },
      {
        id: "location-brokilon-watch",
        slug: "vigia-de-brokilon",
        subRegionId: "subregion-pontar-redania",
        name: "Vigia de Brokilon",
        type: "fortress",
        coordinates: point(602, 292),
        population: "guarnicao reduzida",
        faction: "Batedores fronteiricos",
        description: "Posto avancado para observar trilhas que entram na mata viva de Brokilon.",
        districts: ["Palisada leste", "Patio de vigia"],
        npcs: [{ id: "npc-brokilon-1", name: "Sevrin Kael", role: "batedor", description: "Conhece trilhas que mudam a cada lua." }],
        shops: [{ id: "shop-brokilon-1", name: "Mochila do Batedor", specialty: "mantimentos e cordas", description: "Estoques secos para patrulhas longas." }],
        quests: [{ id: "quest-brokilon-1", title: "Flechas sem origem", status: "active", description: "Patrulheiros somem antes do cair da tarde." }],
        events: ["Sinais de guerra silenciosa na floresta."],
        pois: [{ id: "poi-brokilon-1", locationId: "location-brokilon-watch", type: "hideout", name: "Posto de Vigia", description: "Torre de madeira com visao sobre a mata.", icon: "tower", coordinates: point(606, 296) }],
      },
    ],
  },
  {
    id: "subregion-velen-temeria",
    slug: "velen-temeria",
    regionId: "region-northern-kingdoms",
    name: "Velen e Temeria",
    description: "Planicies devastadas por guerra, aldeias dispersas e fortalezas que tentam manter algum eixo de ordem.",
    polygonCoordinates: [point(250, 300), point(540, 330), point(640, 425), point(470, 510), point(238, 460), point(190, 360)],
    terrainType: "campos alagados, bosques e rotas militares destruidas",
    biomeType: "pantanos e pradarias frias",
    climate: "umido e ventoso",
    dangerLevel: 5,
    roads: [
      line("road-white-crows", "Estrada do Pomar", [point(294, 410), point(382, 394), point(458, 372)]),
      line("road-crows-whispering", "Trilha dos Enforcados", [point(458, 372), point(518, 418), point(560, 470)]),
    ],
    rivers: [line("river-velen-marsh", "Braco Negro", [point(258, 328), point(332, 352), point(404, 386), point(516, 436)])],
    forests: [polygon("forest-crookback", "Mata Torta", [point(470, 388), point(544, 394), point(568, 448), point(504, 470)])],
    settlements: [point(294, 410), point(458, 372), point(560, 470)],
    secrets: ["Capelas enterradas em neblina.", "Rotas de contrabandistas abaixo de pontes quebradas."],
    events: ["Refugiados disputam abrigos fortificados.", "Sinais de necrofagos crescem perto das trilhas."],
    locations: [
      {
        id: "location-white-orchard",
        slug: "white-orchard",
        subRegionId: "subregion-velen-temeria",
        name: "White Orchard",
        type: "village",
        coordinates: point(294, 410),
        population: "900",
        faction: "Camponeses temerianos",
        description: "Vale rural com moinhos, pomares e uma rede de pequenos comerciantes que sustentam viajantes.",
        districts: ["Ponte do Pomar", "Moinho do Sul", "Capela"],
        npcs: [{ id: "npc-white-1", name: "Mira Den", role: "estalajadeira", description: "Serve informacoes em troca de favores discretos." }],
        shops: [{ id: "shop-white-1", name: "Ferraria da Colina", specialty: "ferramentas e armaduras leves", description: "Mantem equipamento para milicias locais." }],
        quests: [{ id: "quest-white-1", title: "Cinzas na capela", status: "rumor", description: "Luzes estranhas surgem apos o por do sol." }],
        events: ["Colheitas fracas pressionam as familias da regiao."],
        pois: [{ id: "poi-white-1", locationId: "location-white-orchard", type: "blacksmith", name: "Ferraria da Colina", description: "Forja principal do vale.", icon: "anvil", coordinates: point(298, 414) }],
      },
      {
        id: "location-crows-perch",
        slug: "crows-perch",
        subRegionId: "subregion-velen-temeria",
        name: "Crow's Perch",
        type: "fortress",
        coordinates: point(458, 372),
        population: "guarnicao e familias deslocadas",
        faction: "Senhores militares locais",
        description: "Fortaleza improvisada sobre ruinas antigas, controlando pontes e impostos regionais.",
        districts: ["Patio de tributos", "Muralha alta", "Vilas de refugiados"],
        npcs: [{ id: "npc-crows-1", name: "Yarek Morn", role: "quartel-mestre", description: "Administra provisoes e contratos suspeitos." }],
        shops: [{ id: "shop-crows-1", name: "Mercado do Bastiao", specialty: "graos, couro e armas usadas", description: "Trocas rapidas entre soldados e mercadores." }],
        quests: [{ id: "quest-crows-1", title: "Pedagio no pantano", status: "active", description: "Bandidos usam o nome da fortaleza para extorquir caravanas." }],
        events: ["Milicias tentam expandir influencia pela regiao."],
        pois: [{ id: "poi-crows-1", locationId: "location-crows-perch", type: "notice-board", name: "Quadro de Contratos", description: "Avisos de cacadas e protecao de comboios.", icon: "scroll", coordinates: point(452, 366) }],
      },
      {
        id: "location-whispering-crypt",
        slug: "whispering-crypt",
        subRegionId: "subregion-velen-temeria",
        name: "Whispering Crypt",
        type: "dungeon",
        coordinates: point(560, 470),
        population: "nenhuma",
        faction: "Ruina antiga",
        description: "Cripta afundada sob nevoa constante, com corredores quebrados e simbolos quase apagados.",
        districts: ["Vestibulo de cinzas", "Galeria rachada", "Nicho do altar"],
        npcs: [{ id: "npc-whispering-1", name: "Ecos do Corredor", role: "presenca espectral", description: "Sussurra nomes esquecidos para atrair exploradores." }],
        shops: [],
        quests: [{ id: "quest-whispering-1", title: "O altar soterrado", status: "active", description: "Uma reliquia enterrada pulsa quando a nevoa sobe." }],
        events: ["Mortos inquietos circulam apos tempestades."],
        battlemapId: "battlemap-whispering-crypt",
        pois: [{ id: "poi-whispering-1", locationId: "location-whispering-crypt", type: "hideout", name: "Entrada quebrada", description: "Brecha entre lapides derrubadas.", icon: "skull", coordinates: point(558, 466) }],
      },
    ],
  },
];

const skelligeSubRegions: AtlasSubRegion[] = [
  {
    id: "subregion-ard-skellig",
    slug: "ard-skellig",
    regionId: "region-skellige",
    name: "Ard Skellig",
    description: "Ilha central com portos grandes, fortalezas de cla e passagens maritimas dificeis.",
    polygonCoordinates: [point(88, 62), point(192, 82), point(222, 154), point(178, 220), point(90, 196), point(64, 120)],
    terrainType: "fiordes, rochedos e trilhas costeiras",
    biomeType: "maritimo alpino",
    climate: "frio, ventoso e chuvoso",
    dangerLevel: 4,
    roads: [line("road-kaer-trolde-svorlag", "Estrada dos Clas", [point(138, 122), point(148, 160), point(162, 194)])],
    rivers: [],
    forests: [polygon("forest-ard-skellig", "Bosque de pinho", [point(110, 110), point(154, 120), point(150, 156), point(118, 150)])],
    settlements: [point(138, 122), point(162, 194)],
    secrets: ["Capelas antigas sob a pedra maritima.", "Passagens secretas entre saloes de cla."],
    events: ["Conselhos de jarls tensionados.", "Saques vindos de ilhas menores."],
    locations: [
      {
        id: "location-kaer-trolde",
        slug: "kaer-trolde",
        subRegionId: "subregion-ard-skellig",
        name: "Kaer Trolde",
        type: "harbor",
        coordinates: point(138, 122),
        population: "porto maior do arquipelago",
        faction: "Cla an Craite",
        description: "Porto monumental que controla entrada, embarques e noticias do arquipelago.",
        districts: ["Cais Principal", "Salao do Cla", "Mercado do Sal"],
        npcs: [{ id: "npc-trolde-1", name: "Signe Tord", role: "mestra de porto", description: "Coordena atracacao, pedagios e boatos navais." }],
        shops: [{ id: "shop-trolde-1", name: "Cordas do Fiorde", specialty: "equipamento naval", description: "Velas, ganchos e mantimentos secos." }],
        quests: [{ id: "quest-trolde-1", title: "Casco fantasma", status: "rumor", description: "Um navio sem tripulacao reaparece em noites de nevoa." }],
        events: ["Jornadas comerciais sob clima instavel."],
        battlemapId: "battlemap-kaer-trolde-harbor",
        pois: [{ id: "poi-trolde-1", locationId: "location-kaer-trolde", type: "harbor", name: "Grande Cais", description: "Coracao do porto e das chegadas.", icon: "anchor", coordinates: point(142, 126) }],
      },
      {
        id: "location-svorlag",
        slug: "svorlag",
        subRegionId: "subregion-ard-skellig",
        name: "Svorlag",
        type: "village",
        coordinates: point(162, 194),
        population: "aldeia de pescadores",
        faction: "Clas locais",
        description: "Aldeia varrida por vento frio, conhecida por peixes secos, reparos e supersticao.",
        districts: ["Ancoradouro", "Casebres do Leste"],
        npcs: [{ id: "npc-svorlag-1", name: "Tora Hjalm", role: "curandeira", description: "Mistura ervas do mar e ossos de baleia." }],
        shops: [{ id: "shop-svorlag-1", name: "Gancho e Sal", specialty: "mantimentos maritimos", description: "Pacotes prontos para viagens curtas." }],
        quests: [{ id: "quest-svorlag-1", title: "Sereias da enseada", status: "active", description: "Cantos estranhos atraem barcos para os rochedos." }],
        events: ["Avistamentos de monstros costeiros."],
        pois: [{ id: "poi-svorlag-1", locationId: "location-svorlag", type: "tavern", name: "Luar de Baleia", description: "Taverna pequena onde cacadores trocam historias.", icon: "tavern", coordinates: point(158, 188) }],
      },
    ],
  },
];

const toussaintSubRegions: AtlasSubRegion[] = [
  {
    id: "subregion-beauclair-marches",
    slug: "beauclair-marches",
    regionId: "region-toussaint",
    name: "Beauclair e Marches",
    description: "Capital ducal, vinhas e estradas cerimoniais conectando feiras e capelas.",
    polygonCoordinates: [point(548, 482), point(700, 464), point(770, 520), point(734, 612), point(574, 614), point(524, 552)],
    terrainType: "vinhedos, pontes de pedra e jardins amuralhados",
    biomeType: "colinas cultivadas",
    climate: "ameno e ensolarado",
    dangerLevel: 2,
    roads: [line("road-beauclair-grove", "Estrada da Colheita", [point(620, 538), point(666, 566), point(718, 592)])],
    rivers: [line("river-sansa", "Sansa", [point(580, 498), point(636, 528), point(706, 560)])],
    forests: [polygon("forest-toussaint", "Bosque do vinho", [point(672, 532), point(734, 548), point(720, 602), point(658, 592)])],
    settlements: [point(620, 538), point(718, 592)],
    secrets: ["Adegas nobres com passagens antigas.", "Capelas escondidas entre parreirais."],
    events: ["Torneios anunciam mudancas de favor na corte."],
    locations: [
      {
        id: "location-beauclair",
        slug: "beauclair",
        subRegionId: "subregion-beauclair-marches",
        name: "Beauclair",
        type: "city",
        coordinates: point(620, 538),
        population: "20000",
        faction: "Corte ducal",
        description: "Capital luxuosa, dividida entre jardins, muralhas e saloes com politica afiada.",
        districts: ["Praca dos Cavaleiros", "Mercado dos Vinhos", "Jardins Altos"],
        npcs: [{ id: "npc-beauclair-1", name: "Lucette Var", role: "mestra de salao", description: "Filtra rumores antes que cheguem aos nobres." }],
        shops: [{ id: "shop-beauclair-1", name: "Casa do Bordado Solar", specialty: "itens finos e pocoes elegantes", description: "Mistura luxo com pequenos servicos alquimicos." }],
        quests: [{ id: "quest-beauclair-1", title: "Mascaras na corte", status: "active", description: "Convites falsificados circulam entre a nobreza." }],
        events: ["Banquetes e jogos diplomaticos escondem rivalidades."],
        pois: [{ id: "poi-beauclair-1", locationId: "location-beauclair", type: "market", name: "Mercado dos Vinhos", description: "Feira aberta com guildas de vinho e especiarias.", icon: "market", coordinates: point(626, 544) }],
      },
      {
        id: "location-golden-grove",
        slug: "golden-grove",
        subRegionId: "subregion-beauclair-marches",
        name: "Golden Grove",
        type: "tradepost",
        coordinates: point(718, 592),
        population: "posto rural",
        faction: "Viticultores e caravaneiros",
        description: "Ponto de encontro entre vinhedos, moinho e hospedaria para caravanas.",
        districts: ["Pomar dourado", "Patio de barris"],
        npcs: [{ id: "npc-grove-1", name: "Cyr Mavin", role: "comerciante", description: "Compra artefatos de estrada por barris raros." }],
        shops: [{ id: "shop-grove-1", name: "Adega do Pinho", specialty: "mantimentos e fermentados", description: "Mercadoria para cacadores, clerigos e patrulhas." }],
        quests: [{ id: "quest-grove-1", title: "Barril roubado", status: "rumor", description: "Uma carga especial sumiu antes da alvorada." }],
        events: ["Feiras semanais atraem oportunistas."],
        pois: [{ id: "poi-grove-1", locationId: "location-golden-grove", type: "market", name: "Feira do Pomar", description: "Venda de barris, couro e ervas.", icon: "market", coordinates: point(712, 586) }],
      },
    ],
  },
];

const zerrikaniaSubRegions: AtlasSubRegion[] = [
  {
    id: "subregion-sands-zerrikania",
    slug: "sands-zerrikania",
    regionId: "region-zerrikania",
    name: "Areias de Zerrikania",
    description: "Faixa de deserto negro, canions e cidades que sobrevivem por rotas comerciais violentas.",
    polygonCoordinates: [point(736, 260), point(926, 288), point(954, 472), point(872, 610), point(758, 594), point(714, 442), point(716, 318)],
    terrainType: "dunas, canions, salares e ruinas de vidro",
    biomeType: "deserto de areia negra",
    climate: "seco e abrasador",
    dangerLevel: 5,
    roads: [
      line("road-nashara-arena", "Estrada dos Mercadores", [point(782, 338), point(816, 392), point(844, 458)]),
      line("road-arena-velkyn", "Vereda das Lajes", [point(844, 458), point(808, 536), point(764, 566)]),
    ],
    rivers: [],
    forests: [],
    settlements: [point(782, 338), point(844, 458), point(764, 566)],
    secrets: ["Ruinas de vidro sussurram durante tempestades.", "Camaras seladas abaixo de obeliscos rachados."],
    events: ["Caravanas desaparecem sob tempestades de areia.", "Faccoes disputam agua e informacao."],
    locations: [
      {
        id: "location-nashara-gate",
        slug: "nashara-gate",
        subRegionId: "subregion-sands-zerrikania",
        name: "Portao de Nashara",
        type: "tradepost",
        coordinates: point(782, 338),
        population: "guarnicao e caravanas",
        faction: "Casas mercantis do deserto",
        description: "Fortim de entrada para rotas zerrikanianas, com armazens de agua, guias e cobradores.",
        districts: ["Portao de pedra", "Patamar dos mercadores", "Patio de caravanas"],
        npcs: [{ id: "npc-nashara-1", name: "Selim Jar", role: "mestre de caravana", description: "Vende acesso a rotas seguras e escoltas caras." }],
        shops: [{ id: "shop-nashara-1", name: "Sombra e Bronze", specialty: "mantimentos, agua e peles", description: "Loja de apoio para longas travessias." }],
        quests: [{ id: "quest-nashara-1", title: "Rastro de areia negra", status: "active", description: "Uma caravana inteira deixou apenas vidro derretido para tras." }],
        events: ["Preco da agua sobe a cada tempestade."],
        pois: [{ id: "poi-nashara-1", locationId: "location-nashara-gate", type: "market", name: "Patio de Caravanas", description: "Centro de contratos, mantimentos e guias.", icon: "market", coordinates: point(788, 344) }],
      },
      {
        id: "location-arena-areias",
        slug: "arena-das-areias",
        subRegionId: "subregion-sands-zerrikania",
        name: "Arena das Areias",
        type: "ruin",
        coordinates: point(844, 458),
        population: "temporaria",
        faction: "Promotores de duelos e casas clandestinas",
        description: "Anfiteatro antigo reaproveitado para torneios, rituais e disputas armadas.",
        districts: ["Arquibancadas quebradas", "Camara dos desafiantes", "Poco central"],
        npcs: [{ id: "npc-arena-1", name: "Marwen Sereh", role: "banqueira da arena", description: "Compra informacao e vende sobrevivencia." }],
        shops: [{ id: "shop-arena-1", name: "Mercado das Laminas", specialty: "armas, reagentes e couro", description: "Banca de campanha montada ao redor dos duelos." }],
        quests: [{ id: "quest-arena-1", title: "O campeao sem rosto", status: "rumor", description: "Um lutador mascarado sempre some antes do amanhecer." }],
        events: ["Apostas clandestinas controlam a regiao."],
        battlemapId: "battlemap-arena-das-areias",
        pois: [{ id: "poi-arena-1", locationId: "location-arena-areias", type: "tavern", name: "Banca do Eclipse", description: "Refresco raro e informacao cara apos os duelos.", icon: "tavern", coordinates: point(850, 462) }],
      },
      {
        id: "location-velkyn-crypt",
        slug: "cripta-de-velkyn",
        subRegionId: "subregion-sands-zerrikania",
        name: "Cripta de Velkyn",
        type: "dungeon",
        coordinates: point(764, 566),
        population: "nenhuma",
        faction: "Ruina selada",
        description: "Complexo funerario soterrado, guardado por fumaca fria e corredores de pedra cantando baixo.",
        districts: ["Anel externo", "Galeria dos nomes", "Santuario afundado"],
        npcs: [{ id: "npc-velkyn-1", name: "Guardiao de Vidro", role: "sentinela arcana", description: "Patrulha a cripta seguindo padroes ritualisticos." }],
        shops: [],
        quests: [{ id: "quest-velkyn-1", title: "As laminas de lua", status: "active", description: "Uma camara secundaria se abriu sob a areia negra." }],
        events: ["Fendas magicas respondem a eclipses."],
        battlemapId: "battlemap-cripta-velkyn",
        pois: [{ id: "poi-velkyn-1", locationId: "location-velkyn-crypt", type: "temple", name: "Porta Sepulcral", description: "Entrada em pedra azul rachada.", icon: "temple", coordinates: point(770, 572) }],
      },
    ],
  },
];

baseWorld.regions[0].subRegions = northernSubRegions;
baseWorld.regions[1].subRegions = skelligeSubRegions;
baseWorld.regions[2].subRegions = toussaintSubRegions;
baseWorld.regions[3].subRegions = zerrikaniaSubRegions;

function cloneWorld<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function syncAtlasRuntimeAssets(world: AtlasWorld) {
  const nextWorld = cloneWorld(world);
  nextWorld.imageUrl = ATLAS_WORLD_IMAGE_URL;
  return nextWorld;
}

function getStorageState(): AtlasRuntimeState | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(ATLAS_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AtlasRuntimeState;
  } catch {
    return null;
  }
}

function persistStorageState(world: AtlasWorld) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    ATLAS_STORAGE_KEY,
    JSON.stringify({
      world,
      updatedAt: new Date().toISOString(),
    } satisfies AtlasRuntimeState),
  );
}

export function loadAtlasWorld() {
  return syncAtlasRuntimeAssets(getStorageState()?.world ?? baseWorld);
}

export function saveAtlasWorld(world: AtlasWorld) {
  persistStorageState(world);
  return cloneWorld(world);
}

export function resetAtlasWorld() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(ATLAS_STORAGE_KEY);
  }

  return cloneWorld(baseWorld);
}

export function getAtlasDefaultLayers(stage: AtlasZoomStage) {
  return [...LAYERS_BY_STAGE[stage]];
}

export function inferAtlasZoomStage(zoom: number): AtlasZoomStage {
  if (zoom < 1.8) return "world";
  if (zoom < 2.9) return "region";
  if (zoom < 4.3) return "subregion";
  if (zoom < 5.6) return "location";
  return "battlemap";
}

export function loadAtlasRegion(world: AtlasWorld, regionSlug?: string | null) {
  return world.regions.find((region) => region.slug === slugify(regionSlug ?? "")) ?? null;
}

export function loadAtlasSubRegion(
  world: AtlasWorld,
  regionSlug?: string | null,
  subRegionSlug?: string | null,
) {
  const region = loadAtlasRegion(world, regionSlug);
  return region?.subRegions.find((entry) => entry.slug === slugify(subRegionSlug ?? "")) ?? null;
}

export function loadAtlasLocation(
  world: AtlasWorld,
  regionSlug?: string | null,
  subRegionSlug?: string | null,
  locationSlug?: string | null,
) {
  const subRegion = loadAtlasSubRegion(world, regionSlug, subRegionSlug);
  return subRegion?.locations.find((entry) => entry.slug === slugify(locationSlug ?? "")) ?? null;
}

export function getAllAtlasLocations(world: AtlasWorld) {
  return world.regions.flatMap((region) =>
    region.subRegions.flatMap((subRegion) => subRegion.locations),
  );
}

export function getAllAtlasPois(world: AtlasWorld) {
  return getAllAtlasLocations(world).flatMap((location) => location.pois);
}

export function getAtlasBattlemapById(world: AtlasWorld, battlemapId?: string | null) {
  return world.battlemaps.find((entry) => entry.id === battlemapId) ?? null;
}

export function searchAtlasWorld(world: AtlasWorld, query: string) {
  const normalizedQuery = slugify(query);

  if (!normalizedQuery) {
    return [] as AtlasSearchResult[];
  }

  const results: AtlasSearchResult[] = [];

  world.regions.forEach((region) => {
    if (`${region.name} ${region.description}`.toLowerCase().includes(query.toLowerCase())) {
      results.push({
        id: region.id,
        label: region.name,
        kind: "region",
        path: { regionSlug: region.slug },
        coordinates: getBoundsCenter(getPolygonBounds(region.polygonCoordinates)),
        description: region.description,
      });
    }

    region.subRegions.forEach((subRegion) => {
      if (`${subRegion.name} ${subRegion.description}`.toLowerCase().includes(query.toLowerCase())) {
        results.push({
          id: subRegion.id,
          label: subRegion.name,
          kind: "subregion",
          path: { regionSlug: region.slug, subRegionSlug: subRegion.slug },
          coordinates: getBoundsCenter(getPolygonBounds(subRegion.polygonCoordinates)),
          description: subRegion.description,
        });
      }

      subRegion.locations.forEach((location) => {
        if (
          `${location.name} ${location.description} ${location.faction}`.toLowerCase().includes(
            query.toLowerCase(),
          )
        ) {
          results.push({
            id: location.id,
            label: location.name,
            kind: "location",
            path: {
              regionSlug: region.slug,
              subRegionSlug: subRegion.slug,
              locationSlug: location.slug,
            },
            coordinates: location.coordinates,
            description: location.description,
          });
        }

        location.pois.forEach((poi) => {
          if (`${poi.name} ${poi.description}`.toLowerCase().includes(query.toLowerCase())) {
            results.push({
              id: poi.id,
              label: poi.name,
              kind: "poi",
              path: {
                regionSlug: region.slug,
                subRegionSlug: subRegion.slug,
                locationSlug: location.slug,
              },
              coordinates: poi.coordinates,
              description: poi.description,
            });
          }
        });
      });
    });
  });

  world.battlemaps.forEach((battlemap) => {
    if (`${battlemap.name} ${battlemap.description}`.toLowerCase().includes(query.toLowerCase())) {
      const linkedLocation = getAllAtlasLocations(world).find(
        (location) => location.id === battlemap.linkedLocationId,
      );
      const focus = linkedLocation
        ? findLocationPath(world, linkedLocation.id)
        : { regionSlug: undefined, subRegionSlug: undefined, locationSlug: undefined };

      results.push({
        id: battlemap.id,
        label: battlemap.name,
        kind: "battlemap",
        path: focus,
        coordinates: getBoundsCenter(battlemap.bounds),
        description: battlemap.description,
      });
    }
  });

  return results.slice(0, 18);
}

export function clusterAtlasLocations(locations: AtlasLocation[], cellSize = 56) {
  const buckets = new Map<string, AtlasCluster>();

  locations.forEach((location) => {
    const bucketX = Math.floor(location.coordinates.x / cellSize);
    const bucketY = Math.floor(location.coordinates.y / cellSize);
    const key = `${bucketX}:${bucketY}`;
    const current = buckets.get(key);

    if (!current) {
      buckets.set(key, {
        id: key,
        coordinates: { ...location.coordinates },
        count: 1,
        locationIds: [location.id],
        label: location.name,
      });
      return;
    }

    current.count += 1;
    current.locationIds.push(location.id);
    current.coordinates = {
      x: (current.coordinates.x * (current.count - 1) + location.coordinates.x) / current.count,
      y: (current.coordinates.y * (current.count - 1) + location.coordinates.y) / current.count,
    };
    current.label = `${current.count} locais`;
  });

  return [...buckets.values()];
}

export function getPolygonBounds(points: AtlasCoordinate[]): AtlasBounds {
  const xs = points.map((pointValue) => pointValue.x);
  const ys = points.map((pointValue) => pointValue.y);

  return {
    southWest: { x: Math.min(...xs), y: Math.max(...ys) },
    northEast: { x: Math.max(...xs), y: Math.min(...ys) },
  };
}

export function getBoundsCenter(bounds: AtlasBounds): AtlasCoordinate {
  return {
    x: (bounds.southWest.x + bounds.northEast.x) / 2,
    y: (bounds.southWest.y + bounds.northEast.y) / 2,
  };
}

export function getAtlasDistance(start: AtlasCoordinate, end: AtlasCoordinate) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  return Math.round(Math.sqrt(dx * dx + dy * dy) * 2.4);
}

export function buildAtlasRoute(world: AtlasWorld, startLocationId: string, endLocationId: string): AtlasRoutePlan | null {
  const locations = getAllAtlasLocations(world);
  const start = locations.find((location) => location.id === startLocationId);
  const end = locations.find((location) => location.id === endLocationId);

  if (!start || !end) {
    return null;
  }

  const distanceKm = getAtlasDistance(start.coordinates, end.coordinates);
  const risk: AtlasRoutePlan["risk"] =
    distanceKm > 400 ? "high" : distanceKm > 180 ? "moderate" : "low";

  return {
    startLocationId,
    endLocationId,
    path: [start.coordinates, end.coordinates],
    distanceKm,
    estimatedDays: Math.max(1, Math.round(distanceKm / 42)),
    risk,
    commonThreats:
      risk === "high"
        ? ["necrofagos", "bandidos", "tempestades", "monstros territoriais"]
        : risk === "moderate"
          ? ["bandidos", "bestas noturnas", "pontes quebradas"]
          : ["clima ruim", "postos hostis"],
  };
}

export function findLocationPath(world: AtlasWorld, locationId: string) {
  for (const region of world.regions) {
    for (const subRegion of region.subRegions) {
      const location = subRegion.locations.find((entry) => entry.id === locationId);

      if (location) {
        return {
          regionSlug: region.slug,
          subRegionSlug: subRegion.slug,
          locationSlug: location.slug,
        };
      }
    }
  }

  return {
    regionSlug: undefined,
    subRegionSlug: undefined,
    locationSlug: undefined,
  };
}

export function getAtlasFocusFromRoute(
  world: AtlasWorld,
  regionSlug?: string | null,
  subRegionSlug?: string | null,
  locationSlug?: string | null,
) {
  const region = loadAtlasRegion(world, regionSlug);
  const subRegion = loadAtlasSubRegion(world, regionSlug, subRegionSlug);
  const location = loadAtlasLocation(world, regionSlug, subRegionSlug, locationSlug);

  return {
    region,
    subRegion,
    location,
  };
}

export function updateRegion(world: AtlasWorld, regionId: string, patch: Partial<AtlasRegion>) {
  const nextWorld = cloneWorld(world);
  nextWorld.regions = nextWorld.regions.map((region) =>
    region.id === regionId ? { ...region, ...patch } : region,
  );
  return saveAtlasWorld(nextWorld);
}

export function addRegion(world: AtlasWorld, region: AtlasRegion) {
  const nextWorld = cloneWorld(world);
  nextWorld.regions.push(region);
  return saveAtlasWorld(nextWorld);
}

export function addSubRegion(world: AtlasWorld, regionId: string, subRegion: AtlasSubRegion) {
  const nextWorld = cloneWorld(world);
  nextWorld.regions = nextWorld.regions.map((region) =>
    region.id === regionId ? { ...region, subRegions: [...region.subRegions, subRegion] } : region,
  );
  return saveAtlasWorld(nextWorld);
}

export function updateSubRegion(world: AtlasWorld, subRegionId: string, patch: Partial<AtlasSubRegion>) {
  const nextWorld = cloneWorld(world);
  nextWorld.regions = nextWorld.regions.map((region) => ({
    ...region,
    subRegions: region.subRegions.map((subRegion) =>
      subRegion.id === subRegionId ? { ...subRegion, ...patch } : subRegion,
    ),
  }));
  return saveAtlasWorld(nextWorld);
}

export function addLocation(world: AtlasWorld, subRegionId: string, location: AtlasLocation) {
  const nextWorld = cloneWorld(world);
  nextWorld.regions = nextWorld.regions.map((region) => ({
    ...region,
    subRegions: region.subRegions.map((subRegion) =>
      subRegion.id === subRegionId
        ? { ...subRegion, locations: [...subRegion.locations, location] }
        : subRegion,
    ),
  }));
  return saveAtlasWorld(nextWorld);
}

export function updateLocation(world: AtlasWorld, locationId: string, patch: Partial<AtlasLocation>) {
  const nextWorld = cloneWorld(world);
  nextWorld.regions = nextWorld.regions.map((region) => ({
    ...region,
    subRegions: region.subRegions.map((subRegion) => ({
      ...subRegion,
      locations: subRegion.locations.map((location) =>
        location.id === locationId ? { ...location, ...patch } : location,
      ),
    })),
  }));
  return saveAtlasWorld(nextWorld);
}

export function addPointOfInterest(world: AtlasWorld, locationId: string, poi: AtlasPointOfInterest) {
  const nextWorld = cloneWorld(world);
  nextWorld.regions = nextWorld.regions.map((region) => ({
    ...region,
    subRegions: region.subRegions.map((subRegion) => ({
      ...subRegion,
      locations: subRegion.locations.map((location) =>
        location.id === locationId ? { ...location, pois: [...location.pois, poi] } : location,
      ),
    })),
  }));
  return saveAtlasWorld(nextWorld);
}

export function addBattlemap(world: AtlasWorld, battlemap: AtlasBattlemap) {
  const nextWorld = cloneWorld(world);
  nextWorld.battlemaps.push(battlemap);
  return saveAtlasWorld(nextWorld);
}

export function updateBattlemap(world: AtlasWorld, battlemapId: string, patch: Partial<AtlasBattlemap>) {
  const nextWorld = cloneWorld(world);
  nextWorld.battlemaps = nextWorld.battlemaps.map((battlemap) =>
    battlemap.id === battlemapId ? { ...battlemap, ...patch } : battlemap,
  );
  return saveAtlasWorld(nextWorld);
}

export function buildAtlasBattlemapTransition(world: AtlasWorld, battlemapId: string): AtlasBattlemapTransition | null {
  const battlemap = getAtlasBattlemapById(world, battlemapId);

  if (!battlemap) {
    return null;
  }

  return {
    battlemapId: battlemap.id,
    href: `/mesa?atlasBattlemap=${battlemap.id}`,
    gridSize: battlemap.gridSize,
    scale: battlemap.scale,
    imageUrl: battlemap.imageUrl,
  };
}

export function getAtlasBattlemapGrid(world: AtlasWorld, battlemapId?: string | null) {
  const battlemap = getAtlasBattlemapById(world, battlemapId);
  return battlemap ? { gridSize: battlemap.gridSize, scale: battlemap.scale } : null;
}

export function getAtlasViewportPolygon(bounds: AtlasBounds) {
  return [
    point(bounds.southWest.x, bounds.northEast.y),
    point(bounds.northEast.x, bounds.northEast.y),
    point(bounds.northEast.x, bounds.southWest.y),
    point(bounds.southWest.x, bounds.southWest.y),
  ];
}

export function getAtlasLayerLabel(layer: AtlasLayerId) {
  const labels: Record<AtlasLayerId, string> = {
    biomes: "Biomas",
    roads: "Estradas",
    rivers: "Rios",
    forests: "Florestas",
    settlements: "Assentamentos",
    pois: "POIs",
    npcs: "NPCs",
    factions: "Faccoes",
    events: "Eventos",
    battlemaps: "Battlemaps",
  };

  return labels[layer];
}

export function getAtlasLocationTypeLabel(type: AtlasLocationType) {
  const labels: Record<AtlasLocationType, string> = {
    city: "Cidade",
    village: "Vila",
    dungeon: "Dungeon",
    ruin: "Ruina",
    tradepost: "Comercio",
    fortress: "Fortaleza",
    harbor: "Porto",
    wilderness: "Ermo",
  };

  return labels[type];
}

export async function readUploadedImageAsDataUrl(file: File) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("Falha ao ler a imagem."));
    reader.readAsDataURL(file);
  });
}
