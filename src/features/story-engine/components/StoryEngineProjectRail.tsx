import { BookOpenText, Clapperboard, Sparkles, Users, Wand2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type { StoryEngineStep, StoryProject } from "../types";

const stepConfig: Array<{
  id: StoryEngineStep;
  label: string;
  icon: typeof BookOpenText;
}> = [
  { id: "ingest", label: "Ingestao", icon: BookOpenText },
  { id: "analyze", label: "Analise", icon: Sparkles },
  { id: "characters", label: "Personagens", icon: Users },
  { id: "production", label: "Storyboard", icon: Clapperboard },
];

interface StoryEngineProjectRailProps {
  step: StoryEngineStep;
  projects: StoryProject[];
  selectedProjectId: string | null;
  onStepChange: (step: StoryEngineStep) => void;
  onCreateProject: () => void;
  onSelectProject: (projectId: string) => void;
}

export default function StoryEngineProjectRail({
  step,
  projects,
  selectedProjectId,
  onStepChange,
  onCreateProject,
  onSelectProject,
}: StoryEngineProjectRailProps) {
  return (
    <div className="space-y-4">
      <Card variant="elevated">
        <CardContent className="space-y-5 p-5">
          <div className="space-y-2">
            <Badge variant="outline">Story Engine</Badge>
            <h2 className="font-display text-2xl text-foreground">Pipeline editorial</h2>
            <p className="text-sm leading-7 text-foreground/72">
              A ferramenta traduz texto bruto em elenco, cenas e direcao visual para usar na campanha.
            </p>
          </div>

          <div className="space-y-2">
            {stepConfig.map(({ id, label, icon: Icon }) => {
              const active = id === step;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onStepChange(id)}
                  className={cn(
                    "flex w-full items-center gap-3 border px-4 py-3 text-left transition-all",
                    active
                      ? "border-[hsl(var(--brand)/0.34)] bg-[linear-gradient(180deg,hsl(var(--brand)/0.14),hsl(var(--surface-strong)/0.8))] text-foreground shadow-[0_18px_40px_hsl(var(--brand)/0.08)]"
                      : "border-[hsl(var(--outline-variant)/0.16)] bg-[linear-gradient(180deg,hsl(var(--surface-raised)/0.82),hsl(var(--surface-base)/0.92))] text-foreground/74 hover:border-[hsl(var(--brand)/0.2)] hover:text-foreground",
                  )}
                >
                  <span className="dark-lore-icon-emblem h-10 w-10 shrink-0">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="space-y-1">
                    <span className="block font-display text-lg leading-none">{label}</span>
                    <span className="block text-[10px] uppercase tracking-[0.24em] text-foreground/54">
                      Etapa do workspace
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card variant="panel">
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="section-kicker">Projetos locais</p>
              <h3 className="mt-2 font-display text-2xl text-foreground">Arquivo de trabalho</h3>
            </div>
            <Button type="button" size="sm" onClick={onCreateProject}>
              <Wand2 className="h-4 w-4" />
              Novo
            </Button>
          </div>

          <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
            {projects.map((project) => {
              const active = project.id === selectedProjectId;
              return (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => onSelectProject(project.id)}
                  className={cn(
                    "w-full border px-4 py-3 text-left transition-all",
                    active
                      ? "border-[hsl(var(--brand)/0.34)] bg-[linear-gradient(180deg,hsl(var(--brand)/0.12),hsl(var(--surface-strong)/0.82))] shadow-[0_18px_34px_hsl(var(--brand)/0.08)]"
                      : "border-[hsl(var(--outline-variant)/0.16)] bg-[linear-gradient(180deg,hsl(var(--surface-raised)/0.8),hsl(var(--surface-base)/0.92))] hover:border-[hsl(var(--brand)/0.2)]",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-display text-lg text-foreground">{project.title}</span>
                    <Badge variant={active ? "primary" : "secondary"}>
                      {project.characters.length} pers.
                    </Badge>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-foreground/68">
                    {project.rawText?.trim()
                      ? project.rawText
                      : "Projeto vazio. Carregue um texto ou use a semente da campanha para iniciar."}
                  </p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
