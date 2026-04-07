import type { ChangeEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Clapperboard,
  Copy,
  Download,
  FileUp,
  ImagePlus,
  Loader2,
  Sparkles,
  Trash2,
  UserSquare2,
  Wand2,
} from "lucide-react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  StoryEngineContextPanel,
  StoryEngineProjectRail,
  StoryEngineReferenceStrip,
  buildStoryProjectContext,
  createStoryProject,
  deleteStoryProject,
  getActiveStoryProjectId,
  hasStoryEngineApiKey,
  loadStoryProjects,
  saveStoryProject,
  setActiveStoryProjectId,
  storyEngineService,
  type GeneratedStoryAsset,
  type StoryCharacter,
  type StoryEngineStep,
  type StoryProject,
  type StoryScene,
} from "@/features/story-engine";
import { getWitcherCampaignById, getWitcherSceneSeed } from "@/features/witcher-system";
import { usePortalShellMode } from "@/lib/portal-state";
import { generateSecureShortId } from "@/lib/utils";

function buildProjectSignature(project: StoryProject) {
  const { updatedAt, ...rest } = project;
  return JSON.stringify(rest);
}

function upsertProject(projects: StoryProject[], project: StoryProject) {
  const remaining = projects.filter((candidate) => candidate.id !== project.id);
  return [project, ...remaining];
}

function stripExtension(filename: string) {
  return filename.replace(/\.[^/.]+$/, "");
}

function readFileAsText(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error(`Nao foi possivel ler ${file.name}.`));
    reader.readAsText(file);
  });
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error(`Nao foi possivel carregar ${file.name}.`));
    reader.readAsDataURL(file);
  });
}

