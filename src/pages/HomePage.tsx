import { motion } from "framer-motion";
import { BookOpenText, Dice6, Flame, Map, ScrollText, Shield, ShoppingBag, Sword, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import heroBg from "@/assets/hero-zerrikania.jpg";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataSection } from "@/components/ui/data-section";
import { supabase } from "@/integrations/supabase/client";

const featureCards = [
  {
    icon: ScrollText,
    title: "Crônicas da Campanha",
    description: "Capítulos, dossiês e ganchos narrativos de A Caçada ao Escorpião de Vidro.",
    path: "/campanha",
  },
  {
    icon: Dice6,
    title: "Mesa Virtual",
    description: "Battlemaps, tokens, fog of war, dados e combate — tudo como no Roll20.",
    path: "/jogar",
  },
  {
    icon: Map,
    title: "Atlas de Zerrikânia",
    description: "Personagens, locais, facções e eventos conectados pela timeline da campanha.",
    path: "/universo",
  },
  {
    icon: ShoppingBag,
    title: "Conteúdo Digital",
    description: "PDFs, mapas, aventuras e tokens com biblioteca de downloads automática.",
    path: "/loja",
  },
  {
    icon: Users,
    title: "Comunidade",
    description: "Espaços para discutir builds, crônicas, teorias e compartilhar personagens.",
    path: "/comunidade",
  },
  {
    icon: Shield,
    title: "Dashboard Pessoal",
    description: "Conta, biblioteca, progresso e acesso rápido aos recursos do ecossistema.",
    path: "/conta",
  },
];

function useLatestEvents() {
  return useQuery({
    queryKey: ["latest-campaign-events"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("campaign_events")
        .select("*")
        .order("sort_order", { ascending: false })
        .limit(3);
      return (data ?? []) as Array<{ title: string; description: string; event_type: string; chapter_number: number }>;
    },
  });
}

export default function HomePage() {
  const { data: events } = useLatestEvents();

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border/70">
        <img
          src={heroBg}
          alt="Areias de Zerrikânia — deserto com cidade dourada e dragão"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--brand)/0.18),transparent_34%),radial-gradient(circle_at_bottom_right,hsl(var(--destructive)/0.16),transparent_30%)]" />

        <div className="container relative py-28 md:py-36">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_320px]"
          >
            <div className="max-w-3xl space-y-6">
              <Badge variant="outline" className="border-primary/25 text-primary">
                <Flame className="mr-2 h-3.5 w-3.5" />
                Areias de Zerrikânia
              </Badge>
              <div className="space-y-4">
                <h1 className="font-display text-5xl leading-tight text-brand-gradient md:text-7xl">
                  A Caçada ao Escorpião de Vidro
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-foreground/86">
                  Nashara, filha da tempestade, deve desvendar a profecia do N'kara antes que Nilfgaard controle o Dragão da Noite.
                  Mesa virtual, crônicas vivas e lore interativo em um único hub.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link to="/jogar">
                    <Sword className="mr-2 h-5 w-5" />
                    Abrir mesa virtual
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/universo">Explorar Zerrikânia</Link>
                </Button>
              </div>
            </div>

            <Card variant="elevated" className="self-end">
              <CardHeader>
                <CardTitle className="text-2xl">Campanha Ativa</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <DataSection label="Arco" value="A Caçada ao Escorpião de Vidro" variant="quiet" />
                <DataSection label="Capítulos" value="22+" variant="quiet" />
                <DataSection label="Cenário" value="Zerrikânia — Deserto & Interstício" variant="quiet" />
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
          <h2 className="font-display text-4xl text-brand-gradient">Hub da Campanha</h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Crônicas, mesa virtual, atlas do mundo e comunidade — tudo integrado para a experiência de RPG definitiva.
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
              <Card variant="panel" className="h-full transition-transform duration-150 hover:-translate-y-1">
                <CardContent className="flex h-full flex-col gap-5 p-6">
                  <div className="rounded-full border border-primary/20 bg-background/60 p-3 text-primary w-fit">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-heading text-xl text-foreground">{feature.title}</h3>
                    <p className="text-sm leading-7 text-muted-foreground">{feature.description}</p>
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

      {events && events.length > 0 && (
        <section className="border-y border-border/70 bg-surface-strong/40">
          <div className="container py-24">
            <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
              <Card variant="panel">
                <CardHeader>
                  <CardTitle className="text-2xl">Últimos Eventos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <DataSection label="Status" value="Campanha em andamento" variant="quiet" />
                  <DataSection label="Protagonista" value="Nashara, filha da tempestade" variant="quiet" />
                  <DataSection label="Ameaça" value="Nilfgaard & N'kara" tone="info" variant="quiet" />
                </CardContent>
              </Card>

              <div className="grid gap-5 md:grid-cols-3">
                {events.map((event, index) => (
                  <motion.div
                    key={event.title}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.06 }}
                  >
                    <Card variant="panel" className="h-full">
                      <CardContent className="space-y-4 p-6">
                        <Badge variant="secondary">Cap. {event.chapter_number}</Badge>
                        <div>
                          <h3 className="font-heading text-xl text-foreground">{event.title}</h3>
                          <p className="mt-3 text-sm leading-7 text-muted-foreground">{event.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="container py-24">
        <Card variant="elevated">
          <CardContent className="flex flex-col gap-6 p-8 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <h2 className="font-display text-3xl text-brand-gradient">Entre na campanha</h2>
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                Crie seu personagem, junte-se à mesa de Nashara e Tarim, ou mergulhe no lore de Zerrikânia.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/jogar">Abrir mesa</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/campanha">Ler crônicas</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
