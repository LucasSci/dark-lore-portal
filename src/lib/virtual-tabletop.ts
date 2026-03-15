export const BOARD_COLUMNS = 12;
export const BOARD_ROWS = 8;
export const DEFAULT_GRID_SIZE = 72;

export type TerrainType = "ruins" | "road" | "forest" | "swamp" | "altar";
export type TokenTeam = "party" | "npc";
export type BoardMode = "move" | "fog" | "measure";
export type VttLayer = "map" | "objects" | "gm" | "walls" | "foreground";
export type VttGridType = "square";
export type ChatTone = "system" | "party" | "npc" | "roll";

export interface TabletopCell {
  id: string;
  x: number;
  y: number;
  label: string;
  terrain: TerrainType;
}

export interface TabletopToken {
  id: string;
  name: string;
  shortName: string;
  team: TokenTeam;
  role: string;
  x: number;
  y: number;
  hp: number;
  hpMax: number;
  ac: number;
  initiativeBonus: number;
  color: string;
  note: string;
  controlledBy: "gm" | "party";
}

export interface InitiativeEntry {
  tokenId: string;
  name: string;
  team: TokenTeam;
  total: number;
  bonus: number;
}

export interface InitiativeState {
  entries: InitiativeEntry[];
  activeTurnId: string | null;
  round: number;
}

export type FogState = Record<string, boolean>;

export interface ChatMessage {
  id: string;
  author: string;
  tone: ChatTone;
  text: string;
  time: string;
}

export interface DiceHistoryEntry {
  id: string;
  actor: string;
  notation: string;
  results: number[];
  total: number;
}

export interface VttPage {
  id: string;
  sessionId: string;
  name: string;
  gridType: VttGridType;
  gridSize: number;
  width: number;
  height: number;
  backgroundAssetId: string | null;
  layerOrder: VttLayer[];
  cells: TabletopCell[];
  fog: FogState;
  camera: {
    x: number;
    y: number;
    scale: number;
  };
}

export type SceneCamera = VttPage["camera"];

export interface VttTokenObject {
  id: string;
  pageId: string;
  objectType: "token";
  layer: "objects" | "gm";
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  rotation: number;
  payload: TabletopToken;
  revision: number;
}

export interface VttWall {
  id: string;
  pageId: string;
  objectType: "wall";
  layer: "walls";
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  rotation: number;
  payload: {
    points: Array<{ x: number; y: number }>;
    blocksSight: boolean;
  };
  revision: number;
}

export interface VttDrawing {
  id: string;
  pageId: string;
  objectType: "drawing";
  layer: "foreground" | "gm";
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  rotation: number;
  payload: {
    kind: "rect" | "ellipse" | "polygon";
    stroke: string;
    fill: string;
  };
  revision: number;
}

export interface VttLightSource {
  id: string;
  pageId: string;
  objectType: "light";
  layer: "walls";
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  rotation: number;
  payload: {
    radius: number;
    intensity: number;
    color: string;
  };
  revision: number;
}

export type VttSceneObject = VttTokenObject | VttWall | VttDrawing | VttLightSource;

export interface ScenePermissions {
  role: "gm" | "player";
  canEditFog: boolean;
  canEditTokens: boolean;
  canBroadcast: boolean;
}

export interface PresenceMember {
  key: string;
  displayName: string;
  role: "gm" | "player";
  joinedAt: string;
}

export interface SceneModel {
  sessionId: string;
  activePageId: string;
  pages: VttPage[];
  objects: VttSceneObject[];
  initiative: InitiativeState;
  permissions: ScenePermissions;
  revision: number;
  boardMode: BoardMode;
  selectedObjectId: string | null;
  chatMessages: ChatMessage[];
  diceHistory: DiceHistoryEntry[];
  presence: PresenceMember[];
}

