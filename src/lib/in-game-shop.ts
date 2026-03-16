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
}

export interface GameShopState {
  merchantGold: number;
  playerGold: number;
  merchantItems: GameShopItem[];
  playerItems: GameShopItem[];
  tradeLog: string[];
}

export const shopCategoryLabels: Record<GameShopCategory, string> = {
  armas: "Armas",
  armaduras: "Armaduras",
  alquimia: "Alquimia",
  ingredientes: "Ingredientes",
  provisoes: "Provisoes",
  runas: "Runas",
  curios: "Curios",
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
    "Marwen negocia sem erguer a voz. Sua banca atende caçadores, patrulheiros, alquimistas e qualquer companhia que saiba pagar por silêncio e sobrevivência.",
};

const merchantSeed: GameShopItem[] = [
  {
    id: "merchant-sabre",
    name: "Espada bastarda de vigia",
    description: "Lâmina equilibrada para duelos em corredores estreitos e guardas de estrada.",
    effect: "+2 em ataques corpo a corpo contra inimigos sem cobertura.",
    category: "armas",
    rarity: "incomum",
    weight: 3.1,
    baseValue: 148,
    quantity: 1,
  },
  {
    id: "merchant-bomb",
    name: "Bomba de cinza fria",
    description: "Ampola selada que explode em névoa seca e irritante.",
    effect: "Reduz visão e impõe desvantagem em percepção curta por 1 rodada.",
    category: "alquimia",
    rarity: "raro",
    weight: 0.4,
    baseValue: 92,
    quantity: 3,
  },
  {
    id: "merchant-armor",
    name: "Gibão de escamas negras",
    description: "Peitoral leve reforçado com placas costuradas sobre couro tratado.",
    effect: "+2 de proteção sem penalidade severa de movimento.",
    category: "armaduras",
    rarity: "incomum",
    weight: 5.2,
    baseValue: 126,
    quantity: 1,
  },
  {
    id: "merchant-rune",
    name: "Runa da faísca parda",
    description: "Marca rúnica gravada em pedra dourada fosca.",
    effect: "Adiciona dano elemental leve ao primeiro impacto certeiro do combate.",
    category: "runas",
    rarity: "raro",
    weight: 0.2,
    baseValue: 171,
    quantity: 2,
  },
  {
    id: "merchant-ration",
    name: "Carne seca de marcha",
    description: "Raçao salgada para viagens longas, resistente ao calor.",
    effect: "Sustenta um viajante por um dia de estrada.",
    category: "provisoes",
    rarity: "comum",
    weight: 0.6,
    baseValue: 12,
    quantity: 8,
  },
];

const playerSeed: GameShopItem[] = [
  {
    id: "player-belladonna",
    name: "Beladona de vala",
    description: "Erva amarga colhida na beira de sepulturas antigas.",
    effect: "Ingrediente útil em venenos, sedativos e misturas necrológicas.",
    category: "ingredientes",
    rarity: "comum",
    weight: 0.1,
    baseValue: 16,
    quantity: 6,
  },
  {
    id: "player-map-fragment",
    name: "Fragmento de mapa de túnel",
    description: "Pedaço de pergaminho gasto com anotações de galerias soterradas.",
    effect: "Pode revelar uma entrada esquecida quando comparado com outros fragmentos.",
    category: "curios",
    rarity: "incomum",
    weight: 0.1,
    baseValue: 58,
    quantity: 1,
  },
  {
    id: "player-lantern-oil",
    name: "Lanterna de óleo velado",
    description: "Reservatório de campo com chama contida e lente escurecida.",
    effect: "Fornece luz discreta sem denunciar tanto a posição do grupo.",
    category: "provisoes",
    rarity: "incomum",
    weight: 1.3,
    baseValue: 42,
    quantity: 2,
  },
  {
    id: "player-ghoul-claw",
    name: "Garra de ghoull lapidada",
    description: "Troféu limpo e acondicionado para venda entre caçadores e ocultistas.",
    effect: "Serve como reagente raro em unguentos e estudos de bestas.",
    category: "ingredientes",
    rarity: "comum",
    weight: 0.3,
    baseValue: 24,
    quantity: 1,
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

export function createInitialShopState(): GameShopState {
  return {
    merchantGold: 750,
    playerGold: 186,
    merchantItems: cloneItems(merchantSeed),
    playerItems: cloneItems(playerSeed),
    tradeLog: [
      "A banca de Marwen abriu ao cair da tarde.",
      "Os preços mudam pouco, mas o silêncio custa caro.",
    ],
  };
}

export function buyMerchantItem(state: GameShopState, itemId: string) {
  const item = state.merchantItems.find((entry) => entry.id === itemId);

  if (!item) {
    return { ok: false, message: "Este item não está mais no estoque.", state };
  }

  const price = getTradePrice(item, "merchant");

  if (state.playerGold < price) {
    return { ok: false, message: "A companhia não tem ouro suficiente.", state };
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
    return { ok: false, message: "Esse item não está na mochila da companhia.", state };
  }

  const price = getTradePrice(item, "player");

  if (state.merchantGold < price) {
    return { ok: false, message: "Marwen não tem caixa para essa compra agora.", state };
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
