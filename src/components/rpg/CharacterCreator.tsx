import { useState } from "react";
import { motion } from "framer-motion";
import { Shuffle, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  ATTRIBUTES,
  calculateAC,
  calculateHP,
  calculateMP,
  CLASSES,
  formatModifier,
  getModifier,
  RACES,
  rollDice,
  type AttributeKey,
} from "@/lib/rpg-utils";

export interface CharacterData {
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

const STEPS = ["Identidade", "Raca", "Classe", "Atributos", "Historia"];

export default function CharacterCreator({ onSave }: Props) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<CharacterData>({
    name: "",
    race: "humano",
    class: "guerreiro",
    attributes: {
      forca: 10,
      destreza: 10,
      constituicao: 10,
      inteligencia: 10,
      sabedoria: 10,
      carisma: 10,
    },
    background: "",
    appearance: "",
  });

  const pointsUsed = Object.values(data.attributes).reduce((sum, value) => sum + Math.max(0, value - 8), 0);
  const pointBudget = 27;

  const setAttr = (key: AttributeKey, delta: number) => {
    setData((previous) => {
      const nextValue = previous.attributes[key] + delta;

      if (nextValue < 8 || nextValue > 15) {
        return previous;
      }

      const nextCost = Object.entries(previous.attributes).reduce((sum, [attributeKey, value]) => {
        const score = attributeKey === key ? nextValue : value;
        return sum + Math.max(0, score - 8);
      }, 0);

      if (nextCost > pointBudget) {
        return previous;
      }

      return {
        ...previous,
        attributes: { ...previous.attributes, [key]: nextValue },
      };
    });
  };

  const randomizeAttributes = () => {
    const roll4d6 = () => {
      const { results } = rollDice(6, 4);
      return results.sort((a, b) => b - a).slice(0, 3).reduce((sum, value) => sum + value, 0);
    };

    const nextAttributes = ATTRIBUTES.reduce<Record<AttributeKey, number>>((accumulator, attribute) => {
      accumulator[attribute.key] = roll4d6();
      return accumulator;
    }, {} as Record<AttributeKey, number>);

    setData((previous) => ({ ...previous, attributes: nextAttributes }));
  };

