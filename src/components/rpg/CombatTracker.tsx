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

import ConfirmActionDialog from "@/components/ui/confirm-action-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataSection } from "@/components/ui/data-section";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { getHitLocation, getSimpleCritical, rollDice, rollDiceFormula } from "@/lib/rpg-utils";
import { getResourceTone } from "@/lib/rpg-ui";

interface Combatant {
  id: string;
  name: string;
  initiative: number;
  hpCurrent: number;
  hpMax: number;
  defense: number;
  attack: number;
  damage: string;
  weapon: string;
  isNpc: boolean;
  conditions: string[];
}

interface LogEntry {
  id: number;
  round: number;
  actor: string;
  type: "start" | "round" | "attack" | "recover" | "defeat" | "end";
  description: string;
}

function sortCombatants(list: Combatant[]) {
  return [...list].sort((left, right) => right.initiative - left.initiative);
}

function getLogVariant(type: LogEntry["type"]) {
  if (type === "recover") {
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
  const [npcDefense, setNpcDefense] = useState(12);
  const [npcAttack, setNpcAttack] = useState(8);
  const [npcDamage, setNpcDamage] = useState("2d6+2");
  const [confirmStopOpen, setConfirmStopOpen] = useState(false);

  const addLog = (actor: string, type: LogEntry["type"], description: string, roundOverride = round) => {
    setBattleLog((previous) => [
      {
        id: Date.now() + previous.length,
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

    const initiative = rollDice(10).total + npcAttack;
    const nextCombatants = sortCombatants([
      ...combatants,
      {
        id: `npc-${Date.now()}`,
        name: safeName,
        initiative,
        hpCurrent: npcHp,
        hpMax: npcHp,
        defense: npcDefense,
        attack: npcAttack,
        damage: npcDamage,
        weapon: "Garras",
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
        name: "Vael de Vizima",
        initiative: rollDice(10).total + 14,
        hpCurrent: 40,
        hpMax: 40,
        defense: 16,
        attack: 14,
        damage: "3d6+2",
        weapon: "Espada de aco",
        isNpc: false,
        conditions: ["Medalhao vibrando"],
      },
      {
        id: "hero-2",
        name: "Nimue da Torre",
        initiative: rollDice(10).total + 11,
        hpCurrent: 28,
        hpMax: 28,
        defense: 13,
        attack: 11,
        damage: "2d6",
        weapon: "Raio de Tempestade",
        isNpc: false,
        conditions: ["Foco arcano"],
      },
      {
        id: "hero-3",
        name: "Saskia de Ellander",
        initiative: rollDice(10).total + 10,
        hpCurrent: 34,
        hpMax: 34,
        defense: 14,
        attack: 10,
        damage: "2d6+1",
        weapon: "Lanca curta",
        isNpc: false,
        conditions: ["Linha de frente"],
      },
    ];

    const enemies: Combatant[] = [
      {
        id: "enemy-1",
        name: "Necrifago alfa",
        initiative: rollDice(10).total + 10,
        hpCurrent: 36,
        hpMax: 36,
        defense: 13,
        attack: 10,
        damage: "3d6",
        weapon: "Garras",
        isNpc: true,
        conditions: ["Cheiro de cripta"],
      },
      {
        id: "enemy-2",
        name: "Afogador",
        initiative: rollDice(10).total + 8,
        hpCurrent: 18,
        hpMax: 18,
        defense: 11,
        attack: 8,
        damage: "2d6+1",
        weapon: "Mordida",
        isNpc: true,
        conditions: [],
      },
      {
        id: "enemy-3",
        name: "Afogador",
        initiative: rollDice(10).total + 8,
        hpCurrent: 18,
        hpMax: 18,
        defense: 11,
        attack: 8,
        damage: "2d6+1",
        weapon: "Mordida",
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
    addLog("Sistema", "start", "Encontro Witcher iniciado.", 1);
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
        alive[0] ? `${alive[0].name} permaneceu de pe ao fim do confronto.` : "O confronto terminou sem sobreviventes.",
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

    const rawAttack = rollDice(10).total;
    const attackTotal = rawAttack + attacker.attack;
    const hit = attackTotal >= target.defense;

    if (!hit) {
      addLog(
        attacker.name,
        "attack",
        `${attacker.name} errou ${target.name}: ${attackTotal} contra defesa ${target.defense}.`,
      );
      advanceCombat(combatants);
      return;
    }

    const damageRoll = rollDiceFormula(attacker.damage);
    const location = getHitLocation(rollDice(10).total);
    const critical = rawAttack === 10 ? getSimpleCritical(rollDice(10).total) : null;
    const totalDamage = Math.max(
      1,
      Math.ceil(damageRoll.total * (location?.damageMultiplier ?? 1)) + (critical ? 2 : 0),
    );

    const nextCombatants = combatants.map((combatant) =>
      combatant.id === targetId
        ? { ...combatant, hpCurrent: Math.max(0, combatant.hpCurrent - totalDamage) }
        : combatant,
    );

    setCombatants(nextCombatants);
    addLog(
      attacker.name,
      "attack",
      `${attacker.name} acertou ${target.name} com ${attacker.weapon} (${attackTotal}). Local: ${
        location?.label ?? "torso"
      }. Dano: ${totalDamage}.${critical ? ` Critico: ${critical.title}.` : ""}`,
    );

    if (target.hpCurrent - totalDamage <= 0) {
      addLog("Sistema", "defeat", `${target.name} caiu em combate.`);
    }

    advanceCombat(nextCombatants);
  };

  const recover = () => {
    const actor = combatants[currentTurn];

    if (!actor || actor.hpCurrent <= 0) {
      return;
    }

    const restored = rollDiceFormula("1d6+2").total;
    const nextCombatants = combatants.map((combatant) =>
      combatant.id === actor.id
        ? {
            ...combatant,
            hpCurrent: Math.min(combatant.hpMax, combatant.hpCurrent + restored),
          }
        : combatant,
    );

    setCombatants(nextCombatants);
    addLog(actor.name, "recover", `${actor.name} recompôs o fôlego e recuperou ${restored} pontos de vida.`);
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
                    Ordem de iniciativa em d10, local de impacto e registro rapido do confronto.
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
            Cadastre criaturas rapidamente ou carregue um confronto de exemplo para iniciar a mesa.
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
              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_92px_92px_92px_120px_auto]">
                <Input placeholder="Nome da criatura" value={npcName} onChange={(event) => setNpcName(event.target.value)} />
                <Input type="number" placeholder="HP" value={npcHp} onChange={(event) => setNpcHp(Number(event.target.value))} />
                <Input type="number" placeholder="DEF" value={npcDefense} onChange={(event) => setNpcDefense(Number(event.target.value))} />
                <Input type="number" placeholder="ATAQ" value={npcAttack} onChange={(event) => setNpcAttack(Number(event.target.value))} />
                <Input placeholder="2d6+2" value={npcDamage} onChange={(event) => setNpcDamage(event.target.value)} />
                <Button onClick={addNpc}>Adicionar</Button>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <DataSection label="Fila atual" value={combatants.length} icon={<Users className="h-4 w-4" />} variant="quiet" />
                <DataSection
                  label="Prontos para iniciar"
                  value={combatants.length >= 2 ? "Sim" : "Nao"}
                  tone={combatants.length >= 2 ? "good" : "warn"}
                  variant="quiet"
                />
                <DataSection label="Modo" value="Witcher TRPG" icon={<Sparkles className="h-4 w-4" />} variant="quiet" />
              </div>
            </CardContent>
          </Card>

          <Card variant="panel">
            <CardContent className="space-y-3 p-6">
              <Button variant="secondary" className="w-full" onClick={addSampleEncounter}>
                Carregar encontro salvo
              </Button>
              <Button className="w-full" onClick={startCombat} disabled={combatants.length < 2}>
                Iniciar combate
              </Button>
              <p className="text-sm leading-6 text-muted-foreground">
                Os ataques usam d10, a defesa substitui a CA e o log registra locais de impacto.
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
                {currentCombatant?.isNpc ? "Criatura ativa" : "Personagem ativo"}
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
              (target) => target.id !== combatant.id && target.hpCurrent > 0 && target.isNpc !== combatant.isNpc,
            );

            return (
              <motion.div key={combatant.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
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
                            {combatant.weapon} • {combatant.conditions.length > 0 ? combatant.conditions.join(" | ") : "Sem condicoes registradas."}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-4">
                        <DataSection label="Vida" value={`${combatant.hpCurrent} / ${combatant.hpMax}`} icon={<Heart className="h-4 w-4" />} tone={hpTone} variant="quiet">
                          <Progress value={hpPercent} tone={hpTone} />
                        </DataSection>
                        <DataSection label="Defesa" value={combatant.defense} icon={<Shield className="h-4 w-4" />} variant="quiet" />
                        <DataSection label="Ataque" value={`+${combatant.attack}`} icon={<Zap className="h-4 w-4" />} variant="quiet" />
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
                              <Button key={target.id} size="sm" variant="danger" onClick={() => attack(target.id)}>
                                Atacar {target.name}
                              </Button>
                            ))}
                            <Button size="sm" variant="success" onClick={recover}>
                              Recuperar folego
                            </Button>
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
