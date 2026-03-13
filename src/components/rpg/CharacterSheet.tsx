import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  BadgeAlert,
  BookOpenText,
  Brain,
  Coins,
  Crosshair,
  Droplets,
  Eye,
  Footprints,
  Heart,
  Package,
  Shield,
  Sparkles,
  Sword,
  WandSparkles,
  Zap,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataSection } from "@/components/ui/data-section";
import { Progress } from "@/components/ui/progress";
import { NOIR_CHRONICLE_SHEET } from "@/lib/sheets/noir-chronicle-sheet";
import { buildSheetStateFromCharacter } from "@/lib/sheets/engine";
import type { AttributeStore, SheetDefinition } from "@/lib/sheets/types";
import { ATTRIBUTES, CLASSES, RACES, formatModifier, type AttributeKey } from "@/lib/rpg-utils";
import { getResourceTone } from "@/lib/rpg-ui";
import type { Database } from "@/integrations/supabase/types";

type Character = Database["public"]["Tables"]["characters"]["Row"];

interface Props {
  character?: Character;
  store?: AttributeStore;
  definition?: SheetDefinition;
}

const attributeIcons = {
  forca: Sword,
  destreza: Crosshair,
  constituicao: Shield,
  inteligencia: Brain,
  sabedoria: Eye,
  carisma: Sparkles,
} as const;

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
  const mpCurrent = Number(derived.mp_current ?? 0);
  const mpMax = Number(derived.mp_max ?? 0);
  const armorClass = Number(derived.armor_class ?? 0);
  const initiativeBonus = Number(derived.initiative_bonus ?? 0);
  const level = Number(values.level ?? 1);
  const experience = Number(values.experience ?? 0);
  const xpNext = Number(derived.xp_next ?? 0);
  const hpPercent = hpMax > 0 ? (hpCurrent / hpMax) * 100 : 0;
  const mpPercent = mpMax > 0 ? (mpCurrent / mpMax) * 100 : 0;
  const xpPercent = xpNext > 0 ? (experience / xpNext) * 100 : 100;
  const hpTone = getResourceTone(hpPercent);
  const hpStateLabel = hpTone === "good" ? "Estavel" : hpTone === "warn" ? "Ferido" : "Critico";
  const inventoryCount = sheetStore.repeaters[definition.bindings.inventory]?.length ?? 0;
  const spellCount = sheetStore.repeaters[definition.bindings.spellbook]?.length ?? 0;

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {hpTone !== "good" ? (
        <Alert variant={hpTone === "warn" ? "warning" : "danger"}>
          <BadgeAlert />
          <AlertTitle>Estado da ficha</AlertTitle>
          <AlertDescription>
            {hpTone === "warn"
              ? "Os recursos do personagem pedem cautela. Considere cura ou reposicionamento."
              : "Vida em zona critica. Priorize defesa, cura ou retirada antes do proximo confronto."}
          </AlertDescription>
        </Alert>
      ) : null}

      <Card variant="elevated" className="overflow-hidden">
        <CardHeader className="border-b border-border/70 bg-background/25">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{race?.label ?? "Origem desconhecida"}</Badge>
                <Badge variant="secondary">{selectedClass?.label ?? "Classe livre"}</Badge>
                <Badge variant={hpTone === "good" ? "success" : hpTone === "warn" ? "warning" : "danger"}>
                  {hpStateLabel}
                </Badge>
              </div>

              <div>
                <CardTitle className="text-3xl md:text-4xl">
                  {String(values.name || "Aventureiro sem nome")}
                </CardTitle>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  Ficha schema-driven em estilo cronica: campos persistidos, derivados e grupos repetiveis renderizados a partir do motor da ficha.
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
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Experiencia atual</span>
                  <span>
                    {experience} / {xpNext}
                  </span>
                </div>
                <Progress value={xpPercent} tone="info" />
              </div>
            </DataSection>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <DataSection
              label="Vida"
              value={`${hpCurrent} / ${hpMax}`}
              icon={<Heart className="h-4 w-4" />}
              tone={hpTone}
              aside={<Badge variant={hpTone === "good" ? "success" : hpTone === "warn" ? "warning" : "danger"}>{hpStateLabel}</Badge>}
            >
              <Progress value={hpPercent} tone={hpTone} />
            </DataSection>

            <DataSection
              label="Mana"
              value={`${mpCurrent} / ${mpMax}`}
              icon={<Droplets className="h-4 w-4" />}
              tone={mpMax > 0 ? "info" : "neutral"}
              aside={<Badge variant={mpMax > 0 ? "info" : "outline"}>{mpMax > 0 ? "Arcano" : "Sem magia"}</Badge>}
            >
              <Progress value={mpPercent} tone="info" />
            </DataSection>

            <DataSection
              label="Armadura"
              value={`CA ${armorClass}`}
              icon={<Shield className="h-4 w-4" />}
              aside={<Badge variant="secondary">Defesa</Badge>}
            >
              <p className="text-sm leading-relaxed text-muted-foreground">
                A classe de armadura resume postura, equipamento e leitura tatica do personagem.
              </p>
            </DataSection>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <DataSection
              label="Iniciativa"
              value={formatModifier(initiativeBonus)}
              icon={<Zap className="h-4 w-4" />}
              variant="quiet"
            />
            <DataSection
              label="Movimento"
              value={`${Number(values.speed ?? 30)} ft`}
              icon={<Footprints className="h-4 w-4" />}
              variant="quiet"
            />
            <DataSection
              label="Recursos"
              value={`${Number(values.gold ?? 0)} ouro`}
              icon={<Coins className="h-4 w-4" />}
              variant="quiet"
            />
            <DataSection
              label="Bindings"
              value={`${inventoryCount} itens | ${spellCount} magias`}
              icon={<Package className="h-4 w-4" />}
              variant="quiet"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {ATTRIBUTES.map((attribute) => {
              const Icon = attributeIcons[attribute.key];
              const value = Number(values[attribute.key] ?? 10);
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
                    <span>Abreviacao</span>
                    <span className="font-heading text-foreground">{attribute.abbr}</span>
                  </div>
                </DataSection>
              );
            })}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <DataSection
              label="Historico"
              value="Cronica"
              icon={<BookOpenText className="h-4 w-4" />}
              aside={<Badge variant="outline">Narrativo</Badge>}
            >
              <p className="text-sm leading-relaxed text-foreground/88">
                {String(values.background || "Sem historico registrado por enquanto.")}
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
            </DataSection>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
