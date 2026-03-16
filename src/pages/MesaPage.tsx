import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Castle,
  Crosshair,
  ChevronLeft,
  ChevronRight,
  Dice6,
  Eye,
  EyeOff,
  Flame,
  Ghost,
  Grid3X3,
  ImagePlus,
  Layers,
  Lightbulb,
  MessageSquare,
  Minus,
  MousePointer,
  Plus,
  RefreshCcw,
  Ruler,
  Send,
  Shield,
  Skull,
  Sparkles,
  Sword,
  Target,
  Trash2,
  Users,
  WallpaperIcon,
  X,
} from "lucide-react";

import VttPixiStage from "@/components/rpg/VttPixiStage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getVttReadyEntries } from "@/lib/encyclopedia";
import { parseDiceNotation, rollDice } from "@/lib/rpg-utils";
import {
  readImageDimensions,
  recommendBattlemapGrid,
  uploadBattlemapAsset,
} from "@/lib/vtt-assets";
import {
  loadSceneSnapshot,
  persistChatMessage,
  persistFogState,
  persistInitiativeSnapshot,
  persistSceneEventLog,
  persistSceneObjects,
  persistSceneSnapshot,
  useVttRealtime,
} from "@/lib/vtt-realtime";
import {
  addSceneNpc,
  addSceneWall,
  addSceneLight,
  addScenePage,
  applySceneEvent,
  adjustSceneTokenHp,
  appendSceneChat,
  clearSceneInitiative,
  clearSceneWalls,
  clearSceneLights,
  connectScenePages,
  countRevealedCells,
  configureSceneBattlemap,
  createSceneEvent,
  createSceneModel,
  expandScenePage,
  getActivePage,
  getPositionLabel,
  recordSceneRoll,
  getSceneTokens,
  getSelectedToken,
  revealEntireSceneFog,
  revealSceneFogAround,
  removeSceneConnection,
  restoreSceneFog,
  setBoardMode,
  setSceneCamera,
  setSceneCameraScale,
  setScenePresence,
  setSceneSelection,
  startSceneInitiative,
  toggleDynamicLighting,
  toggleSceneFogCell,
  advanceSceneInitiative,
  travelSceneConnection,
  travelSceneEdge,
  moveSceneToken,
  type BoardMode,
  type ChatTone,
  type PageConnectionEdge,
  type SceneEvent,
  type SceneModel,
} from "@/lib/virtual-tabletop";
import { ensureMesaSession } from "@/lib/sheets/persistence";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const loreThreats = getVttReadyEntries();

type LeftTool = "select" | "move" | "fog" | "measure" | "wall" | "light";
type RightTab = "chat" | "tokens" | "initiative" | "codex" | "npc" | "map";

