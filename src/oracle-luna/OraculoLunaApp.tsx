import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Home,
  Image as ImageIcon,
  Loader2,
  MessageSquareText,
  Mic,
  MicOff,
  RotateCcw,
  ScrollText,
  Search,
  SendHorizontal,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { LoreChapter, LORE_CHAPTERS } from "./lore";
import { useLiveAPI } from "./useLiveAPI";

const BASE_IFRAME_DOC = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    :root {
      color-scheme: dark;
      --bg: #050507;
      --panel: rgba(10, 10, 16, 0.84);
      --line: rgba(255,255,255,0.08);
      --text: rgba(245,240,234,0.92);
      --muted: rgba(255,255,255,0.58);
      --accent: rgba(227, 197, 145, 0.88);
      --shadow: rgba(0,0,0,0.55);
    }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      min-height: 100%;
      background:
        radial-gradient(circle at 50% 18%, rgba(226, 193, 124, 0.08), transparent 28%),
        radial-gradient(circle at 18% 24%, rgba(86, 78, 120, 0.16), transparent 34%),
        radial-gradient(circle at 82% 28%, rgba(122, 88, 54, 0.18), transparent 30%),
        linear-gradient(180deg, #060608 0%, #030304 100%);
      overflow: hidden;
      color: var(--text);
      font-family: Inter, system-ui, sans-serif;
    }
    body::before {
      content: "";
      position: fixed;
      inset: 0;
      background:
        radial-gradient(circle, transparent 44%, rgba(0,0,0,0.76) 100%),
        linear-gradient(90deg, rgba(0,0,0,0.68), transparent 18%, transparent 82%, rgba(0,0,0,0.68));
      pointer-events: none;
      z-index: 3;
    }
    .nebula {
      position: absolute;
      inset: 0;
      background:
        radial-gradient(circle at 22% 34%, rgba(61, 60, 97, 0.32), transparent 30%),
        radial-gradient(circle at 78% 34%, rgba(112, 76, 44, 0.24), transparent 26%),
        radial-gradient(circle at 50% 75%, rgba(18, 18, 30, 0.9), transparent 48%);
      filter: blur(70px);
      opacity: 0.9;
      animation: nebula-drift 22s infinite alternate ease-in-out;
      z-index: 0;
    }
    .oracle-light {
      position: absolute;
      top: 46%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: min(48vw, 520px);
      height: min(48vw, 520px);
      border-radius: 999px;
      background: radial-gradient(circle, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 72%);
      filter: blur(42px);
      opacity: 0.5;
      animation: pulse 9s infinite ease-in-out;
      z-index: 1;
      transition: transform 0.12s ease-out, opacity 0.12s ease-out;
    }
    .vignette {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle, transparent 44%, rgba(0,0,0,0.76) 100%);
      pointer-events: none;
      z-index: 2;
    }
    canvas { position: absolute; inset: 0; z-index: 1; pointer-events: none; }
    .scene-shell { position: relative; z-index: 4; min-height: 100vh; padding: 12vh 8vw 16vh; display: grid; place-items: center; }
    .scene-card {
      width: min(100%, 1080px);
      border: 1px solid var(--line);
      background: linear-gradient(180deg, rgba(15, 15, 21, 0.84), rgba(7, 7, 12, 0.92));
      box-shadow: 0 22px 70px var(--shadow), inset 0 0 0 1px rgba(255,255,255,0.03), inset 0 0 60px rgba(227, 197, 145, 0.04);
      backdrop-filter: blur(10px);
      padding: clamp(24px, 4vw, 52px);
      position: relative;
      overflow: hidden;
    }
    .scene-card::before {
      content: "";
      position: absolute;
      inset: 16px;
      border: 1px solid rgba(227, 197, 145, 0.08);
      pointer-events: none;
    }
    .scene-eyebrow { display: inline-flex; align-items: center; gap: 0.75rem; padding: 0.7rem 1rem; border: 1px solid rgba(227, 197, 145, 0.16); background: rgba(227, 197, 145, 0.08); color: var(--accent); text-transform: uppercase; letter-spacing: 0.22em; font-size: 11px; }
    .scene-title { margin: 1.4rem 0 0; font-family: "Cormorant Garamond", "Times New Roman", serif; font-size: clamp(3rem, 6vw, 5.4rem); line-height: 0.9; color: #f0dfb4; text-shadow: 0 8px 30px rgba(0,0,0,0.45); }
    .scene-subtitle { margin-top: 1.2rem; max-width: 58ch; font-size: clamp(15px, 1.4vw, 18px); line-height: 1.85; color: var(--muted); }
    .scene-paragraphs { margin-top: 2rem; display: grid; gap: 1.25rem; }
    .scene-paragraph { margin: 0; max-width: 68ch; font-size: clamp(16px, 1.42vw, 19px); line-height: 1.92; color: rgba(249, 246, 240, 0.9); }
    .scene-grid { margin-top: 2rem; display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); }
    .scene-chip { padding: 1rem 1.1rem; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.02); display: grid; gap: 0.45rem; }
    .scene-chip-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.24em; color: rgba(255,255,255,0.4); }
    .scene-chip-value { font-size: 16px; line-height: 1.6; color: rgba(255,255,255,0.92); }
    .empty-state { display: grid; gap: 1.1rem; justify-items: center; text-align: center; }
    .empty-sigil { width: 120px; height: 120px; border-radius: 999px; border: 1px solid rgba(227, 197, 145, 0.14); background: radial-gradient(circle, rgba(227, 197, 145, 0.12), transparent 68%), rgba(255,255,255,0.015); box-shadow: inset 0 0 60px rgba(227, 197, 145, 0.06); }
    .empty-caption { max-width: 54ch; font-size: 15px; line-height: 1.9; color: rgba(255,255,255,0.58); }
    @keyframes nebula-drift { 0% { transform: scale(1) translate(0, 0); } 100% { transform: scale(1.08) translate(2%, 2%); } }
    @keyframes pulse { 0%, 100% { opacity: 0.34; transform: translate(-50%, -50%) scale(1); } 50% { opacity: 0.64; transform: translate(-50%, -50%) scale(1.08); } }
  </style>
