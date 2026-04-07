export type StoryEngineStep = "ingest" | "analyze" | "characters" | "production";

export type StoryAssetKind = "character" | "storyboard" | "reference";

export interface StoryCharacter {
  id: string;
  name: string;
  description: string;
  visualTraits: string;
  referenceImage?: string;
}

export interface StoryScene {
  id: string;
  order: number;
  title: string;
  description: string;
  setting: string;
  characters: string[];
  storyboardPrompt: string;
  generatedImageUrl?: string;
}

export interface GeneratedStoryAsset {
  id: string;
  kind: StoryAssetKind;
  prompt: string;
  dataUrl: string;
  targetId?: string;
  createdAt: string;
}

export interface StoryProjectContext {
  campaignId?: string;
  campaignTitle?: string;
  sceneId?: string;
  sceneTitle?: string;
  seedText?: string;
  linkedAt?: string;
}

export interface StoryProject {
  id: string;
  title: string;
  rawText: string;
  style: string;
  characters: StoryCharacter[];
  scenes: StoryScene[];
  references: string[];
  assets: GeneratedStoryAsset[];
  campaignId?: string;
  sceneId?: string;
  context?: StoryProjectContext;
  createdAt: string;
  updatedAt: string;
}

export interface StoryAnalysisResult {
  characters: StoryCharacter[];
  scenes: StoryScene[];
  style: string;
}

export interface StoryImageGenerationContext {
  style?: string;
  characters?: StoryCharacter[];
  references?: string[];
}

export interface StoryStorageSaveResult {
  project: StoryProject;
  warning?: string;
}
