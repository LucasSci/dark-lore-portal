import { generateSecureShortId } from "@/lib/utils";

import type { StoryProject, StoryProjectContext, StoryStorageSaveResult } from "./types";

const PROJECTS_KEY = "dark-lore-storyengine-projects";
const ACTIVE_PROJECT_KEY = "dark-lore-storyengine-active-project";
const LEGACY_PROJECT_KEY = "story_project";
const LEGACY_REFERENCES_KEY = "story_references";

interface StoryProjectsPayload {
  version: 1;
  projects: StoryProject[];
}

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function nowIso() {
  return new Date().toISOString();
}

function normalizeProject(partial: Partial<StoryProject>): StoryProject {
  const timestamp = partial.updatedAt ?? partial.createdAt ?? nowIso();

  return {
    id: partial.id ?? generateSecureShortId(),
    title: partial.title?.trim() || "Novo projeto do Story Engine",
    rawText: partial.rawText ?? "",
    style: partial.style?.trim() || "Dark fantasy cinematic codex",
    characters: Array.isArray(partial.characters) ? partial.characters : [],
    scenes: Array.isArray(partial.scenes) ? partial.scenes : [],
    references: Array.isArray(partial.references) ? partial.references : [],
    assets: Array.isArray(partial.assets) ? partial.assets : [],
    campaignId: partial.campaignId,
    sceneId: partial.sceneId,
    context: partial.context,
    createdAt: partial.createdAt ?? timestamp,
    updatedAt: partial.updatedAt ?? timestamp,
  };
}

function readPayload(): StoryProjectsPayload {
  if (!canUseStorage()) {
    return { version: 1, projects: [] };
  }

  const raw = window.localStorage.getItem(PROJECTS_KEY);
  if (!raw) {
    return { version: 1, projects: migrateLegacyProject() };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StoryProjectsPayload> | StoryProject[];
    if (Array.isArray(parsed)) {
      return {
        version: 1,
        projects: parsed.map((project) => normalizeProject(project)),
      };
    }

    return {
      version: 1,
      projects: Array.isArray(parsed.projects)
        ? parsed.projects.map((project) => normalizeProject(project))
        : [],
    };
  } catch {
    return { version: 1, projects: migrateLegacyProject() };
  }
}

function writePayload(projects: StoryProject[], activeProjectId?: string | null) {
  if (!canUseStorage()) {
    return { projects, warning: undefined as string | undefined };
  }

  const payload: StoryProjectsPayload = {
    version: 1,
    projects,
  };

  try {
    window.localStorage.setItem(PROJECTS_KEY, JSON.stringify(payload));
    if (activeProjectId) {
      window.localStorage.setItem(ACTIVE_PROJECT_KEY, activeProjectId);
    }
    return { projects, warning: undefined as string | undefined };
  } catch (error) {
    const fallbackProjects = projects.map((project) =>
      normalizeProject({
        ...project,
        references: project.references.slice(-2),
        assets: [],
        characters: project.characters.map((character) => ({
          ...character,
          referenceImage: undefined,
        })),
        scenes: project.scenes.map((scene) => ({
          ...scene,
          generatedImageUrl: undefined,
        })),
      }),
    );

    try {
      window.localStorage.setItem(
        PROJECTS_KEY,
        JSON.stringify({
          version: 1,
          projects: fallbackProjects,
        } satisfies StoryProjectsPayload),
      );
      if (activeProjectId) {
        window.localStorage.setItem(ACTIVE_PROJECT_KEY, activeProjectId);
      }
      return {
        projects: fallbackProjects,
        warning:
          "O armazenamento local ficou perto do limite. O cache visual foi reduzido para manter o projeto salvo.",
      };
    } catch {
      const truncatedProjects = fallbackProjects.map((project) =>
        normalizeProject({
          ...project,
          references: [],
          rawText:
            project.rawText.length > 60000
              ? `${project.rawText.slice(0, 60000)}\n\n[Texto truncado para preservar o salvamento local.]`
              : project.rawText,
        }),
      );

      try {
        window.localStorage.setItem(
          PROJECTS_KEY,
          JSON.stringify({
            version: 1,
            projects: truncatedProjects,
          } satisfies StoryProjectsPayload),
        );
        if (activeProjectId) {
          window.localStorage.setItem(ACTIVE_PROJECT_KEY, activeProjectId);
        }
        return {
          projects: truncatedProjects,
          warning:
            "O armazenamento local ficou cheio. Referencias visuais foram removidas e o texto foi truncado para preservar a sessao.",
        };
      } catch {
        if (error instanceof Error) {
          throw new Error(
            `Nao foi possivel salvar o projeto no armazenamento local. ${error.message}`,
          );
        }
        throw new Error("Nao foi possivel salvar o projeto no armazenamento local.");
      }
    }
  }
}

