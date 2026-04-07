import { BookMarked, Map, ScrollText, Sword } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import type { StoryProject } from "../types";

interface StoryEngineContextPanelProps {
  project: StoryProject;
}

export default function StoryEngineContextPanel({ project }: StoryEngineContextPanelProps) {
  return (
    <Card variant="elevated" className="overflow-hidden">
      <CardContent className="grid gap-6 p-6 md:p-8 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline">Ferramenta interna</Badge>
            <Badge variant="warning">Gemini + workspace local</Badge>
            {project.context?.campaignTitle ? <Badge variant="secondary">{project.context.campaignTitle}</Badge> : null}
            {project.context?.sceneTitle ? <Badge variant="secondary">{project.context.sceneTitle}</Badge> : null}
          </div>

          <div className="space-y-4">
            <p className="section-kicker">Story Engine</p>
            <h1 className="font-display text-5xl leading-[0.95] text-brand-gradient md:text-6xl">
              Desdobre manuscritos em elenco, cena e storyboard.
            </h1>
            <p className="max-w-3xl text-base leading-8 text-foreground/84">
              O workspace aceita texto bruto, cruza contexto de campanha e devolve um pacote visual
              para a sessao: personagens, cenas e prompts de producao prontos para uso manual.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild size="sm">
              <Link to="/jogar">
                <Sword className="h-4 w-4" />
                Voltar para Jogar
              </Link>
            </Button>
            {project.campaignId ? (
              <Button asChild size="sm" variant="outline">
                <Link to={`/mesa/${project.campaignId}`}>
                  <Map className="h-4 w-4" />
                  Abrir mesa vinculada
                </Link>
              </Button>
            ) : null}
            <Button asChild size="sm" variant="ghost">
              <Link to="/mestre">
                <ScrollText className="h-4 w-4" />
                Ir para o painel do mestre
              </Link>
            </Button>
          </div>
        </div>

        <Card variant="panel">
          <CardContent className="space-y-4 p-5">
            <div>
              <p className="section-kicker">Vinculo atual</p>
              <h2 className="mt-2 font-heading text-2xl text-foreground">Contexto de campanha</h2>
            </div>

            <div className="space-y-3 text-sm leading-7 text-foreground/74">
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-foreground/52">Projeto</p>
                <p className="mt-1 font-display text-lg text-foreground">{project.title}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-foreground/52">Campanha</p>
                <p className="mt-1">{project.context?.campaignTitle ?? "Nenhuma campanha vinculada"}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-foreground/52">Cena</p>
                <p className="mt-1">{project.context?.sceneTitle ?? "Nenhuma cena vinculada"}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-foreground/52">Semente ativa</p>
                <p className="mt-1">
                  {project.context?.seedText
                    ? project.context.seedText
                    : "Abra o Story Engine a partir de Jogar, Mestre ou Mesa com contexto para ancorar o projeto."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 border border-[hsl(var(--outline-variant)/0.14)] bg-[hsl(var(--surface-base)/0.66)] px-3 py-3 text-xs uppercase tracking-[0.22em] text-foreground/58">
              <BookMarked className="h-4 w-4 text-brand" />
              Workspace ligado ao arquivo, sem publicar nada automaticamente.
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
