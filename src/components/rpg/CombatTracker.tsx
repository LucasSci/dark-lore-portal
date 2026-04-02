import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Clock3,
  Heart,
  Shield,
  Skull,
  Sparkles,
  Swords,
  UserRound,
  Users,
  Zap,
} from "lucide-react";

import { generateSecureId } from "@/lib/utils";
import ConfirmActionDialog from "@/components/ui/confirm-action-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataSection } from "@/components/ui/data-section";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { rollDice } from "@/lib/rpg-utils";
import { getResourceTone } from "@/lib/rpg-ui";

interface Combatant {
  id: string;
  name: string;
  initiative: number;
  hpCurrent: number;
  hpMax: number;
  ac: number;
  isNpc: boolean;
  conditions: string[];
}

interface LogEntry {
  id: string;
  round: number;
  actor: string;
  type: "start" | "round" | "attack" | "heal" | "defeat" | "end";
  description: string;
}

function sortCombatants(list: Combatant[]) {
  return [...list].sort((left, right) => right.initiative - left.initiative);
}

function getLogVariant(type: LogEntry["type"]) {
  if (type === "heal") {
    return "success";
  }

  if (type === "attack") {
    return "warning";
  }

  if (type === "defeat" || type === "end") {
    return "danger";
  }

  return "info";
}