export interface AssetManifest {
  assetId: string;
  kind: "map" | "token" | "portrait";
  mimeType: string;
  original: string;
  variants: {
    board_variant?: string | null;
    thumb_variant?: string | null;
    zoom_variant?: string | null;
  };
  gridMetadata: {
    columns: number;
    rows: number;
    gridSize: number;
    offsetX: number;
    offsetY: number;
  };
  pageCount: number;
  processingStatus: "pending" | "processing" | "ready" | "failed";
}

export const TERRAIN_META: Record<
  TerrainType,
  {
    label: string;
    background: string;
    border: string;
  }
> = {
  ruins: {
    label: "Ruinas",
    background:
      "linear-gradient(145deg, rgba(92, 82, 70, 0.56), rgba(30, 24, 22, 0.96))",
    border: "rgba(214, 182, 125, 0.16)",
  },
  road: {
    label: "Estrada",
    background:
      "linear-gradient(145deg, rgba(128, 98, 54, 0.48), rgba(51, 37, 22, 0.94))",
    border: "rgba(239, 202, 124, 0.2)",
  },
  forest: {
    label: "Floresta",
    background:
      "linear-gradient(145deg, rgba(46, 87, 58, 0.66), rgba(13, 34, 24, 0.96))",
    border: "rgba(90, 160, 103, 0.18)",
  },
  swamp: {
    label: "Pantano",
    background:
      "linear-gradient(145deg, rgba(61, 79, 53, 0.7), rgba(18, 29, 24, 0.98))",
    border: "rgba(117, 146, 89, 0.18)",
  },
  altar: {
    label: "Altar",
    background:
      "radial-gradient(circle at top, rgba(243, 200, 109, 0.34), rgba(84, 56, 31, 0.92) 50%, rgba(21, 13, 11, 0.98) 100%)",
    border: "rgba(244, 200, 109, 0.28)",
  },
};

const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function stampTime() {
  return timeFormatter.format(new Date());
}

function cellId(x: number, y: number) {
  return `${x}:${y}`;
}

function cellLabel(x: number, y: number) {
  return `${String.fromCharCode(65 + x)}${y + 1}`;
}

function shortNameFrom(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (!parts.length) {
    return "NPC";
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);
}

function resolveTerrain(
  x: number,
  y: number,
  columns: number,
  rows: number,
): TerrainType {
  const altarX = Math.floor(columns / 2);
  const altarY = Math.floor(rows / 2);

  if (x === altarX && y === altarY) {
    return "altar";
  }

  if (x === altarX || y === altarY) {
    return "road";
  }

  if (x <= 1 || y <= 1 || x >= columns - 2 || y >= rows - 2) {
    return "ruins";
  }

  if (x < 3 && y > rows - 3) {
    return "swamp";
  }

  return (x + y) % 3 === 0 ? "forest" : "ruins";
}

export function createBoard(
  columns: number = BOARD_COLUMNS,
  rows: number = BOARD_ROWS,
): TabletopCell[] {
  const cells: TabletopCell[] = [];

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < columns; x += 1) {
      cells.push({
        id: cellId(x, y),
        x,
        y,
        label: cellLabel(x, y),
        terrain: resolveTerrain(x, y, columns, rows),
      });
    }
  }

  return cells;
}

export function createInitialFog(
  columns: number = BOARD_COLUMNS,
  rows: number = BOARD_ROWS,
): FogState {
  const fog: FogState = {};

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < columns; x += 1) {
      fog[cellId(x, y)] =
        x <= 3 || (x <= 6 && y >= Math.floor(rows / 2) - 1 && y <= Math.floor(rows / 2) + 1);
    }
  }

  return fog;
}

export function revealFogArea(
  fog: FogState,
  centerX: number,
  centerY: number,
  radius: number = 1,
  columns: number = BOARD_COLUMNS,
  rows: number = BOARD_ROWS,
): FogState {
  const nextFog = { ...fog };

  for (let y = Math.max(0, centerY - radius); y <= Math.min(rows - 1, centerY + radius); y += 1) {
    for (let x = Math.max(0, centerX - radius); x <= Math.min(columns - 1, centerX + radius); x += 1) {
      nextFog[cellId(x, y)] = true;
    }
  }

  return nextFog;
}

