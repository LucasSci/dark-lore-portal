import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BookOpenText, Compass, Shuffle, Sparkles, Swords, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { NOIR_CHRONICLE_SHEET } from "@/lib/sheets/noir-chronicle-sheet";
import { useCharacterSheetRuntime } from "@/lib/sheets/runtime";
import { buildCharacterDraftFromStore } from "@/lib/sheets/engine";
import {
  ATTRIBUTES,
  CLASSES,
  HOMELANDS,
  RACES,
  WITCHER_LIFEPATH_PROMPTS,
  WITCHER_SCHOOLS_LIST,
  createRandomWitcherAttributes,
  createRandomWitcherBackground,
  formatModifier,
  type AttributeKey,
} from "@/lib/rpg-utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataSection } from "@/components/ui/data-section";
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
  homeland?: string;
  school?: string;
  lifepath?: string;
  level?: number;
  experience?: number;
  gold?: number;
  speed?: number;
}

interface Props {
  onSave?: (data: CharacterData) => void;
}

function formatFavoredAttributes(attributes: AttributeKey[]) {
  return ATTRIBUTES.filter((attribute) => attributes.includes(attribute.key))
    .map((attribute) => attribute.abbr)
    .join(" • ");
}

export default function CharacterCreator({ onSave }: Props) {
  const steps = NOIR_CHRONICLE_SHEET.wizardSteps;
  const [step, setStep] = useState(0);
  const { store, validation, workerReady, setAttribute, validateStep } = useCharacterSheetRuntime({
    definition: NOIR_CHRONICLE_SHEET,
  });

  const draft = buildCharacterDraftFromStore(store);
  const selectedRace = useMemo(
    () => RACES.find((item) => item.value === draft.race) ?? RACES[0],
    [draft.race],
  );
  const selectedProfession = useMemo(
    () => CLASSES.find((item) => item.value === draft.class) ?? CLASSES[0],
    [draft.class],
  );
  const pointsUsed = Number(store.derived.point_budget_used ?? 0);
  const pointBudget = 60;
  const hp = Number(store.derived.hp_max ?? 0);
  const stamina = Number(store.derived.sta_max ?? 0);
  const resolve = Number(store.derived.resolve_max ?? 0);
  const focus = Number(store.derived.focus_max ?? 0);
  const vigor = Number(store.derived.vigor_max ?? 0);
  const defense = Number(store.derived.armor_class ?? 0);
  const run = Number(store.derived.run ?? 0);
  const leap = Number(store.derived.leap ?? 0);
  const currentValidation = validation[steps[step]?.id];

  const updateAttribute = async (key: string, value: string | number) => {
    await setAttribute(key, value);
  };

  const randomizeAttributes = async () => {
    const randomSpread = createRandomWitcherAttributes();

    for (const attribute of ATTRIBUTES) {
      await setAttribute(attribute.key, randomSpread[attribute.key]);
    }
  };

  const randomizeHistory = async () => {
    const prompt = WITCHER_LIFEPATH_PROMPTS[Math.floor(Math.random() * WITCHER_LIFEPATH_PROMPTS.length)];

    await setAttribute("lifepath", `${prompt.title}: ${prompt.detail}`);
    if (!String(store.values.background ?? "").trim()) {
      await setAttribute("background", createRandomWitcherBackground());
    }
  };

  const adjustAttribute = async (key: AttributeKey, delta: number) => {
    const currentValue = draft.attributes[key];
    const nextValue = Math.max(2, Math.min(10, currentValue + delta));
    if (nextValue === currentValue) {
      return;
    }
    await setAttribute(key, nextValue);
  };

  const moveToStep = async (nextStep: number) => {
    if (nextStep <= step) {
      setStep(nextStep);
      return;
    }

    const result = await validateStep(steps[step].id);

    if (!result.valid) {
      toast.error(Object.values(result.errors)[0] ?? "Preencha os campos desta etapa antes de seguir.");
      return;
    }

    setStep(Math.min(nextStep, steps.length - 1));
  };

  const handleSave = async () => {
    const validations = await Promise.all(steps.map((wizardStep) => validateStep(wizardStep.id)));
    const firstError = validations.find((result) => !result.valid);

    if (firstError) {
      toast.error(Object.values(firstError.errors)[0] ?? "A ficha ainda possui campos pendentes.");
      return;
    }

    onSave?.({
      name: draft.name,
      race: draft.race,
      class: draft.class,
      attributes: draft.attributes,
      background: draft.background,
      appearance: draft.appearance,
      homeland: draft.homeland,
      school: draft.school,
      lifepath: draft.lifepath,
      level: draft.level,
      experience: draft.experience,
      gold: draft.gold,
      speed: draft.speed,
    });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
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

      <div className="info-panel flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div>
          <p className="font-heading text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Motor de ficha
          </p>
          <p className="text-sm text-foreground">
            {workerReady ? "Derivacoes Witcher prontas em tempo real." : "Fallback local ativo enquanto o worker inicializa."}
          </p>
        </div>
        <Progress value={((step + 1) / steps.length) * 100} tone="info" className="h-2 w-40" />
      </div>

      <motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {step === 0 ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <Card variant="panel">
              <CardContent className="space-y-5 p-6">
                <div className="space-y-2">
                  <Label>Nome do personagem</Label>
                  <Input
                    value={draft.name}
                    onChange={(event) => void updateAttribute("name", event.target.value)}
                    placeholder="Ex: Vael de Vizima"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Terra natal</Label>
                  <div className="grid gap-2 md:grid-cols-3">
                    {HOMELANDS.map((homeland) => (
                      <button
                        key={homeland}
                        type="button"
                        onClick={() => void updateAttribute("homeland", homeland)}
                        className={`border px-3 py-3 text-left text-sm transition-colors ${
                          draft.homeland === homeland
                            ? "border-primary/35 bg-primary/10 text-primary"
                            : "border-border bg-card-gradient text-foreground/82 hover:border-primary/20"
                        }`}
                      >
                        {homeland}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Aparencia</Label>
                  <Textarea
                    value={draft.appearance}
                    onChange={(event) => void updateAttribute("appearance", event.target.value)}
                    placeholder="Cicatrizes finas, manto gasto de estrada e um medalhao que nunca para de vibrar."
                    className="min-h-[120px]"
                  />
                </div>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardContent className="space-y-4 p-6">
                <div>
                  <p className="section-kicker">Leitura do arquivo</p>
                  <h3 className="mt-2 font-heading text-2xl text-gold-gradient">Identidade</h3>
                </div>
                <p className="text-sm leading-7 text-foreground/84">
                  Comece pelo nome, pela origem e pela silhueta do personagem. O resto da ficha vai
                  herdar esse tom narrativo.
                </p>
                <DataSection label="Terra natal" value={draft.homeland || "Temeria"} variant="quiet" icon={<Compass className="h-4 w-4" />} />
                <DataSection label="Nome de arquivo" value={draft.name || "Viajante sem nome"} variant="quiet" icon={<BookOpenText className="h-4 w-4" />} />
              </CardContent>
            </Card>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {RACES.map((race) => (
              <motion.button
                key={race.value}
                type="button"
                whileHover={{ scale: 1.01, y: -2 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => void updateAttribute("race", race.value)}
                className={`border p-5 text-left transition-colors ${
                  draft.race === race.value
                    ? "border-primary/35 bg-primary/10 shadow-brand"
                    : "border-border bg-card-gradient hover:border-primary/25"
                }`}
              >
                <p className="section-kicker">{race.socialStanding}</p>
                <h4 className="mt-2 font-heading text-lg text-foreground">{race.label}</h4>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{race.desc}</p>
                <p className="mt-4 text-xs uppercase tracking-[0.16em] text-primary/78">{race.trait}</p>
              </motion.button>
            ))}
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="grid gap-3 md:grid-cols-2">
              {CLASSES.map((profession) => (
                <motion.button
                  key={profession.value}
                  type="button"
                  whileHover={{ scale: 1.01, y: -2 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => void updateAttribute("class", profession.value)}
                  className={`border p-5 text-left transition-colors ${
                    draft.class === profession.value
                      ? "border-primary/35 bg-primary/10 shadow-brand"
                      : "border-border bg-card-gradient hover:border-primary/25"
                  }`}
                >
                  <p className="section-kicker">{profession.role}</p>
                  <h4 className="mt-2 font-heading text-lg text-foreground">{profession.label}</h4>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{profession.desc}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.16em] text-primary/78">
                    <span>Vigor {profession.vigor}</span>
                    <span>{profession.definingSkill}</span>
                  </div>
                </motion.button>
              ))}
            </div>

            <Card variant="elevated">
              <CardContent className="space-y-4 p-6">
                <div>
                  <p className="section-kicker">Trilha escolhida</p>
                  <h3 className="mt-2 font-heading text-2xl text-gold-gradient">{selectedProfession.label}</h3>
                </div>
                <p className="text-sm leading-7 text-foreground/84">{selectedProfession.desc}</p>
                <DataSection
                  label="Atributos favorecidos"
                  value={formatFavoredAttributes(selectedProfession.favoredAttributes)}
                  variant="quiet"
                  icon={<Swords className="h-4 w-4" />}
                />
                <div className="space-y-2">
                  <Label>Escola ou ordem</Label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {WITCHER_SCHOOLS_LIST.map((school) => (
                      <button
                        key={school}
                        type="button"
                        onClick={() => void updateAttribute("school", school)}
                        className={`border px-3 py-3 text-left text-sm transition-colors ${
                          draft.school === school
                            ? "border-primary/35 bg-primary/10 text-primary"
                            : "border-border bg-card-gradient text-foreground/82 hover:border-primary/20"
                        }`}
                      >
                        {school}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
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
                    Os nove atributos devem permanecer entre 2 e 10, com limite total de 60.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => void randomizeAttributes()}>
                  <Shuffle className="mr-2 h-4 w-4" />
                  Distribuir aleatoriamente
                </Button>
              </div>

              <Progress
                value={(pointsUsed / pointBudget) * 100}
                tone={pointsUsed > pointBudget * 0.9 ? "warn" : "good"}
                className="h-2"
              />

              <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
                {ATTRIBUTES.map((attribute) => {
                  const value = draft.attributes[attribute.key];
                  const modifier = Number(store.derived[`modifier.${attribute.key}` as const] ?? 0);

                  return (
                    <div key={attribute.key} className="info-panel p-4 text-center">
                      <p className="font-heading text-[11px] uppercase tracking-[0.18em] text-primary/80">
                        {attribute.abbr}
                      </p>
                      <h4 className="mt-2 font-heading text-sm text-foreground">{attribute.label}</h4>
                      <p className="mt-2 text-xs leading-6 text-muted-foreground">{attribute.description}</p>

                      <div className="mt-4 flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => void adjustAttribute(attribute.key, -1)}
                          aria-label={`Diminuir ${attribute.label}`}
                          className="h-8 w-8 p-0"
                        >
                          -
                        </Button>
                        <span className="w-10 font-heading text-2xl text-foreground">{value}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => void adjustAttribute(attribute.key, 1)}
                          aria-label={`Aumentar ${attribute.label}`}
                          className="h-8 w-8 p-0"
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
              <CardContent className="space-y-5 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <Label>Caminho de vida</Label>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Registre o evento, trauma ou juramento que empurrou o personagem para a estrada.
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => void randomizeHistory()}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Gerar gancho
                  </Button>
                </div>

                <Textarea
                  value={draft.lifepath ?? ""}
                  onChange={(event) => void updateAttribute("lifepath", event.target.value)}
                  placeholder="Ex: O massacre de uma caravana nilfgaardiana deixou uma testemunha viva e um contrato inacabado."
                  className="min-h-[130px]"
                />

                <div className="space-y-2">
                  <Label>Historico do arquivo</Label>
                  <Textarea
                    value={draft.background}
                    onChange={(event) => void updateAttribute("background", event.target.value)}
                    placeholder="Cronicas, contatos, dividas e rumores que cercam o personagem."
                    className="min-h-[140px]"
                  />
                </div>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardContent className="space-y-4 p-6">
                <h3 className="font-heading text-lg text-gold-gradient">Resumo derivado</h3>

                <div className="grid gap-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Nome</span>
                    <span className="text-right text-foreground">{draft.name || "Viajante sem nome"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Raca</span>
                    <span className="text-right text-foreground">{selectedRace.label}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Profissao</span>
                    <span className="text-right text-foreground">{selectedProfession.label}</span>
                  </div>
                </div>

                <div className="grid gap-3">
                  <DataSection label="Vida" value={hp} variant="quiet" />
                  <DataSection label="Estamina" value={stamina} variant="quiet" />
                  <DataSection label="Determinacao" value={resolve} variant="quiet" />
                  <DataSection label="Foco" value={focus} variant="quiet" />
                  <DataSection label="Vigor" value={vigor} variant="quiet" />
                  <DataSection label="Defesa" value={defense} variant="quiet" />
                  <DataSection label="Corrida / Salto" value={`${run} / ${leap}`} variant="quiet" />
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
        <Button variant="outline" onClick={() => void moveToStep(Math.max(0, step - 1))} disabled={step === 0}>
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
