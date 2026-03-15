import { motion } from "framer-motion";
import {
  Dice6,
  Flame,
  Map,
  ScrollText,
  Shield,
  ShoppingBag,
  Sword,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

import heroBg from "@/assets/hero-zerrikania.jpg";
import ContinentMap from "@/components/world/ContinentMap";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataSection } from "@/components/ui/data-section";
import { CURRENT_PROTAGONISTS } from "@/lib/immersive-lore";
import { useCampaignPublications } from "@/lib/publications";

const featureCards = [
  {
    icon: ScrollText,
    title: "Arquivo da Campanha",
    description:
      "Cronicas, contratos, rumores e informes publicados pelo mestre para manter o mundo respirando.",
    path: "/campanha",
  },
  {
    icon: Dice6,
    title: "Mesa Virtual",
    description:
      "Battlemaps, grids, conexoes de area, tokens e deslocamento narrativo guiado pelo mestre.",
    path: "/mesa",
  },
  {
    icon: Map,
    title: "Atlas do Continente",
    description:
      "Continente, regioes e pontos locais conectados em um atlas navegavel da campanha.",
    path: "/mapa",
  },
  {
    icon: ShoppingBag,
    title: "Mercado In-Game",
    description:
      "Negocie suprimentos, runas, componentes e curiosidades como se estivesse na estrada.",
    path: "/loja",
  },
  {
    icon: Users,
    title: "Mural da Campanha",
    description:
      "Rumores, publicacoes e conversas que continuam dentro do mundo mesmo fora da mesa.",
    path: "/comunidade",
  },
  {
    icon: Shield,
    title: "Arquivo Pessoal",
    description:
      "Ficha, biblioteca e progresso do personagem sem quebrar o tom do universo.",
    path: "/conta",
  },
];

export default function HomePage() {
  const { publishedPublications } = useCampaignPublications();
  const spotlight = publishedPublications.slice(0, 3);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border/70">
        <img
          src={heroBg}
          alt="Areias de Zerrikania - deserto, muralhas e rotas de campanha"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--brand)/0.18),transparent_34%),radial-gradient(circle_at_bottom_right,hsl(var(--destructive)/0.16),transparent_30%)]" />

        <div className="container relative py-28 md:py-36">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_340px]"
          >
            <div className="max-w-3xl space-y-6">
              <Badge variant="outline" className="border-primary/25 text-primary">
                <Flame className="mr-2 h-3.5 w-3.5" />
                Areias de Zerrikania
              </Badge>
              <div className="space-y-4">
                <h1 className="font-display text-5xl leading-tight text-brand-gradient md:text-7xl">
                  Alaric, Sorrow e Hauz atravessam um continente em ruptura
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-foreground/86">
                  O foco da campanha agora esta nas rotas que unem Elarion, Vaz'hir,
                  Korath e as areias negras de Zerrikania. A mesa, o atlas, o mercado e
                  as publicacoes do mestre fazem parte do mesmo mundo.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link to="/mesa">
                    <Sword className="mr-2 h-5 w-5" />
                    Abrir mesa
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/mapa">Explorar o continente</Link>
                </Button>
              </div>
            </div>

            <Card variant="elevated" className="self-end">
              <CardHeader>
                <CardTitle className="text-2xl">Frente Atual</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <DataSection label="Arco" value="Rotas de Elarion" variant="quiet" />
                <DataSection
                  label="Protagonistas"
                  value={CURRENT_PROTAGONISTS.join(" / ")}
                  variant="quiet"
                />
                <DataSection
                  label="Cenario"
                  value="Continente / Korath / Zerrikania"
                  variant="quiet"
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <section className="container py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 max-w-2xl"
        >
          <h2 className="font-display text-4xl text-brand-gradient">
            Ecossistema da Campanha
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Tudo foi reorganizado para parecer um mundo jogavel: rumor, contrato,
            viagem, compra, preparacao e mesa.
          </p>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featureCards.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                variant="panel"
                className="h-full transition-transform duration-150 hover:-translate-y-1"
              >
                <CardContent className="flex h-full flex-col gap-5 p-6">
                  <div className="w-fit rounded-full border border-primary/20 bg-background/60 p-3 text-primary">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-heading text-xl text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-sm leading-7 text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                  <Button asChild variant="outline" className="mt-auto w-fit">
                    <Link to={feature.path}>Abrir</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="container pb-24">
        <ContinentMap />
      </section>

      {spotlight.length > 0 ? (
        <section className="border-y border-border/70 bg-surface-strong/40">
          <div className="container py-24">
            <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
              <Card variant="panel">
                <CardHeader>
                  <CardTitle className="text-2xl">Arquivo em movimento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <DataSection
                    label="Tom"
                    value="Fronteira, estrada e pressao"
                    variant="quiet"
                  />
                  <DataSection
                    label="Centro atual"
                    value={CURRENT_PROTAGONISTS.join(" / ")}
                    variant="quiet"
                  />
                  <DataSection
                    label="Ritmo"
                    value="Publicacoes do mestre entre sessoes"
                    tone="info"
                    variant="quiet"
                  />
                </CardContent>
              </Card>

              <div className="grid gap-5 md:grid-cols-3">
                {spotlight.map((publication, index) => (
                  <motion.div
                    key={publication.id}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.06 }}
                  >
                    <Card variant="panel" className="h-full">
                      <CardContent className="space-y-4 p-6">
                        <Badge variant="secondary">{publication.kind}</Badge>
                        <div>
                          <h3 className="font-heading text-xl text-foreground">
                            {publication.title}
                          </h3>
                          <p className="mt-3 text-sm leading-7 text-muted-foreground">
                            {publication.excerpt}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="container py-24">
        <Card variant="elevated">
          <CardContent className="flex flex-col gap-6 p-8 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <h2 className="font-display text-3xl text-brand-gradient">
                Entrar na estrada
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                Leia as publicacoes do mestre, prepare sua ficha, negocie no mercado e
                siga viagem para a proxima area.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/criacao">Criar personagem</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/campanha">Ler cronicas</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
