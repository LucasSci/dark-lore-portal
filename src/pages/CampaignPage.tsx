import { motion } from "framer-motion";
import { BookOpenText, ScrollText, ShieldAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataSection } from "@/components/ui/data-section";
import { CURRENT_PROTAGONISTS } from "@/lib/immersive-lore";
import {
  type CampaignPublication,
  useCampaignPublications,
} from "@/lib/publications";

const publicationTone: Record<
  CampaignPublication["kind"],
  "info" | "warning" | "danger" | "secondary"
> = {
  cronica: "info",
  contrato: "warning",
  rumor: "secondary",
  relatorio: "danger",
};

const publicationLabel: Record<CampaignPublication["kind"], string> = {
  cronica: "Cronica",
  contrato: "Contrato",
  rumor: "Rumor",
  relatorio: "Relatorio",
};

export default function CampaignPage() {
  const { publishedPublications } = useCampaignPublications();

  return (
    <div className="container py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-10"
      >
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <Card variant="elevated">
            <CardContent className="space-y-5 p-8">
              <Badge variant="outline" className="border-primary/25 text-primary">
                Cronicas, contratos e rastros de viagem
              </Badge>
              <div className="space-y-3">
                <h1 className="font-display text-4xl text-brand-gradient md:text-5xl">
                  O arquivo vivo da campanha atual
                </h1>
                <p className="max-w-3xl text-base leading-8 text-muted-foreground">
                  Aqui o mestre publica o que o continente sussurra: cronicas,
                  contratos, informes e rumores que puxam a mesa para frente sem
                  quebrar a imersao.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card variant="panel">
            <CardHeader>
              <CardTitle className="text-2xl">Painel rapido</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <DataSection
                label="Publicacoes ativas"
                value={publishedPublications.length}
                variant="quiet"
              />
              <DataSection
                label="Frente atual"
                value="Elarion, Korath e as rotas de Vaz'hir"
                variant="quiet"
              />
              <DataSection
                label="Protagonistas"
                value={CURRENT_PROTAGONISTS.join(" / ")}
                tone="info"
                variant="quiet"
              />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <DataSection
            label="Arquivo"
            value="Cronicas de sessao"
            icon={<BookOpenText className="h-4 w-4" />}
          >
            <p className="text-sm leading-6 text-muted-foreground">
              Registros publicados pelo mestre para manter a campanha viva entre uma
              sessao e outra.
            </p>
          </DataSection>
          <DataSection
            label="Uso na mesa"
            value="Contratos e gatilhos"
            icon={<ScrollText className="h-4 w-4" />}
          >
            <p className="text-sm leading-6 text-muted-foreground">
              Cada bloco pode virar rumor, pista, recompensa, emboscada ou
              deslocamento entre regioes.
            </p>
          </DataSection>
          <DataSection
            label="Risco"
            value="Alta tensao de fronteira"
            icon={<ShieldAlert className="h-4 w-4" />}
            tone="warn"
          >
            <p className="text-sm leading-6 text-muted-foreground">
              O continente aperta por todos os lados: estrada, vigia, deserto, culto
              e coisa pior.
            </p>
          </DataSection>
        </div>

        {publishedPublications.length === 0 ? (
          <Card variant="panel">
            <CardContent className="space-y-3 p-8">
              <p className="text-[11px] uppercase tracking-[0.18em] text-primary/80">
                Arquivo vazio
              </p>
              <h2 className="font-heading text-2xl text-foreground">
                O mestre ainda nao publicou novas entradas
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                Quando novas cronicas, rumores ou contratos forem liberados, elas vao
                aparecer aqui em ordem diegetica, sem quebrar o ritmo da campanha.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {publishedPublications.map((publication, index) => (
              <motion.div
                key={publication.id}
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card variant={publication.kind === "contrato" ? "elevated" : "panel"}>
                  <CardContent className="flex flex-col gap-5 p-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex gap-4">
                      <div className="min-w-16">
                        <p className="font-display text-3xl text-primary/60">
                          {String(publication.chapterNumber).padStart(2, "0")}
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={publicationTone[publication.kind]}>
                            {publicationLabel[publication.kind]}
                          </Badge>
                          <Badge variant="outline">{publication.location}</Badge>
                          <Badge variant="secondary" className="bg-secondary/70">
                            {publication.protagonists.join(" / ")}
                          </Badge>
                        </div>
                        <div>
                          <h2 className="font-heading text-2xl text-foreground">
                            {publication.title}
                          </h2>
                          <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
                            {publication.excerpt}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-full border border-border/70 bg-background/60 px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      Atualizada em{" "}
                      {new Date(publication.updatedAt).toLocaleDateString("pt-BR")}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
