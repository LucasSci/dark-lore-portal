import { matchPath } from "react-router-dom";

import { archiveBrand } from "@/lib/archive-reference";

export type FeatureVisibility = "public" | "internal" | "disabled";
export type ThemeMode = "editorial" | "atlas" | "oracle" | "tabletop";
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
    label: "Inicio",
    title: "Inicio",
    description:
      "Arquivo do Continente reune bestiario, cronicas, cartografia e sessoes em torno de Areias de Zerrikania.",
    visibility: "public",
    navGroup: "primary-left",
    ...defaultEditorial,
  },
  {
    path: "/universo/:entrySlug",
    label: "Universo",
    title: "Dossie do Universo",
    description: "Perfis, verbetes e relacoes do Continente reunidos sob o selo do arquivo.",
    visibility: "public",
    navGroup: "none",
    ...defaultEditorial,
  },
  {
    path: "/universo",
    label: "Universo",
    title: "Universo",
    description:
      "Explore reinos, personagens, faccoes, lugares e eventos ligados a Areias de Zerrikania.",
    visibility: "public",
    navGroup: "primary-left",
    ...defaultEditorial,
  },
  {
    path: "/bestiario/:entrySlug",
    label: "Bestiario",
    title: "Ficha de Criatura",
    description:
      "Consulte sinais, fraquezas, habitats e relatos de caca preservados no bestiario do arquivo.",
    visibility: "public",
    navGroup: "none",
    ...defaultEditorial,
  },
  {
    path: "/bestiario",
    label: "Bestiario",
    title: "Bestiario",
    description: "Criaturas, entidades e horrores catalogados em dossies de caca e observacao.",
    visibility: "public",
    navGroup: "primary-left",
    ...defaultEditorial,
  },
  {
    path: "/cronicas",
    label: "Cronicas",
    title: "Cronicas",
    description:
      "Leia capitulos, relatos de estrada e manuscritos ligados ao arquivo de Areias de Zerrikania.",
    visibility: "public",
    navGroup: "primary-left",
    ...defaultEditorial,
  },
  {
    path: "/cronicas/:entrySlug",
    label: "Cronicas",
    title: "Manuscrito",
    description:
      "Leitura integral de um manuscrito do arquivo, com mencoes conectadas e trilha editorial continua.",
    visibility: "public",
    navGroup: "none",
    ...defaultEditorial,
  },
  {
    path: "/campanha",
    label: "Campanha",
    title: "Campanha",
    description: "Entrada legada para as cronicas principais do arquivo.",
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
    visibility: "public",
    navGroup: "primary-right",
    ...defaultEditorial,
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
    path: "/mapa/regional/:mapId",
    label: "Mapa Regional",
    title: "Carta Regional",
    description: "Explore uma carta regional ligada ao atlas do Continente.",
    visibility: "public",
    navGroup: "none",
    theme: "atlas",
    showHeader: true,
    showFooter: false,
  },
  {
    path: "/mapa/:regionSlug/:subRegionSlug/:locationSlug",
    label: "Local",
    title: "Local do Atlas",
    description: "Leitura localizada do atlas com vinculos para dossies, rotas e sessao.",
    visibility: "public",
    navGroup: "none",
    theme: "atlas",
    showHeader: true,
    showFooter: false,
  },
  {
    path: "/mapa/:regionSlug/:subRegionSlug",
    label: "Sub-regiao",
    title: "Sub-regiao do Atlas",
    description: "Camada intermediaria do atlas, conectando regiao, local e rota.",
    visibility: "public",
    navGroup: "none",
    theme: "atlas",
    showHeader: true,
    showFooter: false,
  },
  {
    path: "/mapa/:regionSlug",
    label: "Regiao",
    title: "Regiao do Atlas",
    description: "Navegue por uma regiao do Continente com contexto ligado ao arquivo.",
    visibility: "public",
    navGroup: "none",
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
    visibility: "public",
    navGroup: "primary-right",
    theme: "atlas",
    showHeader: true,
    showFooter: true,
  },
  {
    path: "/contato",
    label: "Contato",
    title: "Contato",
    description: "Canal de correspondencia do arquivo para registros, propostas e contato direto.",
    visibility: "public",
    navGroup: "primary-right",
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
    ...defaultEditorial,
  },
  {
    path: "/ficha",
    label: "Ficha",
    title: "Ficha",
    description: "Ferramenta interna de ficha, recursos e acompanhamento de sessao.",
    visibility: "internal",
    navGroup: "none",
    noIndex: true,
    ...defaultEditorial,
  },
  {
    path: "/mestre",
    label: "Mestre",
    title: "Painel do Mestre",
    description: "Ferramenta interna para conducao de sessao, controle de cena e notas do mestre.",
    visibility: "internal",
    navGroup: "none",
    noIndex: true,
    ...defaultEditorial,
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
      !entry.path.includes(":") &&
      entry.theme !== "oracle",
  );
}

export function buildDocumentTitle(title: string) {
  return title === "Inicio" ? archiveBrand.title : `${title} | ${archiveBrand.title}`;
}
