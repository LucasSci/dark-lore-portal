import { motion } from "framer-motion";
import { ArrowRight, Calendar, MessageSquare, Trophy, Users } from "lucide-react";
import { Link } from "react-router-dom";

import FeatureCard from "@/components/cards/FeatureCard";
import ListCard from "@/components/cards/ListCard";
import SideCard from "@/components/cards/SideCard";
import StatCard from "@/components/cards/StatCard";
import Grid from "@/components/layout/Grid";
import PageContainer from "@/components/layout/PageContainer";
import Panel from "@/components/layout/Panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Tag from "@/components/ui/tag";
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
] as const;

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
    <PageContainer size="wide" className="py-12 md:py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
        <Grid layout="feature">
          <FeatureCard
            badges={
              <>
                <Badge variant="outline">
                  <Users className="mr-2 h-3.5 w-3.5" />
                  Mural diegetico
                </Badge>
                <Tag active>{recentPosts.length} ecos recentes</Tag>
              </>
            }
            eyebrow="Comunidade dentro da ficcao"
            title="Comunidade tratada como quadro de rumores, nao feed generico."
            description="A pagina virou mural de campanha: avisos, ecos, feitos e chamados agora leem como extensao do mundo, em vez de area social separada da atmosfera principal."
            aside={
              <Panel tone="accent" className="space-y-4 p-5">
                <div className="paper-strip p-5">
                  <p className="text-[10px] uppercase tracking-[0.24em]">Canal dominante</p>
                  <p className="mt-3 font-display text-3xl">Ecos do continente</p>
                </div>

                <div className="field-note space-y-4 p-4">
                  <p className="section-kicker">Uso recomendado</p>
                  <div className="space-y-3">
                    <div className="metric-panel px-4 py-3">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-primary/74">Leitura</p>
                      <p className="mt-2 text-sm leading-7 text-foreground/84">
                        Rumores, informes e respostas
                      </p>
                    </div>
                    <div className="metric-panel px-4 py-3">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-primary/74">Ponte</p>
                      <p className="mt-2 text-sm leading-7 text-foreground/84">
                        Conecta campanha e grupo
                      </p>
                    </div>
                  </div>

                  <Button asChild variant="outline" className="w-full">
                    <Link to="/campanha">Abrir o arquivo principal</Link>
                  </Button>
                </div>
              </Panel>
            }
          >
            <Grid layout="stats">
              <StatCard label="Sinais ativos" value={String(recentPosts.length).padStart(2, "0")} />
              <StatCard label="Circuitos" value="Mesa, chamados e feitos" note="Fluxos conectados" />
              <StatCard label="Ritmo" value="Entre sessoes e contratos" note="Sem feed paralelo" />
            </Grid>
          </FeatureCard>

          <div className="grid gap-4">
            {sections.slice(0, 3).map((section) => (
              <SideCard
                key={section.title}
                icon={<section.icon className="h-4 w-4" />}
                eyebrow="Canal"
                title={section.title}
                description={section.desc}
              />
            ))}
          </div>
        </Grid>

        <Grid layout="cards">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
            >
              <SideCard
                className="h-full"
                icon={<section.icon className="h-5 w-5" />}
                eyebrow="Canal"
                title={section.title}
                description={section.desc}
                footer={
                  <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary/78">
                    Ler circuito
                    <ArrowRight className="h-4 w-4" />
                  </span>
                }
              />
            </motion.div>
          ))}
        </Grid>

        {recentPosts.length === 0 ? (
          <ListCard
            eyebrow="Nenhum eco recente"
            title="Ainda nao ha comunicados circulando no mural"
            description="Assim que o mestre publicar cronicas, rumores ou informes, eles aparecerao aqui como ecos recentes visiveis para a mesa."
          >
            <Button asChild variant="outline">
              <Link to="/campanha">Abrir cronicas e contratos</Link>
            </Button>
          </ListCard>
        ) : (
          <Grid layout="sidebar">
            <ListCard
              eyebrow="Sinal principal"
              title={leadPost?.title ?? "Sem destaque"}
              description={
                leadPost?.excerpt ??
                "O proximo eco em destaque aparecera aqui assim que novas publicacoes forem liberadas."
              }
              actions={
                leadPost ? <Badge variant="info">{publicationLabel[leadPost.kind]}</Badge> : null
              }
              className="h-full"
            >
              {leadPost ? (
                <>
                  <Grid layout="stats" className="!grid-cols-1 md:!grid-cols-3">
                    <StatCard label="Origem" value={leadPost.location} />
                    <StatCard
                      label="Atualizada"
                      value={new Date(leadPost.updatedAt).toLocaleDateString("pt-BR")}
                    />
                    <StatCard label="Respostas" value={`${leadPost.replies}`} note="interacoes" />
                  </Grid>

                  <Button asChild>
                    <Link to="/campanha">
                      Ler o arquivo completo
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </>
              ) : null}
            </ListCard>

            <div className="space-y-4">
              {sidePosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                >
                  <ListCard
                    eyebrow={publicationLabel[post.kind]}
                    title={post.title}
                    description={post.excerpt}
                    actions={<Tag>{post.location}</Tag>}
                  >
                    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_120px]">
                      <div className="metric-panel px-4 py-3">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-primary/74">
                          Leitura
                        </p>
                        <p className="mt-2 text-sm leading-7 text-foreground/84">
                          Respostas, pistas e repercussoes desse eco na mesa.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <StatCard label="Respostas" value={String(post.replies)} />
                        <StatCard
                          label="Data"
                          value={new Date(post.updatedAt).toLocaleDateString("pt-BR")}
                        />
                      </div>
                    </div>
                  </ListCard>
                </motion.div>
              ))}

              <Panel tone="accent" className="p-6">
                <p className="section-kicker">Mural expandido</p>
                <h3 className="mt-2 font-heading text-2xl text-foreground">
                  Leve os ecos para o fluxo principal da campanha
                </h3>
                <p className="mt-3 max-w-[56ch] text-sm leading-7 text-foreground/72">
                  O mural social entra como extensao do arquivo principal, mantendo o mesmo ritmo
                  editorial do continente.
                </p>

                <Button asChild variant="outline" className="mt-5">
                  <Link to="/campanha">Abrir cronicas e contratos</Link>
                </Button>
              </Panel>
            </div>
          </Grid>
        )}
      </motion.div>
    </PageContainer>
  );
}
