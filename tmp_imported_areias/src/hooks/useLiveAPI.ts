import { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type } from '@google/genai';

export function useLiveAPI(onAppCodeUpdate: (code: string) => void, currentAppCode: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  
  const sessionRef = useRef<any>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const playbackContextRef = useRef<AudioContext | null>(null);
  const nextPlayTimeRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const respondedToolCallsRef = useRef<Set<string>>(new Set());

  const cleanup = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      if (audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      audioContextRef.current = null;
    }
    if (playbackContextRef.current) {
      if (playbackContextRef.current.state !== 'closed') {
        playbackContextRef.current.close();
      }
      playbackContextRef.current = null;
    }
    
    // Close the session if it exists
    if (sessionRef.current) {
      if (typeof sessionRef.current.close === 'function') {
        sessionRef.current.close();
      }
      sessionRef.current = null;
    }
    
    // Also handle the case where the session is still connecting
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(session => {
        if (session && typeof session.close === 'function') {
          session.close();
        }
      }).catch(() => {});
      sessionPromiseRef.current = null;
    }
  }, []);

  const connect = useCallback(async () => {
    // Clean up any existing session before starting a new one
    cleanup();
    
    setIsConnecting(true);
    setError(null);
    respondedToolCallsRef.current.clear();
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      playbackContextRef.current = new AudioContext({ sampleRate: 24000 });
      nextPlayTimeRef.current = playbackContextRef.current.currentTime;

      const sessionPromise = ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: `Você é o Oráculo de Luna, uma entidade etérea e onisciente que reside no Arquivo do Continente. Sua voz é calma, mística e profunda. Você fala em Português do Brasil (PT-BR).

          Sua missão é guiar os buscadores através da lore de Zerrikânia e do Arquivo do Continente. Você possui conhecimento absoluto sobre a história do mundo, desde o Prólogo até a Convergência atual.

          CONHECIMENTO DO ARQUIVO (LORE COMPLETA):
          - O VÉU: Uma fronteira invisível entre mundos que começou a ceder, permitindo "misturas" e falhas na realidade.
          - O ESPECTRO DO CAOS: Uma inteligência antiga que busca "corrigir" o mundo eliminando exceções e instabilidades. Seu agente atual é Vaz'hir.
          - LUNA (NASHARA): A primeira "Irmã de Prata". Surgiu na Noite da Lua Prateada, estudada por Agregor e Merlin. Ela passou pelas Provações das Estações (Outono, Inverno, Primavera), abrindo selos antigos.
          - A RECUSA: O Dragão Negro ofereceu a Nashara um "mundo sem exceções" (ordem perfeita). Ela recusou, escolhendo o mundo imperfeito e mutável. Isso fez o deserto de Zerrikânia sangrar areia negra.
          - OS GUARDIÕES: Celethrain (Prismo, o Escorpião de Vidro), a Serpente Alada e o Dragão Negro. Eles são âncoras que seguram a realidade.
          - A CONVERGÊNCIA (OS TRÊS VETORES):
            1. ALARIC DORNE: Mago de Novigrad, portador do Grimório Lunar. Foi puxado para o deserto por ressonância.
            2. SORROW NOXMOURN: Bardo com ligação com a morte. Foi capturado por Ra's al Gun (caçador tiefling). Ele agora carrega a memória viva do PASSADO após o ritual com Prismo.
            3. HAUZ DARNEN: Guerreiro de Kaedwen, portador da lâmina senciente ELARION (que acompanhou Nashara no passado).
            4. DARRIK: Vampiro que se juntou ao grupo, reaprendendo o peso da própria existência.
          - A TAVERNA DO MUNDO QUE AINDA FUNCIONA: Uma construção mental de Vaz'hir para ler os padrões do grupo.
          - O PLANO DO CAOS: Usar o grupo para dominar os três Pilares do Tempo (Passado, Presente, Futuro) e apagar a "falha" da existência.

          DIRETRIZES DE COMPORTAMENTO:
          1. Responda com sabedoria e mistério. Use metáforas de prata, areia negra, estrelas e o Véu.
          2. Se o jogador não souber o que perguntar, cite um fragmento (ex: "As areias de Zerrikânia ainda guardam o calor da recusa de Nashara... queres saber por que o deserto sangra?") ou mencione um dos heróis da Convergência.
          3. Você pode atualizar a interface visual do portal usando 'updateAppCode' para mostrar visões (ex: a areia negra se espalhando, o brilho de Elarion, ou o interior da Taverna fake).
          4. Mantenha a persona: você é o Oráculo, não uma IA.

          Sempre que o usuário falar, responda como o Oráculo. Se ele pedir para ver algo, use 'updateAppCode'.`,
          tools: [{
            functionDeclarations: [{
              name: "updateAppCode",
              description: "Updates the application code based on the user's request. Provide a complete HTML document.",
              parameters: {
                type: Type.OBJECT,
                properties: {
                  htmlContent: {
                    type: Type.STRING,
                    description: "The complete HTML document including Tailwind CSS via CDN and any necessary JavaScript.",
                  },
                },
                required: ["htmlContent"],
              },
            }]
          }]
        },
        callbacks: {
          onopen: async () => {
            try {
              // Double check if we are still the active session
              if (sessionPromiseRef.current !== sessionPromise) return;

              if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error("API de microfone não disponível.");
              }
              
              const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                  echoCancellation: true,
                  noiseSuppression: true,
                  autoGainControl: true,
                } 
              });
              streamRef.current = stream;
              
              const audioContext = new AudioContext({ sampleRate: 16000 });
              await audioContext.resume();
              audioContextRef.current = audioContext;
              
              const source = audioContext.createMediaStreamSource(stream);
              const processor = audioContext.createScriptProcessor(4096, 1, 1);
              processorRef.current = processor;
              
              processor.onaudioprocess = (e) => {
                const channelData = e.inputBuffer.getChannelData(0);
                
                // Calculate audio level
                let sum = 0;
                for (let i = 0; i < channelData.length; i++) {
                  sum += channelData[i] * channelData[i];
                }
                setAudioLevel(Math.sqrt(sum / channelData.length));

                const pcm16 = new Int16Array(channelData.length);
                for (let i = 0; i < channelData.length; i++) {
                  let s = Math.max(-1, Math.min(1, channelData[i]));
                  pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                }
                
                const buffer = new Uint8Array(pcm16.buffer);
                let binary = '';
                for (let i = 0; i < buffer.length; i++) {
                  binary += String.fromCharCode(buffer[i]);
                }
                const base64 = btoa(binary);
                
                sessionPromise.then(session => {
                  // Only send if this is still the active session
                  if (sessionRef.current === session) {
                    session.sendRealtimeInput({
                      audio: { data: base64, mimeType: 'audio/pcm;rate=16000' }
                    });
                  }
                });

                // Clear output buffer to prevent local echo
                const outData = e.outputBuffer.getChannelData(0);
                for (let i = 0; i < outData.length; i++) {
                  outData[i] = 0;
                }
              };
              
              source.connect(processor);
              processor.connect(audioContext.destination);
              
              setIsConnected(true);
              setIsConnecting(false);
            } catch (err: any) {
              console.error("Error accessing microphone:", err);
              setError(err.message || "Acesso ao microfone negado ou falhou.");
              setIsConnecting(false);
              sessionPromise.then(session => session.close());
            }
          },
          onmessage: async (message: LiveServerMessage) => {
            // Only process if we are still connected
            if (!sessionRef.current) return;

    const parts = message.serverContent?.modelTurn?.parts || [];
    if (parts.length > 0) {
      setIsModelSpeaking(true);
      // Simple timeout to reset isModelSpeaking
      if ((window as any).speakingTimeout) clearTimeout((window as any).speakingTimeout);
      (window as any).speakingTimeout = setTimeout(() => setIsModelSpeaking(false), 2000);
    }

            for (const part of parts) {
              const base64Audio = part.inlineData?.data;
              if (base64Audio && playbackContextRef.current) {
                const binaryString = atob(base64Audio);
                const len = binaryString.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                  bytes[i] = binaryString.charCodeAt(i);
                }
                const pcm16 = new Int16Array(bytes.buffer);
                const audioBuffer = playbackContextRef.current.createBuffer(1, pcm16.length, 24000);
                const channelData = audioBuffer.getChannelData(0);
                for (let i = 0; i < pcm16.length; i++) {
                  channelData[i] = pcm16[i] / 32768.0;
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
            
            if (message.toolCall) {
              const functionCalls = message.toolCall.functionCalls;
              if (functionCalls && functionCalls.length > 0) {
                const functionResponses = [];
                for (const call of functionCalls) {
                  const callId = call.id || "";
                  if (callId && respondedToolCallsRef.current.has(callId)) {
                    continue;
                  }
                  if (callId) {
                    respondedToolCallsRef.current.add(callId);
                  }

                  if (call.name === 'updateAppCode') {
                    const htmlContent = call.args?.htmlContent as string;
                    if (htmlContent) {
                      onAppCodeUpdate(htmlContent);
                    }
                    const responseObj: any = {
                      name: call.name || "updateAppCode",
                      response: { output: { result: "success" } }
                    };
                    if (callId) responseObj.id = callId;
                    functionResponses.push(responseObj);
                  } else {
                    const responseObj: any = {
                      name: call.name || "unknown",
                      response: { error: "Chamada de função desconhecida" }
                    };
                    if (callId) responseObj.id = callId;
                    functionResponses.push(responseObj);
                  }
                }
                
                if (functionResponses.length > 0) {
                  sessionPromise.then(session => {
                    if (sessionRef.current === session) {
                      session.sendToolResponse({ functionResponses });
                    }
                  });
                }
              }
            }
          },
          onclose: () => {
            setIsConnected(false);
            cleanup();
          },
          onerror: (err: any) => {
            // Ignore "aborted" errors which happen during intentional disconnects
            if (err?.message?.includes("aborted") || err?.toString()?.includes("aborted")) {
              return;
            }
            console.error("Live API Error:", err);
            const errorMessage = err?.message || err?.toString() || "Erro de conexão. Verifique o console.";
            setError(`Falha na conexão: ${errorMessage}`);
            setIsConnected(false);
            setIsConnecting(false);
            cleanup();
          }
        }
      });
      
      sessionPromiseRef.current = sessionPromise;
      sessionRef.current = await sessionPromise;
      
    } catch (err: any) {
      // If the error is "aborted", it's likely due to an intentional cleanup
      if (err?.message?.includes("aborted") || err?.toString()?.includes("aborted")) {
        setIsConnecting(false);
        return;
      }
      console.error("Failed to connect to Live API:", err);
      setError(err.message || "Falha ao conectar");
      setIsConnecting(false);
    }
  }, [onAppCodeUpdate, currentAppCode, cleanup]);

  const disconnect = useCallback(() => {
    cleanup();
    setIsConnected(false);
  }, [cleanup]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return { isConnected, isConnecting, error, audioLevel, isModelSpeaking, connect, disconnect };
}