export function revealAllFog(
  columns: number = BOARD_COLUMNS,
  rows: number = BOARD_ROWS,
): FogState {
  const fog: FogState = {};

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < columns; x += 1) {
      fog[cellId(x, y)] = true;
    }
  }

  return fog;
}

export function countRevealedCells(fog: FogState) {
  return Object.values(fog).filter(Boolean).length;
}

export function createDemoTokens(): TabletopToken[] {
  return [
    {
      id: "pc-thorin",
      name: "Thorin",
      shortName: "TH",
      team: "party",
      role: "Tanque",
      x: 1,
      y: 3,
      hp: 42,
      hpMax: 52,
      ac: 18,
      initiativeBonus: 1,
      color:
        "linear-gradient(145deg, rgba(246, 214, 138, 0.96), rgba(131, 89, 27, 0.96))",
      note: "Segura a linha de frente e protege o altar.",
      controlledBy: "party",
    },
    {
      id: "pc-elara",
      name: "Elara",
      shortName: "EL",
      team: "party",
      role: "Controle",
      x: 2,
      y: 2,
      hp: 22,
      hpMax: 22,
      ac: 13,
      initiativeBonus: 4,
      color:
        "linear-gradient(145deg, rgba(157, 123, 255, 0.94), rgba(74, 43, 158, 0.96))",
      note: "Canaliza magia ritual e limpa a neblina.",
      controlledBy: "party",
    },
    {
      id: "pc-grimshaw",
      name: "Grimshaw",
      shortName: "GR",
      team: "party",
      role: "Suporte",
      x: 1,
      y: 4,
      hp: 31,
      hpMax: 34,
      ac: 16,
      initiativeBonus: 0,
      color:
        "linear-gradient(145deg, rgba(105, 199, 167, 0.94), rgba(24, 97, 77, 0.96))",
      note: "Mantem a moral da equipe e cura ferimentos.",
      controlledBy: "party",
    },
    {
      id: "npc-sentinel",
      name: "Sentinela Sombria",
      shortName: "SS",
      team: "npc",
      role: "Guarda",
      x: 8,
      y: 3,
      hp: 24,
      hpMax: 24,
      ac: 14,
      initiativeBonus: 2,
      color:
        "linear-gradient(145deg, rgba(255, 128, 96, 0.96), rgba(135, 29, 29, 0.96))",
      note: "Patrulha o corredor e avanca quando a porta runica abre.",
      controlledBy: "gm",
    },
    {
      id: "npc-ghoul-a",
      name: "Ghoul da Cripta",
      shortName: "GC",
      team: "npc",
      role: "Emboscada",
      x: 9,
      y: 2,
      hp: 16,
      hpMax: 16,
      ac: 12,
      initiativeBonus: 3,
      color:
        "linear-gradient(145deg, rgba(205, 93, 73, 0.96), rgba(90, 19, 27, 0.96))",
      note: "Ataca alvos isolados na retaguarda.",
      controlledBy: "gm",
    },
    {
      id: "npc-ghoul-b",
      name: "Ghoul da Cripta",
      shortName: "GB",
      team: "npc",
      role: "Emboscada",
      x: 9,
      y: 4,
      hp: 16,
      hpMax: 16,
      ac: 12,
      initiativeBonus: 3,
      color:
        "linear-gradient(145deg, rgba(205, 93, 73, 0.96), rgba(90, 19, 27, 0.96))",
      note: "Protege o flanco do altar e fecha rotas de fuga.",
      controlledBy: "gm",
    },
  ];
}

export function getNextOpenPosition(
  tokens: Array<Pick<TabletopToken, "x" | "y">>,
  columns: number = BOARD_COLUMNS,
  rows: number = BOARD_ROWS,
) {
  const occupied = new Set(tokens.map((token) => cellId(token.x, token.y)));

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < columns; x += 1) {
      if (!occupied.has(cellId(x, y))) {
        return { x, y };
      }
    }
  }

  return { x: 0, y: 0 };
}

