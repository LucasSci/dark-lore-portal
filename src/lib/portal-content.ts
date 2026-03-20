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

import heroFrameBg from "@/assets/hero-bg.jpg";
import heroBg from "@/assets/hero-zerrikania.jpg";
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
    body: "Regioes, fronteiras e rotas importantes surgem como parte central da leitura.",
  },
  {
    icon: ScrollText,
    title: "Cronicas em fluxo",
    body: "Contratos, rumores e relatorios assumem a funcao editorial da home.",
  },
  {
    icon: Users,
    title: "Mesa conectada",
    body: "Campanha, personagem e mestre falam a mesma lingua visual.",
  },
];

export const manifestoPanels: PortalFeatureSpec[] = [
  {
    icon: Sparkles,
    title: "Direcao viva",
    body: "A home deixa de ser uma colecao de modulos e passa a agir como capa de saga.",
  },
  {
    icon: Compass,
    title: "Leitura guiada",
    body: "A referencia oficial trouxe uma hierarquia clara, e agora o portal tambem conduz o olhar.",
  },
  {
    icon: Users,
    title: "Continente compartilhado",
    body: "Tudo o que importa para a campanha fica perto: mundo, pessoas, dossies e sessao.",
  },
];

export const manifestoQuotes: PortalQuoteSpec[] = [
  {
    quote: "Um reliquiario vivo que responde ao jogador, nao uma vitrine generica.",
    source: "Direcao de arte",
  },
  {
    quote: "Mapa, cronica e mesa agora parecem capitulos do mesmo mundo.",
    source: "Arquitetura editorial",
  },
  {
    quote: "A home finalmente funciona como portal, nao so como landing bonita.",
    source: "Leitura da campanha",
  },
];

export const editorialFallbacks: PortalEditorialEntry[] = [
  {
    id: "fallback-atlas",
    title: "O atlas abre novas linhas de travessia sobre o continente.",
    excerpt:
      "As regioes agora surgem como pontos de partida para jornada, descoberta e leitura aprofundada.",
    location: "Atlas do continente",
    label: "Relatorio",
    updatedAt: "2026-03-18T12:00:00.000Z",
    href: "/mapa",
  },
  {
    id: "fallback-universe",
    title: "Entradas do universo foram reordenadas como dossies vivos.",
    excerpt:
      "Faccoes, lugares e personagens ganham peso de arquivo de campanha em vez de virar lista seca.",
    location: "Universo",
    label: "Dossie",
    updatedAt: "2026-03-18T18:00:00.000Z",
    href: "/universo",
  },
  {
    id: "fallback-table",
    title: "A mesa virtual passa a soar como prolongamento natural do portal.",
    excerpt:
      "Sessao, ficha e painel do mestre deixam de competir com a home e passam a ser chamados por ela.",
    location: "Mesa virtual",
    label: "Mesa",
    updatedAt: "2026-03-19T08:30:00.000Z",
    href: "/mesa",
  },
  {
    id: "fallback-creation",
    title: "Criacao de personagem entra na jornada como ritual, nao formulario.",
    excerpt:
      "A entrada para novas companhias fica mais coerente com o tom do resto do continente.",
    location: "Criacao",
    label: "Ritual",
    updatedAt: "2026-03-19T13:10:00.000Z",
    href: "/criacao",
  },
  {
    id: "fallback-mestre",
    title: "O painel do mestre assume lugar de comando dentro do reliquiario.",
    excerpt:
      "Notas, organizacao de campanha e leitura de cena agora parecem parte da mesma obra.",
    location: "Mestre",
    label: "Comando",
    updatedAt: "2026-03-19T17:45:00.000Z",
    href: "/mestre",
  },
];

