import type { Database } from "@/integrations/supabase/types";
import { LOCAL_SESSION_ID, LOCAL_USER_ID } from "@/lib/local-identities";
import {
  buildCharacterFromCreator,
  buildSeedCharacter,
  type CharacterDraftData,
  type CharacterRecord,
} from "@/lib/rpg-ui";
import {
  buildAttributeValuesFromCharacterRow,
  buildCharacterDraftFromStore,
  createAttributeStore,
} from "@/lib/sheets/engine";
import { NOIR_CHRONICLE_SHEET } from "@/lib/sheets/noir-chronicle-sheet";
import type { AttributeStore } from "@/lib/sheets/types";

type GameSessionRow = Database["public"]["Tables"]["game_sessions"]["Row"];
type BundleSource = "local" | "remote" | "seed";

export interface CharacterBundle {
  character: CharacterRecord;
  store: AttributeStore;
  sheetDefinitionId: string;
  source: BundleSource;
}

interface PersistedCharacterRecord {
  character: CharacterRecord;
  store: AttributeStore;
  sheetDefinitionId: string;
}

const STORAGE_KEY = "dark-lore-sheet-character-bundles";
const LATEST_CHARACTER_KEY = "dark-lore-sheet-latest-character-id";
const MESA_SESSION_KEY_PREFIX = "dark-lore-mesa-session";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function safeNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function isWitcherStore(store: AttributeStore | null | undefined) {
  return Boolean(store?.values?.int && store?.values?.ref && store?.values?.body);
}

function migratePersistedStore(character: CharacterRecord, store: AttributeStore | null | undefined) {
  if (store && isWitcherStore(store)) {
    return store;
  }

  return createAttributeStore(
    NOIR_CHRONICLE_SHEET,
    character.id,
    buildAttributeValuesFromCharacterRow(character),
    store?.repeaters ?? {},
  );
}

function readPersistedBundles(): PersistedCharacterRecord[] {
  if (!canUseStorage()) {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as PersistedCharacterRecord[];
    return Array.isArray(parsed)
      ? parsed.map((record) => ({
          ...record,
          store: migratePersistedStore(record.character, record.store),
        }))
      : [];
  } catch {
    return [];
  }
}

function writePersistedBundles(records: PersistedCharacterRecord[]) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function setLatestCharacterId(characterId: string) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(LATEST_CHARACTER_KEY, characterId);
}

function getLatestCharacterId() {
  if (!canUseStorage()) {
    return null;
  }

  return window.localStorage.getItem(LATEST_CHARACTER_KEY);
}

function upsertBundle(record: PersistedCharacterRecord) {
  const records = readPersistedBundles();
  const nextRecords = records.filter((entry) => entry.character.id !== record.character.id);
  nextRecords.unshift(record);
  writePersistedBundles(nextRecords);
  setLatestCharacterId(record.character.id);
}

function mergeCharacterWithStore(character: CharacterRecord, store: AttributeStore): CharacterRecord {
  const draft = buildCharacterDraftFromStore(store);
  const rebuilt = buildCharacterFromCreator(draft);

  return {
    ...character,
    ...rebuilt,
    id: character.id,
    user_id: character.user_id,
    created_at: character.created_at,
    updated_at: new Date().toISOString(),
    is_active: character.is_active,
    portrait_url: character.portrait_url,
    hp_current: safeNumber(store.derived.hp_current, rebuilt.hp_current),
    hp_max: safeNumber(store.derived.hp_max, rebuilt.hp_max),
    mp_current: safeNumber(store.derived.focus_current, rebuilt.mp_current),
    mp_max: safeNumber(store.derived.focus_max, rebuilt.mp_max),
    armor_class: safeNumber(store.derived.armor_class, rebuilt.armor_class),
    initiative_bonus: safeNumber(store.derived.initiative_bonus, rebuilt.initiative_bonus),
    speed: safeNumber(store.derived.run, rebuilt.speed),
  };
}

function createSeedBundle(): CharacterBundle {
  const character = buildSeedCharacter();
  const store = createAttributeStore(
    NOIR_CHRONICLE_SHEET,
    character.id,
    buildAttributeValuesFromCharacterRow(character),
  );

  return {
    character,
    store,
    sheetDefinitionId: NOIR_CHRONICLE_SHEET.id,
    source: "seed",
  };
}

export async function createCharacterBundle(draft: CharacterDraftData): Promise<CharacterBundle> {
  const character = buildCharacterFromCreator(draft);
  const store = createAttributeStore(
    NOIR_CHRONICLE_SHEET,
    character.id,
    {
      ...buildAttributeValuesFromCharacterRow(character),
      ...draft.attributes,
      homeland: draft.homeland ?? "Temeria",
      school: draft.school ?? "Lobo",
      lifepath: draft.lifepath ?? "",
    },
  );
  const bundle: CharacterBundle = {
    character,
    store,
    sheetDefinitionId: NOIR_CHRONICLE_SHEET.id,
    source: "local",
  };

  upsertBundle({
    character,
    store,
    sheetDefinitionId: bundle.sheetDefinitionId,
  });

  return bundle;
}

export async function loadCharacterBundle(characterId?: string | null): Promise<CharacterBundle> {
  const records = readPersistedBundles();
  const preferredId = characterId ?? getLatestCharacterId();
  const record =
    (preferredId
      ? records.find((entry) => entry.character.id === preferredId)
      : null) ?? records[0];

  if (!record) {
    return createSeedBundle();
  }

  const migratedStore = migratePersistedStore(record.character, record.store);
  setLatestCharacterId(record.character.id);

  return {
    character: record.character,
    store: migratedStore,
    sheetDefinitionId: record.sheetDefinitionId || NOIR_CHRONICLE_SHEET.id,
    source: "local",
  };
}

export async function persistCharacterBundle(
  character: CharacterRecord,
  store: AttributeStore,
  sheetDefinitionId: string,
  _persistedBy: string,
): Promise<CharacterBundle> {
  const nextCharacter = mergeCharacterWithStore(character, store);
  const bundle: CharacterBundle = {
    character: nextCharacter,
    store,
    sheetDefinitionId,
    source: "local",
  };

  upsertBundle({
    character: nextCharacter,
    store,
    sheetDefinitionId,
  });

  return bundle;
}

function mesaSessionStorageKey(campaignId?: string | null) {
  return `${MESA_SESSION_KEY_PREFIX}:${campaignId ?? LOCAL_SESSION_ID}`;
}

export async function ensureMesaSession(campaignId?: string | null): Promise<GameSessionRow | null> {
  if (!canUseStorage()) {
    return null;
  }

  const sessionId = campaignId ?? LOCAL_SESSION_ID;
  const storageKey = mesaSessionStorageKey(sessionId);
  const raw = window.localStorage.getItem(storageKey);

  if (raw) {
    try {
      return JSON.parse(raw) as GameSessionRow;
    } catch {
      // Fall through and rebuild the local mesa session.
    }
  }

  const now = new Date().toISOString();
  const session: GameSessionRow = {
    id: sessionId,
    name: campaignId ? `Campanha ${campaignId}` : "Mesa local",
    description: campaignId
      ? "Sessao local em torno de uma campanha nomeada, pronta para migrar ao realtime dedicado."
      : "Sessao persistida localmente para manter a mesa ativa neste navegador.",
    created_at: now,
    updated_at: now,
    current_round: 1,
    game_master_id: LOCAL_USER_ID,
    is_active: true,
    max_players: 6,
  };

  window.localStorage.setItem(storageKey, JSON.stringify(session));
  return session;
}