export default function CombatTracker() {
  const [combatants, setCombatants] = useState<Combatant[]>([]);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [round, setRound] = useState(1);
  const [combatActive, setCombatActive] = useState(false);
  const [battleLog, setBattleLog] = useState<LogEntry[]>([]);
  const [npcName, setNpcName] = useState("");
  const [npcHp, setNpcHp] = useState(20);
  const [npcAc, setNpcAc] = useState(12);
  const [confirmStopOpen, setConfirmStopOpen] = useState(false);

  const addLog = (
    actor: string,
    type: LogEntry["type"],
    description: string,
    roundOverride = round,
  ) => {
    setBattleLog((previous) => [
      {
        id: generateSecureId(),
        round: roundOverride,
        actor,
        type,
        description,
      },
      ...previous,
    ]);
  };

  const addNpc = () => {
    const safeName = npcName.trim();

    if (!safeName) {
      return;
    }

    const initiative = rollDice(20).total;
    const nextCombatants = sortCombatants([
      ...combatants,
      {
        id: `npc-${generateSecureId()}`,
        name: safeName,
        initiative,
        hpCurrent: npcHp,
        hpMax: npcHp,
        ac: npcAc,
        isNpc: true,
        conditions: [],
      },
    ]);

    setCombatants(nextCombatants);
    setNpcName("");
  };

  const addSampleEncounter = () => {
    const party: Combatant[] = [
      {
        id: "hero-1",
        name: "Thorin Vale",
        initiative: rollDice(20).total + 2,
        hpCurrent: 45,
        hpMax: 45,
        ac: 18,
        isNpc: false,
        conditions: ["Linha de frente"],
      },
      {
        id: "hero-2",
        name: "Elara Morn",
        initiative: rollDice(20).total + 3,
        hpCurrent: 24,
        hpMax: 24,
        ac: 13,
        isNpc: false,
        conditions: ["Canalizando"],
      },
      {
        id: "hero-3",
        name: "Grimshaw Reed",
        initiative: rollDice(20).total + 1,
        hpCurrent: 33,
        hpMax: 33,
        ac: 16,
        isNpc: false,
        conditions: [],
      },
    ];

    const enemies: Combatant[] = [
      {
        id: "enemy-1",
        name: "Goblin Leader",
        initiative: rollDice(20).total + 3,
        hpCurrent: 36,
        hpMax: 36,
        ac: 15,
        isNpc: true,
        conditions: ["Tatico"],
      },
      {
        id: "enemy-2",
        name: "Goblin Raider",
        initiative: rollDice(20).total + 2,
        hpCurrent: 15,
        hpMax: 15,
        ac: 13,
        isNpc: true,
        conditions: [],
      },
      {
        id: "enemy-3",
        name: "Goblin Raider",
        initiative: rollDice(20).total + 2,
        hpCurrent: 15,
        hpMax: 15,
        ac: 13,
        isNpc: true,
        conditions: [],
      },
    ];

    const nextCombatants = sortCombatants([...party, ...enemies]);
    setCombatants(nextCombatants);
    setCombatActive(true);
    setRound(1);
    setCurrentTurn(0);
    setBattleLog([]);
    addLog("Sistema", "start", "Encontro iniciado.", 1);
  };

  const startCombat = () => {
    if (combatants.length < 2) {
      return;
    }

    setCombatActive(true);
    setRound(1);
    setCurrentTurn(0);
    setBattleLog([]);
    addLog("Sistema", "start", "Combate iniciado.", 1);
  };

  const advanceCombat = (roster: Combatant[]) => {
    const alive = roster.filter((combatant) => combatant.hpCurrent > 0);

    if (alive.length <= 1) {
      setCombatActive(false);
      addLog(
        "Sistema",
        "end",
        alive[0] ? `${alive[0].name} venceu o confronto.` : "O confronto terminou sem sobreviventes.",
      );
      return;
    }

    for (let offset = 1; offset <= roster.length; offset += 1) {
      const nextIndex = (currentTurn + offset) % roster.length;
      const candidate = roster[nextIndex];

      if (candidate?.hpCurrent > 0) {
        const wrapped = currentTurn + offset >= roster.length;

        if (wrapped) {
          const nextRound = round + 1;
          setRound(nextRound);
          addLog("Sistema", "round", `Rodada ${nextRound} iniciada.`, nextRound);
        }

        setCurrentTurn(nextIndex);
        return;
      }
    }
  };

  const nextTurn = () => {
    if (!combatants.length) {
      return;
    }

    advanceCombat(combatants);
  };

  const attack = (targetId: string) => {
    const attacker = combatants[currentTurn];
    const target = combatants.find((combatant) => combatant.id === targetId);

    if (!attacker || !target || target.hpCurrent <= 0) {
      return;
    }

    const attackRoll = rollDice(20).total;
    const hit = attackRoll >= target.ac;

    if (!hit) {
      addLog(
        attacker.name,
        "attack",
        `${attacker.name} falhou contra ${target.name} com ${attackRoll} contra CA ${target.ac}.`,
      );
      advanceCombat(combatants);
      return;
    }

    const damage = rollDice(8).total;
    const nextCombatants = combatants.map((combatant) =>
      combatant.id === targetId
        ? { ...combatant, hpCurrent: Math.max(0, combatant.hpCurrent - damage) }
        : combatant,
    );

    setCombatants(nextCombatants);
    addLog(
      attacker.name,
      "attack",
      `${attacker.name} acertou ${target.name} com ${attackRoll} e causou ${damage} de dano.`,
    );

    if (target.hpCurrent - damage <= 0) {
      addLog("Sistema", "defeat", `${target.name} caiu em combate.`);
    }

    advanceCombat(nextCombatants);
  };

  const heal = (targetId: string) => {
    const actor = combatants[currentTurn];
    const target = combatants.find((combatant) => combatant.id === targetId);

    if (!actor || !target || target.hpCurrent <= 0) {
      return;
    }

    const restored = rollDice(8).total + 3;
    const nextCombatants = combatants.map((combatant) =>
      combatant.id === targetId
        ? {
            ...combatant,
            hpCurrent: Math.min(combatant.hpMax, combatant.hpCurrent + restored),
          }
        : combatant,
    );

    setCombatants(nextCombatants);
    addLog(actor.name, "heal", `${actor.name} restaurou ${restored} HP para ${target.name}.`);
    advanceCombat(nextCombatants);
  };

  const currentCombatant = combatants[currentTurn];
  const alivePlayers = combatants.filter((combatant) => !combatant.isNpc && combatant.hpCurrent > 0);
  const aliveEnemies = combatants.filter((combatant) => combatant.isNpc && combatant.hpCurrent > 0);

  return (
    <div className="space-y-6">
      <Card variant="elevated">
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                <div className="icon-slot h-12 w-12 text-primary">
                  <Swords className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Controle de combate</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Iniciativa automatica, HP semantico, log de rodada e acoes de ataque ou cura.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <DataSection label="Aliados vivos" value={alivePlayers.length} variant="quiet" />
              <DataSection label="Inimigos vivos" value={aliveEnemies.length} variant="quiet" />
              <DataSection label="Rodada" value={round} variant="quiet" />
            </div>
          </div>
        </CardHeader>
      </Card>

      {!combatActive ? (
        <Alert variant="info">
          <Sparkles />
          <AlertTitle>Preparacao de encontro</AlertTitle>
          <AlertDescription>
            Carregue um confronto salvo ou cadastre NPCs antes de iniciar a ordem de iniciativa.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="warning">
          <Clock3 />
          <AlertTitle>Combate ativo</AlertTitle>
          <AlertDescription>
            Rodada {round}. Turno atual: {currentCombatant?.name ?? "Sem combatente"}.
          </AlertDescription>
        </Alert>
      )}

      {!combatActive ? (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
          <Card variant="panel">
            <CardContent className="space-y-4 p-6">
              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_110px_110px_auto]">
                <Input
                  placeholder="Nome do NPC"
                  value={npcName}
                  onChange={(event) => setNpcName(event.target.value)}
                />
                <Input
                  type="number"
                  placeholder="HP"
                  value={npcHp}
                  onChange={(event) => setNpcHp(Number(event.target.value))}
                />
                <Input
                  type="number"
                  placeholder="CA"
                  value={npcAc}
                  onChange={(event) => setNpcAc(Number(event.target.value))}
                />
                <Button onClick={addNpc}>Adicionar NPC</Button>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <DataSection
                  label="Fila atual"
                  value={combatants.length}
                  icon={<Users className="h-4 w-4" />}
                  variant="quiet"
                />
                <DataSection
                  label="Prontos para iniciar"
                  value={combatants.length >= 2 ? "Sim" : "Nao"}
                  tone={combatants.length >= 2 ? "good" : "warn"}
                  variant="quiet"
                />
                <DataSection
                  label="Modo"
                  value="Narrativo"
                  icon={<Sparkles className="h-4 w-4" />}
                  variant="quiet"
                />
              </div>
            </CardContent>
          </Card>

          <Card variant="panel">
            <CardContent className="space-y-3 p-6">
              <Button variant="secondary" className="w-full" onClick={addSampleEncounter}>
                Carregar encontro salvo
              </Button>
              <Button
                className="w-full"
                onClick={startCombat}
                disabled={combatants.length < 2}
              >
                Iniciar combate
              </Button>
              <p className="text-sm leading-6 text-muted-foreground">
                O sistema ordena a iniciativa automaticamente e sinaliza HP em bom estado, alerta ou zona critica.
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card variant="panel">
          <CardContent className="flex flex-col gap-3 p-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="info">Rodada {round}</Badge>
              <Badge variant={currentCombatant?.isNpc ? "danger" : "success"}>
                {currentCombatant?.isNpc ? "NPC ativo" : "Jogador ativo"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {currentCombatant?.name ?? "Sem combatente"} esta com a vez.
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={nextTurn}>
                Pular turno
              </Button>
              <Button variant="danger" onClick={() => setConfirmStopOpen(true)}>
                Encerrar combate
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {combatants.length === 0 ? (
          <Card variant="outline">
            <CardContent className="p-10 text-center text-sm text-muted-foreground">
              Adicione combatentes para montar a ordem de iniciativa.
            </CardContent>
          </Card>
        ) : (
          combatants.map((combatant, index) => {
            const hpPercent = combatant.hpMax > 0 ? (combatant.hpCurrent / combatant.hpMax) * 100 : 0;
            const hpTone = getResourceTone(hpPercent);
            const isCurrent = combatActive && index === currentTurn;
            const isDefeated = combatant.hpCurrent <= 0;
            const enemyTargets = combatants.filter(
              (target) =>
                target.id !== combatant.id &&
                target.hpCurrent > 0 &&
                target.isNpc !== combatant.isNpc,
            );
            const allyTargets = combatants.filter(
              (target) =>
                target.id !== combatant.id &&
                target.hpCurrent > 0 &&
                target.hpCurrent < target.hpMax &&
                target.isNpc === combatant.isNpc,
            );

            return (
              <motion.div
                key={combatant.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card variant={isCurrent ? "elevated" : isDefeated ? "outline" : "panel"}>
                  <CardContent className="space-y-4 p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline">Ini {combatant.initiative}</Badge>
                          <Badge variant={combatant.isNpc ? "danger" : "success"}>
                            {combatant.isNpc ? "NPC" : "Jogador"}
                          </Badge>
                          <Badge variant={hpTone === "good" ? "success" : hpTone === "warn" ? "warning" : "danger"}>
                            {isDefeated ? "Derrotado" : hpTone === "good" ? "Estavel" : hpTone === "warn" ? "Ferido" : "Critico"}
                          </Badge>
                        </div>

                        <div>
                          <h3 className="font-heading text-xl text-foreground">{combatant.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {combatant.conditions.length > 0
                              ? combatant.conditions.join(" | ")
                              : "Sem condicoes registradas."}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        <DataSection
                          label="Vida"
                          value={`${combatant.hpCurrent} / ${combatant.hpMax}`}
                          icon={<Heart className="h-4 w-4" />}
                          tone={hpTone}
                          variant="quiet"
                        >
                          <Progress value={hpPercent} tone={hpTone} />
                        </DataSection>
                        <DataSection
                          label="Armadura"
                          value={`CA ${combatant.ac}`}
                          icon={<Shield className="h-4 w-4" />}
                          variant="quiet"
                        />
                        <DataSection
                          label="Estado"
                          value={isDefeated ? "Fora de combate" : isCurrent ? "Agindo agora" : "Aguardando"}
                          icon={isDefeated ? <Skull className="h-4 w-4" /> : <UserRound className="h-4 w-4" />}
                          tone={isDefeated ? "bad" : isCurrent ? "info" : "neutral"}
                          variant="quiet"
                        />
                      </div>
                    </div>

                    <AnimatePresence initial={false}>
                      {isCurrent && !isDefeated ? (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden border-t border-border/70 pt-4"
                        >
                          <div className="flex flex-wrap gap-2">
                            {enemyTargets.map((target) => (
                              <Button
                                key={target.id}
                                size="sm"
                                variant="danger"
                                onClick={() => attack(target.id)}
                              >
                                Atacar {target.name}
                              </Button>
                            ))}
                            {allyTargets.map((target) => (
                              <Button
                                key={`heal-${target.id}`}
                                size="sm"
                                variant="success"
                                onClick={() => heal(target.id)}
                              >
                                Curar {target.name}
                              </Button>
                            ))}
                            <Button size="sm" variant="outline" onClick={nextTurn}>
                              Passar vez
                            </Button>
                          </div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>

      {battleLog.length > 0 ? (
        <Card variant="panel">
          <CardHeader>
            <CardTitle className="text-xl">Log de batalha</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {battleLog.map((entry) => (
              <div
                key={entry.id}
                className="info-panel flex flex-col gap-2 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-sm text-foreground">{entry.description}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Rodada {entry.round} | {entry.actor}
                  </p>
                </div>
                <Badge variant={getLogVariant(entry.type)}>{entry.type}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <ConfirmActionDialog
        open={confirmStopOpen}
        onOpenChange={setConfirmStopOpen}
        title="Encerrar combate?"
        description="Esta acao para a rodada atual e preserva o log ja registrado."
        confirmLabel="Encerrar"
        pendingLabel="Encerrando..."
        onConfirm={async () => {
          setCombatActive(false);
          addLog("Sistema", "end", "Combate encerrado manualmente.");
          setConfirmStopOpen(false);
        }}
      />
    </div>
  );
}
