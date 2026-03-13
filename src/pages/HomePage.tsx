import { motion } from "framer-motion";
import { BookOpenText, Dice6, Map, ScrollText, Shield, ShoppingBag, Users } from "lucide-react";
import { Link } from "react-router-dom";

import heroBg from "@/assets/hero-bg.jpg";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataSection } from "@/components/ui/data-section";

const featureCards = [
  {
    icon: ScrollText,
    title: "Cronicas de campanha",
    description: "Capitulos, dossies e ganchos narrativos com apresentacao editorial e leitura fluida.",
    path: "/campanha",
  },
  {
    icon: Dice6,
    title: "Mesa virtual",
    description: "Ficha, combate, rolagem de dados, NPCs e mapa em uma mesma experiencia de jogo.",
    path: "/jogar",
  },
  {
    icon: Map,
    title: "Atlas do universo",
    description: "Personagens, monstros, locais e faccoes conectados por linha do tempo e links internos.",
    path: "/universo",
  },
  {
    icon: ShoppingBag,
    title: "Conteudo digital",
    description: "PDFs, mapas, aventuras e tokens com biblioteca de downloads automatica.",
    path: "/loja",
  },
  {
    icon: Users,
    title: "Comunidade",
    description: "Espacos para discutir builds, cronicas, teorias e compartilhar personagens.",
    path: "/comunidade",
  },
  {
    icon: Shield,
    title: "Dashboard pessoal",
    description: "Conta, biblioteca, progresso e acesso rapido aos recursos do ecossistema.",
    path: "/conta",
  },
];

const updateCards = [
  {
    tag: "Sistema",
    title: "Biblioteca base redesenhada",
    excerpt: "Buttons, cards, tabs, dialogs, alerts e progress bars agora seguem tokens semanticos globais.",
  },
  {
    tag: "Ficha",
    title: "Hub de personagem em producao",
    excerpt: "Criacao, ficha, inventario, magias e mesa ja compartilham o mesmo sistema visual.",
  },
  {
    tag: "Universo",
    title: "Enciclopedia integrada",
    excerpt: "Verbete narrativo, imagens, ligacoes internas e timeline consolidam o atlas do mundo.",
  },
];

export default function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-border/70">
        <img
          src={heroBg}
          alt="Paisagem de fantasia sombria"
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
                Original dark fantasy interface
              </Badge>
              <div className="space-y-4">
                <h1 className="font-display text-5xl leading-tight text-brand-gradient md:text-7xl">
                  Cronicas sombrias, sistema premium e mesa integrada.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-foreground/86">
                  Realm combina campanha, enciclopedia, loja digital e jogo online em uma identidade visual unificada, editorial e juridicamente segura.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link to="/jogar">Abrir hub de jogo</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/universo">Explorar o universo</Link>
                </Button>
              </div>
            </div>

            <Card variant="elevated" className="self-end">
              <CardHeader>
                <CardTitle className="text-2xl">Painel de arranque</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <DataSection label="Tema" value="Noir Chronicle" variant="quiet" />
                <DataSection label="Base" value="React + Tailwind + shadcn" variant="quiet" />
                <DataSection label="Foco" value="Narrativa, combate e conteudo digital" variant="quiet" />
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
          <h2 className="font-display text-4xl text-brand-gradient">Ecossistema do projeto</h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            A experiencia foi reorganizada em blocos equivalentes aos fluxos do projeto original, traduzidos para web com componentes semanticamente consistentes.
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

      <section className="border-y border-border/70 bg-surface-strong/40">
        <div className="container py-24">
          <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
            <Card variant="panel">
              <CardHeader>
                <CardTitle className="text-2xl">Estado atual</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <DataSection label="Fase ativa" value="Biblioteca base + rollout inicial" variant="quiet" />
                <DataSection label="Paginas prontas" value="Ficha, conta, universo e campanha" variant="quiet" />
                <DataSection label="Guard rails" value="Assets originais e sem imitacao direta" tone="info" variant="quiet" />
              </CardContent>
            </Card>

            <div className="grid gap-5 md:grid-cols-3">
              {updateCards.map((update, index) => (
                <motion.div
                  key={update.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.06 }}
                >
                  <Card variant="panel" className="h-full">
                    <CardContent className="space-y-4 p-6">
                      <Badge variant="secondary">{update.tag}</Badge>
                      <div>
                        <h3 className="font-heading text-xl text-foreground">{update.title}</h3>
                        <p className="mt-3 text-sm leading-7 text-muted-foreground">{update.excerpt}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container py-24">
        <Card variant="elevated">
          <CardContent className="flex flex-col gap-6 p-8 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <h2 className="font-display text-3xl text-brand-gradient">Escolha seu ponto de entrada</h2>
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                Entre pela ficha se quiser jogar agora, pela conta se quiser sua biblioteca, ou pelo atlas se quiser mergulhar no mundo antes de entrar na mesa.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/conta">Abrir dashboard</Link>
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