  const selectedClass = CLASSES.find((item) => item.value === data.class);
  const conMod = getModifier(data.attributes.constituicao);
  const dexMod = getModifier(data.attributes.destreza);
  const primaryKey = (selectedClass?.primaryAttr ?? "inteligencia") as AttributeKey;
  const hp = calculateHP(data.class, conMod, 1);
  const mp = calculateMP(data.class, getModifier(data.attributes[primaryKey] ?? 10));
  const ac = calculateAC(dexMod);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="grid gap-2 sm:grid-cols-5">
        {STEPS.map((label, index) => {
          const active = index === step;
          const completed = index < step;

          return (
            <button
              key={label}
              type="button"
              onClick={() => setStep(index)}
              className={`rounded-[calc(var(--radius)-6px)] border px-3 py-2 text-center font-heading text-[11px] uppercase tracking-[0.18em] transition-colors ${
                active
                  ? "border-primary/35 bg-primary/10 text-primary shadow-brand"
                  : completed
                    ? "border-border/70 bg-background/40 text-foreground"
                    : "border-border/60 bg-transparent text-muted-foreground"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {step === 0 ? (
          <Card variant="panel">
            <CardContent className="space-y-4 p-6">
              <div className="space-y-2">
                <Label>Nome do personagem</Label>
                <Input
                  value={data.name}
                  onChange={(event) => setData((previous) => ({ ...previous, name: event.target.value }))}
                  placeholder="Ex: Thorin Escudo de Ferro"
                />
              </div>

              <div className="space-y-2">
                <Label>Aparencia em uma frase</Label>
                <Textarea
                  value={data.appearance}
                  onChange={(event) => setData((previous) => ({ ...previous, appearance: event.target.value }))}
                  placeholder="Ex: Armadura escura, capa de viagem e um olhar que mede todas as saidas."
                  className="min-h-[110px]"
                />
              </div>
            </CardContent>
          </Card>
        ) : null}

        {step === 1 ? (
          <div className="grid gap-3 md:grid-cols-4">
            {RACES.map((race) => (
              <motion.button
                key={race.value}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setData((previous) => ({ ...previous, race: race.value }))}
                className={`rounded-[var(--radius)] border p-4 text-left transition-colors ${
                  data.race === race.value
                    ? "border-primary/35 bg-primary/10 shadow-brand"
                    : "border-border bg-card-gradient hover:border-primary/25"
                }`}
              >
                <h4 className="font-heading text-sm text-foreground">{race.label}</h4>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{race.desc}</p>
              </motion.button>
            ))}
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid gap-3 md:grid-cols-3">
            {CLASSES.map((characterClass) => (
              <motion.button
                key={characterClass.value}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setData((previous) => ({ ...previous, class: characterClass.value }))}
                className={`rounded-[var(--radius)] border p-4 text-left transition-colors ${
                  data.class === characterClass.value
                    ? "border-primary/35 bg-primary/10 shadow-brand"
                    : "border-border bg-card-gradient hover:border-primary/25"
                }`}
              >
                <h4 className="font-heading text-sm text-foreground">{characterClass.label}</h4>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  HP d{characterClass.hitDie} · MP base {characterClass.mpBase}
                </p>
              </motion.button>
            ))}
          </div>
        ) : null}

        {step === 3 ? (
          <Card variant="panel">
            <CardContent className="space-y-6 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-heading text-sm text-foreground">
                    Pontos usados: {pointsUsed}/{pointBudget}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Sistema point-buy com orcamento limitado.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={randomizeAttributes}>
                  <Shuffle className="mr-2 h-4 w-4" />
                  4d6 drop lowest
                </Button>
              </div>

              <Progress value={(pointsUsed / pointBudget) * 100} tone={pointsUsed > pointBudget * 0.7 ? "warn" : "good"} className="h-2" />

              <div className="grid gap-4 md:grid-cols-3">
                {ATTRIBUTES.map((attribute) => {
                  const value = data.attributes[attribute.key];
                  const modifier = getModifier(value);

                  return (
                    <div
                      key={attribute.key}
                      className="rounded-[var(--radius)] border border-border bg-card-gradient p-4 text-center shadow-panel"
                    >
                      <p className="font-heading text-[11px] uppercase tracking-[0.18em] text-primary/80">
                        {attribute.abbr}
                      </p>
                      <h4 className="mt-2 font-heading text-sm text-foreground">{attribute.label}</h4>

                      <div className="mt-3 flex items-center justify-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setAttr(attribute.key, -1)} className="h-8 w-8 p-0">
                          -
                        </Button>
                        <span className="w-10 font-heading text-2xl text-foreground">{value}</span>
                        <Button variant="ghost" size="sm" onClick={() => setAttr(attribute.key, 1)} className="h-8 w-8 p-0">
                          +
                        </Button>
                      </div>

                      <span className={`mt-2 inline-flex font-heading text-sm ${modifier >= 0 ? "text-success" : "text-status-bad"}`}>
                        {formatModifier(modifier)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ) : null}

        {step === 4 ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <Card variant="panel">
              <CardContent className="space-y-4 p-6">
                <div className="space-y-2">
                  <Label>Historia de fundo</Label>
                  <Textarea
                    value={data.background}
                    onChange={(event) => setData((previous) => ({ ...previous, background: event.target.value }))}
                    placeholder="Conte a historia, o juramento ou o fracasso que trouxe este personagem ate aqui."
                    className="min-h-[140px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Detalhes adicionais</Label>
                  <Textarea
                    value={data.appearance}
                    onChange={(event) => setData((previous) => ({ ...previous, appearance: event.target.value }))}
                    placeholder="Marcas, postura, tracos e linguagem corporal."
                    className="min-h-[110px]"
                  />
                </div>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardContent className="space-y-4 p-6">
                <h3 className="font-heading text-lg text-gold-gradient">Resumo da ficha</h3>

                <div className="grid gap-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Nome</span>
                    <span className="text-right text-foreground">{data.name || "Aventureiro sem nome"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Raca</span>
                    <span className="text-right text-foreground">{RACES.find((race) => race.value === data.race)?.label}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Classe</span>
                    <span className="text-right text-foreground">{selectedClass?.label}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">HP</span>
                    <span className="text-right text-status-bad">{hp}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">MP</span>
                    <span className="text-right text-info">{mp}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">CA</span>
                    <span className="text-right text-foreground">{ac}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </motion.div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep((previous) => Math.max(0, previous - 1))} disabled={step === 0}>
          Anterior
        </Button>

        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep((previous) => previous + 1)}>Proximo</Button>
        ) : (
          <Button onClick={() => onSave?.(data)} disabled={!data.name.trim()}>
            <UserPlus className="mr-2 h-4 w-4" />
            Criar personagem
          </Button>
        )}
      </div>
    </div>
  );
}
