import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const SCHOOL_COLORS: Record<string, string> = {
  evocacao: 'text-ember',
  abjuracao: 'text-primary',
  conjuracao: 'text-green-400',
  adivinhacao: 'text-mystic-light',
  encantamento: 'text-pink-400',
  ilusao: 'text-blue-400',
  necromancia: 'text-blood-light',
  transmutacao: 'text-gold-light',
};

const SCHOOL_LABELS: Record<string, string> = {
  evocacao: 'Evocação',
  abjuracao: 'Abjuração',
  conjuracao: 'Conjuração',
  adivinhacao: 'Adivinhação',
  encantamento: 'Encantamento',
  ilusao: 'Ilusão',
  necromancia: 'Necromancia',
  transmutacao: 'Transmutação',
};

interface Spell {
  id: string;
  name: string;
  description: string | null;
  school: string;
  level: number;
  casting_time: string;
  range: string;
  duration: string;
  damage: string | null;
  mp_cost: number;
}

export default function SpellBook() {
  const [spells, setSpells] = useState<Spell[]>([]);
  const [selected, setSelected] = useState<Spell | null>(null);
  const [filterSchool, setFilterSchool] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('spells').select('*').order('level').order('name').then(({ data }) => {
      if (data) setSpells(data);
    });
  }, []);

  const filtered = filterSchool ? spells.filter(s => s.school === filterSchool) : spells;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => setFilterSchool(null)} className={`px-3 py-1 text-xs font-heading border rounded-sm transition-colors ${!filterSchool ? 'border-primary text-primary' : 'border-border text-muted-foreground hover:border-gold/30'}`}>
          Todas
        </button>
        {Object.entries(SCHOOL_LABELS).map(([key, label]) => (
          <button key={key} onClick={() => setFilterSchool(key)} className={`px-3 py-1 text-xs font-heading border rounded-sm transition-colors ${filterSchool === key ? 'border-primary text-primary' : 'border-border text-muted-foreground hover:border-gold/30'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((spell, i) => (
          <motion.button
            key={spell.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => setSelected(selected?.id === spell.id ? null : spell)}
            className={`p-4 border text-left transition-all ${selected?.id === spell.id ? 'border-primary bg-primary/5' : 'border-border bg-card-gradient hover:border-gold/30'}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-heading text-sm text-foreground">{spell.name}</h4>
                <span className={`text-xs ${SCHOOL_COLORS[spell.school] || 'text-muted-foreground'}`}>
                  {SCHOOL_LABELS[spell.school]} · Nível {spell.level}
                </span>
              </div>
              <span className="font-heading text-xs text-mystic-light">{spell.mp_cost} MP</span>
            </div>

            {selected?.id === spell.id && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-3 pt-3 border-t border-border space-y-1 text-xs text-muted-foreground">
                <p>{spell.description}</p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>⏱ {spell.casting_time}</div>
                  <div>📏 {spell.range}</div>
                  <div>⏳ {spell.duration}</div>
                  {spell.damage && <div>💥 {spell.damage}</div>}
                </div>
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
