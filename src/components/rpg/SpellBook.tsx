import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BookOpenText, Clock3, Crosshair, Sparkles, WandSparkles, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataSection } from "@/components/ui/data-section";
import { supabase } from "@/integrations/supabase/client";

type SpellSchool =
  | "evocacao"
  | "abjuracao"
  | "conjuracao"
  | "adivinhacao"
  | "encantamento"
  | "ilusao"
  | "necromancia"
  | "transmutacao";

interface Spell {
  id: string;
  name: string;
  description: string | null;
  school: SpellSchool;
  level: number;
  casting_time: string;
  range: string;
  duration: string;
  damage: string | null;
  mp_cost: number;
}

interface Props {
  onImportSpell?: (spell: Spell) => void;
}

const schoolMeta: Record<
  SpellSchool,
  { label: string; variant: "info" | "success" | "warning" | "danger" | "secondary" }
> = {
  evocacao: { label: "Evocacao", variant: "warning" },
  abjuracao: { label: "Abjuracao", variant: "info" },
  conjuracao: { label: "Conjuracao", variant: "success" },
  adivinhacao: { label: "Adivinhacao", variant: "secondary" },
  encantamento: { label: "Encantamento", variant: "info" },
  ilusao: { label: "Ilusao", variant: "secondary" },
  necromancia: { label: "Necromancia", variant: "danger" },
  transmutacao: { label: "Transmutacao", variant: "success" },
};

export default function SpellBook({ onImportSpell }: Props) {
  const [spells, setSpells] = useState<Spell[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterSchool, setFilterSchool] = useState<SpellSchool | "todas">("todas");

  useEffect(() => {
    supabase.from("spells").select("*").order("level").order("name").then(({ data }) => {
      if (data) {
        setSpells(data as Spell[]);
      }
    });
  }, []);

  const filteredSpells = useMemo(() => {
    if (filterSchool === "todas") {
      return spells;
    }

    return spells.filter((spell) => spell.school === filterSchool);
  }, [filterSchool, spells]);

  const totalMpCost = filteredSpells.reduce((sum, spell) => sum + spell.mp_cost, 0);
  const averageLevel = filteredSpells.length
    ? (filteredSpells.reduce((sum, spell) => sum + spell.level, 0) / filteredSpells.length).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-5">
      <Card variant="elevated">
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="rounded-full border border-primary/20 bg-background/60 p-3 text-primary">
                  <BookOpenText className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Compendio de magias</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Filtros por escola, cards narrativos e fields de efeito para consulta rapida durante a mesa.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <DataSection label="Grimorios" value={filteredSpells.length} variant="quiet" />
              <DataSection label="Nivel medio" value={averageLevel} variant="quiet" />
              <DataSection label="MP total" value={totalMpCost} variant="quiet" />
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={filterSchool === "todas" ? "primary" : "outline"}
          onClick={() => setFilterSchool("todas")}
        >
          Todas
        </Button>

        {(Object.keys(schoolMeta) as SpellSchool[]).map((school) => (
          <Button
            key={school}
            size="sm"
            variant={filterSchool === school ? "primary" : "outline"}
            onClick={() => setFilterSchool(school)}
          >
            {schoolMeta[school].label}
          </Button>
        ))}
      </div>

      {filteredSpells.length === 0 ? (
        <Card variant="outline">
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            Nenhuma magia encontrada para este filtro.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {filteredSpells.map((spell, index) => {
            const isOpen = selectedId === spell.id;
            const meta = schoolMeta[spell.school] ?? schoolMeta.evocacao;

            return (
              <motion.button
                key={spell.id}
                type="button"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => setSelectedId(isOpen ? null : spell.id)}
                className="text-left"
              >
                <Card variant={isOpen ? "elevated" : "panel"} className="h-full">
                  <CardContent className="space-y-4 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={meta.variant}>{meta.label}</Badge>
                          <Badge variant="outline">Nivel {spell.level}</Badge>
                        </div>
                        <div>
                          <h3 className="font-heading text-xl text-foreground">{spell.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Ritual arcano pronto para consulta imediata.
                          </p>
                        </div>
                      </div>

                      <DataSection
                        label="Custo"
                        value={`${spell.mp_cost} MP`}
                        icon={<WandSparkles className="h-4 w-4" />}
                        variant="quiet"
                        className="min-w-[130px]"
                      />
                    </div>

                    <p className="text-sm leading-7 text-foreground/88">
                      {spell.description ?? "Sem descricao catalogada para esta magia."}
                    </p>

                    {isOpen ? (
                      <div className="space-y-3">
                        <div className="grid gap-3 md:grid-cols-2">
                          <DataSection
                            label="Conjuracao"
                            value={spell.casting_time}
                            icon={<Clock3 className="h-4 w-4" />}
                            variant="quiet"
                          />
                          <DataSection
                            label="Alcance"
                            value={spell.range}
                            icon={<Crosshair className="h-4 w-4" />}
                            variant="quiet"
                          />
                          <DataSection
                            label="Duracao"
                            value={spell.duration}
                            icon={<Sparkles className="h-4 w-4" />}
                            variant="quiet"
                          />
                          <DataSection
                            label="Impacto"
                            value={spell.damage ?? "Utilitaria"}
                            icon={<Zap className="h-4 w-4" />}
                            variant="quiet"
                            tone={spell.damage ? "warn" : "info"}
                          />
                        </div>

                        {onImportSpell ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={(event) => {
                              event.stopPropagation();
                              onImportSpell(spell);
                            }}
                          >
                            Vincular a ficha
                          </Button>
                        ) : null}
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}
