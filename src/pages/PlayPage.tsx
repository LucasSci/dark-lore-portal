import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BookMarked, Map, ScrollText, Swords, WandSparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const sections = [
  {
    title: "Mesa Virtual",
    description: "VTT completo com battlemap, grid, fog of war, tokens e chat em tempo real.",
    icon: <Map className="h-8 w-8" />,
    path: "/mesa",
    accent: "primary",
  },
  {
    title: "Ficha de Personagem",
    description: "Visualize sua ficha narrativa com inventário, grimório e rolagem de dados.",
    icon: <BookMarked className="h-8 w-8" />,
    path: "/ficha",
    accent: "info",
  },
  {
    title: "Criar Personagem",
    description: "Monte um novo personagem escolhendo raça, classe, atributos e história.",
    icon: <WandSparkles className="h-8 w-8" />,
    path: "/criacao",
    accent: "success",
  },
  {
    title: "Painel do Mestre",
    description: "Ferramentas de narrativa, gestão de sessão e controle de campanha.",
    icon: <ScrollText className="h-8 w-8" />,
    path: "/mestre",
    accent: "warning",
  },
];

export default function PlayPage() {
  return (
    <div className="container py-20">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="outline">Areias de Zerrikânia</Badge>
          <h1 className="mt-4 font-display text-4xl text-gold-gradient md:text-5xl">
            Hub de Jogo
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
            Escolha uma das ferramentas abaixo para começar sua sessão.
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2">
          {sections.map((section) => (
            <Link key={section.path} to={section.path}>
              <Card variant="panel" className="group h-full transition-all hover:border-primary/40 hover:shadow-brand">
                <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5 text-primary transition-colors group-hover:bg-primary/10">
                    {section.icon}
                  </div>
                  <div>
                    <CardTitle className="font-heading text-xl text-foreground">{section.title}</CardTitle>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{section.description}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
