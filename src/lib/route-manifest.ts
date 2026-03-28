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
      "Arquivo do Continente reúne bestiário, crônicas, cartografia e sessões em torno de Areias de Zerrikania.",
    visibility: "public",
    navGroup: "primary-left",
    ...defaultEditorial,
  },
  {
    path: "/universo/:entrySlug",
    label: "Universo",
    title: "Dossie do Universo",
    description:
      "Perfis, verbetes e relações do Continente reunidos sob o selo do arquivo.",
    visibility: "public",
    navGroup: "none",
    ...defaultEditorial,
  },
  {
    path: "/universo",
    label: "Universo",
    title: "Universo",
    description:
      "Explore reinos, personagens, facções, lugares e eventos ligados a Areias de Zerrikania.",
    visibility: "public",
    navGroup: "primary-left",
    ...defaultEditorial,
  },
  {
    path: "/bestiario/:entrySlug",
    label: "Bestiario",
    title: "Ficha de Criatura",
    description:
      "Consulte sinais, fraquezas, habitats e relatos de caça preservados no bestiário do arquivo.",
    visibility: "public",
    navGroup: "none",
    ...defaultEditorial,
  },
  {
    path: "/bestiario",
    label: "Bestiario",
    title: "Bestiario",
    description:
      "Criaturas, entidades e horrores catalogados em dossiês de caça e observação.",
    visibility: "public",
    navGroup: "primary-left",
    ...defaultEditorial,
  },
  {
    path: "/cronicas",
    label: "Cronicas",
    title: "Cronicas",
    description:
      "Leia capítulos, relatos de estrada e manuscritos ligados ao arquivo de Areias de Zerrikania.",
    visibility: "public",
    navGroup: "primary-left",
    ...defaultEditorial,
  },
  {
    path: "/campanha",
    label: "Campanha",
    title: "Campanha",
    description:
      "Entrada legada para as crônicas principais do arquivo.",
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
    description:
      "Experiência completa de Luna, com leitura contínua e consulta ao arquivo.",
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
    description:
      "Acesso direto ao oráculo do arquivo em experiência integral.",
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
      "Entre na sessão, abra a mesa, consulte o oráculo e revise fichas a partir do mesmo hub.",
    visibility: "public",
    navGroup: "primary-right",
    ...defaultEditorial,
  },
  {
    path: "/mesa",
    label: "Mesa",
    title: "Mesa de Sessao",
    description:
      "Ambiente tático para conduzir a sessão, organizar cena, iniciativa e presença.",
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
    description:
      "Explore uma carta regional ligada ao atlas do Continente.",
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
    description:
      "Leitura localizada do atlas com vínculos para dossiês, rotas e sessão.",
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
    description:
      "Camada intermediária do atlas, conectando região, local e rota.",
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
    description:
      "Navegue por uma região do Continente com contexto ligado ao arquivo.",
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
      "Abra o atlas do Continente, desça por cartas regionais e cruze rotas com verbetes e sessão.",
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
    description:
      "Canal de correspondência do arquivo para registros, propostas e contato direto.",
    visibility: "public",
    navGroup: "primary-right",
    ...defaultEditorial,
  },
  {
    path: "/comunidade",
    label: "Comunidade",
    title: "Comunidade",
    description:
      "Área interna de ecos, relatos e trocas entre leitores, jogadores e mestres.",
    visibility: "internal",
    navGroup: "none",
    noIndex: true,
    ...defaultEditorial,
  },
  {
    path: "/loja",
    label: "Loja",
    title: "Loja",
    description:
      "Área interna de itens e seleções do arquivo.",
    visibility: "internal",
    navGroup: "none",
    noIndex: true,
    ...defaultEditorial,
  },
  {
    path: "/conta",
    label: "Conta",
    title: "Conta",
    description:
      "Área interna para identidade, acesso e preferências do arquivo.",
    visibility: "internal",
    navGroup: "none",
    noIndex: true,
    ...defaultEditorial,
  },
  {
    path: "/criacao",
    label: "Criacao",
    title: "Criacao",
    description:
      "Ferramenta interna para criação de personagens e registros.",
    visibility: "internal",
    navGroup: "none",
    noIndex: true,
    ...defaultEditorial,
  },
  {
    path: "/ficha",
    label: "Ficha",
    title: "Ficha",
    description:
      "Ferramenta interna de ficha, recursos e acompanhamento de sessão.",
    visibility: "internal",
    navGroup: "none",
    noIndex: true,
    ...defaultEditorial,
  },
  {
    path: "/mestre",
    label: "Mestre",
    title: "Painel do Mestre",
    description:
      "Ferramenta interna para condução de sessão, controle de cena e notas do mestre.",
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
