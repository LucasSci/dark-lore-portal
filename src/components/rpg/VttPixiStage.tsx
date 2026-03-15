import { useEffect, useRef, useState } from "react";
import {
  Application,
  Assets,
  Container,
  Graphics,
  Sprite,
  Text,
  TextStyle,
  Texture,
} from "pixi.js";

import type {
  BoardMode,
  LightSourceData,
  SceneCamera,
  TabletopCell,
  VttPage,
  VttTokenObject,
  WallSegmentData,
} from "@/lib/virtual-tabletop";
import {
  computeVisibilityPolygon,
  wallObjectsToSegments,
  type Segment,
} from "@/lib/vtt-lighting";

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
  onCameraChange: (camera: SceneCamera) => void;
  onDropEntry: (entrySlug: string, cell: TabletopCell) => void;
  onAddWall?: (x1: number, y1: number, x2: number, y2: number) => void;
  onAddLight?: (cellX: number, cellY: number) => void;
}

const CAMERA_SCALE_MIN = 0.55;
const CAMERA_SCALE_MAX = 2.1;
const PARTY_TOKEN_COLOR = 0x6e92a6;
const NPC_TOKEN_COLOR = 0xbb533b;
const SELECTED_TOKEN_COLOR = 0xcfab67;
const MEASURE_LINE_COLOR = 0xf5c842;
const MEASURE_CELL_COLOR = 0xf5c842;
const GRID_LABEL_STYLE = new TextStyle({
  fill: 0xe7dfd4,
  fontSize: 9,
  fontFamily: "IBM Plex Mono",
  fontWeight: "500",
  letterSpacing: 1,
});
const MEASURE_LABEL_STYLE = new TextStyle({
  fill: 0xffffff,
  fontSize: 13,
  fontFamily: "IBM Plex Mono",
  fontWeight: "700",
  letterSpacing: 0.5,
  dropShadow: {
    color: 0x000000,
    alpha: 0.7,
    distance: 1,
    blur: 3,
  },
});

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getBoardMetrics(
  page: VttPage,
  viewportWidth: number,
  viewportHeight: number,
  scale: number = page.camera.scale,
) {
  const boardWidth = page.width * page.gridSize;
  const boardHeight = page.height * page.gridSize;
  const paddingX = Math.max(24, (viewportWidth - boardWidth * scale) / 2);
  const paddingY = Math.max(24, (viewportHeight - boardHeight * scale) / 2);

  return {
    boardWidth,
    boardHeight,
    paddingX,
    paddingY,
  };
}

