import { useMemo, useState } from "react";
import {
  Crown,
  Edit3,
  FilePenLine,
  Plus,
  ScrollText,
  Settings,
  Sword,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import CombatTracker from "./CombatTracker";
import ConfirmActionDialog from "@/components/ui/confirm-action-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DataSection } from "@/components/ui/data-section";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { generateSecureId } from "@/lib/utils";
import {
  useCampaignPublications,
  type CampaignPublication,
  type CampaignPublicationDraft,
  type PublicationKind,
  type PublicationStatus,
} from "@/lib/publications";

type GMTab = "sessoes" | "combate" | "npcs" | "publicacoes";

interface NPC {
  id: string;
  name: string;
  hp: number;
  ac: number;
  notes: string;
}

const publicationKindLabels: Record<PublicationKind, string> = {
  cronica: "Cronica",
  contrato: "Contrato",
  rumor: "Rumor",
  relatorio: "Relatorio",
};

const publicationStatusLabels: Record<PublicationStatus, string> = {
  rascunho: "Rascunho",
  publicado: "Publicado",
  arquivado: "Arquivado",
};

function createEmptyPublicationDraft(nextChapter: number): CampaignPublicationDraft {
  return {
    title: "",
    excerpt: "",
    body: "",
    author: "Arquivo do Mestre",
    location: "",
    kind: "cronica",
    status: "rascunho",
    protagonists: ["Alaric Dorne", "Sorrow Noxmourn", "Hauz Darnen"],
    chapterNumber: nextChapter,
    replies: 0,
  };
}

export default function GameMasterPanel() {
  const [tab, setTab] = useState<GMTab>("sessoes");
  const [npcs, setNpcs] = useState<NPC[]>([]);
  const [pendingRemoval, setPendingRemoval] = useState<NPC | null>(null);
  const [pendingPublicationRemoval, setPendingPublicationRemoval] = useState<CampaignPublication | null>(null);
  const [newNpc, setNewNpc] = useState({ name: "", hp: 20, ac: 12, notes: "" });
  const { publications, upsertPublication, deletePublication } = useCampaignPublications();
  const nextChapter = useMemo(
    () => Math.max(1, ...publications.map((publication) => publication.chapterNumber)) + 1,
    [publications],
  );
  const [publicationDraft, setPublicationDraft] = useState<CampaignPublicationDraft>(() =>
    createEmptyPublicationDraft(nextChapter),
  );
  const [editingPublicationId, setEditingPublicationId] = useState<string | null>(null);

  const addNpc = () => {
    if (!newNpc.name.trim()) {
      toast.error("Defina um nome para o NPC.");
      return;
    }

    const nextNpc = { ...newNpc, id: `npc-${generateSecureId()}` };
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

  const resetPublicationDraft = () => {
    setEditingPublicationId(null);
    setPublicationDraft(createEmptyPublicationDraft(nextChapter));
  };

  const savePublication = () => {
    if (!publicationDraft.title.trim() || !publicationDraft.excerpt.trim() || !publicationDraft.body.trim()) {
      toast.error("Preencha titulo, resumo e corpo da publicacao.");
      return;
    }

    const saved = upsertPublication({
      ...publicationDraft,
      id: editingPublicationId ?? undefined,
    });

    toast.success(
      publicationDraft.status === "publicado"
        ? "Publicacao atualizada para os jogadores."
        : "Rascunho salvo no painel do mestre.",
    );

    setEditingPublicationId(null);
    setPublicationDraft(createEmptyPublicationDraft(Math.max(nextChapter, saved.chapterNumber + 1)));
  };

  const editPublication = (publication: CampaignPublication) => {
    setEditingPublicationId(publication.id);
    setPublicationDraft({
      id: publication.id,
      title: publication.title,
      excerpt: publication.excerpt,
      body: publication.body,
      author: publication.author,
      location: publication.location,
      kind: publication.kind,
      status: publication.status,
      protagonists: publication.protagonists,
      chapterNumber: publication.chapterNumber,
      replies: publication.replies,
    });
    setTab("publicacoes");
  };

  const removePublication = async () => {
    if (!pendingPublicationRemoval) {
      return;
    }

    deletePublication(pendingPublicationRemoval.id);
    toast.success("Publicacao removida do arquivo.");
    setPendingPublicationRemoval(null);

    if (editingPublicationId === pendingPublicationRemoval.id) {
      resetPublicationDraft();
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={tab} onValueChange={(value) => setTab(value as GMTab)} className="space-y-4">
        <TabsList className="grid h-auto w-full grid-cols-4">
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
          <TabsTrigger value="publicacoes" className="font-heading uppercase tracking-[0.18em]">
            <ScrollText className="mr-2 h-4 w-4" />
            Publicacoes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sessoes" className="mt-0">
          <Card variant="panel">
            <CardContent className="grid gap-4 p-6 md:grid-cols-3">
              <DataSection
                label="Sessao atual"
                value="Rotas de Elarion"
                icon={<Settings className="h-4 w-4" />}
                aside={<span className="text-xs text-muted-foreground">Mesa ativa</span>}
              >
                <p className="text-sm leading-relaxed text-muted-foreground">
                  O foco atual da campanha passa por Alaric, Sorrow e Hauz, com o deserto servindo de ponte entre
                  leitura, cacada e sobrevivencia.
                </p>
              </DataSection>
              <DataSection label="Jogadores" value="3 ativos" variant="quiet" />
              <DataSection label="Arquivo publicado" value={`${publications.filter((item) => item.status === "publicado").length} entradas`} variant="quiet" />
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
                    Monte antagonistas, aliados ou figuras recorrentes sem interromper a sessao.
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

        <TabsContent value="publicacoes" className="mt-0 space-y-4">
          <Card variant="panel">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-heading text-lg text-foreground">
                    {editingPublicationId ? "Editar publicacao" : "Nova publicacao"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    O que voce salva aqui alimenta a campanha e a comunidade sem quebrar o tom do mundo.
                  </p>
                </div>
                <div className="flex gap-2">
                  {editingPublicationId ? (
                    <Button variant="outline" onClick={resetPublicationDraft}>
                      Cancelar edicao
                    </Button>
                  ) : null}
                  <Button onClick={savePublication}>
                    <FilePenLine className="mr-2 h-4 w-4" />
                    {publicationDraft.status === "publicado" ? "Publicar" : "Salvar"}
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <Input
                  placeholder="Titulo"
                  value={publicationDraft.title}
                  onChange={(event) =>
                    setPublicationDraft((previous) => ({ ...previous, title: event.target.value }))
                  }
                />
                <Input
                  placeholder="Local"
                  value={publicationDraft.location}
                  onChange={(event) =>
                    setPublicationDraft((previous) => ({ ...previous, location: event.target.value }))
                  }
                />
                <Input
                  placeholder="Autor"
                  value={publicationDraft.author}
                  onChange={(event) =>
                    setPublicationDraft((previous) => ({ ...previous, author: event.target.value }))
                  }
                />
                <Input
                  type="number"
                  placeholder="Capitulo"
                  value={publicationDraft.chapterNumber}
                  onChange={(event) =>
                    setPublicationDraft((previous) => ({
                      ...previous,
                      chapterNumber: Number(event.target.value) || 1,
                    }))
                  }
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="space-y-2 text-sm text-muted-foreground">
                  <span>Tipo</span>
                  <Select
                    value={publicationDraft.kind}
                    onValueChange={(value) =>
                      setPublicationDraft((previous) => ({
                        ...previous,
                        kind: value as PublicationKind,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha um tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(publicationKindLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </label>
                <label className="space-y-2 text-sm text-muted-foreground">
                  <span>Status</span>
                  <Select
                    value={publicationDraft.status}
                    onValueChange={(value) =>
                      setPublicationDraft((previous) => ({
                        ...previous,
                        status: value as PublicationStatus,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha um status" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(publicationStatusLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </label>
              </div>

              <Input
                placeholder="Protagonistas separados por virgula"
                value={publicationDraft.protagonists.join(", ")}
                onChange={(event) =>
                  setPublicationDraft((previous) => ({
                    ...previous,
                    protagonists: event.target.value
                      .split(",")
                      .map((value) => value.trim())
                      .filter(Boolean),
                  }))
                }
              />

              <Textarea
                placeholder="Resumo curto visivel para os jogadores."
                value={publicationDraft.excerpt}
                onChange={(event) =>
                  setPublicationDraft((previous) => ({ ...previous, excerpt: event.target.value }))
                }
                className="min-h-[90px]"
              />

              <Textarea
                placeholder="Corpo da publicacao."
                value={publicationDraft.body}
                onChange={(event) =>
                  setPublicationDraft((previous) => ({ ...previous, body: event.target.value }))
                }
                className="min-h-[180px]"
              />
            </CardContent>
          </Card>

          <div className="grid gap-3">
            {publications.map((publication, index) => (
              <motion.div
                key={publication.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <Card variant="panel">
                  <CardContent className="grid gap-4 p-5 md:grid-cols-[minmax(0,1fr)_240px]">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">{publicationStatusLabels[publication.status]}</Badge>
                        <Badge variant="secondary" className="bg-secondary/70 text-foreground">
                          {publicationKindLabels[publication.kind]}
                        </Badge>
                        <Badge variant="outline">{publication.location}</Badge>
                      </div>
                      <h4 className="mt-3 font-heading text-lg text-foreground">{publication.title}</h4>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {publication.excerpt}
                      </p>
                      <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-primary/80">
                        {publication.protagonists.join(" • ")}
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
                      <DataSection label="Capitulo" value={publication.chapterNumber} variant="quiet" />
                      <DataSection label="Ultima edicao" value={new Date(publication.updatedAt).toLocaleDateString("pt-BR")} variant="quiet" />
                      <Button variant="outline" onClick={() => editPublication(publication)}>
                        <Edit3 className="mr-2 h-4 w-4" />
                        Editar
                      </Button>
                      <Button variant="danger" onClick={() => setPendingPublicationRemoval(publication)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
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

      <ConfirmActionDialog
        open={!!pendingPublicationRemoval}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setPendingPublicationRemoval(null);
          }
        }}
        title="Excluir publicacao?"
        description={`Esta acao remove ${pendingPublicationRemoval?.title ?? "esta publicacao"} do arquivo do mestre.`}
        confirmLabel="Excluir"
        pendingLabel="Excluindo..."
        onConfirm={removePublication}
      />
    </div>
  );
}
