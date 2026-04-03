import { useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Bomb, FlaskConical, Hammer, Package, Shield, Sword } from "lucide-react";

import { WITCHER_INVENTORY, type WitcherInventoryItem } from "@/lib/witcher-trpg-system";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const typeIcons: Record<WitcherInventoryItem["category"], ReactNode> = {
  arma: <Sword className="h-4 w-4" />,
  armadura: <Shield className="h-4 w-4" />,
  alquimico: <FlaskConical className="h-4 w-4" />,
  ferramenta: <Hammer className="h-4 w-4" />,
  bomba: <Bomb className="h-4 w-4" />,
  material: <Package className="h-4 w-4" />,
};

const typeLabels: Record<WitcherInventoryItem["category"], string> = {
  arma: "Armas",
  armadura: "Armaduras",
  alquimico: "Alquimicos",
  ferramenta: "Ferramentas",
  bomba: "Bombas",
  material: "Materiais",
};

const rarityVariants: Record<WitcherInventoryItem["rarity"], "outline" | "secondary" | "info" | "warning"> = {
  comum: "outline",
  incomum: "secondary",
  raro: "info",
  epico: "warning",
};

interface Props {
  onImportItem?: (item: WitcherInventoryItem) => void;
}

export default function InventoryPanel({ onImportItem }: Props) {
  const [filterType, setFilterType] = useState<WitcherInventoryItem["category"] | null>(null);
  const [selected, setSelected] = useState<WitcherInventoryItem | null>(null);

  const filteredItems = useMemo(
    () => (filterType ? WITCHER_INVENTORY.filter((item) => item.category === filterType) : WITCHER_INVENTORY),
    [filterType],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setFilterType(null)}
          className={`border px-3 py-1 text-[11px] uppercase tracking-[0.18em] transition-colors ${
            !filterType ? "border-primary/35 bg-primary/10 text-primary" : "border-border/70 text-muted-foreground"
          }`}
        >
          Todos
        </button>

        {Object.entries(typeLabels).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilterType(key as WitcherInventoryItem["category"])}
            className={`border px-3 py-1 text-[11px] uppercase tracking-[0.18em] transition-colors ${
              filterType === key ? "border-primary/35 bg-primary/10 text-primary" : "border-border/70 text-muted-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {filteredItems.map((item, index) => (
          <motion.button
            key={item.id}
            type="button"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            onClick={() => setSelected((previous) => (previous?.id === item.id ? null : item))}
            className="text-left"
          >
            <Card variant={selected?.id === item.id ? "elevated" : "panel"}>
              <CardContent className="space-y-4 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="icon-slot h-9 w-9 text-primary">
                      {typeIcons[item.category]}
                    </div>
                    <div>
                      <h4 className="font-heading text-sm text-foreground">{item.name}</h4>
                      <p className="mt-1 text-xs text-muted-foreground">{typeLabels[item.category]}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <Badge variant={rarityVariants[item.rarity]}>{item.rarity}</Badge>
                    <p className="mt-2 text-xs text-muted-foreground">{item.value} coroas</p>
                  </div>
                </div>

                {selected?.id === item.id ? (
                  <div className="space-y-3 border-t border-border/70 pt-3 text-sm text-muted-foreground">
                    <p>{item.description}</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {item.damage ? <p>Dano: {item.damage}</p> : null}
                      {item.stoppingPower > 0 ? <p>Protecao: {item.stoppingPower}</p> : null}
                      {item.effect ? <p>Efeito: {item.effect}</p> : null}
                      <p>Peso: {item.weight} kg</p>
                      {item.hands ? <p>Empunhadura: {item.hands}</p> : null}
                    </div>
                    {onImportItem ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(event) => {
                          event.stopPropagation();
                          onImportItem(item);
                        }}
                      >
                        Adicionar a ficha
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
