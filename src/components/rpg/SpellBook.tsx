import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BookOpenText, Clock3, Crosshair, Flame, Sparkles, WandSparkles, Zap } from "lucide-react";

import { WITCHER_SPELLS, type WitcherSpellDefinition } from "@/lib/witcher-trpg-system";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataSection } from "@/components/ui/data-section";

interface Props {
  onImportSpell?: (spell: WitcherSpellDefinition) => void;
}

const traditionMeta: Record<
  WitcherSpellDefinition["tradition"],
  { label: string; variant: "info" | "success" | "warning" | "danger" }
> = {
  sinal: { label: "Sinal", variant: "warning" },
  magia: { label: "Magia", variant: "info" },
  ritual: { label: "Ritual", variant: "success" },
  hex: { label: "Hex", variant: "danger" },
};

export default function SpellBook({ onImportSpell }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterTradition, setFilterTradition] = useState<WitcherSpellDefinition["tradition"] | "todas">("todas");

  const filteredSpells = useMemo(() => {
    if (filterTradition === "todas") {
      return WITCHER_SPELLS;
    }

    return WITCHER_SPELLS.filter((spell) => spell.tradition === filterTradition);
  }, [filterTradition]);

  const totalVigor = filteredSpells.reduce((sum, spell) => sum + spell.vigorCost, 0);

  return (
    <div className="space-y-5">
      <Card variant="elevated">
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="icon-slot h-12 w-12 text-primary">
                  <BookOpenText className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Compendio arcano</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Sinais, ritos, feitiços e hexes catalogados a partir do material do sistema Witcher.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <DataSection label="Entradas" value={filteredSpells.length} variant="quiet" />
              <DataSection label="Vigor total" value={totalVigor} variant="quiet" />
              <DataSection label="Tradicoes" value={filterTradition === "todas" ? "Todas" : traditionMeta[filterTradition].label} variant="quiet" />
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={filterTradition === "todas" ? "primary" : "outline"}
          onClick={() => setFilterTradition("todas")}
        >
          Todas
        </Button>

        {(Object.keys(traditionMeta) as WitcherSpellDefinition["tradition"][]).map((tradition) => (
          <Button
            key={tradition}
            size="sm"
            variant={filterTradition === tradition ? "primary" : "outline"}
            onClick={() => setFilterTradition(tradition)}
          >
            {traditionMeta[tradition].label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {filteredSpells.map((spell, index) => {
          const isOpen = selectedId === spell.id;
          const meta = traditionMeta[spell.tradition];

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
                        <Badge variant="outline">{spell.difficulty}</Badge>
                      </div>
                      <div>
                        <h3 className="font-heading text-xl text-foreground">{spell.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {spell.professionTags.join(" • ")}
                        </p>
                      </div>
                    </div>

                    <DataSection
                      label="Vigor"
                      value={spell.vigorCost}
                      icon={<WandSparkles className="h-4 w-4" />}
                      variant="quiet"
                      className="min-w-[130px]"
                    />
                  </div>

                  <p className="text-sm leading-7 text-foreground/88">{spell.description}</p>

                  {isOpen ? (
                    <div className="space-y-3">
                      <div className="grid gap-3 md:grid-cols-2">
                        <DataSection label="Conjuracao" value={spell.duration === "Instantaneo" ? "Acao rapida" : "Conjuracao ritual"} icon={<Clock3 className="h-4 w-4" />} variant="quiet" />
                        <DataSection label="Alcance" value={spell.range} icon={<Crosshair className="h-4 w-4" />} variant="quiet" />
                        <DataSection label="Duracao" value={spell.duration} icon={<Sparkles className="h-4 w-4" />} variant="quiet" />
                        <DataSection
                          label="Impacto"
                          value={spell.damage ?? "Utilitario"}
                          icon={spell.damage ? <Flame className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
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
    </div>
  );
}