</head>
<body>
  <div class="nebula"></div>
  <canvas id="stardust"></canvas>
  <div class="oracle-light"></div>
  <div class="vignette"></div>
  <main class="scene-shell"><section class="scene-card"><div id="sceneHost"></div></section></main>
  <script>
    const canvas = document.getElementById("stardust");
    const ctx = canvas.getContext("2d");
    let particles = [];
    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = Array.from({ length: Math.max(42, Math.floor((canvas.width * canvas.height) / 12000)) }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.7 + 0.2,
        speedX: (Math.random() - 0.5) * 0.16,
        speedY: -(Math.random() * 0.45 + 0.08),
        alpha: Math.random() * 0.55 + 0.1
      }));
    }
    function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const particle of particles) {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        if (particle.y < -8) { particle.y = canvas.height + 8; particle.x = Math.random() * canvas.width; }
        ctx.fillStyle = "rgba(255, 239, 220, " + particle.alpha + ")";
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(render);
    }
    window.addEventListener("resize", resize);
    resize();
    render();
    window.addEventListener("message", (event) => {
      if (event.data?.type === "audio-level") {
        const level = Math.min(Math.max(event.data.level || 0, 0), 1);
        const light = document.querySelector(".oracle-light");
        if (light) {
          light.style.opacity = String(0.28 + level * 0.6);
          light.style.transform = "translate(-50%, -50%) scale(" + (1 + level * 0.24) + ")";
        }
      }
    });
  </script>
