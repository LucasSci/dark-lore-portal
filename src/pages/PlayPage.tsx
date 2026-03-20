import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  BookMarked,
  Map,
  ScrollText,
  Sword,
  WandSparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataSection } from "@/components/ui/data-section";

const sections = [
  {
    title: "Mesa Virtual",
    description: "VTT completo com battlemap, grid, fog of war, tokens e chat em tempo real.",
    icon: Map,
    path: "/mesa",
    eyebrow: "Combate e cena",
  },
  {
    title: "Ficha de Personagem",
    description: "Visualize a ficha narrativa com inventario, grimorio e rolagem de dados.",
    icon: BookMarked,
    path: "/ficha",
    eyebrow: "Perfil e recursos",
  },
  {
    title: "Criar Personagem",
    description: "Monte um novo personagem escolhendo raca, classe, atributos e historia.",
    icon: WandSparkles,
    path: "/criacao",
    eyebrow: "Forge the role",
  },
  {
    title: "Painel do Mestre",
    description: "Ferramentas de narrativa, gestao de sessao e controle de campanha.",
    icon: ScrollText,
    path: "/mestre",
    eyebrow: "Command center",
  },
];

export default function PlayPage() {
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
                  <Badge variant="outline">Hub de jogo</Badge>
                  <Badge variant="info">Mesa, ficha, criacao e mestre</Badge>
                </div>

                <div className="max-w-3xl space-y-4">
                <p className="section-kicker">Camada de jogo</p>
                  <h1 className="font-display text-5xl leading-[0.95] text-brand-gradient md:text-6xl">
                    Todas as ferramentas de jogo reunidas em um unico eixo visual.
                  </h1>
                  <p className="text-base leading-8 text-foreground/88">
                    O hub agora organiza as rotas principais da mesa em vez de agir como uma pagina
                    de links. Cada modulo entra na mesma familia visual do portal e deixa claro o
                    papel de cada ferramenta na campanha.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <DataSection label="Modulos" value="04" variant="quiet" />
                  <DataSection label="Foco" value="Mesa, ficha e comando" variant="quiet" tone="info" />
                  <DataSection label="Fluxo" value="Do preparo ao combate" variant="quiet" />
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button asChild>
                    <Link to="/mesa">Abrir mesa virtual</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/ficha">Ir para a ficha</Link>
                  </Button>
                </div>
              </div>

              <Card variant="panel">
                <CardContent className="space-y-4 p-5">
                  <div>
                    <p className="section-kicker">Leitura rapida</p>
                    <h2 className="mt-2 font-heading text-2xl text-foreground">
                      Eixo operacional
                    </h2>
                  </div>

                  <DataSection
                    label="Entrada principal"
                    value="Mesa Virtual"
                    variant="quiet"
                  />
                  <DataSection
                    label="Preparacao"
                    value="Criacao e Ficha"
                    variant="quiet"
                  />
                  <DataSection
                    label="Direcao"
                    value="Painel do Mestre"
                    variant="quiet"
                    tone="info"
                  />
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          <Card variant="panel">
            <CardContent className="space-y-5 p-6">
              <div>
                  <p className="section-kicker">Fluxo de combate</p>
                <h2 className="mt-2 font-heading text-2xl text-foreground">
                  Rotas do jogo
                </h2>
              </div>

              <DataSection label="Preparar" value="Criar e revisar personagens" variant="quiet" />
              <DataSection label="Executar" value="Abrir mesa e operar combate" variant="quiet" />
              <DataSection label="Controlar" value="Publicacoes, NPCs e sessao" variant="quiet" tone="warn" />
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {sections.map((section, index) => {
            const Icon = section.icon;

            return (
              <motion.div
                key={section.path}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <Link to={section.path} className="block h-full">
                  <Card
                    variant={index === 0 ? "elevated" : "panel"}
                    className="h-full transition-[transform,border-color] duration-200 hover:-translate-y-px hover:border-[hsl(var(--brand)/0.18)]"
                  >
                    <CardContent className="flex h-full flex-col gap-5 p-6">
                      <div className="flex h-12 w-12 items-center justify-center border border-[hsl(var(--brand)/0.16)] bg-[linear-gradient(180deg,hsl(var(--surface-strong)/0.86),hsl(var(--surface-base)/0.96))] text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="section-kicker">{section.eyebrow}</p>
                        <h3 className="mt-2 font-heading text-2xl text-foreground">
                          {section.title}
                        </h3>
                        <p className="mt-3 text-sm leading-7 text-muted-foreground">
                          {section.description}
                        </p>
                      </div>
                      <div className="mt-auto flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                        <Sword className="h-4 w-4" />
                        Abrir modulo
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </section>
      </motion.div>
    </div>
  );
}
