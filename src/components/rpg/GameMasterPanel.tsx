import { useState } from "react";
import { motion } from "framer-motion";
import { Crown, Plus, Settings, Sword, Users } from "lucide-react";
import { toast } from "sonner";

import CombatTracker from "./CombatTracker";
import ConfirmActionDialog from "@/components/ui/confirm-action-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataSection } from "@/components/ui/data-section";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type GMTab = "sessoes" | "combate" | "npcs";

interface NPC {
  id: string;
  name: string;
  hp: number;
  ac: number;
  notes: string;
}

export default function GameMasterPanel() {
  const [tab, setTab] = useState<GMTab>("sessoes");
  const [npcs, setNpcs] = useState<NPC[]>([]);
  const [pendingRemoval, setPendingRemoval] = useState<NPC | null>(null);
  const [newNpc, setNewNpc] = useState({ name: "", hp: 20, ac: 12, notes: "" });

  const addNpc = () => {
    if (!newNpc.name.trim()) {
      toast.error("Defina um nome para o NPC.");
      return;
    }

    const nextNpc = { ...newNpc, id: `npc-${Date.now()}` };
    setNpcs((previous) => [...previous, nextNpc]);
    setNewNpc({ name: "", hp: 20, ac: 12, notes: "" });
    toast.success("NPC adicionado ao painel.");
  };

  const removeNpc = async () => {
    if (!pendingRemoval) {
      return;
    }

    setNpcs((previous) => previous.filter((npc) => npc.id !== pendingRemoval.id));
    toast.success("NPC removido.");
    setPendingRemoval(null);
  };

  return (
    <div className="space-y-6">
      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full border border-primary/20 bg-background/60 p-3 text-primary">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-2xl">Painel do mestre</CardTitle>
              <p className="text-sm text-muted-foreground">
                Sessao, combate e controle de NPCs organizados como um hub de direcao de mesa.
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={tab} onValueChange={(value) => setTab(value as GMTab)} className="space-y-4">
        <TabsList className="grid h-auto w-full grid-cols-3">
          <TabsTrigger value="sessoes" className="font-heading uppercase tracking-[0.18em]">
            <Crown className="mr-2 h-4 w-4" />
            Sessoes
          </TabsTrigger>
          <TabsTrigger value="combate" className="font-heading uppercase tracking-[0.18em]">
            <Sword className="mr-2 h-4 w-4" />
            Combate
          </TabsTrigger>
          <TabsTrigger value="npcs" className="font-heading uppercase tracking-[0.18em]">
            <Users className="mr-2 h-4 w-4" />
            NPCs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sessoes" className="mt-0">
          <Card variant="panel">
            <CardContent className="grid gap-4 p-6 md:grid-cols-3">
              <DataSection
                label="Sessao atual"
                value="Cripta de Velkyn"
                icon={<Settings className="h-4 w-4" />}
                aside={<span className="text-xs text-muted-foreground">Demo</span>}
              >
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Use este espaco como ponto central para narracao, estados e preparacao de encontro.
                </p>
              </DataSection>
              <DataSection label="Jogadores" value="3 ativos" variant="quiet" />
              <DataSection label="Cena" value="Santuario em ruinas" variant="quiet" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="combate" className="mt-0">
          <CombatTracker />
        </TabsContent>

        <TabsContent value="npcs" className="mt-0 space-y-4">
          <Card variant="panel">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-heading text-lg text-foreground">Criar NPC</h3>
                  <p className="text-sm text-muted-foreground">
                    Monte antagonistas, aliados ou figuras recorrentes sem sair do fluxo da mesa.
                  </p>
                </div>
                <Button onClick={addNpc}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar
                </Button>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <Input
                  placeholder="Nome do NPC"
                  value={newNpc.name}
                  onChange={(event) => setNewNpc((previous) => ({ ...previous, name: event.target.value }))}
                />
                <Input
                  type="number"
                  placeholder="HP"
                  value={newNpc.hp}
                  onChange={(event) => setNewNpc((previous) => ({ ...previous, hp: Number(event.target.value) }))}
                />
                <Input
                  type="number"
                  placeholder="CA"
                  value={newNpc.ac}
                  onChange={(event) => setNewNpc((previous) => ({ ...previous, ac: Number(event.target.value) }))}
                />
              </div>

              <Textarea
                placeholder="Notas de comportamento, voz, gatilhos narrativos ou objetivos."
                value={newNpc.notes}
                onChange={(event) => setNewNpc((previous) => ({ ...previous, notes: event.target.value }))}
                className="min-h-[120px]"
              />
            </CardContent>
          </Card>

          <div className="grid gap-3">
            {npcs.length === 0 ? (
              <Card variant="outline">
                <CardContent className="p-10 text-center text-sm text-muted-foreground">
                  Nenhum NPC criado ainda.
                </CardContent>
              </Card>
            ) : (
              npcs.map((npc, index) => (
                <motion.div
                  key={npc.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                >
                  <Card variant="panel">
                    <CardContent className="grid gap-4 p-5 md:grid-cols-[minmax(0,1fr)_220px]">
                      <div>
                        <h4 className="font-heading text-lg text-foreground">{npc.name}</h4>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {npc.notes || "Sem notas adicionais."}
                        </p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
                        <DataSection label="HP" value={npc.hp} variant="quiet" />
                        <DataSection label="Armadura" value={`CA ${npc.ac}`} variant="quiet" />
                        <Button variant="danger" onClick={() => setPendingRemoval(npc)}>
                          Remover NPC
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      <ConfirmActionDialog
        open={!!pendingRemoval}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setPendingRemoval(null);
          }
        }}
        title="Remover NPC?"
        description={`Esta acao remove ${pendingRemoval?.name ?? "este NPC"} do painel atual.`}
        confirmLabel="Remover"
        pendingLabel="Removendo..."
        onConfirm={removeNpc}
      />
    </div>
  );
}
