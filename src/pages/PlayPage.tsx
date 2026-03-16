import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BookMarked, Map, ScrollText, WandSparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

const sections = [
  {
    title: "Mesa Virtual",
    description: "VTT completo com battlemap, grid, fog of war, tokens e chat em tempo real.",
    icon: <Map className="h-7 w-7 sm:h-8 sm:w-8" />,
    path: "/mesa",
  },
  {
    title: "Ficha de Personagem",
    description: "Visualize sua ficha narrativa com inventário, grimório e rolagem de dados.",
    icon: <BookMarked className="h-7 w-7 sm:h-8 sm:w-8" />,
    path: "/ficha",
  },
  {
    title: "Criar Personagem",
    description: "Monte um novo personagem escolhendo raça, classe, atributos e história.",
    icon: <WandSparkles className="h-7 w-7 sm:h-8 sm:w-8" />,
    path: "/criacao",
  },
  {
    title: "Painel do Mestre",
    description: "Ferramentas de narrativa, gestão de sessão e controle de campanha.",
    icon: <ScrollText className="h-7 w-7 sm:h-8 sm:w-8" />,
    path: "/mestre",
  },
];

export default function PlayPage() {
  return (
    <div className="container py-12 sm:py-20">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 sm:space-y-8">
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="outline">Areias de Zerrikânia</Badge>
          <h1 className="mt-3 font-display text-3xl text-gold-gradient sm:mt-4 sm:text-4xl md:text-5xl">
            Hub de Jogo
          </h1>
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:mt-4 sm:text-base sm:leading-7">
            Escolha uma das ferramentas abaixo para começar sua sessão.
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl gap-3 sm:grid-cols-2 sm:gap-4">
          {sections.map((section) => (
            <Link key={section.path} to={section.path}>
              <Card variant="panel" className="group h-full transition-all hover:border-primary/40 hover:shadow-brand">
                <CardContent className="flex flex-col items-center gap-3 p-6 text-center sm:gap-4 sm:p-8">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5 text-primary transition-colors group-hover:bg-primary/10 sm:h-16 sm:w-16">
                    {section.icon}
                  </div>
                  <div>
                    <CardTitle className="font-heading text-lg text-foreground sm:text-xl">{section.title}</CardTitle>
                    <p className="mt-1.5 text-sm leading-6 text-muted-foreground sm:mt-2">{section.description}</p>
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
