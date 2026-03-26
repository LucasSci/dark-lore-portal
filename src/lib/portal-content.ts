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

import heroBackground from "@/assets/hero-bg.jpg";
import heroZerrikania from "@/assets/hero-zerrikania.jpg";
import characterIllustration from "@/assets/encyclopedia/character-illustration.svg";
import factionIllustration from "@/assets/encyclopedia/faction-illustration.svg";
import historyIllustration from "@/assets/encyclopedia/history-illustration.svg";
import locationIllustration from "@/assets/encyclopedia/location-illustration.svg";
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
  hero: heroBackground,
  mask: "/chrome/header-frame.png",
  gold: "/textures/parchment-aged.png",
  goldBright: "/chrome/button-frame.png",
  bannerConcert: heroZerrikania,
  bannerRedkit: locationIllustration,
  heroVideo: undefined,
} as const;

export const portalHeroScenes: PortalHeroScene[] = [
  {
    id: "hero-saga",
    eyebrow: "UMA NOVA SAGA SE INICIA",
    sceneLabel: "Cena I · O chamado do continente",
    title: "Areias de Zerrikania",
    description:
      "As cronicas do Veu, os mapas de travessia e a campanha viva se encontram aqui como portas do mesmo arquivo.",
    primaryCta: "Ler o prologo",
    primaryPath: "/universo/cronica-prologo-do-veu",
    secondaryCta: "Explorar o atlas",
    secondaryPath: "/mapa",
    poster: heroBackground,
    thumbnail: heroBackground,
    thumbnailTitle: "O Veu volta a respirar",
    thumbnailBody:
      "Comece pela ferida antiga que colocou o continente em vigilia.",
  },
  {
    id: "hero-chronicles",
    eyebrow: "CRONICAS, DOSSIES E ECOS RECENTES",
    sceneLabel: "Cena II · O arquivo fala primeiro",
    title: "Os capitulos se abrem como trilhas de leitura",
    description:
      "Cada registro do arquivo pode levar a um personagem, a um lugar esquecido ou a um conflito que ainda nao terminou.",
    primaryCta: "Abrir o universo",
    primaryPath: "/universo",
    secondaryCta: "Ver a campanha",
    secondaryPath: "/campanha",
    poster: heroZerrikania,
    thumbnail: heroZerrikania,
    thumbnailTitle: "Rumores, testemunhas e ruinas",
    thumbnailBody:
      "Siga as entradas que ligam o Prologo a Merlin, Nashara e aos vetores de Elarion.",
  },
  {
    id: "hero-systems",
    eyebrow: "ATLAS, MESTRE E RITUAIS DE CRIACAO",
    sceneLabel: "Cena III · Ferramentas do continente",
    title: "Mesa, mestre e campanha seguem o mesmo pulso",
    description:
      "Dos contratos em campo ao preparo do mestre, tudo pode ser retomado sem sair do mesmo clima de estrada, poeira e pressagio.",
    primaryCta: "Entrar na mesa",
    primaryPath: "/mesa",
    secondaryCta: "Painel do mestre",
    secondaryPath: "/mestre",
    poster: characterIllustration,
    thumbnail: characterIllustration,
    thumbnailTitle: "Preparar a proxima noite",
    thumbnailBody:
      "Retome a sessao, organize a cena e volte ao arquivo quando a fogueira baixar.",
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
    title: "Atlas navegavel",
    body: "Regioes, fronteiras e passagens ficam visiveis logo no primeiro olhar.",
  },
  {
    icon: ScrollText,
    title: "Cronicas em fluxo",
    body: "Prologos, capitulos e contratos mantem a campanha em movimento.",
  },
  {
    icon: Users,
    title: "Mesa conectada",
    body: "Personagens, mestre e comunidade continuam puxando a mesma historia.",
  },
];

export const manifestoPanels: PortalFeatureSpec[] = [
  {
    icon: Sparkles,
    title: "Sangue de cronica",
    body: "Cada destaque precisa apontar para uma historia, nao para uma interface explicando a si mesma.",
  },
  {
    icon: Compass,
    title: "Rotas claras",
    body: "Atravessar do hero para atlas, universo ou campanha deve soar natural, como seguir um rastro.",
  },
  {
    icon: Users,
    title: "Continente vivo",
    body: "Personagens, lugares e relatos se cruzam como partes do mesmo mundo em disputa.",
  },
];

export const manifestoQuotes: PortalQuoteSpec[] = [
  {
    quote: "Toda pagina deve soar como pagina arrancada do mesmo tomo.",
    source: "Arquivo do continente",
  },
  {
    quote: "Mapa, cronica e mesa precisam continuar a mesma estrada.",
    source: "Cronicas da campanha",
  },
  {
    quote: "Quando um eco aparece, ele deve levar a algum lugar real do mundo.",
    source: "Memoria dos vigias",
  },
];

