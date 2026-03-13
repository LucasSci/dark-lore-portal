import { motion } from "framer-motion";
import { BookOpenText, ChevronRight, ScrollText, ShieldAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataSection } from "@/components/ui/data-section";

const chapters = [
  {
    num: 1,
    title: "O Despertar",
    status: "publicado",
    summary: "Nas profundezas da Floresta Cinzenta, uma presenca adormecida volta a respirar.",
    tone: "info" as const,
  },
  {
    num: 2,
    title: "Sangue e Cinzas",
    status: "publicado",
    summary: "Korven arde e os sobreviventes carregam com eles juramentos, perdas e rumores.",
    tone: "warning" as const,
  },
  {
    num: 3,
    title: "Pacto Sombrio",
    status: "publicado",
    summary: "O grupo encontra uma escolha moral onde poder e sacrificio caminham juntos.",
    tone: "danger" as const,
  },
  {
    num: 4,
    title: "Torre de Obsidiana",
    status: "dossie",
    summary: "Uma expedicao vertical por arquivos lacrados, runas vivas e memoria corrompida.",
    tone: "secondary" as const,
  },
  {
    num: 5,
    title: "Runas Proibidas",
    status: "dossie",
    summary: "As runas antigas prometem vantagem rapida, mas deixam rastros em corpo e mente.",
    tone: "warning" as const,
  },
  {
    num: 6,
    title: "Cerco de Valdris",
    status: "novo",
    summary: "Valdris entra em estado de sitio e o conselho abre contratos para escolta, sabotagem e resgate.",
    tone: "success" as const,
  },
];

export default function CampaignPage() {
  return (
    <div className="container py-24">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <Card variant="elevated">
            <CardContent className="space-y-5 p-8">
              <Badge variant="outline" className="border-primary/25 text-primary">
                Campanha e contratos
              </Badge>
              <div className="space-y-3">
                <h1 className="font-display text-4xl text-brand-gradient md:text-5xl">
                  Cronicas, dossies e ganchos de sessao.
                </h1>
                <p className="max-w-3xl text-base leading-8 text-muted-foreground">
                  A pagina de campanha agora funciona como um arquivo editorial: capitulos prontos para leitura, dossies de missao e pontos de entrada para contratos narrativos.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card variant="panel">
            <CardHeader>
              <CardTitle className="text-2xl">Painel rapido</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <DataSection label="Capitulos ativos" value={chapters.length} variant="quiet" />
              <DataSection label="Frente atual" value="Cerco de Valdris" variant="quiet" />
              <DataSection label="Modo" value="Leitura + ganchos de mesa" tone="info" variant="quiet" />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <DataSection
            label="Arquivo"
            value="Saga principal"
            icon={<BookOpenText className="h-4 w-4" />}
          >
            <p className="text-sm leading-6 text-muted-foreground">
              Capitulos com linguagem de cronica, prontos para leitura seriada.
            </p>
          </DataSection>
          <DataSection
            label="Uso na mesa"
            value="Contratos e pistas"
            icon={<ScrollText className="h-4 w-4" />}
          >
            <p className="text-sm leading-6 text-muted-foreground">
              Cada bloco pode se desdobrar em quest, rumor, encontro ou recompensa.
            </p>
          </DataSection>
          <DataSection
            label="Risco"
            value="Alta tensao"
            icon={<ShieldAlert className="h-4 w-4" />}
            tone="warn"
          >
            <p className="text-sm leading-6 text-muted-foreground">
              Tramas em curso carregam ameacas militares, magia proibida e pressao politica.
            </p>
          </DataSection>
        </div>

        <div className="space-y-4">
          {chapters.map((chapter, index) => (
            <motion.div
              key={chapter.num}
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card variant={chapter.status === "novo" ? "elevated" : "panel"}>
                <CardContent className="flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex gap-4">
                    <div className="min-w-16">
                      <p className="font-display text-3xl text-primary/60">
                        {String(chapter.num).padStart(2, "0")}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={chapter.tone}>{chapter.status}</Badge>
                        <Badge variant="outline">Capitulo {chapter.num}</Badge>
                      </div>
                      <div>
                        <h2 className="font-heading text-2xl text-foreground">{chapter.title}</h2>
                        <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
                          {chapter.summary}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" className="shrink-0">
                    Abrir dossie
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
