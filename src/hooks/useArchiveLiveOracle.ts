import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GoogleGenAI, type LiveServerMessage, Modality, Type } from "@google/genai";

import {
  buildArchiveOracleSystemInstruction,
  type ArchiveOracleToolAction,
} from "@/lib/archive-oracle";
import type { UniversePublication } from "@/lib/universe-publications";

type ToolActionResult =
  | void
  | {
      ok?: boolean;
      message?: string;
    };

type UseArchiveLiveOracleArgs = {
  currentPublication?: UniversePublication | null;
  publications: UniversePublication[];
  onToolAction?: (action: ArchiveOracleToolAction) => ToolActionResult;
};

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

export function useArchiveLiveOracle({
  currentPublication,
  publications,
  onToolAction,
}: UseArchiveLiveOracleArgs) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim() ?? "";
  const liveModel = import.meta.env.VITE_GEMINI_LIVE_MODEL?.trim() || "gemini-3.1-flash-live-preview";
  const liveVoice = import.meta.env.VITE_GEMINI_LIVE_VOICE?.trim() || "Zephyr";

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [lastInputTranscript, setLastInputTranscript] = useState("");
  const [lastOutputTranscript, setLastOutputTranscript] = useState("");
  const [lastToolEvent, setLastToolEvent] = useState<string | null>(null);

  const sessionRef = useRef<any>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const playbackContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextPlayTimeRef = useRef(0);
  const respondedToolCallsRef = useRef<Set<string>>(new Set());
  const speakingTimeoutRef = useRef<number | null>(null);

  const hasLiveSupport = useMemo(() => {
    return Boolean(apiKey && typeof window !== "undefined" && navigator.mediaDevices?.getUserMedia);
  }, [apiKey]);

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

    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (playbackContextRef.current && playbackContextRef.current.state !== "closed") {
      playbackContextRef.current.close();
      playbackContextRef.current = null;
    }

    if (sessionRef.current && typeof sessionRef.current.close === "function") {
      sessionRef.current.close();
      sessionRef.current = null;
    }

    if (sessionPromiseRef.current) {
      sessionPromiseRef.current
        .then((session) => {
          if (session && typeof session.close === "function") {
            session.close();
          }
        })
        .catch(() => {});
      sessionPromiseRef.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
    setIsModelSpeaking(false);
    setAudioLevel(0);
  }, []);

  const handleToolCall = useCallback(
    async (message: LiveServerMessage, sessionPromise: Promise<any>) => {
      const functionCalls = message.toolCall?.functionCalls;

      if (!functionCalls?.length) {
        return;
      }

      const functionResponses: Array<Record<string, unknown>> = [];

      for (const call of functionCalls) {
        const callId = call.id || "";

        if (callId && respondedToolCallsRef.current.has(callId)) {
          continue;
        }

        if (callId) {
          respondedToolCallsRef.current.add(callId);
        }

        let responseMessage = "Acao executada com sucesso.";
        let toolError: string | undefined;

        try {
          if (call.name === "openPublication" && typeof call.args?.slug === "string") {
            const result = onToolAction?.({ kind: "open-publication", slug: call.args.slug });
            responseMessage = result?.message || `Manuscrito ${call.args.slug} aberto.`;
            setLastToolEvent(responseMessage);
          } else if (call.name === "openEntry" && typeof call.args?.slug === "string") {
            const result = onToolAction?.({ kind: "open-entry", slug: call.args.slug });
            responseMessage = result?.message || `Dossie ${call.args.slug} aberto.`;
            setLastToolEvent(responseMessage);
          } else if (call.name === "openRoute" && typeof call.args?.path === "string") {
            const result = onToolAction?.({ kind: "open-route", path: call.args.path });
            responseMessage = result?.message || `Camada ${call.args.path} aberta.`;
            setLastToolEvent(responseMessage);
          } else {
            toolError = "Ferramenta desconhecida ou argumentos invalidos.";
          }
        } catch (caughtError) {
          toolError = caughtError instanceof Error ? caughtError.message : "Falha ao executar a ferramenta.";
        }

        const responsePayload: Record<string, unknown> = {
          name: call.name || "unknown",
          response: toolError
            ? { error: toolError }
            : {
                output: {
                  result: "success",
                  message: responseMessage,
                },
              },
        };

        if (callId) {
          responsePayload.id = callId;
        }

        functionResponses.push(responsePayload);
      }

      if (!functionResponses.length) {
        return;
      }

      sessionPromise.then((session) => {
        if (sessionRef.current === session) {
          session.sendToolResponse({ functionResponses });
        }
      });
    },
    [onToolAction],
  );

  const connect = useCallback(async () => {
    if (!apiKey) {
      setError("Configure VITE_GEMINI_API_KEY para usar a voz ao vivo do oraculo.");
      return;
    }

    cleanup();
    setError(null);
    setLastToolEvent(null);
    setLastInputTranscript("");
    setLastOutputTranscript("");
    respondedToolCallsRef.current.clear();
    setIsConnecting(true);

    try {
      const ai = new GoogleGenAI({ apiKey });

      playbackContextRef.current = new AudioContext({ sampleRate: 24000 });
      nextPlayTimeRef.current = playbackContextRef.current.currentTime;

      const sessionPromise = ai.live.connect({
        model: liveModel,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: liveVoice,
              },
            },
          },
          systemInstruction: buildArchiveOracleSystemInstruction({
            currentPublication,
            publications,
          }),
          tools: [
            {
              functionDeclarations: [
                {
                  name: "openPublication",
                  description: "Abre um manuscrito do arquivo usando o slug exato da publicacao.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      slug: {
                        type: Type.STRING,
                        description: "Slug exato da publicacao a ser aberta.",
                      },
                    },
                    required: ["slug"],
                  },
                },
                {
                  name: "openEntry",
                  description: "Abre um perfil ou dossie do universo usando o slug exato da entrada.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      slug: {
                        type: Type.STRING,
                        description: "Slug exato do perfil a ser aberto.",
                      },
                    },
                    required: ["slug"],
                  },
                },
                {
                  name: "openRoute",
                  description: "Abre uma camada geral do portal usando o caminho da rota.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      path: {
                        type: Type.STRING,
                        description: "Caminho da rota, como /universo, /bestiario, /mapa ou /jogar.",
                      },
                    },
                    required: ["path"],
                  },
                },
              ],
            },
          ],
        },
        callbacks: {
          onopen: async () => {
            try {
              if (sessionPromiseRef.current !== sessionPromise) {
                return;
              }

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
                  sum += (channelData[index] ?? 0) * (channelData[index] ?? 0);
                }

                setAudioLevel(Math.sqrt(sum / channelData.length));
                const base64 = encodePcm16(channelData);

                sessionPromise.then((session) => {
                  if (sessionRef.current === session) {
                    session.sendRealtimeInput({
                      audio: {
                        data: base64,
                        mimeType: "audio/pcm;rate=16000",
                      },
                    });
                  }
                });

                const output = event.outputBuffer.getChannelData(0);
                output.fill(0);
              };

              source.connect(processor);
              processor.connect(audioContext.destination);

              setIsConnecting(false);
              setIsConnected(true);
            } catch (caughtError) {
              const message =
                caughtError instanceof Error
                  ? caughtError.message
                  : "O navegador bloqueou o acesso ao microfone.";

              setError(message);
              setIsConnecting(false);
              setIsConnected(false);
              sessionPromise.then((session) => session.close()).catch(() => {});
            }
          },
          onmessage: async (message) => {
            if (!sessionRef.current) {
              return;
            }

            const parts = message.serverContent?.modelTurn?.parts || [];

            if (parts.length > 0) {
              setIsModelSpeaking(true);

              if (speakingTimeoutRef.current) {
                window.clearTimeout(speakingTimeoutRef.current);
              }

              speakingTimeoutRef.current = window.setTimeout(() => {
                setIsModelSpeaking(false);
              }, 1800);
            }

            const inputTranscript = message.serverContent?.inputTranscription?.text?.trim();
            if (inputTranscript) {
              setLastInputTranscript(inputTranscript);
            }

            const outputTranscript = message.serverContent?.outputTranscription?.text?.trim();
            if (outputTranscript) {
              setLastOutputTranscript(outputTranscript);
            }

            for (const part of parts) {
              const base64Audio = part.inlineData?.data;

              if (base64Audio && playbackContextRef.current) {
                const binaryString = atob(base64Audio);
                const length = binaryString.length;
                const bytes = new Uint8Array(length);

                for (let index = 0; index < length; index += 1) {
                  bytes[index] = binaryString.charCodeAt(index);
                }

                const pcm16 = new Int16Array(bytes.buffer);
                const audioBuffer = playbackContextRef.current.createBuffer(1, pcm16.length, 24000);
                const channel = audioBuffer.getChannelData(0);

                for (let index = 0; index < pcm16.length; index += 1) {
                  channel[index] = pcm16[index] / 32768;
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

            await handleToolCall(message, sessionPromise);
          },
          onclose: () => {
            cleanup();
          },
          onerror: (caughtError) => {
            const message =
              caughtError instanceof Error
                ? caughtError.message
                : String(caughtError || "Falha ao manter a conexao do oraculo.");

            if (!message.includes("aborted")) {
              setError(message);
            }

            cleanup();
          },
        },
      });

      sessionPromiseRef.current = sessionPromise;
      sessionRef.current = await sessionPromise;
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Falha ao iniciar a sessao ao vivo do oraculo.";

      setError(message);
      cleanup();
    }
  }, [apiKey, cleanup, currentPublication, handleToolCall, liveModel, liveVoice, publications]);

  const disconnect = useCallback(() => {
    cleanup();
  }, [cleanup]);

  const sendTextPrompt = useCallback(
    (prompt: string) => {
      const trimmedPrompt = prompt.trim();

      if (!trimmedPrompt) {
        return false;
      }

      if (!sessionRef.current) {
        setError("Abra a sessao ao vivo do oraculo antes de enviar uma pergunta por texto.");
        return false;
      }

      setError(null);
      setLastInputTranscript(trimmedPrompt);
      sessionRef.current.sendClientContent({
        turns: [{ role: "user", parts: [{ text: trimmedPrompt }] }],
        turnComplete: true,
      });
      return true;
    },
    [],
  );

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    audioLevel,
    connect,
    disconnect,
    error,
    hasLiveSupport,
    isConnected,
    isConnecting,
    isModelSpeaking,
    lastInputTranscript,
    lastOutputTranscript,
    lastToolEvent,
    sendTextPrompt,
  };
}