export const editorialFallbacks: PortalEditorialEntry[] = [
  {
    id: "fallback-atlas",
    title: "Novas linhas de travessia foram abertas sobre o continente.",
    excerpt:
      "As regioes marcam onde a poeira engrossa, onde as ruinas chamam e onde a campanha pode virar de rumo.",
    location: "Atlas do continente",
    label: "Relatorio",
    updatedAt: "2026-03-18T12:00:00.000Z",
    href: "/mapa",
  },
  {
    id: "fallback-universe",
    title: "O arquivo reuniu os capitulos do Veu em uma nova serie de publicacoes.",
    excerpt:
      "Cada capitulo abre seus nomes citados, suas testemunhas e os rastros que levam aos perfis do universo.",
    location: "Universo",
    label: "Dossie",
    updatedAt: "2026-03-18T18:00:00.000Z",
    href: "/universo",
  },
  {
    id: "fallback-table",
    title: "A mesa foi preparada para receber criaturas, paginas e rotas de batalha.",
    excerpt:
      "Os tabuleiros e frentes de cena permanecem prontos para a proxima sessao da companhia.",
    location: "Mesa virtual",
    label: "Mesa",
    updatedAt: "2026-03-19T08:30:00.000Z",
    href: "/mesa",
  },
  {
    id: "fallback-creation",
    title: "Novos nomes podem ser forjados para a estrada antes da proxima sessao.",
    excerpt:
      "Classe, origem e historico se unem para abrir uma nova ficha dentro do mesmo arquivo.",
    location: "Criacao",
    label: "Ritual",
    updatedAt: "2026-03-19T13:10:00.000Z",
    href: "/criacao",
  },
  {
    id: "fallback-mestre",
    title: "O mestre segue com o comando das cenas, contratos e sinais em campo.",
    excerpt:
      "Notas, NPCs e ganchos de sessao permanecem reunidos para a proxima noite de jogo.",
    location: "Mestre",
    label: "Comando",
    updatedAt: "2026-03-19T17:45:00.000Z",
    href: "/mestre",
  },
];

export const moduleViews: Record<PortalModuleViewKey, PortalModuleView> = {
  exploracao: {
    label: "Exploracao",
    title: "O continente se abre por rotas de leitura, viagem e descoberta.",
    body:
      "Atlas, universo e comunidade funcionam como trilhas complementares para seguir rumores, capitulos e encontros.",
    accent:
      "Quem entra por esta trilha encontra rapido um mapa, um verbete ou um eco de campanha.",
    items: [
      {
        eyebrow: "Atlas do continente",
        title: "Mappa mundi, regioes e passagens de fronteira.",
        description:
          "As rotas mais perigosas do continente podem ser lidas como convite para a proxima jornada.",
        path: "/mapa",
        image: heroBackground,
        imagePosition: "center center",
        icon: Map,
        destination: "atlas",
      },
      {
        eyebrow: "Arquivo do universo",
        title: "Capitulos, personagens e faccoes em dossies ligados entre si.",
        description:
          "Os capitulos do lore levam aos nomes citados, e os verbetes devolvem o leitor para a historia maior.",
        path: "/universo",
        image: historyIllustration,
        imagePosition: "center center",
        icon: Compass,
        destination: "universo",
      },
      {
        eyebrow: "Comunidade",
        title: "Os ecos da campanha continuam circulando fora da mesa.",
        description:
          "Chamados, feitos e rodas de conversa mantem a companhia em movimento entre uma sessao e outra.",
        path: "/comunidade",
        image: factionIllustration,
        imagePosition: "right center",
        icon: Users,
        destination: "comunidade",
      },
    ],
  },
  campanha: {
    label: "Campanha",
    title: "Sessao, preparacao e comando seguem reunidos na mesma frente.",
    body:
      "Cronicas, mesa e mestre ocupam o mesmo campo de leitura para a campanha nao perder o pulso.",
    accent:
      "As tres portas abaixo levam direto para o que move a historia em campo.",
    items: [
      {
        eyebrow: "Cronicas e contratos",
        title: "O arquivo de campanha guarda ecos, contratos e recados de fronteira.",
        description:
          "Cada entrada publicada ajuda a lembrar o que ocorreu, o que falta resolver e quem ainda esta em risco.",
        path: "/campanha",
        image: historyIllustration,
        imagePosition: "center center",
        icon: ScrollText,
        destination: "campanha",
      },
      {
        eyebrow: "Mesa virtual",
        title: "A sessao ao vivo segue pronta para o proximo encontro.",
        description:
          "Battlemap, neblina e iniciativa podem ser retomados sem romper o clima do resto do continente.",
        path: "/mesa",
        image: heroBackground,
        imagePosition: "left center",
        icon: Sword,
        destination: "mesa",
      },
      {
        eyebrow: "Painel do mestre",
        title: "O comando do mestre fica reservado para a proxima decisao dificil.",
        description:
          "NPCs, publicacoes e notas de sessao ficam sob guarda ate a proxima rodada de jogo.",
        path: "/mestre",
        image: characterIllustration,
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
