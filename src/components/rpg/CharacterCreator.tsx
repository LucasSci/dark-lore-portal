import { useState } from "react";
import { motion } from "framer-motion";
import { Shuffle, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { NOIR_CHRONICLE_SHEET } from "@/lib/sheets/noir-chronicle-sheet";
import { useCharacterSheetRuntime } from "@/lib/sheets/runtime";
import { buildCharacterDraftFromStore } from "@/lib/sheets/engine";
import { ATTRIBUTES, CLASSES, formatModifier, getModifier, RACES, rollDice, type AttributeKey } from "@/lib/rpg-utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";

export interface CharacterData {
  name: string;
  race: string;
  class: string;
  attributes: Record<AttributeKey, number>;
  background: string;
  appearance: string;
  level?: number;
  experience?: number;
  gold?: number;
  speed?: number;
}

interface Props {
  onSave?: (data: CharacterData) => void;
}

export default function CharacterCreator({ onSave }: Props) {
  const steps = NOIR_CHRONICLE_SHEET.wizardSteps;
  const [step, setStep] = useState(0);
  const { store, validation, workerReady, setAttribute, validateStep } = useCharacterSheetRuntime({
    definition: NOIR_CHRONICLE_SHEET,
  });

  const draft = buildCharacterDraftFromStore(store);
  const selectedClass = CLASSES.find((item) => item.value === draft.class);
  const pointsUsed = Number(store.derived.point_budget_used ?? 0);
  const pointBudget = 27;
  const hp = Number(store.derived.hp_max ?? 0);
  const mp = Number(store.derived.mp_max ?? 0);
  const ac = Number(store.derived.armor_class ?? 0);
  const currentValidation = validation[steps[step]?.id];

  const updateAttribute = async (key: string, value: string | number) => {
    await setAttribute(key, value);
  };

  const setAttr = async (key: AttributeKey, delta: number) => {
    const currentValue = draft.attributes[key];
    const nextValue = currentValue + delta;

    await setAttribute(key, nextValue);
  };

  const randomizeAttributes = async () => {
    const roll4d6 = () => {
      const { results } = rollDice(6, 4);
      return results
        .sort((left, right) => right - left)
        .slice(0, 3)
        .reduce((sum, value) => sum + value, 0);
    };

    for (const attribute of ATTRIBUTES) {
      await setAttribute(attribute.key, roll4d6());
    }
  };

  const moveToStep = async (nextStep: number) => {
    if (nextStep <= step) {
      setStep(nextStep);
      return;
    }

    const result = await validateStep(steps[step].id);

    if (!result.valid) {
      toast.error(Object.values(result.errors)[0] ?? "Preencha os campos obrigatorios.");
      return;
    }

    setStep(Math.min(nextStep, steps.length - 1));
  };

  const handleSave = async () => {
    const result = await validateStep(steps[step].id);

    if (!result.valid) {
      toast.error(Object.values(result.errors)[0] ?? "Finalize a etapa atual antes de salvar.");
      return;
    }

    onSave?.({
      name: draft.name,
      race: draft.race,
      class: draft.class,
      attributes: draft.attributes,
      background: draft.background,
      appearance: draft.appearance,
      level: draft.level,
      experience: draft.experience,
      gold: draft.gold,
      speed: draft.speed,
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="grid gap-2 sm:grid-cols-5">
        {steps.map((wizardStep, index) => {
          const active = index === step;
          const completed = index < step;

          return (
            <button
              key={wizardStep.id}
              type="button"
              onClick={() => void moveToStep(index)}
              className={`border px-3 py-2 text-center font-heading text-[11px] uppercase tracking-[0.18em] transition-colors ${
                active
                  ? "border-primary/35 bg-primary/10 text-primary shadow-brand"
                  : completed
                    ? "border-border/70 bg-[linear-gradient(180deg,hsl(var(--surface-raised)/0.84),hsl(var(--surface-base)/0.9))] text-foreground"
                    : "border-border/60 bg-transparent text-muted-foreground"
              }`}
            >
              {wizardStep.label}
            </button>
          );
        })}
      </div>

      <div className="info-panel flex items-center justify-between gap-3 px-4 py-3">
        <div>
          <p className="font-heading text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Engine da ficha
          </p>
          <p className="text-sm text-foreground">
            {workerReady ? "Worker ativo para derivacoes e validacoes." : "Fallback local ativo enquanto o worker inicializa."}
          </p>
        </div>
        <Progress value={((step + 1) / steps.length) * 100} tone="info" className="h-2 w-32" />
      </div>

      <motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {step === 0 ? (
          <Card variant="panel">
            <CardContent className="space-y-4 p-6">
              <div className="space-y-2">
                <Label>Nome do personagem</Label>
                <Input
                  value={draft.name}
                  onChange={(event) => void updateAttribute("name", event.target.value)}
                  placeholder="Ex: Thorin Escudo de Ferro"
                />
              </div>

              <div className="space-y-2">
                <Label>Aparencia em uma frase</Label>
                <Textarea
                  value={draft.appearance}
                  onChange={(event) => void updateAttribute("appearance", event.target.value)}
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
                onClick={() => void updateAttribute("race", race.value)}
                className={`border p-4 text-left transition-colors ${
                  draft.race === race.value
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
                onClick={() => void updateAttribute("class", characterClass.value)}
                className={`border p-4 text-left transition-colors ${
                  draft.class === characterClass.value
                    ? "border-primary/35 bg-primary/10 shadow-brand"
                    : "border-border bg-card-gradient hover:border-primary/25"
                }`}
              >
                <h4 className="font-heading text-sm text-foreground">{characterClass.label}</h4>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  HP d{characterClass.hitDie} | MP base {characterClass.mpBase}
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
                    Sistema point-buy com orcamento limitado e validacao por etapa.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => void randomizeAttributes()}>
                  <Shuffle className="mr-2 h-4 w-4" />
                  4d6 drop lowest
                </Button>
              </div>

              <Progress
                value={(pointsUsed / pointBudget) * 100}
                tone={pointsUsed > pointBudget * 0.7 ? "warn" : "good"}
                className="h-2"
              />

              <div className="grid gap-4 md:grid-cols-3">
                {ATTRIBUTES.map((attribute) => {
                  const value = draft.attributes[attribute.key];
                  const modifier = getModifier(value);

                  return (
                    <div
                      key={attribute.key}
                      className="info-panel p-4 text-center"
                    >
                      <p className="font-heading text-[11px] uppercase tracking-[0.18em] text-primary/80">
                        {attribute.abbr}
                      </p>
                      <h4 className="mt-2 font-heading text-sm text-foreground">{attribute.label}</h4>

                      <div className="mt-3 flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => void setAttr(attribute.key, -1)}
                          className="h-8 w-8 p-0"
                          aria-label={`Diminuir ${attribute.label}`}
                          title={`Diminuir ${attribute.label}`}
                        >
                          -
                        </Button>
                        <span className="w-10 font-heading text-2xl text-foreground">{value}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => void setAttr(attribute.key, 1)}
                          className="h-8 w-8 p-0"
                          aria-label={`Aumentar ${attribute.label}`}
                          title={`Aumentar ${attribute.label}`}
                        >
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
                    value={draft.background}
                    onChange={(event) => void updateAttribute("background", event.target.value)}
                    placeholder="Conte a historia, o juramento ou o fracasso que trouxe este personagem ate aqui."
                    className="min-h-[140px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Detalhes adicionais</Label>
                  <Textarea
                    value={draft.appearance}
                    onChange={(event) => void updateAttribute("appearance", event.target.value)}
                    placeholder="Marcas, postura, tracos e linguagem corporal."
                    className="min-h-[110px]"
                  />
                </div>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardContent className="space-y-4 p-6">
                <h3 className="font-heading text-lg text-gold-gradient">Resumo derivado</h3>

                <div className="grid gap-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Nome</span>
                    <span className="text-right text-foreground">{draft.name || "Aventureiro sem nome"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Raca</span>
                    <span className="text-right text-foreground">{RACES.find((race) => race.value === draft.race)?.label}</span>
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

      {currentValidation && !currentValidation.valid ? (
        <div className="border border-status-bad/30 bg-status-bad/10 px-4 py-3 text-sm text-foreground">
          {Object.values(currentValidation.errors)[0]}
        </div>
      ) : null}

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => void moveToStep(Math.max(0, step - 1))}
          disabled={step === 0}
        >
          Anterior
        </Button>

        {step < steps.length - 1 ? (
          <Button onClick={() => void moveToStep(step + 1)}>Proximo</Button>
        ) : (
          <Button onClick={() => void handleSave()} disabled={!draft.name.trim()}>
            <UserPlus className="mr-2 h-4 w-4" />
            Criar personagem
          </Button>
        )}
      </div>
    </div>
  );
}
