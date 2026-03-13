import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FlaskConical, Package, ScrollText, Shield, Sword } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const typeIcons: Record<string, React.ReactNode> = {
  arma: <Sword className="h-4 w-4" />,
  armadura: <Shield className="h-4 w-4" />,
  pocao: <FlaskConical className="h-4 w-4" />,
  pergaminho: <ScrollText className="h-4 w-4" />,
  material: <Package className="h-4 w-4" />,
  miscelanea: <Package className="h-4 w-4" />,
};

const typeLabels: Record<string, string> = {
  arma: "Armas",
  armadura: "Armaduras",
  pocao: "Pocoes",
  pergaminho: "Pergaminhos",
  material: "Materiais",
  miscelanea: "Miscelanea",
};

const rarityVariants: Record<string, "outline" | "secondary" | "info" | "warning" | "danger"> = {
  comum: "outline",
  incomum: "secondary",
  raro: "info",
  epico: "warning",
  lendario: "danger",
};

interface Item {
  id: string;
  name: string;
  description: string | null;
  item_type: string;
  rarity: string;
  weight: number;
  value: number;
  damage: string | null;
  armor_bonus: number | null;
  effect: string | null;
}

export default function InventoryPanel() {
  const [items, setItems] = useState<Item[]>([]);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [selected, setSelected] = useState<Item | null>(null);

  useEffect(() => {
    supabase
      .from("items")
      .select("*")
      .order("rarity")
      .order("name")
      .then(({ data }) => {
        if (data) {
          setItems(data);
        }
      });
  }, []);

  const filteredItems = filterType ? items.filter((item) => item.item_type === filterType) : items;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setFilterType(null)}
          className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.18em] transition-colors ${
            !filterType ? "border-primary/35 bg-primary/10 text-primary" : "border-border/70 text-muted-foreground"
          }`}
        >
          Todos
        </button>

        {Object.entries(typeLabels).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilterType(key)}
            className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.18em] transition-colors ${
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
                    <div className="rounded-full border border-border/60 bg-background/50 p-2 text-primary">
                      {typeIcons[item.item_type] ?? <Package className="h-4 w-4" />}
                    </div>
                    <div>
                      <h4 className="font-heading text-sm text-foreground">{item.name}</h4>
                      <p className="mt-1 text-xs text-muted-foreground">{typeLabels[item.item_type] ?? "Item"}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <Badge variant={rarityVariants[item.rarity] ?? "outline"}>{item.rarity}</Badge>
                    <p className="mt-2 text-xs text-muted-foreground">{item.value} ouro</p>
                  </div>
                </div>

                {selected?.id === item.id ? (
                  <div className="space-y-3 border-t border-border/70 pt-3 text-sm text-muted-foreground">
                    <p>{item.description ?? "Sem descricao adicional."}</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {item.damage ? <p>Dano: {item.damage}</p> : null}
                      {item.armor_bonus ? <p>Bonus de CA: +{item.armor_bonus}</p> : null}
                      {item.effect ? <p>Efeito: {item.effect}</p> : null}
                      <p>Peso: {item.weight} kg</p>
                    </div>
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