export const moduleViews: Record<PortalModuleViewKey, PortalModuleView> = {
  exploracao: {
    label: "Exploracao",
    title: "O continente entra em cena como um sistema de leitura completo.",
    body:
      "A estrutura da referencia foi traduzida para o seu portal como uma vitrine de mundo: mapa, universo e comunidade apresentados como trilhas de descoberta.",
    accent:
      "Quando o jogador entra por aqui, ele entende imediatamente onde explorar antes de abrir qualquer submenu.",
    items: [
      {
        eyebrow: "Atlas do continente",
        title: "Mappa mundi e regioes com peso de capa principal.",
        description:
          "O atlas deixa de ser apenas uma funcionalidade e assume o papel de grande convite para a jornada.",
        path: "/mapa",
        image: heroBg,
        imagePosition: "center center",
        icon: Map,
        destination: "atlas",
      },
      {
        eyebrow: "Arquivo do universo",
        title: "Entradas, faccoes e lugares organizados como dossies.",
        description:
          "Toda a camada de lore fica mais acessivel e parece parte da mesma obra editorial da home.",
        path: "/universo",
        image: heroFrameBg,
        imagePosition: "center top",
        icon: Compass,
        destination: "universo",
      },
      {
        eyebrow: "Comunidade",
        title: "Os ecos da campanha se espalham para fora da sessao.",
        description:
          "A comunidade aparece como prolongamento do mundo, nao como area separada do resto do portal.",
        path: "/comunidade",
        image: heroBg,
        imagePosition: "right center",
        icon: Users,
        destination: "comunidade",
      },
    ],
  },
  campanha: {
    label: "Campanha",
    title: "Sessao, conducao e preparacao do mestre agora ganham palco proprio.",
    body:
      "A secao inspirada nos cards de jogos virou uma vitrine dos modulos de campanha, com mais clareza para leitura, mesa e comando.",
    accent:
      "Tudo que move uma campanha longa fica agrupado como produto principal do portal, nao como ferramenta perdida na navegacao.",
    items: [
      {
        eyebrow: "Cronicas e contratos",
        title: "O arquivo de campanha passa a liderar a narrativa do site.",
        description:
          "Publicacoes recentes, leituras abertas e contratos pendentes formam a espinha editorial da experiencia.",
        path: "/campanha",
        image: heroFrameBg,
        imagePosition: "center center",
        icon: ScrollText,
        destination: "campanha",
      },
      {
        eyebrow: "Mesa virtual",
        title: "A sessao ao vivo vira continuacao natural da home.",
        description:
          "Partidas, fichas e conducao de cena ficam muito mais faceis de encontrar e fazer sentido.",
        path: "/mesa",
        image: heroBg,
        imagePosition: "left center",
        icon: Sword,
        destination: "mesa",
      },
      {
        eyebrow: "Painel do mestre",
        title: "Comando, preparo e leitura rapida num mesmo nucleo.",
        description:
          "A referencia ajudou a transformar o mestre em um protagonista do portal, e nao em pagina secundaria.",
        path: "/mestre",
        image: heroFrameBg,
        imagePosition: "center bottom",
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
    body: "Acompanhe o que entrou no arquivo antes da proxima sessao comecar.",
  },
  {
    icon: BookOpenText,
    title: "Leitura guiada",
    body: "Cronicas, dossies e rotas chegam com muito mais contexto visual.",
  },
  {
    icon: Flame,
    title: "Campanha ativa",
    body: "Conta, comunidade e mesa agora puxam voce de volta para a fogueira certa.",
  },
];

export const promoBanners: PortalPromoBannerSpec[] = [
  {
    eyebrow: "Mesa virtual",
    title: "Leve a sessao para um palco que combina com o resto do reliquiario.",
    body:
      "A mesa deixa de parecer modulo isolado e passa a agir como parte organica da campanha viva.",
    path: "/mesa",
    image: heroBg,
    imagePosition: "center center",
    icon: Sword,
    cta: "Abrir a mesa",
    destination: "mesa",
  },
  {
    eyebrow: "Criacao + mestre",
    title: "Forje personagens e conduza a campanha dentro do mesmo idioma visual.",
    body:
      "Criacao de personagem e painel do mestre entram na home como convites claros para a proxima etapa da jornada.",
    path: "/criacao",
    image: heroFrameBg,
    imagePosition: "center top",
    icon: Shield,
    cta: "Iniciar ritual",
    destination: "criacao",
  },
];
