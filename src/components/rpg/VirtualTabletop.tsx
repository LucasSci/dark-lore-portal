import { useEffect, useState } from "react";
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
import { parseDiceNotation, rollDice } from "@/lib/rpg-utils";
import { cn } from "@/lib/utils";
import {
  BOARD_COLUMNS,
  BOARD_ROWS,
  TERRAIN_META,
  countRevealedCells,
  createBoard,
  createDemoTokens,
  createInitialFog,
  createInitiativeOrder,
  getNextInitiativeTurn,
  getNextOpenPosition,
  revealAllFog,
  revealFogArea,
  type InitiativeEntry,
  type TabletopCell,
  type TabletopToken,
} from "@/lib/virtual-tabletop";

type BoardMode = "move" | "fog";
type MobilePanel = "mapa" | "mesa" | "chat";
type ChatTone = "system" | "party" | "npc" | "roll";

interface ChatMessage {
  id: string;
  author: string;
  tone: ChatTone;
  text: string;
  time: string;
}

interface DiceHistoryEntry {
  id: string;
  actor: string;
  notation: string;
  results: number[];
  total: number;
}

const BOARD = createBoard();
const DEMO_TOKENS = createDemoTokens();
const INITIAL_FOG = createInitialFog();

const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function stampTime() {
  return timeFormatter.format(new Date());
}

function positionLabel(x: number, y: number) {
  return `${String.fromCharCode(65 + x)}${y + 1}`;
}

function shortNameFrom(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (!parts.length) {
    return "NPC";
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);
}

function createInitialChat(): ChatMessage[] {
  return [
    {
      id: makeId("chat"),
      author: "Sistema",
      tone: "system",
      text: "Mesa da Cripta de Velkyn pronta. Jogadores podem mover tokens, rolar dados e falar no chat.",
      time: stampTime(),
    },
    {
      id: makeId("chat"),
      author: "Narrador",
      tone: "party",
      text: "A porta do santuario se abriu. A neblina cobre o corredor alem do altar.",
      time: stampTime(),
    },
  ];
}

