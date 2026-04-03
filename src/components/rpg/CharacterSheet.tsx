import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  BadgeAlert,
  BookOpenText,
  Brain,
  Coins,
  Compass,
  Droplets,
  Eye,
  Footprints,
  Heart,
  Package,
  Shield,
  Sparkles,
  Sword,
  Swords,
  UserRound,
  WandSparkles,
  Zap,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataSection } from "@/components/ui/data-section";
import { buildSheetStateFromCharacter } from "@/lib/sheets/engine";
import type { AttributeStore, SheetDefinition } from "@/lib/sheets/types";
import { ATTRIBUTES, CLASSES, RACES, formatModifier, type AttributeKey } from "@/lib/rpg-utils";
import { getResourceTone, type CharacterRecord } from "@/lib/rpg-ui";
import { NOIR_CHRONICLE_SHEET } from "@/lib/sheets/noir-chronicle-sheet";

interface Props {
  character?: CharacterRecord;
  store?: AttributeStore;
  definition?: SheetDefinition;
}

const attributeIcons: Record<AttributeKey, typeof Brain> = {
  int: Brain,
  ref: Swords,
  dex: Eye,
  body: Shield,
  spd: Footprints,
  emp: UserRound,
  cra: Sparkles,
  will: WandSparkles,
  luck: Coins,
};

