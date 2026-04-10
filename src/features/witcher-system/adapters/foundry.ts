import type { WitcherCampaignSceneSeed } from "../types";

export function normalizeFoundryTranslationKey(key: string) {
  return key.trim().replace(/^TWTRPG\./, "");
}

export function buildSceneNarration(seed: WitcherCampaignSceneSeed) {
  return {
    system:
      "Mesa do Continente pronta. A cena usa o fluxo Witcher TRPG em d10, com chat, iniciativa e compendio integrados.",
    narrator: seed.intro,
  };
}
