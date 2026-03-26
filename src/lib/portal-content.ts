import {
  BookOpenText,
  Compass,
  Flame,
  Map,
  type LucideIcon,
  ScrollText,
  Shield,
  Sparkles,
  Sword,
  Users,
} from "lucide-react";

// Dark Lore Portal - Assets externos
const darkFantasyArchive = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Dark_fantasy_archive_202603261340-AEAC2u1N5Pqt88hzQ1DFnnjvDKqehy.jpeg";
const creatureArchiveChamber = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Creature_archive_chamber_202603261340-u2nZboDvjllbMKiqKVRbnlrIfhD704.jpeg";
const loneWanderer = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Lone_wanderer_in_202603261340-yT7oDA9kTDAUzZdS4jCG7s3H9MTjNU.jpeg";
const darkFantasyForgotten = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dark_fantasy_forgotten_202603261340-QhRD5besx3eFTVhYC72COdor80LeMX.jpeg";
const occultDesk = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Occult_desk_with_202603261340-ONjeZ0L3bOwKFj885bfVpCcL8eLBvs.jpeg";
const gothicRitualSymbol = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Gothic_ritual_symbol_202603261340-kzvAt1efPqFlvpJiAmY8uvQLUAS6WK.jpeg";
const darkLorePortalLogo = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Dark_Lore_Portal_202603261340-tFiL0GwQKsqU9W5MgxKjLQtCvhoO0s.jpeg";
const gothicFlourish = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Gothic_flourish_divider_202603261340-wnSifBidSx2WXYHomTpeOxecUcF4IM.jpeg";
const heroFrame = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/moldura_hero_principal.png_202603261340-WPvSCUuI6ZolJrzm0YMHW6IiP1bPnb.jpeg";
const cardFrame = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/moldura_de_card.png_202603261340-ieddw6KR7I5m13R3mZ95rOC2fHLrQ3.jpeg";
const cornerOrnament = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cantos_ornamentais.png_202603261340-pu2SDbcVqe9wDZHZ4SA6mSaSc7sKlk.jpeg";
const parchmentTexture = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Parchment_texture_with_202603261340-FdBJuRgbfqJSJ5irE9YHjbBY0MPQzZ.jpeg";
const emberParticles = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Ember_particles_glowing_202603261340-x3A77UI3JnkYJBbviVNIivGFXbmIBg.jpeg";
const smokeOverlay = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Soft_dark_smoke_202603261340-ilvltwcEkyXGxFxE2UG2N6INDZpJ6d.jpeg";
const gothicCornerOrnament = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Gothic_corner_ornament_202603261340-F8s2LUEpDAw9lV2QbKIsocT7tL9ngp.jpeg";
import type { CampaignPublication } from "@/lib/publications";

export type PortalFeatureSpec = {
  icon: LucideIcon;
  title: string;
  body: string;
};

export type PortalQuoteSpec = {
  quote: string;
  source: string;
};

export type PortalEditorialEntry = {
  id: string;
  title: string;
  excerpt: string;
  location: string;
  label: string;
  updatedAt: string;
  href: string;
};

export type PortalModuleViewKey = "exploracao" | "campanha";

export type PortalModuleCardSpec = {
  eyebrow: string;
  title: string;
  description: string;
  path: string;
  image: string;
  imagePosition?: string;
  icon: LucideIcon;
  destination: "atlas" | "universo" | "comunidade" | "campanha" | "mesa" | "mestre";
};

export type PortalModuleView = {
  label: string;
  title: string;
  body: string;
  accent: string;
  items: [PortalModuleCardSpec, PortalModuleCardSpec, PortalModuleCardSpec];
};

export type PortalPromoBannerSpec = {
  eyebrow: string;
  title: string;
  body: string;
  path: string;
  image: string;
  imagePosition?: string;
  icon: LucideIcon;
  cta: string;
  destination: "mesa" | "criacao";
};

