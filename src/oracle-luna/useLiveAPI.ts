import { useCallback, useEffect, useRef, useState } from "react";
import { GoogleGenAI, LiveServerMessage, Modality, Type } from "@google/genai";
import {
  getOracleArchiveRecord,
  oracleCanonicalDigest,
  searchOracleArchive,
  searchOracleArchiveReadTargets,
} from "./archive-grounding";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const LIVE_MODEL = import.meta.env.VITE_GEMINI_LIVE_MODEL || "gemini-3.1-flash-live-preview";
const LIVE_VOICE = import.meta.env.VITE_GEMINI_LIVE_VOICE || "Zephyr";
const TEXT_MODEL = import.meta.env.VITE_GEMINI_TEXT_MODEL || "gemini-2.5-flash";

type OracleDialogueTurn = {
  role: "user" | "oracle";
  text: string;
};

const LIVE_SYSTEM_INSTRUCTION = `Voce e o Oraculo de Luna, guardia do Arquivo do Continente.
Fale sempre em Portugues do Brasil, com tom ritualistico, claro e preciso.

REGRAS ABSOLUTAS DE CANON:
- Nunca invente fatos, capitulos, nomes, relacoes, eventos ou desfechos ausentes do arquivo.
- Antes de responder perguntas sobre lore, consulte o arquivo usando searchArchive e, quando necessario, readArchiveRecord.
- Se o arquivo nao trouxer base suficiente, diga que o arquivo permanece silencioso ou incompleto sobre esse ponto.
- Cite a origem naturalmente, por exemplo "nos registros de Capitulo XII" ou "no dossie de Nashara".

REGRAS DE LEITURA:
- Se o usuario pedir para ler, recitar, repetir exatamente, narrar o trecho ou ler o registro, reproduza o texto do arquivo com o minimo de alteracao possivel.
- Nesses casos, priorize readArchiveRecord e preserve a ordem e a redacao do registro.

REGRAS DE DIALOGO:
- Mantenha continuidade de conversa entre perguntas consecutivas.
- Ao receber perguntas de seguimento, preserve o contexto do que acabou de ser discutido.
- Se o usuario pedir para continuar, retome o ultimo ponto sem recomecar do zero.

REGRAS DE INTERFACE:
- So use updateAppCode se o usuario pedir explicitamente uma visao, uma cena ou uma mudanca visual do ambiente.

RESUMO CANONICO INICIAL:
${oracleCanonicalDigest}`;

function parseToolArgs(args: unknown) {
  if (!args) return {};
  if (typeof args === "string") {
    try {
      return JSON.parse(args) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  if (typeof args === "object") {
    return args as Record<string, unknown>;
  }
  return {};
}

function encodePcm16(channelData: Float32Array) {
  const pcm16 = new Int16Array(channelData.length);
  for (let index = 0; index < channelData.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, channelData[index] ?? 0));
    pcm16[index] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
  }

  const buffer = new Uint8Array(pcm16.buffer);
  let binary = "";
  for (let index = 0; index < buffer.length; index += 1) {
    binary += String.fromCharCode(buffer[index] ?? 0);
  }

  return window.btoa(binary);
}

function pushOrReplaceTurn(
  previous: OracleDialogueTurn[],
  role: OracleDialogueTurn["role"],
  text: string,
) {
  const trimmed = text.trim();
  if (!trimmed) return previous;

  const next = [...previous];
  const last = next[next.length - 1];
  if (last?.role === role) {
    next[next.length - 1] = { role, text: trimmed };
    return next;
  }

  next.push({ role, text: trimmed });
  return next.slice(-10);
}

function looksLikeReadingRequest(prompt: string) {
  const normalized = prompt
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  return [
    "leia",
    "ler",
    "recite",
    "recitar",
    "texto original",
    "registro completo",
    "literal",
    "como ele aparece",
  ].some((token) => normalized.includes(token));
}

function buildFallbackArchiveReply(prompt: string, dialogue: OracleDialogueTurn[]) {
  const matches = looksLikeReadingRequest(prompt)
    ? searchOracleArchiveReadTargets(prompt, 4)
    : searchOracleArchive(prompt, 4);
  const records = matches
    .map((match) => getOracleArchiveRecord(match.id))
    .filter((record): record is NonNullable<typeof record> => Boolean(record));

  if (records.length === 0) {
    return {
      text: "O arquivo permanece silencioso sobre esse ponto. Nenhum registro canônico suficiente foi encontrado para afirmar algo com segurança.",
      matches,
    };
  }

  if (looksLikeReadingRequest(prompt)) {
    return {
      text: `Leitura do arquivo: ${records[0].title}\n\n${records[0].body}`,
      matches,
    };
  }

  const historyContext = dialogue
    .slice(-6)
    .map((turn) => `${turn.role === "user" ? "Interlocutor" : "Oraculo"}: ${turn.text}`)
    .join("\n");

  const archiveContext = records
    .slice(0, 3)
    .map(
      (record) =>
        `${record.label} — ${record.title}\nResumo: ${record.summary}\nTexto:\n${record.body}`,
    )
    .join("\n\n---\n\n");

  return {
    text: [
      LIVE_SYSTEM_INSTRUCTION,
      "",
      "CONVERSA RECENTE:",
      historyContext || "Nenhuma conversa anterior.",
      "",
      "REGISTROS DISPONIVEIS:",
      archiveContext,
      "",
      `PERGUNTA ATUAL: ${prompt}`,
      "",
      "Responda apenas a partir dos registros acima. Se faltar base, diga que o arquivo permanece silencioso.",
    ].join("\n"),
    matches,
  };
}

