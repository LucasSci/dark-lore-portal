import { motion } from "framer-motion";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { BookMarked, WandSparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DataSection } from "@/components/ui/data-section";
import CharacterCreator, { type CharacterData } from "@/components/rpg/CharacterCreator";
import { createCharacterBundle } from "@/lib/sheets/persistence";

export default function CriacaoPage() {
  const navigate = useNavigate();

  const handleCreateCharacter = async (draft: CharacterData) => {
    const bundle = await createCharacterBundle(draft);

    toast.success(
      bundle.source === "remote"
        ? `${bundle.character.name} criado e salvo no grimorio da conta.`
        : `${bundle.character.name} criado com fallback local.`,
    );
    navigate(`/ficha/${bundle.character.id}`);
  };

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
                  <Badge variant="outline">Criacao persistida</Badge>
                  <Badge variant="info">Forja guiada e salvamento</Badge>
                </div>

                <div className="max-w-3xl space-y-4">
                <p className="section-kicker">Forja do personagem</p>
                  <h1 className="font-display text-5xl leading-[0.95] text-brand-gradient md:text-6xl">
                    Nome, origem e juramento reunidos em uma unica mesa de forja.
                  </h1>
                  <p className="text-base leading-8 text-foreground/88">
                    A criacao conduz identidade, atributos, profissao e historico em etapas claras,
                    deixando a ficha pronta para seguir direto para a estrada.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <DataSection label="Etapas" value="05" variant="quiet" />
                  <DataSection label="Saida" value="Ficha pronta para jogar" variant="quiet" tone="info" />
                  <DataSection label="Persistencia" value="Conta ou fallback local" variant="quiet" />
                </div>
              </div>

              <Card variant="panel">
                <CardContent className="space-y-4 p-5">
                  <div>
                    <p className="section-kicker">Ritual</p>
                    <h2 className="mt-2 font-heading text-2xl text-foreground">
                      Ordem recomendada
                    </h2>
                  </div>

                  <DataSection label="Passo 01" value="Identidade e aparencia" variant="quiet" />
                  <DataSection label="Passo 02" value="Raca, profissao e atributos" variant="quiet" />
                  <DataSection label="Passo 03" value="Historico e resumo derivado" variant="quiet" tone="info" />
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            <DataSection
              label="Destino"
              value="Ao concluir, a ficha abre automaticamente."
              icon={<BookMarked className="h-4 w-4" />}
            />
            <DataSection
              label="Tom"
              value="Criacao em estilo grimorio e dossier"
              icon={<WandSparkles className="h-4 w-4" />}
              tone="info"
            />
          </div>
        </section>

        <CharacterCreator onSave={(data) => void handleCreateCharacter(data)} />
      </motion.div>
    </div>
  );
}
