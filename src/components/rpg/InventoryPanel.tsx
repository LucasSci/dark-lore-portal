import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Package, Sword, Shield, FlaskConical, ScrollText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { RARITY_COLORS } from "@/lib/rpg-utils";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  arma: <Sword className="w-4 h-4" />,
  armadura: <Shield className="w-4 h-4" />,
  pocao: <FlaskConical className="w-4 h-4" />,
  pergaminho: <ScrollText className="w-4 h-4" />,
  material: <Package className="w-4 h-4" />,
  miscelanea: <Package className="w-4 h-4" />,
};

const TYPE_LABELS: Record<string, string> = {
  arma: 'Armas',
  armadura: 'Armaduras',
  pocao: 'Poções',
  pergaminho: 'Pergaminhos',
  material: 'Materiais',
  miscelanea: 'Miscelânea',
};

const RARITY_LABELS: Record<string, string> = {
  comum: 'Comum',
  incomum: 'Incomum',
  raro: 'Raro',
  epico: 'Épico',
  lendario: 'Lendário',
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
    supabase.from('items').select('*').order('rarity').order('name').then(({ data }) => {
      if (data) setItems(data);
    });
  }, []);

  const filtered = filterType ? items.filter(i => i.item_type === filterType) : items;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => setFilterType(null)} className={`px-3 py-1 text-xs font-heading border rounded-sm transition-colors ${!filterType ? 'border-primary text-primary' : 'border-border text-muted-foreground hover:border-gold/30'}`}>
          Todos
        </button>
        {Object.entries(TYPE_LABELS).map(([key, label]) => (
          <button key={key} onClick={() => setFilterType(key)} className={`px-3 py-1 text-xs font-heading border rounded-sm transition-colors flex items-center gap-1 ${filterType === key ? 'border-primary text-primary' : 'border-border text-muted-foreground hover:border-gold/30'}`}>
            {TYPE_ICONS[key]} {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((item, i) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => setSelected(selected?.id === item.id ? null : item)}
            className={`p-4 border text-left transition-all ${selected?.id === item.id ? 'border-primary bg-primary/5' : 'border-border bg-card-gradient hover:border-gold/30'}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className={RARITY_COLORS[item.rarity] || 'text-foreground'}>{TYPE_ICONS[item.item_type]}</span>
                <div>
                  <h4 className={`font-heading text-sm ${RARITY_COLORS[item.rarity] || 'text-foreground'}`}>{item.name}</h4>
                  <span className="text-xs text-muted-foreground">{RARITY_LABELS[item.rarity]}</span>
                </div>
              </div>
              <span className="font-heading text-xs text-gold">{item.value} 🪙</span>
            </div>

            {selected?.id === item.id && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-3 pt-3 border-t border-border space-y-1 text-xs text-muted-foreground">
                <p>{item.description}</p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {item.damage && <div>⚔️ Dano: {item.damage}</div>}
                  {item.armor_bonus && <div>🛡️ Bônus CA: +{item.armor_bonus}</div>}
                  {item.effect && <div>✨ {item.effect}</div>}
                  <div>⚖️ Peso: {item.weight}kg</div>
                </div>
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
