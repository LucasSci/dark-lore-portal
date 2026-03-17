export type GameShopCategory =
  | "armas"
  | "armaduras"
  | "alquimia"
  | "ingredientes"
  | "provisoes"
  | "runas"
  | "curios";

export type GameShopRarity = "comum" | "incomum" | "raro" | "reliquia";
export type ShopInventoryOwner = "merchant" | "player";

export interface GameShopItem {
  id: string;
  name: string;
  description: string;
  effect: string;
  category: GameShopCategory;
  rarity: GameShopRarity;
  weight: number;
  baseValue: number;
  quantity: number;
  iconAsset: string;
}

export interface GameShopState {
  merchantGold: number;
  playerGold: number;
  merchantItems: GameShopItem[];
  playerItems: GameShopItem[];
  tradeLog: string[];
}

export interface ShopSpriteReference {
  sheet: "tw3_icon_1" | "tw3_icon_2" | "tw3_icon_3";
  row: number;
  col: number;
}

export const shopCategoryLabels: Record<GameShopCategory, string> = {
  armas: "Armas",
  armaduras: "Armaduras",
  alquimia: "Alquimia",
  ingredientes: "Ingredientes",
  provisoes: "Provisoes",
  runas: "Runas",
  curios: "Curiosidades",
};

export const shopRarityLabels: Record<GameShopRarity, string> = {
  comum: "Comum",
  incomum: "Incomum",
  raro: "Raro",
  reliquia: "Reliquia",
};

export const merchantProfile = {
  name: "Marwen da Areia Escura",
  title: "Mercadora de fronteira",
  location: "Entre Vaz'hir e as rotas baixas de Elarion",
  summary:
    "Marwen negocia como quem ja viu reis tombarem por uma pocao ruim. Sua banca atende cacadores, patrulheiros, alquimistas e companhias que precisam sair vivas da proxima estrada.",
};

export const SHOP_SPRITE_GRID_SIZE = 20;
export const SHOP_SPRITE_CELL_SIZE = 40;

const shopItemSprites: Record<string, ShopSpriteReference> = {
  icon_tw3_arma_020: { sheet: "tw3_icon_1", row: 5, col: 3 },
  icon_tw3_arma_048: { sheet: "tw3_icon_1", row: 9, col: 20 },
  icon_tw3_virote_006: { sheet: "tw3_icon_3", row: 17, col: 18 },
  icon_tw3_coraza_014: { sheet: "tw3_icon_1", row: 19, col: 8 },
  icon_tw3_botas_011: { sheet: "tw3_icon_1", row: 13, col: 2 },
  icon_tw3_guantes_006: { sheet: "tw3_icon_1", row: 20, col: 14 },
  icon_tw3_bomba_003: { sheet: "tw3_icon_3", row: 8, col: 2 },
  icon_tw3_pocion_004: { sheet: "tw3_icon_3", row: 8, col: 3 },
  icon_tw3_aceite_005: { sheet: "tw3_icon_3", row: 14, col: 18 },
  icon_tw3_alcohol_004: { sheet: "tw3_icon_1", row: 1, col: 11 },
  icon_tw3_runa_005: { sheet: "tw3_icon_3", row: 15, col: 5 },
  icon_tw3_runa_012: { sheet: "tw3_icon_3", row: 15, col: 12 },
  icon_tw3_hierba_010: { sheet: "tw3_icon_2", row: 4, col: 11 },
  icon_tw3_monstruoso_018: { sheet: "tw3_icon_3", row: 11, col: 2 },
  icon_tw3_comida_028: { sheet: "tw3_icon_1", row: 17, col: 19 },
  icon_tw3_comida_021: { sheet: "tw3_icon_1", row: 17, col: 15 },
  icon_tw3_libro_008: { sheet: "tw3_icon_2", row: 9, col: 13 },
  icon_tw3_joya_004: { sheet: "tw3_icon_2", row: 7, col: 5 },
  icon_tw3_hierba_016: { sheet: "tw3_icon_2", row: 5, col: 18 },
  icon_tw3_hierba_026: { sheet: "tw3_icon_2", row: 5, col: 7 },
  icon_tw3_monstruoso_011: { sheet: "tw3_icon_3", row: 9, col: 3 },
  icon_tw3_monstruoso_026: { sheet: "tw3_icon_3", row: 10, col: 6 },
  icon_tw3_monstruoso_045: { sheet: "tw3_icon_3", row: 10, col: 11 },
  icon_tw3_metal_009: { sheet: "tw3_icon_2", row: 12, col: 1 },
  icon_tw3_alquimia_006: { sheet: "tw3_icon_2", row: 13, col: 7 },
  icon_tw3_carta_005: { sheet: "tw3_icon_2", row: 8, col: 9 },
  icon_tw3_joya_012: { sheet: "tw3_icon_2", row: 7, col: 15 },
  icon_tw3_comida_009: { sheet: "tw3_icon_1", row: 16, col: 7 },
  icon_tw3_comida_019: { sheet: "tw3_icon_1", row: 15, col: 4 },
};