function getCellFromViewport(
  page: VttPage,
  viewportWidth: number,
  viewportHeight: number,
  viewportX: number,
  viewportY: number,
) {
  const metrics = getBoardMetrics(page, viewportWidth, viewportHeight);
  const boardX = (viewportX - metrics.paddingX - page.camera.x) / page.camera.scale;
  const boardY = (viewportY - metrics.paddingY - page.camera.y) / page.camera.scale;

  if (boardX < 0 || boardY < 0) {
    return null;
  }

  const cellX = Math.floor(boardX / page.gridSize);
  const cellY = Math.floor(boardY / page.gridSize);

  if (cellX < 0 || cellY < 0 || cellX >= page.width || cellY >= page.height) {
    return null;
  }

  return page.cells.find((cell) => cell.x === cellX && cell.y === cellY) ?? null;
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
  onCameraChange,
  onDropEntry,
}: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const appRef = useRef<Application | null>(null);
  const worldRef = useRef<Container | null>(null);
  const pageRef = useRef(page);
  const cameraChangeRef = useRef(onCameraChange);
  const dropEntryRef = useRef(onDropEntry);
  const panStateRef = useRef({
    active: false,
    originX: 0,
    originY: 0,
    cameraX: 0,
    cameraY: 0,
  });
  const measureRef = useRef<{
    active: boolean;
    startCellX: number;
    startCellY: number;
    endCellX: number;
    endCellY: number;
  }>({ active: false, startCellX: 0, startCellY: 0, endCellX: 0, endCellY: 0 });
  const boardModeRef = useRef(boardMode);
  const [mapTexture, setMapTexture] = useState<Texture | null>(null);
  const [measureState, setMeasureState] = useState<{
    active: boolean;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null>(null);

  useEffect(() => {
    pageRef.current = page;
    cameraChangeRef.current = onCameraChange;
    dropEntryRef.current = onDropEntry;
    boardModeRef.current = boardMode;
  }, [onCameraChange, onDropEntry, page, boardMode]);

  // Clear measure when leaving measure mode
  useEffect(() => {
    if (boardMode !== "measure") {
      measureRef.current.active = false;
      setMeasureState(null);
    }
  }, [boardMode]);

  useEffect(() => {
    if (!battlemapUrl) {
      setMapTexture(null);
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const texture = await Assets.load(battlemapUrl);

        if (!cancelled) {
          setMapTexture(texture);
        }
      } catch {
        if (!cancelled) {
          setMapTexture(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [battlemapUrl]);

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
        height: host.clientHeight || 560,
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
        const height = Math.max(320, entry.contentRect.height);
        app.renderer.resize(width, height);
      });

      const stopPan = () => {
        panStateRef.current.active = false;
        host.style.cursor = "";
      };

      const handleWheel = (event: WheelEvent) => {
        event.preventDefault();

        const currentPage = pageRef.current;
        const rect = host.getBoundingClientRect();
        const viewportX = event.clientX - rect.left;
        const viewportY = event.clientY - rect.top;
        const currentMetrics = getBoardMetrics(
          currentPage,
          app.renderer.width,
          app.renderer.height,
        );
        const boardX =
          (viewportX - currentMetrics.paddingX - currentPage.camera.x) /
          currentPage.camera.scale;
        const boardY =
          (viewportY - currentMetrics.paddingY - currentPage.camera.y) /
          currentPage.camera.scale;
        const nextScale = clamp(
          currentPage.camera.scale + (event.deltaY < 0 ? 0.12 : -0.12),
          CAMERA_SCALE_MIN,
          CAMERA_SCALE_MAX,
        );
        const nextMetrics = getBoardMetrics(
          currentPage,
          app.renderer.width,
          app.renderer.height,
          nextScale,
        );

        cameraChangeRef.current({
          x: Number((viewportX - nextMetrics.paddingX - boardX * nextScale).toFixed(2)),
          y: Number((viewportY - nextMetrics.paddingY - boardY * nextScale).toFixed(2)),
          scale: Number(nextScale.toFixed(2)),
        });
      };

      const viewportToCell = (clientX: number, clientY: number) => {
        const rect = host.getBoundingClientRect();
        const vx = clientX - rect.left;
        const vy = clientY - rect.top;
        const currentPage = pageRef.current;
        const m = getBoardMetrics(currentPage, app.renderer.width, app.renderer.height);
        const bx = (vx - m.paddingX - currentPage.camera.x) / currentPage.camera.scale;
        const by = (vy - m.paddingY - currentPage.camera.y) / currentPage.camera.scale;
        return {
          cellX: clamp(Math.floor(bx / currentPage.gridSize), 0, currentPage.width - 1),
          cellY: clamp(Math.floor(by / currentPage.gridSize), 0, currentPage.height - 1),
          inBounds: bx >= 0 && by >= 0 && bx < currentPage.width * currentPage.gridSize && by < currentPage.height * currentPage.gridSize,
        };
      };

      const handlePointerDown = (event: PointerEvent) => {
        // Right-click = pan
        if (event.button === 2) {
          event.preventDefault();
          panStateRef.current = {
            active: true,
            originX: event.clientX,
            originY: event.clientY,
            cameraX: pageRef.current.camera.x,
            cameraY: pageRef.current.camera.y,
          };
          host.style.cursor = "grabbing";
          return;
        }

        // Left-click in measure mode
        if (event.button === 0 && boardModeRef.current === "measure") {
          const { cellX, cellY, inBounds } = viewportToCell(event.clientX, event.clientY);
          if (!inBounds) return;

          if (!measureRef.current.active) {
            measureRef.current = { active: true, startCellX: cellX, startCellY: cellY, endCellX: cellX, endCellY: cellY };
            setMeasureState({ active: true, startX: cellX, startY: cellY, endX: cellX, endY: cellY });
          } else {
            // Second click ends measurement — keep it visible
            measureRef.current.active = false;
          }
        }
      };

      const handlePointerMove = (event: PointerEvent) => {
        // Measure drag
        if (measureRef.current.active && boardModeRef.current === "measure") {
          const { cellX, cellY } = viewportToCell(event.clientX, event.clientY);
          if (cellX !== measureRef.current.endCellX || cellY !== measureRef.current.endCellY) {
            measureRef.current.endCellX = cellX;
            measureRef.current.endCellY = cellY;
            setMeasureState({
              active: true,
              startX: measureRef.current.startCellX,
              startY: measureRef.current.startCellY,
              endX: cellX,
              endY: cellY,
            });
          }
          return;
        }

        if (!panStateRef.current.active) {
          return;
        }

        const currentPage = pageRef.current;

        cameraChangeRef.current({
          x: Number(
            (panStateRef.current.cameraX + (event.clientX - panStateRef.current.originX)).toFixed(2),
          ),
          y: Number(
            (panStateRef.current.cameraY + (event.clientY - panStateRef.current.originY)).toFixed(2),
          ),
          scale: currentPage.camera.scale,
        });
      };

      const handleContextMenu = (event: MouseEvent) => {
        event.preventDefault();
      };

      const handleDragOver = (event: DragEvent) => {
        if (!event.dataTransfer?.types.includes("application/x-dark-lore-entry")) {
          return;
        }

        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
      };

      const handleDrop = (event: DragEvent) => {
        event.preventDefault();

        const entrySlug = event.dataTransfer?.getData("application/x-dark-lore-entry");

        if (!entrySlug) {
          return;
        }

        const rect = host.getBoundingClientRect();
        const cell = getCellFromViewport(
          pageRef.current,
          app.renderer.width,
          app.renderer.height,
          event.clientX - rect.left,
          event.clientY - rect.top,
        );

        if (cell) {
          dropEntryRef.current(entrySlug, cell);
        }
      };

      resizeObserver.observe(host);
      host.addEventListener("wheel", handleWheel, { passive: false });
      host.addEventListener("pointerdown", handlePointerDown);
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", stopPan);
      host.addEventListener("contextmenu", handleContextMenu);
      host.addEventListener("dragover", handleDragOver);
      host.addEventListener("drop", handleDrop);

      (
        host as HTMLDivElement & {
          __pixiCleanup?: () => void;
        }
      ).__pixiCleanup = () => {
        resizeObserver.disconnect();
        host.removeEventListener("wheel", handleWheel);
        host.removeEventListener("pointerdown", handlePointerDown);
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", stopPan);
        host.removeEventListener("contextmenu", handleContextMenu);
        host.removeEventListener("dragover", handleDragOver);
        host.removeEventListener("drop", handleDrop);
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
        try {
          appInstance.stage.removeChildren();
          appInstance.destroy(true);
        } catch {
          // PixiJS texture pool may already be torn down
        }
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

    const { boardWidth, boardHeight, paddingX, paddingY } = getBoardMetrics(
      page,
      app.renderer.width,
      app.renderer.height,
    );

    world.x = paddingX + page.camera.x;
    world.y = paddingY + page.camera.y;
    world.scale.set(page.camera.scale);

    const frameLayer = new Container();
    frameLayer.zIndex = 0;
    const mapLayer = new Container();
    mapLayer.zIndex = 1;
    const gridLayer = new Container();
    gridLayer.zIndex = 5;
    const fogLayer = new Container();
    fogLayer.zIndex = 10;
    const interactionLayer = new Container();
    interactionLayer.zIndex = 15;
    const tokenLayer = new Container();
    tokenLayer.zIndex = 20;
    const gmLayer = new Container();
    gmLayer.zIndex = 25;
    const overlayLayer = new Container();
    overlayLayer.zIndex = 30;

    const background = new Graphics();
    background.roundRect(-6, -6, boardWidth + 12, boardHeight + 12, 12);
    background.fill({ color: 0x090806, alpha: 0.98 });
    background.stroke({ color: 0x5a4630, alpha: 0.55, width: 2 });
    frameLayer.addChild(background);

    if (mapTexture) {
      const mapSprite = new Sprite(mapTexture);
      mapSprite.width = boardWidth;
      mapSprite.height = boardHeight;
      mapLayer.addChild(mapSprite);
    } else {
      const surface = new Graphics();
      surface.rect(0, 0, boardWidth, boardHeight);
      surface.fill({ color: 0x14100d, alpha: 0.96 });
      surface.stroke({ color: 0x342a21, alpha: 0.55, width: 1 });
      mapLayer.addChild(surface);
    }

    if (showGrid) {
      const gridGraphics = new Graphics();

      for (let x = 0; x <= page.width; x += 1) {
        gridGraphics.moveTo(x * page.gridSize, 0);
        gridGraphics.lineTo(x * page.gridSize, boardHeight);
      }

      for (let y = 0; y <= page.height; y += 1) {
        gridGraphics.moveTo(0, y * page.gridSize);
        gridGraphics.lineTo(boardWidth, y * page.gridSize);
      }

      gridGraphics.stroke({ color: gridColor, alpha: gridOpacity, width: 1 });
      gridLayer.addChild(gridGraphics);
    }

    for (const cell of page.cells) {
      const cellGraphic = new Graphics();

      cellGraphic.position.set(cell.x * page.gridSize, cell.y * page.gridSize);
      cellGraphic.rect(0, 0, page.gridSize, page.gridSize);
      cellGraphic.fill({ color: 0x000000, alpha: 0.001 });
      cellGraphic.eventMode = "static";
      cellGraphic.cursor = boardMode === "fog" ? "crosshair" : boardMode === "measure" ? "crosshair" : "pointer";
      cellGraphic.on("pointertap", () => onCellClick(cell));
      interactionLayer.addChild(cellGraphic);

      if (showGrid && (cell.x === 0 || cell.y === 0)) {
        const label = new Text({
          text: cell.label,
          style: GRID_LABEL_STYLE,
        });

        label.position.set(cell.x * page.gridSize + 4, cell.y * page.gridSize + 3);
        label.alpha = 0.42;
        overlayLayer.addChild(label);
      }

      if (!page.fog[cell.id]) {
        const fog = new Graphics();

        fog.position.set(cell.x * page.gridSize, cell.y * page.gridSize);
        fog.rect(0, 0, page.gridSize, page.gridSize);
        fog.fill({ color: 0x060505, alpha: 0.84 });
        fog.stroke({ color: 0x110f0d, alpha: 0.42, width: 1 });
        fogLayer.addChild(fog);
      }
    }

    for (const token of tokens) {
      const container = new Container();
      const centerX = token.position.x * page.gridSize + page.gridSize / 2;
      const centerY = token.position.y * page.gridSize + page.gridSize / 2;
      const isSelected = token.id === selectedTokenId;
      const isParty = token.payload.team === "party";
      const isDead = token.payload.hp <= 0;
      const renderLayer = token.layer === "gm" ? gmLayer : tokenLayer;

      container.position.set(centerX, centerY);
      container.zIndex = isSelected ? 2 : 1;

      if (isSelected) {
        const glow = new Graphics();
        glow.circle(0, 0, page.gridSize * 0.46);
        glow.fill({ color: SELECTED_TOKEN_COLOR, alpha: 0.14 });
        container.addChild(glow);
      }

      const ring = new Graphics();
      ring.circle(0, 0, page.gridSize * 0.37);
      ring.stroke({
        color: isSelected
          ? SELECTED_TOKEN_COLOR
          : isParty
            ? PARTY_TOKEN_COLOR
            : NPC_TOKEN_COLOR,
        alpha: isDead ? 0.38 : 0.95,
        width: isSelected ? 4 : 2,
      });
      container.addChild(ring);

      const tokenBody = new Graphics();
      tokenBody.circle(0, 0, page.gridSize * 0.3);
      tokenBody.fill({
        color: isParty ? PARTY_TOKEN_COLOR : NPC_TOKEN_COLOR,
        alpha: isDead ? 0.32 : 0.92,
      });
      tokenBody.stroke({ color: 0xf6f2eb, alpha: 0.26, width: 2 });
      container.addChild(tokenBody);

      if (!isDead) {
        const hpPercent = clamp(token.payload.hp / token.payload.hpMax, 0, 1);
        const barWidth = page.gridSize * 0.54;
        const barHeight = 4;
        const barX = -barWidth / 2;
        const barY = page.gridSize * 0.28;
        const hpBg = new Graphics();
        const hpFill = new Graphics();

        hpBg.roundRect(barX, barY, barWidth, barHeight, 2);
        hpBg.fill({ color: 0x000000, alpha: 0.6 });
        hpFill.roundRect(barX, barY, barWidth * hpPercent, barHeight, 2);
        hpFill.fill({
          color: hpPercent > 0.5 ? 0x70915b : hpPercent > 0.25 ? 0xd59a3c : 0xd15a41,
          alpha: 0.92,
        });
        container.addChild(hpBg);
        container.addChild(hpFill);
      }

      if (isDead) {
        const marker = new Text({
          text: "X",
          style: new TextStyle({
            fill: 0xd15a41,
            fontSize: 20,
            fontWeight: "700",
          }),
        });

        marker.anchor.set(0.5);
        container.addChild(marker);
      } else {
        const shortName = new Text({
          text: token.payload.shortName,
          style: new TextStyle({
            fill: 0xf8f4ec,
            fontSize: 17,
            fontFamily: "Fraunces",
            fontWeight: "700",
          }),
        });

        shortName.anchor.set(0.5);
        shortName.y = -2;
        container.addChild(shortName);
      }

      if (token.layer === "gm") {
        const gmTag = new Text({
          text: "GM",
          style: new TextStyle({
            fill: 0xe8d7b3,
            fontSize: 9,
            fontFamily: "IBM Plex Mono",
            fontWeight: "600",
            letterSpacing: 1,
          }),
        });

        gmTag.anchor.set(0.5);
        gmTag.y = -page.gridSize * 0.48;
        container.addChild(gmTag);
      }

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
        const cellX = clamp(Math.floor(localX / page.gridSize), 0, page.width - 1);
        const cellY = clamp(Math.floor(localY / page.gridSize), 0, page.height - 1);

        onMoveToken(token.id, cellX, cellY);
      };

      container.eventMode = "static";
      container.cursor = boardMode === "move" ? "grab" : "pointer";
      container.on("pointertap", () => onSelectToken(token.id));
      container.on("pointerdown", (event) => {
        if (event.button === 2) {
          return;
        }

        onSelectToken(token.id);

        if (boardMode !== "move") {
          return;
        }

        dragging = true;
        container.alpha = 0.92;

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
      container.on("pointerup", (event) => endDrag(event.global.x, event.global.y));
      container.on("pointerupoutside", (event) => endDrag(event.global.x, event.global.y));

      renderLayer.addChild(container);
    }

    // Measure overlay
    const measureLayer = new Container();
    measureLayer.zIndex = 35;

    if (measureState) {
      const { startX, startY, endX, endY } = measureState;
      const gs = page.gridSize;

      // Bresenham line to get cells along the path
      const cells: Array<{ x: number; y: number }> = [];
      let x0 = startX, y0 = startY;
      const x1 = endX, y1 = endY;
      const dx = Math.abs(x1 - x0);
      const dy = Math.abs(y1 - y0);
      const sx = x0 < x1 ? 1 : -1;
      const sy = y0 < y1 ? 1 : -1;
      let err = dx - dy;

      while (true) {
        cells.push({ x: x0, y: y0 });
        if (x0 === x1 && y0 === y1) break;
        const e2 = 2 * err;
        if (e2 > -dy) { err -= dy; x0 += sx; }
        if (e2 < dx) { err += dx; y0 += sy; }
      }

      // Highlight cells along the path
      for (const c of cells) {
        const highlight = new Graphics();
        highlight.rect(c.x * gs, c.y * gs, gs, gs);
        highlight.fill({ color: MEASURE_CELL_COLOR, alpha: 0.12 });
        highlight.stroke({ color: MEASURE_CELL_COLOR, alpha: 0.4, width: 1 });
        measureLayer.addChild(highlight);
      }

      // Draw the line from center to center
      const fromCx = startX * gs + gs / 2;
      const fromCy = startY * gs + gs / 2;
      const toCx = endX * gs + gs / 2;
      const toCy = endY * gs + gs / 2;

      const line = new Graphics();
      line.moveTo(fromCx, fromCy);
      line.lineTo(toCx, toCy);
      line.stroke({ color: MEASURE_LINE_COLOR, alpha: 0.85, width: 3 });
      measureLayer.addChild(line);

      // Start dot
      const startDot = new Graphics();
      startDot.circle(fromCx, fromCy, 5);
      startDot.fill({ color: MEASURE_LINE_COLOR, alpha: 0.95 });
      measureLayer.addChild(startDot);

      // End dot
      const endDot = new Graphics();
      endDot.circle(toCx, toCy, 5);
      endDot.fill({ color: MEASURE_LINE_COLOR, alpha: 0.95 });
      measureLayer.addChild(endDot);

      // Distance = Chebyshev (diagonal = 1 cell) — standard 5ft grid
      const distCells = Math.max(Math.abs(endX - startX), Math.abs(endY - startY));
      const distFt = distCells * 5;

      const label = new Text({
        text: `${distCells} casas · ${distFt} ft`,
        style: MEASURE_LABEL_STYLE,
      });
      label.anchor.set(0.5);
      label.position.set((fromCx + toCx) / 2, (fromCy + toCy) / 2 - 14);
      measureLayer.addChild(label);
    }

    world.addChild(
      frameLayer,
      mapLayer,
      gridLayer,
      fogLayer,
      interactionLayer,
      tokenLayer,
      gmLayer,
      overlayLayer,
      measureLayer,
    );
  }, [
    boardMode,
    gridColor,
    gridOpacity,
    mapTexture,
    measureState,
    onCellClick,
    onMoveToken,
    onSelectToken,
    page,
    selectedTokenId,
    showGrid,
    tokens,
  ]);

  return (
    <div
      ref={hostRef}
      className="absolute inset-0 w-full h-full overflow-hidden bg-background-strong"
      title="Use o scroll para zoom, botao direito para pan e arraste monstros do codex para o mapa."
    />
  );
}
