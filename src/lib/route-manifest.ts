import { matchPath } from "react-router-dom";

import { archiveBrand } from "@/lib/archive-reference";

export type FeatureVisibility = "public" | "internal" | "disabled";
export type ThemeMode = "editorial" | "atlas" | "oracle" | "tabletop" | "session";
export type NavGroup = "primary-left" | "primary-right" | "footer" | "none";

export interface PageMeta {
  title: string;
  description: string;
  ogImage?: string;
  noIndex?: boolean;
  theme: ThemeMode;
}

export interface RouteManifestEntry extends PageMeta {
  path: string;
  label: string;
  visibility: FeatureVisibility;
  navGroup: NavGroup;
  showHeader?: boolean;
  showFooter?: boolean;
}

const defaultEditorial = {
  theme: "editorial",
  showHeader: true,
  showFooter: true,
} as const;

export const routeManifest: RouteManifestEntry[] = [
  {
    path: "/",
    label: "Home",
    title: "Home",
    description:
      "Sands of Zerrikania e o portal oficial de lore dark fantasy do universo, com mundo, personagens, bestiario, cronologia e campanhas.",
    visibility: "public",
    navGroup: "primary-left",
    ...defaultEditorial,
  },
  {
    path: "/mundo",
    label: "O Mundo",
    title: "O Mundo",
    description:
      "Conheca o Veu, o caos, as convergencias, Zerrikania e os Guardioes que sustentam o universo de Sands of Zerrikania.",
    visibility: "public",
    navGroup: "primary-left",
    ...defaultEditorial,
  },
  {
    path: "/personagens",
    label: "Personagens",
    title: "Personagens",
    description:
      "Explore os personagens principais de Sands of Zerrikania em um arquivo narrativo premium.",
    visibility: "public",
    navGroup: "primary-left",
    ...defaultEditorial,
  },
  {
    path: "/personagem/:entrySlug",
    label: "Personagem",
    title: "Personagem",
    description: "Pagina detalhada de um personagem principal de Sands of Zerrikania.",
    visibility: "public",
    navGroup: "none",
    ...defaultEditorial,
  },
  {
    path: "/bestiario",
    label: "Bestiario",
    title: "Bestiario",
    description:
      "Grid de criaturas, filtro por tipo e paginas individuais do bestiario de Sands of Zerrikania.",
    visibility: "public",
    navGroup: "primary-right",
    ...defaultEditorial,
  },
  {
    path: "/criatura/:entrySlug",
    label: "Criatura",
    title: "Criatura",
    description:
      "Pagina individual de criatura com origem, habitat, perigo e curiosidades do bestiario.",
    visibility: "public",
    navGroup: "none",
    ...defaultEditorial,
  },
  {
    path: "/cronologia",
    label: "Cronologia",
    title: "Cronologia",
    description:
      "Linha do tempo narrativa organizada pelas eras do Veu, convergencias e do deserto sangrando.",
    visibility: "public",
    navGroup: "primary-right",
    ...defaultEditorial,
  },
  {
    path: "/campanhas",
    label: "Campanhas",
    title: "Campanhas",
    description:
      "Portal de campanhas de Sands of Zerrikania com destaque para o arco narrativo atual.",
    visibility: "public",
    navGroup: "primary-right",
    ...defaultEditorial,
  },
  {
    path: "/campanha/:campaignSlug",
    label: "Campanha",
    title: "Campanha",
    description:
      "Pagina detalhada da campanha atual com sinopse, personagens, locais importantes e eventos.",
    visibility: "public",
    navGroup: "none",
    ...defaultEditorial,
  },

  {
    path: "/universo/:entrySlug",
    label: "Universo",
    title: "Universo",
    description: "Rota legada do portal anterior.",
    visibility: "internal",
    navGroup: "none",
    noIndex: true,
    ...defaultEditorial,
  },
  {
    path: "/universo",
    label: "Universo",
    title: "Universo",
    description: "Rota legada do portal anterior.",
    visibility: "internal",
    navGroup: "none",
    noIndex: true,
    ...defaultEditorial,
  },
  {
    path: "/cronicas",
    label: "Cronicas",
    title: "Cronicas",
    description: "Rota legada do portal anterior.",
    visibility: "internal",
    navGroup: "none",
    noIndex: true,
    ...defaultEditorial,
  },
  {
    path: "/cronicas/:entrySlug",
    label: "Cronicas",
    title: "Cronicas",
    description: "Rota legada do portal anterior.",
    visibility: "internal",
    navGroup: "none",
    noIndex: true,
    ...defaultEditorial,
  },
  {
    path: "/campanha",
    label: "Campanha",
    title: "Campanha",
    description: "Rota legada do portal anterior.",
    visibility: "internal",
    navGroup: "none",
    noIndex: true,
    ...defaultEditorial,
  },
  {
    path: "/bestiario/:entrySlug",
    label: "Bestiario",
    title: "Criatura",
    description: "Alias legado para pagina individual de criatura.",
    visibility: "internal",
    navGroup: "none",
    noIndex: true,
    ...defaultEditorial,
  },

  {
    path: "/jogar/oraculo",
    label: "Oraculo",
    title: "Oraculo do Arquivo",
    description:
      "Consulte Luna para leitura ritual, resposta guiada e acesso direto aos registros do arquivo.",
    visibility: "internal",
    navGroup: "none",
    noIndex: true,
    theme: "oracle",
    showHeader: false,
    showFooter: false,
  },
  {
    path: "/oraculo",
    label: "Oraculo",
    title: "Oraculo do Arquivo",
    description: "Experiencia completa de Luna, com leitura continua e consulta ao arquivo.",
    visibility: "internal",
    navGroup: "none",
    noIndex: true,
    theme: "oracle",
    showHeader: false,
    showFooter: false,
  },
  {
    path: "/luna",
    label: "Luna",
    title: "Luna",
    description: "Acesso direto ao oraculo do arquivo em experiencia integral.",
    visibility: "internal",
    navGroup: "none",
    noIndex: true,
    theme: "oracle",
    showHeader: false,
    showFooter: false,
  },
  {
    path: "/jogar",
    label: "Jogar",
    title: "Jogar",
    description:
      "Entre na sessao, abra a mesa, consulte o oraculo e revise fichas a partir do mesmo hub.",
    visibility: "internal",
    navGroup: "none",
    theme: "session",
    showHeader: true,
    showFooter: false,
  },
  {
    path: "/mesa",
    label: "Mesa",
    title: "Mesa de Sessao",
    description: "Ambiente tatico para conduzir a sessao, organizar cena, iniciativa e presenca.",
    visibility: "internal",
    navGroup: "none",
    noIndex: true,
    theme: "tabletop",
    showHeader: false,
    showFooter: false,
  },
  {
    path: "/mesa/:campaignId",
    label: "Mesa",
    title: "Mesa de Campanha",
    description: "Ambiente tatico multiplayer conectado a uma campanha do Continente.",
    visibility: "internal",
    navGroup: "none",
    noIndex: true,
    theme: "tabletop",
    showHeader: false,
    showFooter: false,
  },
  {
    path: "/mesa/:campaignId/:sceneId",
    label: "Cena",
    title: "Cena de Campanha",
    description: "Palco tatico de uma cena especifica, com compendio, rolagens e presenca sincronizada.",
    visibility: "internal",
    navGroup: "none",
    noIndex: true,
    theme: "tabletop",
    showHeader: false,
    showFooter: false,
  },
  {
    path: "/mapa/regional/:mapId",
    label: "Mapa Regional",
    title: "Carta Regional",
    description: "Explore uma carta regional ligada ao atlas do Continente.",
    visibility: "internal",
    navGroup: "none",
    noIndex: true,
    theme: "atlas",
    showHeader: true,
    showFooter: false,
  },
  {
    path: "/mapa/:regionSlug/:subRegionSlug/:locationSlug",
    label: "Local",
    title: "Local do Atlas",
    description: "Leitura localizada do atlas com vinculos para dossies, rotas e sessao.",
    visibility: "internal",
    navGroup: "none",
    noIndex: true,
    theme: "atlas",
    showHeader: true,
    showFooter: false,
  },
  {
    path: "/mapa/:regionSlug/:subRegionSlug",
    label: "Sub-regiao",
    title: "Sub-regiao do Atlas",
    description: "Camada intermediaria do atlas, conectando regiao, local e rota.",
    visibility: "internal",
    navGroup: "none",
    noIndex: true,
    theme: "atlas",
    showHeader: true,
    showFooter: false,
  },
  {
    path: "/mapa/:regionSlug",
    label: "Regiao",
    title: "Regiao do Atlas",
    description: "Navegue por uma regiao do Continente com contexto ligado ao arquivo.",
    visibility: "internal",
    navGroup: "none",
    noIndex: true,
    theme: "atlas",
    showHeader: true,
    showFooter: false,
  },
  {
    path: "/mapa",
    label: "Mapa",
    title: "Mapa",
    description:
      "Abra o atlas do Continente, desca por cartas regionais e cruze rotas com verbetes e sessao.",
    visibility: "internal",
    navGroup: "none",
    noIndex: true,
    theme: "atlas",
    showHeader: true,
    showFooter: true,
  },
  {
    path: "/contato",
    label: "Contato",
    title: "Contato",
    description: "Canal de correspondencia do arquivo para registros, propostas e contato direto.",
    visibility: "internal",
    navGroup: "none",
    noIndex: true,
    ...defaultEditorial,
  },
  {
    path: "/comunidade",
    label: "Comunidade",
    title: "Comunidade",
    description: "Area interna de ecos, relatos e trocas entre leitores, jogadores e mestres.",
    visibility: "internal",
    navGroup: "none",
    noIndex: true,
    ...defaultEditorial,
  },
  {
    path: "/loja",
    label: "Loja",
    title: "Loja",
    description: "Area interna de itens e selecoes do arquivo.",
    visibility: "internal",
    navGroup: "none",
    noIndex: true,
    ...defaultEditorial,
  },
  {
    path: "/conta",
    label: "Conta",
    title: "Conta",
    description: "Area interna para identidade, acesso e preferencias do arquivo.",
    visibility: "internal",
    navGroup: "none",
    noIndex: true,
    ...defaultEditorial,
  },
  {
    path: "/criacao",
    label: "Criacao",
    title: "Criacao",
    description: "Ferramenta interna para criacao de personagens e registros.",
    visibility: "internal",
    navGroup: "none",
    noIndex: true,
    theme: "session",
    showHeader: true,
    showFooter: false,
  },
  {
    path: "/ficha",
    label: "Ficha",
    title: "Ficha",
    description: "Ferramenta interna de ficha, recursos e acompanhamento de sessao.",
    visibility: "internal",
    navGroup: "none",
    noIndex: true,
    theme: "session",
    showHeader: true,
    showFooter: false,
  },
  {
    path: "/ficha/:sheetId",
    label: "Ficha",
    title: "Ficha de Personagem",
    description: "Dossie de personagem ligado ao sistema Witcher TRPG.",
    visibility: "internal",
    navGroup: "none",
    noIndex: true,
    theme: "session",
    showHeader: true,
    showFooter: false,
  },
  {
    path: "/mestre",
    label: "Mestre",
    title: "Painel do Mestre",
    description: "Ferramenta interna para conducao de sessao, controle de cena e notas do mestre.",
    visibility: "internal",
    navGroup: "none",
    noIndex: true,
    theme: "session",
    showHeader: true,
    showFooter: false,
  },
  {
    path: "/story-engine",
    label: "Story Engine",
    title: "Story Engine",
    description: "Workspace interno para transformar texto em elenco, cenas e storyboard ligados a campanha.",
    visibility: "internal",
    navGroup: "none",
    noIndex: true,
    theme: "session",
    showHeader: true,
    showFooter: false,
  },
  {
    path: "/story-engine/:projectId",
    label: "Story Engine",
    title: "Projeto do Story Engine",
    description: "Projeto interno do Story Engine com analise, referencias e storyboard de producao.",
    visibility: "internal",
    navGroup: "none",
    noIndex: true,
    theme: "session",
    showHeader: true,
    showFooter: false,
  },
];

export function resolveRouteManifest(pathname: string) {
  return (
    routeManifest.find((entry) =>
      Boolean(
        matchPath(
          {
            path: entry.path,
            end: true,
          },
          pathname,
        ),
      ),
    ) ?? null
  );
}

export function getNavigationEntries(group: NavGroup) {
  return routeManifest.filter(
    (entry) => entry.visibility === "public" && entry.navGroup === group,
  );
}

export function getFooterEntries() {
  return routeManifest.filter(
    (entry) =>
      entry.visibility === "public" &&
      entry.path !== "/" &&
      entry.navGroup !== "none" &&
      !entry.path.includes(":"),
  );
}

export function buildDocumentTitle(title: string) {
  return title === "Home" ? archiveBrand.title : `${title} | ${archiveBrand.title}`;
}