const merchantSeed: GameShopItem[] = [
  {
    id: "merchant-steel-sword",
    name: "Espada de aco do Pontar",
    description: "Lamina longa, equilibrada para duelo aberto e patrulha de estrada.",
    effect: "+2 em ataques corpo a corpo contra alvos sem cobertura.",
    category: "armas",
    rarity: "incomum",
    weight: 3.2,
    baseValue: 168,
    quantity: 1,
    iconAsset: "icon_tw3_arma_020",
  },
  {
    id: "merchant-cavalry-sabre",
    name: "Sabre de cavalaria nilfgaardiano",
    description: "Curvatura agressiva, ideal para cargas rapidas e cortes montados.",
    effect: "+1 em iniciativa e dano elevado na primeira investida.",
    category: "armas",
    rarity: "raro",
    weight: 2.8,
    baseValue: 214,
    quantity: 1,
    iconAsset: "icon_tw3_arma_048",
  },
  {
    id: "merchant-tracker-bolts",
    name: "Virotes de rastreador",
    description: "Conjunto de virotes bem balanceados para bestas de campanha.",
    effect: "Municao precisa para cacadas e disparos longos.",
    category: "armas",
    rarity: "comum",
    weight: 0.4,
    baseValue: 18,
    quantity: 14,
    iconAsset: "icon_tw3_virote_006",
  },
  {
    id: "merchant-scale-cuirass",
    name: "Gibao de escamas negras",
    description: "Peitoral leve com placas costuradas sobre couro tratado.",
    effect: "+2 de protecao sem punir severamente o movimento.",
    category: "armaduras",
    rarity: "incomum",
    weight: 5.2,
    baseValue: 126,
    quantity: 1,
    iconAsset: "icon_tw3_coraza_014",
  },
  {
    id: "merchant-ranger-boots",
    name: "Botas de vigia do vau",
    description: "Cano alto, sola firme e reforco pensado para lama e cascalho.",
    effect: "Reduz penalidade em marcha sobre terreno dificil leve.",
    category: "armaduras",
    rarity: "comum",
    weight: 1.4,
    baseValue: 46,
    quantity: 1,
    iconAsset: "icon_tw3_botas_011",
  },
  {
    id: "merchant-griffin-gloves",
    name: "Luvas de curtidor de monstros",
    description: "Par de luvas tratadas para lidar com couro, sangue e toxinas.",
    effect: "Bons para coleta de trofeus e manipulacao alquimica.",
    category: "armaduras",
    rarity: "incomum",
    weight: 0.8,
    baseValue: 61,
    quantity: 1,
    iconAsset: "icon_tw3_guantes_006",
  },
  {
    id: "merchant-dancing-star",
    name: "Bomba estrela dancante",
    description: "Ampola incendiaria preparada para combate curto e brutal.",
    effect: "Explode em fogo e pressiona inimigos a abandonar cobertura.",
    category: "alquimia",
    rarity: "raro",
    weight: 0.4,
    baseValue: 92,
    quantity: 3,
    iconAsset: "icon_tw3_bomba_003",
  },
  {
    id: "merchant-swallow",
    name: "Pocao andorinha",
    description: "Frasco conhecido entre sobreviventes que voltam da beira do fim.",
    effect: "Recupera vigor e acelera a cicatrizacao fora de pressao extrema.",
    category: "alquimia",
    rarity: "incomum",
    weight: 0.2,
    baseValue: 74,
    quantity: 2,
    iconAsset: "icon_tw3_pocion_004",
  },
  {
    id: "merchant-necrophage-oil",
    name: "Oleo de necrofago",
    description: "Mistura espessa para armas que vao enfrentar carne podre.",
    effect: "Aumenta o dano contra necrofagos e carcacas animadas.",
    category: "alquimia",
    rarity: "incomum",
    weight: 0.3,
    baseValue: 88,
    quantity: 2,
    iconAsset: "icon_tw3_aceite_005",
  },
  {
    id: "merchant-alcohest",
    name: "Alcohest",
    description: "Base alcoolica forte, usada para repor reagentes e diluir compostos.",
    effect: "Reabastece reservas alquimicas entre descansos.",
    category: "alquimia",
    rarity: "comum",
    weight: 0.8,
    baseValue: 33,
    quantity: 4,
    iconAsset: "icon_tw3_alcohol_004",
  },
  {
    id: "merchant-svarog-rune",
    name: "Runa de Svarog",
    description: "Pedra runica trabalhada para gravar poder em aco ou prata.",
    effect: "Concede dano elemental leve ao primeiro golpe certeiro do turno.",
    category: "runas",
    rarity: "raro",
    weight: 0.2,
    baseValue: 171,
    quantity: 2,
    iconAsset: "icon_tw3_runa_005",
  },
  {
    id: "merchant-veles-rune",
    name: "Runa de Veles",
    description: "Talho runico de acabamento frio, feito para armas de impacto.",
    effect: "Melhora golpes pesados e abre chance de atordoamento curto.",
    category: "runas",
    rarity: "raro",
    weight: 0.2,
    baseValue: 154,
    quantity: 1,
    iconAsset: "icon_tw3_runa_012",
  },
  {
    id: "merchant-celandine-bundle",
    name: "Fardo de celidonia",
    description: "Erva seca, limpa e amarrada em maos de viagem.",
    effect: "Ingrediente versatil para unguentos, pocoes e cataplasmas.",
    category: "ingredientes",
    rarity: "comum",
    weight: 0.1,
    baseValue: 18,
    quantity: 5,
    iconAsset: "icon_tw3_hierba_010",
  },
  {
    id: "merchant-monster-eye",
    name: "Olho de besta preservado",
    description: "Trofeu guardado em sal para estudo, ritual ou revenda.",
    effect: "Reagente raro para sinais, po e alquimia monstruosa.",
    category: "ingredientes",
    rarity: "raro",
    weight: 0.2,
    baseValue: 86,
    quantity: 2,
    iconAsset: "icon_tw3_monstruoso_018",
  },
  {
    id: "merchant-smoked-fish",
    name: "Arenque defumado",
    description: "Peixe curado para estrada longa, salgado como conversa de porto.",
    effect: "Mantem um viajante de pe por um dia de marcha.",
    category: "provisoes",
    rarity: "comum",
    weight: 0.5,
    baseValue: 11,
    quantity: 6,
    iconAsset: "icon_tw3_comida_028",
  },
  {
    id: "merchant-campaign-rations",
    name: "Pacote de provisoes secas",
    description: "Queijo duro, carne salgada e pao escuro embrulhados para patrulha.",
    effect: "Sustenta uma companhia em travessias curtas.",
    category: "provisoes",
    rarity: "comum",
    weight: 0.7,
    baseValue: 14,
    quantity: 8,
    iconAsset: "icon_tw3_comida_021",
  },
  {
    id: "merchant-contract-ledger",
    name: "Manual de contratos costeiros",
    description: "Livro gasto com notas sobre cobranca, monstros e rotas salgadas.",
    effect: "Pode revelar rumores e valores de contratos antigos.",
    category: "curios",
    rarity: "incomum",
    weight: 0.9,
    baseValue: 72,
    quantity: 1,
    iconAsset: "icon_tw3_libro_008",
  },
  {
    id: "merchant-obsidian-ring",
    name: "Anel sigilado de onix",
    description: "Joa antiga de familia menor, boa para penhor ou intriga.",
    effect: "Objeto valioso para favores, barganhas e fachada.",
    category: "curios",
    rarity: "raro",
    weight: 0.1,
    baseValue: 135,
    quantity: 1,
    iconAsset: "icon_tw3_joya_004",
  },
];

