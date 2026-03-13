import { describe, expect, it } from "vitest";
import {
  BOARD_COLUMNS,
  BOARD_ROWS,
  createBoard,
  createInitialFog,
  createInitiativeOrder,
  getNextInitiativeTurn,
  getNextOpenPosition,
  revealFogArea,
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
});
