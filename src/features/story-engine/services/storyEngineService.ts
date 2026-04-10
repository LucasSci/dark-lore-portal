import { GoogleGenAI, Type } from "@google/genai";

import { generateSecureShortId } from "@/lib/utils";

import type {
  StoryAnalysisResult,
  StoryCharacter,
  StoryImageGenerationContext,
  StoryProjectContext,
  StoryScene,
} from "../types";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const TEXT_MODEL = import.meta.env.VITE_GEMINI_TEXT_MODEL || "gemini-2.5-flash";
const IMAGE_MODEL = import.meta.env.VITE_GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";

function buildContextBlock(context?: StoryProjectContext) {
  if (!context?.campaignId && !context?.sceneId && !context?.seedText) {
    return "";
  }

  return [
    "CONTEXTO DO PORTAL:",
    context.campaignTitle ? `Campanha: ${context.campaignTitle}` : null,
    context.sceneTitle ? `Cena: ${context.sceneTitle}` : null,
    context.seedText ? `Semente vinculada: ${context.seedText}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export class StoryEngineService {
  private ai: GoogleGenAI | null = null;

  private getClient() {
    if (!GEMINI_API_KEY) {
      throw new Error(
        "VITE_GEMINI_API_KEY nao configurada. Defina a chave Gemini para analisar historias e gerar imagens.",
      );
    }

    if (!this.ai) {
      this.ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    }

    return this.ai;
  }

  async analyzeStory(rawText: string, context?: StoryProjectContext): Promise<StoryAnalysisResult> {
    const ai = this.getClient();
    const prompt = [
      "Voce e um diretor de pre-producao para um portal de RPG dark fantasy.",
      "Analise o texto e produza um pacote editorial curto para storyboard.",
      "Responda em Portugues do Brasil.",
      "Priorize personagens centrais, cenas jogaveis e consistencia visual para campanha.",
      buildContextBlock(context),
      "",
      "TEXTO BASE:",
      rawText.slice(0, 18000),
    ]
      .filter(Boolean)
      .join("\n");

    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            style: {
              type: Type.STRING,
              description: "Direcao visual curta e consistente para o projeto.",
            },
            characters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  visualTraits: { type: Type.STRING },
                },
                required: ["name", "description", "visualTraits"],
              },
            },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  setting: { type: Type.STRING },
                  characters: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  storyboardPrompt: { type: Type.STRING },
                },
                required: ["title", "description", "setting", "characters", "storyboardPrompt"],
              },
            },
          },
          required: ["style", "characters", "scenes"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}") as {
      style?: string;
      characters?: Array<Omit<StoryCharacter, "id">>;
      scenes?: Array<Omit<StoryScene, "id" | "order">>;
    };

    return {
      style: parsed.style?.trim() || "Dark fantasy cinematic codex",
      characters: Array.isArray(parsed.characters)
        ? parsed.characters.map((character) => ({
            id: generateSecureShortId(),
            name: character.name,
            description: character.description,
            visualTraits: character.visualTraits,
          }))
        : [],
      scenes: Array.isArray(parsed.scenes)
        ? parsed.scenes.map((scene, index) => ({
            id: generateSecureShortId(),
            order: index + 1,
            title: scene.title,
            description: scene.description,
            setting: scene.setting,
            characters: Array.isArray(scene.characters) ? scene.characters : [],
            storyboardPrompt: scene.storyboardPrompt,
          }))
        : [],
    };
  }

  async generateProductionImage(
    prompt: string,
    kind: "character" | "storyboard",
    context?: StoryImageGenerationContext,
  ) {
    const ai = this.getClient();
    const promptLines = [
      `Tarefa: gerar uma imagem de ${kind === "character" ? "personagem" : "storyboard"} para um portal de RPG dark fantasy.`,
      context?.style ? `Direcao visual: ${context.style}` : null,
      context?.characters?.length
        ? `Guia de personagens:\n${context.characters
            .map((character) => `- ${character.name}: ${character.visualTraits}`)
            .join("\n")}`
        : null,
      `Brief principal: ${prompt}`,
      "Evite texto na imagem. Priorize composicao cinematografica, leitura clara e atmosfera de fantasia sombria.",
    ].filter(Boolean);

    const parts: Array<
      | { text: string }
      | {
          inlineData: {
            mimeType: string;
            data: string;
          };
        }
    > = [{ text: promptLines.join("\n\n") }];

    context?.references?.forEach((reference) => {
      const [header, data] = reference.split(";base64,");
      const mimeType = header?.split(":")[1];
      if (mimeType && data) {
        parts.push({
          inlineData: {
            mimeType,
            data,
          },
        });
      }
    });

    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: { parts },
    });

    const candidateParts = response.candidates?.[0]?.content?.parts ?? [];
    const imagePart = candidateParts.find((part) => Boolean(part.inlineData));
    if (!imagePart?.inlineData?.data || !imagePart.inlineData.mimeType) {
      throw new Error("O Gemini nao retornou uma imagem valida para este pedido.");
    }

    return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
  }
}

export function hasStoryEngineApiKey() {
  return Boolean(GEMINI_API_KEY);
}

export const storyEngineService = new StoryEngineService();
