import { useState } from "react";
import { motion } from "framer-motion";
import { Sword, Users, Dice6, UserPlus, BookOpen, Package, Crown, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CharacterCreator from "@/components/rpg/CharacterCreator";
import CharacterSheet from "@/components/rpg/CharacterSheet";
import DiceRoller from "@/components/rpg/DiceRoller";
import CombatTracker from "@/components/rpg/CombatTracker";
import SpellBook from "@/components/rpg/SpellBook";
import InventoryPanel from "@/components/rpg/InventoryPanel";
import GameMasterPanel from "@/components/rpg/GameMasterPanel";
import type { Database } from "@/integrations/supabase/types";

type Character = Database['public']['Tables']['characters']['Row'];

const DEMO_CHARACTER: Character = {
  id: 'demo',
  user_id: 'demo',
  name: 'Thorin Escudo de Ferro',
  race: 'anao',
  class: 'guerreiro',
  level: 5,
  experience: 6500,
  forca: 18,
  destreza: 12,
  constituicao: 16,
  inteligencia: 10,
  sabedoria: 13,
  carisma: 8,
  hp_max: 52,
  hp_current: 38,
  mp_max: 0,
  mp_current: 0,
  armor_class: 18,
  initiative_bonus: 1,
  speed: 25,
  gold: 350,
  background: 'Thorin foi criado nas minas profundas de Khaz Modan, onde aprendeu a arte da guerra e a forja de armas. Após a destruição de seu clã pelos orcs das sombras, jurou vingança e partiu em busca de aliados.',
  appearance: 'Anão robusto com barba ruiva trançada, cicatriz sobre o olho esquerdo e armadura de placas gravada com runas ancestrais.',
  portrait_url: null,
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export default function PlayPage() {
  const [activeTab, setActiveTab] = useState("ficha");

  const tabItems = [
    { value: "ficha", label: "Ficha", icon: <UserPlus className="w-4 h-4" /> },
    { value: "criar", label: "Criar", icon: <Users className="w-4 h-4" /> },
    { value: "dados", label: "Dados", icon: <Dice6 className="w-4 h-4" /> },
    { value: "combate", label: "Combate", icon: <Sword className="w-4 h-4" /> },
    { value: "magias", label: "Magias", icon: <Sparkles className="w-4 h-4" /> },
    { value: "itens", label: "Itens", icon: <Package className="w-4 h-4" /> },
    { value: "mestre", label: "Mestre", icon: <Crown className="w-4 h-4" /> },
  ];

  return (
    <div className="container py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <Sword className="w-10 h-10 text-primary mx-auto mb-4" />
        <h1 className="font-display text-3xl md:text-5xl text-gold-gradient mb-4">
          Sistema de RPG
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Crie personagens, role dados, gerencie combates e explore o Realm of Shadows.
        </p>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-4xl mx-auto">
        <TabsList className="w-full bg-secondary/50 border border-border p-1 flex flex-wrap h-auto gap-1">
          {tabItems.map(tab => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex items-center gap-1.5 font-heading text-xs tracking-wider uppercase data-[state=active]:bg-primary/10 data-[state=active]:text-primary flex-1 min-w-[80px]"
            >
              {tab.icon} <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-8">
          <TabsContent value="ficha">
            <CharacterSheet character={DEMO_CHARACTER} />
          </TabsContent>

          <TabsContent value="criar">
            <CharacterCreator onSave={(data) => console.log('Character created:', data)} />
          </TabsContent>

          <TabsContent value="dados">
            <DiceRoller />
          </TabsContent>

          <TabsContent value="combate">
            <CombatTracker />
          </TabsContent>

          <TabsContent value="magias">
            <SpellBook />
          </TabsContent>

          <TabsContent value="itens">
            <InventoryPanel />
          </TabsContent>

          <TabsContent value="mestre">
            <GameMasterPanel />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