function rollD20(random: () => number = Math.random) {
  return Math.floor(random() * 20) + 1;
}

export function createInitiativeOrder(
  tokens: Array<Pick<TabletopToken, "id" | "name" | "team" | "initiativeBonus" | "hp">>,
  random: () => number = Math.random,
): InitiativeEntry[] {
  return tokens
    .filter((token) => token.hp > 0)
    .map((token) => ({
      tokenId: token.id,
      name: token.name,
      team: token.team,
      bonus: token.initiativeBonus,
      total: rollD20(random) + token.initiativeBonus,
    }))
    .sort((left, right) => {
      if (right.total !== left.total) {
        return right.total - left.total;
      }

      if (right.bonus !== left.bonus) {
        return right.bonus - left.bonus;
      }

      return left.name.localeCompare(right.name, "pt-BR");
    });
}

export function getNextInitiativeTurn(
  order: InitiativeEntry[],
  currentId: string | null,
  livingTokenIds: Set<string>,
) {
  const livingOrder = order.filter((entry) => livingTokenIds.has(entry.tokenId));

  if (!livingOrder.length) {
    return { nextId: null, wrapped: false };
  }

  if (!currentId) {
    return { nextId: livingOrder[0].tokenId, wrapped: false };
  }

  const currentIndex = livingOrder.findIndex((entry) => entry.tokenId === currentId);

  if (currentIndex === -1) {
    return { nextId: livingOrder[0].tokenId, wrapped: false };
  }

  const nextIndex = (currentIndex + 1) % livingOrder.length;

  return {
    nextId: livingOrder[nextIndex].tokenId,
    wrapped: nextIndex === 0,
  };
}

export function createInitialChat(): ChatMessage[] {
  return [
    {
      id: makeId("chat"),
      author: "Sistema",
      tone: "system",
      text: "Mesa da Cripta de Velkyn pronta. Jogadores podem mover tokens, rolar dados e falar no chat.",
      time: stampTime(),
    },
    {
      id: makeId("chat"),
      author: "Narrador",
      tone: "party",
      text: "A porta do santuario se abriu. A neblina cobre o corredor alem do altar.",
      time: stampTime(),
    },
  ];
}

function createDemoPage(sessionId: string): VttPage {
  return {
    id: "page-crypt",
    sessionId,
    name: "Cripta de Velkyn",
    gridType: "square",
    gridSize: DEFAULT_GRID_SIZE,
    width: BOARD_COLUMNS,
    height: BOARD_ROWS,
    backgroundAssetId: null,
    layerOrder: ["map", "objects", "gm", "walls", "foreground"],
    cells: createBoard(),
    fog: createInitialFog(),
    camera: {
      x: 0,
      y: 0,
      scale: 1,
    },
  };
}

export function createTokenObject(token: TabletopToken, pageId: string): VttTokenObject {
  return {
    id: token.id,
    pageId,
    objectType: "token",
    layer: token.controlledBy === "gm" ? "gm" : "objects",
    position: {
      x: token.x,
      y: token.y,
    },
    size: {
      width: 1,
      height: 1,
    },
    rotation: 0,
    payload: token,
    revision: 1,
  };
}

export function createSceneModel(sessionId: string = "demo-session"): SceneModel {
  const page = createDemoPage(sessionId);
  const objects = createDemoTokens().map((token) => createTokenObject(token, page.id));

  return {
    sessionId,
    activePageId: page.id,
    pages: [page],
    objects,
    initiative: {
      entries: [],
      activeTurnId: null,
      round: 0,
    },
    permissions: {
      role: "gm",
      canEditFog: true,
      canEditTokens: true,
      canBroadcast: true,
    },
    revision: 1,
    boardMode: "move",
    selectedObjectId: objects[0]?.id ?? null,
    chatMessages: createInitialChat(),
    diceHistory: [],
    presence: [],
  };
}

export function getActivePage(scene: SceneModel) {
  return scene.pages.find((page) => page.id === scene.activePageId) ?? scene.pages[0] ?? null;
}