const playerSeed: GameShopItem[] = [
  {
    id: "player-celandine",
    name: "Celidonia seca",
    description: "Erva amarga separada em pequenos feixes de campo.",
    effect: "Ingrediente confiavel para misturas curativas e unguentos.",
    category: "ingredientes",
    rarity: "comum",
    weight: 0.1,
    baseValue: 16,
    quantity: 6,
    iconAsset: "icon_tw3_hierba_010",
  },
  {
    id: "player-verbena",
    name: "Verbena lunar",
    description: "Folhas finas com perfume metalico, colhidas ao cair da neblina.",
    effect: "Usada em infusoes de foco e compostos rituais.",
    category: "ingredientes",
    rarity: "incomum",
    weight: 0.1,
    baseValue: 22,
    quantity: 4,
    iconAsset: "icon_tw3_hierba_016",
  },
  {
    id: "player-mandrake-root",
    name: "Raiz de mandragora",
    description: "Bulbo retorcido, dificil de conseguir e pior ainda de carregar.",
    effect: "Base potente para toxinas, sedativos e ritos obscuros.",
    category: "ingredientes",
    rarity: "raro",
    weight: 0.2,
    baseValue: 58,
    quantity: 1,
    iconAsset: "icon_tw3_hierba_026",
  },
  {
    id: "player-ghoul-claw",
    name: "Garra de ghoul lapidada",
    description: "Trofeu limpo e acondicionado para venda entre cacadores e ocultistas.",
    effect: "Serve como reagente raro em unguentos e estudos de bestas.",
    category: "ingredientes",
    rarity: "comum",
    weight: 0.3,
    baseValue: 24,
    quantity: 2,
    iconAsset: "icon_tw3_monstruoso_011",
  },
  {
    id: "player-drowner-brain",
    name: "Cerebro de afogador",
    description: "Material viscoso preservado em sal e pano grosso.",
    effect: "Reagente de necrofagia e componente para formulas instaveis.",
    category: "ingredientes",
    rarity: "comum",
    weight: 0.2,
    baseValue: 19,
    quantity: 3,
    iconAsset: "icon_tw3_monstruoso_026",
  },
  {
    id: "player-nekker-heart",
    name: "Coracao de nekkar",
    description: "Organismo raro mantido frio desde a ultima escaramuca.",
    effect: "Ingrediente valioso para venenos e estudos monstruosos.",
    category: "ingredientes",
    rarity: "incomum",
    weight: 0.2,
    baseValue: 37,
    quantity: 1,
    iconAsset: "icon_tw3_monstruoso_045",
  },
  {
    id: "player-dimeritium-dust",
    name: "Po de dimeritio",
    description: "Residuos metalicos de uma liga cara, triturados com extremo cuidado.",
    effect: "Usado em runas, travas arcanas e artefatos anti-magia.",
    category: "ingredientes",
    rarity: "raro",
    weight: 0.2,
    baseValue: 63,
    quantity: 1,
    iconAsset: "icon_tw3_metal_009",
  },
  {
    id: "player-empty-vials",
    name: "Frascos alquimicos vazios",
    description: "Vidros pequenos, limpos e prontos para novo lote.",
    effect: "Base util para recarga de oleos, pocoes e reagentes.",
    category: "alquimia",
    rarity: "comum",
    weight: 0.2,
    baseValue: 9,
    quantity: 5,
    iconAsset: "icon_tw3_alquimia_006",
  },
  {
    id: "player-map-fragment",
    name: "Fragmento de mapa de tunel",
    description: "Pedaco de pergaminho gasto com notas de galerias soterradas.",
    effect: "Pode revelar uma entrada esquecida quando comparado com outros fragmentos.",
    category: "curios",
    rarity: "incomum",
    weight: 0.1,
    baseValue: 58,
    quantity: 1,
    iconAsset: "icon_tw3_carta_005",
  },
  {
    id: "player-broken-locket",
    name: "Relicario rachado de obsidiana",
    description: "Amuleto rachado, antigo demais para ser simples sucata.",
    effect: "Pode servir a intrigas, penhor ou supersticoes locais.",
    category: "curios",
    rarity: "incomum",
    weight: 0.1,
    baseValue: 41,
    quantity: 1,
    iconAsset: "icon_tw3_joya_012",
  },
  {
    id: "player-rye-bread",
    name: "Pao de centeio escuro",
    description: "Pao denso de viagem, cortado para durar sem frescor.",
    effect: "Restaura energia basica durante descanso curto.",
    category: "provisoes",
    rarity: "comum",
    weight: 0.4,
    baseValue: 8,
    quantity: 3,
    iconAsset: "icon_tw3_comida_009",
  },
  {
    id: "player-dry-meat",
    name: "Carne seca de marcha",
    description: "Tira salgada e resistente ao calor, boa para estradas longas.",
    effect: "Sustenta um viajante por um dia de marcha.",
    category: "provisoes",
    rarity: "comum",
    weight: 0.6,
    baseValue: 12,
    quantity: 2,
    iconAsset: "icon_tw3_comida_019",
  },
];

