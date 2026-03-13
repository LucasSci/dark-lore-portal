export const BOARD_COLUMNS = 12;
export const BOARD_ROWS = 8;

export type TerrainType = "ruins" | "road" | "forest" | "swamp" | "altar";
export type TokenTeam = "party" | "npc";

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

export type FogState = Record<string, boolean>;

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

function cellId(x: number, y: number) {
  return `${x}:${y}`;
}

function cellLabel(x: number, y: number) {
  return `${String.fromCharCode(65 + x)}${y + 1}`;
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