export function getSceneTokens(scene: SceneModel) {
  return scene.objects.filter((object): object is VttTokenObject => object.objectType === "token");
}

export function getSelectedToken(scene: SceneModel) {
  return getSceneTokens(scene).find((token) => token.id === scene.selectedObjectId) ?? null;
}

function bumpScene(scene: SceneModel, partial: Partial<SceneModel>): SceneModel {
  return {
    ...scene,
    ...partial,
    revision: scene.revision + 1,
  };
}

function updateActivePage(scene: SceneModel, updater: (page: VttPage) => VttPage) {
  return bumpScene(scene, {
    pages: scene.pages.map((page) =>
      page.id === scene.activePageId ? updater(page) : page,
    ),
  });
}

export function setSceneSelection(scene: SceneModel, objectId: string | null) {
  return bumpScene(scene, { selectedObjectId: objectId });
}

export function setBoardMode(scene: SceneModel, mode: BoardMode) {
  return bumpScene(scene, { boardMode: mode });
}

export function moveSceneToken(scene: SceneModel, tokenId: string, x: number, y: number) {
  return bumpScene(scene, {
    objects: scene.objects.map((object) => {
      if (object.objectType !== "token" || object.id !== tokenId) {
        return object;
      }

      return {
        ...object,
        position: { x, y },
        revision: object.revision + 1,
        payload: {
          ...object.payload,
          x,
          y,
        },
      };
    }),
  });
}

export function setSceneCameraScale(scene: SceneModel, direction: "in" | "out" | "reset") {
  return updateActivePage(scene, (page) => {
    const scale =
      direction === "reset"
        ? 1
        : direction === "in"
          ? Math.min(1.8, page.camera.scale + 0.1)
          : Math.max(0.6, page.camera.scale - 0.1);

    return {
      ...page,
      camera: {
        ...page.camera,
        scale: Number(scale.toFixed(2)),
      },
    };
  });
}

export function setSceneCamera(scene: SceneModel, camera: SceneCamera) {
  return updateActivePage(scene, (page) => ({
    ...page,
    camera: {
      x: Number(camera.x.toFixed(2)),
      y: Number(camera.y.toFixed(2)),
      scale: Number(Math.max(0.55, Math.min(2.1, camera.scale)).toFixed(2)),
    },
  }));
}

export function toggleSceneFogCell(scene: SceneModel, cellIdValue: string) {
  return updateActivePage(scene, (page) => ({
    ...page,
    fog: {
      ...page.fog,
      [cellIdValue]: !page.fog[cellIdValue],
    },
  }));
}

export function revealSceneFogAround(scene: SceneModel, centerX: number, centerY: number, radius: number = 1) {
  return updateActivePage(scene, (page) => ({
    ...page,
    fog: revealFogArea(page.fog, centerX, centerY, radius, page.width, page.height),
  }));
}

export function revealEntireSceneFog(scene: SceneModel) {
  return updateActivePage(scene, (page) => ({
    ...page,
    fog: revealAllFog(page.width, page.height),
  }));
}

export function restoreSceneFog(scene: SceneModel) {
  return updateActivePage(scene, (page) => ({
    ...page,
    fog: createInitialFog(page.width, page.height),
  }));
}

export function adjustSceneTokenHp(scene: SceneModel, tokenId: string, delta: number) {
  return bumpScene(scene, {
    objects: scene.objects.map((object) => {
      if (object.objectType !== "token" || object.id !== tokenId) {
        return object;
      }

      const hp = Math.max(0, Math.min(object.payload.hpMax, object.payload.hp + delta));

      return {
        ...object,
        revision: object.revision + 1,
        payload: {
          ...object.payload,
          hp,
        },
      };
    }),
  });
}