export type PortalHeroScene = {
  id: string;
  eyebrow: string;
  sceneLabel: string;
  title: string;
  description: string;
  primaryCta: string;
  primaryPath: string;
  secondaryCta: string;
  secondaryPath: string;
  poster: string;
  video?: string;
  thumbnail: string;
  thumbnailTitle: string;
  thumbnailBody: string;
};

export const portalReferenceArt = {
  hero: darkFantasyArchive,
  mask: heroFrame,
  gold: parchmentTexture,
  goldBright: cardFrame,
  bannerConcert: occultDesk,
  bannerRedkit: loneWanderer,
  heroVideo: undefined,
  logo: darkLorePortalLogo,
  divider: gothicFlourish,
  corner: cornerOrnament,
  cornerGothic: gothicCornerOrnament,
  ember: emberParticles,
  smoke: smokeOverlay,
  symbol: gothicRitualSymbol,
} as const;

export const portalHeroScenes: PortalHeroScene[] = [
  {
    id: "hero-saga",
    eyebrow: "OS PORTAIS SE ABREM",
    sceneLabel: "Cena I · O chamado das sombras",
    title: "Dark Lore Portal",
    description:
      "Um arquivo vivo de conhecimento proibido, bestiarios ancestrais e cronicas esquecidas aguarda aqueles que ousam adentrar.",
    primaryCta: "Explorar o bestiario",
    primaryPath: "/universo/bestiario",
    secondaryCta: "Ver o atlas",
    secondaryPath: "/mapa",
    poster: darkFantasyArchive,
    thumbnail: darkFantasyArchive,
    thumbnailTitle: "O Arquivo Desperta",
    thumbnailBody:
      "Adentre a biblioteca proibida onde segredos ancestrais aguardam.",
  },
  {
    id: "hero-chronicles",
    eyebrow: "CRONICAS DAS TREVAS",
    sceneLabel: "Cena II · Ecos do abismo",
    title: "Cada pagina guarda um segredo maldito",
    description:
      "Registros antigos revelam criaturas esquecidas, rituais proibidos e verdades que deveriam permanecer ocultas.",
    primaryCta: "Ler as cronicas",
    primaryPath: "/universo",
    secondaryCta: "Ver a campanha",
    secondaryPath: "/campanha",
    poster: creatureArchiveChamber,
    thumbnail: creatureArchiveChamber,
    thumbnailTitle: "Bestas e Abominacoes",
    thumbnailBody:
      "O catalogo de horrores cresce a cada lua negra que passa.",
  },
  {
    id: "hero-systems",
    eyebrow: "RITUAIS E FERRAMENTAS",
    sceneLabel: "Cena III · O circulo se completa",
    title: "Forje seu destino nas chamas do conhecimento",
    description:
      "Mesa virtual, criacao de personagens e ferramentas do mestre convergem para dar vida as historias mais sombrias.",
    primaryCta: "Abrir a mesa",
    primaryPath: "/mesa",
    secondaryCta: "Painel do mestre",
    secondaryPath: "/mestre",
    poster: occultDesk,
    thumbnail: occultDesk,
    thumbnailTitle: "O Circulo do Mestre",
    thumbnailBody:
      "Prepare rituais, invoque criaturas e conduza a narrativa.",
  },
] as const;

export const campaignPublicationLabel: Record<CampaignPublication["kind"], string> = {
  cronica: "Cronica",
  contrato: "Contrato",
  rumor: "Rumor",
  relatorio: "Relatorio",
};

export const portalEmberSpecs = [
  { left: "8%", top: "16%", size: 5, delay: 0.1, duration: 11 },
  { left: "16%", top: "72%", size: 4, delay: 1.1, duration: 12.5 },
  { left: "29%", top: "34%", size: 3, delay: 0.4, duration: 8.6 },
  { left: "44%", top: "12%", size: 5, delay: 1.6, duration: 13 },
  { left: "55%", top: "68%", size: 4, delay: 0.8, duration: 10.4 },
  { left: "67%", top: "24%", size: 3, delay: 1.4, duration: 9.8 },
  { left: "79%", top: "44%", size: 4, delay: 0.3, duration: 10.8 },
  { left: "88%", top: "77%", size: 5, delay: 1.2, duration: 12.2 },
] as const;

