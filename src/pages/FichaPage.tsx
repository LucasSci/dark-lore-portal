import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Dices, ScrollText, WandSparkles } from "lucide-react";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";

import CharacterSheet from "@/components/rpg/CharacterSheet";
import DiceRoller from "@/components/rpg/DiceRoller";
import InventoryPanel from "@/components/rpg/InventoryPanel";
import SpellBook from "@/components/rpg/SpellBook";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataSection } from "@/components/ui/data-section";
import { NOIR_CHRONICLE_SHEET } from "@/lib/sheets/noir-chronicle-sheet";
import {
  loadCharacterBundle,
  persistCharacterBundle,
} from "@/lib/sheets/persistence";
import { useCharacterSheetRuntime } from "@/lib/sheets/runtime";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function FichaPage() {
  const [searchParams] = useSearchParams();
  const requestedCharacterId = searchParams.get("character");
  const bundleQuery = useQuery({
    queryKey: ["character-bundle", requestedCharacterId ?? "latest"],
    queryFn: () => loadCharacterBundle(requestedCharacterId),
    staleTime: 30_000,
  });
  const activeBundle = bundleQuery.data ?? null;
  const lastSyncedRevisionRef = useRef<number | null>(null);

  const sheetRuntime = useCharacterSheetRuntime({
    definition: NOIR_CHRONICLE_SHEET,
    character: activeBundle?.character,
    initialStore: activeBundle?.store,
  });

  useEffect(() => {
    lastSyncedRevisionRef.current = activeBundle?.store.revision ?? null;
  }, [activeBundle?.character.id, activeBundle?.store.revision]);

  useEffect(() => {
    if (!activeBundle?.character) return;
    if (sheetRuntime.store.characterId !== activeBundle.character.id) return;
    const lastSyncedRevision = lastSyncedRevisionRef.current ?? 0;
    if (sheetRuntime.store.revision <= lastSyncedRevision) return;

    let cancelled = false;
    void persistCharacterBundle(
      activeBundle.character,
      sheetRuntime.store,
      activeBundle.sheetDefinitionId,
      "sheet-ui",
    ).then((persisted) => {
      if (cancelled) return;
      lastSyncedRevisionRef.current = persisted.store.revision;
    });
    return () => { cancelled = true; };
  }, [activeBundle?.character, activeBundle?.sheetDefinitionId, sheetRuntime.store]);

  const handleImportItem = async (item: {
    id: string; name: string; description: string | null; item_type: string;
    rarity: string; weight: number; value: number; damage: string | null;
    armor_bonus: number | null; effect: string | null;
  }) => {
    await sheetRuntime.importCompendiumData(NOIR_CHRONICLE_SHEET.bindings.inventory, {
      id: item.id, kind: "inventory",
      values: {
        name: item.name, description: item.description ?? "", item_type: item.item_type,
        rarity: item.rarity, weight: item.weight, value: item.value,
        damage: item.damage ?? "", armor_bonus: item.armor_bonus ?? 0,
        effect: item.effect ?? "", equipped: false,
      },
    });
    toast.success(`${item.name} vinculado ao inventario.`);
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
    toast.success(`${spell.name} vinculada ao grimorio.`);
  };

  return (
    <div className="container py-12 sm:py-20">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 sm:space-y-8">
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="outline">
            {activeBundle?.source === "remote"
              ? "Ficha Persistida"
              : activeBundle?.source === "local"
                ? "Ficha Local"
                : "Ficha Narrativa"}
          </Badge>
          <h1 className="mt-3 font-display text-3xl text-gold-gradient sm:mt-4 sm:text-4xl md:text-5xl">
            Ficha de Personagem
          </h1>
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:mt-4 sm:text-base sm:leading-7">
            Visualize e gerencie sua ficha, inventario, grimorio e dados.
          </p>
        </div>

        {bundleQuery.isLoading ? (
          <Card variant="panel">
            <CardContent className="p-6 text-center text-sm text-muted-foreground sm:p-8">
              Carregando a ficha persistida...
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <CharacterSheet store={sheetRuntime.store} definition={NOIR_CHRONICLE_SHEET} />
          <div className="space-y-4">
            <Card variant="panel">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Resumo rapido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <DataSection
                  label="Origem"
                  value={
                    activeBundle?.source === "remote" ? "Cloud"
                    : activeBundle?.source === "local" ? "Cache local"
                    : "Referencia inicial"
                  }
                  variant="quiet"
                />
                <DataSection label="Raca" value={String(sheetRuntime.store.values.race ?? activeBundle?.character.race ?? "humano")} variant="quiet" />
                <DataSection label="Classe" value={String(sheetRuntime.store.values.class ?? activeBundle?.character.class ?? "guerreiro")} variant="quiet" />
                <DataSection label="Nivel" value={Number(sheetRuntime.store.values.level ?? activeBundle?.character.level ?? 1)} variant="quiet" />
                <DataSection label="Ouro" value={Number(sheetRuntime.store.values.gold ?? activeBundle?.character.gold ?? 0)} variant="quiet" />
                <DataSection label="Bindings" value={`${sheetRuntime.store.repeaters.inventory?.length ?? 0} itens | ${sheetRuntime.store.repeaters.spellbook?.length ?? 0} magias`} variant="quiet" />
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="dados" className="space-y-4">
          <TabsList className="grid h-auto w-full grid-cols-3">
            <TabsTrigger value="dados" className="font-heading text-[11px] uppercase tracking-[0.14em] sm:text-xs sm:tracking-[0.18em]">
              <Dices className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" /> Dados
            </TabsTrigger>
            <TabsTrigger value="inventario" className="font-heading text-[11px] uppercase tracking-[0.14em] sm:text-xs sm:tracking-[0.18em]">
              <ScrollText className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" /> Inventario
            </TabsTrigger>
            <TabsTrigger value="magias" className="font-heading text-[11px] uppercase tracking-[0.14em] sm:text-xs sm:tracking-[0.18em]">
              <WandSparkles className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" /> Magias
            </TabsTrigger>
          </TabsList>
          <TabsContent value="dados" className="mt-0">
            <Card variant="panel"><CardContent className="p-4 sm:p-6"><DiceRoller /></CardContent></Card>
          </TabsContent>
          <TabsContent value="inventario" className="mt-0">
            <Card variant="panel"><CardContent className="p-4 sm:p-6"><InventoryPanel onImportItem={handleImportItem} /></CardContent></Card>
          </TabsContent>
          <TabsContent value="magias" className="mt-0">
            <Card variant="panel"><CardContent className="p-4 sm:p-6"><SpellBook onImportSpell={handleImportSpell} /></CardContent></Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