export function addSceneNpc(scene: SceneModel, draft: {
  name: string;
  hp: number;
  ac: number;
  initiativeBonus: number;
  notes: string;
  role?: string;
  color?: string;
  team?: TokenTeam;
  controlledBy?: "gm" | "party";
  position?: {
    x: number;
    y: number;
  };
}) {
  const tokens = getSceneTokens(scene).map((token) => token.payload);
  const position = draft.position ?? getNextOpenPosition(tokens);
  const page = getActivePage(scene);

  if (!page) {
    return scene;
  }

  const token: TabletopToken = {
    id: makeId("npc"),
    name: draft.name.trim(),
    shortName: shortNameFrom(draft.name),
    team: draft.team ?? "npc",
    role: draft.role?.trim() || "NPC",
    x: position.x,
    y: position.y,
    hp: draft.hp,
    hpMax: draft.hp,
    ac: draft.ac,
    initiativeBonus: draft.initiativeBonus,
    color:
      draft.color ??
      "linear-gradient(145deg, rgba(244, 128, 88, 0.96), rgba(116, 26, 36, 0.96))",
    note: draft.notes.trim() || "NPC controlado pelo mestre.",
    controlledBy: draft.controlledBy ?? "gm",
  };

  return bumpScene(scene, {
    objects: [...scene.objects, createTokenObject(token, page.id)],
    selectedObjectId: token.id,
  });
}

export function startSceneInitiative(scene: SceneModel) {
  const entries = createInitiativeOrder(getSceneTokens(scene).map((token) => token.payload));

  return bumpScene(scene, {
    initiative: {
      entries,
      activeTurnId: entries[0]?.tokenId ?? null,
      round: entries.length ? 1 : 0,
    },
  });
}

export function advanceSceneInitiative(scene: SceneModel) {
  const livingIds = new Set(
    getSceneTokens(scene)
      .filter((token) => token.payload.hp > 0)
      .map((token) => token.id),
  );
  const { nextId, wrapped } = getNextInitiativeTurn(
    scene.initiative.entries,
    scene.initiative.activeTurnId,
    livingIds,
  );

  if (!nextId) {
    return bumpScene(scene, {
      initiative: {
        entries: [],
        activeTurnId: null,
        round: 0,
      },
    });
  }

  return bumpScene(scene, {
    initiative: {
      ...scene.initiative,
      activeTurnId: nextId,
      round: wrapped ? scene.initiative.round + 1 : scene.initiative.round,
    },
  });
}

export function clearSceneInitiative(scene: SceneModel) {
  return bumpScene(scene, {
    initiative: {
      entries: [],
      activeTurnId: null,
      round: 0,
    },
  });
}

export function appendSceneChat(scene: SceneModel, author: string, text: string, tone: ChatTone) {
  return bumpScene(scene, {
    chatMessages: [
      ...scene.chatMessages.slice(-39),
      {
        id: makeId("chat"),
        author,
        text,
        tone,
        time: stampTime(),
      },
    ],
  });
}

export function appendSceneRoll(
  scene: SceneModel,
  actor: string,
  notation: string,
  results: number[],
  total: number,
) {
  return bumpScene(scene, {
    diceHistory: [
      {
        id: makeId("roll"),
        actor,
        notation,
        results,
        total,
      },
      ...scene.diceHistory.slice(0, 7),
    ],
  });
}

export function recordSceneRoll(
  scene: SceneModel,
  actor: string,
  notation: string,
  results: number[],
  total: number,
) {
  return bumpScene(scene, {
    diceHistory: [
      {
        id: makeId("roll"),
        actor,
        notation,
        results,
        total,
      },
      ...scene.diceHistory.slice(0, 7),
    ],
    chatMessages: [
      ...scene.chatMessages.slice(-39),
      {
        id: makeId("chat"),
        author: actor,
        text: `${notation} -> [${results.join(", ")}] = ${total}`,
        tone: "roll",
        time: stampTime(),
      },
    ],
  });
}

export function setScenePresence(scene: SceneModel, presence: PresenceMember[]) {
  return {
    ...scene,
    presence,
  };
}

export function getPositionLabel(x: number, y: number) {
  return `${String.fromCharCode(65 + x)}${y + 1}`;
}
