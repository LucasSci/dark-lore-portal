import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dice6 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { rollDice } from "@/lib/rpg-utils";

const DICE_TYPES = [
  { sides: 4, label: "d4", icon: "◆" },
  { sides: 6, label: "d6", icon: "⬡" },
  { sides: 8, label: "d8", icon: "◈" },
  { sides: 10, label: "d10", icon: "⬠" },
  { sides: 12, label: "d12", icon: "⬟" },
  { sides: 20, label: "d20", icon: "⯁" },
];

interface RollResult {
  id: number;
  dice: string;
  results: number[];
  total: number;
  timestamp: Date;
}

export default function DiceRoller() {
  const [rolls, setRolls] = useState<RollResult[]>([]);
  const [numDice, setNumDice] = useState(1);
  const [modifier, setModifier] = useState(0);
  const [isRolling, setIsRolling] = useState(false);

  const handleRoll = (sides: number, label: string) => {
    setIsRolling(true);
    setTimeout(() => {
      const { results, total } = rollDice(sides, numDice);
      const finalTotal = total + modifier;
      setRolls(prev => [{
        id: Date.now(),
        dice: `${numDice}${label}${modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ''}`,
        results,
        total: finalTotal,
        timestamp: new Date(),
      }, ...prev.slice(0, 19)]);
      setIsRolling(false);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Dice Selection */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {DICE_TYPES.map(d => (
          <motion.button
            key={d.sides}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleRoll(d.sides, d.label)}
            disabled={isRolling}
            className="p-4 bg-card-gradient border border-gold/10 hover:border-gold/40 transition-all flex flex-col items-center gap-2 group disabled:opacity-50"
          >
            <span className="text-2xl group-hover:animate-float">{d.icon}</span>
            <span className="font-heading text-sm text-foreground">{d.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 justify-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Qtd:</span>
          <div className="flex items-center border border-border rounded">
            <Button variant="ghost" size="sm" onClick={() => setNumDice(Math.max(1, numDice - 1))} className="h-8 w-8 p-0">-</Button>
            <span className="w-8 text-center font-heading text-foreground">{numDice}</span>
            <Button variant="ghost" size="sm" onClick={() => setNumDice(Math.min(10, numDice + 1))} className="h-8 w-8 p-0">+</Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Mod:</span>
          <div className="flex items-center border border-border rounded">
            <Button variant="ghost" size="sm" onClick={() => setModifier(modifier - 1)} className="h-8 w-8 p-0">-</Button>
            <span className="w-8 text-center font-heading text-foreground">{modifier >= 0 ? `+${modifier}` : modifier}</span>
            <Button variant="ghost" size="sm" onClick={() => setModifier(modifier + 1)} className="h-8 w-8 p-0">+</Button>
          </div>
        </div>
      </div>

      {/* Rolling Animation */}
      <AnimatePresence>
        {isRolling && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1, rotate: [0, 360, 720] }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="flex justify-center py-8"
          >
            <Dice6 className="w-16 h-16 text-primary animate-glow-pulse" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-dark">
        <AnimatePresence>
          {rolls.map((roll, i) => (
            <motion.div
              key={roll.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: i * 0.02 }}
              className="flex items-center justify-between p-3 bg-card-gradient border border-border/50 rounded-sm"
            >
              <div className="flex items-center gap-3">
                <span className="font-heading text-sm text-primary">{roll.dice}</span>
                <span className="text-xs text-muted-foreground">
                  [{roll.results.join(', ')}]
                </span>
              </div>
              <span className={`font-heading text-lg ${roll.total >= 20 ? 'text-gold-light' : roll.total <= 1 ? 'text-blood-light' : 'text-foreground'}`}>
                {roll.total}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
