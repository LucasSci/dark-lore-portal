import { motion } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  MessageSquare,
  ScrollText,
  Trophy,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataSection } from "@/components/ui/data-section";
import { useCampaignPublications } from "@/lib/publications";

const sections = [
  {
    icon: MessageSquare,
    title: "Mesa aberta",
    desc: "Discussao de pistas, relatos de sessao e teorias do continente.",
  },
  {
    icon: Calendar,
    title: "Chamados",
    desc: "Rodas especiais, cacas, caravanas e noites dedicadas a contratos.",
  },
  {
    icon: Trophy,
    title: "Feitos",
    desc: "Rastros de personagens, trofeus, contratos pagos e cicatrizes memoraveis.",
  },
  {
    icon: Users,
    title: "Companhias",
    desc: "Grupos, duplas de estrada, patrulhas e circulos de informacao.",
  },
];

const publicationLabel = {
  cronica: "Cronica",
  contrato: "Contrato",
  rumor: "Rumor",
  relatorio: "Relatorio",
} as const;

export default function CommunityPage() {
  const { publishedPublications } = useCampaignPublications();
  const recentPosts = publishedPublications.slice(0, 4);
  const leadPost = recentPosts[0];
  const sidePosts = recentPosts.slice(1);

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
                  <Badge variant="outline">
                    <Users className="mr-2 h-3.5 w-3.5" />
                    Mural diegetico
                  </Badge>
                  <Badge variant="secondary">{recentPosts.length} ecos recentes</Badge>
                </div>

                <div className="max-w-3xl space-y-4">
                  <p className="section-kicker">Community inside the fiction</p>
                  <h1 className="font-display text-5xl leading-[0.95] text-brand-gradient md:text-6xl">
                    Comunidade tratada como quadro de rumores, nao feed generico.
                  </h1>
                  <p className="text-base leading-8 text-foreground/88">
                    A pagina virou mural de campanha: avisos, ecos, feitos e chamados agora leem
                    como extensao do mundo, em vez de area social separada da atmosfera principal.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <DataSection
                    label="Sinais ativos"
                    value={String(recentPosts.length).padStart(2, "0")}
                    variant="quiet"
                  />
                  <DataSection
                    label="Circuitos"
                    value="Mesa, chamados e feitos"
                    variant="quiet"
                    tone="info"
                  />
                  <DataSection
                    label="Ritmo"
                    value="Entre sessoes e contratos"
                    variant="quiet"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="paper-strip p-5">
                  <p className="text-[10px] uppercase tracking-[0.24em]">Canal dominante</p>
                  <p className="mt-3 font-display text-3xl">Ecos do continente</p>
                </div>

                <Card variant="panel">
                  <CardContent className="space-y-4 p-5">
                    <p className="section-kicker">Uso recomendado</p>
                    <DataSection
                      label="Leitura"
                      value="Rumores, informes e respostas"
                      variant="quiet"
                    />
                    <DataSection
                      label="Ponte"
                      value="Conecta campanha e grupo"
                      variant="quiet"
                    />
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/campanha">Abrir o arquivo principal</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {sections.slice(0, 3).map((section) => (
              <DataSection
                key={section.title}
                label={section.title}
                value={section.desc}
                icon={<section.icon className="h-4 w-4" />}
                variant="panel"
              />
            ))}
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
            >
              <Card variant={index === 1 ? "elevated" : "panel"} className="h-full">
                <CardContent className="space-y-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center border border-[hsl(var(--brand)/0.18)] bg-[linear-gradient(180deg,hsl(var(--surface-strong)/0.88),hsl(var(--surface-base)/0.96))] text-primary">
                    <section.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="section-kicker">Canal</p>
                    <h3 className="mt-2 font-heading text-xl text-foreground">{section.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">{section.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {recentPosts.length === 0 ? (
          <Card variant="panel">
            <CardContent className="space-y-4 p-8">
              <p className="section-kicker">Nenhum eco recente</p>
              <h2 className="font-heading text-3xl text-foreground">
                Ainda nao ha comunicados circulando no mural
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                Assim que o mestre publicar cronicas, rumores ou informes, eles aparecerao aqui
                como ecos recentes visiveis para a mesa.
              </p>
            </CardContent>
          </Card>
        ) : (
          <section className="grid gap-6 xl:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.2fr)]">
            <Card variant="elevated" className="overflow-hidden">
              <CardContent className="space-y-6 p-6 md:p-8">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="section-kicker">Lead signal</p>
                    <h2 className="mt-2 font-display text-4xl text-foreground">
                      {leadPost?.title ?? "Sem destaque"}
                    </h2>
                  </div>
                  <Badge variant="info">{leadPost ? publicationLabel[leadPost.kind] : "vazio"}</Badge>
                </div>

                <p className="text-base leading-8 text-foreground/88">
                  {leadPost?.excerpt ??
                    "O proximo eco em destaque aparecera aqui assim que novas publicacoes forem liberadas."}
                </p>

                {leadPost ? (
                  <div className="grid gap-3">
                    <DataSection label="Origem" value={leadPost.location} variant="quiet" />
                    <DataSection
                      label="Atualizada"
                      value={new Date(leadPost.updatedAt).toLocaleDateString("pt-BR")}
                      variant="quiet"
                      tone="info"
                    />
                    <DataSection
                      label="Respostas"
                      value={`${leadPost.replies} respostas`}
                      variant="quiet"
                    />
                  </div>
                ) : null}

                <Button asChild>
                  <Link to="/campanha">
                    Ler o arquivo completo
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {sidePosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                >
                  <Card variant="panel">
                    <CardContent className="grid gap-4 p-6 md:grid-cols-[minmax(0,1fr)_120px]">
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">{publicationLabel[post.kind]}</Badge>
                          <Badge variant="outline">{post.location}</Badge>
                        </div>
                        <div>
                          <h3 className="font-heading text-2xl text-foreground">{post.title}</h3>
                          <p className="mt-3 text-sm leading-7 text-muted-foreground">
                            {post.excerpt}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3 border border-[hsl(var(--outline-variant)/0.14)] bg-[linear-gradient(180deg,hsl(var(--surface-base)/0.44),hsl(var(--background-strong)/0.72))] p-4">
                        <DataSection
                          label="Respostas"
                          value={String(post.replies)}
                          variant="quiet"
                        />
                        <DataSection
                          label="Data"
                          value={new Date(post.updatedAt).toLocaleDateString("pt-BR")}
                          variant="quiet"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              <Card variant="panel">
                <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="section-kicker">Mural expandido</p>
                    <h3 className="mt-2 font-heading text-2xl text-foreground">
                      Leve os ecos para o fluxo principal da campanha
                    </h3>
                  </div>
                  <Button asChild variant="outline">
                    <Link to="/campanha">Abrir cronicas e contratos</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>
        )}
      </motion.div>
    </div>
  );
}
