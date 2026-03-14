import { useState } from "react";
import { motion } from "framer-motion";
import { BookMarked, Dices, ScrollText, WandSparkles } from "lucide-react";
import { toast } from "sonner";

import CharacterSheet from "@/components/rpg/CharacterSheet";
import DiceRoller from "@/components/rpg/DiceRoller";
import InventoryPanel from "@/components/rpg/InventoryPanel";
import SpellBook from "@/components/rpg/SpellBook";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataSection } from "@/components/ui/data-section";
import { NOIR_CHRONICLE_SHEET } from "@/lib/sheets/noir-chronicle-sheet";
import { useCharacterSheetRuntime } from "@/lib/sheets/runtime";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { buildDemoCharacter, type CharacterRow } from "@/lib/rpg-ui";

export default function FichaPage() {
  const [activeCharacter] = useState<CharacterRow>(() => buildDemoCharacter());
  const sheetRuntime = useCharacterSheetRuntime({
    definition: NOIR_CHRONICLE_SHEET,
    character: activeCharacter,
  });

  const handleImportItem = async (item: {
    id: string; name: string; description: string | null; item_type: string;
    rarity: string; weight: number; value: number; damage: string | null;
    armor_bonus: number | null; effect: string | null;
  }) => {
    await sheetRuntime.importCompendiumData(NOIR_CHRONICLE_SHEET.bindings.inventory, {
      id: item.id, kind: "inventory",
      values: {
        name: item.name, description: item.description ?? "", item_type: item.item_type,
        rarity: item.rarity, weight: item.weight, value: item.value, damage: item.damage ?? "",
        armor_bonus: item.armor_bonus ?? 0, effect: item.effect ?? "", equipped: false,
      },
    });
    toast.success(`${item.name} vinculado ao inventário.`);
  };

  const handleImportSpell = async (spell: {
    id: string; name: string; description: string | null; school: string;
    level: number; casting_time: string; range: string; duration: string;
    damage: string | null; mp_cost: number;
  }) => {
    await sheetRuntime.importCompendiumData(NOIR_CHRONICLE_SHEET.bindings.spellbook, {
      id: spell.id, kind: "spellbook",
      values: {
        name: spell.name, description: spell.description ?? "", school: spell.school,
        level: spell.level, casting_time: spell.casting_time, range: spell.range,
        duration: spell.duration, damage: spell.damage ?? "", mp_cost: spell.mp_cost,
      },
    });
    toast.success(`${spell.name} vinculada ao grimório.`);
  };

  return (
    <div className="container py-20">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="outline">Ficha Narrativa</Badge>
          <h1 className="mt-4 font-display text-4xl text-gold-gradient md:text-5xl">
            Ficha de Personagem
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
            Visualize e gerencie sua ficha, inventário, grimório e dados.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <CharacterSheet store={sheetRuntime.store} definition={NOIR_CHRONICLE_SHEET} />
          <div className="space-y-4">
            <Card variant="panel">
              <CardHeader><CardTitle className="text-xl">Resumo rápido</CardTitle></CardHeader>
              <CardContent className="space-y-3 pt-0">
                <DataSection label="Raça" value={String(sheetRuntime.store.values.race ?? activeCharacter.race)} variant="quiet" />
                <DataSection label="Classe" value={String(sheetRuntime.store.values.class ?? activeCharacter.class)} variant="quiet" />
                <DataSection label="Nível" value={Number(sheetRuntime.store.values.level ?? activeCharacter.level)} variant="quiet" />
                <DataSection label="Ouro" value={Number(sheetRuntime.store.values.gold ?? activeCharacter.gold)} variant="quiet" />
                <DataSection
                  label="Bindings"
                  value={`${sheetRuntime.store.repeaters.inventory?.length ?? 0} itens | ${sheetRuntime.store.repeaters.spellbook?.length ?? 0} magias`}
                  variant="quiet"
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="dados" className="space-y-4">
          <TabsList className="grid h-auto w-full grid-cols-3">
            <TabsTrigger value="dados" className="font-heading uppercase tracking-[0.18em]">
              <Dices className="mr-2 h-4 w-4" /> Dados
            </TabsTrigger>
            <TabsTrigger value="inventario" className="font-heading uppercase tracking-[0.18em]">
              <ScrollText className="mr-2 h-4 w-4" /> Inventário
            </TabsTrigger>
            <TabsTrigger value="magias" className="font-heading uppercase tracking-[0.18em]">
              <WandSparkles className="mr-2 h-4 w-4" /> Magias
            </TabsTrigger>
          </TabsList>
          <TabsContent value="dados" className="mt-0">
            <Card variant="panel"><CardContent className="p-6"><DiceRoller /></CardContent></Card>
          </TabsContent>
          <TabsContent value="inventario" className="mt-0">
            <Card variant="panel"><CardContent className="p-6"><InventoryPanel onImportItem={handleImportItem} /></CardContent></Card>
          </TabsContent>
          <TabsContent value="magias" className="mt-0">
            <Card variant="panel"><CardContent className="p-6"><SpellBook onImportSpell={handleImportSpell} /></CardContent></Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
