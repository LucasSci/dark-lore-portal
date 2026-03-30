import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  Application,
  Assets,
  Container,
  Graphics,
  Sprite,
  Texture,
} from "pixi.js";

import type {
  BoardMode,
  PageConnectionEdge,
  SceneCamera,
  TabletopCell,
  VttPage,
  VttTokenObject,
  WallSegmentData,
} from "@/lib/virtual-tabletop";
import {
  computeVisibilityPolygon,
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
  onExpandMap?: (edge: PageConnectionEdge) => void;
  onTravelEdge?: (edge: PageConnectionEdge, tokenId: string) => Promise<boolean> | boolean;
  onCameraChange: (camera: SceneCamera) => void;
  onDropEntry: (entrySlug: string, cell: TabletopCell) => void;
  onAddWall?: (x1: number, y1: number, x2: number, y2: number) => void;
  onAddLight?: (cellX: number, cellY: number) => void;
}

const CAMERA_SCALE_MIN = 0.55;
const CAMERA_SCALE_MAX = 2.1;
const BOARD_STAGE_MARGIN = 0;
const PARTY_TOKEN_COLOR = 0x6e92a6;
const NPC_TOKEN_COLOR = 0xbb533b;
const SELECTED_TOKEN_COLOR = 0xcfab67;
const MEASURE_LINE_COLOR = 0xf5c842;
const MEASURE_CELL_COLOR = 0xf5c842;
const HTML_OVERLAY_STYLE: CSSProperties = {
  position: "absolute",
  inset: 0,
  overflow: "hidden",
  pointerEvents: "none",
  zIndex: 10,
};
const TOKEN_LABEL_STYLE: CSSProperties = {
  position: "absolute",
  left: 0,
  top: 0,
  transform: "translate(-50%, -50%)",
  color: "#f8f4ec",
  fontFamily: "Fraunces, serif",
  fontSize: 17,
  fontWeight: 700,
  lineHeight: 1,
  textShadow: "0 1px 6px rgba(0, 0, 0, 0.85)",
  whiteSpace: "nowrap",
};
const DEAD_TOKEN_LABEL_STYLE: CSSProperties = {
  ...TOKEN_LABEL_STYLE,
  color: "#d15a41",
  fontFamily: "\"IBM Plex Sans\", sans-serif",
  fontSize: 20,
};
const GM_TAG_STYLE: CSSProperties = {
  position: "absolute",
  left: 0,
  top: 0,
  transform: "translate(-50%, -50%)",
  color: "#e8d7b3",
  fontFamily: "\"IBM Plex Mono\", monospace",
  fontSize: 9,
  fontWeight: 600,
  letterSpacing: 1,
  lineHeight: 1,
  textShadow: "0 1px 4px rgba(0, 0, 0, 0.85)",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
};
const GRID_LABEL_TEXT_STYLE: CSSProperties = {
  position: "absolute",
  color: "rgba(231, 223, 212, 0.42)",
  fontFamily: "\"IBM Plex Mono\", monospace",
  fontSize: 9,
  fontWeight: 500,
  letterSpacing: 1,
  lineHeight: 1,
  whiteSpace: "nowrap",
};
const MEASURE_LABEL_TEXT_STYLE: CSSProperties = {
  position: "absolute",
  transform: "translate(-50%, -50%)",
  color: "#ffffff",
  fontFamily: "\"IBM Plex Mono\", monospace",
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: 0.5,
  lineHeight: 1,
  textShadow: "0 1px 6px rgba(0, 0, 0, 0.9)",
  whiteSpace: "nowrap",
};

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

  const paddingX = BOARD_STAGE_MARGIN;
  const paddingY = BOARD_STAGE_MARGIN;

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

function getViewportMinScale(page: VttPage, viewportWidth: number, viewportHeight: number) {
  const boardWidth = Math.max(1, page.width * page.gridSize);
  const boardHeight = Math.max(1, page.height * page.gridSize);

  return clamp(
    Math.max(viewportWidth / boardWidth, viewportHeight / boardHeight),
    CAMERA_SCALE_MIN,
    CAMERA_SCALE_MAX,
  );
}

function getBoardPointFromViewport(
  page: VttPage,
  viewportWidth: number,
  viewportHeight: number,
  viewportX: number,
  viewportY: number,
  scale: number = page.camera.scale,
  cameraX: number = page.camera.x,
  cameraY: number = page.camera.y,
) {
  const metrics = getBoardMetrics(page, viewportWidth, viewportHeight, scale);

  return {
    x: (viewportX - metrics.paddingX - cameraX) / scale,
    y: (viewportY - metrics.paddingY - cameraY) / scale,
  };
}

