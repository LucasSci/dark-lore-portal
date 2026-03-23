export const BOARD_COLUMNS = 12;
export const BOARD_ROWS = 8;
export const DEFAULT_GRID_SIZE = 72;

export type TerrainType = "ruins" | "road" | "forest" | "swamp" | "altar";
export type TokenTeam = "party" | "npc";
export type BoardMode = "move" | "fog" | "measure" | "wall" | "light";
export type VttLayer = "map" | "objects" | "gm" | "walls" | "foreground";
export type VttGridType = "square";
export type PageConnectionEdge = "north" | "east" | "south" | "west";
export type ChatTone = "system" | "party" | "npc" | "roll";
export type SceneEventType =
  | "TOKEN_MOVED"
  | "TOKEN_UPDATED"
  | "OBJECT_CREATED"
  | "OBJECT_REMOVED"
  | "FOG_UPDATED"
  | "INITIATIVE_SNAPSHOT"
  | "CHAT_APPENDED"
  | "PAGE_SWITCHED"
  | "PRESENCE_HEARTBEAT";

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

export interface WallSegmentData {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface LightSourceData {
  id: string;
  cellX: number;
  cellY: number;
  radius: number;
  intensity: number;
  color: number;
}

export interface PageConnection {
  id: string;
  edge: PageConnectionEdge;
  label: string;
  targetPageId: string;
  spawn: {
    x: number;
    y: number;
  };
}

export interface BattlemapFrame {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface VttPage {
  id: string;
  sessionId: string;
  name: string;
  region: string;
  gridType: VttGridType;
  gridSize: number;
  width: number;
  height: number;
  backgroundAssetId: string | null;
  backgroundAssetUrl: string | null;
  backgroundFrame: BattlemapFrame | null;
  layerOrder: VttLayer[];
  connections: PageConnection[];
  cells: TabletopCell[];
  fog: FogState;
  camera: {
    x: number;
    y: number;
    scale: number;
  };
  wallSegments: WallSegmentData[];
  lightSources: LightSourceData[];
  dynamicLighting: boolean;
  tokenVisionRadius: number; // default vision radius for party tokens (cells)
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

export interface VttMapDecal {
  id: string;
  pageId: string;
  objectType: "map-decal";
  layer: "map" | "foreground";
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
    assetId: string | null;
    imageUrl: string | null;
    opacity: number;
    blendMode: "normal" | "multiply" | "screen";
  };
  revision: number;
}

export interface VttMeasurement {
  id: string;
  pageId: string;
  objectType: "measurement";
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
    from: { x: number; y: number };
    to: { x: number; y: number };
    distance: number;
    unit: string;
    label: string;
  };
  revision: number;
}

export type VttSceneObject =
  | VttTokenObject
  | VttWall
  | VttDrawing
  | VttLightSource
  | VttMapDecal
  | VttMeasurement;

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

export interface SceneEvent {
  type: SceneEventType;
  sessionId: string;
  pageId: string | null;
  revision: number;
  actorId: string | null;
  createdAt: string;
  payload: Record<string, unknown>;
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

function normalizeBattlemapFrame(
  frame: Partial<BattlemapFrame> | null | undefined,
  boardWidth: number,
  boardHeight: number,
): BattlemapFrame | null {
  if (!frame) {
    return null;
  }

  const width = Math.max(1, Math.min(boardWidth, Math.round(frame.width ?? boardWidth)));
  const height = Math.max(1, Math.min(boardHeight, Math.round(frame.height ?? boardHeight)));
  const maxX = Math.max(0, boardWidth - width);
  const maxY = Math.max(0, boardHeight - height);

  return {
    x: Math.max(0, Math.min(maxX, Math.round(frame.x ?? 0))),
    y: Math.max(0, Math.min(maxY, Math.round(frame.y ?? 0))),
    width,
    height,
  };
}

function createFullBoardBattlemapFrame(boardWidth: number, boardHeight: number): BattlemapFrame {
  return {
    x: 0,
    y: 0,
    width: boardWidth,
    height: boardHeight,
  };
}

function shiftFogState(
  fog: FogState,
  previousWidth: number,
  previousHeight: number,
  nextWidth: number,
  nextHeight: number,
  offsetX: number,
  offsetY: number,
) {
  const nextFog = createInitialFog(nextWidth, nextHeight);

  for (let y = 0; y < previousHeight; y += 1) {
    for (let x = 0; x < previousWidth; x += 1) {
      const nextX = x + offsetX;
      const nextY = y + offsetY;

      if (nextX < 0 || nextY < 0 || nextX >= nextWidth || nextY >= nextHeight) {
        continue;
      }

      nextFog[`${nextX}:${nextY}`] = Boolean(fog[`${x}:${y}`]);
    }
  }

  return nextFog;
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
  return `${prefix}-${makeEntityId().slice(0, 8)}`;
}

export function makeEntityId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    let random: number;
    if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
      random = crypto.getRandomValues(new Uint8Array(1))[0] % 16;
    } else {
      random = Math.floor(Math.random() * 16);
    }
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
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

function clampPosition(value: number, max: number) {
  return Math.max(0, Math.min(max, value));
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
      id: makeEntityId(),
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
      id: makeEntityId(),
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
      id: makeEntityId(),
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
      id: makeEntityId(),
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
      id: makeEntityId(),
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
      id: makeEntityId(),
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

export function createScenePage(
  sessionId: string,
  name: string,
  options: Partial<
    Pick<
      VttPage,
      "gridSize" | "width" | "height" | "region" | "backgroundAssetId" | "backgroundAssetUrl" | "backgroundFrame"
    >
  > = {},
): VttPage {
  const width = options.width ?? BOARD_COLUMNS;
  const height = options.height ?? BOARD_ROWS;
  const gridSize = options.gridSize ?? DEFAULT_GRID_SIZE;
  const backgroundFrame = normalizeBattlemapFrame(
    options.backgroundFrame ??
      (options.backgroundAssetId || options.backgroundAssetUrl
        ? createFullBoardBattlemapFrame(width, height)
        : null),
    width,
    height,
  );

  return {
    id: makeEntityId(),
    sessionId,
    name,
    region: options.region ?? name,
    gridType: "square",
    gridSize,
    width,
    height,
    backgroundAssetId: options.backgroundAssetId ?? null,
    backgroundAssetUrl: options.backgroundAssetUrl ?? null,
    backgroundFrame,
    layerOrder: ["map", "objects", "gm", "walls", "foreground"],
    connections: [],
    cells: createBoard(width, height),
    fog: createInitialFog(width, height),
    camera: {
      x: 0,
      y: 0,
      scale: 1,
    },
    wallSegments: [],
    lightSources: [],
    dynamicLighting: false,
    tokenVisionRadius: 6,
  };
}

function createDemoPage(sessionId: string): VttPage {
  return {
    ...createScenePage(sessionId, "Cripta de Velkyn", {
      region: "Velkyn",
    }),
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

function findSceneObject(scene: SceneModel, objectId: string) {
  return scene.objects.find((object) => object.id === objectId) ?? null;
}

function upsertSceneObject(scene: SceneModel, incoming: VttSceneObject) {
  const existing = findSceneObject(scene, incoming.id);

  if (!existing) {
    return bumpScene(scene, {
      objects: [...scene.objects, incoming],
      selectedObjectId: incoming.id,
    });
  }

  return bumpScene(scene, {
    objects: scene.objects.map((object) => (object.id === incoming.id ? incoming : object)),
  });
}

function withSceneRevision(scene: SceneModel, revision: number) {
  return {
    ...scene,
    revision,
  };
}

export function createSceneEvent(
  scene: SceneModel,
  type: SceneEventType,
  payload: Record<string, unknown>,
  pageId: string | null = scene.activePageId,
  actorId: string | null = null,
): SceneEvent {
  return {
    type,
    sessionId: scene.sessionId,
    pageId,
    revision: scene.revision,
    actorId,
    createdAt: new Date().toISOString(),
    payload,
  };
}

export function applySceneEvent(scene: SceneModel, event: SceneEvent) {
  if (event.sessionId !== scene.sessionId || event.revision <= scene.revision) {
    return scene;
  }

  switch (event.type) {
    case "TOKEN_MOVED": {
      const tokenId = typeof event.payload.tokenId === "string" ? event.payload.tokenId : null;
      const x = typeof event.payload.x === "number" ? event.payload.x : null;
      const y = typeof event.payload.y === "number" ? event.payload.y : null;

      if (!tokenId || x === null || y === null) {
        return scene;
      }

      return withSceneRevision(moveSceneToken(scene, tokenId, x, y), event.revision);
    }
    case "TOKEN_UPDATED": {
      const token = event.payload.token as VttSceneObject | undefined;

      if (!token || token.objectType !== "token") {
        return scene;
      }

      return withSceneRevision(upsertSceneObject(scene, token), event.revision);
    }
    case "OBJECT_CREATED": {
      const object = event.payload.object as VttSceneObject | undefined;

      if (!object) {
        return scene;
      }

      return withSceneRevision(upsertSceneObject(scene, object), event.revision);
    }
    case "OBJECT_REMOVED": {
      const objectId = typeof event.payload.objectId === "string" ? event.payload.objectId : null;

      if (!objectId) {
        return scene;
      }

      return withSceneRevision(bumpScene(scene, {
        objects: scene.objects.filter((object) => object.id !== objectId),
        selectedObjectId: scene.selectedObjectId === objectId ? null : scene.selectedObjectId,
      }), event.revision);
    }
    case "FOG_UPDATED": {
      const fog = event.payload.fog as FogState | undefined;

      if (!fog || !event.pageId) {
        return scene;
      }

      return withSceneRevision(bumpScene(scene, {
        pages: scene.pages.map((page) =>
          page.id === event.pageId
            ? { ...page, fog }
            : page,
        ),
      }), event.revision);
    }
    case "INITIATIVE_SNAPSHOT": {
      const initiative = event.payload.initiative as InitiativeState | undefined;

      if (!initiative) {
        return scene;
      }

      return withSceneRevision(bumpScene(scene, { initiative }), event.revision);
    }
    case "CHAT_APPENDED": {
      const message = event.payload.message as ChatMessage | undefined;

      if (!message) {
        return scene;
      }

      return withSceneRevision(bumpScene(scene, {
        chatMessages: [
          ...scene.chatMessages
            .filter((entry) => entry.id !== message.id)
            .slice(-39),
          message,
        ],
      }), event.revision);
    }
    case "PAGE_SWITCHED": {
      const nextPageId = typeof event.payload.pageId === "string" ? event.payload.pageId : null;

      if (!nextPageId) {
        return scene;
      }

      return withSceneRevision(bumpScene(scene, { activePageId: nextPageId }), event.revision);
    }
    case "PRESENCE_HEARTBEAT":
    default:
      return scene;
  }
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

export function addScenePage(
  scene: SceneModel,
  draft: {
    name: string;
    region?: string;
    width?: number;
    height?: number;
    gridSize?: number;
    focus?: boolean;
  },
) {
  const page = createScenePage(scene.sessionId, draft.name.trim() || "Nova Area", {
    region: draft.region?.trim() || draft.name.trim() || "Nova Area",
    width: draft.width ?? getActivePage(scene)?.width ?? BOARD_COLUMNS,
    height: draft.height ?? getActivePage(scene)?.height ?? BOARD_ROWS,
    gridSize: draft.gridSize ?? getActivePage(scene)?.gridSize ?? DEFAULT_GRID_SIZE,
  });

  return bumpScene(scene, {
    pages: [...scene.pages, page],
    activePageId: draft.focus === false ? scene.activePageId : page.id,
  });
}

export function connectScenePages(
  scene: SceneModel,
  options: {
    pageId: string;
    targetPageId: string;
    edge: PageConnectionEdge;
    label: string;
    spawnX: number;
    spawnY: number;
  },
) {
  const targetPage = scene.pages.find((page) => page.id === options.targetPageId);

  if (!targetPage) {
    return scene;
  }

  const connection: PageConnection = {
    id: makeId("connection"),
    edge: options.edge,
    label: options.label.trim() || targetPage.name,
    targetPageId: options.targetPageId,
    spawn: {
      x: clampPosition(Math.round(options.spawnX), targetPage.width - 1),
      y: clampPosition(Math.round(options.spawnY), targetPage.height - 1),
    },
  };

  return bumpScene(scene, {
    pages: scene.pages.map((page) =>
      page.id === options.pageId
        ? {
            ...page,
            connections: [
              ...page.connections.filter(
                (item) =>
                  !(item.edge === options.edge && item.targetPageId === options.targetPageId),
              ),
              connection,
            ],
          }
        : page,
    ),
  });
}

export function removeSceneConnection(
  scene: SceneModel,
  pageId: string,
  connectionId: string,
) {
  return bumpScene(scene, {
    pages: scene.pages.map((page) =>
      page.id === pageId
        ? {
            ...page,
            connections: page.connections.filter((connection) => connection.id !== connectionId),
          }
        : page,
    ),
  });
}

export function travelSceneConnection(
  scene: SceneModel,
  options: {
    connectionId: string;
    tokenId?: string | null;
  },
) {
  const currentPage = getActivePage(scene);

  if (!currentPage) {
    return scene;
  }

  const connection = currentPage.connections.find((item) => item.id === options.connectionId);
  const targetPage = scene.pages.find((page) => page.id === connection?.targetPageId);

  if (!connection || !targetPage) {
    return scene;
  }

  return bumpScene(scene, {
    activePageId: targetPage.id,
    selectedObjectId: options.tokenId ?? scene.selectedObjectId,
    objects: scene.objects.map((object) => {
      if (
        object.objectType !== "token" ||
        !options.tokenId ||
        object.id !== options.tokenId
      ) {
        return object;
      }

      return {
        ...object,
        pageId: targetPage.id,
        position: {
          x: clampPosition(connection.spawn.x, targetPage.width - 1),
          y: clampPosition(connection.spawn.y, targetPage.height - 1),
        },
        revision: object.revision + 1,
        payload: {
          ...object.payload,
          x: clampPosition(connection.spawn.x, targetPage.width - 1),
          y: clampPosition(connection.spawn.y, targetPage.height - 1),
        },
      };
    }),
  });
}

export function travelSceneEdge(
  scene: SceneModel,
  edge: PageConnectionEdge,
  tokenId?: string | null,
) {
  const currentPage = getActivePage(scene);
  const connection = currentPage?.connections.find((item) => item.edge === edge);

  if (!connection) {
    return scene;
  }

  return travelSceneConnection(scene, {
    connectionId: connection.id,
    tokenId,
  });
}

export function configureSceneBattlemap(
  scene: SceneModel,
  config: {
    width: number;
    height: number;
    gridSize: number;
    backgroundAssetId?: string | null;
    backgroundAssetUrl?: string | null;
    resetFrame?: boolean;
  },
) {
  const activePage = getActivePage(scene);

  if (!activePage) {
    return scene;
  }

  const width = Math.max(1, Math.round(config.width));
  const height = Math.max(1, Math.round(config.height));
  const gridSize = Math.max(32, Math.round(config.gridSize));
  const receivedNewAsset =
    config.backgroundAssetId !== undefined || config.backgroundAssetUrl !== undefined;
  const hasBattlemapAsset = Boolean(
    config.backgroundAssetId ?? config.backgroundAssetUrl ?? activePage.backgroundAssetId ?? activePage.backgroundAssetUrl,
  );
  const backgroundFrame = config.resetFrame || receivedNewAsset
    ? hasBattlemapAsset
      ? createFullBoardBattlemapFrame(width, height)
      : null
    : normalizeBattlemapFrame(activePage.backgroundFrame, width, height);
  const nextFog = config.resetFrame || receivedNewAsset
    ? revealAllFog(width, height)
    : shiftFogState(activePage.fog, activePage.width, activePage.height, width, height, 0, 0);

  return bumpScene(scene, {
    pages: scene.pages.map((page) =>
      page.id === activePage.id
        ? {
            ...page,
            width,
            height,
            gridSize,
            backgroundAssetId:
              config.backgroundAssetId !== undefined
                ? config.backgroundAssetId
                : page.backgroundAssetId,
            backgroundAssetUrl:
              config.backgroundAssetUrl !== undefined
                ? config.backgroundAssetUrl
                : page.backgroundAssetUrl,
            backgroundFrame,
            cells: createBoard(width, height),
            fog: nextFog,
          }
        : page,
    ),
    objects: scene.objects.map((object) => {
      if (object.pageId !== activePage.id || object.objectType !== "token") {
        return object;
      }

      const nextX = Math.max(0, Math.min(width - 1, object.position.x));
      const nextY = Math.max(0, Math.min(height - 1, object.position.y));

      if (nextX === object.position.x && nextY === object.position.y) {
        return object;
      }

      return {
        ...object,
        position: { x: nextX, y: nextY },
        revision: object.revision + 1,
        payload: {
          ...object.payload,
          x: nextX,
          y: nextY,
        },
      };
    }),
  });
}

export function expandScenePage(
  scene: SceneModel,
  edge: PageConnectionEdge,
  amount: number = 2,
) {
  const activePage = getActivePage(scene);

  if (!activePage) {
    return scene;
  }

  const growth = Math.max(1, Math.round(amount));
  const offsetX = edge === "west" ? growth : 0;
  const offsetY = edge === "north" ? growth : 0;
  const nextWidth =
    edge === "east" || edge === "west" ? activePage.width + growth : activePage.width;
  const nextHeight =
    edge === "north" || edge === "south" ? activePage.height + growth : activePage.height;

  return bumpScene(scene, {
    pages: scene.pages.map((page) => {
      if (page.id !== activePage.id) {
        return page;
      }

      const shiftedFrame = page.backgroundFrame
        ? {
            ...page.backgroundFrame,
            x: page.backgroundFrame.x + offsetX,
            y: page.backgroundFrame.y + offsetY,
          }
        : null;

      return {
        ...page,
        width: nextWidth,
        height: nextHeight,
        backgroundFrame: normalizeBattlemapFrame(shiftedFrame, nextWidth, nextHeight),
        cells: createBoard(nextWidth, nextHeight),
        fog: shiftFogState(
          page.fog,
          page.width,
          page.height,
          nextWidth,
          nextHeight,
          offsetX,
          offsetY,
        ),
        camera: {
          ...page.camera,
          x: Number((page.camera.x - offsetX * page.gridSize).toFixed(2)),
          y: Number((page.camera.y - offsetY * page.gridSize).toFixed(2)),
        },
      };
    }),
    objects: scene.objects.map((object) => {
      if (object.pageId !== activePage.id) {
        return object;
      }

      const position = {
        x: object.position.x + offsetX,
        y: object.position.y + offsetY,
      };

      if (object.objectType === "token") {
        const clampedX = clampPosition(position.x, nextWidth - 1);
        const clampedY = clampPosition(position.y, nextHeight - 1);

        return {
          ...object,
          position: {
            x: clampedX,
            y: clampedY,
          },
          revision: object.revision + 1,
          payload: {
            ...object.payload,
            x: clampedX,
            y: clampedY,
          },
        };
      }

      if (object.objectType === "measurement") {
        return {
          ...object,
          position,
          revision: object.revision + 1,
          payload: {
            ...object.payload,
            from: {
              x: object.payload.from.x + offsetX,
              y: object.payload.from.y + offsetY,
            },
            to: {
              x: object.payload.to.x + offsetX,
              y: object.payload.to.y + offsetY,
            },
          },
        };
      }

      if (object.objectType === "wall") {
        return {
          ...object,
          position,
          revision: object.revision + 1,
          payload: {
            ...object.payload,
            points: object.payload.points.map((point) => ({
              x: point.x + offsetX,
              y: point.y + offsetY,
            })),
          },
        };
      }

      return {
        ...object,
        position,
        revision: object.revision + 1,
      };
    }),
  });
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
    id: makeEntityId(),
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

// ── Wall management ─────────────────────────────────────────────

export function addSceneWall(
  scene: SceneModel,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
) {
  return updateActivePage(scene, (page) => ({
    ...page,
    wallSegments: [
      ...page.wallSegments,
      { id: makeId("wall"), x1, y1, x2, y2 },
    ],
  }));
}

export function removeSceneWall(scene: SceneModel, wallId: string) {
  return updateActivePage(scene, (page) => ({
    ...page,
    wallSegments: page.wallSegments.filter((w) => w.id !== wallId),
  }));
}

export function clearSceneWalls(scene: SceneModel) {
  return updateActivePage(scene, (page) => ({
    ...page,
    wallSegments: [],
  }));
}

// ── Light source management ─────────────────────────────────────

export function addSceneLight(
  scene: SceneModel,
  cellX: number,
  cellY: number,
  radius: number = 5,
  intensity: number = 0.8,
  color: number = 0xf5c842,
) {
  return updateActivePage(scene, (page) => ({
    ...page,
    lightSources: [
      ...page.lightSources,
      { id: makeId("light"), cellX, cellY, radius, intensity, color },
    ],
  }));
}

export function removeSceneLight(scene: SceneModel, lightId: string) {
  return updateActivePage(scene, (page) => ({
    ...page,
    lightSources: page.lightSources.filter((l) => l.id !== lightId),
  }));
}

export function clearSceneLights(scene: SceneModel) {
  return updateActivePage(scene, (page) => ({
    ...page,
    lightSources: [],
  }));
}

// ── Dynamic lighting toggle ─────────────────────────────────────

export function toggleDynamicLighting(scene: SceneModel) {
  return updateActivePage(scene, (page) => ({
    ...page,
    dynamicLighting: !page.dynamicLighting,
  }));
}

export function setTokenVisionRadius(scene: SceneModel, radius: number) {
  return updateActivePage(scene, (page) => ({
    ...page,
    tokenVisionRadius: Math.max(1, Math.min(20, radius)),
  }));
}
