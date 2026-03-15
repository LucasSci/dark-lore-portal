import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Castle,
  Crosshair,
  ChevronLeft,
  ChevronRight,
  Dice6,
  Eye,
  EyeOff,
  Ghost,
  Grid3X3,
  ImagePlus,
  Layers,
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
} from "lucide-react";

import VttPixiStage from "@/components/rpg/VttPixiStage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  getVttReadyEntries,
  type EncyclopediaEntry,
} from "@/lib/encyclopedia";
import { parseDiceNotation, rollDice } from "@/lib/rpg-utils";
import {
  persistChatMessage,
  persistInitiativeSnapshot,
  persistSceneSnapshot,
  useVttRealtime,
} from "@/lib/vtt-realtime";
import {
  addSceneNpc,
  adjustSceneTokenHp,
  appendSceneChat,
  clearSceneInitiative,
  countRevealedCells,
  createSceneModel,
  getActivePage,
  getPositionLabel,
  recordSceneRoll,
  getSceneTokens,
  getSelectedToken,
  revealEntireSceneFog,
  revealSceneFogAround,
  restoreSceneFog,
  setBoardMode,
  setSceneCamera,
  setSceneCameraScale,
  setScenePresence,
  setSceneSelection,
  startSceneInitiative,
  toggleSceneFogCell,
  advanceSceneInitiative,
  moveSceneToken,
  type BoardMode,
  type ChatTone,
  type SceneModel,
} from "@/lib/virtual-tabletop";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const loreThreats = getVttReadyEntries();

type LeftTool = "select" | "move" | "fog" | "measure";
type RightTab = "chat" | "tokens" | "initiative" | "codex" | "npc";