function getCoverScale(page: VttPage, viewportWidth: number, viewportHeight: number) {
  return getViewportMinScale(page, viewportWidth, viewportHeight);
}

function normalizeCameraForViewport(
  page: VttPage,
  viewportWidth: number,
  viewportHeight: number,
  camera: SceneCamera,
): SceneCamera {
  const scale = clamp(
    camera.scale,
    getViewportMinScale(page, viewportWidth, viewportHeight),
    CAMERA_SCALE_MAX,
  );
  const metrics = getBoardMetrics(page, viewportWidth, viewportHeight, scale);
  const scaledBoardWidth = metrics.boardWidth * scale;
  const scaledBoardHeight = metrics.boardHeight * scale;
  const minX = viewportWidth - metrics.paddingX - scaledBoardWidth;
  const maxX = -metrics.paddingX;
  const minY = viewportHeight - metrics.paddingY - scaledBoardHeight;
  const maxY = -metrics.paddingY;
  const resolvedX =
    minX > maxX ? Number(((minX + maxX) / 2).toFixed(2)) : Number(clamp(camera.x, minX, maxX).toFixed(2));
  const resolvedY =
    minY > maxY ? Number(((minY + maxY) / 2).toFixed(2)) : Number(clamp(camera.y, minY, maxY).toFixed(2));

  return {
    x: resolvedX,
    y: resolvedY,
    scale: Number(scale.toFixed(2)),
  };
}

function getCameraForViewportFocus(
  page: VttPage,
  viewportWidth: number,
  viewportHeight: number,
  viewportX: number,
  viewportY: number,
  boardX: number,
  boardY: number,
  nextScale: number,
): SceneCamera {
  const nextMetrics = getBoardMetrics(page, viewportWidth, viewportHeight, nextScale);

  return {
    x: Number((viewportX - nextMetrics.paddingX - boardX * nextScale).toFixed(2)),
    y: Number((viewportY - nextMetrics.paddingY - boardY * nextScale).toFixed(2)),
    scale: Number(nextScale.toFixed(2)),
  };
}

