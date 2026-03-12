import { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { RACES, CLASSES, ATTRIBUTES, getModifier, formatModifier, rollDice, calculateHP, calculateMP, calculateAC } from "@/lib/rpg-utils";
import type { AttributeKey } from "@/lib/rpg-utils";

interface CharacterData {
  name: string;
  race: string;
  class: string;
  attributes: Record<AttributeKey, number>;
  background: string;
  appearance: string;
}

interface Props {
  onSave?: (data: CharacterData) => void;
}

const STEPS = ["Identidade", "Raça", "Classe", "Atributos", "História"];

export default function CharacterCreator({ onSave }: Props) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<CharacterData>({
    name: "",
    race: "humano",
    class: "guerreiro",
    attributes: { forca: 10, destreza: 10, constituicao: 10, inteligencia: 10, sabedoria: 10, carisma: 10 },
    background: "",
    appearance: "",
  });

  const pointsUsed = Object.values(data.attributes).reduce((sum, v) => sum + Math.max(0, v - 8), 0);
  const pointBudget = 27;

  const setAttr = (key: AttributeKey, delta: number) => {
    setData(prev => {
      const newVal = prev.attributes[key] + delta;
      if (newVal < 8 || newVal > 15) return prev;
      const cost = Object.entries(prev.attributes).reduce((sum, [k, v]) => {
        const val = k === key ? newVal : v;
        return sum + Math.max(0, val - 8);
      }, 0);
      if (cost > pointBudget) return prev;
      return { ...prev, attributes: { ...prev.attributes, [key]: newVal } };
    });
  };

  const randomizeAttributes = () => {
    const roll4d6 = () => {
      const { results } = rollDice(6, 4);
      return results.sort((a, b) => b - a).slice(0, 3).reduce((a, b) => a + b, 0);
    };
    const attrs: Record<string, number> = {};
    ATTRIBUTES.forEach(a => { attrs[a.key] = roll4d6(); });
    setData(prev => ({ ...prev, attributes: attrs as Record<AttributeKey, number> }));
  };

  const selectedClass = CLASSES.find(c => c.value === data.class);
  const conMod = getModifier(data.attributes.constituicao);
  const dexMod = getModifier(data.attributes.destreza);
  const hp = calculateHP(data.class, conMod, 1);
  const mp = calculateMP(data.class, getModifier(data.attributes[selectedClass?.primaryAttr as AttributeKey] || 10));
  const ac = calculateAC(dexMod);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Progress Steps */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <button
            key={s}
            onClick={() => setStep(i)}
            className={`flex-1 text-center py-2 font-heading text-xs tracking-wider uppercase border-b-2 transition-colors ${i === step ? 'border-primary text-primary' : i < step ? 'border-gold/30 text-foreground' : 'border-border text-muted-foreground'}`}
          >
            {s}
          </button>
        ))}
      </div>

      <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
        {step === 0 && (
          <div className="space-y-4">
            <Label className="font-heading text-foreground">Nome do Personagem</Label>
            <Input
              value={data.name}
              onChange={e => setData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Thorin Escudo de Ferro"
              className="bg-secondary border-border font-body text-foreground"
            />
          </div>
        )}

        {step === 1 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {RACES.map(r => (
              <motion.button
                key={r.value}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setData(prev => ({ ...prev, race: r.value }))}
                className={`p-4 border transition-all text-left ${data.race === r.value ? 'border-primary bg-primary/10 glow-gold' : 'border-border bg-card-gradient hover:border-gold/30'}`}
              >
                <h4 className="font-heading text-sm text-foreground">{r.label}</h4>
                <p className="text-xs text-muted-foreground mt-1">{r.desc}</p>
              </motion.button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {CLASSES.map(c => (
              <motion.button
                key={c.value}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setData(prev => ({ ...prev, class: c.value }))}
                className={`p-4 border transition-all text-left ${data.class === c.value ? 'border-primary bg-primary/10 glow-gold' : 'border-border bg-card-gradient hover:border-gold/30'}`}
              >
                <h4 className="font-heading text-sm text-foreground">{c.label}</h4>
                <p className="text-xs text-muted-foreground mt-1">HP: d{c.hitDie} · MP: {c.mpBase}</p>
              </motion.button>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-heading text-sm text-foreground">Pontos: {pointsUsed}/{pointBudget}</span>
              <Button variant="outline" size="sm" onClick={randomizeAttributes}>
                <Shuffle className="w-4 h-4 mr-1" /> 4d6 Drop Lowest
              </Button>
            </div>
            <Progress value={(pointsUsed / pointBudget) * 100} className="h-2" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {ATTRIBUTES.map(attr => {
                const val = data.attributes[attr.key];
                const mod = getModifier(val);
                return (
                  <div key={attr.key} className="p-4 bg-card-gradient border border-border rounded-sm text-center space-y-2">
                    <span className="text-lg">{attr.icon}</span>
                    <h4 className="font-heading text-xs tracking-wider uppercase text-muted-foreground">{attr.label}</h4>
                    <div className="flex items-center justify-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setAttr(attr.key, -1)} className="h-7 w-7 p-0">-</Button>
                      <span className="font-heading text-2xl text-foreground w-8">{val}</span>
                      <Button variant="ghost" size="sm" onClick={() => setAttr(attr.key, 1)} className="h-7 w-7 p-0">+</Button>
                    </div>
                    <span className={`font-heading text-sm ${mod >= 0 ? 'text-primary' : 'text-blood-light'}`}>
                      {formatModifier(mod)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div>
              <Label className="font-heading text-foreground">História de Fundo</Label>
              <Textarea
                value={data.background}
                onChange={e => setData(prev => ({ ...prev, background: e.target.value }))}
                placeholder="Conte a história do seu personagem..."
                className="bg-secondary border-border mt-2 min-h-[100px] font-body text-foreground"
              />
            </div>
            <div>
              <Label className="font-heading text-foreground">Aparência</Label>
              <Textarea
                value={data.appearance}
                onChange={e => setData(prev => ({ ...prev, appearance: e.target.value }))}
                placeholder="Descreva a aparência do seu personagem..."
                className="bg-secondary border-border mt-2 min-h-[80px] font-body text-foreground"
              />
            </div>

            {/* Summary */}
            <div className="p-6 bg-card-gradient border border-gold/20 space-y-3">
              <h3 className="font-heading text-lg text-gold-gradient">Resumo</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground">Nome:</span> <span className="text-foreground">{data.name || '—'}</span></div>
                <div><span className="text-muted-foreground">Raça:</span> <span className="text-foreground">{RACES.find(r => r.value === data.race)?.label}</span></div>
                <div><span className="text-muted-foreground">Classe:</span> <span className="text-foreground">{selectedClass?.label}</span></div>
                <div><span className="text-muted-foreground">HP:</span> <span className="text-blood-light">{hp}</span></div>
                <div><span className="text-muted-foreground">MP:</span> <span className="text-mystic-light">{mp}</span></div>
                <div><span className="text-muted-foreground">CA:</span> <span className="text-foreground">{ac}</span></div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
          Anterior
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep(step + 1)}>Próximo</Button>
        ) : (
          <Button onClick={() => onSave?.(data)} disabled={!data.name}>
            <UserPlus className="w-4 h-4 mr-2" /> Criar Personagem
          </Button>
        )}
      </div>
    </div>
  );
}
