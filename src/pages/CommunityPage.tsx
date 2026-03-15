import { motion } from "framer-motion";
import { Calendar, MessageSquare, ScrollText, Trophy, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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

export default function CommunityPage() {
  const { publishedPublications } = useCampaignPublications();
  const recentPosts = publishedPublications.slice(0, 4);

  return (
    <div className="container py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-16 text-center"
      >
        <Users className="mx-auto mb-4 h-10 w-10 text-primary" />
        <h1 className="mb-4 font-display text-3xl text-gold-gradient md:text-5xl">
          Ecos do Continente
        </h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          Um mural interno ao mundo, feito para rumores, avisos, informes e cronicas
          que os jogadores podem ler sem sentir que sairam da campanha.
        </p>
      </motion.div>

      <div className="mb-16 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {sections.map((section, index) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
          >
            <Card variant="panel" className="h-full transition-colors hover:border-primary/30">
              <CardContent className="space-y-3 p-6 text-center">
                <section.icon className="mx-auto h-7 w-7 text-primary" />
                <h3 className="font-heading text-base text-foreground">
                  {section.title}
                </h3>
                <p className="text-xs leading-6 text-muted-foreground">{section.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-xl text-foreground">
              Publicacoes recentes
            </h2>
            <p className="text-sm text-muted-foreground">
              Registros publicados pelo mestre e visiveis para a mesa.
            </p>
          </div>
          <Badge variant="outline" className="border-primary/25 text-primary">
            <ScrollText className="mr-2 h-3.5 w-3.5" />
            {recentPosts.length} em destaque
          </Badge>
        </div>

        {recentPosts.length === 0 ? (
          <Card variant="panel">
            <CardContent className="space-y-3 p-6">
              <p className="text-[11px] uppercase tracking-[0.18em] text-primary/80">
                Nenhum eco recente
              </p>
              <h3 className="font-heading text-xl text-foreground">
                Ainda nao ha comunicados no mural
              </h3>
              <p className="text-sm leading-7 text-muted-foreground">
                Assim que o mestre publicar cronicas, rumores ou informes, eles vao
                aparecer aqui em ordem recente para o grupo acompanhar a campanha.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {recentPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 + index * 0.08 }}
              >
                <Card variant="panel" className="transition-colors hover:border-primary/25">
                  <CardContent className="flex items-center justify-between gap-4 p-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="bg-secondary/70 text-foreground">
                          {post.kind}
                        </Badge>
                        <Badge variant="outline">{post.location}</Badge>
                      </div>
                      <h4 className="mt-2 font-heading text-sm text-foreground">
                        {post.title}
                      </h4>
                      <p className="mt-1 text-xs text-muted-foreground">
                        por {post.author} /{" "}
                        {new Date(post.updatedAt).toLocaleDateString("pt-BR")}
                      </p>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                        {post.excerpt}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-heading text-primary">
                      {post.replies} respostas
                    </span>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
