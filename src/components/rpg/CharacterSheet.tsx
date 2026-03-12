import { motion } from "framer-motion";
import { Heart, Droplets, Shield, Zap, Sword, Package } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ATTRIBUTES, RACES, CLASSES, getModifier, formatModifier, xpForLevel } from "@/lib/rpg-utils";
import type { Database } from "@/integrations/supabase/types";

type Character = Database['public']['Tables']['characters']['Row'];

interface Props {
  character: Character;
}

export default function CharacterSheet({ character }: Props) {
  const race = RACES.find(r => r.value === character.race);
  const cls = CLASSES.find(c => c.value === character.class);
  const hpPercent = (character.hp_current / character.hp_max) * 100;
  const mpPercent = character.mp_max > 0 ? (character.mp_current / character.mp_max) * 100 : 0;
  const xpNext = xpForLevel(character.level);
  const xpPercent = xpNext > 0 ? (character.experience / xpNext) * 100 : 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="p-6 bg-card-gradient border border-gold/20 rune-border">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-2xl text-gold-gradient">{character.name}</h2>
            <p className="font-heading text-sm text-muted-foreground">
              {race?.label} · {cls?.label} · Nível {character.level}
            </p>
          </div>
          <div className="text-right">
            <span className="font-heading text-xs text-muted-foreground">XP</span>
            <p className="font-heading text-sm text-foreground">{character.experience} / {xpNext}</p>
            <Progress value={xpPercent} className="h-1 w-24 mt-1" />
          </div>
        </div>
      </div>

      {/* Vital Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-card-gradient border border-border text-center">
          <Heart className="w-5 h-5 text-blood-light mx-auto mb-1" />
          <span className="font-heading text-xs text-muted-foreground">HP</span>
          <p className="font-heading text-xl text-foreground">{character.hp_current}/{character.hp_max}</p>
          <Progress value={hpPercent} className="h-1.5 mt-2 [&>div]:bg-blood-light" />
        </div>
        <div className="p-4 bg-card-gradient border border-border text-center">
          <Droplets className="w-5 h-5 text-mystic-light mx-auto mb-1" />
          <span className="font-heading text-xs text-muted-foreground">MP</span>
          <p className="font-heading text-xl text-foreground">{character.mp_current}/{character.mp_max}</p>
          <Progress value={mpPercent} className="h-1.5 mt-2 [&>div]:bg-mystic-light" />
        </div>
        <div className="p-4 bg-card-gradient border border-border text-center">
          <Shield className="w-5 h-5 text-primary mx-auto mb-1" />
          <span className="font-heading text-xs text-muted-foreground">CA</span>
          <p className="font-heading text-xl text-foreground">{character.armor_class}</p>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-secondary/50 border border-border text-center">
          <Zap className="w-4 h-4 text-gold mx-auto mb-1" />
          <span className="text-xs text-muted-foreground">Iniciativa</span>
          <p className="font-heading text-foreground">{formatModifier(character.initiative_bonus)}</p>
        </div>
        <div className="p-3 bg-secondary/50 border border-border text-center">
          <Sword className="w-4 h-4 text-gold mx-auto mb-1" />
          <span className="text-xs text-muted-foreground">Velocidade</span>
          <p className="font-heading text-foreground">{character.speed}ft</p>
        </div>
        <div className="p-3 bg-secondary/50 border border-border text-center">
          <Package className="w-4 h-4 text-gold mx-auto mb-1" />
          <span className="text-xs text-muted-foreground">Ouro</span>
          <p className="font-heading text-foreground">{character.gold}</p>
        </div>
      </div>

      {/* Attributes */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {ATTRIBUTES.map(attr => {
          const val = character[attr.key as keyof Character] as number;
          const mod = getModifier(val);
          return (
            <div key={attr.key} className="p-3 bg-card-gradient border border-border text-center">
              <span className="text-sm">{attr.icon}</span>
              <p className="font-heading text-[10px] tracking-wider uppercase text-muted-foreground">{attr.abbr}</p>
              <p className="font-heading text-xl text-foreground">{val}</p>
              <p className={`font-heading text-xs ${mod >= 0 ? 'text-primary' : 'text-blood-light'}`}>
                {formatModifier(mod)}
              </p>
            </div>
          );
        })}
      </div>

      {/* Background */}
      {character.background && (
        <div className="p-4 bg-card-gradient border border-border">
          <h4 className="font-heading text-sm text-primary mb-2">História</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">{character.background}</p>
        </div>
      )}
    </motion.div>
  );
}
