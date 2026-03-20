import { describe, expect, it } from "vitest";

import { createInitialShopState, getShopItemIconUrl } from "@/lib/in-game-shop";

describe("in-game shop catalog", () => {
  it("maps a direct icon asset for every seeded merchant and player item", () => {
    const state = createInitialShopState();
    const allItems = [...state.merchantItems, ...state.playerItems];

    expect(allItems.length).toBeGreaterThan(0);

    for (const item of allItems) {
      expect(getShopItemIconUrl(item), `missing icon for ${item.id}`).toContain(item.iconAsset);
    }
  });

  it("starts with a richer merchant inventory than the player backpack", () => {
    const state = createInitialShopState();

    expect(state.merchantItems.length).toBeGreaterThan(state.playerItems.length);
    expect(state.tradeLog).toHaveLength(2);
  });
});