function downloadDataUrl(filename: string, dataUrl: string) {
  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

export default function StoryEnginePage() {
  usePortalShellMode("editorial", "interactive");

  const navigate = useNavigate();
  const { projectId } = useParams();
  const [searchParams] = useSearchParams();
  const campaignId = searchParams.get("campaignId");
  const sceneId = searchParams.get("sceneId");

  const linkedCampaign = useMemo(
    () => (campaignId ? getWitcherCampaignById(campaignId) : null),
    [campaignId],
  );
  const linkedScene = useMemo(
    () => (sceneId ? getWitcherSceneSeed(sceneId) : null),
    [sceneId],
  );

  const linkedContext = useMemo(
    () =>
      buildStoryProjectContext({
        campaignId: campaignId ?? undefined,
        campaignTitle: linkedCampaign?.title,
        sceneId: sceneId ?? undefined,
        sceneTitle: linkedScene?.name,
        seedText:
          linkedCampaign || linkedScene
            ? [
                linkedCampaign
                  ? `Campanha: ${linkedCampaign.title}. ${linkedCampaign.summary} Atmosfera: ${linkedCampaign.atmosphere}`
                  : null,
                linkedScene
                  ? `Cena: ${linkedScene.name}. Intro: ${linkedScene.intro} Briefing: ${linkedScene.briefing}`
                  : null,
                linkedScene?.threatLabels?.length
                  ? `Pressao dramatica: ${linkedScene.threatLabels.join(", ")}.`
                  : null,
              ]
                .filter(Boolean)
                .join(" ")
            : undefined,
      }),
    [campaignId, linkedCampaign, linkedScene, sceneId],
  );

  const [projects, setProjects] = useState<StoryProject[]>([]);
  const [activeProjectId, setActiveProjectIdState] = useState<string | null>(null);
  const [projectDraft, setProjectDraft] = useState<StoryProject | null>(null);
  const [step, setStep] = useState<StoryEngineStep>("ingest");
  const [isBootstrapped, setIsBootstrapped] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [imageTargetId, setImageTargetId] = useState<string | null>(null);

  const lastSavedSignatureRef = useRef<string>("");

  const syncDraftProject = useCallback((nextProject: StoryProject) => {
    setProjects((current) => upsertProject(current, nextProject));
    setProjectDraft(nextProject);
    setActiveProjectIdState(nextProject.id);
    setActiveStoryProjectId(nextProject.id);
  }, []);

  const buildSeededProject = useCallback(
    (forcedId?: string) =>
      createStoryProject({
        id: forcedId,
        title:
          linkedScene?.name ??
          linkedCampaign?.title ??
          "Novo projeto do Story Engine",
        rawText: linkedContext?.seedText ?? "",
        campaignId: linkedContext?.campaignId,
        sceneId: linkedContext?.sceneId,
        context: linkedContext,
      }),
    [linkedCampaign?.title, linkedContext, linkedScene?.name],
  );

  useEffect(() => {
    const storedProjects = loadStoryProjects();
    let nextProjects = storedProjects;
    let selectedProject =
      (projectId ? storedProjects.find((project) => project.id === projectId) : null) ??
      (getActiveStoryProjectId()
        ? storedProjects.find((project) => project.id === getActiveStoryProjectId())
        : null) ??
      storedProjects[0] ??
      null;

    if (!selectedProject && projectId) {
      const created = buildSeededProject(projectId);
      const result = saveStoryProject(created);
      nextProjects = upsertProject(nextProjects, result.project);
      selectedProject = result.project;
      if (result.warning) {
        setNoticeMessage(result.warning);
      }
    }

    if (!selectedProject) {
      const created = buildSeededProject();
      const result = saveStoryProject(created);
      nextProjects = upsertProject(nextProjects, result.project);
      selectedProject = result.project;
      if (result.warning) {
        setNoticeMessage(result.warning);
      }
    }

    setProjects(nextProjects);
    setProjectDraft(selectedProject);
    setActiveProjectIdState(selectedProject.id);
    setActiveStoryProjectId(selectedProject.id);
    lastSavedSignatureRef.current = buildProjectSignature(selectedProject);
    setIsBootstrapped(true);
  }, [buildSeededProject, projectId]);

  useEffect(() => {
    if (!projectDraft || !linkedContext) {
      return;
    }

    const needsContextUpdate =
      projectDraft.campaignId !== linkedContext.campaignId ||
      projectDraft.sceneId !== linkedContext.sceneId ||
      projectDraft.context?.seedText !== linkedContext.seedText;

    if (!needsContextUpdate) {
      return;
    }

    const nextProject: StoryProject = {
      ...projectDraft,
      campaignId: linkedContext.campaignId,
      sceneId: linkedContext.sceneId,
      context: linkedContext,
      title:
        projectDraft.title === "Novo projeto do Story Engine"
          ? linkedScene?.name ?? linkedCampaign?.title ?? projectDraft.title
          : projectDraft.title,
      rawText: projectDraft.rawText.trim() || linkedContext.seedText || "",
    };

    syncDraftProject(nextProject);
  }, [
    linkedCampaign?.title,
    linkedContext,
    linkedScene?.name,
    projectDraft,
    syncDraftProject,
  ]);

  useEffect(() => {
    if (!isBootstrapped || !projectDraft) {
      return;
    }

    const currentSignature = buildProjectSignature(projectDraft);
    if (currentSignature === lastSavedSignatureRef.current) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      try {
        const result = saveStoryProject(projectDraft);
        lastSavedSignatureRef.current = buildProjectSignature(result.project);
        setProjects((current) => upsertProject(current, result.project));
        setProjectDraft((current) => (current?.id === result.project.id ? result.project : current));
        if (result.warning) {
          setNoticeMessage(result.warning);
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Nao foi possivel salvar este projeto localmente.";
        setErrorMessage(message);
      }
    }, 320);

    return () => window.clearTimeout(timeoutId);
  }, [isBootstrapped, projectDraft]);

  const activeProject = projectDraft;
  const hasApiKey = hasStoryEngineApiKey();
  const querySuffix = searchParams.toString() ? `?${searchParams.toString()}` : "";

  const patchProject = useCallback(
    (updater: (project: StoryProject) => StoryProject) => {
      if (!activeProject) {
        return;
      }

      const nextProject = updater(activeProject);
      setProjects((current) => upsertProject(current, nextProject));
      setProjectDraft(nextProject);
    },
    [activeProject],
  );

  const handleCreateProject = useCallback(() => {
    try {
      const created = buildSeededProject();
      const result = saveStoryProject(created);
      syncDraftProject(result.project);
      lastSavedSignatureRef.current = buildProjectSignature(result.project);
      navigate(`/story-engine/${result.project.id}${querySuffix}`);
      if (result.warning) {
        setNoticeMessage(result.warning);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Nao foi possivel criar um novo projeto.",
      );
    }
  }, [buildSeededProject, navigate, querySuffix, syncDraftProject]);

  const handleSelectProject = useCallback(
    (nextProjectId: string) => {
      const nextProject = projects.find((project) => project.id === nextProjectId);
      if (!nextProject) {
        return;
      }

      setActiveProjectIdState(nextProject.id);
      setActiveStoryProjectId(nextProject.id);
      setProjectDraft(nextProject);
      lastSavedSignatureRef.current = buildProjectSignature(nextProject);
      navigate(`/story-engine/${nextProject.id}${querySuffix}`);
    },
    [navigate, projects, querySuffix],
  );

  const handleDeleteCurrentProject = useCallback(() => {
    if (!activeProject) {
      return;
    }

    const confirmed = window.confirm(`Remover o projeto "${activeProject.title}" do armazenamento local?`);
    if (!confirmed) {
      return;
    }

    const nextProjects = deleteStoryProject(activeProject.id);
    const nextProject = nextProjects[0] ?? buildSeededProject();

    if (!nextProjects.length) {
      const result = saveStoryProject(nextProject);
      setProjects([result.project]);
      setProjectDraft(result.project);
      setActiveProjectIdState(result.project.id);
      setActiveStoryProjectId(result.project.id);
      lastSavedSignatureRef.current = buildProjectSignature(result.project);
      navigate(`/story-engine/${result.project.id}${querySuffix}`);
      return;
    }

    setProjects(nextProjects);
    setProjectDraft(nextProject);
    setActiveProjectIdState(nextProject.id);
    setActiveStoryProjectId(nextProject.id);
    lastSavedSignatureRef.current = buildProjectSignature(nextProject);
    navigate(`/story-engine/${nextProject.id}${querySuffix}`);
  }, [activeProject, buildSeededProject, navigate, querySuffix]);

  const handleStoryUpload = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || !activeProject) {
        return;
      }

      try {
        const text = await readFileAsText(file);
        patchProject((project) => ({
          ...project,
          title: stripExtension(file.name) || project.title,
          rawText: text,
        }));
        setStep("analyze");
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Falha ao carregar o texto.");
      } finally {
        event.target.value = "";
      }
    },
    [activeProject, patchProject],
  );

  const handleReferenceUpload = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || !activeProject) {
        return;
      }

      try {
        const dataUrl = await readFileAsDataUrl(file);
        patchProject((project) => ({
          ...project,
          references: [...project.references, dataUrl],
        }));
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Falha ao carregar a referencia.");
      } finally {
        event.target.value = "";
      }
    },
    [activeProject, patchProject],
  );

  const handleUseLinkedSeed = useCallback(() => {
    if (!linkedContext?.seedText) {
      return;
    }

    patchProject((project) => ({
      ...project,
      rawText: project.rawText.trim()
        ? `${project.rawText}\n\n${linkedContext.seedText}`
        : linkedContext.seedText || "",
    }));
  }, [linkedContext?.seedText, patchProject]);

  const handleAnalyze = useCallback(async () => {
    if (!activeProject?.rawText.trim()) {
      setErrorMessage("Carregue ou escreva um texto antes de iniciar a analise.");
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const analysis = await storyEngineService.analyzeStory(
        activeProject.rawText,
        activeProject.context,
      );

      patchProject((project) => ({
        ...project,
        style: analysis.style,
        characters: analysis.characters,
        scenes: analysis.scenes,
      }));
      setStep("characters");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Falha ao analisar a historia com Gemini.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  }, [activeProject, patchProject]);

  const attachGeneratedAsset = useCallback(
    (
      kind: GeneratedStoryAsset["kind"],
      prompt: string,
      dataUrl: string,
      targetId?: string,
    ) => {
      patchProject((project) => ({
        ...project,
        assets: [
          {
            id: generateSecureShortId(),
            kind,
            prompt,
            dataUrl,
            targetId,
            createdAt: new Date().toISOString(),
          },
          ...project.assets,
        ],
      }));
    },
    [patchProject],
  );

  const handleGenerateCharacterImage = useCallback(
    async (character: StoryCharacter) => {
      if (!activeProject) {
        return;
      }

      setImageTargetId(character.id);
      setErrorMessage(null);

      try {
        const prompt = `Design de personagem: ${character.name}. ${character.visualTraits}. ${character.description}`;
        const dataUrl = await storyEngineService.generateProductionImage(prompt, "character", {
          style: activeProject.style,
          characters: [character],
          references: activeProject.references,
        });

        patchProject((project) => ({
          ...project,
          characters: project.characters.map((candidate) =>
            candidate.id === character.id ? { ...candidate, referenceImage: dataUrl } : candidate,
          ),
        }));
        attachGeneratedAsset("character", prompt, dataUrl, character.id);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Falha ao gerar a imagem do personagem.",
        );
      } finally {
        setImageTargetId(null);
      }
    },
    [activeProject, attachGeneratedAsset, patchProject],
  );

  const handleGenerateSceneImage = useCallback(
    async (scene: StoryScene) => {
      if (!activeProject) {
        return;
      }

      setImageTargetId(scene.id);
      setErrorMessage(null);

      try {
        const dataUrl = await storyEngineService.generateProductionImage(
          scene.storyboardPrompt,
          "storyboard",
          {
            style: activeProject.style,
            characters: activeProject.characters.filter((character) =>
              scene.characters.includes(character.name),
            ),
            references: activeProject.references,
          },
        );

        patchProject((project) => ({
          ...project,
          scenes: project.scenes.map((candidate) =>
            candidate.id === scene.id ? { ...candidate, generatedImageUrl: dataUrl } : candidate,
          ),
        }));
        attachGeneratedAsset("storyboard", scene.storyboardPrompt, dataUrl, scene.id);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Falha ao gerar o storyboard da cena.",
        );
      } finally {
        setImageTargetId(null);
      }
    },
    [activeProject, attachGeneratedAsset, patchProject],
  );

  const handleCopyText = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setNoticeMessage("Prompt copiado para a area de transferencia.");
    } catch {
      setNoticeMessage("Nao foi possivel copiar automaticamente. Tente novamente pelo navegador.");
    }
  }, []);

  const handleExportProject = useCallback(() => {
    if (!activeProject) {
      return;
    }

    const blob = new Blob([JSON.stringify(activeProject, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${stripExtension(activeProject.title)}-story-engine.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }, [activeProject]);

  if (!isBootstrapped || !activeProject) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center py-16">
        <div className="flex items-center gap-3 border border-[hsl(var(--outline-variant)/0.18)] bg-[hsl(var(--surface-raised)/0.72)] px-5 py-4 text-sm uppercase tracking-[0.22em] text-foreground/64">
          <Loader2 className="h-4 w-4 animate-spin text-brand" />
          Carregando workspace do Story Engine
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <StoryEngineContextPanel project={activeProject} />

        {!hasApiKey ? (
          <Alert className="border-[hsl(var(--warning)/0.22)] bg-[linear-gradient(180deg,hsl(var(--warning)/0.14),hsl(var(--surface-base)/0.92))]">
            <AlertCircle className="h-4 w-4 text-warning" />
            <AlertTitle>Gemini ainda nao esta configurado</AlertTitle>
            <AlertDescription>
              Defina <code>VITE_GEMINI_API_KEY</code> no ambiente para habilitar analise e geracao de imagens.
              A rota continua abrindo normalmente, mas a IA fica indisponivel ate a chave entrar.
            </AlertDescription>
          </Alert>
        ) : null}

        {noticeMessage ? (
          <Alert className="border-[hsl(var(--brand)/0.18)] bg-[linear-gradient(180deg,hsl(var(--brand)/0.12),hsl(var(--surface-base)/0.9))]">
            <Sparkles className="h-4 w-4 text-brand" />
            <AlertTitle>Aviso do workspace</AlertTitle>
            <AlertDescription>{noticeMessage}</AlertDescription>
          </Alert>
        ) : null}

        {errorMessage ? (
          <Alert className="border-[hsl(var(--destructive-foreground)/0.22)] bg-[linear-gradient(180deg,hsl(var(--destructive-foreground)/0.12),hsl(var(--surface-base)/0.92))]">
            <AlertCircle className="h-4 w-4 text-status-bad" />
            <AlertTitle>Falha no Story Engine</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <StoryEngineProjectRail
            step={step}
            projects={projects}
            selectedProjectId={projectId ?? activeProjectId}
            onStepChange={setStep}
            onCreateProject={handleCreateProject}
            onSelectProject={handleSelectProject}
          />

          <div className="space-y-6">
            <Card variant="panel">
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{activeProject.style}</Badge>
                    <Badge variant="secondary">{activeProject.characters.length} personagens</Badge>
                    <Badge variant="secondary">{activeProject.scenes.length} cenas</Badge>
                    <Badge variant="secondary">{activeProject.references.length} referencias</Badge>
                  </div>
                  <p className="text-sm leading-7 text-foreground/72">
                    Trabalhando em <span className="font-display text-lg text-foreground">{activeProject.title}</span>.
                    O projeto permanece salvo localmente e pode ser exportado a qualquer momento.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button type="button" size="sm" variant="outline" onClick={handleExportProject}>
                    <Download className="h-4 w-4" />
                    Exportar JSON
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={handleDeleteCurrentProject}>
                    <Trash2 className="h-4 w-4" />
                    Remover projeto
                  </Button>
                </div>
              </CardContent>
            </Card>

            {step === "ingest" ? (
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
                <Card variant="elevated">
                  <CardContent className="space-y-5 p-6">
                    <div className="space-y-2">
                      <p className="section-kicker">Ingestao</p>
                      <h2 className="font-display text-3xl text-foreground">Carregue texto e fixe a premissa.</h2>
                      <p className="text-sm leading-7 text-foreground/72">
                        O Story Engine aceita texto bruto, notas de sessao e sementes ligadas a campanha. A partir
                        daqui ele extrai elenco e blocos de storyboard.
                      </p>
                    </div>

                    <div className="grid gap-5 md:grid-cols-[220px_minmax(0,1fr)]">
                      <label className="flex min-h-[240px] cursor-pointer flex-col items-center justify-center gap-4 border border-dashed border-[hsl(var(--outline-variant)/0.24)] bg-[linear-gradient(180deg,hsl(var(--surface-raised)/0.84),hsl(var(--surface-base)/0.94))] px-5 py-6 text-center transition-colors hover:border-[hsl(var(--brand)/0.28)]">
                        <span className="dark-lore-icon-emblem h-14 w-14">
                          <FileUp className="h-5 w-5" />
                        </span>
                        <div className="space-y-2">
                          <p className="font-display text-2xl text-foreground">Enviar arquivo</p>
                          <p className="text-xs uppercase tracking-[0.24em] text-foreground/52">
                            TXT, MD ou extratos textuais
                          </p>
                        </div>
                        <input type="file" accept=".txt,.md,.json,.csv,.html,.rtf" className="hidden" onChange={handleStoryUpload} />
                      </label>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-[0.24em] text-foreground/52">
                            Titulo do projeto
                          </label>
                          <Input
                            value={activeProject.title}
                            onChange={(event) =>
                              patchProject((project) => ({
                                ...project,
                                title: event.target.value,
                              }))
                            }
                            placeholder="Ex.: Contrato da ponte afogada"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-[0.24em] text-foreground/52">
                            Texto base
                          </label>
                          <Textarea
                            value={activeProject.rawText}
                            onChange={(event) =>
                              patchProject((project) => ({
                                ...project,
                                rawText: event.target.value,
                              }))
                            }
                            className="min-h-[260px]"
                            placeholder="Cole aqui o manuscrito, resumo da sessao, contrato ou outline narrativo."
                          />
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <Button type="button" onClick={handleAnalyze} disabled={!hasApiKey || isAnalyzing}>
                            {isAnalyzing ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Sparkles className="h-4 w-4" />
                            )}
                            Iniciar analise
                          </Button>
                          {linkedContext?.seedText ? (
                            <Button type="button" variant="outline" onClick={handleUseLinkedSeed}>
                              <Wand2 className="h-4 w-4" />
                              Inserir semente da campanha
                            </Button>
                          ) : null}
                          <Button type="button" variant="ghost" asChild>
                            <Link to="/jogar">
                              <Clapperboard className="h-4 w-4" />
                              Voltar ao hub
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card variant="panel">
                  <CardContent className="space-y-5 p-6">
                    <div className="space-y-2">
                      <p className="section-kicker">Referencias visuais</p>
                      <h3 className="font-display text-3xl text-foreground">Imagem de apoio</h3>
                      <p className="text-sm leading-7 text-foreground/72">
                        Adicione rostos, texturas, cenarios e quadros de atmosfera. O Gemini usa esse material
                        como guia na hora de montar personagem e storyboard.
                      </p>
                    </div>

                    <StoryEngineReferenceStrip
                      references={activeProject.references}
                      onAddReference={handleReferenceUpload}
                      onRemoveReference={(index) =>
                        patchProject((project) => ({
                          ...project,
                          references: project.references.filter((_, candidateIndex) => candidateIndex !== index),
                        }))
                      }
                      compact
                    />
                  </CardContent>
                </Card>
              </div>
            ) : null}

            {step === "analyze" ? (
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                <Card variant="elevated">
                  <CardContent className="space-y-5 p-6">
                    <div className="space-y-2">
                      <p className="section-kicker">Analise</p>
                      <h2 className="font-display text-3xl text-foreground">Transforme texto em estrutura de sessao.</h2>
                      <p className="text-sm leading-7 text-foreground/72">
                        Esta etapa extrai o estilo visual, identifica personagens centrais e ordena cenas jogaveis
                        para o storyboard.
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="border border-[hsl(var(--outline-variant)/0.14)] bg-[hsl(var(--surface-base)/0.72)] px-4 py-4">
                        <p className="text-[10px] uppercase tracking-[0.24em] text-foreground/52">Texto</p>
                        <p className="mt-2 font-display text-2xl text-foreground">
                          {activeProject.rawText.trim().split(/\s+/).filter(Boolean).length}
                        </p>
                        <p className="text-xs uppercase tracking-[0.24em] text-foreground/44">palavras</p>
                      </div>
                      <div className="border border-[hsl(var(--outline-variant)/0.14)] bg-[hsl(var(--surface-base)/0.72)] px-4 py-4">
                        <p className="text-[10px] uppercase tracking-[0.24em] text-foreground/52">Elenco</p>
                        <p className="mt-2 font-display text-2xl text-foreground">{activeProject.characters.length}</p>
                        <p className="text-xs uppercase tracking-[0.24em] text-foreground/44">personagens detectados</p>
                      </div>
                      <div className="border border-[hsl(var(--outline-variant)/0.14)] bg-[hsl(var(--surface-base)/0.72)] px-4 py-4">
                        <p className="text-[10px] uppercase tracking-[0.24em] text-foreground/52">Storyboard</p>
                        <p className="mt-2 font-display text-2xl text-foreground">{activeProject.scenes.length}</p>
                        <p className="text-xs uppercase tracking-[0.24em] text-foreground/44">cenas sugeridas</p>
                      </div>
                    </div>

                    <div className="border border-[hsl(var(--outline-variant)/0.14)] bg-[linear-gradient(180deg,hsl(var(--surface-raised)/0.74),hsl(var(--surface-base)/0.92))] px-5 py-5">
                      <p className="text-[10px] uppercase tracking-[0.24em] text-foreground/52">Direcao visual atual</p>
                      <p className="mt-3 font-display text-2xl text-foreground">{activeProject.style}</p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button type="button" onClick={handleAnalyze} disabled={!hasApiKey || isAnalyzing}>
                        {isAnalyzing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4" />
                        )}
                        Executar analise completa
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setStep("characters")}>
                        <UserSquare2 className="h-4 w-4" />
                        Ir para personagens
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card variant="panel">
                  <CardContent className="space-y-4 p-6">
                    <div>
                      <p className="section-kicker">Semente ativa</p>
                      <h3 className="mt-2 font-heading text-2xl text-foreground">Contexto que entra na IA</h3>
                    </div>
                    <p className="text-sm leading-7 text-foreground/72">
                      {activeProject.context?.seedText ??
                        "Nenhum contexto externo foi acoplado. O Story Engine vai trabalhar apenas sobre o texto carregado."}
                    </p>
                    <Button type="button" variant="ghost" onClick={() => setStep("ingest")}>
                      <FileUp className="h-4 w-4" />
                      Voltar para ingestao
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : null}

            {step === "characters" ? (
              <div className="space-y-6">
                <Card variant="panel">
                  <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
                    <div className="space-y-2">
                      <p className="section-kicker">Personagens</p>
                      <h2 className="font-display text-3xl text-foreground">Feche a biblia visual do elenco.</h2>
                      <p className="text-sm leading-7 text-foreground/72">
                        Gere estudos de personagem com consistencia visual antes de partir para os quadros de cena.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Button type="button" variant="outline" onClick={() => setStep("production")}>
                        <Clapperboard className="h-4 w-4" />
                        Ir para storyboard
                      </Button>
                      <Button type="button" variant="ghost" onClick={() => setStep("analyze")}>
                        <Sparkles className="h-4 w-4" />
                        Revisar analise
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid gap-6 lg:grid-cols-2">
                  {activeProject.characters.map((character) => (
                    <Card key={character.id} variant="elevated">
                      <CardContent className="grid gap-5 p-6 md:grid-cols-[180px_minmax(0,1fr)]">
                        <div className="overflow-hidden border border-[hsl(var(--outline-variant)/0.16)] bg-[hsl(var(--surface-base)/0.84)]">
                          {character.referenceImage ? (
                            <img
                              src={character.referenceImage}
                              alt={`Estudo visual de ${character.name}`}
                              className="h-full min-h-[240px] w-full object-cover"
                              loading="lazy"
                              decoding="async"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="flex min-h-[240px] items-center justify-center text-foreground/36">
                              <UserSquare2 className="h-10 w-10" />
                            </div>
                          )}
                        </div>
                        <div className="space-y-4">
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.24em] text-foreground/52">Personagem</p>
                            <h3 className="mt-2 font-display text-3xl text-foreground">{character.name}</h3>
                          </div>

                          <p className="text-sm leading-7 text-foreground/74">{character.description}</p>

                          <div className="border border-[hsl(var(--outline-variant)/0.14)] bg-[hsl(var(--surface-base)/0.74)] px-4 py-4">
                            <p className="text-[10px] uppercase tracking-[0.24em] text-foreground/52">Tracos visuais</p>
                            <p className="mt-2 text-sm leading-7 text-foreground/78">{character.visualTraits}</p>
                          </div>

                          <div className="flex flex-wrap gap-3">
                            <Button
                              type="button"
                              onClick={() => handleGenerateCharacterImage(character)}
                              disabled={!hasApiKey || imageTargetId === character.id}
                            >
                              {imageTargetId === character.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <ImagePlus className="h-4 w-4" />
                              )}
                              Gerar estudo visual
                            </Button>
                            {character.referenceImage ? (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                  downloadDataUrl(
                                    `${stripExtension(activeProject.title)}-${stripExtension(character.name)}.png`,
                                    character.referenceImage!,
                                  )
                                }
                              >
                                <Download className="h-4 w-4" />
                                Baixar
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {!activeProject.characters.length ? (
                    <Card variant="outline" className="lg:col-span-2">
                      <CardContent className="space-y-4 p-6">
                        <p className="section-kicker">Sem elenco</p>
                        <h3 className="font-display text-3xl text-foreground">A analise ainda nao trouxe personagens.</h3>
                        <p className="text-sm leading-7 text-foreground/72">
                          Volte para a etapa de analise depois de carregar um texto ou reforcar a semente da campanha.
                        </p>
                        <Button type="button" onClick={() => setStep("analyze")}>
                          <Sparkles className="h-4 w-4" />
                          Abrir analise
                        </Button>
                      </CardContent>
                    </Card>
                  ) : null}
                </div>
              </div>
            ) : null}

            {step === "production" ? (
              <div className="space-y-6">
                <Card variant="panel">
                  <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
                    <div className="space-y-2">
                      <p className="section-kicker">Storyboard</p>
                      <h2 className="font-display text-3xl text-foreground">Quadros de producao para a sessao.</h2>
                      <p className="text-sm leading-7 text-foreground/72">
                        Cada cena nasce com prompt proprio, elenco vinculado e espaco para gerar visual de apoio.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Button type="button" variant="outline" onClick={() => setStep("characters")}>
                        <UserSquare2 className="h-4 w-4" />
                        Voltar ao elenco
                      </Button>
                      <Button type="button" variant="ghost" onClick={handleExportProject}>
                        <Download className="h-4 w-4" />
                        Exportar pacote
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  {activeProject.scenes.map((scene) => (
                    <Card key={scene.id} variant="elevated">
                      <CardContent className="grid gap-5 p-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                        <div className="space-y-4">
                          <div className="flex flex-wrap items-center gap-3">
                            <Badge variant="outline">Cena {scene.order}</Badge>
                            <Badge variant="secondary">{scene.setting}</Badge>
                            {scene.characters.map((name) => (
                              <Badge key={`${scene.id}-${name}`} variant="secondary">
                                {name}
                              </Badge>
                            ))}
                          </div>

                          <div className="space-y-2">
                            <h3 className="font-display text-3xl text-foreground">{scene.title}</h3>
                            <p className="text-sm leading-7 text-foreground/74">{scene.description}</p>
                          </div>

                          <div className="border border-[hsl(var(--outline-variant)/0.14)] bg-[hsl(var(--surface-base)/0.74)] px-4 py-4">
                            <p className="text-[10px] uppercase tracking-[0.24em] text-foreground/52">Prompt de storyboard</p>
                            <p className="mt-2 text-sm leading-7 text-foreground/78">{scene.storyboardPrompt}</p>
                          </div>

                          <div className="flex flex-wrap gap-3">
                            <Button
                              type="button"
                              onClick={() => handleGenerateSceneImage(scene)}
                              disabled={!hasApiKey || imageTargetId === scene.id}
                            >
                              {imageTargetId === scene.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <ImagePlus className="h-4 w-4" />
                              )}
                              Gerar storyboard
                            </Button>
                            <Button type="button" variant="outline" onClick={() => handleCopyText(scene.storyboardPrompt)}>
                              <Copy className="h-4 w-4" />
                              Copiar prompt
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="overflow-hidden border border-[hsl(var(--outline-variant)/0.16)] bg-[hsl(var(--surface-base)/0.84)]">
                            {scene.generatedImageUrl ? (
                              <img
                                src={scene.generatedImageUrl}
                                alt={`Storyboard da cena ${scene.title}`}
                                className="h-[360px] w-full object-cover"
                                loading="lazy"
                                decoding="async"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="flex h-[360px] items-center justify-center text-foreground/36">
                                <Clapperboard className="h-10 w-10" />
                              </div>
                            )}
                          </div>

                          {scene.generatedImageUrl ? (
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full"
                              onClick={() =>
                                downloadDataUrl(
                                  `${stripExtension(activeProject.title)}-cena-${scene.order}.png`,
                                  scene.generatedImageUrl!,
                                )
                              }
                            >
                              <Download className="h-4 w-4" />
                              Baixar imagem
                            </Button>
                          ) : null}
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {!activeProject.scenes.length ? (
                    <Card variant="outline">
                      <CardContent className="space-y-4 p-6">
                        <p className="section-kicker">Sem cenas</p>
                        <h3 className="font-display text-3xl text-foreground">Nenhum storyboard foi gerado ainda.</h3>
                        <p className="text-sm leading-7 text-foreground/72">
                          Rode a etapa de analise para extrair cenas ou cole um texto mais completo no workspace.
                        </p>
                        <Button type="button" onClick={() => setStep("analyze")}>
                          <Sparkles className="h-4 w-4" />
                          Rodar analise
                        </Button>
                      </CardContent>
                    </Card>
                  ) : null}
                </div>
              </div>
            ) : null}

            {activeProject.assets.length ? (
              <Card variant="panel">
                <CardContent className="space-y-4 p-6">
                  <div>
                    <p className="section-kicker">Saidas recentes</p>
                    <h3 className="mt-2 font-heading text-2xl text-foreground">Ultimos artefatos gerados</h3>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {activeProject.assets.slice(0, 6).map((asset) => (
                      <div
                        key={asset.id}
                        className="space-y-3 border border-[hsl(var(--outline-variant)/0.14)] bg-[hsl(var(--surface-base)/0.74)] p-4"
                      >
                        <img
                          src={asset.dataUrl}
                          alt={`Artefato ${asset.kind}`}
                          className="h-40 w-full object-cover"
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                        />
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <Badge variant="outline">{asset.kind}</Badge>
                            <span className="text-[10px] uppercase tracking-[0.22em] text-foreground/48">
                              {new Date(asset.createdAt).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                          <p className="line-clamp-3 text-sm leading-6 text-foreground/74">{asset.prompt}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </section>
      </motion.div>
    </div>
  );
}