export const heroSignals: PortalFeatureSpec[] = [
  {
    icon: Map,
    title: "Bestiario Vivo",
    body: "Criaturas, abominacoes e entidades catalogadas em detalhes sombrios.",
  },
  {
    icon: ScrollText,
    title: "Cronicas Ancestrais",
    body: "Historias proibidas, rituais esquecidos e segredos revelados.",
  },
  {
    icon: Users,
    title: "Circulo de Mestres",
    body: "Ferramentas para conduzir campanhas nas profundezas do desconhecido.",
  },
];

export const manifestoPanels: PortalFeatureSpec[] = [
  {
    icon: Sparkles,
    title: "Conhecimento Oculto",
    body: "Cada entrada revela fragmentos de sabedoria proibida, nunca mera decoracao.",
  },
  {
    icon: Compass,
    title: "Trilhas nas Trevas",
    body: "Navegue do bestiario aos rituais, das cronicas aos mapas malditos.",
  },
  {
    icon: Users,
    title: "Mundo em Ruinas",
    body: "Criaturas, lugares e lendas se entrelaçam num universo de horror e maravilha.",
  },
];

export const manifestoQuotes: PortalQuoteSpec[] = [
  {
    quote: "Nas sombras mais profundas, a verdade aguarda aqueles que nao temem olhar.",
    source: "Grimorio dos Ancestrais",
  },
  {
    quote: "Cada criatura catalogada e um aviso; cada ritual, uma porta que nao deveria ser aberta.",
    source: "Bestiario Proibido",
  },
  {
    quote: "O conhecimento tem seu preco, e as trevas sempre cobram o devido.",
    source: "Cronicas da Noite Eterna",
  },
];

export const editorialFallbacks: PortalEditorialEntry[] = [
  {
    id: "fallback-atlas",
    title: "Novas rotas foram mapeadas atraves de terras corrompidas.",
    excerpt:
      "Regioes esquecidas, ruinas ancestrais e passagens para dimensoes sombrias foram catalogadas.",
    location: "Atlas das Sombras",
    label: "Mapeamento",
    updatedAt: "2026-03-18T12:00:00.000Z",
    href: "/mapa",
  },
  {
    id: "fallback-universe",
    title: "Novas criaturas foram adicionadas ao Bestiario Proibido.",
    excerpt:
      "Cada entrada revela fraquezas, habitos de caca e o preco de enfrentar tais aberracoes.",
    location: "Bestiario",
    label: "Catalogo",
    updatedAt: "2026-03-18T18:00:00.000Z",
    href: "/universo",
  },
  {
    id: "fallback-table",
    title: "A mesa de rituais foi preparada para a proxima invocacao.",
    excerpt:
      "Mapas taticos, iniciativa e atmosfera sombria aguardam a proxima sessao.",
    location: "Mesa Virtual",
    label: "Ritual",
    updatedAt: "2026-03-19T08:30:00.000Z",
    href: "/mesa",
  },
  {
    id: "fallback-creation",
    title: "Novos herois podem ser invocados das profundezas.",
    excerpt:
      "Classe, origem e pactos sombrios se unem para criar personagens marcados pelo destino.",
    location: "Invocacao",
    label: "Criacao",
    updatedAt: "2026-03-19T13:10:00.000Z",
    href: "/criacao",
  },
  {
    id: "fallback-mestre",
    title: "O Circulo do Mestre foi atualizado com novos segredos.",
    excerpt:
      "NPCs, encontros e geradores de horror aguardam para serem desencadeados na proxima sessao.",
    location: "Circulo do Mestre",
    label: "Ferramentas",
    updatedAt: "2026-03-19T17:45:00.000Z",
    href: "/mestre",
  },
];