function camerasDiffer(current: SceneCamera, next: SceneCamera) {
  return (
    Math.abs(current.x - next.x) > 0.5 ||
    Math.abs(current.y - next.y) > 0.5 ||
    Math.abs(current.scale - next.scale) > 0.01
  );
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
  onExpandMap,
  onTravelEdge,
  onCameraChange,
  onDropEntry,
  onAddWall,
  onAddLight,
}: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const appRef = useRef<Application | null>(null);
  const worldRef = useRef<Container | null>(null);
  const pageRef = useRef(page);
  const cameraChangeRef = useRef(onCameraChange);
  const dropEntryRef = useRef(onDropEntry);
  const moveTokenRef = useRef(onMoveToken);
  const travelEdgeRef = useRef(onTravelEdge);
  const selectTokenRef = useRef(onSelectToken);
  const cellClickRef = useRef(onCellClick);
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
  const wallStartRef = useRef<{ x: number; y: number } | null>(null);
  const onAddWallRef = useRef(onAddWall);
  const onAddLightRef = useRef(onAddLight);
  const [mapTexture, setMapTexture] = useState<Texture | null>(null);
  const [measureState, setMeasureState] = useState<{
    active: boolean;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null>(null);
  const [draggingTokenId, setDraggingTokenId] = useState<string | null>(null);
  const [wallPreview, setWallPreview] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const dragStateRef = useRef<{
    tokenId: string | null;
    container: Container | null;
    offsetX: number;
    offsetY: number;
    originX: number;
    originY: number;
    initialX: number;
    initialY: number;
    moved: boolean;
  }>({
    tokenId: null,
    container: null,
    offsetX: 0,
    offsetY: 0,
    originX: 0,
    originY: 0,
    initialX: 0,
    initialY: 0,
    moved: false,
  });
  const touchPointsRef = useRef(new Map<number, { x: number; y: number }>());
  const autoCoverKeyRef = useRef<string | null>(null);
  const pinchStateRef = useRef<{
    active: boolean;
    startDistance: number;
    startScale: number;
    boardX: number;
    boardY: number;
  }>({
    active: false,
    startDistance: 0,
    startScale: 1,
    boardX: 0,
    boardY: 0,
  });
  const [viewportSize, setViewportSize] = useState({ width: 960, height: 560 });

  useEffect(() => {
    pageRef.current = page;
    cameraChangeRef.current = onCameraChange;
    dropEntryRef.current = onDropEntry;
    travelEdgeRef.current = onTravelEdge;
    boardModeRef.current = boardMode;
    onAddWallRef.current = onAddWall;
    onAddLightRef.current = onAddLight;
    moveTokenRef.current = onMoveToken;
    selectTokenRef.current = onSelectToken;
    cellClickRef.current = onCellClick;
  }, [
    onAddLight,
    onAddWall,
    onCameraChange,
    onDropEntry,
    onMoveToken,
    onSelectToken,
    onTravelEdge,
    onCellClick,
    page,
    boardMode,
  ]);

  // Clear interactive state when leaving modes
  useEffect(() => {
    if (boardMode !== "measure") {
      measureRef.current.active = false;
      setMeasureState(null);
    }
    if (boardMode !== "wall") {
      wallStartRef.current = null;
      setWallPreview(null);
    }
    if (boardMode !== "move") {
      setDraggingTokenId(null);
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
    const currentPage = pageRef.current;
    const autoCoverKey = `${currentPage.id}:${currentPage.width}x${currentPage.height}:${currentPage.gridSize}`;
    const normalizedCamera = normalizeCameraForViewport(
      currentPage,
      viewportSize.width,
      viewportSize.height,
      currentPage.camera,
    );

    if (!camerasDiffer(currentPage.camera, normalizedCamera)) {
      autoCoverKeyRef.current = autoCoverKey;
      return;
    }

    const cameraIsNearOrigin =
      Math.abs(currentPage.camera.x) < 0.5 && Math.abs(currentPage.camera.y) < 0.5;

    if (autoCoverKeyRef.current === autoCoverKey && !cameraIsNearOrigin) {
      cameraChangeRef.current(normalizedCamera);
      return;
    }

    autoCoverKeyRef.current = autoCoverKey;
    cameraChangeRef.current(normalizedCamera);
  }, [
    page.id,
    page.width,
    page.height,
    page.gridSize,
    page.camera.x,
    page.camera.y,
    page.camera.scale,
    viewportSize.width,
    viewportSize.height,
  ]);

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
      setViewportSize({
        width: Math.max(320, host.clientWidth || 960),
        height: Math.max(320, host.clientHeight || 560),
      });

      const resizeObserver = new ResizeObserver((entries) => {
        const entry = entries[0];

        if (!entry) {
          return;
        }

        const width = Math.max(320, entry.contentRect.width);
        const height = Math.max(320, entry.contentRect.height);
        app.renderer.resize(width, height);
        setViewportSize({ width, height });
      });

      const stopPan = () => {
        panStateRef.current.active = false;
        host.style.cursor = "";
      };

      const toRendererPoint = (clientX: number, clientY: number) => {
        const rect = app.canvas.getBoundingClientRect();

        if (rect.width <= 0 || rect.height <= 0) {
          return null;
        }

        return {
          x: ((clientX - rect.left) / rect.width) * app.renderer.width,
          y: ((clientY - rect.top) / rect.height) * app.renderer.height,
        };
      };

      const updateTouchPoint = (pointerId: number, clientX: number, clientY: number) => {
        const point = toRendererPoint(clientX, clientY);

        if (!point) {
          return null;
        }

        touchPointsRef.current.set(pointerId, point);
        return point;
      };

      const clearPinchState = () => {
        pinchStateRef.current = {
          active: false,
          startDistance: 0,
          startScale: pageRef.current.camera.scale,
          boardX: 0,
          boardY: 0,
        };
      };

      const cancelTokenDrag = () => {
        const dragState = dragStateRef.current;

        if (!dragState.tokenId || !dragState.container) {
          return;
        }

        dragState.container.alpha = 1;
        dragState.container.scale.set(1);
        dragState.container.position.set(dragState.initialX, dragState.initialY);
        host.style.cursor = "";
        setDraggingTokenId(null);

        dragStateRef.current = {
          tokenId: null,
          container: null,
          offsetX: 0,
          offsetY: 0,
          originX: 0,
          originY: 0,
          initialX: 0,
          initialY: 0,
          moved: false,
        };
      };

      const getPinchPoints = () => {
        const points = Array.from(touchPointsRef.current.values());

        if (points.length < 2) {
          return null;
        }

        const [firstPoint, secondPoint] = points;
        return { firstPoint, secondPoint };
      };

      const startPinchGesture = () => {
        const pinchPoints = getPinchPoints();

        if (!pinchPoints) {
          return;
        }

        stopPan();
        cancelTokenDrag();

        const { firstPoint, secondPoint } = pinchPoints;
        const centerX = (firstPoint.x + secondPoint.x) / 2;
        const centerY = (firstPoint.y + secondPoint.y) / 2;
        const distance = Math.hypot(firstPoint.x - secondPoint.x, firstPoint.y - secondPoint.y);
        const currentPage = pageRef.current;
        const boardPoint = getBoardPointFromViewport(
          currentPage,
          app.renderer.width,
          app.renderer.height,
          centerX,
          centerY,
        );

        pinchStateRef.current = {
          active: true,
          startDistance: Math.max(distance, 1),
          startScale: currentPage.camera.scale,
          boardX: boardPoint.x,
          boardY: boardPoint.y,
        };
      };

      const handlePinchMove = () => {
        const pinchPoints = getPinchPoints();

        if (!pinchPoints) {
          clearPinchState();
          return;
        }

        const { firstPoint, secondPoint } = pinchPoints;
        const centerX = (firstPoint.x + secondPoint.x) / 2;
        const centerY = (firstPoint.y + secondPoint.y) / 2;
        const distance = Math.hypot(firstPoint.x - secondPoint.x, firstPoint.y - secondPoint.y);
        const currentPage = pageRef.current;
        const pinchState = pinchStateRef.current;
        const nextScale = clamp(
          pinchState.startScale * (distance / Math.max(pinchState.startDistance, 1)),
          getViewportMinScale(currentPage, app.renderer.width, app.renderer.height),
          CAMERA_SCALE_MAX,
        );

        cameraChangeRef.current(
          normalizeCameraForViewport(
            currentPage,
            app.renderer.width,
            app.renderer.height,
            getCameraForViewportFocus(
              currentPage,
              app.renderer.width,
              app.renderer.height,
              centerX,
              centerY,
              pinchState.boardX,
              pinchState.boardY,
              nextScale,
            ),
          ),
        );
      };

      const stopTokenDrag = (globalX?: number, globalY?: number) => {
        const dragState = dragStateRef.current;

        if (!dragState.tokenId || !dragState.container) {
          return;
        }

        const currentPage = pageRef.current;
        const local =
          typeof globalX === "number" && typeof globalY === "number"
            ? world.toLocal({ x: globalX, y: globalY })
            : dragState.container.position;
        const boardWidth = currentPage.width * currentPage.gridSize;
        const boardHeight = currentPage.height * currentPage.gridSize;
        let overflowEdge: PageConnectionEdge | null = null;

        if (local.x < 0) {
          overflowEdge = "west";
        } else if (local.x > boardWidth) {
          overflowEdge = "east";
        } else if (local.y < 0) {
          overflowEdge = "north";
        } else if (local.y > boardHeight) {
          overflowEdge = "south";
        }

        const cellX = clamp(Math.floor(local.x / currentPage.gridSize), 0, currentPage.width - 1);
        const cellY = clamp(Math.floor(local.y / currentPage.gridSize), 0, currentPage.height - 1);

        dragState.container.alpha = 1;
        dragState.container.scale.set(1);
        host.style.cursor = "";
        setDraggingTokenId(null);

        selectTokenRef.current(dragState.tokenId);

        if (dragState.moved && overflowEdge && travelEdgeRef.current) {
          void travelEdgeRef.current(overflowEdge, dragState.tokenId);
        } else if (dragState.moved) {
          moveTokenRef.current(dragState.tokenId, cellX, cellY);
        }

        dragStateRef.current = {
          tokenId: null,
          container: null,
          offsetX: 0,
          offsetY: 0,
          originX: 0,
          originY: 0,
          initialX: 0,
          initialY: 0,
          moved: false,
        };
      };

      const handleTokenDragMove = (globalX: number, globalY: number) => {
        const dragState = dragStateRef.current;

        if (!dragState.tokenId || !dragState.container) {
          return;
        }

        const local = world.toLocal({ x: globalX, y: globalY });
        const distanceX = Math.abs(globalX - dragState.originX);
        const distanceY = Math.abs(globalY - dragState.originY);

        if (!dragState.moved && distanceX + distanceY > 3) {
          dragState.moved = true;
          host.style.cursor = "grabbing";
        }

        dragState.container.position.set(local.x + dragState.offsetX, local.y + dragState.offsetY);
      };

      const handleWheel = (event: WheelEvent) => {
        event.preventDefault();

        const currentPage = pageRef.current;
        const viewportPoint = toRendererPoint(event.clientX, event.clientY);

        if (!viewportPoint) {
          return;
        }

        const boardPoint = getBoardPointFromViewport(
          currentPage,
          app.renderer.width,
          app.renderer.height,
          viewportPoint.x,
          viewportPoint.y,
        );
        const nextScale = clamp(
          currentPage.camera.scale + (event.deltaY < 0 ? 0.12 : -0.12),
          getViewportMinScale(currentPage, app.renderer.width, app.renderer.height),
          CAMERA_SCALE_MAX,
        );

        cameraChangeRef.current(
          normalizeCameraForViewport(
            currentPage,
            app.renderer.width,
            app.renderer.height,
            getCameraForViewportFocus(
              currentPage,
              app.renderer.width,
              app.renderer.height,
              viewportPoint.x,
              viewportPoint.y,
              boardPoint.x,
              boardPoint.y,
              nextScale,
            ),
          ),
        );
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
        if (event.pointerType !== "mouse") {
          updateTouchPoint(event.pointerId, event.clientX, event.clientY);

          if (touchPointsRef.current.size >= 2) {
            event.preventDefault();
            if (!pinchStateRef.current.active) {
              startPinchGesture();
            }
            return;
          }
        }

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
            measureRef.current.active = false;
          }
        }

        // Left-click in wall mode — two clicks to define a wall segment
        if (event.button === 0 && boardModeRef.current === "wall") {
          const { cellX, cellY, inBounds } = viewportToCell(event.clientX, event.clientY);
          if (!inBounds) return;

          if (!wallStartRef.current) {
            wallStartRef.current = { x: cellX, y: cellY };
            setWallPreview({ x1: cellX, y1: cellY, x2: cellX, y2: cellY });
          } else {
            const start = wallStartRef.current;
            if (start.x !== cellX || start.y !== cellY) {
              onAddWallRef.current?.(start.x, start.y, cellX, cellY);
            }
            wallStartRef.current = null;
            setWallPreview(null);
          }
        }

        // Left-click in light mode — place a light source
        if (event.button === 0 && boardModeRef.current === "light") {
          const { cellX, cellY, inBounds } = viewportToCell(event.clientX, event.clientY);
          if (!inBounds) return;
          onAddLightRef.current?.(cellX, cellY);
        }
      };

      const handlePointerMove = (event: PointerEvent) => {
        if (event.pointerType !== "mouse" && touchPointsRef.current.has(event.pointerId)) {
          updateTouchPoint(event.pointerId, event.clientX, event.clientY);

          if (touchPointsRef.current.size >= 2) {
            event.preventDefault();

            if (!pinchStateRef.current.active) {
              startPinchGesture();
            } else {
              handlePinchMove();
            }

            return;
          }
        }

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

        // Wall preview drag
        if (wallStartRef.current && boardModeRef.current === "wall") {
          const { cellX, cellY } = viewportToCell(event.clientX, event.clientY);
          setWallPreview({
            x1: wallStartRef.current.x,
            y1: wallStartRef.current.y,
            x2: cellX,
            y2: cellY,
          });
          return;
        }

        if (panStateRef.current.active) {
          const currentPage = pageRef.current;

          cameraChangeRef.current(
            normalizeCameraForViewport(currentPage, app.renderer.width, app.renderer.height, {
              x: Number(
                (panStateRef.current.cameraX + (event.clientX - panStateRef.current.originX)).toFixed(2),
              ),
              y: Number(
                (panStateRef.current.cameraY + (event.clientY - panStateRef.current.originY)).toFixed(2),
              ),
              scale: currentPage.camera.scale,
            }),
          );
        }

        if (!dragStateRef.current.tokenId) {
          return;
        }

        const global = toRendererPoint(event.clientX, event.clientY);

        if (!global) {
          return;
        }

        handleTokenDragMove(global.x, global.y);
      };

      const handleWindowPointerUp = (event: PointerEvent) => {
        touchPointsRef.current.delete(event.pointerId);

        if (pinchStateRef.current.active) {
          if (touchPointsRef.current.size < 2) {
            clearPinchState();
          }
          return;
        }

        stopPan();

        if (!dragStateRef.current.tokenId) {
          return;
        }

        const global = toRendererPoint(event.clientX, event.clientY);

        if (!global) {
          stopTokenDrag();
          return;
        }

        stopTokenDrag(global.x, global.y);
      };

      const handleWindowPointerCancel = (event: PointerEvent) => {
        touchPointsRef.current.delete(event.pointerId);

        if (pinchStateRef.current.active && touchPointsRef.current.size < 2) {
          clearPinchState();
        }

        stopPan();
        cancelTokenDrag();
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
      window.addEventListener("pointerup", handleWindowPointerUp);
      window.addEventListener("pointercancel", handleWindowPointerCancel);
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
        window.removeEventListener("pointerup", handleWindowPointerUp);
        window.removeEventListener("pointercancel", handleWindowPointerCancel);
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

    const background = new Graphics();
    background.roundRect(-6, -6, boardWidth + 12, boardHeight + 12, 12);
    background.fill({ color: 0x090806, alpha: 0.98 });
    background.stroke({ color: 0x5a4630, alpha: 0.55, width: 2 });
    frameLayer.addChild(background);

    if (mapTexture) {
      const mapFrame = page.backgroundFrame ?? {
        x: 0,
        y: 0,
        width: page.width,
        height: page.height,
      };
      const mapSprite = new Sprite(mapTexture);
      mapSprite.x = mapFrame.x * page.gridSize;
      mapSprite.y = mapFrame.y * page.gridSize;
      mapSprite.width = mapFrame.width * page.gridSize;
      mapSprite.height = mapFrame.height * page.gridSize;
      mapLayer.addChild(mapSprite);

      const mapFrameOutline = new Graphics();
      mapFrameOutline.roundRect(
        mapFrame.x * page.gridSize,
        mapFrame.y * page.gridSize,
        mapFrame.width * page.gridSize,
        mapFrame.height * page.gridSize,
        10,
      );
      mapFrameOutline.stroke({ color: 0xcfab67, alpha: 0.32, width: 2 });
      mapFrameOutline.fill({ color: 0x0c0907, alpha: 0.06 });
      mapLayer.addChild(mapFrameOutline);
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
      cellGraphic.on("pointertap", () => cellClickRef.current(cell));
      interactionLayer.addChild(cellGraphic);

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

      container.eventMode = "static";
      container.cursor = boardMode === "move" ? "grab" : "pointer";
      container.on("pointerdown", (event) => {
        if (event.pointerType !== "mouse") {
          touchPointsRef.current.set(event.pointerId, {
            x: event.global.x,
            y: event.global.y,
          });

          if (touchPointsRef.current.size >= 2) {
            event.preventDefault();
            event.stopPropagation();

            if (!pinchStateRef.current.active) {
              startPinchGesture();
            }
            return;
          }
        }

        if (event.button === 2) {
          return;
        }

        event.stopPropagation();

        if (boardMode !== "move") {
          selectTokenRef.current(token.id);
          return;
        }

        container.alpha = 0.92;
        container.scale.set(1.05);
        const local = world.toLocal(event.global);
        dragStateRef.current = {
          tokenId: token.id,
          container,
          offsetX: container.x - local.x,
          offsetY: container.y - local.y,
          originX: event.global.x,
          originY: event.global.y,
          initialX: container.x,
          initialY: container.y,
          moved: false,
        };
        setDraggingTokenId(token.id);
      });

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

    }

    // ── Wall rendering ──────────────────────────────────────────
    const wallLayer = new Container();
    wallLayer.zIndex = 12;
    const gs = page.gridSize;

    for (const wall of page.wallSegments) {
      const wallLine = new Graphics();
      const ax = wall.x1 * gs + gs / 2;
      const ay = wall.y1 * gs + gs / 2;
      const bx = wall.x2 * gs + gs / 2;
      const by = wall.y2 * gs + gs / 2;
      wallLine.moveTo(ax, ay);
      wallLine.lineTo(bx, by);
      wallLine.stroke({ color: 0xe85d4a, alpha: boardMode === "wall" ? 0.85 : 0.35, width: boardMode === "wall" ? 3 : 2 });
      // Endpoint dots
      const dotA = new Graphics();
      dotA.circle(ax, ay, 3);
      dotA.fill({ color: 0xe85d4a, alpha: 0.8 });
      const dotB = new Graphics();
      dotB.circle(bx, by, 3);
      dotB.fill({ color: 0xe85d4a, alpha: 0.8 });
      wallLayer.addChild(wallLine, dotA, dotB);
    }

    // Wall preview (during placement)
    if (wallPreview) {
      const wpLine = new Graphics();
      const ax = wallPreview.x1 * gs + gs / 2;
      const ay = wallPreview.y1 * gs + gs / 2;
      const bx = wallPreview.x2 * gs + gs / 2;
      const by = wallPreview.y2 * gs + gs / 2;
      wpLine.moveTo(ax, ay);
      wpLine.lineTo(bx, by);
      wpLine.stroke({ color: 0xf5c842, alpha: 0.7, width: 2 });
      wallLayer.addChild(wpLine);
    }

    // ── Light source rendering ──────────────────────────────────
    const lightIconLayer = new Container();
    lightIconLayer.zIndex = 22;

    for (const light of page.lightSources) {
      const cx = light.cellX * gs + gs / 2;
      const cy = light.cellY * gs + gs / 2;
      // Glow circle
      const glow = new Graphics();
      glow.circle(cx, cy, gs * 0.4);
      glow.fill({ color: light.color, alpha: 0.15 });
      lightIconLayer.addChild(glow);
      // Icon
      const icon = new Graphics();
      icon.circle(cx, cy, 6);
      icon.fill({ color: light.color, alpha: 0.9 });
      icon.stroke({ color: 0xffffff, alpha: 0.4, width: 1 });
      lightIconLayer.addChild(icon);
    }

    // ── Dynamic lighting overlay ────────────────────────────────
    const lightingLayer = new Container();
    lightingLayer.zIndex = 8; // Between map and fog

    if (page.dynamicLighting && (page.lightSources.length > 0 || tokens.some(t => t.payload.team === "party"))) {
      const wallSegs: Segment[] = page.wallSegments.map((w) => ({
        a: { x: w.x1 * gs + gs / 2, y: w.y1 * gs + gs / 2 },
        b: { x: w.x2 * gs + gs / 2, y: w.y2 * gs + gs / 2 },
      }));

      const bounds = { width: boardWidth, height: boardHeight };

      // Collect all vision sources: party tokens + light sources
      const visionPolygons: Array<{ x: number; y: number }[]> = [];

      for (const token of tokens) {
        if (token.payload.team === "party" && token.payload.hp > 0) {
          const origin = {
            x: token.position.x * gs + gs / 2,
            y: token.position.y * gs + gs / 2,
          };
          const poly = computeVisibilityPolygon(origin, wallSegs, bounds, page.tokenVisionRadius * gs);
          visionPolygons.push(poly);
        }
      }

      for (const light of page.lightSources) {
        const origin = {
          x: light.cellX * gs + gs / 2,
          y: light.cellY * gs + gs / 2,
        };
        const poly = computeVisibilityPolygon(origin, wallSegs, bounds, light.radius * gs);
        visionPolygons.push(poly);
      }

      // Draw darkness overlay with cutouts for visible areas
      if (visionPolygons.length > 0) {
        const darkness = new Graphics();
        // Full darkness rectangle
        darkness.rect(0, 0, boardWidth, boardHeight);
        darkness.fill({ color: 0x000000, alpha: 0.72 });

        // Cut out visible areas (draw them with "erase" blend)
        for (const poly of visionPolygons) {
          if (poly.length < 3) continue;
          const cutout = new Graphics();
          cutout.moveTo(poly[0].x, poly[0].y);
          for (let i = 1; i < poly.length; i++) {
            cutout.lineTo(poly[i].x, poly[i].y);
          }
          cutout.closePath();
          cutout.fill({ color: 0x000000, alpha: 0.72 });

          // Use as mask by cutting from darkness
          lightingLayer.addChild(cutout);
        }

        // Use a mask approach: render darkness, then use visibility polygons as holes
        // PixiJS approach: render light areas on top with the map color to "reveal"
        // Simpler: draw semi-transparent darkness, then draw visibility polygons to clear it
        // We'll use the "cut" approach with a single graphics object

        const combinedDarkness = new Graphics();
        combinedDarkness.rect(0, 0, boardWidth, boardHeight);
        combinedDarkness.fill({ color: 0x050404, alpha: 0.7 });

        // Draw each visibility polygon as a "hole" using winding
        for (const poly of visionPolygons) {
          if (poly.length < 3) continue;
          combinedDarkness.moveTo(poly[0].x, poly[0].y);
          for (let i = 1; i < poly.length; i++) {
            combinedDarkness.lineTo(poly[i].x, poly[i].y);
          }
          combinedDarkness.closePath();
          combinedDarkness.cut();
        }

        // Clear the individual cutouts we added above
        lightingLayer.removeChildren();
        lightingLayer.addChild(combinedDarkness);

        // Add subtle gradient glow for each light source
        for (const light of page.lightSources) {
          const cx = light.cellX * gs + gs / 2;
          const cy = light.cellY * gs + gs / 2;
          const glowRadius = light.radius * gs * 0.6;
          const lightGlow = new Graphics();
          lightGlow.circle(cx, cy, glowRadius);
          lightGlow.fill({ color: light.color, alpha: light.intensity * 0.08 });
          lightingLayer.addChild(lightGlow);
        }
      }
    }

    world.addChild(
      frameLayer,
      mapLayer,
      lightingLayer,
      gridLayer,
      fogLayer,
      wallLayer,
      interactionLayer,
      tokenLayer,
      lightIconLayer,
      gmLayer,
      measureLayer,
    );
  }, [
    boardMode,
    gridColor,
    gridOpacity,
    mapTexture,
    measureState,
    wallPreview,
    page,
    selectedTokenId,
    showGrid,
    tokens,
  ]);

  const { boardWidth, boardHeight, paddingX, paddingY } = getBoardMetrics(
    page,
    viewportSize.width,
    viewportSize.height,
  );
  const overlayOffsetX = paddingX + page.camera.x;
  const overlayOffsetY = paddingY + page.camera.y;
  const gridLabels = showGrid ? page.cells.filter((cell) => cell.x === 0 || cell.y === 0) : [];
  const visibleTokenLabels = tokens.filter((token) => token.id !== draggingTokenId);
  const measureLabel = measureState
    ? (() => {
        const fromCx = measureState.startX * page.gridSize + page.gridSize / 2;
        const fromCy = measureState.startY * page.gridSize + page.gridSize / 2;
        const toCx = measureState.endX * page.gridSize + page.gridSize / 2;
        const toCy = measureState.endY * page.gridSize + page.gridSize / 2;
        const distCells = Math.max(
          Math.abs(measureState.endX - measureState.startX),
          Math.abs(measureState.endY - measureState.startY),
        );

        return {
          label: `${distCells} casas | ${distCells * 5} ft`,
          left: (fromCx + toCx) / 2,
          top: (fromCy + toCy) / 2 - 14,
        };
      })()
    : null;

  return (
    <div className="absolute inset-0 h-full w-full overflow-hidden bg-background-strong">
      <div
        ref={hostRef}
        className="absolute inset-0 h-full w-full overflow-hidden touch-none"
        style={{ touchAction: "none" }}
        title="Use o scroll para zoom, botao direito para pan, pinça no mobile para aproximar, arraste tokens pelo mapa e solte criaturas do codex no grid."
      />
      <div style={HTML_OVERLAY_STYLE}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: boardWidth,
            height: boardHeight,
            transform: `translate3d(${overlayOffsetX}px, ${overlayOffsetY}px, 0)`,
            transformOrigin: "top left",
          }}
        >
          <div
            style={{
              position: "relative",
              width: boardWidth,
              height: boardHeight,
              transform: `scale(${page.camera.scale})`,
              transformOrigin: "top left",
            }}
          >
            {gridLabels.map((cell) => (
              <span
                key={`grid-label-${cell.id}`}
                style={{
                  ...GRID_LABEL_TEXT_STYLE,
                  left: cell.x * page.gridSize + 4,
                  top: cell.y * page.gridSize + 3,
                }}
              >
                {cell.label}
              </span>
            ))}
            {visibleTokenLabels.map((token) => {
              const centerX = token.position.x * page.gridSize + page.gridSize / 2;
              const centerY = token.position.y * page.gridSize + page.gridSize / 2;
              const isDead = token.payload.hp <= 0;

              return (
                <div
                  key={`token-label-${token.id}`}
                  style={{
                    position: "absolute",
                    left: centerX,
                    top: centerY,
                    width: 0,
                    height: 0,
                  }}
                >
                  <span
                    style={{
                      ...(isDead ? DEAD_TOKEN_LABEL_STYLE : TOKEN_LABEL_STYLE),
                      top: isDead ? 0 : -2,
                    }}
                  >
                    {isDead ? "X" : token.payload.shortName}
                  </span>
                  {token.layer === "gm" ? (
                    <span
                      style={{
                        ...GM_TAG_STYLE,
                        top: -page.gridSize * 0.48,
                      }}
                    >
                      GM
                    </span>
                  ) : null}
                </div>
              );
            })}
            {measureLabel ? (
              <span
                style={{
                  ...MEASURE_LABEL_TEXT_STYLE,
                  left: measureLabel.left,
                  top: measureLabel.top,
                }}
              >
                {measureLabel.label}
              </span>
            ) : null}
          </div>
        </div>
      </div>
      {onExpandMap && (() => {
        const controls: Array<{
          edge: PageConnectionEdge;
          label: string;
          shortLabel: string;
          symbol: string;
        }> = [
          {
            edge: "north",
            label: "Expandir para o norte",
            shortLabel: "Norte",
            symbol: "^",
          },
          {
            edge: "south",
            label: "Expandir para o sul",
            shortLabel: "Sul",
            symbol: "v",
          },
          {
            edge: "west",
            label: "Expandir para o oeste",
            shortLabel: "Oeste",
            symbol: "<",
          },
          {
            edge: "east",
            label: "Expandir para o leste",
            shortLabel: "Leste",
            symbol: ">",
          },
        ];

        return (
          <div className="pointer-events-none absolute bottom-3 left-3 z-20">
            <div className="vtt-expand-controls pointer-events-auto">
              <div className="vtt-expand-controls__label">Expandir mesa</div>
              <div className="grid grid-cols-2 gap-2">
                {controls.map((control) => (
                  <button
                    key={control.edge}
                    type="button"
                    title={control.label}
                    onClick={() => onExpandMap(control.edge)}
                    className="vtt-expand-controls__button"
                  >
                    <span className="vtt-expand-controls__symbol" aria-hidden="true">
                      {control.symbol}
                    </span>
                    <span>{control.shortLabel}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
