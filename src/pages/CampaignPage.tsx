import { motion } from "framer-motion";
import { ArrowRight, BookOpenText, ScrollText, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  const leadPublication = publishedPublications[0];
  const latestUpdate = leadPublication
    ? new Date(leadPublication.updatedAt).toLocaleDateString("pt-BR")
    : "Sem registro";

  return (
    <div className="container py-12 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12"
      >
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_340px]">
          <Card variant="elevated" className="overflow-hidden">
            <CardContent className="grid gap-8 p-6 md:p-8 xl:grid-cols-[minmax(0,1fr)_280px]">
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="outline">Arquivo vivo da campanha</Badge>
                  <Badge variant="info">{publishedPublications.length} entradas em circulacao</Badge>
                </div>

                <div className="max-w-3xl space-y-4">
                <p className="section-kicker">Cronicas e contratos</p>
                  <h1 className="font-display text-5xl leading-[0.95] text-brand-gradient md:text-6xl">
                    O arquivo agora parece um tomo de guerra, nao uma lista de posts.
                  </h1>
                  <p className="text-base leading-8 text-foreground/88">
                    Cronicas, rumores, informes e contratos foram reencenados como partes de um
                    dossie de campanha. A leitura ficou mais editorial, mais diegetica e mais
                    alinhada ao peso do continente.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <DataSection
                    label="Frente atual"
                    value="Elarion, Korath e Vaz'hir"
                    variant="quiet"
                  />
                  <DataSection
                    label="Ultima atualizacao"
                    value={latestUpdate}
                    variant="quiet"
                    tone="info"
                  />
                  <DataSection
                    label="Companhia"
                    value={CURRENT_PROTAGONISTS.join(" / ")}
                    variant="quiet"
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button asChild>
                    <Link to="/universo">
                      Abrir o universo
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/comunidade">Ver ecos no mural</Link>
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="paper-strip p-5">
                  <p className="text-[10px] uppercase tracking-[0.24em]">Capitulo dominante</p>
                  <p className="mt-3 font-display text-4xl">
                    {leadPublication
                      ? String(leadPublication.chapterNumber).padStart(2, "0")
                      : "00"}
                  </p>
                </div>

                <Card variant="panel">
                  <CardContent className="space-y-4 p-5">
                    <div>
                      <p className="section-kicker">Leitura rapida</p>
                      <h2 className="mt-2 font-heading text-2xl text-foreground">
                        Mesa em movimento
                      </h2>
                    </div>

                    <DataSection
                      label="Tom"
                      value="Estrada, vigia e pressao de fronteira"
                      variant="quiet"
                    />
                    <DataSection
                      label="Uso"
                      value="Rumor, pista, deslocamento e caca"
                      variant="quiet"
                    />
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            <DataSection
              label="Arquivo"
              value="Cronicas de sessao"
              icon={<BookOpenText className="h-4 w-4" />}
            >
              <p className="text-sm leading-6 text-muted-foreground">
                Registros publicados pelo mestre para manter a campanha viva entre uma sessao e
                outra.
              </p>
            </DataSection>
            <DataSection
              label="Uso na mesa"
              value="Contratos e gatilhos"
              icon={<ScrollText className="h-4 w-4" />}
              tone="info"
            >
              <p className="text-sm leading-6 text-muted-foreground">
                Cada bloco pode virar pista, recompensa, emboscada ou deslocamento entre regioes.
              </p>
            </DataSection>
            <DataSection
              label="Risco"
              value="Alta tensao de fronteira"
              icon={<ShieldAlert className="h-4 w-4" />}
              tone="warn"
            >
              <p className="text-sm leading-6 text-muted-foreground">
                O continente aperta por todos os lados: estrada, vigia, deserto, culto e coisa
                pior.
              </p>
            </DataSection>
          </div>
        </section>

        {publishedPublications.length === 0 ? (
          <Card variant="panel">
            <CardContent className="space-y-4 p-8">
              <p className="section-kicker">Arquivo vazio</p>
              <h2 className="font-heading text-3xl text-foreground">
                O mestre ainda nao publicou novas entradas
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                Quando novas cronicas, rumores ou contratos forem liberados, eles aparecerao aqui
                como parte do dossie principal da campanha.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-4">
              {publishedPublications.map((publication, index) => (
                <motion.div
                  key={publication.id}
                  initial={{ opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    variant={publication.kind === "contrato" ? "elevated" : "panel"}
                    className="overflow-hidden"
                  >
                    <CardContent className="grid gap-6 p-6 md:grid-cols-[110px_minmax(0,1fr)_200px] md:p-8">
                      <div className="space-y-3">
                        <div className="paper-strip p-4 text-center">
                          <p className="text-[10px] uppercase tracking-[0.24em]">Capitulo</p>
                          <p className="mt-2 font-display text-4xl">
                            {String(publication.chapterNumber).padStart(2, "0")}
                          </p>
                        </div>
                        <Badge variant={publicationTone[publication.kind]} className="w-fit">
                          {publicationLabel[publication.kind]}
                        </Badge>
                      </div>

                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">{publication.location}</Badge>
                          <Badge variant="secondary">
                            {publication.protagonists.join(" / ")}
                          </Badge>
                        </div>

                        <div>
                          <h2 className="font-heading text-3xl text-foreground">
                            {publication.title}
                          </h2>
                          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
                            {publication.excerpt}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3 border border-[hsl(var(--outline-variant)/0.14)] bg-[linear-gradient(180deg,hsl(var(--surface-base)/0.42),hsl(var(--background-strong)/0.72))] p-4">
                        <DataSection
                          label="Atualizada"
                          value={new Date(publication.updatedAt).toLocaleDateString("pt-BR")}
                          variant="quiet"
                        />
                        <DataSection
                          label="Autor"
                          value={publication.author}
                          variant="quiet"
                        />
                        <DataSection
                          label="Status"
                          value="Em circulacao"
                          variant="quiet"
                          tone="info"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="space-y-4 xl:sticky xl:top-28 xl:self-start">
              <Card variant="panel">
                <CardContent className="space-y-5 p-6">
                  <div>
                  <p className="section-kicker">Como ler</p>
                    <h2 className="mt-2 font-heading text-2xl text-foreground">
                      Ordem de leitura recomendada
                    </h2>
                  </div>

                  <p className="text-sm leading-7 text-muted-foreground">
                    Use o numero do capitulo para seguir o pulso da campanha e os selos de tipo para
                    distinguir cronica, rumor, relatorio e contrato.
                  </p>

                  <div className="grid gap-3">
                    <DataSection
                      label="Capitulo dominante"
                      value={
                        leadPublication
                          ? String(leadPublication.chapterNumber).padStart(2, "0")
                          : "00"
                      }
                      variant="quiet"
                    />
                    <DataSection
                      label="Ultimo foco"
                      value={leadPublication?.location ?? "Aguardando"}
                      variant="quiet"
                    />
                    <DataSection
                      label="Protagonistas"
                      value={CURRENT_PROTAGONISTS.join(" / ")}
                      variant="quiet"
                      tone="info"
                    />
                  </div>

                  <Button asChild variant="outline" className="w-full">
                    <Link to="/mesa">Levar leitura para a mesa</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