export const moduleViews: Record<PortalModuleViewKey, PortalModuleView> = {
  exploracao: {
    label: "Exploracao",
    title: "As trevas se revelam para aqueles que sabem onde olhar.",
    body:
      "Bestiario, atlas e arquivo formam o triplo caminho do conhecimento proibido.",
    accent:
      "Cada entrada abre portas para criaturas, lugares malditos e segredos ancestrais.",
    items: [
      {
        eyebrow: "Atlas das Sombras",
        title: "Mapas de reinos esquecidos e terras corrompidas.",
        description:
          "Rotas perigosas, ruinas ancestrais e portais para dimensoes sombrias.",
        path: "/mapa",
        image: loneWanderer,
        imagePosition: "center center",
        icon: Map,
        destination: "atlas",
      },
      {
        eyebrow: "Bestiario Proibido",
        title: "Catalogo de criaturas, demônios e aberracoes.",
        description:
          "Cada entrada revela fraquezas, habitos e o preco de enfrentar tais horrores.",
        path: "/universo",
        image: creatureArchiveChamber,
        imagePosition: "center center",
        icon: Compass,
        destination: "universo",
      },
      {
        eyebrow: "Circulo Oculto",
        title: "A comunidade dos que buscam conhecimento nas trevas.",
        description:
          "Compartilhe descobertas, teorias e advertências com outros exploradores.",
        path: "/comunidade",
        image: gothicRitualSymbol,
        imagePosition: "center center",
        icon: Users,
        destination: "comunidade",
      },
    ],
  },
  campanha: {
    label: "Campanha",
    title: "A mesa se prepara para rituais de narrativa sombria.",
    body:
      "Cronicas, mesa virtual e ferramentas do mestre convergem para campanhas memoraveis.",
    accent:
      "Tres portais conduzem ao coracao da experiencia de jogo.",
    items: [
      {
        eyebrow: "Cronicas das Trevas",
        title: "O arquivo guarda cada sessao, cada decisao, cada consequência.",
        description:
          "Relatos de campanha, contratos cumpridos e segredos ainda por desvendar.",
        path: "/campanha",
        image: darkFantasyForgotten,
        imagePosition: "center center",
        icon: ScrollText,
        destination: "campanha",
      },
      {
        eyebrow: "Mesa Virtual",
        title: "O campo de batalha aguarda sob a luz de velas.",
        description:
          "Mapas taticos, iniciativa e atmosfera sombria para suas sessoes.",
        path: "/mesa",
        image: darkFantasyArchive,
        imagePosition: "left center",
        icon: Sword,
        destination: "mesa",
      },
      {
        eyebrow: "Circulo do Mestre",
        title: "Ferramentas para tecer historias de horror e maravilha.",
        description:
          "NPCs, encontros, geradores e o controle total da narrativa.",
        path: "/mestre",
        image: occultDesk,
        imagePosition: "center center",
        icon: Shield,
        destination: "mestre",
      },
    ],
  },
};

export const bulletinPanels: PortalFeatureSpec[] = [
  {
    icon: ScrollText,
    title: "Rumores novos",
    body: "Veja o que entrou no arquivo antes da proxima fogueira acender.",
  },
  {
    icon: BookOpenText,
    title: "Rotas do arquivo",
    body: "Capitulos, dossies e rotas se respondem como parte do mesmo continente.",
  },
  {
    icon: Flame,
    title: "Campanha ativa",
    body: "Conta, mesa e comunidade apontam sempre para a proxima frente de historia.",
  },
];

export const promoBanners: PortalPromoBannerSpec[] = [
  {
    eyebrow: "Mesa virtual",
    title: "Leve a sessao para um palco de batalha digno do continente.",
    body:
      "Abra a cena, espalhe a neblina e puxe os monstros do codex quando a trilha ficar hostil.",
    path: "/mesa",
    image: heroBackground,
    imagePosition: "center center",
    icon: Sword,
    cta: "Abrir a mesa",
    destination: "mesa",
  },
  {
    eyebrow: "Criacao + mestre",
    title: "Forje personagens e prepare a proxima sessao sem sair do mesmo tomo.",
    body:
      "Abra novas fichas, revise NPCs e mantenha o arquivo pronto para a proxima rodada de eventos.",
    path: "/criacao",
    image: characterIllustration,
    imagePosition: "center center",
    icon: Shield,
    cta: "Forjar personagem",
    destination: "criacao",
  },
];
