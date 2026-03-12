import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sword, Shield, Heart, Zap, SkullIcon, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { rollDice, formatModifier } from "@/lib/rpg-utils";

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
  id: number;
  round: number;
  actor: string;
  type: string;
  description: string;
  damage?: number;
  roll?: string;
  result?: number;
}

export default function CombatTracker() {
  const [combatants, setCombatants] = useState<Combatant[]>([]);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [round, setRound] = useState(1);
  const [combatActive, setCombatActive] = useState(false);
  const [battleLog, setBattleLog] = useState<LogEntry[]>([]);

  // Add NPC form
  const [npcName, setNpcName] = useState("");
  const [npcHp, setNpcHp] = useState(20);
  const [npcAc, setNpcAc] = useState(12);

  const addNpc = () => {
    if (!npcName) return;
    const { total } = rollDice(20);
    setCombatants(prev => [...prev, {
      id: `npc-${Date.now()}`,
      name: npcName,
      initiative: total,
      hpCurrent: npcHp,
      hpMax: npcHp,
      ac: npcAc,
      isNpc: true,
      conditions: [],
    }].sort((a, b) => b.initiative - a.initiative));
    setNpcName("");
  };

  const addSampleParty = () => {
    const party: Combatant[] = [
      { id: 'p1', name: 'Thorin (Guerreiro)', initiative: rollDice(20).total + 2, hpCurrent: 45, hpMax: 45, ac: 18, isNpc: false, conditions: [] },
      { id: 'p2', name: 'Elara (Maga)', initiative: rollDice(20).total + 3, hpCurrent: 22, hpMax: 22, ac: 12, isNpc: false, conditions: [] },
      { id: 'p3', name: 'Grimshaw (Clérigo)', initiative: rollDice(20).total + 1, hpCurrent: 32, hpMax: 32, ac: 16, isNpc: false, conditions: [] },
    ];
    const enemies: Combatant[] = [
      { id: 'e1', name: 'Goblin Líder', initiative: rollDice(20).total + 3, hpCurrent: 35, hpMax: 35, ac: 15, isNpc: true, conditions: [] },
      { id: 'e2', name: 'Goblin Soldado', initiative: rollDice(20).total + 2, hpCurrent: 15, hpMax: 15, ac: 13, isNpc: true, conditions: [] },
      { id: 'e3', name: 'Goblin Soldado', initiative: rollDice(20).total + 2, hpCurrent: 15, hpMax: 15, ac: 13, isNpc: true, conditions: [] },
    ];
    setCombatants([...party, ...enemies].sort((a, b) => b.initiative - a.initiative));
    setCombatActive(true);
    setRound(1);
    setCurrentTurn(0);
    addLog('Sistema', 'inicio', 'Combate iniciado!');
  };

  const startCombat = () => {
    if (combatants.length < 2) return;
    setCombatActive(true);
    setRound(1);
    setCurrentTurn(0);
    addLog('Sistema', 'inicio', 'Combate iniciado!');
  };

  const nextTurn = () => {
    const alive = combatants.filter(c => c.hpCurrent > 0);
    if (alive.length <= 1) {
      setCombatActive(false);
      addLog('Sistema', 'fim', `Combate finalizado! ${alive[0]?.name || 'Ninguém'} venceu!`);
      return;
    }
    let next = currentTurn + 1;
    if (next >= combatants.length) {
      next = 0;
      setRound(r => r + 1);
      addLog('Sistema', 'rodada', `Rodada ${round + 1}`);
    }
    // Skip dead
    while (combatants[next]?.hpCurrent <= 0 && next < combatants.length) {
      next++;
      if (next >= combatants.length) {
        next = 0;
        setRound(r => r + 1);
      }
    }
    setCurrentTurn(next);
  };

  const attack = (targetId: string) => {
    const attacker = combatants[currentTurn];
    if (!attacker) return;
    const target = combatants.find(c => c.id === targetId);
    if (!target || target.hpCurrent <= 0) return;

    const atkRoll = rollDice(20).total;
    const hit = atkRoll >= target.ac;

    if (hit) {
      const dmgRoll = rollDice(8).total;
      setCombatants(prev => prev.map(c =>
        c.id === targetId ? { ...c, hpCurrent: Math.max(0, c.hpCurrent - dmgRoll) } : c
      ));
      addLog(attacker.name, 'ataque', `atacou ${target.name} e acertou! (d20: ${atkRoll} vs CA ${target.ac}) → ${dmgRoll} de dano`, dmgRoll, `d20`, atkRoll);
      if (target.hpCurrent - dmgRoll <= 0) {
        addLog('Sistema', 'morte', `${target.name} foi derrotado!`);
      }
    } else {
      addLog(attacker.name, 'ataque', `atacou ${target.name} mas errou! (d20: ${atkRoll} vs CA ${target.ac})`, undefined, `d20`, atkRoll);
    }
    nextTurn();
  };

  const heal = (targetId: string) => {
    const healer = combatants[currentTurn];
    const target = combatants.find(c => c.id === targetId);
    if (!target) return;
    const healRoll = rollDice(8).total + 3;
    setCombatants(prev => prev.map(c =>
      c.id === targetId ? { ...c, hpCurrent: Math.min(c.hpMax, c.hpCurrent + healRoll) } : c
    ));
    addLog(healer?.name || 'Desconhecido', 'cura', `curou ${target.name} por ${healRoll} HP`, healRoll);
    nextTurn();
  };

  const addLog = (actor: string, type: string, description: string, damage?: number, diceRoll?: string, result?: number) => {
    setBattleLog(prev => [{
      id: Date.now(),
      round,
      actor,
      type,
      description,
      damage,
      roll: diceRoll,
      result,
    }, ...prev]);
  };

  const current = combatants[currentTurn];

  return (
    <div className="space-y-6">
      {/* Controls */}
      {!combatActive && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={addSampleParty} variant="outline" className="flex-1">
              <Sword className="w-4 h-4 mr-2" /> Carregar Combate Demo
            </Button>
            {combatants.length >= 2 && (
              <Button onClick={startCombat} className="flex-1">
                <Zap className="w-4 h-4 mr-2" /> Iniciar Combate
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Input placeholder="Nome do NPC" value={npcName} onChange={e => setNpcName(e.target.value)} className="bg-secondary text-foreground" />
            <Input type="number" placeholder="HP" value={npcHp} onChange={e => setNpcHp(+e.target.value)} className="w-20 bg-secondary text-foreground" />
            <Input type="number" placeholder="CA" value={npcAc} onChange={e => setNpcAc(+e.target.value)} className="w-20 bg-secondary text-foreground" />
            <Button onClick={addNpc} variant="outline">+</Button>
          </div>
        </div>
      )}

      {/* Round info */}
      {combatActive && (
        <div className="flex items-center justify-between p-3 bg-card-gradient border border-gold/20">
          <span className="font-heading text-sm text-primary">Rodada {round}</span>
          <span className="font-heading text-sm text-foreground">Turno: {current?.name}</span>
        </div>
      )}

      {/* Initiative Order */}
      <div className="space-y-2">
        {combatants.map((c, i) => {
          const hpPercent = (c.hpCurrent / c.hpMax) * 100;
          const isDead = c.hpCurrent <= 0;
          const isCurrent = combatActive && i === currentTurn;

          return (
            <motion.div
              key={c.id}
              layout
              className={`p-3 border transition-all ${isCurrent ? 'border-primary bg-primary/5 glow-gold' : isDead ? 'border-border/30 opacity-40' : 'border-border bg-card-gradient'}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-heading text-xs text-muted-foreground w-6">{c.initiative}</span>
                  {isDead ? <SkullIcon className="w-4 h-4 text-blood" /> : c.isNpc ? <Sword className="w-4 h-4 text-blood-light" /> : <Shield className="w-4 h-4 text-primary" />}
                  <span className={`font-heading text-sm ${c.isNpc ? 'text-blood-light' : 'text-foreground'}`}>{c.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground">HP</span>
                    <p className="font-heading text-sm text-foreground">{c.hpCurrent}/{c.hpMax}</p>
                    <div className="w-20 h-1 bg-secondary rounded-full overflow-hidden">
                      <div className={`h-full transition-all ${hpPercent > 50 ? 'bg-green-500' : hpPercent > 25 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${hpPercent}%` }} />
                    </div>
                  </div>
                  <span className="font-heading text-xs text-muted-foreground">CA {c.ac}</span>
                </div>
              </div>

              {/* Actions for current turn */}
              {isCurrent && !isDead && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="mt-3 pt-3 border-t border-border flex flex-wrap gap-2">
                  {combatants.filter(t => t.id !== c.id && t.hpCurrent > 0 && t.isNpc !== c.isNpc).map(target => (
                    <Button key={target.id} size="sm" variant="destructive" onClick={() => attack(target.id)}>
                      <Sword className="w-3 h-3 mr-1" /> Atacar {target.name}
                    </Button>
                  ))}
                  {combatants.filter(t => t.hpCurrent > 0 && t.hpCurrent < t.hpMax && !t.isNpc).map(target => (
                    <Button key={`heal-${target.id}`} size="sm" variant="outline" onClick={() => heal(target.id)}>
                      <Heart className="w-3 h-3 mr-1" /> Curar {target.name}
                    </Button>
                  ))}
                  <Button size="sm" variant="ghost" onClick={nextTurn}>Pular Turno</Button>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Battle Log */}
      {battleLog.length > 0 && (
        <div className="border border-border bg-card-gradient">
          <div className="p-3 border-b border-border flex items-center gap-2">
            <ScrollText className="w-4 h-4 text-primary" />
            <span className="font-heading text-sm text-foreground">Log de Batalha</span>
          </div>
          <div className="max-h-48 overflow-y-auto scrollbar-dark p-3 space-y-1">
            {battleLog.map(entry => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xs"
              >
                <span className="text-muted-foreground">[R{entry.round}]</span>{' '}
                <span className={entry.type === 'morte' ? 'text-blood-light' : entry.type === 'cura' ? 'text-green-400' : entry.type === 'ataque' ? 'text-ember' : 'text-muted-foreground'}>
                  {entry.description}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
