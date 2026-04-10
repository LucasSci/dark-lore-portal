import { memo, useState, type Dispatch, type SetStateAction } from "react";
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
  Send,
} from "lucide-react";

import VttPixiStage from "@/components/rpg/VttPixiStage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  type EncyclopediaEntry,
} from "@/lib/encyclopedia";
import {
  getPositionLabel,
  type BoardMode,
  type ChatMessage,
  type DiceHistoryEntry,
  type PresenceMember,
  type SceneModel,
  type VttPage,
  type VttTokenObject,
} from "@/lib/virtual-tabletop";
import { cn } from "@/lib/utils";

export type VttLoreThreat = EncyclopediaEntry & {
  vtt: NonNullable<EncyclopediaEntry["vtt"]>;
};

export interface NpcDraftState {
  name: string;
  hp: number;
  ac: number;
  initiativeBonus: number;
  notes: string;
}

interface VttCommandPanelProps {
  sceneRevision: number;
  boardMode: BoardMode;
  presence: PresenceMember[];
  selectedToken: VttTokenObject | null;
  loreThreats: VttLoreThreat[];
  battlemapUrl: string | null;
  showGrid: boolean;
  gridOpacity: number;
  npcDraft: NpcDraftState;
  setNpcDraft: Dispatch<SetStateAction<NpcDraftState>>;
  onSetBoardMode: (mode: BoardMode) => void;
  onAdjustCameraScale: (direction: "in" | "out" | "reset") => void;
  onAdjustHp: (tokenId: string, delta: number) => void;
  onRevealAroundSelected: () => void;
  onRevealEverything: () => void;
  onRestoreFogState: () => void;
  onStartInitiative: () => void;
  onAdvanceTurn: () => void;
  onClearInitiativeState: () => void;
  onSpawnLoreEntry: (entry: VttLoreThreat) => void;
  onBattlemapUpload: (file: File | null) => void;
  onClearBattlemap: () => void;
  onToggleGrid: (value: boolean) => void;
  onGridOpacityChange: (value: number) => void;
  onCreateNpc: () => void;
}