function cloneItems(items: GameShopItem[]) {
  return items.map((item) => ({ ...item }));
}

function appendTradeLog(state: GameShopState, message: string): GameShopState {
  return {
    ...state,
    tradeLog: [message, ...state.tradeLog].slice(0, 8),
  };
}

function upsertInventoryItem(items: GameShopItem[], item: GameShopItem) {
  const existing = items.find((entry) => entry.id === item.id);

  if (!existing) {
    return [...items, { ...item, quantity: 1 }];
  }

  return items.map((entry) =>
    entry.id === item.id ? { ...entry, quantity: entry.quantity + 1 } : entry,
  );
}

function decrementInventoryItem(items: GameShopItem[], itemId: string) {
  return items
    .map((entry) =>
      entry.id === itemId ? { ...entry, quantity: entry.quantity - 1 } : entry,
    )
    .filter((entry) => entry.quantity > 0);
}

export function formatShopGold(value: number) {
  return `${Math.max(0, Math.round(value))} ouro`;
}

export function getTradePrice(item: GameShopItem, owner: ShopInventoryOwner) {
  return owner === "merchant"
    ? item.baseValue
    : Math.max(1, Math.floor(item.baseValue * 0.45));
}

export function getInventoryWeight(items: GameShopItem[]) {
  const weight = items.reduce((sum, item) => sum + item.weight * item.quantity, 0);
  return Number(weight.toFixed(1));
}

