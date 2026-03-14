import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Castle,
  Crown,
  Crosshair,
  Dice6,
  EyeOff,
  Ghost,
  Map,
  MessageSquare,
  Minus,
  Plus,
  RefreshCcw,
  ScrollText,
  Send,
  Shield,
  Skull,
  Sparkles,
  Sword,
  Users,
} from "lucide-react";

import VttPixiStage from "@/components/rpg/VttPixiStage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
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

type MobilePanel = "mapa" | "mesa" | "chat";
const loreThreats = getVttReadyEntries();

export default function VirtualTabletop() {
  const [scene, setScene] = useState<SceneModel>(() => createSceneModel());
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>("mapa");
  const [chatDraft, setChatDraft] = useState("");
  const [diceDraft, setDiceDraft] = useState("1d20+4");
  const [showGrid, setShowGrid] = useState(true);
  const [gridOpacity, setGridOpacity] = useState(0.3);
  const [battlemapUrl, setBattlemapUrl] = useState<string | null>(null);
  const [npcDraft, setNpcDraft] = useState({
    name: "",
    hp: 18,
    ac: 13,
    initiativeBonus: 1,
    notes: "",
  });
  const sceneRef = useRef(scene);

  useEffect(() => {
    sceneRef.current = scene;
  }, [scene]);

  const { presence, broadcastScene } = useVttRealtime({
    sessionId: scene.sessionId,
    displayName: "Narrador",
    role: "gm",
    onRemoteScene: (remoteScene) => {
      if (remoteScene.revision <= sceneRef.current.revision) {
        return;
      }

      sceneRef.current = remoteScene;
      setScene(setScenePresence(remoteScene, presence));
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
      } = {},
    ) => {
      const shouldBroadcast = options.broadcast !== false;
      const shouldPersist = options.persist !== false;

      sceneRef.current = nextScene;
      setScene(nextScene);

      if (shouldBroadcast) {
        await broadcastScene(nextScene);
      }

      if (shouldPersist) {
        await persistSceneSnapshot(nextScene);
      }
    },
    [broadcastScene],
  );

  const mutateScene = useCallback(
    async (
      updater: (current: SceneModel) => SceneModel,
      options?: {
        broadcast?: boolean;
        persist?: boolean;
      },
    ) => {
      const nextScene = updater(sceneRef.current);
      await commitScene(nextScene, options);
      return nextScene;
    },
    [commitScene],
  );

  const activePage = getActivePage(scene);
  const tokens = getSceneTokens(scene);
  const selectedToken = getSelectedToken(scene);
  const activeTurn = scene.initiative.entries.find(
    (entry) => entry.tokenId === scene.initiative.activeTurnId,
  );
  const revealedCells = activePage ? countRevealedCells(activePage.fog) : 0;
  const partyCount = tokens.filter((token) => token.payload.team === "party").length;
  const npcCount = tokens.filter((token) => token.payload.team === "npc").length;

  const appendChatMessage = async (author: string, text: string, tone: ChatTone) => {
    const nextScene = await mutateScene((current) => appendSceneChat(current, author, text, tone));
    const latestMessage = nextScene.chatMessages.at(-1);
    const nextPage = getActivePage(nextScene);

    if (latestMessage && nextPage) {
      await persistChatMessage(nextScene.sessionId, nextPage.id, latestMessage);
    }
  };

  const handleCellClick = async (cell: { id: string; x: number; y: number }) => {
    if (scene.boardMode === "fog") {
      await mutateScene((current) => toggleSceneFogCell(current, cell.id));
      return;
    }

    if (!selectedToken) {
      return;
    }

    if (
      selectedToken.position.x === cell.x &&
      selectedToken.position.y === cell.y
    ) {
      return;
    }

    await mutateScene((current) => moveSceneToken(current, selectedToken.id, cell.x, cell.y));
  };

  const handleMoveToken = async (tokenId: string, x: number, y: number) => {
    await mutateScene((current) => moveSceneToken(current, tokenId, x, y));
  };

  const handleCameraChange = async (camera: SceneModel["pages"][number]["camera"]) => {
    await mutateScene((current) => setSceneCamera(current, camera), {
      broadcast: false,
      persist: false,
    });
  };

  const spawnLoreEntry = async (
    entry: EncyclopediaEntry & { vtt: NonNullable<EncyclopediaEntry["vtt"]> },
    position?: { x: number; y: number },
  ) => {
    const nextScene = await mutateScene((current) =>
      addSceneNpc(current, {
        name: entry.title,
        hp: entry.vtt.hp,
        ac: entry.vtt.ac,
        initiativeBonus: entry.vtt.initiativeBonus,
        notes: entry.vtt.note || entry.summary,
        role: entry.vtt.role,
        color: entry.vtt.color,
        position,
      }),
    );
    const spawnedToken = nextScene.objects.find(
      (object) => object.id === nextScene.selectedObjectId && object.objectType === "token",
    );

    if (spawnedToken?.objectType === "token") {
      await appendChatMessage(
        "Codex",
        `${entry.title} materializado em ${getPositionLabel(
          spawnedToken.position.x,
          spawnedToken.position.y,
        )}.`,
        "npc",
      );
    }
  };

  const handleDropLoreEntry = async (
    entrySlug: string,
    cell: { id: string; x: number; y: number },
  ) => {
    const entry = loreThreats.find((candidate) => candidate.slug === entrySlug);

    if (!entry) {
      return;
    }

    await spawnLoreEntry(entry, { x: cell.x, y: cell.y });
  };

  const sendChat = async () => {
    if (!chatDraft.trim()) {
      return;
    }

    await appendChatMessage("Narrador", chatDraft.trim(), "party");
    setChatDraft("");
  };

  const rollNotation = async (notation: string, actor: string) => {
    const parsed = parseDiceNotation(notation.trim().toLowerCase());
    const { results, total } = rollDice(parsed.sides, parsed.count);
    const finalTotal = total + parsed.modifier;
    const normalizedNotation = `${parsed.count}d${parsed.sides}${parsed.modifier === 0 ? "" : parsed.modifier > 0 ? `+${parsed.modifier}` : parsed.modifier}`;

    const nextScene = await mutateScene((current) =>
      recordSceneRoll(current, actor, normalizedNotation, results, finalTotal),
    );
    const latestMessage = nextScene.chatMessages.at(-1);
    const nextPage = getActivePage(nextScene);

    if (latestMessage && nextPage) {
      await persistChatMessage(nextScene.sessionId, nextPage.id, latestMessage);
    }

    setDiceDraft(normalizedNotation);
  };

  const revealAroundSelected = async () => {
    if (!selectedToken) {
      return;
    }

    await mutateScene((current) =>
      revealSceneFogAround(
        current,
        selectedToken.position.x,
        selectedToken.position.y,
        1,
      ),
    );
    await appendChatMessage(
      "Sistema",
      `Neblina dissipada ao redor de ${selectedToken.payload.name}.`,
      "system",
    );
  };

  const revealEverything = async () => {
    await mutateScene((current) => revealEntireSceneFog(current));
    await appendChatMessage("Sistema", "Toda a neblina de guerra foi removida.", "system");
  };

  const restoreFogState = async () => {
    await mutateScene((current) => restoreSceneFog(current));
    await appendChatMessage("Sistema", "Neblina restaurada para o estado inicial da cena.", "system");
  };

  const startInitiative = async () => {
    const nextScene = await mutateScene((current) => startSceneInitiative(current));
    const nextPage = getActivePage(nextScene);

    if (!nextScene.initiative.entries.length) {
      await appendChatMessage("Sistema", "Nao ha combatentes validos para a iniciativa.", "system");
      return;
    }

    if (nextPage) {
      await persistInitiativeSnapshot(
        nextScene.sessionId,
        nextPage.id,
        nextScene.initiative,
        nextScene.revision,
      );
    }

    await appendChatMessage(
      "Sistema",
      `Iniciativa automatica: ${nextScene.initiative.entries
        .map((entry) => `${entry.name} ${entry.total}`)
        .join(" | ")}`,
      "system",
    );
  };

  const advanceTurn = async () => {
    const previousRound = scene.initiative.round;
    const nextScene = await mutateScene((current) => advanceSceneInitiative(current));
    const nextPage = getActivePage(nextScene);

    if (nextPage) {
      await persistInitiativeSnapshot(
        nextScene.sessionId,
        nextPage.id,
        nextScene.initiative,
        nextScene.revision,
      );
    }

    if (!nextScene.initiative.activeTurnId) {
      await appendChatMessage(
        "Sistema",
        "Encontro encerrado. Nao restam combatentes ativos.",
        "system",
      );
      return;
    }

    if (nextScene.initiative.round > previousRound) {
      await appendChatMessage(
        "Sistema",
        `Rodada ${nextScene.initiative.round} iniciada.`,
        "system",
      );
    }
  };

  const clearInitiativeState = async () => {
    const nextScene = await mutateScene((current) => clearSceneInitiative(current));
    const nextPage = getActivePage(nextScene);

    if (nextPage) {
      await persistInitiativeSnapshot(
        nextScene.sessionId,
        nextPage.id,
        nextScene.initiative,
        nextScene.revision,
      );
    }
  };

  const adjustHp = async (tokenId: string, delta: number) => {
    const currentToken = tokens.find((token) => token.id === tokenId);
    const nextScene = await mutateScene((current) => adjustSceneTokenHp(current, tokenId, delta));
    const nextToken = nextScene.objects.find(
      (entry) => entry.id === tokenId && entry.objectType === "token",
    );

    if (currentToken && nextToken?.objectType === "token") {
      if (currentToken.payload.hp > 0 && nextToken.payload.hp === 0) {
        await appendChatMessage("Sistema", `${nextToken.payload.name} caiu em combate.`, "system");
      }
    }
  };

  const createNpc = async () => {
    if (!npcDraft.name.trim()) {
      return;
    }

    const nextScene = await mutateScene((current) => addSceneNpc(current, npcDraft));
    const nextToken = nextScene.objects.find((object) => object.id === nextScene.selectedObjectId);

    setNpcDraft({
      name: "",
      hp: 18,
      ac: 13,
      initiativeBonus: 1,
      notes: "",
    });

    if (nextToken?.objectType === "token") {
      await appendChatMessage(
        "Sistema",
        `${nextToken.payload.name} entrou em cena em ${getPositionLabel(
          nextToken.position.x,
          nextToken.position.y,
        )}.`,
        "npc",
      );
    }
  };

  const renderCommandPanel = () => (
    <div className="space-y-4">
      <Card variant="panel">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="font-heading text-lg text-foreground">
                Direcao da cena
              </CardTitle>
              <CardDescription>
                Estado page-scoped com fog, tokens, presenca e revisao incremental.
              </CardDescription>
            </div>
            <Crown className="h-5 w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={scene.boardMode === "move" ? "primary" : "outline"}
              onClick={() => void mutateScene((current) => setBoardMode(current, "move"))}
            >
              <Crosshair className="mr-2 h-4 w-4" />
              Mover
            </Button>
            <Button
              variant={scene.boardMode === "fog" ? "primary" : "outline"}
              onClick={() => void mutateScene((current) => setBoardMode(current, "fog"))}
            >
              <EyeOff className="mr-2 h-4 w-4" />
              Fog
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              onClick={() =>
                void mutateScene((current) => setSceneCameraScale(current, "out"), {
                  broadcast: false,
                  persist: false,
                })
              }
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                void mutateScene((current) => setSceneCameraScale(current, "reset"), {
                  broadcast: false,
                  persist: false,
                })
              }
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                void mutateScene((current) => setSceneCameraScale(current, "in"), {
                  broadcast: false,
                  persist: false,
                })
              }
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border/70 bg-background/50 p-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Revisao
              </p>
              <p className="mt-1 font-heading text-lg text-foreground">{scene.revision}</p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/50 p-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Conectados
              </p>
              <p className="mt-1 font-heading text-lg text-foreground">{scene.presence.length || 1}</p>
            </div>
          </div>

          {/* Battlemap upload */}
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Battlemap</p>
            <Input
              type="file"
              accept="image/*"
              className="text-xs"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const url = URL.createObjectURL(file);
                  setBattlemapUrl(url);
                }
              }}
            />
            {battlemapUrl && (
              <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => setBattlemapUrl(null)}>
                Remover mapa
              </Button>
            )}
          </div>

          {/* Grid controls */}
          <div className="flex items-center justify-between gap-2">
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input type="checkbox" checked={showGrid} onChange={(e) => setShowGrid(e.target.checked)} className="accent-primary" />
              Grid visível
            </label>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground">Opacidade</span>
              <input
                type="range"
                min={0.05}
                max={0.8}
                step={0.05}
                value={gridOpacity}
                onChange={(e) => setGridOpacity(Number(e.target.value))}
                className="w-20 accent-primary"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card variant="panel">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="font-heading text-lg text-foreground">
                Token selecionado
              </CardTitle>
              <CardDescription>
                Selecione um token no stage Pixi para mover, curar ou ferir.
              </CardDescription>
            </div>
            <Ghost className="h-5 w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {selectedToken ? (
            <>
              <div className="rounded-xl border border-border/70 bg-background/50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-heading text-base text-foreground">
                      {selectedToken.payload.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedToken.payload.role} | {getPositionLabel(selectedToken.position.x, selectedToken.position.y)}
                    </p>
                  </div>
                  <Badge variant={selectedToken.payload.team === "party" ? "success" : "danger"}>
                    {selectedToken.payload.team}
                  </Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {selectedToken.payload.note}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" onClick={() => void adjustHp(selectedToken.id, -5)}>
                  -5 HP
                </Button>
                <Button variant="outline" onClick={() => void adjustHp(selectedToken.id, +5)}>
                  +5 HP
                </Button>
                <Button variant="secondary" onClick={() => void revealAroundSelected()}>
                  Revelar
                </Button>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-xl border border-border/70 bg-background/50 p-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">HP</p>
                  <p className="mt-1 font-heading text-lg text-foreground">
                    {selectedToken.payload.hp}/{selectedToken.payload.hpMax}
                  </p>
                </div>
                <div className="rounded-xl border border-border/70 bg-background/50 p-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">CA</p>
                  <p className="mt-1 font-heading text-lg text-foreground">{selectedToken.payload.ac}</p>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhum token selecionado.
            </p>
          )}
        </CardContent>
      </Card>

      <Card variant="panel">
        <CardHeader className="pb-3">
          <CardTitle className="font-heading text-lg text-foreground">
            Ferramentas do mestre
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2">
            <Button variant="outline" onClick={() => void revealEverything()}>
              Revelar mapa inteiro
            </Button>
            <Button variant="outline" onClick={() => void restoreFogState()}>
              Restaurar neblina
            </Button>
            <Button onClick={() => void startInitiative()}>Iniciativa automatica</Button>
            <Button variant="outline" onClick={() => void advanceTurn()}>
              Proximo turno
            </Button>
            <Button variant="ghost" onClick={() => void clearInitiativeState()}>
              Limpar iniciativa
            </Button>
          </div>

          <div className="rounded-xl border border-border/70 bg-background/50 p-4">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Presenca
            </p>
            <div className="mt-3 space-y-2">
              {scene.presence.length === 0 ? (
                <p className="text-sm text-muted-foreground">Apenas esta aba esta conectada.</p>
              ) : (
                scene.presence.map((member) => (
                  <div key={member.key} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-foreground">{member.displayName}</span>
                    <Badge variant={member.role === "gm" ? "info" : "secondary"}>{member.role}</Badge>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card variant="panel">
        <CardHeader className="pb-3">
          <CardTitle className="font-heading text-lg text-foreground">
            Codex de ameacas
          </CardTitle>
          <CardDescription>
            Arraste verbetes prontos da enciclopedia para o mapa ou use a entrada rapida.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loreThreats.map((entry) => (
            <div
              key={entry.slug}
              draggable
              onDragStart={(event) => {
                event.dataTransfer.setData("application/x-dark-lore-entry", entry.slug);
                event.dataTransfer.effectAllowed = "copy";
              }}
              className="rounded-xl border border-border/70 bg-background/50 p-4 transition-colors hover:border-primary/30"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-heading text-base text-foreground">{entry.title}</p>
                  <p className="text-xs uppercase tracking-[0.16em] text-primary/80">
                    {entry.vtt.role}
                  </p>
                </div>
                <Badge variant="outline" className="border-primary/30 text-primary">
                  HP {entry.vtt.hp} | CA {entry.vtt.ac}
                </Badge>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {entry.summary}
              </p>
              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  Arraste para o palco
                </span>
                <Button size="sm" variant="ghost" onClick={() => void spawnLoreEntry(entry)}>
                  Entrada rapida
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card variant="panel">
        <CardHeader className="pb-3">
          <CardTitle className="font-heading text-lg text-foreground">
            Adicionar NPC
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            value={npcDraft.name}
            onChange={(event) => setNpcDraft((current) => ({ ...current, name: event.target.value }))}
            placeholder="Nome do NPC"
          />
          <div className="grid grid-cols-3 gap-2">
            <Input
              type="number"
              value={npcDraft.hp}
              onChange={(event) =>
                setNpcDraft((current) => ({ ...current, hp: Number(event.target.value) }))
              }
              placeholder="HP"
            />
            <Input
              type="number"
              value={npcDraft.ac}
              onChange={(event) =>
                setNpcDraft((current) => ({ ...current, ac: Number(event.target.value) }))
              }
              placeholder="CA"
            />
            <Input
              type="number"
              value={npcDraft.initiativeBonus}
              onChange={(event) =>
                setNpcDraft((current) => ({
                  ...current,
                  initiativeBonus: Number(event.target.value),
                }))
              }
              placeholder="Ini"
            />
          </div>
          <Textarea
            value={npcDraft.notes}
            onChange={(event) => setNpcDraft((current) => ({ ...current, notes: event.target.value }))}
            placeholder="Notas e comportamento"
            className="min-h-[90px]"
          />
          <Button className="w-full" onClick={() => void createNpc()}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar NPC
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderMapPanel = () => (
    <div className="space-y-4">
      <Card variant="elevated">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="font-heading text-lg text-foreground">
                Page-scoped VTT
              </CardTitle>
              <CardDescription>
                Renderer PixiJS com layers, zoom no scroll, pan com botao direito e drag de verbetes da lore.
              </CardDescription>
            </div>
            <Map className="h-5 w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {activePage ? (
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
                void mutateScene((current) => setSceneSelection(current, tokenId), {
                  broadcast: false,
                  persist: false,
                })
              }
              onMoveToken={(tokenId, x, y) => void handleMoveToken(tokenId, x, y)}
              onCameraChange={(camera) => void handleCameraChange(camera)}
              onDropEntry={(entrySlug, cell) => void handleDropLoreEntry(entrySlug, cell)}
            />
          ) : null}

          <div className="grid gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-border/70 bg-background/50 p-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Page</p>
              <p className="mt-1 font-heading text-base text-foreground">{activePage?.name ?? "-"}</p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/50 p-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Revelado</p>
              <p className="mt-1 font-heading text-base text-foreground">{revealedCells}</p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/50 p-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Aliados</p>
              <p className="mt-1 font-heading text-base text-foreground">{partyCount}</p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/50 p-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">NPCs</p>
              <p className="mt-1 font-heading text-base text-foreground">{npcCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSessionPanel = () => (
    <div className="space-y-4">
      <Card variant="panel">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="font-heading text-lg text-foreground">
                Chat de Sessao
              </CardTitle>
              <CardDescription>
                Canal rapido para narracao, avisos do mestre e resultados de rolagem.
              </CardDescription>
            </div>
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="max-h-[26rem] space-y-3 overflow-y-auto rounded-xl border border-border/70 bg-background/50 p-3 scrollbar-dark">
            {scene.chatMessages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "rounded-xl border px-3 py-2",
                  message.tone === "system" && "border-primary/20 bg-primary/5",
                  message.tone === "party" && "border-emerald-500/20 bg-emerald-500/5",
                  message.tone === "npc" && "border-amber-400/20 bg-amber-400/5",
                  message.tone === "roll" && "border-sky-500/20 bg-sky-500/5",
                )}
              >
                <div className="mb-1 flex items-center justify-between gap-3">
                  <span className="font-heading text-xs uppercase tracking-[0.18em] text-foreground">
                    {message.author}
                  </span>
                  <span className="text-[11px] text-muted-foreground">{message.time}</span>
                </div>
                <p className="text-sm leading-6 text-foreground/90">{message.text}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Textarea
              value={chatDraft}
              onChange={(event) => setChatDraft(event.target.value)}
              placeholder="Enviar uma mensagem para a mesa..."
              className="min-h-[90px] bg-background/60"
            />
            <Button onClick={() => void sendChat()} className="w-full">
              <Send className="mr-2 h-4 w-4" />
              Enviar no chat
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card variant="panel">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="font-heading text-lg text-foreground">
                Rolagem de Dados
              </CardTitle>
              <CardDescription>
                Atalhos de d20, dano e expressao personalizada.
              </CardDescription>
            </div>
            <Dice6 className="h-5 w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {["1d4", "1d6", "1d8", "1d10", "1d12", "1d20"].map((notation) => (
              <Button
                key={notation}
                variant="outline"
                onClick={() => void rollNotation(notation, selectedToken?.payload.name ?? "Mesa")}
              >
                {notation}
              </Button>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              value={diceDraft}
              onChange={(event) => setDiceDraft(event.target.value)}
              placeholder="Ex.: 2d6+3"
              className="bg-background/60"
            />
            <Button onClick={() => void rollNotation(diceDraft, selectedToken?.payload.name ?? "Mesa")}>
              Rolar
            </Button>
          </div>

          <div className="space-y-2 rounded-xl border border-border/70 bg-background/50 p-3">
            <div className="flex items-center justify-between">
              <span className="font-heading text-sm text-foreground">Ultimos resultados</span>
              <Badge variant="secondary">{scene.diceHistory.length}</Badge>
            </div>

            {scene.diceHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma rolagem ainda. Use os atalhos acima para abastecer a sessao.
              </p>
            ) : (
              scene.diceHistory.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-lg border border-border/70 bg-background/60 px-3 py-2"
                >
                  <div>
                    <p className="font-heading text-sm text-foreground">
                      {entry.actor} - {entry.notation}
                    </p>
                    <p className="text-xs text-muted-foreground">[{entry.results.join(", ")}]</p>
                  </div>
                  <span className="font-heading text-lg text-primary">{entry.total}</span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card variant="panel">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="font-heading text-lg text-foreground">
                Estado da mesa
              </CardTitle>
              <CardDescription>
                Ordem de turno, ativo atual e resumo tatico da cena.
              </CardDescription>
            </div>
            <Castle className="h-5 w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border/70 bg-background/50 p-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Rodada</p>
              <p className="mt-1 font-heading text-base text-foreground">{scene.initiative.round || "-"}</p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/50 p-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Turno ativo</p>
              <p className="mt-1 font-heading text-base text-foreground">{activeTurn?.name ?? "Sem iniciativa"}</p>
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-background/50 p-4">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Direcao dramatica
            </p>
            <ul className="mt-3 space-y-2 text-sm text-foreground/90">
              <li>Use a neblina para esconder o flanco norte do altar.</li>
              <li>As sentinelas reagem quando um PJ cruza a linha central.</li>
              <li>Elara tem vantagem narrativa para dissipar trevas ritualisticas.</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_top,_rgba(244,200,109,0.09),_transparent_35%),linear-gradient(180deg,_rgba(8,10,18,0.98),_rgba(5,7,12,1))]">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="container max-w-[1600px] py-8 md:py-10"
      >
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-heading text-xs uppercase tracking-[0.35em] text-primary/80">
              Mesa Virtual Integrada
            </p>
            <h1 className="font-display text-3xl text-gold-gradient md:text-4xl">
              Jogo Online Simplificado
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-primary/30 text-primary">
              Pixi stage
            </Badge>
            <Badge variant="outline" className="border-primary/30 text-primary">
              Presence
            </Badge>
            <Badge variant="outline" className="border-primary/30 text-primary">
              Tokens
            </Badge>
            <Badge variant="outline" className="border-primary/30 text-primary">
              Fog de guerra
            </Badge>
          </div>
        </div>

        <div className="hidden gap-6 lg:grid lg:grid-cols-[320px_minmax(0,1fr)_320px]">
          {renderCommandPanel()}
          {renderMapPanel()}
          {renderSessionPanel()}
        </div>

        <div className="lg:hidden">
          <Tabs
            value={mobilePanel}
            onValueChange={(value) => setMobilePanel(value as MobilePanel)}
            className="space-y-4"
          >
            <TabsList className="grid h-auto grid-cols-3 gap-1">
              <TabsTrigger value="mapa" className="font-heading uppercase tracking-[0.18em]">
                Mapa
              </TabsTrigger>
              <TabsTrigger value="mesa" className="font-heading uppercase tracking-[0.18em]">
                Mesa
              </TabsTrigger>
              <TabsTrigger value="chat" className="font-heading uppercase tracking-[0.18em]">
                Chat
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mapa" className="mt-0">
              {renderMapPanel()}
            </TabsContent>
            <TabsContent value="mesa" className="mt-0">
              {renderCommandPanel()}
            </TabsContent>
            <TabsContent value="chat" className="mt-0">
              {renderSessionPanel()}
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </div>
  );
}