export default function CharacterSheet({
  character,
  store,
  definition = NOIR_CHRONICLE_SHEET,
}: Props) {
  const sheetStore = useMemo(() => {
    if (store) {
      return store;
    }

    if (character) {
      return buildSheetStateFromCharacter(definition, character).store;
    }

    return null;
  }, [character, definition, store]);

  if (!sheetStore) {
    return null;
  }

  const values = sheetStore.values;
  const derived = sheetStore.derived;
  const race = RACES.find((item) => item.value === values.race);
  const selectedClass = CLASSES.find((item) => item.value === values.class);
  const hpCurrent = Number(derived.hp_current ?? 0);
  const hpMax = Number(derived.hp_max ?? 0);
  const staminaCurrent = Number(derived.sta_current ?? 0);
  const staminaMax = Number(derived.sta_max ?? 0);
  const resolveCurrent = Number(derived.resolve_current ?? 0);
  const resolveMax = Number(derived.resolve_max ?? 0);
  const focusCurrent = Number(derived.focus_current ?? 0);
  const focusMax = Number(derived.focus_max ?? 0);
  const vigorCurrent = Number(derived.vigor_current ?? 0);
  const vigorMax = Number(derived.vigor_max ?? 0);
  const defense = Number(derived.armor_class ?? 0);
  const initiative = Number(derived.initiative_bonus ?? 0);
  const run = Number(derived.run ?? values.speed ?? 0);
  const leap = Number(derived.leap ?? 0);
  const enc = Number(derived.enc ?? 0);
  const rec = Number(derived.rec ?? 0);
  const woundThreshold = Number(derived.wound_threshold ?? 0);
  const stun = Number(derived.stun ?? 0);
  const level = Number(values.level ?? 1);
  const experience = Number(values.experience ?? 0);
  const xpNext = Number(derived.xp_next ?? 0);
  const hpPercent = hpMax > 0 ? (hpCurrent / hpMax) * 100 : 0;
  const hpTone = getResourceTone(hpPercent);
  const hpStateLabel = hpTone === "good" ? "Estavel" : hpTone === "warn" ? "Ferido" : "Critico";
  const inventoryCount = sheetStore.repeaters[definition.bindings.inventory]?.length ?? 0;
  const spellCount = sheetStore.repeaters[definition.bindings.spellbook]?.length ?? 0;

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {hpTone !== "good" ? (
        <Alert variant={hpTone === "warn" ? "warning" : "danger"}>
          <BadgeAlert />
          <AlertTitle>Estado do dossie</AlertTitle>
          <AlertDescription>
            {hpTone === "warn"
              ? "O personagem ja carrega ferimentos suficientes para exigir cautela e preparacao."
              : "O personagem esta em zona critica. Qualquer erro de leitura pode encerrar a trilha aqui."}
          </AlertDescription>
        </Alert>
      ) : null}

      <Card variant="elevated" className="overflow-hidden">
        <CardHeader className="border-b border-border/70 bg-background/25">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{race?.label ?? "Linagem nao catalogada"}</Badge>
                <Badge variant="secondary">{selectedClass?.label ?? "Profissao livre"}</Badge>
                {values.homeland ? <Badge variant="info">{String(values.homeland)}</Badge> : null}
                {values.school ? <Badge variant="outline">{String(values.school)}</Badge> : null}
                <Badge variant={hpTone === "good" ? "success" : hpTone === "warn" ? "warning" : "danger"}>
                  {hpStateLabel}
                </Badge>
              </div>

              <div>
                <CardTitle className="text-3xl md:text-4xl">
                  {String(values.name || "Viajante sem nome")}
                </CardTitle>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  Dossie completo do personagem, com atributos do Continente, recursos derivados e
                  registro de trilha prontos para a mesa.
                </p>
              </div>
            </div>

            <DataSection
              label="Progresso"
              value={`Nivel ${level}`}
              icon={<Zap className="h-4 w-4" />}
              aside={<Badge variant="info">{experience} XP</Badge>}
              className="w-full lg:max-w-xs"
            >
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Proximo nivel</span>
                  <span>{xpNext} XP</span>
                </div>
              </div>
            </DataSection>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <DataSection
              label="Vida"
              value={`${hpCurrent} / ${hpMax}`}
              icon={<Heart className="h-4 w-4" />}
              tone={hpTone}
              aside={<Badge variant={hpTone === "good" ? "success" : hpTone === "warn" ? "warning" : "danger"}>{hpStateLabel}</Badge>}
            />
            <DataSection
              label="Estamina"
              value={`${staminaCurrent} / ${staminaMax}`}
              icon={<Zap className="h-4 w-4" />}
              tone="info"
            />
            <DataSection
              label="Determinacao"
              value={`${resolveCurrent} / ${resolveMax}`}
              icon={<Shield className="h-4 w-4" />}
              variant="quiet"
            />
            <DataSection
              label="Foco"
              value={`${focusCurrent} / ${focusMax}`}
              icon={<Droplets className="h-4 w-4" />}
              tone={focusMax > 0 ? "info" : "neutral"}
            />
            <DataSection
              label="Vigor"
              value={`${vigorCurrent} / ${vigorMax}`}
              icon={<Sparkles className="h-4 w-4" />}
              tone={vigorMax > 0 ? "warn" : "neutral"}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <DataSection label="Defesa" value={defense} icon={<Sword className="h-4 w-4" />} variant="quiet" />
            <DataSection label="Iniciativa" value={formatModifier(initiative)} icon={<Zap className="h-4 w-4" />} variant="quiet" />
            <DataSection label="Corrida / Salto" value={`${run} / ${leap}`} icon={<Footprints className="h-4 w-4" />} variant="quiet" />
            <DataSection label="Fardo / Recuperacao" value={`${enc} / ${rec}`} icon={<Package className="h-4 w-4" />} variant="quiet" />
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <DataSection label="Limiar de ferimento" value={woundThreshold} variant="quiet" tone="warn" />
            <DataSection label="Atordoamento" value={stun} variant="quiet" />
            <DataSection
              label="Anexos"
              value={`${inventoryCount} itens • ${spellCount} entradas`}
              variant="quiet"
              icon={<BookOpenText className="h-4 w-4" />}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {ATTRIBUTES.map((attribute) => {
              const Icon = attributeIcons[attribute.key];
              const value = Number(values[attribute.key] ?? 5);
              const modifier = Number(derived[`modifier.${attribute.key}` as `modifier.${AttributeKey}`] ?? 0);
              const modifierVariant = modifier >= 0 ? "success" : "danger";

              return (
                <DataSection
                  key={attribute.key}
                  label={attribute.label}
                  value={value}
                  icon={<Icon className="h-4 w-4" />}
                  variant="quiet"
                  aside={<Badge variant={modifierVariant}>{formatModifier(modifier)}</Badge>}
                >
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Sigla</span>
                    <span className="font-heading text-foreground">{attribute.abbr}</span>
                  </div>
                </DataSection>
              );
            })}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <DataSection
              label="Historico"
              value="Registro"
              icon={<Compass className="h-4 w-4" />}
              aside={<Badge variant="outline">Narrativo</Badge>}
            >
              <p className="text-sm leading-relaxed text-foreground/88">
                {String(values.background || "Nenhum registro cronistico foi gravado ainda.")}
              </p>
            </DataSection>

            <DataSection
              label="Aparencia"
              value="Perfil"
              icon={<WandSparkles className="h-4 w-4" />}
              aside={<Badge variant="outline">Visual</Badge>}
            >
              <p className="text-sm leading-relaxed text-foreground/88">
                {String(values.appearance || "Sem descricao visual cadastrada.")}
              </p>
              {values.lifepath ? (
                <p className="mt-4 border-t border-border/60 pt-4 text-sm leading-relaxed text-foreground/82">
                  {String(values.lifepath)}
                </p>
              ) : null}
            </DataSection>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
