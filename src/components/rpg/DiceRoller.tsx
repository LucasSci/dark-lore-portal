import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Dices } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { rollDice } from "@/lib/rpg-utils";

const DICE_TYPES = [
  { sides: 4, label: "d4" },
  { sides: 6, label: "d6" },
  { sides: 8, label: "d8" },
  { sides: 10, label: "d10" },
  { sides: 12, label: "d12" },
  { sides: 20, label: "d20" },
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

    window.setTimeout(() => {
      const { results, total } = rollDice(sides, numDice);
      const finalTotal = total + modifier;

      setRolls((previous) => [
        {
          id: Date.now(),
          dice: `${numDice}${label}${modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ""}`,
          results,
          total: finalTotal,
          timestamp: new Date(),
        },
        ...previous.slice(0, 19),
      ]);

      setIsRolling(false);
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
        {DICE_TYPES.map((dice) => (
          <motion.button
            key={dice.sides}
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleRoll(dice.sides, dice.label)}
            disabled={isRolling}
            className="info-panel flex flex-col items-center gap-2 p-4 text-center transition-colors hover:border-primary/30 disabled:opacity-50"
          >
            <span className="font-display text-2xl text-gold-gradient">{dice.label}</span>
            <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {dice.sides} lados
            </span>
          </motion.button>
        ))}
      </div>

      <Card variant="panel">
        <CardContent className="flex flex-wrap items-center justify-center gap-4 p-5">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Qtd</span>
            <div className="metric-panel flex items-center">
              <Button variant="ghost" size="sm" onClick={() => setNumDice(Math.max(1, numDice - 1))} className="h-8 w-8 p-0" aria-label="Diminuir quantidade" title="Diminuir quantidade">
                -
              </Button>
              <span className="w-8 text-center font-heading text-foreground">{numDice}</span>
              <Button variant="ghost" size="sm" onClick={() => setNumDice(Math.min(10, numDice + 1))} className="h-8 w-8 p-0" aria-label="Aumentar quantidade" title="Aumentar quantidade">
                +
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Mod</span>
            <div className="metric-panel flex items-center">
              <Button variant="ghost" size="sm" onClick={() => setModifier((previous) => previous - 1)} className="h-8 w-8 p-0" aria-label="Diminuir modificador" title="Diminuir modificador">
                -
              </Button>
              <span className="w-10 text-center font-heading text-foreground">
                {modifier >= 0 ? `+${modifier}` : modifier}
              </span>
              <Button variant="ghost" size="sm" onClick={() => setModifier((previous) => previous + 1)} className="h-8 w-8 p-0" aria-label="Aumentar modificador" title="Aumentar modificador">
                +
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {isRolling ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1, rotate: [0, 180, 360] }}
            exit={{ opacity: 0, scale: 0.6 }}
            className="flex justify-center py-4"
          >
            <Dices className="h-14 w-14 text-primary animate-glow-pulse" />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="max-h-72 space-y-2 overflow-y-auto scrollbar-dark">
        <AnimatePresence>
          {rolls.map((roll, index) => (
            <motion.div
              key={roll.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: index * 0.02 }}
            >
              <Card variant="panel">
                <CardContent className="flex items-center justify-between gap-3 p-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{roll.dice}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {roll.timestamp.toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">[{roll.results.join(", ")}]</p>
                  </div>

                  <span
                    className={`font-heading text-2xl ${
                      roll.total >= 20 ? "text-success" : roll.total <= 1 ? "text-status-bad" : "text-foreground"
                    }`}
                  >
                    {roll.total}
                  </span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