</body>
</html>`;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function chapterKind(title: string) {
  const [first] = title.split(" - ");
  return first || title;
}

function chapterDisplayName(title: string) {
  const [, ...rest] = title.split(" - ");
  return rest.join(" - ") || title;
}

function buildSceneDoc(eyebrow: string, title: string, subtitle: string, bodyHtml: string) {
  const markup = `
    <div class="scene-eyebrow">${escapeHtml(eyebrow)}</div>
    <h1 class="scene-title">${escapeHtml(title)}</h1>
    <p class="scene-subtitle">${escapeHtml(subtitle)}</p>
    ${bodyHtml}
  `;
  return BASE_IFRAME_DOC.replace('<div id="sceneHost"></div>', `<div id="sceneHost">${markup}</div>`);
}

function buildInitialDoc() {
  return buildSceneDoc(
    "Arquivo do Continente",
    "Oráculo de Luna",
    "Desperte a voz do arquivo por texto ou por voz. Consulte capítulos, personagens e registros canônicos sem romper a névoa do mundo.",
    `
      <div class="empty-state">
        <div class="empty-sigil"></div>
        <p class="empty-caption">
          O arquivo permanece atento. Abra um capítulo, peça uma leitura literal do registro ou conduza um diálogo contínuo para aprofundar o que já foi revelado.
        </p>
      </div>
    `,
  );
}

function buildChapterDoc(chapter: LoreChapter, readingMode: boolean) {
  const paragraphs = chapter.content
    .split("\n\n")
    .filter(Boolean)
    .map((paragraph) => `<p class="scene-paragraph">${escapeHtml(paragraph)}</p>`)
    .join("");

  const fragments = chapter.content
    .split("\n\n")
    .filter(Boolean)
    .slice(0, 3)
    .map((paragraph, index) => {
      const trimmed = paragraph.length > 190 ? `${paragraph.slice(0, 187).trim()}...` : paragraph;
      return `
        <div class="scene-chip">
          <div class="scene-chip-label">Fragmento ${index + 1}</div>
          <div class="scene-chip-value">${escapeHtml(trimmed)}</div>
        </div>
      `;
    })
    .join("");

  return buildSceneDoc(
    `${chapterKind(chapter.title)} • Registro canônico`,
    chapterDisplayName(chapter.title),
    readingMode
      ? "Modo de leitura ritual ativo. O texto abaixo segue a cadência integral do registro preservado no arquivo."
      : "Registro aberto. Use o modo de leitura para mergulhar no texto completo ou peça ao Oráculo que o leia em voz alta.",
    readingMode ? `<div class="scene-paragraphs">${paragraphs}</div>` : `<div class="scene-grid">${fragments}</div>`,
  );
}

function isRenderableOracleDocument(value: string) {
  const normalized = value.trim();
  if (!normalized) return false;
  if (!/<html[\s>]/i.test(normalized) || !/<body[\s>]/i.test(normalized)) return false;
  if (/@keyframes/i.test(normalized) && !/<style[\s>]/i.test(normalized)) return false;
  return true;
}

function chapterContextHint(chapter: LoreChapter, prompt: string) {
  const normalized = prompt
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const asksForLiteralRead = ["leia", "ler", "literal", "registro completo", "como ele aparece"].some((token) =>
    normalized.includes(token),
  );

  if (asksForLiteralRead) {
    return `Capítulo em foco: ${chapter.title}\nRegistro integral:\n${chapter.content}`;
  }

  const excerpt = chapter.content.length > 900 ? `${chapter.content.slice(0, 900).trim()}...` : chapter.content;
  return `Capítulo em foco: ${chapter.title}\nTrecho de referência:\n${excerpt}`;
}

export default function OraculoLunaApp() {
  const navigate = useNavigate();
  const initialDoc = useMemo(() => buildInitialDoc(), []);

  const [appCode, setAppCode] = useState<string>(initialDoc);
  const [history, setHistory] = useState<string[]>([initialDoc]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [currentChapter, setCurrentChapter] = useState<LoreChapter | null>(null);
  const [showArchive, setShowArchive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [oraclePrompt, setOraclePrompt] = useState("");

  const chapters = useMemo(() => LORE_CHAPTERS, []);

  const filteredChapters = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return chapters;
    return chapters.filter(
      (chapter) => chapter.title.toLowerCase().includes(query) || chapter.content.toLowerCase().includes(query),
    );
  }, [chapters, searchQuery]);

  const updateCodeWithHistory = (newCode: string) => {
    if (!isRenderableOracleDocument(newCode)) {
      return;
    }
    if (newCode === history[historyIndex]) return;
    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(newCode);
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
    setAppCode(newCode);
    const matched = chapters.find((chapter) => newCode.includes(chapter.title));
    setCurrentChapter(matched ?? null);
  };

  const selectChapter = (chapter: LoreChapter) => {
    setCurrentChapter(chapter);
    setShowArchive(false);
    updateCodeWithHistory(buildChapterDoc(chapter, true));
  };

  const resetToOrigin = () => {
    setCurrentChapter(null);
    updateCodeWithHistory(initialDoc);
  };

  const navigateHistory = (direction: "prev" | "next") => {
    if (direction === "prev" && historyIndex > 0) {
      const nextIndex = historyIndex - 1;
      const nextDoc = history[nextIndex];
      setHistoryIndex(nextIndex);
      setAppCode(nextDoc);
      const matched = chapters.find((chapter) => nextDoc.includes(chapter.title));
      setCurrentChapter(matched ?? null);
      return;
    }
    if (direction === "next" && historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const nextDoc = history[nextIndex];
      setHistoryIndex(nextIndex);
      setAppCode(nextDoc);
      const matched = chapters.find((chapter) => nextDoc.includes(chapter.title));
      setCurrentChapter(matched ?? null);
    }
  };

  const navigateChapter = (direction: "prev" | "next") => {
    if (!currentChapter) return;
    const currentIndex = chapters.findIndex((chapter) => chapter.id === currentChapter.id);
    if (currentIndex === -1) return;
    if (direction === "prev" && currentIndex > 0) selectChapter(chapters[currentIndex - 1]);
    if (direction === "next" && currentIndex < chapters.length - 1) selectChapter(chapters[currentIndex + 1]);
  };

  const {
    isConnected,
    isConnecting,
    isModelSpeaking,
    audioLevel,
    error,
    microphoneReady,
    dialogue,
    connect,
    disconnect,
    sendTextPrompt,
  } = useLiveAPI(updateCodeWithHistory);

  useEffect(() => {
    const iframe = document.querySelector("iframe");
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage({ type: "audio-level", level: audioLevel }, "*");
    }
  }, [audioLevel, appCode]);

  const ringScale = 1 + Math.min(audioLevel * 6, 0.8);
  const oracleTurns = useMemo(() => dialogue.slice(-6), [dialogue]);
  const currentChapterIndex = useMemo(
    () => (currentChapter ? chapters.findIndex((chapter) => chapter.id === currentChapter.id) : -1),
    [chapters, currentChapter],
  );
  const chapterParagraphs = useMemo(
    () => (currentChapter ? currentChapter.content.split("\n\n").filter(Boolean) : []),
    [currentChapter],
  );
  const archivePrompt = currentChapter
    ? `Registro em foco: ${currentChapter.title}`
    : "Escolha um registro do arquivo para abrir a leitura ritual ou conduza a conversa livremente.";

  const submitOraclePrompt = (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    const sent = sendTextPrompt(trimmed, {
      contextHint: currentChapter ? chapterContextHint(currentChapter, trimmed) : undefined,
    });
    if (sent) {
      setOraclePrompt("");
    }
  };

  const requestContinuation = () => {
    submitOraclePrompt("Continue exatamente do ponto em que paramos, sem reiniciar a explicação.");
  };

  const requestLiteralReading = () => {
    if (currentChapter) {
      submitOraclePrompt(`Leia, com o mínimo de alterações possível, o registro completo intitulado "${currentChapter.title}" como ele aparece no arquivo.`);
      return;
    }
    submitOraclePrompt("Leia um registro canônico do Arquivo do Continente em voz alta, preservando a redação original do texto.");
  };

  const handleReturn = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/jogar");
  };

  const archiveEntries = filteredChapters.map((chapter) => {
    const isActive = currentChapter?.id === chapter.id;

    return (
      <button
        key={chapter.id}
        type="button"
        onClick={() => selectChapter(chapter)}
        data-active={isActive}
        className="archive-oracle-entry rounded-2xl"
      >
        <div className="archive-oracle-entry-thumb rounded-xl">
          {chapter.thumbnail ? (
            <img src={chapter.thumbnail} alt="" referrerPolicy="no-referrer" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-white/25">
              <ImageIcon className="h-4 w-4" />
            </div>
          )}
        </div>
        <div className="min-w-0 space-y-1.5">
          <p className="truncate text-[10px] uppercase tracking-[0.22em] text-white/38">
            {chapterKind(chapter.title)}
          </p>
          <p className="truncate font-serif text-base text-white/86">
            {chapterDisplayName(chapter.title)}
          </p>
          <p className="line-clamp-2 text-sm leading-6 text-white/54">
            {chapter.content.slice(0, 118).trim()}
            {chapter.content.length > 118 ? "..." : ""}
          </p>
        </div>
      </button>
    );
  });

  const archivePanel = (
    <aside className="archive-oracle-panel hidden h-full flex-col overflow-hidden rounded-[28px] xl:flex">
      <div className="border-b border-white/8 px-5 py-5">
        <div className="flex items-center gap-3">
          <BookOpen className="h-4.5 w-4.5 text-white/42" />
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-white/42">Arquivo de lore</p>
            <p className="mt-1 text-sm leading-6 text-white/62">
              Use a busca para abrir um capítulo e ler com calma.
            </p>
          </div>
        </div>
        <div className="archive-oracle-search mt-4">
          <Search className="archive-oracle-search-icon h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar capítulo, profecia ou nome..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="archive-oracle-input rounded-2xl border border-white/10 bg-black/45 text-sm text-white/84 placeholder:text-white/24 focus:border-white/18 focus:outline-none"
          />
        </div>
      </div>
      <div className="archive-oracle-list flex-1 space-y-2 px-3 py-3">{archiveEntries}</div>
      <div className="border-t border-white/8 px-5 py-4 text-sm leading-6 text-white/46">
        O arquivo se abre em camadas: escolha um capítulo, leia o texto integral ou continue o diálogo a partir dele.
      </div>
    </aside>
  );

  const stagePanel = (
    <main className="archive-oracle-panel archive-oracle-stage rounded-[32px]">
      <div className="archive-oracle-reading is-focused">
        <div className="rounded-[28px] border border-white/8 bg-black/18 p-5 md:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/12 bg-amber-100/6 px-4 py-2 text-[10px] uppercase tracking-[0.24em] text-amber-100/72">
                {currentChapter ? `${chapterKind(currentChapter.title)} • registro canônico` : "Oráculo de Luna • leitura ritual"}
              </div>
              <div>
                <h1 className="font-serif text-5xl leading-[0.92] text-[#f0dfb4] sm:text-6xl">
                  {currentChapter ? chapterDisplayName(currentChapter.title) : "Oráculo de Luna"}
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-8 text-white/68 md:text-lg">
                  {currentChapter
                    ? "O registro se abre em coluna contínua, com largura controlada e cadência de leitura pensada para acompanhar a narrativa sem interrupções visuais."
                    : "Abra um capítulo do arquivo para leitura integral ou convoque o Oráculo ao lado para conversar sem perder o fio do registro."}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 lg:max-w-sm lg:justify-end">
              <button
                type="button"
                onClick={requestContinuation}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-white/72 transition-all hover:border-white/22 hover:bg-white/8 hover:text-white"
              >
                <MessageSquareText className="h-3.5 w-3.5" />
                Continuar
              </button>
              <button
                type="button"
                onClick={requestLiteralReading}
                className="inline-flex items-center gap-2 rounded-full border border-amber-300/18 bg-amber-200/10 px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-amber-100/88 transition-all hover:border-amber-200/30 hover:bg-amber-200/14"
              >
                <ScrollText className="h-3.5 w-3.5" />
                Ler registro
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-white/8 bg-black/28 px-4 py-4">
              <p className="text-[10px] uppercase tracking-[0.24em] text-white/34">Fonte</p>
              <p className="mt-2 text-lg font-serif text-white/92">
                {currentChapter ? chapterKind(currentChapter.title) : "Arquivo canônico"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-black/28 px-4 py-4">
              <p className="text-[10px] uppercase tracking-[0.24em] text-white/34">Leitura</p>
              <p className="mt-2 text-lg font-serif text-white/92">
                {currentChapter ? "Texto integral em coluna" : "Consulta guiada pelo Oráculo"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-black/28 px-4 py-4">
              <p className="text-[10px] uppercase tracking-[0.24em] text-white/34">Uso</p>
              <p className="mt-2 text-lg font-serif text-white/92">
                {currentChapter ? "Leitura + continuidade do diálogo" : "Abrir capítulos, ler e seguir a conversa"}
              </p>
            </div>
          </div>
        </div>

        {!currentChapter ? (
          <div className="rounded-[28px] border border-white/8 bg-black/22 p-4 md:p-5">
            <div className="overflow-hidden rounded-[24px] border border-white/8 bg-[#050505] shadow-[0_18px_50px_rgba(0,0,0,0.42)]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${appCode.substring(0, 100)}-${appCode.length}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: "easeInOut" }}
                  className="h-[60vh] min-h-[34rem] w-full"
                >
                  <iframe
                    srcDoc={appCode}
                    className="h-full w-full border-none"
                    title="Visual do Oráculo"
                    sandbox="allow-scripts allow-forms allow-popups"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="rounded-[28px] border border-white/8 bg-black/22 p-4 md:p-5">
            <article className="mx-auto flex max-w-3xl flex-col gap-6 rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(9,9,14,0.96),rgba(5,5,8,0.99))] px-6 py-7 shadow-[0_28px_64px_rgba(0,0,0,0.38)] md:px-10 md:py-9">
              <div className="space-y-4 border-b border-white/8 pb-6">
                <p className="text-[10px] uppercase tracking-[0.24em] text-white/34">Entrada do arquivo</p>
                <p className="font-serif text-[1.34rem] leading-[1.95] text-[#f5efe2]">
                  {chapterParagraphs[0] ?? currentChapter.content}
                </p>
              </div>
              <div className="mx-auto h-px w-28 bg-gradient-to-r from-transparent via-amber-100/40 to-transparent" />
              <div className="space-y-7">
                {chapterParagraphs.slice(1).map((paragraph, index) => (
                  <p
                    key={`${currentChapter.id}-paragraph-${index + 1}`}
                    className="font-serif text-[1.12rem] leading-[2.05] text-[#f2ece0]/92"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </article>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-white/8 bg-black/26 px-4 py-3">
              <div className="text-xs uppercase tracking-[0.22em] text-white/34">
                {currentChapterIndex >= 0 ? `${currentChapterIndex + 1} de ${chapters.length} registros` : "Arquivo sem foco"}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigateChapter("prev")}
                  disabled={currentChapterIndex <= 0}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/36 px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-white/68 transition-all hover:border-white/22 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Anterior
                </button>
                <button
                  type="button"
                  onClick={() => navigateChapter("next")}
                  disabled={currentChapterIndex === -1 || currentChapterIndex >= chapters.length - 1}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/36 px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-white/68 transition-all hover:border-white/22 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Próximo
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );

  const oraclePanel = (
    <aside className="archive-oracle-panel flex h-full flex-col overflow-hidden rounded-[28px]">
      <div className="border-b border-white/8 px-5 py-5">
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            {isConnected && (
              <>
                <motion.div
                  className="absolute inset-[-6px] rounded-full border-2 border-white/18"
                  animate={{
                    scale: isModelSpeaking ? [1, 1.16, 1] : ringScale,
                    opacity: isModelSpeaking ? [0.45, 0.82, 0.45] : Math.min(audioLevel * 10, 1),
                  }}
                  transition={isModelSpeaking ? { duration: 1.2, repeat: Infinity } : { duration: 0.08 }}
                />
                <motion.div
                  className="absolute inset-[-14px] rounded-full bg-white/8"
                  animate={{ scale: [1, 1.45, 1], opacity: [0.24, 0, 0.24] }}
                  transition={{ duration: 2.2, repeat: Infinity }}
                />
              </>
            )}
            <button
              onClick={isConnected ? disconnect : connect}
              disabled={isConnecting}
              className={`relative flex h-12 w-12 items-center justify-center rounded-full border transition-all duration-300 ${
                isConnected
                  ? "border-white/24 bg-zinc-900 text-white shadow-[0_0_30px_rgba(255,255,255,0.08)]"
                  : "border-white/10 bg-zinc-950 text-white hover:border-white/22 hover:bg-zinc-900"
              } ${isConnecting ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
            >
              {isConnecting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : isConnected ? (
                <MicOff className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </button>
          </div>
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/58">
                {isConnecting ? "Alinhando estrelas" : isConnected ? (microphoneReady ? "Voz e texto" : "Texto ritual") : "Texto ritual pronto"}
              </span>
              {isModelSpeaking && (
                <span className="rounded-full border border-amber-400/20 bg-amber-300/10 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-amber-100/88">
                  O Oráculo fala
                </span>
              )}
            </div>
            <p className="text-sm leading-7 text-white/64">{archivePrompt}</p>
          </div>
        </div>
      </div>
      <div className="space-y-3 border-b border-white/8 px-5 py-4">
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
          <button
            type="button"
            onClick={requestContinuation}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[10px] uppercase tracking-[0.22em] text-white/72 transition-all hover:border-white/22 hover:bg-white/8 hover:text-white"
          >
            <MessageSquareText className="h-3.5 w-3.5" />
            Continuar diálogo
          </button>
          <button
            type="button"
            onClick={requestLiteralReading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-300/18 bg-amber-200/10 px-4 py-3 text-[10px] uppercase tracking-[0.22em] text-amber-100/88 transition-all hover:border-amber-200/30 hover:bg-amber-200/14"
          >
            <ScrollText className="h-3.5 w-3.5" />
            Ler registro
          </button>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4 text-sm leading-7 text-white/58">
          <p className="text-[10px] uppercase tracking-[0.22em] text-white/36">Guia de uso</p>
          <p className="mt-3">
            Pergunte livremente para conversar. Quando quiser fidelidade textual, use <span className="text-amber-100/84">Ler registro</span>.
          </p>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-5 py-4">
        <div className="mb-3">
          <p className="text-[10px] uppercase tracking-[0.24em] text-white/35">Diálogo contínuo</p>
          <p className="mt-1 text-sm leading-7 text-white/52">
            O Oráculo mantém o contexto do que acabou de ser discutido e pode continuar a partir do mesmo ponto.
          </p>
        </div>

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
          {oracleTurns.length > 0 ? (
            oracleTurns.map((turn, index) => (
              <div
                key={`${turn.role}-${index}`}
                className={`rounded-2xl border px-4 py-3 text-sm leading-7 ${
                  turn.role === "user"
                    ? "ml-auto max-w-[92%] border-white/10 bg-white/[0.05] text-white/82"
                    : "max-w-[96%] border-amber-300/12 bg-amber-200/[0.08] text-amber-50/88"
                }`}
              >
                <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-white/35">
                  {turn.role === "user" ? "Interlocutor" : "Oráculo"}
                </p>
                <p>{turn.text}</p>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4 text-sm leading-7 text-white/56">
              Abra um registro à esquerda ou desperte o Oráculo por texto e voz. O diálogo fica melhor quando um capítulo já está em foco.
            </div>
          )}
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            submitOraclePrompt(oraclePrompt);
          }}
          className="mt-4 flex flex-col gap-3"
        >
          <label className="sr-only" htmlFor="oracle-text-prompt">
            Pergunta para o Oráculo
          </label>
          <textarea
            id="oracle-text-prompt"
            value={oraclePrompt}
            onChange={(event) => setOraclePrompt(event.target.value)}
            placeholder="Ex.: continue a explicação sobre Nashara. Ou: leia exatamente o capítulo atual."
            className="min-h-[112px] resize-none rounded-[24px] border border-white/10 bg-zinc-950/82 px-4 py-3 text-sm leading-7 text-white placeholder:text-white/22 focus:border-white/20 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!oraclePrompt.trim()}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[18px] border border-amber-300/20 bg-amber-200/12 px-5 text-[11px] uppercase tracking-[0.22em] text-amber-50/90 transition-all hover:border-amber-200/32 hover:bg-amber-200/16 disabled:pointer-events-none disabled:opacity-40"
          >
            {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
            {isConnecting ? "Invocando" : "Enviar ao Oráculo"}
          </button>
        </form>
      </div>
    </aside>
  );

  const archiveDrawer = (
    <AnimatePresence>
      {showArchive && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowArchive(false)}
            className="absolute inset-0 z-[60] bg-black/72 backdrop-blur-sm xl:hidden"
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute inset-y-0 left-0 z-[70] flex w-full max-w-sm flex-col border-r border-white/10 bg-zinc-950 xl:hidden"
          >
            <div className="flex items-center justify-between border-b border-white/8 px-5 py-5">
              <div className="flex items-center gap-3">
                <BookOpen className="h-4.5 w-4.5 text-white/42" />
                <div>
                  <p className="text-[10px] uppercase tracking-[0.24em] text-white/42">Arquivo de lore</p>
                  <p className="mt-1 text-sm leading-6 text-white/62">Abra um registro para ler sem distração.</p>
                </div>
              </div>
              <button
                onClick={() => setShowArchive(false)}
                className="rounded-full p-2 text-white/40 transition-colors hover:bg-white/5 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-4 py-4">
              <div className="archive-oracle-search">
                <Search className="archive-oracle-search-icon h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar capítulo, profecia ou nome..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="archive-oracle-input rounded-2xl border border-white/10 bg-black/45 text-sm text-white/84 placeholder:text-white/24 focus:border-white/18 focus:outline-none"
                />
              </div>
            </div>
            <div className="archive-oracle-list flex-1 space-y-2 px-3 py-1">{archiveEntries}</div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );

  const errorToast = (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: -20, x: "-50%" }}
          className="absolute left-1/2 top-6 z-[80] flex min-w-[320px] items-center gap-3 rounded-2xl border border-amber-300/20 bg-zinc-900 px-6 py-3 text-sm text-amber-100 shadow-2xl"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-300/10">
            <AlertCircle className="h-4 w-4" />
          </div>
          <p className="font-medium">{error}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050507] font-sans text-zinc-300">
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(220,190,120,0.08),transparent_28%),radial-gradient(circle_at_18%_30%,rgba(77,74,124,0.22),transparent_32%),radial-gradient(circle_at_82%_36%,rgba(114,82,48,0.16),transparent_26%),linear-gradient(180deg,rgba(4,4,8,0.22),rgba(4,4,8,0.92))]" />
        <div className="absolute left-[18%] top-[20%] h-1.5 w-1.5 animate-pulse rounded-full bg-white/60 blur-[2px]" />
        <div className="absolute left-[46%] top-[12%] h-1 w-1 animate-pulse rounded-full bg-white/60 blur-[2px] delay-700" />
        <div className="absolute left-[78%] top-[30%] h-1.5 w-1.5 animate-pulse rounded-full bg-amber-200/70 blur-[2px] delay-1000" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1680px] flex-col px-4 pb-6 pt-6 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 flex flex-wrap items-center justify-between gap-3"
        >
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleReturn}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-zinc-950/72 px-4 py-2 text-[10px] uppercase tracking-[0.24em] text-white/70 backdrop-blur-md transition-all hover:border-white/25 hover:text-white"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Voltar
            </button>
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-zinc-950/72 px-4 py-2 text-[10px] uppercase tracking-[0.24em] text-white/70 backdrop-blur-md transition-all hover:border-white/25 hover:text-white"
            >
              <Home className="h-3.5 w-3.5" />
              Início
            </button>
            <div className="rounded-full border border-white/8 bg-black/35 px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-white/42">
              {currentChapter ? `${chapterKind(currentChapter.title)} • ${chapterDisplayName(currentChapter.title)}` : "Oráculo de Luna • Arquivo"}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowArchive(true)}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-zinc-950/72 px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-white/68 transition-all hover:border-white/24 hover:text-white xl:hidden"
            >
              <BookOpen className="h-3.5 w-3.5" />
              Arquivo
            </button>
            <div className="flex items-center gap-1 rounded-full border border-white/10 bg-zinc-950/72 p-1 backdrop-blur-md">
              <button
                onClick={() => navigateHistory("prev")}
                disabled={historyIndex === 0}
                className={`rounded-full p-2 transition-all ${historyIndex === 0 ? "cursor-not-allowed text-white/10 opacity-30" : "text-white/48 hover:bg-white/5 hover:text-white"}`}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="px-2 text-[9px] font-bold uppercase tracking-[0.24em] text-white/28">
                {historyIndex + 1} / {history.length}
              </div>
              <button
                onClick={() => navigateHistory("next")}
                disabled={historyIndex === history.length - 1}
                className={`rounded-full p-2 transition-all ${historyIndex === history.length - 1 ? "cursor-not-allowed text-white/10 opacity-30" : "text-white/48 hover:bg-white/5 hover:text-white"}`}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            {appCode !== history[0] && (
              <button
                onClick={resetToOrigin}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-zinc-950/72 px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-white/68 transition-all hover:border-white/24 hover:text-white"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Resetar visão
              </button>
            )}
          </div>
        </motion.div>

        <div className="archive-oracle-shell flex-1">
          {archivePanel}
          {stagePanel}
          {oraclePanel}
        </div>
      </div>

      {archiveDrawer}
      {errorToast}
    </div>
  );
}
