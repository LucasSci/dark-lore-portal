import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BookMarked, Dices, ScrollText, WandSparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useParams, useSearchParams } from "react-router-dom";

import CharacterSheet from "@/components/rpg/CharacterSheet";
import DiceRoller from "@/components/rpg/DiceRoller";
import InventoryPanel from "@/components/rpg/InventoryPanel";
import SpellBook from "@/components/rpg/SpellBook";
import {
  ActionStrip,
  MetricCard,
  PanelCard,
  SectionHeader,
  SidebarModule,
  StatusBanner,
} from "@/components/product/ProductShell";
import { NOIR_CHRONICLE_SHEET } from "@/lib/sheets/noir-chronicle-sheet";
import {
  loadCharacterBundle,
  persistCharacterBundle,
} from "@/lib/sheets/persistence";
import { useCharacterSheetRuntime } from "@/lib/sheets/runtime";
import type { WitcherInventoryItem, WitcherSpellDefinition } from "@/lib/witcher-trpg-system";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePortalShellMode } from "@/lib/portal-state";

export default function FichaPage() {
  usePortalShellMode("editorial", "interactive");

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
    <div className="session-page">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <section className="session-shell-hero">
          <SectionHeader
            kicker="Character Dossier / Ficha"
            title="Dossie jogavel, recursos taticos e persistencia no mesmo painel."
            description={
              <>
                <p>
                  A ficha agora fica claramente dentro da suite operacional. O bloco principal
                  continua sendo o personagem, mas rolagens, grimorio e inventario orbitam como
                  ferramentas do mesmo modulo.
                </p>
                <p>
                  O objetivo aqui e manter leitura rapida, edicao clara e continuidade de sessao.
                </p>
              </>
            }
            aside={
              <>
                <span className="session-topbar-meta">{sourceLabel}</span>
                <span className="session-topbar-meta">
                  {activeBundle?.character?.name ?? "Sem personagem"}
                </span>
                <span className="session-topbar-meta">
                  Nivel {Number(sheetRuntime.store.values.level ?? activeBundle?.character.level ?? 1)}
                </span>
              </>
            }
          />

          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_360px]">
            <div className="space-y-5">
              <ActionStrip>
                <Link to="/criacao" className="session-shell-action">
                  <BookMarked className="h-4 w-4" />
                  Nova ficha
                </Link>
                <Link to="/mestre" className="session-shell-action">
                  <ScrollText className="h-4 w-4" />
                  Painel do mestre
                </Link>
                <Link to="/story-engine" className="session-shell-action">
                  <WandSparkles className="h-4 w-4" />
                  Story Engine
                </Link>
              </ActionStrip>

              <div className="grid gap-4 md:grid-cols-3">
                <MetricCard
                  label="Origem"
                  value={
                    activeBundle?.source === "remote"
                      ? "Cloud"
                      : activeBundle?.source === "local"
                        ? "Cache local"
                        : "Arquivo inicial"
                  }
                  detail="A ficha continua sincronizando revisoes mais recentes da runtime."
                />
                <MetricCard
                  label="Inventario"
                  value={`${sheetRuntime.store.repeaters.inventory?.length ?? 0} itens`}
                  detail="Carga, armas, componentes e equipamentos ativos."
                />
                <MetricCard
                  label="Grimorio"
                  value={`${sheetRuntime.store.repeaters.spellbook?.length ?? 0} entradas`}
                  detail="Sinais, ritos e magias prontas para consulta."
                />
              </div>

              <StatusBanner title="Persistencia" tone="info">
                A runtime salva novas revisoes automaticamente quando a ficha muda e o bundle ativo
                permanece consistente entre recargas da pagina.
              </StatusBanner>
            </div>

            <div className="session-shell-sidebar">
              <SidebarModule
                title="Estado do personagem"
                description="Leitura curta do que importa antes de voltar para a mesa."
              >
                <div className="session-shell-list">
                  <div className="session-shell-list-item">
                    <p className="session-shell-list-item-title">Raca</p>
                    <p className="session-shell-list-item-copy">
                      {String(
                        sheetRuntime.store.values.race ?? activeBundle?.character.race ?? "humano",
                      )}
                    </p>
                  </div>
                  <div className="session-shell-list-item">
                    <p className="session-shell-list-item-title">Profissao</p>
                    <p className="session-shell-list-item-copy">
                      {String(
                        sheetRuntime.store.values.class ??
                          activeBundle?.character.class ??
                          "witcher",
                      )}
                    </p>
                  </div>
                  <div className="session-shell-list-item">
                    <p className="session-shell-list-item-title">Ouro</p>
                    <p className="session-shell-list-item-copy">
                      {Number(
                        sheetRuntime.store.values.gold ?? activeBundle?.character.gold ?? 0,
                      )}{" "}
                      coroas
                    </p>
                  </div>
                </div>
              </SidebarModule>
            </div>
          </div>
        </section>

        {bundleQuery.isLoading ? (
          <StatusBanner title="Carregando bundle" tone="info">
            Carregando a ficha persistida e os bindings da runtime.
          </StatusBanner>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <PanelCard
            title="Dossie principal"
            description="O corpo central da ficha permanece como area principal de leitura e edicao."
          >
            <CharacterSheet store={sheetRuntime.store} definition={NOIR_CHRONICLE_SHEET} />
          </PanelCard>
          <div className="space-y-4">
            <SidebarModule
              title="Leitura geral"
              description="Resumo tatico para consulta curta."
            >
              <div className="session-shell-list">
                <div className="session-shell-list-item">
                  <p className="session-shell-list-item-title">Origem</p>
                  <p className="session-shell-list-item-copy">{sourceLabel}</p>
                </div>
                <div className="session-shell-list-item">
                  <p className="session-shell-list-item-title">Bindings</p>
                  <p className="session-shell-list-item-copy">
                    {sheetRuntime.store.repeaters.inventory?.length ?? 0} itens ·{" "}
                    {sheetRuntime.store.repeaters.spellbook?.length ?? 0} magias
                  </p>
                </div>
              </div>
            </SidebarModule>
          </div>
        </div>

        <PanelCard
          title="Ferramentas auxiliares"
          description="Rolagem, inventario e grimorio ficam abaixo da ficha principal, preservando um fluxo claro de leitura."
        >
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
            <div className="session-shell-panel" data-tone="muted">
              <DiceRoller />
            </div>
          </TabsContent>
          <TabsContent value="inventario" className="mt-0">
            <div className="session-shell-panel" data-tone="muted">
              <InventoryPanel onImportItem={handleImportItem} />
            </div>
          </TabsContent>
          <TabsContent value="magias" className="mt-0">
            <div className="session-shell-panel" data-tone="muted">
              <SpellBook onImportSpell={handleImportSpell} />
            </div>
          </TabsContent>
        </Tabs>
        </PanelCard>
      </motion.div>
    </div>
  );
}
