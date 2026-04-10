import type { WitcherCampaign, WitcherCampaignSceneSeed } from "../types";

export const DEFAULT_WITCHER_CAMPAIGN_ID = "contrato-na-velha-estrada";

export const WITCHER_CAMPAIGN_SCENES: WitcherCampaignSceneSeed[] = [
  {
    id: "estrada-velha",
    name: "Contrato na Velha Estrada",
    region: "Kaedwen",
    chronicleHref: "/cronicas/prologo",
    dossierHref: "/universo/nashara",
    atlasHref: "/mapa",
    intro:
      "Pegadas de nekker cortam a lama. O contrato comeca antes do amanhecer, com o grupo lendo rastros e escolhendo onde montar a primeira linha.",
    briefing:
      "Cena de abertura para leitura de rastros, montagem de linha de combate e uso de sinais antes do primeiro impacto.",
    threatLabels: ["Nekkers", "Emboscada curta", "Estrada coberta por nevoa"],
    supportLinks: [
      { label: "Ler prologo", href: "/cronicas/prologo", tone: "chronicle" },
      { label: "Abrir atlas", href: "/mapa", tone: "atlas" },
      { label: "Consultar Luna", href: "/oraculo", tone: "oracle" },
    ],
  },
  {
    id: "ruinas-do-altar",
    name: "Ruinas do Altar Consumido",
    region: "Redania",
    chronicleHref: "/cronicas/o-arquivo-permanece-aberto",
    dossierHref: "/bestiario/silvano",
    atlasHref: "/mapa",
    intro:
      "A patrulha chega tarde ao santuario. Fumaca, runas rasgadas e um foco de maldicao obrigam a companhia a abrir a cena com cautela total.",
    briefing:
      "Cena de exploracao ritual com terreno apertado, maldicao ativa e pressao para controlar o centro do santuario.",
    threatLabels: ["Maldicao local", "Ruinas estreitas", "Foco ritual instavel"],
    supportLinks: [
      { label: "Reler cronica", href: "/cronicas/o-arquivo-permanece-aberto", tone: "chronicle" },
      { label: "Abrir bestiario", href: "/bestiario", tone: "dossier" },
      { label: "Cruzar atlas", href: "/mapa", tone: "atlas" },
    ],
  },
];

export const WITCHER_CAMPAIGNS: WitcherCampaign[] = [
  {
    id: DEFAULT_WITCHER_CAMPAIGN_ID,
    title: "Contrato na Velha Estrada",
    summary:
      "Campanha de entrada para a companhia: rastros de nekker, estrada tomada por nevoa e um contrato pequeno demais para ser simples.",
    gmLabel: "Narrador do contrato",
    stageLabel: "Kaedwen",
    sceneIds: ["estrada-velha"],
    defaultSceneId: "estrada-velha",
    players: [
      {
        id: "aedan-da-vibora",
        name: "Aedan da Vibora",
        role: "Bruxo de estrada",
        sheetHref: "/ficha",
      },
      {
        id: "lys-de-venger",
        name: "Lys de Venger",
        role: "Maga de campo",
        sheetHref: "/ficha",
      },
      {
        id: "iorveth-rian",
        name: "Iorveth Rian",
        role: "Cirurgiao e apoio",
        sheetHref: "/ficha",
      },
    ],
    supportLinks: [
      { label: "Abrir manuscrito", href: "/cronicas/prologo", tone: "chronicle" },
      { label: "Cruzar com o atlas", href: "/mapa", tone: "atlas" },
      { label: "Consultar o oraculo", href: "/oraculo", tone: "oracle" },
      { label: "Forjar nova ficha", href: "/criacao", tone: "sheet" },
    ],
    atmosphere: "Chuva fria, barro cortado por rastros e pressa para decidir quem segura a linha.",
  },
  {
    id: "ruinas-do-altar",
    title: "Ruinas do Altar Consumido",
    summary:
      "Cena tensa de exploracao e combate em santuario partido, com foco em maldicao, terreno estreito e leitura ritual do local.",
    gmLabel: "Guardiao do selo",
    stageLabel: "Redania",
    sceneIds: ["ruinas-do-altar"],
    defaultSceneId: "ruinas-do-altar",
    players: [
      {
        id: "aedan-da-vibora",
        name: "Aedan da Vibora",
        role: "Bruxo de contrato",
        sheetHref: "/ficha",
      },
      {
        id: "lys-de-venger",
        name: "Lys de Venger",
        role: "Arcana de ruptura",
        sheetHref: "/ficha",
      },
    ],
    supportLinks: [
      { label: "Ler cronica vinculada", href: "/cronicas", tone: "chronicle" },
      { label: "Abrir bestiario", href: "/bestiario", tone: "dossier" },
      { label: "Abrir atlas", href: "/mapa", tone: "atlas" },
      { label: "Despertar Luna", href: "/oraculo", tone: "oracle" },
    ],
    atmosphere: "Cinza, pedra rachada e uma maldicao que exige leitura cuidadosa antes do combate.",
  },
];

export function getWitcherCampaignById(campaignId?: string | null) {
  if (!campaignId) {
    return WITCHER_CAMPAIGNS[0];
  }

  return WITCHER_CAMPAIGNS.find((campaign) => campaign.id === campaignId) ?? WITCHER_CAMPAIGNS[0];
}

export function getWitcherSceneSeed(sceneId?: string | null) {
  if (!sceneId) {
    return WITCHER_CAMPAIGN_SCENES[0];
  }

  return WITCHER_CAMPAIGN_SCENES.find((scene) => scene.id === sceneId) ?? WITCHER_CAMPAIGN_SCENES[0];
}

export function getWitcherScenesForCampaign(campaignId?: string | null) {
  const campaign = getWitcherCampaignById(campaignId);
  return campaign.sceneIds
    .map((sceneId) => getWitcherSceneSeed(sceneId))
    .filter((scene, index, collection) => collection.findIndex((candidate) => candidate.id === scene.id) === index);
}
