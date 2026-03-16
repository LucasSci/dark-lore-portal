import { describe, expect, it } from "vitest";
import {
  BOARD_COLUMNS,
  BOARD_ROWS,
  createSceneModel,
  createBoard,
  createInitialFog,
  createInitiativeOrder,
  getNextInitiativeTurn,
  getNextOpenPosition,
  addSceneNpc,
  addScenePage,
  connectScenePages,
  configureSceneBattlemap,
  expandScenePage,
  moveSceneToken,
  recordSceneRoll,
  travelSceneEdge,
  revealFogArea,
  setSceneCamera,
  setSceneCameraScale,
  startSceneInitiative,
  advanceSceneInitiative,
} from "@/lib/virtual-tabletop";

describe("virtual tabletop helpers", () => {
  it("creates the expected board shape and labels", () => {
    const board = createBoard();

    expect(board).toHaveLength(BOARD_COLUMNS * BOARD_ROWS);
    expect(board[0]).toMatchObject({ label: "A1" });
    expect(board.at(-1)).toMatchObject({ label: "L8" });
    expect(board.find((cell) => cell.label === "G5")).toMatchObject({ terrain: "altar" });
  });

  it("reveals a bounded area in the fog grid", () => {
    const fog = createInitialFog(6, 6);
    const revealed = revealFogArea(fog, 0, 0, 1, 6, 6);

    expect(revealed["0:0"]).toBe(true);
    expect(revealed["1:0"]).toBe(true);
    expect(revealed["0:1"]).toBe(true);
    expect(revealed["1:1"]).toBe(true);
    expect(revealed["5:5"]).toBe(false);
  });

  it("finds the next available position for new NPCs", () => {
    const position = getNextOpenPosition([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 0, y: 1 },
    ], 4, 4);

    expect(position).toEqual({ x: 3, y: 0 });
  });

  it("builds initiative order using total, then bonus, then name", () => {
    const rolls = [0.4, 0.45, 0.4];
    let index = 0;
    const random = () => rolls[index++] ?? 0.1;

    const order = createInitiativeOrder(
      [
        { id: "a", name: "Aria", team: "party", initiativeBonus: 2, hp: 10 },
        { id: "b", name: "Borin", team: "party", initiativeBonus: 1, hp: 10 },
        { id: "c", name: "Cultista", team: "npc", initiativeBonus: 2, hp: 10 },
      ],
      random,
    );

    expect(order.map((entry) => entry.tokenId)).toEqual(["a", "c", "b"]);
    expect(order[0].total).toBe(order[1].total);
    expect(order[0].bonus).toBe(order[1].bonus);
    expect(order[0].name < order[1].name).toBe(true);
  });

  it("advances turns while skipping defeated combatants and reporting wraps", () => {
    const order = [
      { tokenId: "a", name: "Aria", team: "party" as const, total: 18, bonus: 2 },
      { tokenId: "b", name: "Borin", team: "party" as const, total: 14, bonus: 1 },
      { tokenId: "c", name: "Cultista", team: "npc" as const, total: 12, bonus: 2 },
    ];
    const livingIds = new Set(["a", "c"]);

    expect(getNextInitiativeTurn(order, "a", livingIds)).toEqual({
      nextId: "c",
      wrapped: false,
    });

    expect(getNextInitiativeTurn(order, "c", livingIds)).toEqual({
      nextId: "a",
      wrapped: true,
    });
  });

  it("creates a scene model with a page and token objects", () => {
    const scene = createSceneModel();

    expect(scene.pages).toHaveLength(1);
    expect(scene.objects.length).toBeGreaterThan(0);
    expect(scene.selectedObjectId).toBeTruthy();
  });

  it("moves a token and keeps payload and object position in sync", () => {
    const scene = createSceneModel();
    const tokenId = scene.selectedObjectId!;
    const moved = moveSceneToken(scene, tokenId, 4, 5);
    const token = moved.objects.find((entry) => entry.id === tokenId);

    expect(token?.objectType).toBe("token");
    if (token?.objectType === "token") {
      expect(token.position).toEqual({ x: 4, y: 5 });
      expect(token.payload.x).toBe(4);
      expect(token.payload.y).toBe(5);
    }
  });

  it("adjusts camera scale within allowed bounds", () => {
    const scene = createSceneModel();
    const zoomedIn = setSceneCameraScale(scene, "in");
    const zoomedOut = setSceneCameraScale(scene, "out");
    const reset = setSceneCameraScale(zoomedIn, "reset");

    expect(zoomedIn.pages[0].camera.scale).toBeGreaterThan(scene.pages[0].camera.scale);
    expect(zoomedOut.pages[0].camera.scale).toBeLessThanOrEqual(scene.pages[0].camera.scale);
    expect(reset.pages[0].camera.scale).toBe(1);
  });

  it("updates the active page camera with explicit coordinates", () => {
    const scene = createSceneModel();
    const updated = setSceneCamera(scene, { x: 48, y: -32, scale: 1.45 });

    expect(updated.pages[0].camera).toEqual({ x: 48, y: -32, scale: 1.45 });
  });

  it("starts and advances initiative inside the scene model", () => {
    const scene = startSceneInitiative(createSceneModel());
    const advanced = advanceSceneInitiative(scene);

    expect(scene.initiative.entries.length).toBeGreaterThan(0);
    expect(scene.initiative.round).toBe(1);
    expect(advanced.initiative.activeTurnId).toBeTruthy();
  });

  it("records a dice roll and mirrors it into the chat log", () => {
    const scene = createSceneModel();
    const updated = recordSceneRoll(scene, "Narrador", "1d20+4", [16], 20);

    expect(updated.diceHistory[0]).toMatchObject({
      actor: "Narrador",
      notation: "1d20+4",
      total: 20,
    });
    expect(updated.chatMessages.at(-1)).toMatchObject({
      author: "Narrador",
      tone: "roll",
    });
  });

  it("spawns an NPC at the requested position when provided", () => {
    const scene = createSceneModel();
    const updated = addSceneNpc(scene, {
      name: "Sentinela Teste",
      hp: 24,
      ac: 15,
      initiativeBonus: 2,
      notes: "Teste de drop do codex.",
      position: { x: 5, y: 1 },
    });
    const token = updated.objects.find((entry) => entry.id === updated.selectedObjectId);

    expect(token?.objectType).toBe("token");
    if (token?.objectType === "token") {
      expect(token.position).toEqual({ x: 5, y: 1 });
      expect(token.payload.hp).toBe(24);
    }
  });

  it("configures a battlemap and clamps tokens inside the new grid", () => {
    const scene = createSceneModel();
    const moved = moveSceneToken(scene, scene.selectedObjectId!, 11, 7);
    const configured = configureSceneBattlemap(moved, {
      width: 6,
      height: 4,
      gridSize: 64,
      backgroundAssetId: "asset-map-1",
      backgroundAssetUrl: "https://example.com/map.webp",
    });
    const token = configured.objects.find((entry) => entry.id === configured.selectedObjectId);

    expect(configured.pages[0]).toMatchObject({
      width: 6,
      height: 4,
      gridSize: 64,
      backgroundAssetId: "asset-map-1",
      backgroundAssetUrl: "https://example.com/map.webp",
      backgroundFrame: {
        x: 0,
        y: 0,
        width: 6,
        height: 4,
      },
    });
    expect(configured.pages[0].cells).toHaveLength(24);
    expect(Object.values(configured.pages[0].fog).every(Boolean)).toBe(true);

    expect(token?.objectType).toBe("token");
    if (token?.objectType === "token") {
      expect(token.position).toEqual({ x: 5, y: 3 });
      expect(token.payload.x).toBe(5);
      expect(token.payload.y).toBe(3);
    }
  });

  it("creates connected pages and travels a token through an edge", () => {
    const scene = createSceneModel();
    const expanded = addScenePage(scene, {
      name: "Dunas Externas",
      region: "Korath",
      focus: false,
    });
    const targetPage = expanded.pages.find((page) => page.name === "Dunas Externas");

    expect(targetPage).toBeTruthy();

    if (!targetPage) {
      return;
    }

    const linked = connectScenePages(expanded, {
      pageId: expanded.activePageId,
      targetPageId: targetPage.id,
      edge: "east",
      label: "Passagem para as dunas",
      spawnX: 1,
      spawnY: 2,
    });
    const travelled = travelSceneEdge(linked, "east", linked.selectedObjectId);
    const token = travelled.objects.find((entry) => entry.id === travelled.selectedObjectId);

    expect(linked.pages[0].connections).toHaveLength(1);
    expect(travelled.activePageId).toBe(targetPage.id);
    expect(token?.objectType).toBe("token");

    if (token?.objectType === "token") {
      expect(token.pageId).toBe(targetPage.id);
      expect(token.position).toEqual({ x: 1, y: 2 });
    }
  });

  it("expands a page to the west without stretching the imported battlemap", () => {
    const scene = createSceneModel();
    const configured = configureSceneBattlemap(scene, {
      width: 6,
      height: 4,
      gridSize: 64,
      backgroundAssetId: "asset-map-2",
      backgroundAssetUrl: "https://example.com/map-2.webp",
      resetFrame: true,
    });
    const moved = moveSceneToken(configured, configured.selectedObjectId!, 2, 1);
    const expanded = expandScenePage(moved, "west", 2);
    const token = expanded.objects.find((entry) => entry.id === expanded.selectedObjectId);

    expect(expanded.pages[0]).toMatchObject({
      width: 8,
      height: 4,
      backgroundFrame: {
        x: 2,
        y: 0,
        width: 6,
        height: 4,
      },
    });

    expect(token?.objectType).toBe("token");
    if (token?.objectType === "token") {
      expect(token.position).toEqual({ x: 4, y: 1 });
      expect(token.payload.x).toBe(4);
      expect(token.payload.y).toBe(1);
    }
  });
});
