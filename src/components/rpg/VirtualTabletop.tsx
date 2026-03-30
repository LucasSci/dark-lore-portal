import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

import {
  VttCommandPanel,
  VttMapPanel,
  VttSessionPanel,
  type NpcDraftState,
  type VttLoreThreat,
} from "@/components/rpg/virtual-tabletop-panels";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getVttReadyEntries } from "@/lib/encyclopedia";
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
  recordSceneRoll,
  type BoardMode,
  type ChatTone,
  type SceneModel,
} from "@/lib/virtual-tabletop";

type MobilePanel = "mapa" | "mesa" | "chat";

const loreThreats: VttLoreThreat[] = getVttReadyEntries();

export default function VirtualTabletop() {
  const [scene, setScene] = useState<SceneModel>(() => createSceneModel());
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>("mapa");
  const [chatDraft, setChatDraft] = useState("");
  const [diceDraft, setDiceDraft] = useState("1d20+4");
  const [showGrid, setShowGrid] = useState(true);
  const [gridOpacity, setGridOpacity] = useState(0.3);
  const [battlemapUrl, setBattlemapUrl] = useState<string | null>(null);
  const [npcDraft, setNpcDraft] = useState<NpcDraftState>({
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

  useEffect(() => {
    return () => {
      if (battlemapUrl) {
        URL.revokeObjectURL(battlemapUrl);
      }
    };
  }, [battlemapUrl]);

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

  const activePage = useMemo(
    () => getActivePage(scene) ?? null,
    [scene],
  );
  const tokens = useMemo(() => getSceneTokens(scene), [scene]);
  const selectedToken = useMemo(
    () => getSelectedToken(scene),
    [scene],
  );
  const activeTurn = useMemo(
    () =>
      scene.initiative.entries.find(
        (entry) => entry.tokenId === scene.initiative.activeTurnId,
      ) ?? null,
    [scene.initiative.activeTurnId, scene.initiative.entries],
  );
  const revealedCells = useMemo(
    () => (activePage ? countRevealedCells(activePage.fog) : 0),
    [activePage],
  );
  const partyCount = useMemo(
    () => tokens.filter((token) => token.payload.team === "party").length,
    [tokens],
  );
  const npcCount = useMemo(
    () => tokens.filter((token) => token.payload.team === "npc").length,
    [tokens],
  );

  const appendChatMessage = useCallback(
    async (author: string, text: string, tone: ChatTone) => {
      const nextScene = await mutateScene((current) => appendSceneChat(current, author, text, tone));
      const latestMessage = nextScene.chatMessages.at(-1);
      const nextPage = getActivePage(nextScene);

      if (latestMessage && nextPage) {
        await persistChatMessage(nextScene.sessionId, nextPage.id, latestMessage);
      }
    },
    [mutateScene],
  );

  const handleCellClick = useCallback(
    async (cell: { id: string; x: number; y: number }) => {
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
    },
    [mutateScene, scene.boardMode, selectedToken],
  );

  const handleMoveToken = useCallback(
    async (tokenId: string, x: number, y: number) => {
      await mutateScene((current) => moveSceneToken(current, tokenId, x, y));
    },
    [mutateScene],
  );

  const handleCameraChange = useCallback(
    async (camera: SceneModel["pages"][number]["camera"]) => {
      await mutateScene((current) => setSceneCamera(current, camera), {
        broadcast: false,
        persist: false,
      });
    },
    [mutateScene],
  );

  const spawnLoreEntry = useCallback(
    async (entry: VttLoreThreat, position?: { x: number; y: number }) => {
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
    },
    [appendChatMessage, mutateScene],
  );

  const handleDropLoreEntry = useCallback(
    async (entrySlug: string, cell: { id: string; x: number; y: number }) => {
      const entry = loreThreats.find((candidate) => candidate.slug === entrySlug);

      if (!entry) {
        return;
      }

      await spawnLoreEntry(entry, { x: cell.x, y: cell.y });
    },
    [spawnLoreEntry],
  );

  const sendChat = useCallback(async () => {
    if (!chatDraft.trim()) {
      return;
    }

    await appendChatMessage("Narrador", chatDraft.trim(), "party");
    setChatDraft("");
  }, [appendChatMessage, chatDraft]);

  const rollNotation = useCallback(
    async (notation: string, actor: string) => {
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
    },
    [mutateScene],
  );

  const revealAroundSelected = useCallback(async () => {
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
  }, [appendChatMessage, mutateScene, selectedToken]);

  const revealEverything = useCallback(async () => {
    await mutateScene((current) => revealEntireSceneFog(current));
    await appendChatMessage("Sistema", "Toda a neblina de guerra foi removida.", "system");
  }, [appendChatMessage, mutateScene]);

  const restoreFogState = useCallback(async () => {
    await mutateScene((current) => restoreSceneFog(current));
    await appendChatMessage("Sistema", "Neblina restaurada para o estado inicial da cena.", "system");
  }, [appendChatMessage, mutateScene]);

  const startInitiative = useCallback(async () => {
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
  }, [appendChatMessage, mutateScene]);

  const advanceTurn = useCallback(async () => {
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
  }, [appendChatMessage, mutateScene, scene.initiative.round]);

  const clearInitiativeState = useCallback(async () => {
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
  }, [mutateScene]);

  const adjustHp = useCallback(
    async (tokenId: string, delta: number) => {
      const currentToken = tokens.find((token) => token.id === tokenId);
      const nextScene = await mutateScene((current) => adjustSceneTokenHp(current, tokenId, delta));
      const nextToken = nextScene.objects.find(
        (entry) => entry.id === tokenId && entry.objectType === "token",
      );

      if (currentToken && nextToken?.objectType === "token" && currentToken.payload.hp > 0 && nextToken.payload.hp === 0) {
        await appendChatMessage("Sistema", `${nextToken.payload.name} caiu em combate.`, "system");
      }
    },
    [appendChatMessage, mutateScene, tokens],
  );

  const createNpc = useCallback(async () => {
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
  }, [appendChatMessage, mutateScene, npcDraft]);

  const handleSetBoardMode = useCallback(
    (mode: BoardMode) => {
      void mutateScene((current) => setBoardMode(current, mode));
    },
    [mutateScene],
  );

  const handleAdjustCameraScale = useCallback(
    (direction: "in" | "out" | "reset") => {
      void mutateScene((current) => setSceneCameraScale(current, direction), {
        broadcast: false,
        persist: false,
      });
    },
    [mutateScene],
  );

  const handleSelectToken = useCallback(
    (tokenId: string | null) => {
      void mutateScene((current) => setSceneSelection(current, tokenId), {
        broadcast: false,
        persist: false,
      });
    },
    [mutateScene],
  );

  const handleBattlemapUpload = useCallback((file: File | null) => {
    setBattlemapUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }

      return file ? URL.createObjectURL(file) : null;
    });
  }, []);

  const handleClearBattlemap = useCallback(() => {
    setBattlemapUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }

      return null;
    });
  }, []);

  const diceActorName = selectedToken?.payload.name ?? "Mesa";

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
          <VttCommandPanel
            sceneRevision={scene.revision}
            boardMode={scene.boardMode}
            presence={scene.presence}
            selectedToken={selectedToken}
            loreThreats={loreThreats}
            battlemapUrl={battlemapUrl}
            showGrid={showGrid}
            gridOpacity={gridOpacity}
            npcDraft={npcDraft}
            setNpcDraft={setNpcDraft}
            onSetBoardMode={handleSetBoardMode}
            onAdjustCameraScale={handleAdjustCameraScale}
            onAdjustHp={(tokenId, delta) => void adjustHp(tokenId, delta)}
            onRevealAroundSelected={() => void revealAroundSelected()}
            onRevealEverything={() => void revealEverything()}
            onRestoreFogState={() => void restoreFogState()}
            onStartInitiative={() => void startInitiative()}
            onAdvanceTurn={() => void advanceTurn()}
            onClearInitiativeState={() => void clearInitiativeState()}
            onSpawnLoreEntry={(entry) => void spawnLoreEntry(entry)}
            onBattlemapUpload={handleBattlemapUpload}
            onClearBattlemap={handleClearBattlemap}
            onToggleGrid={setShowGrid}
            onGridOpacityChange={setGridOpacity}
            onCreateNpc={() => void createNpc()}
          />

          <VttMapPanel
            activePage={activePage}
            tokens={tokens}
            selectedTokenId={scene.selectedObjectId}
            boardMode={scene.boardMode}
            gridOpacity={gridOpacity}
            showGrid={showGrid}
            battlemapUrl={battlemapUrl}
            revealedCells={revealedCells}
            partyCount={partyCount}
            npcCount={npcCount}
            onCellClick={(cell) => void handleCellClick(cell)}
            onSelectToken={handleSelectToken}
            onMoveToken={(tokenId, x, y) => void handleMoveToken(tokenId, x, y)}
            onCameraChange={(camera) => void handleCameraChange(camera)}
            onDropEntry={(entrySlug, cell) => void handleDropLoreEntry(entrySlug, cell)}
          />

          <VttSessionPanel
            chatMessages={scene.chatMessages}
            chatDraft={chatDraft}
            setChatDraft={setChatDraft}
            diceDraft={diceDraft}
            setDiceDraft={setDiceDraft}
            diceHistory={scene.diceHistory}
            initiativeRound={scene.initiative.round}
            activeTurnName={activeTurn?.name ?? null}
            diceActorName={diceActorName}
            onSendChat={() => void sendChat()}
            onRollNotation={(notation, actor) => void rollNotation(notation, actor)}
          />
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
              <VttMapPanel
                activePage={activePage}
                tokens={tokens}
                selectedTokenId={scene.selectedObjectId}
                boardMode={scene.boardMode}
                gridOpacity={gridOpacity}
                showGrid={showGrid}
                battlemapUrl={battlemapUrl}
                revealedCells={revealedCells}
                partyCount={partyCount}
                npcCount={npcCount}
                onCellClick={(cell) => void handleCellClick(cell)}
                onSelectToken={handleSelectToken}
                onMoveToken={(tokenId, x, y) => void handleMoveToken(tokenId, x, y)}
                onCameraChange={(camera) => void handleCameraChange(camera)}
                onDropEntry={(entrySlug, cell) => void handleDropLoreEntry(entrySlug, cell)}
              />
            </TabsContent>
            <TabsContent value="mesa" className="mt-0">
              <VttCommandPanel
                sceneRevision={scene.revision}
                boardMode={scene.boardMode}
                presence={scene.presence}
                selectedToken={selectedToken}
                loreThreats={loreThreats}
                battlemapUrl={battlemapUrl}
                showGrid={showGrid}
                gridOpacity={gridOpacity}
                npcDraft={npcDraft}
                setNpcDraft={setNpcDraft}
                onSetBoardMode={handleSetBoardMode}
                onAdjustCameraScale={handleAdjustCameraScale}
                onAdjustHp={(tokenId, delta) => void adjustHp(tokenId, delta)}
                onRevealAroundSelected={() => void revealAroundSelected()}
                onRevealEverything={() => void revealEverything()}
                onRestoreFogState={() => void restoreFogState()}
                onStartInitiative={() => void startInitiative()}
                onAdvanceTurn={() => void advanceTurn()}
                onClearInitiativeState={() => void clearInitiativeState()}
                onSpawnLoreEntry={(entry) => void spawnLoreEntry(entry)}
                onBattlemapUpload={handleBattlemapUpload}
                onClearBattlemap={handleClearBattlemap}
                onToggleGrid={setShowGrid}
                onGridOpacityChange={setGridOpacity}
                onCreateNpc={() => void createNpc()}
              />
            </TabsContent>
            <TabsContent value="chat" className="mt-0">
              <VttSessionPanel
                chatMessages={scene.chatMessages}
                chatDraft={chatDraft}
                setChatDraft={setChatDraft}
                diceDraft={diceDraft}
                setDiceDraft={setDiceDraft}
                diceHistory={scene.diceHistory}
                initiativeRound={scene.initiative.round}
                activeTurnName={activeTurn?.name ?? null}
                diceActorName={diceActorName}
                onSendChat={() => void sendChat()}
                onRollNotation={(notation, actor) => void rollNotation(notation, actor)}
              />
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </div>
  );
}
