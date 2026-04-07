import { lazy, Suspense, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
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
  Loader2,
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

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CLASSES,
  SPELLS,
  WITCHER_HIT_LOCATION_TABLE,
  WITCHER_SIMPLE_CRITICAL_TABLE,
  parseDiceNotation,
  rollDice,
} from "@/lib/rpg-utils";
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
  isLegacySeedScene,
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
import {
  buildSceneNarration,
  getWitcherCampaignById,
  getWitcherScenesForCampaign,
  getWitcherSceneSeed,
  WitcherAssetIcon,
  WitcherCampaignBrief,
  useSocketTabletopRealtime,
} from "@/features/witcher-system";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { LOCAL_SESSION_ID } from "@/lib/local-identities";
import {
  type TabletopLoreCompendium,
  type TabletopSpawnEntry,
  type TabletopSpawnGroup,
} from "@/lib/tabletop-lore";

const VttPixiStage = lazy(() => import("@/components/rpg/VttPixiStage"));

type LeftTool = "select" | "move" | "fog" | "measure" | "wall" | "light";
type RightTab = "chat" | "tokens" | "initiative" | "codex" | "npc" | "map";
type VttLoreThreat = TabletopSpawnEntry;
type CodexGroup = TabletopSpawnGroup;

type WitcherNpcPreset = {
  label: string;
  role: string;
  hp: number;
  ac: number;
  initiativeBonus: number;
  notes: string;
};

const WITCHER_NPC_PRESETS: WitcherNpcPreset[] = [
  {
    label: "Bruxo errante",
    role: "Bruxo",
    hp: 40,
    ac: 16,
    initiativeBonus: 10,
    notes: "Espada de aco, prata e sinais basicos. Entra como cacador de contrato.",
  },
  {
    label: "Bandido veterano",
    role: "Homem de armas",
    hp: 24,
    ac: 13,
    initiativeBonus: 6,
    notes: "Infantaria leve com escudo, brutalidade curta e moral instavel.",
  },
  {
    label: "Nekker de toca",
    role: "Monstro",
    hp: 18,
    ac: 11,
    initiativeBonus: 7,
    notes: "Ataca em bando, pressiona flanco e cai rapido para dano concentrado.",
  },
  {
    label: "Aparicao faminta",
    role: "Maldicao",
    hp: 28,
    ac: 14,
    initiativeBonus: 8,
    notes: "Responde a prata, Yrden e leitura de vestigios do local assombrado.",
  },
];

const WITCHER_QUICK_NOTES = [
  "Ataques e defesas usam d10 somado a atributos e pericias.",
  "Impacto localizado muda o multiplicador de dano e o risco da cena.",
  "Criticos simples aceleram fraturas, sangramento e perda de mobilidade.",
];

function createNpcDraft(preset: WitcherNpcPreset = WITCHER_NPC_PRESETS[0]) {
  return {
    name: "",
    hp: preset.hp,
    ac: preset.ac,
    initiativeBonus: preset.initiativeBonus,
    role: preset.role,
    notes: preset.notes,
  };
}

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
    <section className={cn("info-panel p-4", className)}>
      <div className="mb-3 space-y-1">
        <h3 className="font-heading text-base text-foreground">{title}</h3>
        {description && <p className="text-sm leading-6 text-foreground/80">{description}</p>}
      </div>
      {children}
    </section>
  );
}

/**
 * ⚡ Bolt Optimization:
 * Isolating the chat input state into its own component prevents the massive
 * MesaPage component (and its entire tree of tokens, chat messages, and VTT)
 * from re-rendering on every single keystroke.
 */
function ChatInput({ onSend }: { onSend: (text: string) => Promise<void> }) {
  const [draft, setDraft] = useState("");

  const handleSend = async () => {
    if (!draft.trim()) return;
    await onSend(draft.trim());
    setDraft("");
  };

  return (
    <div className="flex gap-2">
      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Enviar mensagem..."
        className="h-10 bg-background/60 text-sm"
        onKeyDown={(e) => e.key === "Enter" && void handleSend()}
      />
      <Button size="sm" className="h-10 px-4" onClick={() => void handleSend()} aria-label="Enviar mensagem" title="Enviar mensagem">
        <Send className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

/**
 * ⚡ Bolt Optimization:
 * Isolating the dice input state prevents full-page re-renders on keystrokes.
 */
function DiceInput({ onRoll }: { onRoll: (notation: string) => Promise<void> }) {
  const [draft, setDraft] = useState("1d10");

  return (
    <div className="mb-1 flex gap-2">
      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="1d10+8"
        className="h-10 bg-background/60 text-sm"
        onKeyDown={(e) => e.key === "Enter" && void onRoll(draft)}
      />
      <Button size="sm" className="h-10 px-4" onClick={() => void onRoll(draft)} aria-label="Rolar dados" title="Rolar dados">
        <Dice6 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

function ToolRailButton({
  active = false,
  className,
  title,
  "aria-label": ariaLabel,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      data-active={active}
      className={cn("tool-rail-button h-9 w-9", className)}
      title={title}
      aria-label={ariaLabel || title}
      {...props}
    />
  );
}

function FoundrySidebarTabButton({
  active = false,
  title,
  onClick,
  children,
}: {
  active?: boolean;
  title: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-sm border text-[hsl(var(--foreground)/0.72)] transition-all",
        active
          ? "border-primary/55 bg-[linear-gradient(180deg,rgba(201,161,90,0.26),rgba(90,63,22,0.18))] text-primary shadow-[0_0_18px_rgba(201,161,90,0.14)]"
          : "border-border/50 bg-[rgba(16,12,10,0.86)] hover:border-primary/40 hover:text-primary",
      )}
    >
      {children}
    </button>
  );
}

function FoundryHotbarSlot({
  label,
  active = false,
  title,
  children,
}: {
  label: string;
  active?: boolean;
  title?: string;
  children?: ReactNode;
}) {
  return (
    <button
      type="button"
      className={cn(
        "relative flex h-12 w-12 items-center justify-center rounded-sm border text-[11px] font-medium transition-all",
        active
          ? "border-primary/55 bg-[rgba(201,161,90,0.18)] text-primary"
          : "border-border/50 bg-[rgba(16,12,10,0.88)] text-foreground/56 hover:border-primary/35 hover:text-foreground/82",
      )}
      aria-label={`Slot ${label}`}
      title={title ?? `Slot ${label}`}
    >
      <span className="absolute left-1.5 top-1 text-[10px] uppercase tracking-[0.08em]">{label}</span>
      <span className="pointer-events-none">{children}</span>
    </button>
  );
}

function MesaStageFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background-strong">
      <div className="info-panel max-w-sm px-6 py-5 text-center">
        <p className="text-[11px] uppercase tracking-[0.2em] text-primary/78">Mesa virtual</p>
        <p className="mt-2 font-heading text-lg text-foreground">Carregando o palco tatico...</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          O renderer entra em seguida, junto com os controles de grid, luz e movimento.
        </p>
      </div>
    </div>
  );
}

