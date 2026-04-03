import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BookMarked, Dices, ScrollText, WandSparkles } from "lucide-react";
import { toast } from "sonner";
import { useParams, useSearchParams } from "react-router-dom";

import CharacterSheet from "@/components/rpg/CharacterSheet";
import DiceRoller from "@/components/rpg/DiceRoller";
import InventoryPanel from "@/components/rpg/InventoryPanel";
import SpellBook from "@/components/rpg/SpellBook";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DataSection } from "@/components/ui/data-section";
import { NOIR_CHRONICLE_SHEET } from "@/lib/sheets/noir-chronicle-sheet";
import {
  loadCharacterBundle,
  persistCharacterBundle,
} from "@/lib/sheets/persistence";
import { useCharacterSheetRuntime } from "@/lib/sheets/runtime";
import type { WitcherInventoryItem, WitcherSpellDefinition } from "@/lib/witcher-trpg-system";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function FichaPage() {
  const { sheetId } = useParams();
  const [searchParams] = useSearchParams();
  const requestedCharacterId = sheetId ?? searchParams.get("character");
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
    return () => {
      cancelled = true;
    };
  }, [activeBundle?.character, activeBundle?.sheetDefinitionId, sheetRuntime.store]);

  const handleImportItem = async (item: WitcherInventoryItem) => {
    await sheetRuntime.importCompendiumData(NOIR_CHRONICLE_SHEET.bindings.inventory, {
      id: item.id,
      kind: "inventory",
      values: {
        name: item.name,
        description: item.description ?? "",
        item_type: item.category,
        rarity: item.rarity,
        weight: item.weight,
        value: item.value,
        damage: item.damage ?? "",
        armor_bonus: item.stoppingPower ?? 0,
        stopping_power: item.stoppingPower ?? 0,
        effect: item.effect ?? "",
        hands: item.hands ?? "",
        equipped: false,
      },
    });
    toast.success(`${item.name} vinculado ao inventario.`);
  };

  const handleImportSpell = async (spell: WitcherSpellDefinition) => {
    await sheetRuntime.importCompendiumData(NOIR_CHRONICLE_SHEET.bindings.spellbook, {
      id: spell.id,
      kind: "spellbook",
      values: {
        name: spell.name,
        description: spell.description ?? "",
        school: spell.tradition,
        level: 1,
        casting_time: spell.difficulty,
        range: spell.range,
        duration: spell.duration,
        damage: spell.damage ?? "",
        mp_cost: spell.vigorCost,
        tradition: spell.tradition,
        difficulty: spell.difficulty,
      },
    });
    toast.success(`${spell.name} vinculada ao grimorio.`);
  };

  const sourceLabel =
    activeBundle?.source === "remote"
      ? "Ficha persistida"
      : activeBundle?.source === "local"
        ? "Ficha local"
        : "Ficha narrativa";

  return (
    <div className="container py-12 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12"
      >
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_340px]">
          <Card variant="elevated" className="overflow-hidden">
            <CardContent className="grid gap-8 p-6 md:p-8 xl:grid-cols-[minmax(0,1fr)_280px]">
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="outline">{sourceLabel}</Badge>
                  <Badge variant="info">
                    {activeBundle?.character?.name ? activeBundle.character.name : "Sem personagem carregado"}
                  </Badge>
                </div>

                <div className="max-w-3xl space-y-4">
                <p className="section-kicker">Ficha narrativa</p>
                  <h1 className="font-display text-5xl leading-[0.95] text-brand-gradient md:text-6xl">
                    Ficha, grimorio e inventario organizados como um unico dossie jogavel.
                  </h1>
                  <p className="text-base leading-8 text-foreground/88">
                    A pagina foi reestruturada para destacar a ficha principal, separar ferramentas
                    auxiliares e manter a persistencia sempre legivel.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <DataSection
                    label="Origem"
                    value={
                      activeBundle?.source === "remote"
                        ? "Cloud"
                        : activeBundle?.source === "local"
                          ? "Cache local"
                          : "Arquivo inicial"
                    }
                    variant="quiet"
                  />
                  <DataSection
                    label="Bindings"
                    value={`${sheetRuntime.store.repeaters.inventory?.length ?? 0} itens`}
                    variant="quiet"
                    tone="info"
                  />
                  <DataSection
                    label="Magias"
                    value={`${sheetRuntime.store.repeaters.spellbook?.length ?? 0} registradas`}
                    variant="quiet"
                  />
                </div>
              </div>

              <Card variant="panel">
                <CardContent className="space-y-4 p-5">
                  <div>
                    <p className="section-kicker">Resumo do personagem</p>
                    <h2 className="mt-2 font-heading text-2xl text-foreground">
                      Estado da ficha
                    </h2>
                  </div>

                  <DataSection
                    label="Raca"
                    value={String(
                      sheetRuntime.store.values.race ?? activeBundle?.character.race ?? "humano",
                    )}
                    variant="quiet"
                  />
                  <DataSection
                    label="Profissao"
                    value={String(
                      sheetRuntime.store.values.class ?? activeBundle?.character.class ?? "witcher",
                    )}
                    variant="quiet"
                  />
                  <DataSection
                    label="Nivel"
                    value={Number(sheetRuntime.store.values.level ?? activeBundle?.character.level ?? 1)}
                    variant="quiet"
                    tone="info"
                  />
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            <DataSection label="Ouro" value={Number(sheetRuntime.store.values.gold ?? activeBundle?.character.gold ?? 0)} />
            <DataSection
              label="Persistencia"
              value="Sincroniza quando ha nova revisao da ficha"
              tone="info"
            />
          </div>
        </section>

        {bundleQuery.isLoading ? (
          <Card variant="panel">
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              Carregando a ficha persistida...
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <CharacterSheet store={sheetRuntime.store} definition={NOIR_CHRONICLE_SHEET} />
          <div className="space-y-4">
            <Card variant="panel">
              <CardContent className="space-y-3 p-6">
                <div>
                    <p className="section-kicker">Leitura geral</p>
                  <h2 className="mt-2 font-heading text-2xl text-foreground">
                    Resumo rapido
                  </h2>
                </div>

                <DataSection
                  label="Origem"
                  value={
                    activeBundle?.source === "remote"
                      ? "Cloud"
                      : activeBundle?.source === "local"
                        ? "Cache local"
                        : "Arquivo inicial"
                  }
                  variant="quiet"
                />
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
            <TabsTrigger value="dados">
              <Dices className="mr-2 h-4 w-4" />
              Dados
            </TabsTrigger>
            <TabsTrigger value="inventario">
              <ScrollText className="mr-2 h-4 w-4" />
              Inventario
            </TabsTrigger>
            <TabsTrigger value="magias">
              <WandSparkles className="mr-2 h-4 w-4" />
              Sinais e ritos
            </TabsTrigger>
          </TabsList>
          <TabsContent value="dados" className="mt-0">
            <Card variant="panel">
              <CardContent className="p-4 sm:p-6">
                <DiceRoller />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="inventario" className="mt-0">
            <Card variant="panel">
              <CardContent className="p-4 sm:p-6">
                <InventoryPanel onImportItem={handleImportItem} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="magias" className="mt-0">
            <Card variant="panel">
              <CardContent className="p-4 sm:p-6">
                <SpellBook onImportSpell={handleImportSpell} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