function migrateLegacyProject() {
  if (!canUseStorage()) {
    return [];
  }

  const legacyProjectRaw = window.localStorage.getItem(LEGACY_PROJECT_KEY);
  if (!legacyProjectRaw) {
    return [];
  }

  try {
    const legacyProject = JSON.parse(legacyProjectRaw) as Partial<StoryProject> & {
      characters?: StoryProject["characters"];
      scenes?: StoryProject["scenes"];
    };
    const legacyReferences = (() => {
      const raw = window.localStorage.getItem(LEGACY_REFERENCES_KEY);
      if (!raw) return [];
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
      } catch {
        return [];
      }
    })();

    const migratedProject = normalizeProject({
      ...legacyProject,
      references: legacyReferences,
      assets: [],
      createdAt: nowIso(),
      updatedAt: nowIso(),
    });

    window.localStorage.removeItem(LEGACY_PROJECT_KEY);
    window.localStorage.removeItem(LEGACY_REFERENCES_KEY);
    const writeResult = writePayload([migratedProject], migratedProject.id);
    return writeResult.projects;
  } catch {
    window.localStorage.removeItem(LEGACY_PROJECT_KEY);
    window.localStorage.removeItem(LEGACY_REFERENCES_KEY);
    return [];
  }
}

export function buildStoryProjectContext(seed?: Partial<StoryProjectContext>): StoryProjectContext | undefined {
  if (!seed?.campaignId && !seed?.sceneId && !seed?.seedText) {
    return undefined;
  }

  return {
    campaignId: seed.campaignId,
    campaignTitle: seed.campaignTitle,
    sceneId: seed.sceneId,
    sceneTitle: seed.sceneTitle,
    seedText: seed.seedText,
    linkedAt: seed.linkedAt ?? nowIso(),
  };
}

export function loadStoryProjects() {
  return readPayload().projects;
}

export function getActiveStoryProjectId() {
  if (!canUseStorage()) {
    return null;
  }

  return window.localStorage.getItem(ACTIVE_PROJECT_KEY);
}

export function setActiveStoryProjectId(projectId: string | null) {
  if (!canUseStorage()) {
    return;
  }

  if (!projectId) {
    window.localStorage.removeItem(ACTIVE_PROJECT_KEY);
    return;
  }

  window.localStorage.setItem(ACTIVE_PROJECT_KEY, projectId);
}

export function createStoryProject(seed?: Partial<StoryProject>) {
  const timestamp = nowIso();
  return normalizeProject({
    title: "Novo projeto do Story Engine",
    rawText: "",
    style: "Dark fantasy cinematic codex",
    references: [],
    assets: [],
    characters: [],
    scenes: [],
    createdAt: timestamp,
    updatedAt: timestamp,
    ...seed,
  });
}

export function saveStoryProject(project: StoryProject): StoryStorageSaveResult {
  const normalized = normalizeProject({
    ...project,
    updatedAt: nowIso(),
  });
  const existingProjects = loadStoryProjects();
  const nextProjects = [
    normalized,
    ...existingProjects.filter((candidate) => candidate.id !== normalized.id),
  ];
  const { projects, warning } = writePayload(nextProjects, normalized.id);
  const persisted = projects.find((candidate) => candidate.id === normalized.id) ?? normalized;
  return { project: persisted, warning };
}

export function deleteStoryProject(projectId: string) {
  const existingProjects = loadStoryProjects();
  const nextProjects = existingProjects.filter((project) => project.id !== projectId);
  const nextActiveId = nextProjects[0]?.id ?? null;
  writePayload(nextProjects, nextActiveId);
  setActiveStoryProjectId(nextActiveId);
  return nextProjects;
}

export function loadStoryProjectById(projectId: string) {
  return loadStoryProjects().find((project) => project.id === projectId) ?? null;
}