export default function MesaPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { campaignId: campaignRouteId, sceneId: sceneRouteId } = useParams();
  const activeCampaign = useMemo(() => getWitcherCampaignById(campaignRouteId), [campaignRouteId]);
  const campaignScenes = useMemo(() => getWitcherScenesForCampaign(campaignRouteId), [campaignRouteId]);
  const activeSceneSeed = useMemo(
    () => getWitcherSceneSeed(sceneRouteId ?? activeCampaign.defaultSceneId),
    [activeCampaign.defaultSceneId, sceneRouteId],
  );
  const [scene, setScene] = useState<SceneModel>(() => createSceneModel());
  const [sessionReady, setSessionReady] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [gridOpacity, setGridOpacity] = useState(0.3);
  const [mapColumns, setMapColumns] = useState(12);
  const [mapRows, setMapRows] = useState(8);
  const [mapGridSize, setMapGridSize] = useState(72);
  const [battlemapUploading, setBattlemapUploading] = useState(false);
  const [rightOpen, setRightOpen] = useState(true);
  const [rightTab, setRightTab] = useState<RightTab>("codex");
  const [loreThreats, setLoreThreats] = useState<VttLoreThreat[]>([]);
  const [codexGroups, setCodexGroups] = useState<CodexGroup[]>([]);
  const [tabletopLore, setTabletopLore] = useState<TabletopLoreCompendium | null>(null);
  const [codexLoading, setCodexLoading] = useState(false);
  const [newPageName, setNewPageName] = useState("");
  const [newPageRegion, setNewPageRegion] = useState("");
  const [connectionTargetId, setConnectionTargetId] = useState("");
  const [connectionEdge, setConnectionEdge] = useState<PageConnectionEdge>("east");
  const [connectionLabel, setConnectionLabel] = useState("");
  const [connectionSpawnX, setConnectionSpawnX] = useState(0);
  const [connectionSpawnY, setConnectionSpawnY] = useState(0);
  const [npcDraft, setNpcDraft] = useState(() => createNpcDraft());
  const sceneRef = useRef(scene);
  const presenceRef = useRef(scene.presence);
  const codexLoadRef = useRef<Promise<TabletopLoreCompendium> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handledSpawnSlugRef = useRef<string | null>(null);
  const handledAtlasBattlemapRef = useRef<string | null>(null);
  const activePage = useMemo(() => getActivePage(scene), [scene]);

  useEffect(() => {
    sceneRef.current = scene;
  }, [scene]);

  useEffect(() => {
    presenceRef.current = scene.presence;
  }, [scene.presence]);

  useEffect(() => {
    if (!activePage) {
      return;
    }

    setMapColumns(activePage.width);
    setMapRows(activePage.height);
    setMapGridSize(activePage.gridSize);
    setConnectionSpawnX(Math.max(0, Math.floor(activePage.width / 2)));
    setConnectionSpawnY(Math.max(0, Math.floor(activePage.height / 2)));
  }, [activePage]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const session = await ensureMesaSession(campaignRouteId ?? null);
      const nextSessionId = campaignRouteId ?? session?.id ?? LOCAL_SESSION_ID;
      let loadedScene = (await loadSceneSnapshot(nextSessionId)) ?? createSceneModel(nextSessionId);

      if (isLegacySeedScene(loadedScene)) {
        loadedScene = createSceneModel(nextSessionId);
        await persistSceneSnapshot(loadedScene);
      }

      const sceneNarration = buildSceneNarration(activeSceneSeed);
      loadedScene = {
        ...loadedScene,
        activePageId: loadedScene.pages[0]?.id ?? loadedScene.activePageId,
        pages: loadedScene.pages.map((page, index) =>
          index === 0
            ? {
                ...page,
                name: activeSceneSeed.name,
                region: activeSceneSeed.region,
              }
            : page,
        ),
        chatMessages:
          loadedScene.chatMessages.length > 0
            ? loadedScene.chatMessages
            : [
                {
                  id: `chat-${Date.now()}-system`,
                  author: "Sistema",
                  tone: "system",
                  text: sceneNarration.system,
                  time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
                },
                {
                  id: `chat-${Date.now()}-narrador`,
                  author: activeCampaign.gmLabel,
                  tone: "party",
                  text: sceneNarration.narrator,
                  time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
                },
              ],
      };

      if (!session && nextSessionId === LOCAL_SESSION_ID) {
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
  }, [activeCampaign.gmLabel, activeSceneSeed, campaignRouteId]);

  const { presence, broadcastScene, broadcastSceneEvent } = useSocketTabletopRealtime({
    sessionId: scene.sessionId,
    sceneId: sceneRouteId ?? activeCampaign.defaultSceneId,
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

  const battlemapUrl = activePage?.backgroundAssetUrl ?? null;
  const tokens = useMemo(() => getSceneTokens(scene), [scene]);
  const selectedToken = getSelectedToken(scene);
  const activeTurn = scene.initiative.entries.find((e) => e.tokenId === scene.initiative.activeTurnId);
  const rightTabs: Array<{ id: RightTab; icon: ReactNode; label: string; accent?: ReactNode }> = [
    { id: "chat", icon: <MessageSquare className="h-4 w-4" />, label: "Chat" },
    { id: "tokens", icon: <Ghost className="h-4 w-4" />, label: "Tokens" },
    {
      id: "initiative",
      icon: <WitcherAssetIcon name="adrenaline" className="h-4 w-4 opacity-90" />,
      label: "Iniciativa",
      accent: <Sword className="h-3 w-3" />,
    },
    {
      id: "codex",
      icon: <WitcherAssetIcon name="scrollWitcher" className="h-4 w-4 opacity-90" />,
      label: "Codex",
      accent: <Sparkles className="h-3 w-3" />,
    },
    {
      id: "npc",
      icon: <WitcherAssetIcon name="necrophages" className="h-4 w-4 opacity-90" />,
      label: "Ameacas",
      accent: <Shield className="h-3 w-3" />,
    },
    {
      id: "map",
      icon: <WitcherAssetIcon name="scrollFormulae" className="h-4 w-4 opacity-90" />,
      label: "Mapa",
      accent: <ImagePlus className="h-3 w-3" />,
    },
  ];
  const hotbarSlots: Array<{ label: string; title: string; icon: ReactNode; active?: boolean }> = [
    {
      label: "1",
      title: "Quen defensivo",
      icon: <WitcherAssetIcon name="resolve" className="h-5 w-5 opacity-90" />,
      active: true,
    },
    {
      label: "2",
      title: "Igni ofensivo",
      icon: <WitcherAssetIcon name="adrenaline" className="h-5 w-5 opacity-90" />,
    },
    {
      label: "3",
      title: "Vigor e folego",
      icon: <WitcherAssetIcon name="stamina" className="h-5 w-5 opacity-90" />,
    },
    {
      label: "4",
      title: "Leitura do dossie",
      icon: <WitcherAssetIcon name="scrollWitcher" className="h-5 w-5 opacity-90" />,
    },
    {
      label: "5",
      title: "Contrato e formulas",
      icon: <WitcherAssetIcon name="scrollFormulae" className="h-5 w-5 opacity-90" />,
    },
    {
      label: "6",
      title: "Necrofagos",
      icon: <WitcherAssetIcon name="necrophages" className="h-5 w-5 opacity-90" />,
    },
    {
      label: "7",
      title: "Espectros",
      icon: <WitcherAssetIcon name="specters" className="h-5 w-5 opacity-90" />,
    },
    {
      label: "8",
      title: "Reliquias",
      icon: <WitcherAssetIcon name="relicts" className="h-5 w-5 opacity-90" />,
    },
    {
      label: "9",
      title: "Vitalidade",
      icon: <WitcherAssetIcon name="health" className="h-5 w-5 opacity-90" />,
    },
    {
      label: "0",
      title: "Foco do sinal",
      icon: <WitcherAssetIcon name="focus" className="h-5 w-5 opacity-90" />,
    },
  ];
  const witcherProfessions = useMemo(() => CLASSES.slice(0, 6), []);
  const witcherSigns = useMemo(
    () => SPELLS.filter((spell) => spell.tradition === "sinal").slice(0, 5),
    [],
  );

  const loadCodexCompendium = useCallback(async () => {
    if (codexLoadRef.current) {
      return codexLoadRef.current;
    }

    setCodexLoading(true);

    const nextPromise = import("@/lib/tabletop-lore")
      .then(({ getTabletopLoreCompendium: loadTabletopLoreCompendium }) => {
        const compendium = loadTabletopLoreCompendium();
        setTabletopLore(compendium);
        setLoreThreats(compendium.spawnEntries);
        setCodexGroups(compendium.spawnGroups);
        return compendium;
      })
      .catch((error) => {
        codexLoadRef.current = null;
        throw error;
      })
      .finally(() => {
        setCodexLoading(false);
      });

    codexLoadRef.current = nextPromise;
    return nextPromise;
  }, []);

  const getLoreThreatBySlug = useCallback(
    async (entrySlug: string) => {
      const entries = loreThreats.length ? loreThreats : (await loadCodexCompendium()).spawnEntries;
      return entries.find((candidate) => candidate.slug === entrySlug) ?? null;
    },
    [loadCodexCompendium, loreThreats],
  );

  const handleRightTabChange = useCallback(
    (value: string) => {
      const nextTab = value as RightTab;
      setRightTab(nextTab);

      if (nextTab === "codex") {
        void loadCodexCompendium();
      }
    },
    [loadCodexCompendium],
  );

  useEffect(() => {
    if (rightTab === "codex") {
      void loadCodexCompendium();
    }
  }, [loadCodexCompendium, rightTab]);

  const appendChatMessage = useCallback(async (author: string, text: string, tone: ChatTone) => {
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
  }, [mutateScene]);

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
    const entry = await getLoreThreatBySlug(entrySlug);

    if (!entry) {
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
      const entry = await getLoreThreatBySlug(entrySlug);

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
    [appendChatMessage, getLoreThreatBySlug, mutateScene],
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

  useEffect(() => {
    const atlasBattlemapId = searchParams.get("atlasBattlemap");

    if (!sessionReady || !atlasBattlemapId) {
      return;
    }

    if (handledAtlasBattlemapRef.current === atlasBattlemapId) {
      return;
    }

    handledAtlasBattlemapRef.current = atlasBattlemapId;

    void (async () => {
      const { getAtlasBattlemapById, loadAtlasWorld } = await import("@/lib/hierarchical-atlas");
      const atlasWorld = loadAtlasWorld();
      const battlemap = getAtlasBattlemapById(atlasWorld, atlasBattlemapId);

      if (!battlemap) {
        toast.error("Battlemap do atlas nao encontrado.");
        return;
      }

      const width = Math.max(8, Math.round((battlemap.bounds.northEast.x - battlemap.bounds.southWest.x) / 4));
      const height = Math.max(8, Math.round((battlemap.bounds.southWest.y - battlemap.bounds.northEast.y) / 4));
      const nextScene = configureSceneBattlemap(sceneRef.current, {
        width,
        height,
        gridSize: battlemap.gridSize,
        backgroundAssetUrl: battlemap.imageUrl,
        resetFrame: true,
      });

      await commitScene(nextScene);
      setMapColumns(width);
      setMapRows(height);
      setMapGridSize(battlemap.gridSize);
      setRightTab("map");

      const nextSearchParams = new URLSearchParams(searchParams);
      nextSearchParams.delete("atlasBattlemap");
      setSearchParams(nextSearchParams, { replace: true });
      toast.success(`${battlemap.name} carregado a partir do atlas.`);
    })();
  }, [commitScene, searchParams, sessionReady, setSearchParams]);

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
    setNpcDraft(createNpcDraft());
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
      {/* Left sidebar inspired by Foundry */}
      <aside className="hidden w-[15.25rem] flex-col border-r border-border/70 bg-[rgba(13,10,8,0.94)] backdrop-blur-md md:flex">
        <div className="border-b border-border/50 p-3">
          <div className="flex items-center gap-2">
            <Link
              to="/jogar"
              className="tool-rail-button h-9 w-9 shrink-0"
              title="Voltar ao Hub"
              aria-label="Voltar ao Hub"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="min-w-0 flex-1 rounded-sm border border-primary/25 bg-[rgba(18,13,10,0.88)] px-3 py-2">
              <p className="truncate text-[10px] uppercase tracking-[0.18em] text-primary/76">
                {activeCampaign.stageLabel}
              </p>
              <p className="truncate text-xs text-foreground/82">{activeSceneSeed.name}</p>
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="grid grid-cols-2 gap-2 p-3">
            {toolButtons.map((tool) => (
              <ToolRailButton
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                title={tool.label}
                active={currentTool === tool.id}
                className="h-11 w-full"
              >
                {tool.icon}
              </ToolRailButton>
            ))}

            <ToolRailButton
              onClick={() => setShowGrid((v) => !v)}
              title={showGrid ? "Ocultar grid" : "Mostrar grid"}
              active={showGrid}
              className="h-11 w-full"
            >
              <Grid3X3 className="h-4 w-4" />
            </ToolRailButton>

            <ToolRailButton
              onClick={() => fileInputRef.current?.click()}
              title="Importar battlemap"
              active={Boolean(battlemapUrl)}
              className="h-11 w-full"
            >
              {battlemapUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
            </ToolRailButton>

            <ToolRailButton
              onClick={() => void mutateScene((c) => toggleDynamicLighting(c))}
              title={activePage?.dynamicLighting ? "Desativar iluminacao dinamica" : "Ativar iluminacao dinamica"}
              active={Boolean(activePage?.dynamicLighting)}
              className={cn(
                "h-11 w-full",
                activePage?.dynamicLighting && "border-amber-400/30 bg-amber-500/12 text-amber-300",
              )}
            >
              <Flame className="h-4 w-4" />
            </ToolRailButton>

            <ToolRailButton
              onClick={() => void mutateScene((c) => revealEntireSceneFog(c))}
              title="Revelar todo o mapa"
              className="h-11 w-full"
            >
              <Eye className="h-4 w-4" />
            </ToolRailButton>

            <ToolRailButton
              onClick={() => void mutateScene((c) => restoreSceneFog(c))}
              title="Restaurar neblina"
              className="h-11 w-full"
            >
              <Layers className="h-4 w-4" />
            </ToolRailButton>

            <ToolRailButton
              onClick={() => void mutateScene((c) => clearSceneWalls(c))}
              title="Limpar paredes"
              className="h-11 w-full"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </ToolRailButton>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => void handleBattlemapImport(event)}
          />

          <div className="mt-auto space-y-3 border-t border-border/50 p-3">
            <div className="rounded-sm border border-border/50 bg-[rgba(14,11,9,0.92)] p-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-primary/76">Scene Navigation</p>
              <div className="mt-3 space-y-2">
                {scene.pages.map((page) => (
                  <button
                    key={page.id}
                    type="button"
                    onClick={() => void mutateScene((current) => ({ ...current, activePageId: page.id }), { broadcast: false, persist: true })}
                    className={cn(
                      "flex w-full items-center justify-between rounded-sm border px-3 py-2 text-left text-xs transition-colors",
                      page.id === scene.activePageId
                        ? "border-primary/45 bg-[rgba(201,161,90,0.12)] text-foreground"
                        : "border-border/40 bg-[rgba(20,15,12,0.82)] text-foreground/68 hover:border-primary/30 hover:text-foreground/88",
                    )}
                  >
                    <span className="truncate">{page.name}</span>
                    <span className="text-[10px] uppercase tracking-[0.1em] text-primary/72">
                      {page.region}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-sm border border-border/50 bg-[rgba(14,11,9,0.92)] p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] uppercase tracking-[0.18em] text-primary/76">Companhia</p>
                <span className="text-[10px] uppercase tracking-[0.1em] text-foreground/48">
                  {scene.presence.length || 1} online
                </span>
              </div>
              <div className="mt-3 space-y-2">
                {activeCampaign.players.map((player) => (
                  <div key={player.id} className="flex items-center gap-3 rounded-sm border border-border/40 bg-[rgba(20,15,12,0.82)] px-3 py-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-sm border border-primary/30 bg-[rgba(201,161,90,0.12)] font-heading text-xs text-primary">
                      {player.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs text-foreground">{player.name}</p>
                      <p className="truncate text-[10px] uppercase tracking-[0.12em] text-foreground/58">
                        {player.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Center: canvas area */}
      <div className="relative flex-1 flex flex-col overflow-hidden">
        {/* Top bar inside canvas */}
        <div className="border-b border-border/40 bg-surface-raised/80">
          <div className="flex h-10 items-center justify-between px-2 sm:px-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Mobile back button */}
            <Link
              to="/jogar"
              className="tool-rail-button h-8 w-8 shrink-0 sm:hidden"
              title="Voltar ao Hub"
              aria-label="Voltar ao Hub"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <span className="truncate font-heading text-xs uppercase tracking-[0.2em] text-primary/80">
              {activePage?.name ?? "Pagina"}
            </span>
            <Badge variant="outline" className="hidden border-border/40 text-[10px] text-foreground/78 md:inline-flex">
              {activeCampaign.title}
            </Badge>
            <Badge variant="outline" className="hidden border-primary/30 text-[10px] text-primary lg:inline-flex">
              Witcher TRPG
            </Badge>
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
                <span className="hidden sm:inline">{activeTurn.name} -</span> R{scene.initiative.round}
              </Badge>
            )}
            {/* Mobile panel toggle */}
            <button
              onClick={() => setMobilePanel((v) => !v)}
              className="tool-rail-button h-8 w-8 sm:hidden"
              aria-label="Alternar painel lateral"
              title="Alternar painel lateral"
            >
              <MessageSquare className="h-4 w-4" />
            </button>
            </div>
          </div>

          <div className="hidden items-center justify-between gap-4 border-t border-border/30 px-3 py-2 md:flex">
            <div className="min-w-0 space-y-1">
              <p className="truncate text-[11px] uppercase tracking-[0.18em] text-primary/76">
                {activeCampaign.stageLabel} · {activeSceneSeed.name}
              </p>
              <p className="truncate text-xs leading-5 text-foreground/70">{activeSceneSeed.briefing}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {activeCampaign.players.map((player) => (
                <Badge
                  key={player.id}
                  variant="outline"
                  className="border-border/40 text-[10px] uppercase tracking-[0.12em] text-foreground/76"
                >
                  {player.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="hidden items-center gap-3 border-b border-primary/15 bg-[linear-gradient(180deg,rgba(33,24,18,0.96),rgba(20,14,10,0.96))] px-4 py-2 text-xs text-foreground/82 lg:flex">
          <WitcherAssetIcon name="scrollWitcher" className="h-4 w-4 opacity-90" />
          <p className="truncate">
            Mesa do Continente ativa. A cena segue a linguagem tática do Foundry, com compêndio Witcher e vínculos diretos com o arquivo do portal.
          </p>
          <Badge variant="outline" className="ml-auto border-primary/30 text-[10px] uppercase tracking-[0.14em] text-primary">
            1024x768 recomendado
          </Badge>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative">
          {activePage && (
            <Suspense fallback={<MesaStageFallback />}>
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
            </Suspense>
          )}

          {/* Zoom controls - floating right */}
          <div className="vtt-zoom-controls field-note absolute right-3 top-3 z-20 flex flex-col items-center gap-1 p-1 backdrop-blur-sm">
            <ToolRailButton
              onClick={() => void mutateScene((c) => setSceneCameraScale(c, "in"), { broadcast: false, persist: false })}
              className="h-8 w-8"
              title="Aumentar zoom"
              aria-label="Aumentar zoom"
            >
              <Plus className="h-4 w-4" />
            </ToolRailButton>
            <div className="text-[10px] text-muted-foreground">
              {activePage ? Math.round(activePage.camera.scale * 100) : 100}
            </div>
            <ToolRailButton
              onClick={() => void mutateScene((c) => setSceneCameraScale(c, "out"), { broadcast: false, persist: false })}
              className="h-8 w-8"
              title="Diminuir zoom"
              aria-label="Diminuir zoom"
            >
              <Minus className="h-4 w-4" />
            </ToolRailButton>
            <div className="w-6 border-t border-border/40 my-1" />
            <ToolRailButton
              onClick={() => void mutateScene((c) => setSceneCameraScale(c, "reset"), { broadcast: false, persist: false })}
              className="h-8 w-8"
              title="Restaurar zoom"
              aria-label="Restaurar zoom"
            >
              <RefreshCcw className="h-3.5 w-3.5" />
            </ToolRailButton>
          </div>

          <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 hidden -translate-x-1/2 md:flex">
            <div className="pointer-events-auto flex items-end gap-2 rounded-sm border border-border/55 bg-[rgba(13,10,8,0.9)] px-3 py-2 shadow-[0_20px_36px_rgba(0,0,0,0.42)] backdrop-blur-md">
              <div className="mr-2 flex h-12 items-center border-r border-border/35 pr-3">
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-sm border border-border/45 bg-[rgba(16,12,10,0.88)] text-foreground/70 transition-colors hover:border-primary/35 hover:text-primary"
                  title="Menu principal da mesa"
                  aria-label="Menu principal da mesa"
                >
                  <Layers className="h-4 w-4" />
                </button>
              </div>
              <div className="flex gap-2">
                {hotbarSlots.map((slot) => (
                  <FoundryHotbarSlot
                    key={slot.label}
                    label={slot.label}
                    title={slot.title}
                    active={slot.active}
                  >
                    {slot.icon}
                  </FoundryHotbarSlot>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Selected token bar at the bottom */}
        {selectedToken && (
          <div className="flex items-center gap-2 border-t border-border/40 bg-surface-raised/90 px-2 py-1.5 sm:gap-3 sm:px-4 sm:py-2">
            <div className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center border text-[10px] font-bold sm:h-8 sm:w-8 sm:text-xs",
              selectedToken.payload.team === "party" ? "border-info/30 bg-info/12 text-info" : "border-destructive/30 bg-destructive/12 text-destructive",
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
              <WitcherAssetIcon name="health" className="h-4 w-4 opacity-90" />
              <span className="font-heading text-xs text-foreground sm:text-sm">
                {selectedToken.payload.hp}/{selectedToken.payload.hpMax}
              </span>
              <WitcherAssetIcon name="resolve" className="h-4 w-4 opacity-90" />
              <span className="font-heading text-xs text-foreground sm:text-sm">{selectedToken.payload.ac}</span>
              <div className="ml-1 flex items-center gap-0.5 sm:ml-2 sm:gap-1">
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => void adjustHp(selectedToken.id, -5)} title="Remover 5 HP" aria-label="Remover 5 HP">
                  <Minus className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => void adjustHp(selectedToken.id, +5)} title="Adicionar 5 HP" aria-label="Adicionar 5 HP">
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile bottom toolbar */}
        <div className="flex items-center justify-around border-t border-border/40 bg-surface-raised/95 px-1 py-1 sm:hidden">
          {toolButtons.slice(0, 4).map((tool) => (
            <ToolRailButton
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              active={currentTool === tool.id}
            >
              {tool.icon}
            </ToolRailButton>
          ))}
          <ToolRailButton
            onClick={() => setShowGrid((v) => !v)}
            active={showGrid}
          >
            <Grid3X3 className="h-4 w-4" />
          </ToolRailButton>
          <ToolRailButton
            onClick={() => fileInputRef.current?.click()}
            title="Importar battlemap"
            active={Boolean(battlemapUrl)}
          >
            {battlemapUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
          </ToolRailButton>
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
        aria-label={rightOpen ? "Recolher painel" : "Expandir painel"}
        title={rightOpen ? "Recolher painel" : "Expandir painel"}
      >
        {rightOpen ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>

      {/* Mobile panel overlay */}
      {mobilePanel && (
        <div className="absolute inset-0 z-[70] flex flex-col bg-surface-raised/98 backdrop-blur sm:hidden">
          <div className="flex items-center justify-between border-b border-border/40 px-3 py-2">
            <span className="font-heading text-xs uppercase tracking-[0.16em] text-primary/80">Painel</span>
            <button
              onClick={() => setMobilePanel(false)}
              className="tool-rail-button h-8 w-8"
              aria-label="Fechar painel"
              title="Fechar painel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-1 flex-col overflow-hidden px-4 py-4">
            <Tabs value={rightTab} onValueChange={handleRightTabChange} className="flex flex-1 flex-col">
              <TabsList className="grid h-auto w-full grid-cols-3 gap-px rounded-none border-b border-border/40 bg-border/30 p-1">
                {rightTabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    title={tab.label}
                    className="flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-none border border-transparent bg-transparent px-1 py-1.5 text-[10px] font-medium tracking-[0.12em] text-muted-foreground data-[state=active]:border-primary/40 data-[state=active]:bg-background/70 data-[state=active]:text-foreground"
                  >
                    {tab.icon}
                    <span className="uppercase">{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="space-y-4 px-1 pt-4">
                <div className="rounded-sm border border-amber-400/20 bg-[rgba(31,20,14,0.9)] p-4">
                  <div className="flex items-center gap-2">
                    <WitcherAssetIcon name="scrollFormulae" className="h-5 w-5 opacity-90" />
                    <p className="font-heading text-sm text-foreground">Viewport reduzido</p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-foreground/78">
                    Esta mesa usa uma shell inspirada no Foundry e fica realmente funcional a partir de 1024x768. Em telas menores, use as abas acima como atalho e volte ao desktop para editar cena, compêndio e combate com conforto.
                  </p>
                </div>

                <Button variant="outline" className="h-11 w-full text-sm" onClick={() => setMobilePanel(false)}>
                  Voltar ao palco
                </Button>
              </div>

      {/* Reuse same tab content — rendered below for desktop */}
            </Tabs>
          </div>
        </div>
      )}

      {/* Right panel — desktop */}
      {rightOpen && (
        <div className="hidden w-[min(26rem,calc(100vw-5rem))] flex-col border-l border-border/70 bg-surface-raised/95 backdrop-blur sm:flex xl:w-[26rem] 2xl:w-[28rem]">
          <Tabs value={rightTab} onValueChange={handleRightTabChange} className="flex flex-1 flex-row overflow-hidden">
            <TabsList className="order-2 flex h-full w-[4.75rem] shrink-0 flex-col gap-2 rounded-none border-l border-border/40 bg-[rgba(12,10,8,0.96)] p-2">
              {rightTabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  title={tab.label}
                  className="flex h-12 w-12 flex-col items-center justify-center gap-1 rounded-sm border border-border/45 bg-[rgba(16,12,10,0.82)] px-1 py-1 text-[9px] font-medium tracking-[0.12em] text-muted-foreground data-[state=active]:border-primary/45 data-[state=active]:bg-[rgba(201,161,90,0.14)] data-[state=active]:text-primary"
                >
                  {tab.icon}
                  <span className="uppercase leading-none">{tab.label}</span>
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
                            "tool-list-item px-3 py-3",
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
                      className="tool-list-item py-1.5 text-[11px] font-medium text-muted-foreground"
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <DiceInput
                  onRoll={async (notation) =>
                    await rollNotation(notation, selectedToken?.payload.name ?? "Mesa")
                  }
                />
              </div>

              {/* Chat input */}
              <div className="border-t border-border/40 p-4">
                <div className="mb-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Nova mensagem</div>
                <ChatInput
                  onSend={async (text) => await appendChatMessage("Narrador", text, "party")}
                />
              </div>
            </TabsContent>

            {/* Tokens tab */}
            <TabsContent value="tokens" className="mt-0 flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="space-y-4 px-4 py-4 pr-5">
                  {tokens.length === 0 ? (
                    <p className="tool-empty-state px-4 py-4 text-center text-sm text-muted-foreground">
                      Nenhum token na cena.
                    </p>
                  ) : (
                    tokens.map((token) => (
                      <button
                        key={token.id}
                        onClick={() => void mutateScene((c) => setSceneSelection(c, token.id), { broadcast: false, persist: false })}
                        className={cn(
                          "tool-list-item flex w-full items-center gap-3 px-3 py-3 text-left",
                          token.id === scene.selectedObjectId
                            ? "border-primary/40 bg-primary/5"
                            : "border-border/40",
                        )}
                      >
                        <div className={cn(
                          "flex h-8 w-8 items-center justify-center border text-[10px] font-bold",
                          token.payload.team === "party" ? "border-info/30 bg-info/12 text-info" : "border-destructive/30 bg-destructive/12 text-destructive",
                        )}>
                          {token.payload.shortName}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">{token.payload.name}</p>
                          <p className="text-xs leading-5 text-muted-foreground">
                            VIT {token.payload.hp}/{token.payload.hpMax} · DEF {token.payload.ac} · {token.payload.role}
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
                    <SidePanelCard
                      title="Ritmo de combate"
                      description="A mesa agora usa a leitura do sistema do Continente: pressao em d10, defesa visivel e consequencias rapidas."
                    >
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="metric-panel px-3 py-2">
                            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Dado</p>
                            <p className="mt-1 text-sm text-foreground">1d10</p>
                          </div>
                          <div className="metric-panel px-3 py-2">
                            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Defesa</p>
                            <p className="mt-1 text-sm text-foreground">REF + DES/2</p>
                          </div>
                          <div className="metric-panel px-3 py-2">
                            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Impacto</p>
                            <p className="mt-1 text-sm text-foreground">Localizado</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {WITCHER_QUICK_NOTES.map((note) => (
                            <p key={note} className="text-xs leading-6 text-foreground/78">
                              {note}
                            </p>
                          ))}
                        </div>
                      </div>
                    </SidePanelCard>
                    {scene.initiative.entries.length === 0 ? (
                      <p className="tool-empty-state px-4 py-4 text-center text-sm text-muted-foreground">
                        Nenhuma iniciativa rolada.
                      </p>
                    ) : (
                      scene.initiative.entries.map((entry) => (
                        <div
                          key={entry.tokenId}
                          className={cn(
                            "tool-list-item flex items-center gap-3 px-3 py-3",
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
                <div className="space-y-5 px-4 py-4 pr-5">
                  <WitcherCampaignBrief
                    campaign={activeCampaign}
                    activeScene={activeSceneSeed}
                    scenes={campaignScenes}
                    compact
                  />

                  <SidePanelCard
                    title="Sistema do Continente"
                    description="Referencia rapida do jogo importado para a mesa: profissoes, sinais, impacto e criticos."
                  >
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="metric-panel px-3 py-2">
                          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Racas</p>
                          <p className="mt-1 text-sm text-foreground">4</p>
                        </div>
                        <div className="metric-panel px-3 py-2">
                          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Profissoes</p>
                          <p className="mt-1 text-sm text-foreground">{CLASSES.length}</p>
                        </div>
                        <div className="metric-panel px-3 py-2">
                          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Sinais</p>
                          <p className="mt-1 text-sm text-foreground">{witcherSigns.length}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-primary/78">Profissoes em foco</p>
                        <div className="grid gap-2">
                          {witcherProfessions.map((profession) => (
                            <div key={profession.value} className="tool-list-item px-3 py-3">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-medium text-foreground">{profession.label}</p>
                                <Badge variant="outline" className="border-border/40 text-[10px]">
                                  Vigor {profession.vigor}
                                </Badge>
                              </div>
                              <p className="mt-1 text-xs leading-6 text-foreground/78">{profession.role}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-primary/78">Sinais de bruxo</p>
                        <div className="flex flex-wrap gap-2">
                          {witcherSigns.map((spell) => (
                            <Badge key={spell.id} variant="outline" className="border-primary/25 text-[10px] uppercase tracking-[0.14em]">
                              {spell.name} · vigor {spell.vigorCost}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="grid gap-3 lg:grid-cols-2">
                        <div className="tool-stage-frame space-y-2 px-3 py-3">
                          <p className="text-[11px] uppercase tracking-[0.2em] text-primary/78">Tabela de impacto</p>
                          {WITCHER_HIT_LOCATION_TABLE.slice(0, 6).map((location, index) => (
                            <div key={`${location.label}-${index}`} className="flex items-center justify-between gap-2 text-xs text-foreground/80">
                              <span>{location.label}</span>
                              <span>pen {location.attackPenalty} · x{location.damageMultiplier}</span>
                            </div>
                          ))}
                        </div>
                        <div className="tool-stage-frame space-y-2 px-3 py-3">
                          <p className="text-[11px] uppercase tracking-[0.2em] text-primary/78">Criticos simples</p>
                          {WITCHER_SIMPLE_CRITICAL_TABLE.slice(0, 4).map((critical) => (
                            <div key={critical.title} className="space-y-1 text-xs text-foreground/80">
                              <p className="font-medium text-foreground">
                                {critical.title} ({critical.range[0]}-{critical.range[1]})
                              </p>
                              <p className="leading-5">{critical.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </SidePanelCard>
                  {codexLoading && codexGroups.length === 0 ? (
                    <div className="info-panel p-4">
                      <p className="font-heading text-base text-foreground">Carregando codex...</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        As ameacas do arquivo entram sob demanda para aliviar o primeiro carregamento da mesa.
                      </p>
                    </div>
                  ) : null}

                  {!codexLoading && codexGroups.length === 0 ? (
                    <div className="info-panel p-4">
                      <p className="font-heading text-base text-foreground">Codex indisponivel</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        Nao foi possivel abrir o arquivo agora. Tente novamente em instantes.
                      </p>
                    </div>
                  ) : null}

                  {tabletopLore?.sessionSeeds.length ? (
                    <SidePanelCard
                      title="Sementes de sessao"
                      description="Dossie, manuscrito, atlas e battlemap conectados para iniciar a cena sem preparar tudo do zero."
                    >
                      <div className="space-y-3">
                        {tabletopLore.sessionSeeds.map((seed) => (
                          <div key={seed.slug} className="tool-list-item space-y-3 px-3 py-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <p className="text-sm font-medium text-foreground">{seed.title}</p>
                                <p className="text-xs uppercase tracking-[0.16em] text-primary/78">
                                  {seed.tags.join(" - ")}
                                </p>
                              </div>
                            </div>
                            <p className="text-xs leading-6 text-foreground/78">{seed.summary}</p>
                            <div className="flex flex-wrap gap-2">
                              <Button asChild size="sm" variant="ghost" className="h-7 text-[11px]">
                                <Link to={seed.dossierHref}>Dossie</Link>
                              </Button>
                              <Button asChild size="sm" variant="ghost" className="h-7 text-[11px]">
                                <Link to={seed.chronicleHref}>Manuscrito</Link>
                              </Button>
                              <Button asChild size="sm" variant="ghost" className="h-7 text-[11px]">
                                <Link to={seed.atlasHref}>Atlas</Link>
                              </Button>
                              {seed.battlemapHref ? (
                                <Button asChild size="sm" className="h-7 text-[11px]">
                                  <Link to={seed.battlemapHref}>Battlemap</Link>
                                </Button>
                              ) : null}
                              {seed.quickSpawnHref ? (
                                <Button asChild size="sm" className="h-7 text-[11px]">
                                  <Link to={seed.quickSpawnHref}>Ameaca</Link>
                                </Button>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    </SidePanelCard>
                  ) : null}

                  {tabletopLore?.dossiers.length ? (
                    <SidePanelCard
                      title="Dossies do arquivo"
                      description="Perfis e entidades que a sessao pode consultar sem perder o ritmo da cena."
                    >
                      <div className="space-y-3">
                        {tabletopLore.dossiers.map((dossier) => (
                          <div key={dossier.slug} className="tool-list-item space-y-2 px-3 py-3">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-sm font-medium text-foreground">{dossier.title}</p>
                                <p className="text-[11px] uppercase tracking-[0.16em] text-primary/78">
                                  {dossier.categoryLabel}
                                </p>
                              </div>
                            </div>
                            <p className="text-xs leading-6 text-foreground/78">{dossier.summary}</p>
                            <div className="flex flex-wrap gap-2">
                              <Button asChild size="sm" variant="ghost" className="h-7 text-[11px]">
                                <Link to={dossier.href}>Abrir</Link>
                              </Button>
                              {dossier.atlasHref ? (
                                <Button asChild size="sm" variant="ghost" className="h-7 text-[11px]">
                                  <Link to={dossier.atlasHref}>Cruzar atlas</Link>
                                </Button>
                              ) : null}
                              {dossier.quickSpawnHref ? (
                                <Button asChild size="sm" className="h-7 text-[11px]">
                                  <Link to={dossier.quickSpawnHref}>Trazer para mesa</Link>
                                </Button>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    </SidePanelCard>
                  ) : null}

                  {tabletopLore?.chronicles.length ? (
                    <SidePanelCard
                      title="Manuscritos em foco"
                      description="Capitulos canônicos para reler pressagios, passagens e revelacoes em meio a sessao."
                    >
                      <div className="space-y-3">
                        {tabletopLore.chronicles.map((chronicle) => (
                          <div key={chronicle.slug} className="tool-list-item space-y-2 px-3 py-3">
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-foreground">{chronicle.title}</p>
                              <p className="text-[11px] uppercase tracking-[0.16em] text-primary/78">
                                {chronicle.chapterLabel} - {chronicle.location}
                              </p>
                            </div>
                            <p className="text-xs leading-6 text-foreground/78">{chronicle.excerpt}</p>
                            <div className="flex flex-wrap gap-2">
                              <Button asChild size="sm" variant="ghost" className="h-7 text-[11px]">
                                <Link to={chronicle.href}>Ler manuscrito</Link>
                              </Button>
                              {chronicle.mentionLinks.slice(0, 2).map((mention) => (
                                <Button
                                  key={`${chronicle.slug}-${mention.href}`}
                                  asChild
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 text-[11px]"
                                >
                                  <Link to={mention.href}>{mention.label}</Link>
                                </Button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </SidePanelCard>
                  ) : null}

                  {tabletopLore?.atlasReferences.length ? (
                    <SidePanelCard
                      title="Rotas do atlas"
                      description="Abra regioes e locais diretamente do codex ou carregue um battlemap ligado ao mundo."
                    >
                      <div className="space-y-3">
                        {tabletopLore.atlasReferences.map((reference) => (
                          <div key={reference.title} className="tool-list-item space-y-2 px-3 py-3">
                            <p className="text-sm font-medium text-foreground">{reference.title}</p>
                            <p className="text-xs leading-6 text-foreground/78">{reference.description}</p>
                            <div className="flex flex-wrap gap-1">
                              {reference.metrics.map((metric) => (
                                <Badge
                                  key={`${reference.title}-${metric}`}
                                  variant="outline"
                                  className="border-border/40 text-[10px] uppercase tracking-[0.14em]"
                                >
                                  {metric}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Button asChild size="sm" variant="ghost" className="h-7 text-[11px]">
                                <Link to={reference.href}>Abrir atlas</Link>
                              </Button>
                              {reference.battlemapHref ? (
                                <Button asChild size="sm" className="h-7 text-[11px]">
                                  <Link to={reference.battlemapHref}>Carregar battlemap</Link>
                                </Button>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    </SidePanelCard>
                  ) : null}

                  {codexGroups.map((group) => (
                    <div key={group.category} className="space-y-3">
                      <div className="flex items-center justify-between gap-3 border-b border-border/40 pb-2">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.2em] text-primary/80">
                            Categoria
                          </p>
                          <h3 className="font-heading text-base text-foreground">{group.label}</h3>
                        </div>
                        <Badge variant="outline" className="border-primary/30 text-primary">
                          {group.entries.length}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        {group.entries.map((entry) => (
                          <div
                            key={entry.slug}
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData("application/x-dark-lore-entry", entry.slug);
                              e.dataTransfer.effectAllowed = "copy";
                            }}
                            className="tool-list-item cursor-grab p-3"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <p className="truncate text-sm font-medium text-foreground">
                                {entry.title}
                              </p>
                              <Badge variant="outline" className="border-border/40 text-[10px]">
                                VIT {entry.vtt.hp} · DEF {entry.vtt.ac}
                              </Badge>
                            </div>
                            <p className="mt-1 text-xs leading-5 text-muted-foreground line-clamp-2">
                              {entry.summary}
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                              <Badge variant="secondary" className="text-[10px]">
                                {entry.vtt.role}
                              </Badge>
                              <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                                Arraste para o palco ou traga direto para a area ativa
                              </span>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="mt-2 h-7 w-full text-[11px]"
                              onClick={() => {
                                void spawnLoreEntry(entry.slug);
                              }}
                            >
                              Trazer para a mesa
                            </Button>
                          </div>
                        ))}
                      </div>
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
                    <SidePanelCard
                      title="Elenco de ameacas"
                      description="Monte um inimigo ou aliado no padrao do Witcher TRPG e solte-o direto na area ativa."
                    >
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {WITCHER_NPC_PRESETS.map((preset) => (
                            <Button
                              key={preset.label}
                              size="sm"
                              variant="outline"
                              className="h-8 text-[11px]"
                              onClick={() => setNpcDraft((current) => ({
                                ...createNpcDraft(preset),
                                name: current.name,
                              }))}
                            >
                              {preset.label}
                            </Button>
                          ))}
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="metric-panel px-3 py-2">
                            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">VIT</p>
                            <p className="mt-1 text-sm text-foreground">{npcDraft.hp}</p>
                          </div>
                          <div className="metric-panel px-3 py-2">
                            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">DEF</p>
                            <p className="mt-1 text-sm text-foreground">{npcDraft.ac}</p>
                          </div>
                          <div className="metric-panel px-3 py-2">
                            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">INI</p>
                            <p className="mt-1 text-sm text-foreground">{npcDraft.initiativeBonus}</p>
                          </div>
                        </div>
                      </div>
                    </SidePanelCard>
                    <Input
                      value={npcDraft.name}
                      onChange={(e) => setNpcDraft((c) => ({ ...c, name: e.target.value }))}
                      placeholder="Nome da ameaca ou aliado"
                      className="h-10 text-sm"
                    />
                    <label className="space-y-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                      <span>Perfil</span>
                      <Select
                        value={npcDraft.role}
                        onValueChange={(value) => setNpcDraft((current) => ({ ...current, role: value }))}
                      >
                        <SelectTrigger className="h-10 text-sm">
                          <SelectValue placeholder="Escolha um perfil" />
                        </SelectTrigger>
                        <SelectContent>
                          {CLASSES.map((profession) => (
                            <SelectItem key={profession.value} value={profession.label}>
                              {profession.label}
                            </SelectItem>
                          ))}
                          <SelectItem value="Monstro">Monstro</SelectItem>
                          <SelectItem value="Maldicao">Maldicao</SelectItem>
                          <SelectItem value="Aparicao">Aparicao</SelectItem>
                        </SelectContent>
                      </Select>
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      <Input
                        type="number"
                        value={npcDraft.hp}
                        onChange={(e) => setNpcDraft((c) => ({ ...c, hp: Number(e.target.value) }))}
                        placeholder="VIT"
                        className="h-8 text-xs"
                      />
                      <Input
                        type="number"
                        value={npcDraft.ac}
                        onChange={(e) => setNpcDraft((c) => ({ ...c, ac: Number(e.target.value) }))}
                        placeholder="DEF"
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
                      placeholder="Equipamento, fraquezas, sinais, comportamento ou gatilhos da cena"
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
                    title="Quadro da area"
                    description="Battlemap, grade e passagens da area ativa ficam reunidos nesta aba."
                  >
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="metric-panel px-3 py-2">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Area</p>
                        <p className="mt-1 text-sm text-foreground">{activePage?.name ?? "Sem pagina"}</p>
                      </div>
                      <div className="metric-panel px-3 py-2">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Grade</p>
                        <p className="mt-1 text-sm text-foreground">
                          {activePage ? `${activePage.width}x${activePage.height}` : "--"}
                        </p>
                      </div>
                      <div className="metric-panel px-3 py-2">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Grid</p>
                        <p className="mt-1 text-sm text-foreground">{activePage?.gridSize ?? 72}px</p>
                      </div>
                    </div>
                  </SidePanelCard>
                  <div className="info-panel p-4">
                    <p className="font-heading text-base text-foreground">Battlemap da pagina</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Importe a planta da area e alinhe a grade sobre o terreno antes de abrir a cena.
                    </p>
                    <Button
                      size="sm"
                      className="mt-3 h-10 w-full text-sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={battlemapUploading || !activePage}
                    >
                      {battlemapUploading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <ImagePlus className="h-3.5 w-3.5" />
                      )}
                      {battlemapUploading ? "Importando..." : battlemapUrl ? "Trocar battlemap" : "Importar battlemap"}
                    </Button>
                    {battlemapUrl && (
                      <div className="tool-stage-frame mt-3 overflow-hidden bg-background/60">
                        <img
                          src={battlemapUrl}
                          alt="Preview do battlemap"
                          className="h-36 w-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  <div className="info-panel p-4">
                    <p className="font-heading text-base text-foreground">Grade da mesa</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Ajuste colunas, linhas e o tamanho de cada casa para encaixar o terreno da area.
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
                      <Slider
                        min={5}
                        max={80}
                        step={5}
                        value={[Math.round(gridOpacity * 100)]}
                        onValueChange={(value) => setGridOpacity((value[0] ?? 30) / 100)}
                        className="w-full"
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

                  <div className="info-panel p-4">
                    <p className="font-heading text-base text-foreground">Expansao do grid</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Abra espaco nas bordas quando a luta escapar do quadro inicial.
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

                  <div className="info-panel p-4">
                    <p className="font-heading text-base text-foreground">Areas conectadas</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Costure novas areas a partir das bordas para manter viagens longas sob o mesmo palco.
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

                    <div className="field-note mt-4 p-3">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                        Ligacao da area atual
                      </p>
                      <div className="mt-3 space-y-2">
                        <label className="space-y-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                          <span>Destino</span>
                          <Select value={connectionTargetId} onValueChange={setConnectionTargetId}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma area" />
                            </SelectTrigger>
                            <SelectContent>
                              {scene.pages
                                .filter((page) => page.id !== activePage?.id)
                                .map((page) => (
                                  <SelectItem key={page.id} value={page.id}>
                                    {page.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </label>

                        <div className="grid grid-cols-2 gap-2">
                          <label className="space-y-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                            <span>Borda</span>
                            <Select value={connectionEdge} onValueChange={(value) => setConnectionEdge(value as PageConnectionEdge)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="north">Norte</SelectItem>
                                <SelectItem value="east">Leste</SelectItem>
                                <SelectItem value="south">Sul</SelectItem>
                                <SelectItem value="west">Oeste</SelectItem>
                              </SelectContent>
                            </Select>
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
                              "tool-list-item px-3 py-3",
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

                  <div className="info-panel p-4">
                    <p className="font-heading text-base text-foreground">Passagens da area ativa</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Use essas passagens para levar o grupo de uma area a outra sem reconstruir a cena.
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
                              className="tool-list-item p-3"
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

                  <div className="info-panel p-4">
                    <p className="font-heading text-base text-foreground">Ritual da cartografia</p>
                    <div className="mt-2 space-y-2 text-sm leading-6 text-muted-foreground">
                      <p>1. Traga a planta da area para o palco.</p>
                      <p>2. Ajuste a grade ate o terreno responder com precisao.</p>
                      <p>3. Abra novas bordas quando a cena pedir mais espaco.</p>
                      <p>4. Conecte as passagens para seguir viagem sem quebrar o ritmo.</p>
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