export default function MesaPage() {
  const [scene, setScene] = useState<SceneModel>(() => createSceneModel());
  const [chatDraft, setChatDraft] = useState("");
  const [diceDraft, setDiceDraft] = useState("1d20");
  const [showGrid, setShowGrid] = useState(true);
  const [gridOpacity, setGridOpacity] = useState(0.3);
  const [battlemapUrl, setBattlemapUrl] = useState<string | null>(null);
  const [rightOpen, setRightOpen] = useState(true);
  const [rightTab, setRightTab] = useState<RightTab>("chat");
  const [npcDraft, setNpcDraft] = useState({
    name: "",
    hp: 18,
    ac: 13,
    initiativeBonus: 1,
    notes: "",
  });
  const sceneRef = useRef(scene);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    sceneRef.current = scene;
  }, [scene]);

  const { presence, broadcastScene } = useVttRealtime({
    sessionId: scene.sessionId,
    displayName: "Narrador",
    role: "gm",
    onRemoteScene: (remoteScene) => {
      if (remoteScene.revision <= sceneRef.current.revision) return;
      sceneRef.current = remoteScene;
      setScene(setScenePresence(remoteScene, presence));
    },
  });

  useEffect(() => {
    setScene((current) => setScenePresence(current, presence));
  }, [presence]);

  const commitScene = useCallback(
    async (nextScene: SceneModel, options: { broadcast?: boolean; persist?: boolean } = {}) => {
      sceneRef.current = nextScene;
      setScene(nextScene);
      if (options.broadcast !== false) await broadcastScene(nextScene);
      if (options.persist !== false) await persistSceneSnapshot(nextScene);
    },
    [broadcastScene],
  );

  const mutateScene = useCallback(
    async (updater: (current: SceneModel) => SceneModel, options?: { broadcast?: boolean; persist?: boolean }) => {
      const nextScene = updater(sceneRef.current);
      await commitScene(nextScene, options);
      return nextScene;
    },
    [commitScene],
  );

  const activePage = getActivePage(scene);
  const tokens = getSceneTokens(scene);
  const selectedToken = getSelectedToken(scene);
  const activeTurn = scene.initiative.entries.find((e) => e.tokenId === scene.initiative.activeTurnId);

  const appendChatMessage = async (author: string, text: string, tone: ChatTone) => {
    const nextScene = await mutateScene((current) => appendSceneChat(current, author, text, tone));
    const latestMessage = nextScene.chatMessages.at(-1);
    const nextPage = getActivePage(nextScene);
    if (latestMessage && nextPage) await persistChatMessage(nextScene.sessionId, nextPage.id, latestMessage);
  };

  const handleCellClick = async (cell: { id: string; x: number; y: number }) => {
    if (scene.boardMode === "fog") {
      await mutateScene((current) => toggleSceneFogCell(current, cell.id));
      return;
    }
    if (!selectedToken) return;
    if (selectedToken.position.x === cell.x && selectedToken.position.y === cell.y) return;
    await mutateScene((current) => moveSceneToken(current, selectedToken.id, cell.x, cell.y));
  };

  const handleMoveToken = async (tokenId: string, x: number, y: number) => {
    await mutateScene((current) => moveSceneToken(current, tokenId, x, y));
  };

  const handleCameraChange = async (camera: SceneModel["pages"][number]["camera"]) => {
    await mutateScene((current) => setSceneCamera(current, camera), { broadcast: false, persist: false });
  };

  const handleDropLoreEntry = async (entrySlug: string, cell: { id: string; x: number; y: number }) => {
    const entry = loreThreats.find((c) => c.slug === entrySlug);
    if (!entry) return;
    const nextScene = await mutateScene((current) =>
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
    );
    const spawned = nextScene.objects.find((o) => o.id === nextScene.selectedObjectId && o.objectType === "token");
    if (spawned?.objectType === "token") {
      await appendChatMessage("Codex", `${entry.title} em ${getPositionLabel(spawned.position.x, spawned.position.y)}.`, "npc");
    }
  };

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
    const nextScene = await mutateScene((current) => recordSceneRoll(current, actor, norm, results, finalTotal));
    const msg = nextScene.chatMessages.at(-1);
    const page = getActivePage(nextScene);
    if (msg && page) await persistChatMessage(nextScene.sessionId, page.id, msg);
    setDiceDraft(norm);
  };

  const adjustHp = async (tokenId: string, delta: number) => {
    const current = tokens.find((t) => t.id === tokenId);
    const nextScene = await mutateScene((c) => adjustSceneTokenHp(c, tokenId, delta));
    const next = nextScene.objects.find((e) => e.id === tokenId && e.objectType === "token");
    if (current && next?.objectType === "token" && current.payload.hp > 0 && next.payload.hp === 0) {
      await appendChatMessage("Sistema", `${next.payload.name} caiu em combate.`, "system");
    }
  };

  const startInitiative = async () => {
    const nextScene = await mutateScene((c) => startSceneInitiative(c));
    const page = getActivePage(nextScene);
    if (!nextScene.initiative.entries.length) {
      await appendChatMessage("Sistema", "Sem combatentes para iniciativa.", "system");
      return;
    }
    if (page) await persistInitiativeSnapshot(nextScene.sessionId, page.id, nextScene.initiative, nextScene.revision);
    await appendChatMessage("Sistema", `Iniciativa: ${nextScene.initiative.entries.map((e) => `${e.name} ${e.total}`).join(" | ")}`, "system");
  };

  const advanceTurn = async () => {
    const prevRound = scene.initiative.round;
    const nextScene = await mutateScene((c) => advanceSceneInitiative(c));
    const page = getActivePage(nextScene);
    if (page) await persistInitiativeSnapshot(nextScene.sessionId, page.id, nextScene.initiative, nextScene.revision);
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
    const nextScene = await mutateScene((c) => addSceneNpc(c, npcDraft));
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
    };
    void mutateScene((c) => setBoardMode(c, modeMap[tool]));
  };

  const currentTool: LeftTool =
    scene.boardMode === "fog" ? "fog" : scene.boardMode === "measure" ? "measure" : "move";

  const toolButtons: { id: LeftTool; icon: React.ReactNode; label: string }[] = [
    { id: "select", icon: <MousePointer className="h-4 w-4" />, label: "Selecionar" },
    { id: "move", icon: <Crosshair className="h-4 w-4" />, label: "Mover" },
    { id: "fog", icon: <EyeOff className="h-4 w-4" />, label: "Fog de Guerra" },
    { id: "measure", icon: <Ruler className="h-4 w-4" />, label: "Medir" },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex bg-background-strong">
      {/* Left toolbar */}
      <div className="flex w-12 flex-col items-center border-r border-border/70 bg-surface-raised py-2">
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

        {/* Grid toggle */}
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

        {/* Battlemap upload */}
        <button
          onClick={() => fileInputRef.current?.click()}
          title="Upload Battlemap"
          className="mb-1 flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ImagePlus className="h-4 w-4" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setBattlemapUrl(URL.createObjectURL(file));
          }}
        />

        <div className="flex-1" />

        {/* Bottom toolbar items */}
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
        <div className="flex h-10 items-center justify-between border-b border-border/40 bg-surface-raised/80 px-3">
          <div className="flex items-center gap-3">
            <span className="font-heading text-xs uppercase tracking-[0.2em] text-primary/80">
              {activePage?.name ?? "Pagina"}
            </span>
            <Badge variant="outline" className="border-border/40 text-[10px]">
              Rev {scene.revision}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-border/40 text-[10px]">
              <Users className="mr-1 h-3 w-3" />
              {scene.presence.length || 1}
            </Badge>
            {activeTurn && (
              <Badge variant="info" className="text-[10px]">
                <Sword className="mr-1 h-3 w-3" />
                {activeTurn.name} — R{scene.initiative.round}
              </Badge>
            )}
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
              onCameraChange={(camera) => void handleCameraChange(camera)}
              onDropEntry={(slug, cell) => void handleDropLoreEntry(slug, cell)}
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
          <div className="flex items-center gap-3 border-t border-border/40 bg-surface-raised/90 px-4 py-2">
            <div className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
              selectedToken.payload.team === "party" ? "bg-info/20 text-info" : "bg-destructive/20 text-destructive",
            )}>
              {selectedToken.payload.shortName}
            </div>
            <div className="min-w-0">
              <p className="truncate font-heading text-sm text-foreground">{selectedToken.payload.name}</p>
              <p className="text-[10px] text-muted-foreground">
                {selectedToken.payload.role} · {getPositionLabel(selectedToken.position.x, selectedToken.position.y)}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-muted-foreground">HP</span>
              <span className="font-heading text-sm text-foreground">
                {selectedToken.payload.hp}/{selectedToken.payload.hpMax}
              </span>
              <span className="text-xs text-muted-foreground">CA</span>
              <span className="font-heading text-sm text-foreground">{selectedToken.payload.ac}</span>
              <div className="ml-2 flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => void adjustHp(selectedToken.id, -5)}>
                  <Minus className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => void adjustHp(selectedToken.id, +5)}>
                  <Plus className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => {
                  if (selectedToken) {
                    void mutateScene((c) => revealSceneFogAround(c, selectedToken.position.x, selectedToken.position.y, 1));
                  }
                }}>
                  <Eye className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right panel toggle */}
      <button
        onClick={() => setRightOpen((v) => !v)}
        className="flex w-5 items-center justify-center border-l border-border/40 bg-surface-raised text-muted-foreground transition-colors hover:text-foreground"
      >
        {rightOpen ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>

      {/* Right panel */}
      {rightOpen && (
        <div className="flex w-80 flex-col border-l border-border/70 bg-surface-raised">
          <Tabs value={rightTab} onValueChange={(v) => setRightTab(v as RightTab)} className="flex flex-1 flex-col">
            <TabsList className="grid h-auto w-full grid-cols-5 gap-0 rounded-none border-b border-border/40 bg-transparent p-0">
              {[
                { id: "chat" as const, icon: <MessageSquare className="h-3.5 w-3.5" />, label: "Chat" },
                { id: "tokens" as const, icon: <Ghost className="h-3.5 w-3.5" />, label: "Tokens" },
                { id: "initiative" as const, icon: <Sword className="h-3.5 w-3.5" />, label: "Iniciativa" },
                { id: "codex" as const, icon: <Sparkles className="h-3.5 w-3.5" />, label: "Codex" },
                { id: "npc" as const, icon: <Shield className="h-3.5 w-3.5" />, label: "NPC" },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  title={tab.label}
                  className="rounded-none border-b-2 border-transparent py-2.5 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  {tab.icon}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Chat tab */}
            <TabsContent value="chat" className="mt-0 flex flex-1 flex-col overflow-hidden">
              <ScrollArea className="flex-1 px-3 py-2">
                <div className="space-y-2">
                  {scene.chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "rounded-lg border px-3 py-2",
                        msg.tone === "system" && "border-primary/20 bg-primary/5",
                        msg.tone === "party" && "border-emerald-500/20 bg-emerald-500/5",
                        msg.tone === "npc" && "border-amber-400/20 bg-amber-400/5",
                        msg.tone === "roll" && "border-sky-500/20 bg-sky-500/5",
                      )}
                    >
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span className="font-heading text-[10px] uppercase tracking-[0.18em] text-foreground">{msg.author}</span>
                        <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                      </div>
                      <p className="text-xs leading-5 text-foreground/90">{msg.text}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Dice shortcuts */}
              <div className="border-t border-border/40 px-3 py-2">
                <div className="mb-2 grid grid-cols-6 gap-1">
                  {["1d4", "1d6", "1d8", "1d10", "1d12", "1d20"].map((n) => (
                    <button
                      key={n}
                      onClick={() => void rollNotation(n, selectedToken?.payload.name ?? "Mesa")}
                      className="rounded bg-secondary/60 py-1 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1.5 mb-2">
                  <Input
                    value={diceDraft}
                    onChange={(e) => setDiceDraft(e.target.value)}
                    placeholder="2d6+3"
                    className="h-8 bg-background/60 text-xs"
                    onKeyDown={(e) => e.key === "Enter" && void rollNotation(diceDraft, selectedToken?.payload.name ?? "Mesa")}
                  />
                  <Button size="sm" className="h-8 px-3" onClick={() => void rollNotation(diceDraft, selectedToken?.payload.name ?? "Mesa")}>
                    <Dice6 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Chat input */}
              <div className="border-t border-border/40 p-3">
                <div className="flex gap-1.5">
                  <Input
                    value={chatDraft}
                    onChange={(e) => setChatDraft(e.target.value)}
                    placeholder="Enviar mensagem..."
                    className="h-8 bg-background/60 text-xs"
                    onKeyDown={(e) => e.key === "Enter" && void sendChat()}
                  />
                  <Button size="sm" className="h-8 px-3" onClick={() => void sendChat()}>
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Tokens tab */}
            <TabsContent value="tokens" className="mt-0 flex-1 overflow-hidden">
              <ScrollArea className="h-full px-3 py-2">
                <div className="space-y-2">
                  {tokens.length === 0 ? (
                    <p className="py-4 text-center text-xs text-muted-foreground">Nenhum token na cena.</p>
                  ) : (
                    tokens.map((token) => (
                      <button
                        key={token.id}
                        onClick={() => void mutateScene((c) => setSceneSelection(c, token.id), { broadcast: false, persist: false })}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors",
                          token.id === scene.selectedObjectId
                            ? "border-primary/40 bg-primary/5"
                            : "border-border/40 hover:border-border/70",
                        )}
                      >
                        <div className={cn(
                          "flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold",
                          token.payload.team === "party" ? "bg-info/20 text-info" : "bg-destructive/20 text-destructive",
                        )}>
                          {token.payload.shortName}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium text-foreground">{token.payload.name}</p>
                          <p className="text-[10px] text-muted-foreground">
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
                <div className="flex gap-1.5 border-b border-border/40 p-3">
                  <Button size="sm" className="h-8 flex-1 text-xs" onClick={() => void startInitiative()}>
                    Iniciar
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 flex-1 text-xs" onClick={() => void advanceTurn()}>
                    Próximo
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => void mutateScene((c) => clearSceneInitiative(c))}>
                    Limpar
                  </Button>
                </div>
                <ScrollArea className="flex-1 px-3 py-2">
                  <div className="space-y-1.5">
                    {scene.initiative.entries.length === 0 ? (
                      <p className="py-4 text-center text-xs text-muted-foreground">Nenhuma iniciativa rolada.</p>
                    ) : (
                      scene.initiative.entries.map((entry) => (
                        <div
                          key={entry.tokenId}
                          className={cn(
                            "flex items-center gap-2 rounded-lg border px-3 py-2",
                            entry.tokenId === scene.initiative.activeTurnId
                              ? "border-primary/40 bg-primary/10"
                              : "border-border/40",
                          )}
                        >
                          <span className="font-heading text-sm text-primary">{entry.total}</span>
                          <span className="flex-1 truncate text-xs text-foreground">{entry.name}</span>
                          <Badge variant={entry.team === "party" ? "secondary" : "outline"} className="text-[10px]">
                            {entry.team}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
                {activeTurn && (
                  <div className="border-t border-border/40 p-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Turno ativo</p>
                    <p className="font-heading text-sm text-foreground">{activeTurn.name}</p>
                    <p className="text-[10px] text-muted-foreground">Rodada {scene.initiative.round}</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Codex tab */}
            <TabsContent value="codex" className="mt-0 flex-1 overflow-hidden">
              <ScrollArea className="h-full px-3 py-2">
                <div className="space-y-2">
                  {loreThreats.map((entry) => (
                    <div
                      key={entry.slug}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("application/x-dark-lore-entry", entry.slug);
                        e.dataTransfer.effectAllowed = "copy";
                      }}
                      className="rounded-lg border border-border/40 p-3 transition-colors hover:border-primary/30 cursor-grab"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-xs font-medium text-foreground">{entry.title}</p>
                        <Badge variant="outline" className="border-border/40 text-[10px]">
                          HP {entry.vtt.hp}
                        </Badge>
                      </div>
                      <p className="mt-1 text-[10px] text-muted-foreground line-clamp-2">{entry.summary}</p>
                      <Button size="sm" variant="ghost" className="mt-1.5 h-6 w-full text-[10px]" onClick={() => {
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
                <ScrollArea className="flex-1 px-3 py-2">
                  <div className="space-y-3">
                    <Input
                      value={npcDraft.name}
                      onChange={(e) => setNpcDraft((c) => ({ ...c, name: e.target.value }))}
                      placeholder="Nome do NPC"
                      className="h-8 text-xs"
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
                      className="min-h-[80px] text-xs"
                    />
                    <Button className="w-full h-8 text-xs" onClick={() => void createNpc()}>
                      <Plus className="mr-1.5 h-3.5 w-3.5" />
                      Adicionar NPC
                    </Button>
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