export const VttCommandPanel = memo(function VttCommandPanel({
  sceneRevision,
  boardMode,
  presence,
  selectedToken,
  loreThreats,
  battlemapUrl,
  showGrid,
  gridOpacity,
  npcDraft,
  setNpcDraft,
  onSetBoardMode,
  onAdjustCameraScale,
  onAdjustHp,
  onRevealAroundSelected,
  onRevealEverything,
  onRestoreFogState,
  onStartInitiative,
  onAdvanceTurn,
  onClearInitiativeState,
  onSpawnLoreEntry,
  onBattlemapUpload,
  onClearBattlemap,
  onToggleGrid,
  onGridOpacityChange,
  onCreateNpc,
}: VttCommandPanelProps) {
  return (
    <div className="space-y-4">
      <Card variant="panel">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="font-heading text-lg text-foreground">
                Direcao da cena
              </CardTitle>
              <CardDescription>
                Controle de neblina, presenca e revisao da cena em um unico quadro.
              </CardDescription>
            </div>
            <Crown className="h-5 w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={boardMode === "move" ? "primary" : "outline"}
              onClick={() => onSetBoardMode("move")}
            >
              <Crosshair className="mr-2 h-4 w-4" />
              Mover
            </Button>
            <Button
              variant={boardMode === "fog" ? "primary" : "outline"}
              onClick={() => onSetBoardMode("fog")}
            >
              <EyeOff className="mr-2 h-4 w-4" />
              Fog
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" onClick={() => onAdjustCameraScale("out")} aria-label="Diminuir zoom" title="Diminuir zoom">
              <Minus className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => onAdjustCameraScale("reset")} aria-label="Restaurar zoom" title="Restaurar zoom">
              <RefreshCcw className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => onAdjustCameraScale("in")} aria-label="Aumentar zoom" title="Aumentar zoom">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="metric-panel p-3 backdrop-blur-md">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Revisao
              </p>
              <p className="mt-1 font-heading text-lg text-foreground">{sceneRevision}</p>
            </div>
            <div className="metric-panel p-3 backdrop-blur-md">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Conectados
              </p>
              <p className="mt-1 font-heading text-lg text-foreground">{presence.length || 1}</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Battlemap</p>
            <Input
              type="file"
              accept="image/*"
              className="text-xs"
              onChange={(event) => onBattlemapUpload(event.target.files?.[0] ?? null)}
            />
            {battlemapUrl ? (
              <Button variant="ghost" size="sm" className="w-full text-xs" onClick={onClearBattlemap}>
                Remover mapa
              </Button>
            ) : null}
          </div>

          <div className="field-note flex items-center justify-between gap-3 px-3 py-3 backdrop-blur-md">
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <Checkbox checked={showGrid} onCheckedChange={(value) => onToggleGrid(Boolean(value))} />
              Grid visivel
            </label>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground">Opacidade</span>
              <Slider
                min={0.05}
                max={0.8}
                step={0.05}
                value={[gridOpacity]}
                onValueChange={(value) => onGridOpacityChange(value[0] ?? gridOpacity)}
                className="w-24"
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
              <div className="info-panel p-4 backdrop-blur-md">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-heading text-base text-foreground">
                      {selectedToken.payload.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedToken.payload.role} |{" "}
                      {getPositionLabel(selectedToken.position.x, selectedToken.position.y)}
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
                <Button variant="outline" onClick={() => onAdjustHp(selectedToken.id, -5)}>
                  -5 HP
                </Button>
                <Button variant="outline" onClick={() => onAdjustHp(selectedToken.id, 5)}>
                  +5 HP
                </Button>
                <Button variant="secondary" onClick={onRevealAroundSelected}>
                  Revelar
                </Button>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="metric-panel p-3 backdrop-blur-md">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">HP</p>
                  <p className="mt-1 font-heading text-lg text-foreground">
                    {selectedToken.payload.hp}/{selectedToken.payload.hpMax}
                  </p>
                </div>
                <div className="metric-panel p-3 backdrop-blur-md">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">CA</p>
                  <p className="mt-1 font-heading text-lg text-foreground">{selectedToken.payload.ac}</p>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum token selecionado.</p>
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
            <Button variant="outline" onClick={onRevealEverything}>
              Revelar mapa inteiro
            </Button>
            <Button variant="outline" onClick={onRestoreFogState}>
              Restaurar neblina
            </Button>
            <Button onClick={onStartInitiative}>Iniciativa automatica</Button>
            <Button variant="outline" onClick={onAdvanceTurn}>
              Proximo turno
            </Button>
            <Button variant="ghost" onClick={onClearInitiativeState}>
              Limpar iniciativa
            </Button>
          </div>

          <div className="info-panel p-4 backdrop-blur-md">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Presenca
            </p>
            <div className="mt-3 space-y-2">
              {presence.length === 0 ? (
                <p className="text-sm text-muted-foreground">Apenas esta aba esta conectada.</p>
              ) : (
                presence.map((member) => (
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
              className="tool-list-item p-4 backdrop-blur-md"
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
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{entry.summary}</p>
              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  Arraste para o palco
                </span>
                <Button size="sm" variant="ghost" onClick={() => onSpawnLoreEntry(entry)}>
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
          <Button className="w-full" onClick={onCreateNpc}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar NPC
          </Button>
        </CardContent>
      </Card>
    </div>
  );
});

interface VttMapPanelProps {
  activePage: VttPage | null;
  tokens: VttTokenObject[];
  selectedTokenId: string | null;
  boardMode: BoardMode;
  gridOpacity: number;
  showGrid: boolean;
  battlemapUrl: string | null;
  revealedCells: number;
  partyCount: number;
  npcCount: number;
  onCellClick: (cell: { id: string; x: number; y: number }) => void;
  onSelectToken: (tokenId: string | null) => void;
  onMoveToken: (tokenId: string, x: number, y: number) => void;
  onCameraChange: (camera: SceneModel["pages"][number]["camera"]) => void;
  onDropEntry: (entrySlug: string, cell: { id: string; x: number; y: number }) => void;
}

export const VttMapPanel = memo(function VttMapPanel({
  activePage,
  tokens,
  selectedTokenId,
  boardMode,
  gridOpacity,
  showGrid,
  battlemapUrl,
  revealedCells,
  partyCount,
  npcCount,
  onCellClick,
  onSelectToken,
  onMoveToken,
  onCameraChange,
  onDropEntry,
}: VttMapPanelProps) {
  return (
    <div className="space-y-4">
      <Card variant="elevated">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="font-heading text-lg text-foreground">
                Palco da area
              </CardTitle>
              <CardDescription>
                Palco tatico com camadas, zoom, deslocamento e entrada direta de registros do arquivo.
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
              selectedTokenId={selectedTokenId}
              boardMode={boardMode}
              gridOpacity={gridOpacity}
              gridColor={0xffffff}
              showGrid={showGrid}
              battlemapUrl={battlemapUrl}
              onCellClick={onCellClick}
              onSelectToken={onSelectToken}
              onMoveToken={onMoveToken}
              onCameraChange={onCameraChange}
              onDropEntry={onDropEntry}
            />
          ) : null}

          <div className="grid gap-3 sm:grid-cols-4">
            <div className="metric-panel p-3 backdrop-blur-md">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Page</p>
              <p className="mt-1 font-heading text-base text-foreground">{activePage?.name ?? "-"}</p>
            </div>
            <div className="metric-panel p-3 backdrop-blur-md">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Revelado</p>
              <p className="mt-1 font-heading text-base text-foreground">{revealedCells}</p>
            </div>
            <div className="metric-panel p-3 backdrop-blur-md">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Aliados</p>
              <p className="mt-1 font-heading text-base text-foreground">{partyCount}</p>
            </div>
            <div className="metric-panel p-3 backdrop-blur-md">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">NPCs</p>
              <p className="mt-1 font-heading text-base text-foreground">{npcCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

function ChatInput({ onSendChat }: { onSendChat: (message: string) => void }) {
  const [chatDraft, setChatDraft] = useState("");

  const handleSend = () => {
    if (!chatDraft.trim()) return;
    onSendChat(chatDraft);
    setChatDraft("");
  };

  return (
    <div className="space-y-2">
      <Textarea
        value={chatDraft}
        onChange={(event) => setChatDraft(event.target.value)}
        placeholder="Enviar uma mensagem para a mesa..."
        className="min-h-[90px] bg-background/72 backdrop-blur-md"
      />
      <Button onClick={handleSend} className="w-full">
        <Send className="mr-2 h-4 w-4" />
        Enviar no chat
      </Button>
    </div>
  );
}

function DiceInput({
  diceActorName,
  onRollNotation,
}: {
  diceActorName: string;
  onRollNotation: (notation: string, actor: string) => void;
}) {
  const [diceDraft, setDiceDraft] = useState("1d20+4");

  return (
    <div className="flex gap-2">
      <Input
        value={diceDraft}
        onChange={(event) => setDiceDraft(event.target.value)}
        placeholder="Ex.: 2d6+3"
        className="bg-background/72 backdrop-blur-md"
      />
      <motion.div whileTap={{ scale: 0.97 }}>
        <Button onClick={() => onRollNotation(diceDraft, diceActorName)}>Rolar</Button>
      </motion.div>
    </div>
  );
}

interface VttSessionPanelProps {
  chatMessages: ChatMessage[];
  diceHistory: DiceHistoryEntry[];
  initiativeRound: number;
  activeTurnName: string | null;
  diceActorName: string;
  onSendChat: (message: string) => void;
  onRollNotation: (notation: string, actor: string) => void;
}

export const VttSessionPanel = memo(function VttSessionPanel({
  chatMessages,
  diceHistory,
  initiativeRound,
  activeTurnName,
  diceActorName,
  onSendChat,
  onRollNotation,
}: VttSessionPanelProps) {
  return (
    <div className="space-y-4">
      <Card variant="panel">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="font-heading text-lg text-foreground">
                Chat de Sessao
              </CardTitle>
              <CardDescription>
                Canal da mesa para narracao, avisos do mestre e resultados de rolagem.
              </CardDescription>
            </div>
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="info-panel max-h-[26rem] space-y-3 overflow-y-auto p-3 backdrop-blur-md scrollbar-dark">
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "tool-list-item px-3 py-2 backdrop-blur-sm",
                  message.tone === "system" && "border-primary/20 bg-primary/8",
                  message.tone === "party" && "border-emerald-500/20 bg-emerald-500/8",
                  message.tone === "npc" && "border-amber-400/20 bg-amber-400/8",
                  message.tone === "roll" && "border-sky-500/20 bg-sky-500/8",
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

          <ChatInput onSendChat={onSendChat} />
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
              <motion.div key={notation} whileTap={{ scale: 0.97 }}>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => onRollNotation(notation, diceActorName)}
                >
                  {notation}
                </Button>
              </motion.div>
            ))}
          </div>

          <DiceInput diceActorName={diceActorName} onRollNotation={onRollNotation} />

          <div className="info-panel space-y-2 p-3 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="font-heading text-sm text-foreground">Ultimos resultados</span>
              <Badge variant="secondary">{diceHistory.length}</Badge>
            </div>

            {diceHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma rolagem ainda. Use os atalhos acima para abastecer a sessao.
              </p>
            ) : (
              diceHistory.map((entry) => (
                <div
                  key={entry.id}
                  className="metric-panel flex items-center justify-between px-3 py-2 backdrop-blur-sm"
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
            <div className="metric-panel p-3 backdrop-blur-md">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Rodada</p>
              <p className="mt-1 font-heading text-base text-foreground">{initiativeRound || "-"}</p>
            </div>
            <div className="metric-panel p-3 backdrop-blur-md">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Turno ativo</p>
              <p className="mt-1 font-heading text-base text-foreground">{activeTurnName ?? "Sem iniciativa"}</p>
            </div>
          </div>

          <div className="info-panel p-4 backdrop-blur-md">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Pressao da cena
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
});
