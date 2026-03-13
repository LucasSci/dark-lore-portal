import { useCallback, useEffect, useRef, useState } from "react";
import {
  Application,
  Container,
  Graphics,
  Text,
  TextStyle,
  Sprite,
  Texture,
  Assets,
} from "pixi.js";

import type {
  BoardMode,
  TabletopCell,
  VttPage,
  VttTokenObject,
} from "@/lib/virtual-tabletop";

interface Props {
  page: VttPage;
  tokens: VttTokenObject[];
  selectedTokenId: string | null;
  boardMode: BoardMode;
  gridOpacity: number;
  gridColor: number;
  showGrid: boolean;
  battlemapUrl: string | null;
  onCellClick: (cell: TabletopCell) => void;
  onSelectToken: (tokenId: string) => void;
  onMoveToken: (tokenId: string, x: number, y: number) => void;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export default function VttPixiStage({
  page,
  tokens,
  selectedTokenId,
  boardMode,
  gridOpacity,
  gridColor,
  showGrid,
  battlemapUrl,
  onCellClick,
  onSelectToken,
  onMoveToken,
}: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const appRef = useRef<Application | null>(null);
  const worldRef = useRef<Container | null>(null);
  const [mapTexture, setMapTexture] = useState<Texture | null>(null);

  // Load battlemap texture
  useEffect(() => {
    if (!battlemapUrl) {
      setMapTexture(null);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const texture = await Assets.load(battlemapUrl);
        if (!cancelled) setMapTexture(texture);
      } catch {
        if (!cancelled) setMapTexture(null);
      }
    })();

    return () => { cancelled = true; };
  }, [battlemapUrl]);

  // Initialize PixiJS app
  useEffect(() => {
    let disposed = false;
    const host = hostRef.current;
    if (!host) return;

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
        if (!entry) return;
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
      if (appInstance) void appInstance.destroy(true, { children: true });
    };
  }, []);

  // Render scene
  useEffect(() => {
    const app = appRef.current;
    const world = worldRef.current;
    if (!app || !world) return;

    world.removeChildren();

    const gridSize = page.gridSize;
    const boardWidth = page.width * gridSize;
    const boardHeight = page.height * gridSize;
    const paddingX = Math.max(24, (app.renderer.width - boardWidth * page.camera.scale) / 2);
    const paddingY = Math.max(24, (app.renderer.height - boardHeight * page.camera.scale) / 2);

    world.x = paddingX + page.camera.x;
    world.y = paddingY + page.camera.y;
    world.scale.set(page.camera.scale);

    // Background frame
    const background = new Graphics();
    background.roundRect(-4, -4, boardWidth + 8, boardHeight + 8, 8);
    background.fill({ color: 0x090b12, alpha: 0.96 });
    background.stroke({ color: 0x2a2f44, alpha: 0.6, width: 2 });
    world.addChild(background);

    // Battlemap image
    if (mapTexture) {
      const mapSprite = new Sprite(mapTexture);
      mapSprite.width = boardWidth;
      mapSprite.height = boardHeight;
      mapSprite.zIndex = 1;
      world.addChild(mapSprite);
    } else {
      // Fallback dark surface
      const surface = new Graphics();
      surface.rect(0, 0, boardWidth, boardHeight);
      surface.fill({ color: 0x0d1017, alpha: 0.95 });
      surface.zIndex = 1;
      world.addChild(surface);
    }

    // Grid overlay
    if (showGrid) {
      const gridGraphics = new Graphics();
      gridGraphics.zIndex = 5;

      for (let x = 0; x <= page.width; x++) {
        gridGraphics.moveTo(x * gridSize, 0);
        gridGraphics.lineTo(x * gridSize, boardHeight);
      }
      for (let y = 0; y <= page.height; y++) {
        gridGraphics.moveTo(0, y * gridSize);
        gridGraphics.lineTo(boardWidth, y * gridSize);
      }
      gridGraphics.stroke({ color: gridColor, alpha: gridOpacity, width: 1 });

      world.addChild(gridGraphics);
    }

    // Cell labels and interactivity
    for (const cell of page.cells) {
      const cellGraphic = new Graphics();
      cellGraphic.position.set(cell.x * gridSize, cell.y * gridSize);
      cellGraphic.rect(0, 0, gridSize, gridSize);
      cellGraphic.fill({ color: 0x000000, alpha: 0.001 }); // invisible hit area
      cellGraphic.eventMode = "static";
      cellGraphic.cursor = boardMode === "fog" ? "crosshair" : "pointer";
      cellGraphic.zIndex = 6;
      cellGraphic.on("pointertap", () => onCellClick(cell));
      world.addChild(cellGraphic);

      // Cell coordinate label (subtle)
      if (showGrid && (cell.x === 0 || cell.y === 0)) {
        const label = new Text({
          text: cell.label,
          style: new TextStyle({
            fill: 0xd9dce8,
            fontSize: 9,
            fontFamily: "IBM Plex Mono",
            fontWeight: "500",
            letterSpacing: 1,
          }),
        });
        label.position.set(cell.x * gridSize + 4, cell.y * gridSize + 3);
        label.alpha = 0.4;
        label.zIndex = 7;
        world.addChild(label);
      }
    }

    // Fog of war
    for (const cell of page.cells) {
      if (!page.fog[cell.id]) {
        const fog = new Graphics();
        fog.position.set(cell.x * gridSize, cell.y * gridSize);
        fog.rect(0, 0, gridSize, gridSize);
        fog.fill({ color: 0x06070d, alpha: 0.92 });
        fog.zIndex = 15;
        world.addChild(fog);
      }
    }

    // Tokens
    for (const token of tokens) {
      const container = new Container();
      const centerX = token.position.x * gridSize + gridSize / 2;
      const centerY = token.position.y * gridSize + gridSize / 2;
      container.position.set(centerX, centerY);
      container.zIndex = token.id === selectedTokenId ? 20 : 10;

      const isSelected = token.id === selectedTokenId;
      const isParty = token.payload.team === "party";
      const isDead = token.payload.hp <= 0;

      // Selection glow
      if (isSelected) {
        const glow = new Graphics();
        glow.circle(0, 0, gridSize * 0.44);
        glow.fill({ color: 0x8b5cf6, alpha: 0.15 });
        container.addChild(glow);
      }

      // Token ring
      const ring = new Graphics();
      ring.circle(0, 0, gridSize * 0.37);
      ring.stroke({
        color: isSelected ? 0x8b5cf6 : isParty ? 0x2dd4bf : 0xf97316,
        alpha: isDead ? 0.4 : 0.95,
        width: isSelected ? 4 : 2,
      });
      container.addChild(ring);

      // Token body
      const tokenBody = new Graphics();
      tokenBody.circle(0, 0, gridSize * 0.3);
      tokenBody.fill({
        color: isParty ? 0x2563eb : 0xb91c1c,
        alpha: isDead ? 0.3 : 0.92,
      });
      tokenBody.stroke({ color: 0xf8fafc, alpha: 0.28, width: 2 });
      container.addChild(tokenBody);

      // HP bar
      if (!isDead) {
        const hpPercent = token.payload.hp / token.payload.hpMax;
        const barWidth = gridSize * 0.5;
        const barHeight = 4;
        const barX = -barWidth / 2;
        const barY = gridSize * 0.28;

        const hpBg = new Graphics();
        hpBg.roundRect(barX, barY, barWidth, barHeight, 2);
        hpBg.fill({ color: 0x000000, alpha: 0.6 });
        container.addChild(hpBg);

        const hpFill = new Graphics();
        hpFill.roundRect(barX, barY, barWidth * hpPercent, barHeight, 2);
        hpFill.fill({ color: hpPercent > 0.5 ? 0x22c55e : hpPercent > 0.25 ? 0xeab308 : 0xef4444, alpha: 0.9 });
        container.addChild(hpFill);
      }

      // Dead X
      if (isDead) {
        const skull = new Text({
          text: "✕",
          style: new TextStyle({ fill: 0xef4444, fontSize: 22, fontWeight: "700" }),
        });
        skull.anchor.set(0.5);
        container.addChild(skull);
      } else {
        // Short name
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
      }

      // Drag handling
      let dragging = false;
      let dragOffset = { x: 0, y: 0 };

      const endDrag = (globalX: number, globalY: number) => {
        if (!dragging) return;
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
        if (boardMode !== "move") return;
        dragging = true;
        container.alpha = 0.9;
        const local = world.toLocal(event.global);
        dragOffset = { x: container.x - local.x, y: container.y - local.y };
      });
      container.on("globalpointermove", (event) => {
        if (!dragging) return;
        const local = world.toLocal(event.global);
        container.position.set(local.x + dragOffset.x, local.y + dragOffset.y);
      });
      container.on("pointerup", (event) => endDrag(event.global.x, event.global.y));
      container.on("pointerupoutside", (event) => endDrag(event.global.x, event.global.y));

      world.addChild(container);
    }
  }, [boardMode, gridColor, gridOpacity, mapTexture, onCellClick, onMoveToken, onSelectToken, page, selectedTokenId, showGrid, tokens]);

  return (
    <div
      ref={hostRef}
      className="min-h-[520px] w-full overflow-hidden rounded-[var(--radius)] border border-border/70 bg-background/45"
    />
  );
}