export function getShopItemSprite(item: Pick<GameShopItem, "iconAsset">) {
  return shopItemSprites[item.iconAsset] ?? null;
}

export function getShopSpriteSheetUrl(sheet: ShopSpriteReference["sheet"]) {
  return `/shop-icons/tw3/sheets/${sheet}.png?v=1`;
}

export function createInitialShopState(): GameShopState {
  return {
    merchantGold: 750,
    playerGold: 186,
    merchantItems: cloneItems(merchantSeed),
    playerItems: cloneItems(playerSeed),
    tradeLog: [
      "A banca de Marwen abriu ao cair da tarde.",
      "Os precos mudam pouco, mas o silencio custa caro.",
    ],
  };
}

export function buyMerchantItem(state: GameShopState, itemId: string) {
  const item = state.merchantItems.find((entry) => entry.id === itemId);

  if (!item) {
    return { ok: false, message: "Este item nao esta mais no estoque.", state };
  }

  const price = getTradePrice(item, "merchant");

  if (state.playerGold < price) {
    return { ok: false, message: "A companhia nao tem ouro suficiente.", state };
  }

  const nextState = appendTradeLog(
    {
      ...state,
      playerGold: state.playerGold - price,
      merchantGold: state.merchantGold + price,
      merchantItems: decrementInventoryItem(state.merchantItems, itemId),
      playerItems: upsertInventoryItem(state.playerItems, item),
    },
    `A companhia comprou ${item.name} por ${formatShopGold(price)}.`,
  );

  return { ok: true, message: `${item.name} foi comprado.`, state: nextState };
}

export function sellPlayerItem(state: GameShopState, itemId: string) {
  const item = state.playerItems.find((entry) => entry.id === itemId);

  if (!item) {
    return { ok: false, message: "Esse item nao esta na mochila da companhia.", state };
  }

  const price = getTradePrice(item, "player");

  if (state.merchantGold < price) {
    return { ok: false, message: "Marwen nao tem caixa para essa compra agora.", state };
  }

  const nextState = appendTradeLog(
    {
      ...state,
      playerGold: state.playerGold + price,
      merchantGold: state.merchantGold - price,
      playerItems: decrementInventoryItem(state.playerItems, itemId),
      merchantItems: upsertInventoryItem(state.merchantItems, item),
    },
    `A companhia vendeu ${item.name} por ${formatShopGold(price)}.`,
  );

  return { ok: true, message: `${item.name} foi vendido.`, state: nextState };
}