export function useLiveAPI(onAppCodeUpdate: (code: string) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [microphoneReady, setMicrophoneReady] = useState(false);
  const [lastInputTranscript, setLastInputTranscript] = useState("");
  const [lastOutputTranscript, setLastOutputTranscript] = useState("");
  const [dialogue, setDialogue] = useState<OracleDialogueTurn[]>([]);

  const sessionRef = useRef<unknown>(null);
  const sessionPromiseRef = useRef<Promise<unknown> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const playbackContextRef = useRef<AudioContext | null>(null);
  const nextPlayTimeRef = useRef(0);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const respondedToolCallsRef = useRef<Set<string>>(new Set());
  const speakingTimeoutRef = useRef<number | null>(null);

  const cleanup = useCallback(() => {
    if (speakingTimeoutRef.current) {
      window.clearTimeout(speakingTimeoutRef.current);
      speakingTimeoutRef.current = null;
    }

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current?.state !== "closed") {
      audioContextRef.current?.close();
      audioContextRef.current = null;
    }

    if (playbackContextRef.current?.state !== "closed") {
      playbackContextRef.current?.close();
      playbackContextRef.current = null;
    }

    const activeSession = sessionRef.current as { close?: () => void } | null;
    if (activeSession?.close) {
      activeSession.close();
    }
    sessionRef.current = null;
    sessionPromiseRef.current = null;

    setIsConnected(false);
    setIsConnecting(false);
    setIsModelSpeaking(false);
    setAudioLevel(0);
    setMicrophoneReady(false);
  }, []);

  const attachMicrophone = useCallback(async (sessionPromise: Promise<unknown>) => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicrophoneReady(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;

      const audioContext = new AudioContext({ sampleRate: 16000 });
      await audioContext.resume();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (event) => {
        const channelData = event.inputBuffer.getChannelData(0);

        let sum = 0;
        for (let index = 0; index < channelData.length; index += 1) {
          sum += channelData[index] * channelData[index];
        }
        setAudioLevel(Math.sqrt(sum / channelData.length));

        const base64 = encodePcm16(channelData);
        sessionPromise.then((session) => {
          const liveSession = session as {
            sendRealtimeInput?: (params: { audio: { data: string; mimeType: string } }) => void;
          };
          if (sessionRef.current === session && liveSession.sendRealtimeInput) {
            liveSession.sendRealtimeInput({
              audio: { data: base64, mimeType: "audio/pcm;rate=16000" },
            });
          }
        });

        const outData = event.outputBuffer.getChannelData(0);
        for (let index = 0; index < outData.length; index += 1) {
          outData[index] = 0;
        }
      };

      source.connect(processor);
      processor.connect(audioContext.destination);
      setMicrophoneReady(true);
    } catch {
      setMicrophoneReady(false);
      setError("Sessao iniciada sem microfone. O oraculo continua disponivel por texto.");
    }
  }, []);

  const connect = useCallback(async () => {
    cleanup();
    setError(null);
    setLastInputTranscript("");
    setLastOutputTranscript("");
    setDialogue([]);
    respondedToolCallsRef.current.clear();
    setIsConnecting(true);

    try {
      if (!GEMINI_API_KEY) {
        throw new Error("VITE_GEMINI_API_KEY nao configurada.");
      }

      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

      playbackContextRef.current = new AudioContext({ sampleRate: 24000 });
      nextPlayTimeRef.current = playbackContextRef.current.currentTime;

      const sessionPromise = ai.live.connect({
        model: LIVE_MODEL,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: LIVE_VOICE } },
          },
          systemInstruction: LIVE_SYSTEM_INSTRUCTION,
          tools: [
            {
              functionDeclarations: [
                {
                  name: "searchArchive",
                  description:
                    "Busca registros canonicos do Arquivo do Continente para responder perguntas de lore.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      query: { type: Type.STRING, description: "Pergunta ou termos que devem ser verificados." },
                      maxResults: { type: Type.NUMBER, description: "Numero maximo de resultados entre 1 e 8." },
                    },
                    required: ["query"],
                  },
                },
                {
                  name: "readArchiveRecord",
                  description:
                    "Le o conteudo completo de um registro canonico especifico retornado pelo arquivo.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      recordId: { type: Type.STRING, description: "Identificador do registro, como chapter:cap12 ou entry:nashara." },
                    },
                    required: ["recordId"],
                  },
                },
                {
                  name: "updateAppCode",
                  description:
                    "Atualiza a composicao visual do oraculo quando o usuario pede uma visao ou cena explicitamente.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      htmlContent: { type: Type.STRING, description: "Documento HTML completo para a nova visao." },
                    },
                    required: ["htmlContent"],
                  },
                },
              ],
            },
          ],
        },
        callbacks: {
          onopen: async () => {
            if (sessionPromiseRef.current !== sessionPromise) return;
            setIsConnected(true);
            setIsConnecting(false);
            await attachMicrophone(sessionPromise);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (!sessionRef.current) return;

            const inputTranscript = message.serverContent?.inputTranscription?.text?.trim();
            if (inputTranscript) {
              setLastInputTranscript(inputTranscript);
              setDialogue((prev) => pushOrReplaceTurn(prev, "user", inputTranscript));
            }

            const outputTranscript = message.serverContent?.outputTranscription?.text?.trim();
            if (outputTranscript) {
              setLastOutputTranscript(outputTranscript);
              setDialogue((prev) => pushOrReplaceTurn(prev, "oracle", outputTranscript));
            }

            const parts = message.serverContent?.modelTurn?.parts || [];
            if (parts.length > 0) {
              setIsModelSpeaking(true);
              if (speakingTimeoutRef.current) {
                window.clearTimeout(speakingTimeoutRef.current);
              }
              speakingTimeoutRef.current = window.setTimeout(() => setIsModelSpeaking(false), 1800);
            }

            for (const part of parts) {
              const base64Audio = part.inlineData?.data;
              if (base64Audio && playbackContextRef.current) {
                const binaryString = atob(base64Audio);
                const bytes = new Uint8Array(binaryString.length);
                for (let index = 0; index < binaryString.length; index += 1) {
                  bytes[index] = binaryString.charCodeAt(index);
                }

                const pcm16 = new Int16Array(bytes.buffer);
                const audioBuffer = playbackContextRef.current.createBuffer(1, pcm16.length, 24000);
                const channelData = audioBuffer.getChannelData(0);
                for (let index = 0; index < pcm16.length; index += 1) {
                  channelData[index] = pcm16[index] / 32768;
                }

                const source = playbackContextRef.current.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(playbackContextRef.current.destination);

                const startTime = Math.max(playbackContextRef.current.currentTime, nextPlayTimeRef.current);
                source.start(startTime);
                nextPlayTimeRef.current = startTime + audioBuffer.duration;
              }
            }

            if (message.serverContent?.interrupted && playbackContextRef.current) {
              setIsModelSpeaking(false);
              playbackContextRef.current.close();
              playbackContextRef.current = new AudioContext({ sampleRate: 24000 });
              nextPlayTimeRef.current = playbackContextRef.current.currentTime;
            }

            if (message.toolCall?.functionCalls?.length) {
              const functionResponses: Array<Record<string, unknown>> = [];

              for (const call of message.toolCall.functionCalls) {
                const callId = call.id || "";
                if (callId && respondedToolCallsRef.current.has(callId)) {
                  continue;
                }
                if (callId) {
                  respondedToolCallsRef.current.add(callId);
                }

                const args = parseToolArgs(call.args);

                if (call.name === "searchArchive") {
                  const query = typeof args.query === "string" ? args.query : "";
                  const maxResults =
                    typeof args.maxResults === "number" ? args.maxResults : Number(args.maxResults ?? 5);
                  const matches = query ? searchOracleArchive(query, maxResults) : [];
                  const responseObj: Record<string, unknown> = {
                    name: call.name,
                    response: {
                      output: {
                        query,
                        matches,
                        guidance: matches.length
                          ? "Responda somente a partir desses registros."
                          : "O arquivo nao apresenta base suficiente para afirmar isso com seguranca.",
                      },
                    },
                  };
                  if (callId) responseObj.id = callId;
                  functionResponses.push(responseObj);
                  continue;
                }

                if (call.name === "readArchiveRecord") {
                  const recordId = typeof args.recordId === "string" ? args.recordId : "";
                  const record = recordId ? getOracleArchiveRecord(recordId) : null;
                  const responseObj: Record<string, unknown> = {
                    name: call.name,
                    response: {
                      output: record ?? {
                        error: "Registro nao encontrado no arquivo canonico.",
                        recordId,
                      },
                    },
                  };
                  if (callId) responseObj.id = callId;
                  functionResponses.push(responseObj);
                  continue;
                }

                if (call.name === "updateAppCode") {
                  const htmlContent = typeof args.htmlContent === "string" ? args.htmlContent : "";
                  if (htmlContent) {
                    onAppCodeUpdate(htmlContent);
                  }
                  const responseObj: Record<string, unknown> = {
                    name: call.name,
                    response: { output: { result: "success" } },
                  };
                  if (callId) responseObj.id = callId;
                  functionResponses.push(responseObj);
                  continue;
                }

                const responseObj: Record<string, unknown> = {
                  name: call.name || "unknown",
                  response: { error: "Ferramenta desconhecida." },
                };
                if (callId) responseObj.id = callId;
                functionResponses.push(responseObj);
              }

              if (functionResponses.length > 0) {
                sessionPromise.then((session) => {
                  const liveSession = session as {
                    sendToolResponse?: (params: { functionResponses: Array<Record<string, unknown>> }) => void;
                  };
                  if (sessionRef.current === session && liveSession.sendToolResponse) {
                    liveSession.sendToolResponse({ functionResponses });
                  }
                });
              }
            }
          },
          onclose: () => {
            cleanup();
          },
          onerror: (err: unknown) => {
            const message = err instanceof Error ? err.message : String(err ?? "Erro de conexao.");
            if (message.includes("aborted")) return;
            setError(`Falha na conexao: ${message}`);
            cleanup();
          },
        },
      });

      sessionPromiseRef.current = sessionPromise;
      sessionRef.current = await sessionPromise;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err ?? "Falha ao conectar");
      if (!message.includes("aborted")) {
        setError(message);
      }
      setIsConnecting(false);
    }
  }, [attachMicrophone, cleanup, onAppCodeUpdate]);

  const disconnect = useCallback(() => {
    cleanup();
  }, [cleanup]);

  const sendTextPrompt = useCallback((
    prompt: string,
    options?: {
      contextHint?: string;
      displayText?: string;
    },
  ) => {
    const trimmed = prompt.trim();
    const displayText = options?.displayText?.trim() || trimmed;
    const contextualPrompt = options?.contextHint
      ? `CONTEXTO ATUAL DO ARQUIVO:\n${options.contextHint}\n\nPERGUNTA DO INTERLOCUTOR:\n${trimmed}`
      : trimmed;
    const session = sessionRef.current as {
      sendClientContent?: (params: {
        turns: Array<{ role: string; parts: Array<{ text: string }> }>;
        turnComplete: boolean;
      }) => void;
    } | null;

    if (!trimmed) {
      return false;
    }

    setError(null);
    setLastInputTranscript(displayText);
    setDialogue((prev) => pushOrReplaceTurn(prev, "user", displayText));

    if (session?.sendClientContent && isConnected) {
      session.sendClientContent({
        turns: [{ role: "user", parts: [{ text: contextualPrompt }] }],
        turnComplete: true,
      });

      return true;
    }

    void (async () => {
      try {
        const fallback = buildFallbackArchiveReply(contextualPrompt, dialogue);

        if (looksLikeReadingRequest(contextualPrompt) && fallback.matches.length > 0) {
          setLastOutputTranscript(fallback.text);
          setDialogue((prev) => pushOrReplaceTurn(prev, "oracle", fallback.text));
          return;
        }

        if (!GEMINI_API_KEY) {
          setLastOutputTranscript(fallback.text);
          setDialogue((prev) => pushOrReplaceTurn(prev, "oracle", fallback.text));
          return;
        }

        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: TEXT_MODEL,
          contents: [{ role: "user", parts: [{ text: fallback.text }] }],
        });

        const answer =
          response.text?.trim() ||
          "O arquivo permanece silencioso. Nenhuma formula ritual conseguiu extrair uma resposta segura desta consulta.";

        setLastOutputTranscript(answer);
        setDialogue((prev) => pushOrReplaceTurn(prev, "oracle", answer));
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err ?? "Falha ao consultar o arquivo.");
        const fallback = buildFallbackArchiveReply(contextualPrompt, dialogue);
        setError(`Falha na consulta textual: ${message}`);
        setLastOutputTranscript(fallback.text);
        setDialogue((prev) => pushOrReplaceTurn(prev, "oracle", fallback.text));
      }
    })();

    return true;
  }, [dialogue, isConnected]);

  useEffect(() => cleanup, [cleanup]);

  return {
    isConnected,
    isConnecting,
    isModelSpeaking,
    audioLevel,
    error,
    microphoneReady,
    lastInputTranscript,
    lastOutputTranscript,
    dialogue,
    connect,
    disconnect,
    sendTextPrompt,
  };
}
