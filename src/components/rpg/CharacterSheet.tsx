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
import { ATTRIBUTES, CLASSES, formatModifier, getModifier, RACES, xpForLevel } from "@/lib/rpg-utils";
import { getResourceTone } from "@/lib/rpg-ui";
import type { Database } from "@/integrations/supabase/types";

type Character = Database["public"]["Tables"]["characters"]["Row"];

interface Props {
  character: Character;
}

const attributeIcons = {
  forca: Sword,
  destreza: Crosshair,
  constituicao: Shield,
  inteligencia: Brain,
  sabedoria: Eye,
  carisma: Sparkles,
} as const;

export default function CharacterSheet({ character }: Props) {
  const race = RACES.find((item) => item.value === character.race);
  const selectedClass = CLASSES.find((item) => item.value === character.class);
  const hpPercent = character.hp_max > 0 ? (character.hp_current / character.hp_max) * 100 : 0;
  const mpPercent = character.mp_max > 0 ? (character.mp_current / character.mp_max) * 100 : 0;
  const xpNext = xpForLevel(character.level);
  const xpPercent = xpNext > 0 ? (character.experience / xpNext) * 100 : 100;
  const hpTone = getResourceTone(hpPercent);
  const hpStateLabel = hpTone === "good" ? "Estavel" : hpTone === "warn" ? "Ferido" : "Critico";

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
                <CardTitle className="text-3xl md:text-4xl">{character.name}</CardTitle>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  Ficha narrativa em estilo cronica: atributos, recursos e blocos de dados organizados como fields de um painel editorial.
                </p>
              </div>
            </div>

            <DataSection
              label="Progresso"
              value={`Nivel ${character.level}`}
              icon={<Zap className="h-4 w-4" />}
              aside={<Badge variant="info">{character.experience} XP</Badge>}
              className="w-full lg:max-w-xs"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Experiencia atual</span>
                  <span>
                    {character.experience} / {xpNext}
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
              value={`${character.hp_current} / ${character.hp_max}`}
              icon={<Heart className="h-4 w-4" />}
              tone={hpTone}
              aside={<Badge variant={hpTone === "good" ? "success" : hpTone === "warn" ? "warning" : "danger"}>{hpStateLabel}</Badge>}
            >
              <Progress value={hpPercent} tone={hpTone} />
            </DataSection>

            <DataSection
              label="Mana"
              value={`${character.mp_current} / ${character.mp_max}`}
              icon={<Droplets className="h-4 w-4" />}
              tone={character.mp_max > 0 ? "info" : "neutral"}
              aside={<Badge variant={character.mp_max > 0 ? "info" : "outline"}>{character.mp_max > 0 ? "Arcano" : "Sem magia"}</Badge>}
            >
              <Progress value={mpPercent} tone="info" />
            </DataSection>

            <DataSection
              label="Armadura"
              value={`CA ${character.armor_class}`}
              icon={<Shield className="h-4 w-4" />}
              aside={<Badge variant="secondary">Defesa</Badge>}
            >
              <p className="text-sm leading-relaxed text-muted-foreground">
                A classe de armadura resume postura, equipamento e leitura tatica do personagem.
              </p>
            </DataSection>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <DataSection
              label="Iniciativa"
              value={formatModifier(character.initiative_bonus)}
              icon={<Zap className="h-4 w-4" />}
              variant="quiet"
            />
            <DataSection
              label="Movimento"
              value={`${character.speed} ft`}
              icon={<Footprints className="h-4 w-4" />}
              variant="quiet"
            />
            <DataSection
              label="Recursos"
              value={`${character.gold} ouro`}
              icon={<Coins className="h-4 w-4" />}
              variant="quiet"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {ATTRIBUTES.map((attribute) => {
              const value = character[attribute.key as keyof Character] as number;
              const modifier = getModifier(value);
              const Icon = attributeIcons[attribute.key];
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
                {character.background ?? "Sem historico registrado por enquanto."}
              </p>
            </DataSection>

            <DataSection
              label="Aparencia"
              value="Perfil"
              icon={<WandSparkles className="h-4 w-4" />}
              aside={<Badge variant="outline">Visual</Badge>}
            >
              <p className="text-sm leading-relaxed text-foreground/88">
                {character.appearance ?? "Sem descricao visual cadastrada."}
              </p>
            </DataSection>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
