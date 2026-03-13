import { useEffect, useRef } from "react";
import {
  Application,
  Container,
  Graphics,
  Text,
  TextStyle,
} from "pixi.js";

import type {
  BoardMode,
  TabletopCell,
  VttPage,
  VttTokenObject,
} from "@/lib/virtual-tabletop";
import { TERRAIN_META } from "@/lib/virtual-tabletop";

interface Props {
  page: VttPage;
  tokens: VttTokenObject[];
  selectedTokenId: string | null;
  boardMode: BoardMode;
  onCellClick: (cell: TabletopCell) => void;
  onSelectToken: (tokenId: string) => void;
  onMoveToken: (tokenId: string, x: number, y: number) => void;
}

const TERRAIN_COLORS = {
  ruins: 0x4b3b31,
  road: 0x6c5330,
  forest: 0x244a32,
  swamp: 0x394a33,
  altar: 0x8a5b25,
} as const;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export default function VttPixiStage({
  page,
  tokens,
  selectedTokenId,
  boardMode,
  onCellClick,
  onSelectToken,
  onMoveToken,
}: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const appRef = useRef<Application | null>(null);
  const worldRef = useRef<Container | null>(null);

  useEffect(() => {
    let disposed = false;
    const host = hostRef.current;

    if (!host) {
      return;
    }

    const app = new Application();

    void (async () => {
      await app.init({
        antialias: true,
        backgroundAlpha: 0,
        width: host.clientWidth || 960,
        height: Math.max(520, host.clientWidth * 0.56 || 560),
        resolution: window.devicePixelRatio || 1,
      });

      if (disposed) {
        await app.destroy(true, { children: true });
        return;
      }

      const world = new Container();
      world.eventMode = "static";
      world.sortableChildren = true;
      app.stage.addChild(world);

      host.appendChild(app.canvas);
      appRef.current = app;
      worldRef.current = world;

      const resizeObserver = new ResizeObserver((entries) => {
        const entry = entries[0];

        if (!entry) {
          return;
        }

        const width = Math.max(320, entry.contentRect.width);
        const height = Math.max(460, width * 0.58);
        app.renderer.resize(width, height);
      });

      resizeObserver.observe(host);

      (host as HTMLDivElement & { __pixiCleanup?: () => void }).__pixiCleanup = () => {
        resizeObserver.disconnect();
      };
    })();

    return () => {
      disposed = true;
      const node = host as HTMLDivElement & { __pixiCleanup?: () => void };
      node.__pixiCleanup?.();
      node.__pixiCleanup = undefined;

      const appInstance = appRef.current;
      appRef.current = null;
      worldRef.current = null;

      if (appInstance) {
        void appInstance.destroy(true, { children: true });
      }
    };
  }, []);

  useEffect(() => {
    const app = appRef.current;
    const world = worldRef.current;

    if (!app || !world) {
      return;
    }

    world.removeChildren();

    const gridSize = page.gridSize;
    const boardWidth = page.width * gridSize;
    const boardHeight = page.height * gridSize;
    const paddingX = Math.max(24, (app.renderer.width - boardWidth * page.camera.scale) / 2);
    const paddingY = Math.max(24, (app.renderer.height - boardHeight * page.camera.scale) / 2);

    world.x = paddingX + page.camera.x;
    world.y = paddingY + page.camera.y;
    world.scale.set(page.camera.scale);

    const background = new Graphics();
    background.roundRect(-18, -18, boardWidth + 36, boardHeight + 36, 28);
    background.fill({ color: 0x090b12, alpha: 0.94 });
    background.stroke({ color: 0x2a2f44, alpha: 0.8, width: 2 });
    world.addChild(background);

    for (const cell of page.cells) {
      const meta = TERRAIN_META[cell.terrain];
      const terrainColor = TERRAIN_COLORS[cell.terrain];
      const cellGraphic = new Graphics();
      cellGraphic.position.set(cell.x * gridSize, cell.y * gridSize);
      cellGraphic.rect(0, 0, gridSize, gridSize);
      cellGraphic.fill({ color: terrainColor, alpha: 0.3 });
      cellGraphic.stroke({ color: terrainColor, alpha: 0.78, width: 1 });
      cellGraphic.eventMode = "static";
      cellGraphic.cursor = "pointer";
      cellGraphic.on("pointertap", () => onCellClick(cell));
      world.addChild(cellGraphic);

      const label = new Text({
        text: cell.label,
        style: new TextStyle({
          fill: 0xd9dce8,
          fontSize: 10,
          fontFamily: "IBM Plex Mono",
          fontWeight: "500",
          letterSpacing: 1,
        }),
      });
      label.position.set(cell.x * gridSize + 8, cell.y * gridSize + 6);
      label.alpha = 0.64;
      world.addChild(label);

      if (!page.fog[cell.id]) {
        const fog = new Graphics();
        fog.position.set(cell.x * gridSize, cell.y * gridSize);
        fog.rect(0, 0, gridSize, gridSize);
        fog.fill({ color: 0x06070d, alpha: 0.92 });
        fog.stroke({ color: 0x10141f, alpha: 0.8, width: 1 });
        world.addChild(fog);
      }
    }

    for (const token of tokens) {
      const container = new Container();
      const centerX = token.position.x * gridSize + gridSize / 2;
      const centerY = token.position.y * gridSize + gridSize / 2;
      container.position.set(centerX, centerY);
      container.zIndex = token.id === selectedTokenId ? 20 : 10;

      const ring = new Graphics();
      ring.circle(0, 0, gridSize * 0.37);
      ring.stroke({
        color: token.id === selectedTokenId ? 0x8b5cf6 : token.payload.team === "party" ? 0x2dd4bf : 0xf97316,
        alpha: 0.95,
        width: token.id === selectedTokenId ? 4 : 2,
      });
      container.addChild(ring);

      const tokenBody = new Graphics();
      tokenBody.circle(0, 0, gridSize * 0.3);
      tokenBody.fill({
        color: token.payload.team === "party" ? 0x2563eb : 0xb91c1c,
        alpha: 0.92,
      });
      tokenBody.stroke({ color: 0xf8fafc, alpha: 0.28, width: 2 });
      container.addChild(tokenBody);

      const shortName = new Text({
        text: token.payload.shortName,
        style: new TextStyle({
          fill: 0xf8fafc,
          fontSize: 17,
          fontFamily: "Fraunces",
          fontWeight: "700",
        }),
      });
      shortName.anchor.set(0.5);
      shortName.y = -2;
      container.addChild(shortName);

      let dragging = false;
      let dragOffset = { x: 0, y: 0 };

      const endDrag = (globalX: number, globalY: number) => {
        if (!dragging) {
          return;
        }

        dragging = false;
        container.alpha = 1;
        const localX = (globalX - world.x) / world.scale.x;
        const localY = (globalY - world.y) / world.scale.y;
        const cellX = clamp(Math.floor(localX / gridSize), 0, page.width - 1);
        const cellY = clamp(Math.floor(localY / gridSize), 0, page.height - 1);
        onMoveToken(token.id, cellX, cellY);
      };

      container.eventMode = "static";
      container.cursor = boardMode === "move" ? "grab" : "pointer";
      container.on("pointertap", () => onSelectToken(token.id));
      container.on("pointerdown", (event) => {
        onSelectToken(token.id);

        if (boardMode !== "move") {
          return;
        }

        dragging = true;
        container.alpha = 0.9;
        const local = world.toLocal(event.global);
        dragOffset = {
          x: container.x - local.x,
          y: container.y - local.y,
        };
      });
      container.on("globalpointermove", (event) => {
        if (!dragging) {
          return;
        }

        const local = world.toLocal(event.global);
        container.position.set(local.x + dragOffset.x, local.y + dragOffset.y);
      });
      container.on("pointerup", (event) => {
        endDrag(event.global.x, event.global.y);
      });
      container.on("pointerupoutside", (event) => {
        endDrag(event.global.x, event.global.y);
      });

      world.addChild(container);
    }
  }, [boardMode, onCellClick, onMoveToken, onSelectToken, page, selectedTokenId, tokens]);

  return <div ref={hostRef} className="min-h-[520px] w-full overflow-hidden rounded-[var(--radius)] border border-border/70 bg-background/45" />;
}