function SidePanelCard({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-xl border border-border/50 bg-background/35 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]", className)}>
      <div className="mb-3 space-y-1">
        <h3 className="font-heading text-base text-foreground">{title}</h3>
        {description && <p className="text-sm leading-6 text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export default function MesaPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [scene, setScene] = useState<SceneModel>(() => createSceneModel());
  const [sessionReady, setSessionReady] = useState(false);
  const [chatDraft, setChatDraft] = useState("");
  const [diceDraft, setDiceDraft] = useState("1d20");
  const [showGrid, setShowGrid] = useState(true);
  const [gridOpacity, setGridOpacity] = useState(0.3);
  const [mapColumns, setMapColumns] = useState(12);
  const [mapRows, setMapRows] = useState(8);
  const [mapGridSize, setMapGridSize] = useState(72);
  const [battlemapUploading, setBattlemapUploading] = useState(false);
  const [rightOpen, setRightOpen] = useState(true);
  const [rightTab, setRightTab] = useState<RightTab>("chat");
  const [newPageName, setNewPageName] = useState("");
  const [newPageRegion, setNewPageRegion] = useState("");
  const [connectionTargetId, setConnectionTargetId] = useState("");
  const [connectionEdge, setConnectionEdge] = useState<PageConnectionEdge>("east");
  const [connectionLabel, setConnectionLabel] = useState("");
  const [connectionSpawnX, setConnectionSpawnX] = useState(0);
  const [connectionSpawnY, setConnectionSpawnY] = useState(0);
  const [npcDraft, setNpcDraft] = useState({
    name: "",
    hp: 18,
    ac: 13,
    initiativeBonus: 1,
    notes: "",
  });
  const sceneRef = useRef(scene);
  const presenceRef = useRef(scene.presence);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handledSpawnSlugRef = useRef<string | null>(null);

  useEffect(() => {
    sceneRef.current = scene;
  }, [scene]);

  useEffect(() => {
    presenceRef.current = scene.presence;
  }, [scene.presence]);

  useEffect(() => {
    const page = getActivePage(scene);

    if (!page) {
      return;
    }

    setMapColumns(page.width);
    setMapRows(page.height);
    setMapGridSize(page.gridSize);
    setConnectionSpawnX(Math.max(0, Math.floor(page.width / 2)));
    setConnectionSpawnY(Math.max(0, Math.floor(page.height / 2)));
  }, [scene.activePageId, scene.pages]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const session = await ensureMesaSession();
      const nextSessionId = session?.id ?? "demo-session";
      const loadedScene = (await loadSceneSnapshot(nextSessionId)) ?? createSceneModel(nextSessionId);

      if (!session && nextSessionId === "demo-session") {
        if (!cancelled) {
          sceneRef.current = loadedScene;
          setScene(loadedScene);
          setSessionReady(true);
        }
        return;
      }

      if (!cancelled) {
        sceneRef.current = loadedScene;
        setScene(loadedScene);
        setSessionReady(true);
      }

      if (!loadedScene.pages.length) {
        return;
      }

      if (!(await loadSceneSnapshot(nextSessionId))) {
        await persistSceneSnapshot(loadedScene);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const { presence, broadcastScene, broadcastSceneEvent } = useVttRealtime({
    sessionId: scene.sessionId,
    displayName: "Narrador",
    role: "gm",
    onRemoteScene: (remoteScene) => {
      if (remoteScene.revision <= sceneRef.current.revision) return;
      sceneRef.current = remoteScene;
      setScene(setScenePresence(remoteScene, presence));
    },
    onRemoteEvent: (event) => {
      const nextScene = applySceneEvent(sceneRef.current, event);

      if (nextScene === sceneRef.current) {
        return;
      }

      sceneRef.current = nextScene;
      setScene(setScenePresence(nextScene, presenceRef.current));
    },
  });

  useEffect(() => {
    setScene((current) => setScenePresence(current, presence));
  }, [presence]);

  const commitScene = useCallback(
    async (
      nextScene: SceneModel,
      options: {
        broadcast?: boolean;
        persist?: boolean;
        event?: SceneEvent | null;
        persistAction?: (() => Promise<void>) | null;
      } = {},
    ) => {
      sceneRef.current = nextScene;
      setScene(nextScene);

      if (options.event) {
        await broadcastSceneEvent(nextScene, options.event);
      } else if (options.broadcast !== false) {
        await broadcastScene(nextScene);
      }

      if (options.persistAction) {
        await options.persistAction();
      } else if (options.persist !== false) {
        await persistSceneSnapshot(nextScene);
      }
    },
    [broadcastScene, broadcastSceneEvent],
  );

  const mutateScene = useCallback(
    async (
      updater: (current: SceneModel) => SceneModel,
      options?: {
        broadcast?: boolean;
        persist?: boolean;
        eventFactory?: (nextScene: SceneModel) => SceneEvent | null;
        persistActionFactory?: (nextScene: SceneModel) => Promise<void>;
      },
    ) => {
      const nextScene = updater(sceneRef.current);
      await commitScene(nextScene, {
        broadcast: options?.broadcast,
        persist: options?.persist,
        event: options?.eventFactory?.(nextScene) ?? null,
        persistAction: options?.persistActionFactory ? () => options.persistActionFactory!(nextScene) : null,
      });
      return nextScene;
    },
    [commitScene],
  );

  const activePage = getActivePage(scene);
  const battlemapUrl = activePage?.backgroundAssetUrl ?? null;
  const tokens = getSceneTokens(scene);
  const selectedToken = getSelectedToken(scene);
  const activeTurn = scene.initiative.entries.find((e) => e.tokenId === scene.initiative.activeTurnId);
  const rightTabs: Array<{ id: RightTab; icon: ReactNode; label: string }> = [
    { id: "chat", icon: <MessageSquare className="h-4 w-4" />, label: "Chat" },
    { id: "tokens", icon: <Ghost className="h-4 w-4" />, label: "Tokens" },
    { id: "initiative", icon: <Sword className="h-4 w-4" />, label: "Iniciativa" },
    { id: "codex", icon: <Sparkles className="h-4 w-4" />, label: "Codex" },
    { id: "npc", icon: <Shield className="h-4 w-4" />, label: "NPCs" },
    { id: "map", icon: <ImagePlus className="h-4 w-4" />, label: "Mapa" },
  ];

  const appendChatMessage = async (author: string, text: string, tone: ChatTone) => {
    await mutateScene(
      (current) => appendSceneChat(current, author, text, tone),
      {
        eventFactory: (nextScene) => {
          const latestMessage = nextScene.chatMessages.at(-1);

          return latestMessage
            ? createSceneEvent(nextScene, "CHAT_APPENDED", { message: latestMessage })
            : null;
        },
        persistActionFactory: async (nextScene) => {
          const latestMessage = nextScene.chatMessages.at(-1);
          const nextPage = getActivePage(nextScene);

          if (!latestMessage || !nextPage) {
            return;
          }

          const event = createSceneEvent(nextScene, "CHAT_APPENDED", { message: latestMessage });
          await Promise.all([
            persistChatMessage(nextScene.sessionId, nextPage.id, latestMessage),
            persistSceneEventLog(event),
          ]);
        },
      },
    );
  };

  const handleCellClick = async (cell: { id: string; x: number; y: number }) => {
    if (scene.boardMode === "fog") {
      await mutateScene(
        (current) => toggleSceneFogCell(current, cell.id),
        {
          eventFactory: (nextScene) => {
            const page = getActivePage(nextScene);
            return page
              ? createSceneEvent(nextScene, "FOG_UPDATED", { fog: page.fog, cellId: cell.id }, page.id)
              : null;
          },
          persistActionFactory: async (nextScene) => {
            const page = getActivePage(nextScene);

            if (!page) {
              return;
            }

            const event = createSceneEvent(nextScene, "FOG_UPDATED", { fog: page.fog, cellId: cell.id }, page.id);
            await Promise.all([
              persistFogState(nextScene.sessionId, page.id, page.fog, nextScene.revision),
              persistSceneEventLog(event),
            ]);
          },
        },
      );
      return;
    }
    if (!selectedToken) return;
    if (selectedToken.position.x === cell.x && selectedToken.position.y === cell.y) return;
    await handleMoveToken(selectedToken.id, cell.x, cell.y);
  };

  const handleMoveToken = async (tokenId: string, x: number, y: number) => {
    await mutateScene(
      (current) => moveSceneToken(current, tokenId, x, y),
      {
        eventFactory: (nextScene) =>
          createSceneEvent(nextScene, "TOKEN_MOVED", { tokenId, x, y }),
        persistActionFactory: async (nextScene) => {
          const token = nextScene.objects.find((object) => object.id === tokenId);

          if (!token) {
            return;
          }

          const event = createSceneEvent(nextScene, "TOKEN_MOVED", { tokenId, x, y });
          await Promise.all([
            persistSceneObjects(nextScene.sessionId, [token]),
            persistSceneEventLog(event),
          ]);
        },
      },
    );
  };

  const handleCameraChange = async (camera: SceneModel["pages"][number]["camera"]) => {
    await mutateScene((current) => setSceneCamera(current, camera), { broadcast: false, persist: false });
  };

  const handleBattlemapImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const page = getActivePage(sceneRef.current);

    event.target.value = "";

    if (!file || !page) {
      return;
    }

    setBattlemapUploading(true);

    try {
      const dimensions = await readImageDimensions(file);
      const recommended = recommendBattlemapGrid(dimensions, Math.max(page.width, 12));
      const nextGridSize = page.gridSize;

      setMapColumns(recommended.columns);
      setMapRows(recommended.rows);
      setMapGridSize(nextGridSize);

      const asset = await uploadBattlemapAsset({
        file,
        sessionId: sceneRef.current.sessionId,
        pageId: page.id,
        columns: recommended.columns,
        rows: recommended.rows,
        gridSize: nextGridSize,
      });

      const nextScene = configureSceneBattlemap(sceneRef.current, {
        width: recommended.columns,
        height: recommended.rows,
        gridSize: nextGridSize,
        backgroundAssetId: asset.assetId,
        backgroundAssetUrl: asset.assetUrl,
        resetFrame: true,
      });

      await commitScene(nextScene);
      setRightTab("map");

      toast.success(
        asset.persisted
          ? "Battlemap importado e aplicado na pagina ativa."
          : "Battlemap carregado localmente. Entre na conta para persistir o arquivo.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Nao foi possivel importar o battlemap agora.",
      );
    } finally {
      setBattlemapUploading(false);
    }
  };

  const applyBattlemapGrid = async () => {
    if (!activePage) {
      return;
    }

    const width = Math.max(4, Math.round(mapColumns));
    const height = Math.max(4, Math.round(mapRows));
    const gridSize = Math.max(32, Math.round(mapGridSize));

    setMapColumns(width);
    setMapRows(height);
    setMapGridSize(gridSize);

    await mutateScene((current) =>
      configureSceneBattlemap(current, {
        width,
        height,
        gridSize,
        resetFrame: true,
      }),
    );

    toast.success("Grade do battlemap atualizada.");
  };

  const handleExpandMap = async (edge: PageConnectionEdge) => {
    const labelByEdge: Record<PageConnectionEdge, string> = {
      north: "norte",
      east: "leste",
      south: "sul",
      west: "oeste",
    };

    await mutateScene((current) => expandScenePage(current, edge, 2));
    toast.success(`Mesa ampliada para o ${labelByEdge[edge]}.`);
  };

  const handleCreateScenePage = async () => {
    if (!newPageName.trim()) {
      toast.error("Defina um nome para a nova area.");
      return;
    }

    const nextScene = await mutateScene((current) =>
      addScenePage(current, {
        name: newPageName,
        region: newPageRegion || newPageName,
        width: mapColumns,
        height: mapRows,
        gridSize: mapGridSize,
      }),
    );

    const createdPage = nextScene.pages.at(-1);

    if (createdPage) {
      setConnectionTargetId(createdPage.id);
      setConnectionLabel(createdPage.name);
    }

    setNewPageName("");
    setNewPageRegion("");
    toast.success("Nova area adicionada a malha da mesa.");
  };

  const handleCreateConnection = async () => {
    if (!activePage || !connectionTargetId) {
      toast.error("Escolha uma area de destino para criar a ligacao.");
      return;
    }

    if (connectionTargetId === activePage.id) {
      toast.error("A ligacao precisa apontar para outra area.");
      return;
    }

    await mutateScene((current) =>
      connectScenePages(current, {
        pageId: activePage.id,
        targetPageId: connectionTargetId,
        edge: connectionEdge,
        label: connectionLabel.trim() || "Passagem",
        spawnX: connectionSpawnX,
        spawnY: connectionSpawnY,
      }),
    );

    toast.success("Ligacao criada na borda da area atual.");
  };

  const handleTravelConnection = async (connectionId: string) => {
    const tokenId = selectedToken?.id ?? null;
    const nextScene = await mutateScene((current) =>
      travelSceneConnection(current, { connectionId, tokenId }),
    );
    const nextPage = getActivePage(nextScene);

    if (nextPage) {
      toast.success(`Travessia concluida para ${nextPage.name}.`);
    }
  };

  const handleTravelEdge = async (edge: PageConnectionEdge, tokenId: string) => {
    const currentPage = getActivePage(sceneRef.current);
    const connection = currentPage?.connections.find((item) => item.edge === edge);

    if (!connection) {
      return false;
    }

    const nextScene = await mutateScene((current) => travelSceneEdge(current, edge, tokenId));
    const nextPage = getActivePage(nextScene);

    if (nextPage) {
      toast.success(`Travessia para ${nextPage.name}.`);
    }

    return true;
  };

  const handleDropLoreEntry = async (entrySlug: string, cell: { id: string; x: number; y: number }) => {
    const entry = loreThreats.find((c) => c.slug === entrySlug);
    if (!entry) return;
    const nextScene = await mutateScene(
      (current) =>
        addSceneNpc(current, {
          name: entry.title,
          hp: entry.vtt.hp,
          ac: entry.vtt.ac,
          initiativeBonus: entry.vtt.initiativeBonus,
          notes: entry.vtt.note || entry.summary,
          role: entry.vtt.role,
          color: entry.vtt.color,
          position: { x: cell.x, y: cell.y },
        }),
      {
        eventFactory: (updatedScene) => {
          const object = updatedScene.objects.find((candidate) => candidate.id === updatedScene.selectedObjectId);
          return object ? createSceneEvent(updatedScene, "OBJECT_CREATED", { object }, object.pageId) : null;
        },
        persistActionFactory: async (updatedScene) => {
          const object = updatedScene.objects.find((candidate) => candidate.id === updatedScene.selectedObjectId);

          if (!object) {
            return;
          }

          const event = createSceneEvent(updatedScene, "OBJECT_CREATED", { object }, object.pageId);
          await Promise.all([
            persistSceneObjects(updatedScene.sessionId, [object]),
            persistSceneEventLog(event),
          ]);
        },
      },
    );
    const spawned = nextScene.objects.find((o) => o.id === nextScene.selectedObjectId && o.objectType === "token");
    if (spawned?.objectType === "token") {
      await appendChatMessage("Codex", `${entry.title} em ${getPositionLabel(spawned.position.x, spawned.position.y)}.`, "npc");
    }
  };

  const spawnLoreEntry = useCallback(
    async (entrySlug: string) => {
      const entry = loreThreats.find((candidate) => candidate.slug === entrySlug);
      if (!entry) {
        toast.error("Criatura nao encontrada no codex.");
        return;
      }

      const nextScene = await mutateScene(
        (current) =>
          addSceneNpc(current, {
            name: entry.title,
            hp: entry.vtt.hp,
            ac: entry.vtt.ac,
            initiativeBonus: entry.vtt.initiativeBonus,
            notes: entry.vtt.note || entry.summary,
            role: entry.vtt.role,
            color: entry.vtt.color,
          }),
        {
          eventFactory: (updatedScene) => {
            const object = updatedScene.objects.find(
              (candidate) => candidate.id === updatedScene.selectedObjectId,
            );
            return object
              ? createSceneEvent(updatedScene, "OBJECT_CREATED", { object }, object.pageId)
              : null;
          },
          persistActionFactory: async (updatedScene) => {
            const object = updatedScene.objects.find(
              (candidate) => candidate.id === updatedScene.selectedObjectId,
            );

            if (!object) {
              return;
            }

            const event = createSceneEvent(updatedScene, "OBJECT_CREATED", { object }, object.pageId);
            await Promise.all([
              persistSceneObjects(updatedScene.sessionId, [object]),
              persistSceneEventLog(event),
            ]);
          },
        },
      );

      const spawned = nextScene.objects.find(
        (candidate) =>
          candidate.id === nextScene.selectedObjectId && candidate.objectType === "token",
      );

      if (spawned?.objectType === "token") {
        await appendChatMessage(
          "Codex",
          `${entry.title} em ${getPositionLabel(spawned.position.x, spawned.position.y)}.`,
          "npc",
        );
      }

      toast.success(`${entry.title} preparado na mesa.`);
    },
    [appendChatMessage, mutateScene],
  );

  useEffect(() => {
    const spawnSlug = searchParams.get("spawn");

    if (!sessionReady || !spawnSlug) {
      return;
    }

    const spawnKey = `${scene.sessionId}:${spawnSlug}`;
    if (handledSpawnSlugRef.current === spawnKey) {
      return;
    }

    handledSpawnSlugRef.current = spawnKey;
    setRightTab("codex");

    void (async () => {
      await spawnLoreEntry(spawnSlug);

      const nextSearchParams = new URLSearchParams(searchParams);
      nextSearchParams.delete("spawn");
      setSearchParams(nextSearchParams, { replace: true });
    })();
  }, [scene.sessionId, searchParams, sessionReady, setSearchParams, spawnLoreEntry]);

  const sendChat = async () => {
    if (!chatDraft.trim()) return;
    await appendChatMessage("Narrador", chatDraft.trim(), "party");
    setChatDraft("");
  };

  const rollNotation = async (notation: string, actor: string) => {
    const parsed = parseDiceNotation(notation.trim().toLowerCase());
    const { results, total } = rollDice(parsed.sides, parsed.count);
    const finalTotal = total + parsed.modifier;
    const norm = `${parsed.count}d${parsed.sides}${parsed.modifier === 0 ? "" : parsed.modifier > 0 ? `+${parsed.modifier}` : parsed.modifier}`;
    await mutateScene(
      (current) => recordSceneRoll(current, actor, norm, results, finalTotal),
      {
        eventFactory: (nextScene) => {
          const message = nextScene.chatMessages.at(-1);
          return message
            ? createSceneEvent(nextScene, "CHAT_APPENDED", { message, roll: nextScene.diceHistory[0] })
            : null;
        },
        persistActionFactory: async (nextScene) => {
          const message = nextScene.chatMessages.at(-1);
          const page = getActivePage(nextScene);

          if (!message || !page) {
            return;
          }

          const event = createSceneEvent(nextScene, "CHAT_APPENDED", { message, roll: nextScene.diceHistory[0] });
          await Promise.all([
            persistChatMessage(nextScene.sessionId, page.id, message),
            persistSceneEventLog(event),
          ]);
        },
      },
    );
    setDiceDraft(norm);
  };

  const adjustHp = async (tokenId: string, delta: number) => {
    const current = tokens.find((t) => t.id === tokenId);
    const nextScene = await mutateScene(
      (c) => adjustSceneTokenHp(c, tokenId, delta),
      {
        eventFactory: (updatedScene) => {
          const token = updatedScene.objects.find((entry) => entry.id === tokenId);
          return token ? createSceneEvent(updatedScene, "TOKEN_UPDATED", { token }, token.pageId) : null;
        },
        persistActionFactory: async (updatedScene) => {
          const token = updatedScene.objects.find((entry) => entry.id === tokenId);

          if (!token) {
            return;
          }

          const event = createSceneEvent(updatedScene, "TOKEN_UPDATED", { token }, token.pageId);
          await Promise.all([
            persistSceneObjects(updatedScene.sessionId, [token]),
            persistSceneEventLog(event),
          ]);
        },
      },
    );
    const next = nextScene.objects.find((e) => e.id === tokenId && e.objectType === "token");
    if (current && next?.objectType === "token" && current.payload.hp > 0 && next.payload.hp === 0) {
      await appendChatMessage("Sistema", `${next.payload.name} caiu em combate.`, "system");
    }
  };

  const startInitiative = async () => {
    const nextScene = await mutateScene(
      (c) => startSceneInitiative(c),
      {
        eventFactory: (updatedScene) => {
          const page = getActivePage(updatedScene);
          return page
            ? createSceneEvent(updatedScene, "INITIATIVE_SNAPSHOT", { initiative: updatedScene.initiative }, page.id)
            : null;
        },
        persistActionFactory: async (updatedScene) => {
          const page = getActivePage(updatedScene);

          if (!page) {
            return;
          }

          const event = createSceneEvent(updatedScene, "INITIATIVE_SNAPSHOT", { initiative: updatedScene.initiative }, page.id);
          await Promise.all([
            persistInitiativeSnapshot(updatedScene.sessionId, page.id, updatedScene.initiative, updatedScene.revision),
            persistSceneEventLog(event),
          ]);
        },
      },
    );
    if (!nextScene.initiative.entries.length) {
      await appendChatMessage("Sistema", "Sem combatentes para iniciativa.", "system");
      return;
    }
    await appendChatMessage("Sistema", `Iniciativa: ${nextScene.initiative.entries.map((e) => `${e.name} ${e.total}`).join(" | ")}`, "system");
  };

  const advanceTurn = async () => {
    const prevRound = scene.initiative.round;
    const nextScene = await mutateScene(
      (c) => advanceSceneInitiative(c),
      {
        eventFactory: (updatedScene) => {
          const page = getActivePage(updatedScene);
          return page
            ? createSceneEvent(updatedScene, "INITIATIVE_SNAPSHOT", { initiative: updatedScene.initiative }, page.id)
            : null;
        },
        persistActionFactory: async (updatedScene) => {
          const page = getActivePage(updatedScene);

          if (!page) {
            return;
          }

          const event = createSceneEvent(updatedScene, "INITIATIVE_SNAPSHOT", { initiative: updatedScene.initiative }, page.id);
          await Promise.all([
            persistInitiativeSnapshot(updatedScene.sessionId, page.id, updatedScene.initiative, updatedScene.revision),
            persistSceneEventLog(event),
          ]);
        },
      },
    );
    if (!nextScene.initiative.activeTurnId) {
      await appendChatMessage("Sistema", "Encontro encerrado.", "system");
      return;
    }
    if (nextScene.initiative.round > prevRound) {
      await appendChatMessage("Sistema", `Rodada ${nextScene.initiative.round}.`, "system");
    }
  };

  const createNpc = async () => {
    if (!npcDraft.name.trim()) return;
    const nextScene = await mutateScene(
      (c) => addSceneNpc(c, npcDraft),
      {
        eventFactory: (updatedScene) => {
          const object = updatedScene.objects.find((candidate) => candidate.id === updatedScene.selectedObjectId);
          return object ? createSceneEvent(updatedScene, "OBJECT_CREATED", { object }, object.pageId) : null;
        },
        persistActionFactory: async (updatedScene) => {
          const object = updatedScene.objects.find((candidate) => candidate.id === updatedScene.selectedObjectId);

          if (!object) {
            return;
          }

          const event = createSceneEvent(updatedScene, "OBJECT_CREATED", { object }, object.pageId);
          await Promise.all([
            persistSceneObjects(updatedScene.sessionId, [object]),
            persistSceneEventLog(event),
          ]);
        },
      },
    );
    setNpcDraft({ name: "", hp: 18, ac: 13, initiativeBonus: 1, notes: "" });
    const tok = nextScene.objects.find((o) => o.id === nextScene.selectedObjectId);
    if (tok?.objectType === "token") {
      await appendChatMessage("Sistema", `${tok.payload.name} em ${getPositionLabel(tok.position.x, tok.position.y)}.`, "npc");
    }
  };

  const setActiveTool = (tool: LeftTool) => {
    const modeMap: Record<LeftTool, BoardMode> = {
      select: "move",
      move: "move",
      fog: "fog",
      measure: "measure",
      wall: "wall",
      light: "light",
    };
    void mutateScene((c) => setBoardMode(c, modeMap[tool]));
  };

  const currentTool: LeftTool =
    scene.boardMode === "fog" ? "fog"
    : scene.boardMode === "measure" ? "measure"
    : scene.boardMode === "wall" ? "wall"
    : scene.boardMode === "light" ? "light"
    : "move";

  const toolButtons: { id: LeftTool; icon: React.ReactNode; label: string }[] = [
    { id: "select", icon: <MousePointer className="h-4 w-4" />, label: "Selecionar" },
    { id: "move", icon: <Crosshair className="h-4 w-4" />, label: "Mover" },
    { id: "fog", icon: <EyeOff className="h-4 w-4" />, label: "Fog de Guerra" },
    { id: "measure", icon: <Ruler className="h-4 w-4" />, label: "Medir" },
    { id: "wall", icon: <WallpaperIcon className="h-4 w-4" />, label: "Paredes (bloqueiam visão)" },
    { id: "light", icon: <Lightbulb className="h-4 w-4" />, label: "Fonte de Luz" },
  ];

  const [mobilePanel, setMobilePanel] = useState(false);

  return (
    <div className="fixed inset-0 z-[60] flex bg-background-strong safe-top safe-bottom safe-left safe-right">
      {/* Left toolbar — horizontal on mobile, vertical on desktop */}
      <div className="hidden w-12 flex-col items-center border-r border-border/70 bg-surface-raised py-2 sm:flex">
        <Link
          to="/jogar"
          className="mb-4 flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          title="Voltar ao Hub"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <div className="w-8 border-t border-border/50 mb-3" />

        {toolButtons.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            title={tool.label}
            className={cn(
              "mb-1 flex h-9 w-9 items-center justify-center rounded-md transition-colors",
              currentTool === tool.id
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            {tool.icon}
          </button>
        ))}

        <div className="w-8 border-t border-border/50 my-3" />

        <button
          onClick={() => setShowGrid((v) => !v)}
          title={showGrid ? "Ocultar grid" : "Mostrar grid"}
          className={cn(
            "mb-1 flex h-9 w-9 items-center justify-center rounded-md transition-colors",
            showGrid ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
          )}
        >
          <Grid3X3 className="h-4 w-4" />
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          title="Importar battlemap"
          className={cn(
            "mb-1 flex h-9 w-9 items-center justify-center rounded-md transition-colors",
            battlemapUrl
              ? "bg-primary/20 text-primary"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground",
          )}
        >
          <ImagePlus className="h-4 w-4" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => void handleBattlemapImport(event)}
        />

        <div className="flex-1" />

        <div className="w-8 border-t border-border/50 mb-3" />

        <button
          onClick={() => void mutateScene((c) => toggleDynamicLighting(c))}
          title={activePage?.dynamicLighting ? "Desativar iluminação dinâmica" : "Ativar iluminação dinâmica"}
          className={cn(
            "mb-1 flex h-9 w-9 items-center justify-center rounded-md transition-colors",
            activePage?.dynamicLighting
              ? "bg-amber-500/20 text-amber-400"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground",
          )}
        >
          <Flame className="h-4 w-4" />
        </button>

        <button
          onClick={() => void mutateScene((c) => clearSceneWalls(c))}
          title="Limpar paredes"
          className="mb-1 flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>

        <div className="w-8 border-t border-border/50 mb-3" />

        <button
          onClick={() => void mutateScene((c) => revealEntireSceneFog(c))}
          title="Revelar todo o mapa"
          className="mb-1 flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Eye className="h-4 w-4" />
        </button>
        <button
          onClick={() => void mutateScene((c) => restoreSceneFog(c))}
          title="Restaurar neblina"
          className="mb-1 flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Layers className="h-4 w-4" />
        </button>
      </div>

      {/* Center: canvas area */}
      <div className="relative flex-1 flex flex-col overflow-hidden">
        {/* Top bar inside canvas */}
        <div className="flex h-10 items-center justify-between border-b border-border/40 bg-surface-raised/80 px-2 sm:px-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Mobile back button */}
            <Link
              to="/jogar"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground sm:hidden"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <span className="truncate font-heading text-xs uppercase tracking-[0.2em] text-primary/80">
              {activePage?.name ?? "Pagina"}
            </span>
            <Badge variant="outline" className="hidden border-border/40 text-[10px] sm:inline-flex">
              Rev {scene.revision}
            </Badge>
            {activePage && (
              <Badge variant="outline" className="hidden border-border/40 text-[10px] md:inline-flex">
                {activePage.width}x{activePage.height}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Badge variant={sessionReady ? "success" : "outline"} className="border-border/40 text-[10px]">
              {sessionReady ? "Ativa" : "Sync"}
            </Badge>
            <Badge variant="outline" className="hidden border-border/40 text-[10px] sm:inline-flex">
              <Users className="mr-1 h-3 w-3" />
              {scene.presence.length || 1}
            </Badge>
            {activeTurn && (
              <Badge variant="info" className="text-[10px]">
                <Sword className="mr-1 h-3 w-3" />
                <span className="hidden sm:inline">{activeTurn.name} —</span> R{scene.initiative.round}
              </Badge>
            )}
            {/* Mobile panel toggle */}
            <button
              onClick={() => setMobilePanel((v) => !v)}
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground sm:hidden"
            >
              <MessageSquare className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative">
          {activePage && (
            <VttPixiStage
              page={activePage}
              tokens={tokens}
              selectedTokenId={scene.selectedObjectId}
              boardMode={scene.boardMode}
              gridOpacity={gridOpacity}
              gridColor={0xffffff}
              showGrid={showGrid}
              battlemapUrl={battlemapUrl}
              onCellClick={(cell) => void handleCellClick(cell)}
              onSelectToken={(tokenId) =>
                void mutateScene((c) => setSceneSelection(c, tokenId), { broadcast: false, persist: false })
              }
              onMoveToken={(tokenId, x, y) => void handleMoveToken(tokenId, x, y)}
              onExpandMap={(edge) => void handleExpandMap(edge)}
              onTravelEdge={(edge, tokenId) => handleTravelEdge(edge, tokenId)}
              onCameraChange={(camera) => void handleCameraChange(camera)}
              onDropEntry={(slug, cell) => void handleDropLoreEntry(slug, cell)}
              onAddWall={(x1, y1, x2, y2) => void mutateScene((c) => addSceneWall(c, x1, y1, x2, y2))}
              onAddLight={(cellX, cellY) => void mutateScene((c) => addSceneLight(c, cellX, cellY))}
            />
          )}

          {/* Zoom controls - floating right */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 rounded-lg border border-border/40 bg-surface-raised/90 p-1 backdrop-blur-sm">
            <button
              onClick={() => void mutateScene((c) => setSceneCameraScale(c, "in"), { broadcast: false, persist: false })}
              className="flex h-8 w-8 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Plus className="h-4 w-4" />
            </button>
            <div className="text-[10px] text-muted-foreground">
              {activePage ? Math.round(activePage.camera.scale * 100) : 100}
            </div>
            <button
              onClick={() => void mutateScene((c) => setSceneCameraScale(c, "out"), { broadcast: false, persist: false })}
              className="flex h-8 w-8 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Minus className="h-4 w-4" />
            </button>
            <div className="w-6 border-t border-border/40 my-1" />
            <button
              onClick={() => void mutateScene((c) => setSceneCameraScale(c, "reset"), { broadcast: false, persist: false })}
              className="flex h-8 w-8 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <RefreshCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Selected token bar at the bottom */}
        {selectedToken && (
          <div className="flex items-center gap-2 border-t border-border/40 bg-surface-raised/90 px-2 py-1.5 sm:gap-3 sm:px-4 sm:py-2">
            <div className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold sm:h-8 sm:w-8 sm:text-xs",
              selectedToken.payload.team === "party" ? "bg-info/20 text-info" : "bg-destructive/20 text-destructive",
            )}>
              {selectedToken.payload.shortName}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-heading text-xs text-foreground sm:text-sm">{selectedToken.payload.name}</p>
              <p className="hidden text-[10px] text-muted-foreground sm:block">
                {selectedToken.payload.role} · {getPositionLabel(selectedToken.position.x, selectedToken.position.y)}
              </p>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[10px] text-muted-foreground sm:text-xs">HP</span>
              <span className="font-heading text-xs text-foreground sm:text-sm">
                {selectedToken.payload.hp}/{selectedToken.payload.hpMax}
              </span>
              <span className="text-[10px] text-muted-foreground sm:text-xs">CA</span>
              <span className="font-heading text-xs text-foreground sm:text-sm">{selectedToken.payload.ac}</span>
              <div className="ml-1 flex items-center gap-0.5 sm:ml-2 sm:gap-1">
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => void adjustHp(selectedToken.id, -5)}>
                  <Minus className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => void adjustHp(selectedToken.id, +5)}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile bottom toolbar */}
        <div className="flex items-center justify-around border-t border-border/40 bg-surface-raised/95 px-1 py-1 sm:hidden">
          {toolButtons.slice(0, 4).map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-md transition-colors",
                currentTool === tool.id
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground",
              )}
            >
              {tool.icon}
            </button>
          ))}
          <button
            onClick={() => setShowGrid((v) => !v)}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-md transition-colors",
              showGrid ? "bg-primary/20 text-primary" : "text-muted-foreground",
            )}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors"
          >
            <ImagePlus className="h-4 w-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden sm:block"
            onChange={(event) => void handleBattlemapImport(event)}
          />
        </div>
      </div>

      {/* Right panel toggle — desktop only */}
      <button
        onClick={() => setRightOpen((v) => !v)}
        className="hidden w-5 items-center justify-center border-l border-border/40 bg-surface-raised text-muted-foreground transition-colors hover:text-foreground sm:flex"
      >
        {rightOpen ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>

      {/* Mobile panel overlay */}
      {mobilePanel && (
        <div className="absolute inset-0 z-[70] flex flex-col bg-surface-raised/98 backdrop-blur sm:hidden">
          <div className="flex items-center justify-between border-b border-border/40 px-3 py-2">
            <span className="font-heading text-xs uppercase tracking-[0.16em] text-primary/80">Painel</span>
            <button onClick={() => setMobilePanel(false)} className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-1 flex-col overflow-hidden">
            <Tabs value={rightTab} onValueChange={(v) => setRightTab(v as RightTab)} className="flex flex-1 flex-col">
              <TabsList className="grid h-auto w-full grid-cols-3 gap-px rounded-none border-b border-border/40 bg-border/30 p-1">
                {rightTabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    title={tab.label}
                    className="flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-lg border border-transparent bg-transparent px-1 py-1.5 text-[10px] font-medium tracking-[0.12em] text-muted-foreground data-[state=active]:border-primary/40 data-[state=active]:bg-background/70 data-[state=active]:text-foreground"
                  >
                    {tab.icon}
                    <span className="uppercase">{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

      {/* Reuse same tab content — rendered below for desktop */}
            </Tabs>
          </div>
        </div>
      )}

      {/* Right panel — desktop */}
      {rightOpen && (
        <div className="hidden w-[min(26rem,calc(100vw-5rem))] flex-col border-l border-border/70 bg-surface-raised/95 backdrop-blur sm:flex xl:w-[26rem] 2xl:w-[28rem]">
          <Tabs value={rightTab} onValueChange={(v) => setRightTab(v as RightTab)} className="flex flex-1 flex-col">
            <TabsList className="grid h-auto w-full grid-cols-3 gap-px rounded-none border-b border-border/40 bg-border/30 p-1">
              {rightTabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  title={tab.label}
                  className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg border border-transparent bg-transparent px-2 py-2 text-[11px] font-medium tracking-[0.14em] text-muted-foreground data-[state=active]:border-primary/40 data-[state=active]:bg-background/70 data-[state=active]:text-foreground"
                >
                  {tab.icon}
                  <span className="uppercase">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Chat tab */}
            <TabsContent value="chat" className="mt-0 flex flex-1 flex-col overflow-hidden">
              <ScrollArea className="flex-1">
                <div className="space-y-4 px-4 py-4 pr-5">
                  <SidePanelCard
                    title="Canal da sessao"
                    description="Mensagens, avisos do narrador e rolagens compartilhadas entre todos na mesa."
                  >
                    <div className="space-y-3">
                      {scene.chatMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={cn(
                            "rounded-xl border px-3 py-3",
                            msg.tone === "system" && "border-primary/20 bg-primary/5",
                            msg.tone === "party" && "border-emerald-500/20 bg-emerald-500/5",
                            msg.tone === "npc" && "border-amber-400/20 bg-amber-400/5",
                            msg.tone === "roll" && "border-sky-500/20 bg-sky-500/5",
                          )}
                        >
                          <div className="mb-1 flex items-center justify-between gap-2">
                            <span className="font-heading text-[11px] uppercase tracking-[0.18em] text-foreground">{msg.author}</span>
                            <span className="text-[11px] text-muted-foreground">{msg.time}</span>
                          </div>
                          <p className="text-sm leading-6 text-foreground/90">{msg.text}</p>
                        </div>
                      ))}
                    </div>
                  </SidePanelCard>
                </div>
              </ScrollArea>

              {/* Dice shortcuts */}
              <div className="border-t border-border/40 px-4 py-4">
                <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Rolagens rapidas</p>
                <div className="mb-3 grid grid-cols-6 gap-1.5">
                  {["1d4", "1d6", "1d8", "1d10", "1d12", "1d20"].map((n) => (
                    <button
                      key={n}
                      onClick={() => void rollNotation(n, selectedToken?.payload.name ?? "Mesa")}
                      className="rounded-lg bg-secondary/60 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <div className="mb-1 flex gap-2">
                  <Input
                    value={diceDraft}
                    onChange={(e) => setDiceDraft(e.target.value)}
                    placeholder="2d6+3"
                    className="h-10 bg-background/60 text-sm"
                    onKeyDown={(e) => e.key === "Enter" && void rollNotation(diceDraft, selectedToken?.payload.name ?? "Mesa")}
                  />
                  <Button size="sm" className="h-10 px-4" onClick={() => void rollNotation(diceDraft, selectedToken?.payload.name ?? "Mesa")}>
                    <Dice6 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Chat input */}
              <div className="border-t border-border/40 p-4">
                <div className="mb-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Nova mensagem</div>
                <div className="flex gap-2">
                  <Input
                    value={chatDraft}
                    onChange={(e) => setChatDraft(e.target.value)}
                    placeholder="Enviar mensagem..."
                    className="h-10 bg-background/60 text-sm"
                    onKeyDown={(e) => e.key === "Enter" && void sendChat()}
                  />
                  <Button size="sm" className="h-10 px-4" onClick={() => void sendChat()}>
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Tokens tab */}
            <TabsContent value="tokens" className="mt-0 flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="space-y-4 px-4 py-4 pr-5">
                  {tokens.length === 0 ? (
                    <p className="rounded-xl border border-border/40 bg-background/30 px-4 py-4 text-center text-sm text-muted-foreground">
                      Nenhum token na cena.
                    </p>
                  ) : (
                    tokens.map((token) => (
                      <button
                        key={token.id}
                        onClick={() => void mutateScene((c) => setSceneSelection(c, token.id), { broadcast: false, persist: false })}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl border bg-background/35 px-3 py-3 text-left transition-colors",
                          token.id === scene.selectedObjectId
                            ? "border-primary/40 bg-primary/5"
                            : "border-border/40 hover:border-border/70",
                        )}
                      >
                        <div className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold",
                          token.payload.team === "party" ? "bg-info/20 text-info" : "bg-destructive/20 text-destructive",
                        )}>
                          {token.payload.shortName}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">{token.payload.name}</p>
                          <p className="text-xs leading-5 text-muted-foreground">
                            HP {token.payload.hp}/{token.payload.hpMax} · CA {token.payload.ac}
                          </p>
                        </div>
                        {token.payload.hp <= 0 && <Skull className="h-3.5 w-3.5 text-destructive" />}
                      </button>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Initiative tab */}
            <TabsContent value="initiative" className="mt-0 flex-1 overflow-hidden">
              <div className="flex flex-col h-full">
                <div className="flex gap-2 border-b border-border/40 p-4">
                  <Button size="sm" className="h-10 flex-1 text-sm" onClick={() => void startInitiative()}>
                    Iniciar
                  </Button>
                  <Button size="sm" variant="outline" className="h-10 flex-1 text-sm" onClick={() => void advanceTurn()}>
                    Próximo
                  </Button>
                  <Button size="sm" variant="ghost" className="h-10 text-sm" onClick={() => void mutateScene((c) => clearSceneInitiative(c))}>
                    Limpar
                  </Button>
                </div>
                <ScrollArea className="flex-1">
                  <div className="space-y-2 px-4 py-4 pr-5">
                    {scene.initiative.entries.length === 0 ? (
                      <p className="rounded-xl border border-border/40 bg-background/30 px-4 py-4 text-center text-sm text-muted-foreground">
                        Nenhuma iniciativa rolada.
                      </p>
                    ) : (
                      scene.initiative.entries.map((entry) => (
                        <div
                          key={entry.tokenId}
                          className={cn(
                            "flex items-center gap-3 rounded-xl border bg-background/35 px-3 py-3",
                            entry.tokenId === scene.initiative.activeTurnId
                              ? "border-primary/40 bg-primary/10"
                              : "border-border/40",
                          )}
                        >
                          <span className="font-heading text-sm text-primary">{entry.total}</span>
                          <span className="flex-1 truncate text-sm text-foreground">{entry.name}</span>
                          <Badge variant={entry.team === "party" ? "secondary" : "outline"} className="text-[10px]">
                            {entry.team}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
                {activeTurn && (
                  <div className="border-t border-border/40 p-4">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Turno ativo</p>
                    <p className="font-heading text-base text-foreground">{activeTurn.name}</p>
                    <p className="text-xs text-muted-foreground">Rodada {scene.initiative.round}</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Codex tab */}
            <TabsContent value="codex" className="mt-0 flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="space-y-3 px-4 py-4 pr-5">
                  {loreThreats.map((entry) => (
                    <div
                      key={entry.slug}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("application/x-dark-lore-entry", entry.slug);
                        e.dataTransfer.effectAllowed = "copy";
                      }}
                      className="cursor-grab rounded-xl border border-border/40 bg-background/35 p-3 transition-colors hover:border-primary/30"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-medium text-foreground">{entry.title}</p>
                        <Badge variant="outline" className="border-border/40 text-[10px]">
                          HP {entry.vtt.hp}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground line-clamp-2">{entry.summary}</p>
                      <Button size="sm" variant="ghost" className="mt-1.5 h-7 w-full text-[11px]" onClick={() => {
                        void mutateScene((c) =>
                          addSceneNpc(c, {
                            name: entry.title,
                            hp: entry.vtt.hp,
                            ac: entry.vtt.ac,
                            initiativeBonus: entry.vtt.initiativeBonus,
                            notes: entry.vtt.note || entry.summary,
                            role: entry.vtt.role,
                            color: entry.vtt.color,
                          }),
                        );
                      }}>
                        Spawn rápido
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* NPC tab */}
            <TabsContent value="npc" className="mt-0 flex-1 overflow-hidden">
              <div className="flex flex-col h-full">
                <ScrollArea className="flex-1">
                  <div className="space-y-3 px-4 py-4 pr-5">
                    <Input
                      value={npcDraft.name}
                      onChange={(e) => setNpcDraft((c) => ({ ...c, name: e.target.value }))}
                      placeholder="Nome do NPC"
                      className="h-10 text-sm"
                    />
                    <div className="grid grid-cols-3 gap-1.5">
                      <Input
                        type="number"
                        value={npcDraft.hp}
                        onChange={(e) => setNpcDraft((c) => ({ ...c, hp: Number(e.target.value) }))}
                        placeholder="HP"
                        className="h-8 text-xs"
                      />
                      <Input
                        type="number"
                        value={npcDraft.ac}
                        onChange={(e) => setNpcDraft((c) => ({ ...c, ac: Number(e.target.value) }))}
                        placeholder="CA"
                        className="h-8 text-xs"
                      />
                      <Input
                        type="number"
                        value={npcDraft.initiativeBonus}
                        onChange={(e) => setNpcDraft((c) => ({ ...c, initiativeBonus: Number(e.target.value) }))}
                        placeholder="Ini"
                        className="h-8 text-xs"
                      />
                    </div>
                    <Textarea
                      value={npcDraft.notes}
                      onChange={(e) => setNpcDraft((c) => ({ ...c, notes: e.target.value }))}
                      placeholder="Notas e comportamento"
                      className="min-h-[112px] text-sm"
                    />
                    <Button className="h-10 w-full text-sm" onClick={() => void createNpc()}>
                      <Plus className="mr-1.5 h-3.5 w-3.5" />
                      Adicionar NPC
                    </Button>
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="map" className="mt-0 flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="space-y-4 px-4 py-4 pr-5">
                  <SidePanelCard
                    title="Leitura do mapa"
                    description="Tudo o que voce precisa para preparar o battlemap, ampliar o grid e costurar areas extensas fica concentrado nesta aba."
                  >
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-lg border border-border/40 bg-background/55 px-3 py-2">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Area</p>
                        <p className="mt-1 text-sm text-foreground">{activePage?.name ?? "Sem pagina"}</p>
                      </div>
                      <div className="rounded-lg border border-border/40 bg-background/55 px-3 py-2">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Grade</p>
                        <p className="mt-1 text-sm text-foreground">
                          {activePage ? `${activePage.width}x${activePage.height}` : "--"}
                        </p>
                      </div>
                      <div className="rounded-lg border border-border/40 bg-background/55 px-3 py-2">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Grid</p>
                        <p className="mt-1 text-sm text-foreground">{activePage?.gridSize ?? 72}px</p>
                      </div>
                    </div>
                  </SidePanelCard>
                  <div className="rounded-xl border border-border/50 bg-background/35 p-4">
                    <p className="font-heading text-base text-foreground">Battlemap da pagina</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Importe uma imagem e ajuste a grade por cima dela. Os tokens vao se mover sobre esse mapa.
                    </p>
                    <Button
                      size="sm"
                      className="mt-3 h-10 w-full text-sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={battlemapUploading || !activePage}
                    >
                      <ImagePlus className="h-3.5 w-3.5" />
                      {battlemapUploading ? "Importando..." : battlemapUrl ? "Trocar battlemap" : "Importar battlemap"}
                    </Button>
                    {battlemapUrl && (
                      <div className="mt-3 overflow-hidden rounded-lg border border-border/40 bg-background/60">
                        <img
                          src={battlemapUrl}
                          alt="Preview do battlemap"
                          className="h-36 w-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl border border-border/50 bg-background/35 p-4">
                    <p className="font-heading text-base text-foreground">Grade da mesa</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Ajuste a quantidade de colunas, linhas e o tamanho visual de cada quadrado.
                    </p>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Colunas</label>
                        <Input
                          type="number"
                          min={4}
                          value={mapColumns}
                          onChange={(event) => setMapColumns(Number(event.target.value) || 4)}
                          className="h-10 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Linhas</label>
                        <Input
                          type="number"
                          min={4}
                          value={mapRows}
                          onChange={(event) => setMapRows(Number(event.target.value) || 4)}
                          className="h-10 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Grid px</label>
                        <Input
                          type="number"
                          min={32}
                          step={4}
                          value={mapGridSize}
                          onChange={(event) => setMapGridSize(Number(event.target.value) || 32)}
                          className="h-10 text-sm"
                        />
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <label className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Opacidade do grid</label>
                        <span className="text-sm text-foreground">{Math.round(gridOpacity * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min={5}
                        max={80}
                        step={5}
                        value={Math.round(gridOpacity * 100)}
                        onChange={(event) => setGridOpacity(Number(event.target.value) / 100)}
                        className="w-full accent-primary"
                      />
                      <div className="flex items-center justify-between gap-2">
                        <Button
                          size="sm"
                          variant={showGrid ? "primary" : "outline"}
                          className="h-10 flex-1 text-sm"
                          onClick={() => setShowGrid((current) => !current)}
                        >
                          {showGrid ? "Ocultar grid" : "Mostrar grid"}
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-10 flex-1 text-sm"
                          onClick={() => void applyBattlemapGrid()}
                          disabled={!activePage}
                        >
                          Aplicar grade
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/50 bg-background/35 p-4">
                    <p className="font-heading text-base text-foreground">Expansao do grid</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Use os botoes + nas bordas do mapa para abrir novas colunas e linhas sem deformar o battlemap atual.
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <Button size="sm" variant="outline" className="h-10 text-sm" onClick={() => void handleExpandMap("north")}>
                        + Norte
                      </Button>
                      <Button size="sm" variant="outline" className="h-10 text-sm" onClick={() => void handleExpandMap("east")}>
                        + Leste
                      </Button>
                      <Button size="sm" variant="outline" className="h-10 text-sm" onClick={() => void handleExpandMap("west")}>
                        + Oeste
                      </Button>
                      <Button size="sm" variant="outline" className="h-10 text-sm" onClick={() => void handleExpandMap("south")}>
                        + Sul
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/50 bg-background/35 p-4">
                    <p className="font-heading text-base text-foreground">Areas conectadas</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Crie novas areas e costure as bordas para viagens longas e transicao fluida entre mapas.
                    </p>

                    <div className="mt-3 space-y-2">
                      <Input
                        value={newPageName}
                        onChange={(event) => setNewPageName(event.target.value)}
                        placeholder="Nome da nova area"
                        className="h-10 text-sm"
                      />
                      <Input
                        value={newPageRegion}
                        onChange={(event) => setNewPageRegion(event.target.value)}
                        placeholder="Regiao ou frente narrativa"
                        className="h-10 text-sm"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-10 w-full text-sm"
                        onClick={() => void handleCreateScenePage()}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Criar nova area
                      </Button>
                    </div>

                    <div className="mt-4 rounded-xl border border-border/40 bg-background/40 p-3">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                        Ligacao da area atual
                      </p>
                      <div className="mt-3 space-y-2">
                        <label className="space-y-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                          <span>Destino</span>
                          <select
                            value={connectionTargetId}
                            onChange={(event) => setConnectionTargetId(event.target.value)}
                            className="flex h-10 w-full rounded-[calc(var(--radius)-4px)] border border-input bg-surface-raised/55 px-3 text-sm text-foreground"
                          >
                            <option value="">Selecione uma area</option>
                            {scene.pages
                              .filter((page) => page.id !== activePage?.id)
                              .map((page) => (
                                <option key={page.id} value={page.id}>
                                  {page.name}
                                </option>
                              ))}
                          </select>
                        </label>

                        <div className="grid grid-cols-2 gap-2">
                          <label className="space-y-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                            <span>Borda</span>
                            <select
                              value={connectionEdge}
                              onChange={(event) => setConnectionEdge(event.target.value as PageConnectionEdge)}
                              className="flex h-10 w-full rounded-[calc(var(--radius)-4px)] border border-input bg-surface-raised/55 px-3 text-sm text-foreground"
                            >
                              <option value="north">Norte</option>
                              <option value="east">Leste</option>
                              <option value="south">Sul</option>
                              <option value="west">Oeste</option>
                            </select>
                          </label>
                          <label className="space-y-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                            <span>Nome da passagem</span>
                            <Input
                              value={connectionLabel}
                              onChange={(event) => setConnectionLabel(event.target.value)}
                              placeholder="Porta, estrada, desfiladeiro..."
                              className="h-10 text-sm"
                            />
                          </label>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            type="number"
                            min={0}
                            value={connectionSpawnX}
                            onChange={(event) => setConnectionSpawnX(Number(event.target.value) || 0)}
                            placeholder="Spawn X"
                            className="h-10 text-sm"
                          />
                          <Input
                            type="number"
                            min={0}
                            value={connectionSpawnY}
                            onChange={(event) => setConnectionSpawnY(Number(event.target.value) || 0)}
                            placeholder="Spawn Y"
                            className="h-10 text-sm"
                          />
                        </div>

                        <Button
                          size="sm"
                          className="h-10 w-full text-sm"
                          onClick={() => void handleCreateConnection()}
                          disabled={!activePage || scene.pages.length < 2}
                        >
                          Conectar borda
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                        Areas na malha
                      </p>
                      <div className="space-y-2">
                        {scene.pages.map((page) => (
                          <div
                            key={page.id}
                            className={cn(
                              "rounded-xl border px-3 py-3",
                              page.id === activePage?.id ? "border-primary/30 bg-primary/5" : "border-border/40 bg-background/35",
                            )}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <p className="text-sm font-medium text-foreground">{page.name}</p>
                                <p className="text-xs leading-5 text-muted-foreground">
                                  {page.region} • {page.width}x{page.height}
                                </p>
                              </div>
                              {page.id !== activePage?.id ? (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 px-3 text-xs"
                                  onClick={() =>
                                    void mutateScene((current) => ({
                                      ...current,
                                      activePageId: page.id,
                                      revision: current.revision + 1,
                                    }), { broadcast: false, persist: false })
                                  }
                                >
                                  Abrir
                                </Button>
                              ) : (
                                <Badge variant="outline" className="text-[10px]">Ativa</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/50 bg-background/35 p-4">
                    <p className="font-heading text-base text-foreground">Conexoes da area ativa</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Arraste um token para fora de uma borda conectada ou use a travessia manual abaixo.
                    </p>
                    <div className="mt-3 space-y-2">
                      {!activePage?.connections.length ? (
                        <p className="text-sm text-muted-foreground">Nenhuma conexao criada para esta area.</p>
                      ) : (
                        activePage.connections.map((connection) => {
                          const destination = scene.pages.find((page) => page.id === connection.targetPageId);

                          return (
                            <div
                              key={connection.id}
                              className="rounded-xl border border-border/40 bg-background/40 p-3"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="text-sm font-medium text-foreground">{connection.label}</p>
                                  <p className="text-xs leading-5 text-muted-foreground">
                                    {connection.edge.toUpperCase()} • {destination?.name ?? "Destino"} • spawn {connection.spawn.x},{connection.spawn.y}
                                  </p>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 px-3 text-xs"
                                    onClick={() => void handleTravelConnection(connection.id)}
                                    disabled={!selectedToken}
                                  >
                                    Viajar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 px-3 text-xs text-destructive"
                                    onClick={() =>
                                      void mutateScene((current) =>
                                        removeSceneConnection(current, activePage.id, connection.id),
                                      )
                                    }
                                  >
                                    Remover
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/50 bg-background/35 p-4">
                    <p className="font-heading text-base text-foreground">Fluxo da mesa</p>
                    <div className="mt-2 space-y-2 text-sm leading-6 text-muted-foreground">
                      <p>1. Importe a imagem do battlemap.</p>
                      <p>2. Ajuste colunas, linhas e tamanho do grid ate encaixar.</p>
                      <p>3. Use os botoes + nas bordas para abrir espaco onde precisar.</p>
                      <p>4. Conecte areas extensas quando quiser travessia continua entre mapas.</p>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