export default function VirtualTabletop() {
  const [tokens, setTokens] = useState<TabletopToken[]>(DEMO_TOKENS);
  const [fog, setFog] = useState(INITIAL_FOG);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(DEMO_TOKENS[0]?.id ?? null);
  const [boardMode, setBoardMode] = useState<BoardMode>("move");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(createInitialChat);
  const [chatDraft, setChatDraft] = useState("");
  const [diceDraft, setDiceDraft] = useState("1d20+4");
  const [diceHistory, setDiceHistory] = useState<DiceHistoryEntry[]>([]);
  const [initiative, setInitiative] = useState<InitiativeEntry[]>([]);
  const [activeTurnId, setActiveTurnId] = useState<string | null>(null);
  const [round, setRound] = useState(0);
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>("mapa");
  const [npcDraft, setNpcDraft] = useState({
    name: "",
    hp: 18,
    ac: 13,
    initiativeBonus: 1,
    notes: "",
  });

  useEffect(() => {
    if (!tokens.some((token) => token.id === selectedTokenId)) {
      setSelectedTokenId(tokens[0]?.id ?? null);
    }
  }, [selectedTokenId, tokens]);

  const selectedToken = tokens.find((token) => token.id === selectedTokenId) ?? null;
  const activeTurn = initiative.find((entry) => entry.tokenId === activeTurnId) ?? null;
  const activeToken = tokens.find((token) => token.id === activeTurnId) ?? null;
  const revealedCells = countRevealedCells(fog);
  const partyCount = tokens.filter((token) => token.team === "party").length;
  const npcCount = tokens.filter((token) => token.team === "npc").length;

  const appendChat = (author: string, text: string, tone: ChatTone) => {
    setChatMessages((previous) => [
      ...previous.slice(-39),
      {
        id: makeId("chat"),
        author,
        tone,
        text,
        time: stampTime(),
      },
    ]);
  };

  const rollNotation = (notation: string, actor: string) => {
    const parsed = parseDiceNotation(notation.trim().toLowerCase());
    const { results, total } = rollDice(parsed.sides, parsed.count);
    const finalTotal = total + parsed.modifier;
    const normalizedNotation = `${parsed.count}d${parsed.sides}${parsed.modifier === 0 ? "" : parsed.modifier > 0 ? `+${parsed.modifier}` : parsed.modifier}`;

    setDiceHistory((previous) => [
      {
        id: makeId("roll"),
        actor,
        notation: normalizedNotation,
        results,
        total: finalTotal,
      },
      ...previous.slice(0, 7),
    ]);

    appendChat(actor, `${normalizedNotation} -> [${results.join(", ")}] = ${finalTotal}`, "roll");
  };

  const handleCellClick = (cell: TabletopCell) => {
    if (boardMode === "fog") {
      setFog((previous) => ({
        ...previous,
        [cell.id]: !previous[cell.id],
      }));
      return;
    }

    if (!selectedToken) {
      return;
    }

    if (selectedToken.x === cell.x && selectedToken.y === cell.y) {
      return;
    }

    setTokens((previous) =>
      previous.map((token) =>
        token.id === selectedToken.id ? { ...token, x: cell.x, y: cell.y } : token,
      ),
    );
  };

  const revealAroundSelected = () => {
    if (!selectedToken) {
      return;
    }

    setFog((previous) => revealFogArea(previous, selectedToken.x, selectedToken.y, 1));
    appendChat("Sistema", `Neblina dissipada ao redor de ${selectedToken.name}.`, "system");
  };

  const revealEverything = () => {
    setFog(revealAllFog());
    appendChat("Sistema", "Toda a neblina de guerra foi removida.", "system");
  };

  const restoreFog = () => {
    setFog(createInitialFog());
    appendChat("Sistema", "Neblina restaurada para o estado inicial da cena.", "system");
  };

  const sendChatMessage = () => {
    if (!chatDraft.trim()) {
      return;
    }

    appendChat("Narrador", chatDraft.trim(), "party");
    setChatDraft("");
  };

  const startInitiative = () => {
    const order = createInitiativeOrder(tokens);

    setInitiative(order);
    setActiveTurnId(order[0]?.tokenId ?? null);
    setRound(order.length ? 1 : 0);

    if (!order.length) {
      appendChat("Sistema", "Nao ha combatentes validos para a iniciativa.", "system");
      return;
    }

    appendChat(
      "Sistema",
      `Iniciativa automatica: ${order
        .map((entry) => `${entry.name} ${entry.total}`)
        .join(" | ")}`,
      "system",
    );
  };

  const advanceTurn = () => {
    if (!initiative.length) {
      return;
    }

    const livingIds = new Set(tokens.filter((token) => token.hp > 0).map((token) => token.id));
    const { nextId, wrapped } = getNextInitiativeTurn(initiative, activeTurnId, livingIds);

    if (!nextId) {
      setActiveTurnId(null);
      setRound(0);
      appendChat("Sistema", "Encontro encerrado. Nao restam combatentes ativos.", "system");
      return;
    }

    setActiveTurnId(nextId);

    if (wrapped) {
      setRound((previous) => {
        const nextRound = previous + 1;
        appendChat("Sistema", `Rodada ${nextRound} iniciada.`, "system");
        return nextRound;
      });
    }
  };

  const clearInitiative = () => {
    setInitiative([]);
    setActiveTurnId(null);
    setRound(0);
  };

  const adjustTokenHp = (tokenId: string, delta: number) => {
    const token = tokens.find((entry) => entry.id === tokenId);

    if (!token) {
      return;
    }

    const nextHp = Math.max(0, Math.min(token.hpMax, token.hp + delta));

    setTokens((previous) =>
      previous.map((entry) =>
        entry.id === tokenId ? { ...entry, hp: nextHp } : entry,
      ),
    );

    if (token.hp > 0 && nextHp === 0) {
      appendChat("Sistema", `${token.name} caiu em combate.`, "system");
    }
  };

  const addNpc = () => {
    if (!npcDraft.name.trim()) {
      return;
    }

    const position = getNextOpenPosition(tokens);
    const nextNpc: TabletopToken = {
      id: makeId("npc"),
      name: npcDraft.name.trim(),
      shortName: shortNameFrom(npcDraft.name),
      team: "npc",
      role: "NPC",
      x: position.x,
      y: position.y,
      hp: npcDraft.hp,
      hpMax: npcDraft.hp,
      ac: npcDraft.ac,
      initiativeBonus: npcDraft.initiativeBonus,
      color:
        "linear-gradient(145deg, rgba(244, 128, 88, 0.96), rgba(116, 26, 36, 0.96))",
      note: npcDraft.notes.trim() || "NPC controlado pelo mestre.",
      controlledBy: "gm",
    };

    setTokens((previous) => [...previous, nextNpc]);
    setSelectedTokenId(nextNpc.id);
    setNpcDraft({
      name: "",
      hp: 18,
      ac: 13,
      initiativeBonus: 1,
      notes: "",
    });

    appendChat(
      "Sistema",
      `${nextNpc.name} entrou em cena em ${positionLabel(position.x, position.y)}.`,
      "npc",
    );
  };

  const removeNpc = (tokenId: string) => {
    const token = tokens.find((entry) => entry.id === tokenId);

    if (!token || token.team !== "npc") {
      return;
    }

    setTokens((previous) => previous.filter((entry) => entry.id !== tokenId));
    setInitiative((previous) => previous.filter((entry) => entry.tokenId !== tokenId));

    if (activeTurnId === tokenId) {
      setActiveTurnId(null);
    }

    appendChat("Sistema", `${token.name} foi removido da mesa.`, "system");
  };

  const renderCommandPanel = () => (
    <div className="space-y-4">
      <Card className="border-gold/20 bg-card-gradient shadow-card">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="font-heading text-lg text-foreground">
                Controle da Cena
              </CardTitle>
              <CardDescription>
                Alterna entre mover tokens e editar a neblina de guerra.
              </CardDescription>
            </div>
            <Badge variant="outline" className="border-primary/30 text-primary">
              Visao do Mestre
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={boardMode === "move" ? "default" : "outline"}
              onClick={() => setBoardMode("move")}
              className="justify-start"
            >
              <Crosshair className="mr-2 h-4 w-4" />
              Mover tokens
            </Button>
            <Button
              variant={boardMode === "fog" ? "default" : "outline"}
              onClick={() => setBoardMode("fog")}
              className="justify-start"
            >
              <EyeOff className="mr-2 h-4 w-4" />
              Editar fog
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={revealAroundSelected}>
              <Sparkles className="mr-2 h-4 w-4" />
              Revelar area
            </Button>
            <Button variant="outline" onClick={restoreFog}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Restaurar
            </Button>
          </div>

          <Button variant="secondary" onClick={revealEverything} className="w-full">
            <Map className="mr-2 h-4 w-4" />
            Revelar mapa inteiro
          </Button>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg border border-border/70 bg-background/50 px-3 py-2">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Jogadores
              </p>
              <p className="font-heading text-xl text-foreground">{partyCount}</p>
            </div>
            <div className="rounded-lg border border-border/70 bg-background/50 px-3 py-2">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                NPCs
              </p>
              <p className="font-heading text-xl text-foreground">{npcCount}</p>
            </div>
            <div className="rounded-lg border border-border/70 bg-background/50 px-3 py-2">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Visivel
              </p>
              <p className="font-heading text-xl text-foreground">
                {revealedCells}/{BOARD_COLUMNS * BOARD_ROWS}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-gold/20 bg-card-gradient shadow-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="font-heading text-lg text-foreground">
                Tokens na Mesa
              </CardTitle>
              <CardDescription>
                Clique em um token para selecionar, mover e ajustar HP.
              </CardDescription>
            </div>
            <Users className="h-5 w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="max-h-[24rem] space-y-3 overflow-y-auto pr-1 scrollbar-dark">
            {tokens.map((token) => {
              const isSelected = token.id === selectedTokenId;
              const isActive = token.id === activeTurnId;

              return (
                <button
                  key={token.id}
                  type="button"
                  onClick={() => {
                    setSelectedTokenId(token.id);
                    setBoardMode("move");
                  }}
                  className={cn(
                    "w-full rounded-xl border p-3 text-left transition-colors",
                    isSelected
                      ? "border-primary/60 bg-primary/10"
                      : "border-border bg-background/40 hover:border-primary/30",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={cn(
                          "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-xs font-heading tracking-[0.2em] text-white",
                          isActive && "ring-2 ring-primary/70",
                        )}
                        style={{
                          backgroundImage: token.color,
                          borderColor:
                            token.team === "party"
                              ? "rgba(244, 200, 109, 0.35)"
                              : "rgba(244, 128, 88, 0.35)",
                        }}
                      >
                        {token.shortName}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-heading text-sm text-foreground">
                            {token.name}
                          </p>
                          <Badge
                            variant="outline"
                            className={cn(
                              "border-current px-2 py-0 text-[10px] uppercase tracking-[0.18em]",
                              token.team === "party"
                                ? "text-primary"
                                : "text-amber-300",
                            )}
                          >
                            {token.team === "party" ? "PJ" : "NPC"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {token.role} - {positionLabel(token.x, token.y)} - Init{" "}
                          {token.initiativeBonus >= 0
                            ? `+${token.initiativeBonus}`
                            : token.initiativeBonus}
                        </p>
                      </div>
                    </div>
                    {token.hp === 0 && <Skull className="mt-1 h-4 w-4 text-destructive" />}
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                        <span>HP</span>
                        <span>
                          {token.hp}/{token.hpMax}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-secondary">
                        <div
                          className={cn(
                            "h-full transition-all",
                            token.hp / token.hpMax > 0.5
                              ? "bg-emerald-500"
                              : token.hp / token.hpMax > 0.25
                                ? "bg-amber-500"
                                : "bg-destructive",
                          )}
                          style={{ width: `${(token.hp / token.hpMax) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={(event) => {
                          event.stopPropagation();
                          adjustTokenHp(token.id, -5);
                        }}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={(event) => {
                          event.stopPropagation();
                          adjustTokenHp(token.id, 5);
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {token.team === "npc" && (
                    <div className="mt-3 flex items-center justify-between gap-3 border-t border-border/70 pt-3 text-xs text-muted-foreground">
                      <span>CA {token.ac}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-destructive"
                        onClick={(event) => {
                          event.stopPropagation();
                          removeNpc(token.id);
                        }}
                      >
                        Remover
                      </Button>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-gold/20 bg-card-gradient shadow-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="font-heading text-lg text-foreground">
                Iniciativa Automatica
              </CardTitle>
              <CardDescription>
                Gera a ordem de combate com 1d20 + bonus de iniciativa.
              </CardDescription>
            </div>
            <Sword className="h-5 w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={startInitiative}>
              <Sparkles className="mr-2 h-4 w-4" />
              Rolar ordem
            </Button>
            <Button variant="outline" onClick={advanceTurn} disabled={!initiative.length}>
              <Crown className="mr-2 h-4 w-4" />
              Proximo turno
            </Button>
          </div>

          <Button variant="ghost" className="w-full" onClick={clearInitiative}>
            Limpar encontro
          </Button>

          <div className="rounded-lg border border-border/70 bg-background/50 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-heading text-sm text-foreground">Rodada</span>
              <Badge variant="secondary">{round > 0 ? round : "Fora de combate"}</Badge>
            </div>
            <div className="space-y-2">
              {initiative.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhum encontro em andamento. Clique em &quot;Rolar ordem&quot; para iniciar.
                </p>
              )}

              {initiative.map((entry, index) => {
                const token = tokens.find((candidate) => candidate.id === entry.tokenId);
                const isCurrent = entry.tokenId === activeTurnId;
                const isDefeated = !token || token.hp === 0;

                return (
                  <div
                    key={entry.tokenId}
                    className={cn(
                      "flex items-center justify-between rounded-lg border px-3 py-2 transition-colors",
                      isCurrent
                        ? "border-primary/60 bg-primary/10"
                        : "border-border/70 bg-background/40",
                      isDefeated && "opacity-40",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-heading text-sm text-muted-foreground">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {entry.team === "party" ? (
                        <Shield className="h-4 w-4 text-primary" />
                      ) : (
                        <Ghost className="h-4 w-4 text-amber-300" />
                      )}
                      <span className="font-heading text-sm text-foreground">
                        {entry.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-heading text-sm text-foreground">{entry.total}</p>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        {entry.bonus >= 0 ? `+${entry.bonus}` : entry.bonus}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-gold/20 bg-card-gradient shadow-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="font-heading text-lg text-foreground">
                Controle de NPCs
              </CardTitle>
              <CardDescription>
                Adiciona novos oponentes direto na grade da cena.
              </CardDescription>
            </div>
            <Ghost className="h-5 w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            value={npcDraft.name}
            onChange={(event) =>
              setNpcDraft((previous) => ({ ...previous, name: event.target.value }))
            }
            placeholder="Nome do NPC"
            className="bg-background/60"
          />
          <div className="grid grid-cols-3 gap-2">
            <Input
              type="number"
              value={npcDraft.hp}
              onChange={(event) =>
                setNpcDraft((previous) => ({
                  ...previous,
                  hp: Number(event.target.value) || 0,
                }))
              }
              placeholder="HP"
              className="bg-background/60"
            />
            <Input
              type="number"
              value={npcDraft.ac}
              onChange={(event) =>
                setNpcDraft((previous) => ({
                  ...previous,
                  ac: Number(event.target.value) || 0,
                }))
              }
              placeholder="CA"
              className="bg-background/60"
            />
            <Input
              type="number"
              value={npcDraft.initiativeBonus}
              onChange={(event) =>
                setNpcDraft((previous) => ({
                  ...previous,
                  initiativeBonus: Number(event.target.value) || 0,
                }))
              }
              placeholder="Init"
              className="bg-background/60"
            />
          </div>
          <Textarea
            value={npcDraft.notes}
            onChange={(event) =>
              setNpcDraft((previous) => ({ ...previous, notes: event.target.value }))
            }
            placeholder="Notas de comportamento ou gancho de cena"
            className="min-h-[96px] bg-background/60"
          />
          <Button onClick={addNpc} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar NPC ao mapa
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderMapPanel = () => (
    <div className="space-y-4">
      <Card className="overflow-hidden border-gold/20 bg-card-gradient shadow-card">
        <CardHeader className="border-b border-border/70 pb-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Map className="h-5 w-5 text-primary" />
                <CardTitle className="font-heading text-2xl text-gold-gradient">
                  Mesa Virtual da Cripta de Velkyn
                </CardTitle>
              </div>
              <CardDescription className="max-w-2xl text-sm md:text-base">
                Interface inspirada em Roll20 e Foundry, mas com foco em uma mesa enxuta:
                mapa central, tokens, chat, iniciativa, dados e ferramentas do mestre.
              </CardDescription>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-xl border border-border/70 bg-background/50 px-3 py-2">
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  Cena
                </p>
                <p className="font-heading text-sm text-foreground">Cripta</p>
              </div>
              <div className="rounded-xl border border-border/70 bg-background/50 px-3 py-2">
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  Modo
                </p>
                <p className="font-heading text-sm text-foreground">
                  {boardMode === "move" ? "Mover" : "Fog"}
                </p>
              </div>
              <div className="rounded-xl border border-border/70 bg-background/50 px-3 py-2">
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  Turno
                </p>
                <p className="font-heading text-sm text-foreground">
                  {activeToken?.name ?? "Livre"}
                </p>
              </div>
              <div className="rounded-xl border border-border/70 bg-background/50 px-3 py-2">
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  Status
                </p>
                <p className="font-heading text-sm text-foreground">
                  {initiative.length ? `Rodada ${round}` : "Exploracao"}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 p-4 md:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant={boardMode === "move" ? "default" : "outline"}
              onClick={() => setBoardMode("move")}
            >
              <Crosshair className="mr-2 h-4 w-4" />
              Tokens
            </Button>
            <Button
              size="sm"
              variant={boardMode === "fog" ? "default" : "outline"}
              onClick={() => setBoardMode("fog")}
            >
              <EyeOff className="mr-2 h-4 w-4" />
              Fog
            </Button>
            <Button size="sm" variant="outline" onClick={revealAroundSelected}>
              <Sparkles className="mr-2 h-4 w-4" />
              Revelar ao redor
            </Button>
            <Button size="sm" variant="outline" onClick={startInitiative}>
              <Sword className="mr-2 h-4 w-4" />
              Auto iniciativa
            </Button>
            <Button size="sm" variant="ghost" onClick={advanceTurn} disabled={!initiative.length}>
              <Crown className="mr-2 h-4 w-4" />
              Proximo
            </Button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border/70 bg-background/70 p-2 md:p-3">
            <div
              className="grid gap-2"
              style={{
                gridTemplateColumns: `repeat(${BOARD_COLUMNS}, minmax(0, 1fr))`,
              }}
            >
              {BOARD.map((cell) => {
                const terrain = TERRAIN_META[cell.terrain];
                const cellTokens = tokens.filter(
                  (token) => token.x === cell.x && token.y === cell.y,
                );
                const isVisible = fog[cell.id];
                const isSelectedCell =
                  selectedToken?.x === cell.x && selectedToken?.y === cell.y;

                return (
                  <button
                    key={cell.id}
                    type="button"
                    onClick={() => handleCellClick(cell)}
                    className={cn(
                      "group relative aspect-square overflow-hidden rounded-xl border text-left transition-all",
                      isSelectedCell
                        ? "border-primary/70 shadow-[0_0_0_1px_rgba(244,200,109,0.35)]"
                        : "border-border/70 hover:border-primary/30",
                    )}
                    style={{
                      background: terrain.background,
                      borderColor: isSelectedCell ? undefined : terrain.border,
                    }}
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_58%)]" />
                    <div className="pointer-events-none absolute left-2 top-1 text-[10px] font-heading tracking-[0.18em] text-muted-foreground">
                      {cell.label}
                    </div>
                    <div className="pointer-events-none absolute bottom-1 right-2 text-[9px] uppercase tracking-[0.22em] text-muted-foreground/80">
                      {terrain.label}
                    </div>

                    <div className="absolute inset-0 flex flex-wrap items-end content-end gap-1 p-1 md:p-2">
                      {cellTokens.map((token) => {
                        const isSelected = token.id === selectedTokenId;
                        const isCurrent = token.id === activeTurnId;

                        return (
                          <button
                            key={token.id}
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedTokenId(token.id);
                              setBoardMode("move");
                            }}
                            className={cn(
                              "relative z-10 flex h-9 w-9 items-center justify-center rounded-full border text-[10px] font-heading tracking-[0.18em] text-white shadow-lg transition-transform md:h-10 md:w-10",
                              isSelected && "scale-105 ring-2 ring-primary/70",
                              isCurrent && "animate-pulse",
                            )}
                            style={{
                              backgroundImage: token.color,
                              borderColor:
                                token.team === "party"
                                  ? "rgba(244, 200, 109, 0.5)"
                                  : "rgba(244, 128, 88, 0.5)",
                            }}
                          >
                            {token.shortName}
                          </button>
                        );
                      })}
                    </div>

                    {!isVisible && (
                      <div className="pointer-events-none absolute inset-0 rounded-xl bg-[linear-gradient(160deg,_rgba(3,6,13,0.94),_rgba(8,12,24,0.86))] shadow-[inset_0_0_0_1px_rgba(9,14,21,0.7)]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedToken && (
        <Card className="border-gold/20 bg-card-gradient shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full border text-sm font-heading tracking-[0.18em] text-white"
                  style={{
                    backgroundImage: selectedToken.color,
                    borderColor:
                      selectedToken.team === "party"
                        ? "rgba(244, 200, 109, 0.45)"
                        : "rgba(244, 128, 88, 0.45)",
                  }}
                >
                  {selectedToken.shortName}
                </div>
                <div>
                  <CardTitle className="font-heading text-lg text-foreground">
                    {selectedToken.name}
                  </CardTitle>
                  <CardDescription>
                    {selectedToken.role} -{" "}
                    {selectedToken.team === "party" ? "Personagem" : "NPC"} -{" "}
                    {positionLabel(selectedToken.x, selectedToken.y)}
                  </CardDescription>
                </div>
              </div>

              <Badge variant="outline" className="border-primary/30 text-primary">
                {selectedToken.controlledBy === "gm" ? "Controle GM" : "Controle jogador"}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border/70 bg-background/50 p-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  HP
                </p>
                <p className="font-heading text-2xl text-foreground">
                  {selectedToken.hp}/{selectedToken.hpMax}
                </p>
              </div>
              <div className="rounded-xl border border-border/70 bg-background/50 p-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  CA
                </p>
                <p className="font-heading text-2xl text-foreground">{selectedToken.ac}</p>
              </div>
              <div className="rounded-xl border border-border/70 bg-background/50 p-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  Iniciativa
                </p>
                <p className="font-heading text-2xl text-foreground">
                  {selectedToken.initiativeBonus >= 0
                    ? `+${selectedToken.initiativeBonus}`
                    : selectedToken.initiativeBonus}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border/70 bg-background/50 p-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Notas de controle
              </p>
              <p className="mt-2 text-sm text-foreground/90">{selectedToken.note}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  rollNotation(
                    `1d20${selectedToken.initiativeBonus >= 0 ? `+${selectedToken.initiativeBonus}` : selectedToken.initiativeBonus}`,
                    selectedToken.name,
                  )
                }
              >
                <Dice6 className="mr-2 h-4 w-4" />
                Rolar iniciativa
              </Button>
              <Button variant="outline" onClick={revealAroundSelected}>
                <EyeOff className="mr-2 h-4 w-4" />
                Abrir visao
              </Button>
              <Button
                variant="ghost"
                onClick={() =>
                  appendChat(
                    "Sistema",
                    `${selectedToken.name} assume posicao em ${positionLabel(selectedToken.x, selectedToken.y)}.`,
                    "system",
                  )
                }
              >
                <ScrollText className="mr-2 h-4 w-4" />
                Publicar no chat
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderSessionPanel = () => (
    <div className="space-y-4">
      <Card className="border-gold/20 bg-card-gradient shadow-card">
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
            {chatMessages.map((message) => (
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
            <Button onClick={sendChatMessage} className="w-full">
              <Send className="mr-2 h-4 w-4" />
              Enviar no chat
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-gold/20 bg-card-gradient shadow-card">
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
                onClick={() => rollNotation(notation, selectedToken?.name ?? "Mesa")}
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
            <Button onClick={() => rollNotation(diceDraft, selectedToken?.name ?? "Mesa")}>
              Rolar
            </Button>
          </div>

          <div className="space-y-2 rounded-xl border border-border/70 bg-background/50 p-3">
            <div className="flex items-center justify-between">
              <span className="font-heading text-sm text-foreground">Ultimos resultados</span>
              <Badge variant="secondary">{diceHistory.length}</Badge>
            </div>

            {diceHistory.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nenhuma rolagem ainda. Use os atalhos acima para abastecer a sessao.
              </p>
            )}

            {diceHistory.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between rounded-lg border border-border/70 bg-background/60 px-3 py-2"
              >
                <div>
                  <p className="font-heading text-sm text-foreground">
                    {entry.actor} - {entry.notation}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    [{entry.results.join(", ")}]
                  </p>
                </div>
                <span className="font-heading text-lg text-primary">{entry.total}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-gold/20 bg-card-gradient shadow-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="font-heading text-lg text-foreground">
                Resumo do Mestre
              </CardTitle>
              <CardDescription>
                Objetivos rapidos e leitura instantanea do estado da mesa.
              </CardDescription>
            </div>
            <Castle className="h-5 w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-border/70 bg-background/50 p-4">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Objetivo da cena
            </p>
            <p className="mt-2 text-sm text-foreground/90">
              Romper a sentinela, atravessar o corredor runico e estabilizar o altar
              antes que os ghouls ativem a proxima onda.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border/70 bg-background/50 p-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Token selecionado
              </p>
              <p className="mt-1 font-heading text-base text-foreground">
                {selectedToken?.name ?? "Nenhum"}
              </p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/50 p-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Turno ativo
              </p>
              <p className="mt-1 font-heading text-base text-foreground">
                {activeTurn?.name ?? "Sem iniciativa"}
              </p>
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
              Mapa interativo
            </Badge>
            <Badge variant="outline" className="border-primary/30 text-primary">
              Tokens
            </Badge>
            <Badge variant="outline" className="border-primary/30 text-primary">
              Chat + Dados
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
            <TabsList className="grid h-auto grid-cols-3 gap-1 bg-secondary/60 p-1">
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
