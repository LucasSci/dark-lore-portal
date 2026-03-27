import { useState, useEffect, useMemo } from 'react';
import { Mic, MicOff, Loader2, AlertCircle, RotateCcw, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, BookOpen, History, X, Search, Maximize2, Minimize2, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLiveAPI } from './hooks/useLiveAPI';
import { LORE_CHAPTERS, LoreChapter } from './lore';
import { GoogleGenAI } from "@google/genai";

const INITIAL_APP_CODE = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"><\/script>
  <style>
    body { margin: 0; background: #020205; overflow: hidden; }
    
    /* Nebula Background Effect */
    .nebula {
      position: absolute;
      inset: 0;
      background: 
        radial-gradient(circle at 20% 30%, rgba(26, 26, 46, 0.8) 0%, transparent 50%),
        radial-gradient(circle at 80% 70%, rgba(10, 10, 35, 0.8) 0%, transparent 50%),
        radial-gradient(circle at 50% 50%, rgba(5, 5, 15, 1) 0%, #020205 100%);
      filter: blur(60px);
      opacity: 0.6;
      animation: nebula-drift 20s infinite alternate ease-in-out;
      transition: opacity 0.2s ease-out;
    }

    @keyframes nebula-drift {
      0% { transform: scale(1) translate(0, 0); }
      100% { transform: scale(1.1) translate(2%, 2%); }
    }

    .oracle-light {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%);
      filter: blur(50px);
      animation: pulse 10s infinite ease-in-out;
      z-index: 5;
      transition: transform 0.1s ease-out, opacity 0.1s ease-out;
    }

    .luna-silhouette {
      position: absolute;
      top: 55%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 220px;
      height: 450px;
      background: linear-gradient(to bottom, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.01) 100%);
      clip-path: polygon(50% 0%, 80% 20%, 90% 50%, 80% 80%, 50% 100%, 20% 80%, 10% 50%, 20% 20%);
      filter: blur(12px);
      opacity: 0.3;
      animation: sway 15s infinite ease-in-out;
      z-index: 10;
    }

    @keyframes pulse {
      0%, 100% { opacity: 0.2; transform: translate(-50%, -50%) scale(1); }
      50% { opacity: 0.5; transform: translate(-50%, -50%) scale(1.1); }
    }

    @keyframes sway {
      0%, 100% { transform: translate(-50%, -50%) rotate(0deg); }
      50% { transform: translate(-51%, -49%) rotate(1deg); }
    }

    canvas {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 2;
    }

    .vignette {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle, transparent 40%, rgba(0,0,0,0.8) 100%);
      pointer-events: none;
      z-index: 20;
    }

    .label {
      position: fixed;
      bottom: 12%;
      left: 50%;
      transform: translateX(-50%);
      opacity: 0.15;
      text-transform: uppercase;
      letter-spacing: 1.2em;
      font-size: 10px;
      color: white;
      pointer-events: none;
      z-index: 25;
      font-family: sans-serif;
    }

    .lore-content {
      animation: loreFadeIn 2s ease-out forwards;
    }

    @keyframes loreFadeIn {
      0% { opacity: 0; transform: translateY(20px) scale(0.98); filter: blur(10px); }
      100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
    }

    .lore-slide-left {
      animation: loreSlideLeft 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
    }

    @keyframes loreSlideLeft {
      from { opacity: 0; transform: translateX(50px); filter: blur(10px); }
      to { opacity: 1; transform: translateX(0); filter: blur(0); }
    }

    .lore-slide-right {
      animation: loreSlideRight 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
    }

    @keyframes loreSlideRight {
      from { opacity: 0; transform: translateX(-50px); filter: blur(10px); }
      to { opacity: 1; transform: translateX(0); filter: blur(0); }
    }

    .lore-item {
      opacity: 0;
      animation: loreItemIn 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
    }

    @keyframes loreItemIn {
      from { opacity: 0; transform: translateY(30px); filter: blur(10px); }
      to { opacity: 1; transform: translateY(0); filter: blur(0); }
    }

    .pulse-subtle {
      animation: pulse-subtle 4s infinite ease-in-out;
    }

    @keyframes pulse-subtle {
      0%, 100% { opacity: 0.4; transform: scale(1); }
      50% { opacity: 0.6; transform: scale(1.02); }
    }

    .glow-subtle {
      animation: glow-subtle 4s infinite ease-in-out;
    }

    @keyframes glow-subtle {
      0%, 100% { text-shadow: 0 0 0px rgba(255,255,255,0); }
      50% { text-shadow: 0 0 12px rgba(255,255,255,0.25); }
    }

    .progress-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background: rgba(255,255,255,0.02);
      z-index: 100;
      opacity: 0;
      transition: opacity 0.5s ease;
    }
    .progress-container.visible {
      opacity: 1;
    }
    .progress-bar {
      height: 100%;
      background: linear-gradient(to right, transparent, rgba(255,255,255,0.5), transparent);
      width: 0%;
      box-shadow: 0 0 15px rgba(255,255,255,0.1);
    }

    .custom-scrollbar::-webkit-scrollbar {
      width: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 10px;
    }

    .zoomable {
      cursor: zoom-in;
      transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      z-index: 1;
      padding: 1rem;
      border-radius: 1rem;
      border: 1px solid transparent;
    }
    .zoomable.zoomed {
      transform: scale(1.05);
      z-index: 50;
      cursor: zoom-out;
      opacity: 1 !important;
      filter: blur(0) drop-shadow(0 15px 25px rgba(0, 0, 0, 0.6)) !important;
      text-shadow: 0 0 20px rgba(255,255,255,0.4) !important;
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(12px);
      border-color: rgba(255, 255, 255, 0.1);
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.05);
      margin: 3rem 0;
    }
    .lore-content-inner.has-zoomed .zoomable:not(.zoomed) {
      opacity: 0.05 !important;
      filter: blur(12px) !important;
      pointer-events: none;
      transform: scale(0.95);
    }

    #loreContainer .zoomable {
      filter: drop-shadow(0 8px 12px rgba(0, 0, 0, 0.4));
    }

    .nav-rail {
      position: fixed;
      right: 2rem;
      top: 50%;
      transform: translateY(-50%);
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      z-index: 100;
      pointer-events: auto;
    }
    .nav-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.05);
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
    }
    .nav-dot:hover {
      background: rgba(255, 255, 255, 0.4);
      transform: scale(1.3);
      box-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
    }
    .nav-dot.active {
      background: rgba(255, 255, 255, 0.9);
      box-shadow: 0 0 20px rgba(255, 255, 255, 0.6), 0 0 40px rgba(255, 255, 255, 0.2);
      transform: scale(1.6);
    }
    .nav-tooltip {
      position: absolute;
      right: 2.5rem;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(5, 5, 10, 0.9);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      padding: 0.8rem 1.4rem;
      border-radius: 1rem;
      color: rgba(255, 255, 255, 0.95);
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.8);
    }
    .nav-dot:hover .nav-tooltip {
      opacity: 1;
      right: 3rem;
    }
  </style>
</head>
<body class="min-h-screen flex items-center justify-center relative overflow-hidden">
  <div class="progress-container"><div class="progress-bar" id="scrollProgress"></div></div>
  <div class="nebula"></div>
  <canvas id="stardust"></canvas>
  <div class="oracle-light"></div>
  <div class="luna-silhouette lore-content"></div>
  <div class="vignette"></div>
  <div class="label lore-content">Presença de Luna</div>

  <script>
    const canvas = document.getElementById('stardust');
    const ctx = canvas.getContext('2d');
    let particles = [];

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    class Particle {
      constructor() {
        this.init();
      }

      init() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5 + 0.1;
        this.speedX = (Math.random() - 0.5) * 0.2;
        this.speedY = -Math.random() * 0.5 - 0.1;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.fadeSpeed = Math.random() * 0.005 + 0.002;
      }

      update() {
        this.y += this.speedY;
        this.x += this.speedX;
        
        if (this.y < -10) {
          this.y = canvas.height + 10;
          this.x = Math.random() * canvas.width;
        }
      }

      draw() {
        ctx.fillStyle = 'rgba(255, 255, 255, ' + this.opacity + ')';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Shimmer effect
        this.opacity += this.fadeSpeed;
        if (this.opacity > 0.6 || this.opacity < 0.1) {
          this.fadeSpeed *= -1;
        }
      }
    }

    function initParticles() {
      particles = [];
      const count = Math.floor((canvas.width * canvas.height) / 8000);
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animate);
    }

    initParticles();
    animate();

    // Listen for audio level updates
    window.addEventListener('message', (event) => {
      if (event.data.type === 'audio-level') {
        const level = event.data.level;
        const light = document.querySelector('.oracle-light');
        const nebula = document.querySelector('.nebula');
        
        if (light) {
          const scale = 1 + level * 2;
          const opacity = 0.2 + level * 0.8;
          light.style.transform = "translate(-50%, -50%) scale(" + scale + ")";
          light.style.opacity = opacity;
        }
        
        if (nebula) {
          nebula.style.opacity = 0.4 + level * 0.6;
        }

        // Speed up particles based on audio
        particles.forEach(p => {
          p.speedY = (-Math.random() * 0.5 - 0.1) * (1 + level * 5);
        });
      }
    });

    function updateScroll() {
      const loreContainer = document.getElementById('loreContainer');
      const scrollProgress = document.getElementById('scrollProgress');
      const progressContainer = document.querySelector('.progress-container');
      
      if (loreContainer && scrollProgress && progressContainer) {
        const winScroll = loreContainer.scrollTop;
        const height = loreContainer.scrollHeight - loreContainer.clientHeight;
        
        if (height > 50) {
          progressContainer.classList.add('visible');
          const scrolled = (winScroll / height) * 100;
          scrollProgress.style.width = scrolled + "%";
        } else {
          progressContainer.classList.remove('visible');
        }
      }
    }

    const observer = new MutationObserver(() => {
      const loreContainer = document.getElementById('loreContainer');
      if (loreContainer) {
        loreContainer.addEventListener('scroll', updateScroll);
        updateScroll();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    function handleLoreClick(e) {
      const target = e.target.closest('.zoomable');
      const container = document.querySelector('.lore-content-inner');
      const loreContainer = document.getElementById('loreContainer');
      
      if (!target || !container) {
        const currentZoomed = document.querySelector('.zoomed');
        if (currentZoomed) {
          currentZoomed.classList.remove('zoomed');
          container?.classList.remove('has-zoomed');
        }
        return;
      }
      
      const isZoomed = target.classList.contains('zoomed');
      
      document.querySelectorAll('.zoomable').forEach(el => el.classList.remove('zoomed'));
      container.classList.remove('has-zoomed');
      
      if (!isZoomed) {
        target.classList.add('zoomed');
        container.classList.add('has-zoomed');
        
        // Scroll to the zoomed element smoothly
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }

    document.addEventListener('click', handleLoreClick);

    // Swipe Gestures for Chapter Navigation
    let touchStartX = 0;
    let touchEndX = 0;

    function handleGesture() {
      const swipeThreshold = 80;
      const diff = touchEndX - touchStartX;
      
      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
          // Swipe Right -> Previous
          window.parent.postMessage({ type: 'navigate-chapter', direction: 'prev' }, '*');
        } else {
          // Swipe Left -> Next
          window.parent.postMessage({ type: 'navigate-chapter', direction: 'next' }, '*');
        }
      }
    }

    document.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    document.addEventListener('touchend', e => {
      touchEndX = e.changedTouches[0].screenX;
      handleGesture();
    }, { passive: true });
  </script>
</body>
</html>`;

export default function App() {
  const [appCode, setAppCode] = useState<string>(INITIAL_APP_CODE);
  const [showCode, setShowCode] = useState<boolean>(false); // Start with code hidden for immersion
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [showArchive, setShowArchive] = useState<boolean>(false);
  const [history, setHistory] = useState<string[]>([INITIAL_APP_CODE]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [currentChapter, setCurrentChapter] = useState<LoreChapter | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [chapters, setChapters] = useState<LoreChapter[]>(LORE_CHAPTERS);
  const [isGeneratingThumbnails, setIsGeneratingThumbnails] = useState(false);

  const generateThumbnails = async () => {
    if (isGeneratingThumbnails) return;
    
    const missingThumbnails = chapters.filter(c => !c.thumbnail);
    if (missingThumbnails.length === 0) return;

    setIsGeneratingThumbnails(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      for (const chapter of missingThumbnails) {
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
              parts: [
                {
                  text: `Generate a mystical, celestial thumbnail image for a lore chapter titled "${chapter.title}". The image should reflect the mood of this content: "${chapter.content.substring(0, 200)}...". Style: digital art, ethereal, dark fantasy, cinematic lighting.`,
                },
              ],
            },
            config: {
              imageConfig: {
                aspectRatio: "1:1",
              },
            },
          });

          let imageUrl = "";
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
              imageUrl = `data:image/png;base64,${part.inlineData.data}`;
              break;
            }
          }

          if (imageUrl) {
            setChapters(prev => prev.map(c => 
              c.id === chapter.id ? { ...c, thumbnail: imageUrl } : c
            ));
          }
        } catch (err) {
          console.error(`Failed to generate thumbnail for ${chapter.id}:`, err);
        }
      }
    } finally {
      setIsGeneratingThumbnails(false);
    }
  };

  useEffect(() => {
    if (showArchive) {
      generateThumbnails();
    }
  }, [showArchive]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'select-chapter') {
        const chapter = LORE_CHAPTERS.find(c => c.id === event.data.id);
        if (chapter) {
          selectChapter(chapter);
        }
      } else if (event.data.type === 'navigate-chapter') {
        navigateChapter(event.data.direction);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isReadingMode, currentChapter]);

  const updateCodeWithHistory = (newCode: string) => {
    if (newCode === history[historyIndex]) return;
    
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newCode);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setAppCode(newCode);
    
    // Try to find if this code matches a chapter
    const chapter = LORE_CHAPTERS.find(c => newCode.includes(c.title));
    if (chapter) setCurrentChapter(chapter);
    else setCurrentChapter(null);
  };

  const navigateHistory = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setAppCode(history[newIndex]);
    } else if (direction === 'next' && historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setAppCode(history[newIndex]);
    }
  };

  const generateChapterCode = (chapter: LoreChapter, readingMode: boolean, transitionDirection?: 'left' | 'right') => {
    const bgClass = readingMode ? 'bg-[#08080a]' : 'bg-[#020205]';
    const textOpacity = readingMode ? 'text-white/60' : 'text-white/40';
    const titleOpacity = readingMode ? 'text-white/90' : 'text-white/80';
    const fontSize = readingMode ? 'text-lg' : 'text-sm';
    const titleSize = readingMode ? 'text-4xl' : 'text-2xl';
    const maxWidth = readingMode ? 'max-w-3xl' : 'max-w-2xl';
    const padding = readingMode ? 'py-48' : 'py-32';
    const transitionClass = transitionDirection === 'left' ? 'lore-slide-left' : transitionDirection === 'right' ? 'lore-slide-right' : 'lore-content';

    const navRail = `
      <div class="nav-rail">
        ${chapters.map((c) => `
          <div class="nav-dot ${c.id === chapter.id ? 'active' : ''}" onclick="window.parent.postMessage({type: 'select-chapter', id: '${c.id}'}, '*')">
            <div class="nav-tooltip">
              <div class="flex items-center gap-3">
                ${c.thumbnail ? `<img src="${c.thumbnail}" class="w-8 h-8 rounded-full object-cover border border-white/20" />` : ''}
                <span>${c.title}</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    return INITIAL_APP_CODE.replace(
      'body { margin: 0; background: #020205; overflow: hidden; }',
      `body { margin: 0; background: ${readingMode ? '#08080a' : '#020205'}; overflow: hidden; }`
    ).replace(
      '<div class="label lore-content">Presença de Luna</div>',
      `<div class="label lore-content pulse-subtle glow-subtle">${chapter.title}</div>
       <div id="loreContainer" class="fixed inset-0 overflow-y-auto p-8 z-30 ${transitionClass} custom-scrollbar">
         ${navRail}
         <div class="min-h-full flex items-center justify-center ${padding}">
           <div class="${maxWidth} text-center pointer-events-auto pulse-subtle lore-content-inner">
             <h1 class="${titleOpacity} ${titleSize} font-serif italic mb-12 tracking-widest glow-subtle zoomable transition-all duration-700 lore-item" style="animation-delay: 0.1s">${chapter.title}</h1>
             <div class="space-y-12">
               ${chapter.content.split('\n\n').map((p, i) => `<p class="${textOpacity} ${fontSize} leading-relaxed font-light tracking-wide glow-subtle zoomable transition-all duration-700 lore-item" style="animation-delay: ${0.2 + i * 0.1}s">${p}</p>`).join('')}
             </div>
           </div>
         </div>
       </div>`
    );
  };

  const selectChapter = (chapter: LoreChapter, direction?: 'left' | 'right') => {
    setCurrentChapter(chapter);
    const chapterCode = generateChapterCode(chapter, isReadingMode, direction);
    updateCodeWithHistory(chapterCode);
    setShowArchive(false);
  };

  const toggleReadingMode = () => {
    if (!currentChapter) return;
    const nextMode = !isReadingMode;
    setIsReadingMode(nextMode);
    const newCode = generateChapterCode(currentChapter, nextMode);
    setAppCode(newCode); // Update current view without adding to history
  };

  const resetToOrigin = () => {
    updateCodeWithHistory(INITIAL_APP_CODE);
    setCurrentChapter(null);
  };

  const navigateChapter = (direction: 'prev' | 'next') => {
    if (!currentChapter) return;
    const currentIndex = LORE_CHAPTERS.findIndex(c => c.id === currentChapter.id);
    if (direction === 'prev' && currentIndex > 0) {
      const prevChapter = LORE_CHAPTERS[currentIndex - 1];
      selectChapter(prevChapter, 'right');
    } else if (direction === 'next' && currentIndex < LORE_CHAPTERS.length - 1) {
      const nextChapter = LORE_CHAPTERS[currentIndex + 1];
      selectChapter(nextChapter, 'left');
    }
  };
  
  const { isConnected, isConnecting, error, audioLevel, isModelSpeaking, connect, disconnect } = useLiveAPI(updateCodeWithHistory, appCode);

  const filteredChapters = useMemo(() => 
    chapters.filter(chapter => 
      chapter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chapter.content.toLowerCase().includes(searchQuery.toLowerCase())
    ), [chapters, searchQuery]);

  // Sync audio level to iframe
  useEffect(() => {
    const iframe = document.querySelector('iframe');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'audio-level', level: audioLevel }, '*');
    }
  }, [audioLevel]);

  // Scale the audio ring
  const ringScale = 1 + Math.min(audioLevel * 6, 0.8);

  return (
    <div className="relative w-full h-screen bg-[#050505] overflow-hidden font-sans text-zinc-300">
      {/* Background Floating Lights for the Editor UI too */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full blur-[2px] animate-pulse"></div>
        <div className="absolute top-3/4 left-1/2 w-1 h-1 bg-white rounded-full blur-[2px] animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-3/4 w-1 h-1 bg-white rounded-full blur-[2px] animate-pulse delay-1000"></div>
      </div>

      {/* Breadcrumb / Current Location */}
      <AnimatePresence>
        {!isReadingMode && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-6 left-6 z-50 flex items-center gap-2 pointer-events-none"
          >
            <div className="px-3 py-1.5 rounded-full bg-zinc-900/40 backdrop-blur-sm border border-white/5 flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/20">Arquivo</span>
              {currentChapter && (
                <>
                  <ChevronRight className="w-3 h-3 text-white/10" />
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/60">{currentChapter.title.split(' — ')[0]}</span>
                </>
              )}
              {historyIndex > 0 && !currentChapter && (
                <>
                  <ChevronRight className="w-3 h-3 text-white/10" />
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/60">Visão {historyIndex}</span>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Search Bar */}
      <AnimatePresence>
        {!isReadingMode && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
          >
            <div className={`relative transition-all duration-300 ${isSearchFocused ? 'scale-105' : 'scale-100'}`}>
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className={`w-4 h-4 transition-colors ${isSearchFocused ? 'text-white/60' : 'text-white/20'}`} />
          </div>
          <input
            type="text"
            placeholder="Pesquisar no arquivo de lore..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            className="w-full bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-full py-2 pl-12 pr-10 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:bg-zinc-900/60 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-4 flex items-center text-white/20 hover:text-white/60 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          
          {/* Search Results Dropdown */}
          <AnimatePresence>
            {searchQuery && isSearchFocused && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full mt-2 w-full bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
              >
                <div className="max-h-64 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                  {filteredChapters.length > 0 ? (
                    filteredChapters.map(chapter => (
                      <button
                        key={chapter.id}
                        onClick={() => {
                          selectChapter(chapter);
                          setSearchQuery('');
                        }}
                        className="w-full text-left p-3 rounded-xl hover:bg-white/5 transition-colors group flex items-center gap-4"
                      >
                        <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                          {chapter.thumbnail ? (
                            <img src={chapter.thumbnail} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-white/20" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] uppercase tracking-widest text-white/40 group-hover:text-white/60 mb-1 truncate">
                            {chapter.title.split(' — ')[0]}
                          </div>
                          <div className="text-xs font-serif italic text-white/60 group-hover:text-white truncate">
                            {chapter.title.split(' — ')[1] || chapter.title}
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-[10px] uppercase tracking-widest text-white/20 italic">
                      Nenhum fragmento encontrado
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    )}
  </AnimatePresence>

      {/* Lore Archive Side Panel */}
      <AnimatePresence>
        {showArchive && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowArchive(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 left-0 bottom-0 w-full max-w-sm bg-zinc-950 border-r border-white/10 z-[70] flex flex-col"
            >
              <div className="p-8 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-white/40" />
                  <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-white/60">Arquivo de Lore</h2>
                </div>
                <button 
                  onClick={() => setShowArchive(false)}
                  className="p-2 rounded-full hover:bg-white/5 text-white/40 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {filteredChapters.map((chapter) => (
                  <button
                    key={chapter.id}
                    onClick={() => selectChapter(chapter)}
                    className={`w-full text-left p-4 rounded-xl transition-all border flex items-center gap-4 ${
                      currentChapter?.id === chapter.id 
                        ? 'bg-white/5 border-white/20 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)]' 
                        : 'border-transparent text-white/40 hover:bg-white/5 hover:text-white/60'
                    }`}
                  >
                    <div className="w-16 h-16 rounded-lg bg-white/5 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                      {chapter.thumbnail ? (
                        <img src={chapter.thumbnail} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <ImageIcon className="w-4 h-4 text-white/10 animate-pulse" />
                          <span className="text-[8px] uppercase tracking-tighter text-white/10">Gerando...</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] uppercase tracking-widest mb-1 opacity-50 truncate">
                        {chapter.title.split(' — ')[0]}
                      </div>
                      <div className="text-xs font-serif italic truncate">
                        {chapter.title.split(' — ')[1] || chapter.title}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="p-6 border-t border-white/5 bg-black/20">
                <p className="text-[10px] text-white/20 text-center leading-relaxed">
                  "As areias guardam o que o tempo tenta apagar."
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Chapter Navigation Overlay */}
      <AnimatePresence>
        {currentChapter && (
          <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: isReadingMode ? -24 : 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`absolute ${isReadingMode ? 'bottom-8' : 'bottom-32'} left-1/2 -translate-x-1/2 z-40 flex items-center gap-4`}
          >
            <button
              onClick={() => navigateChapter('prev')}
              disabled={LORE_CHAPTERS.findIndex(c => c.id === currentChapter.id) === 0}
              className="group flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/60 backdrop-blur-md border border-white/10 text-white/40 hover:text-white hover:border-white/30 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
              title={LORE_CHAPTERS.findIndex(c => c.id === currentChapter.id) === 0 ? "Não há mais capítulos anteriores para ler" : "Capítulo Anterior"}
            >
              <ChevronLeft className="w-4 h-4" />
              {!isReadingMode && <span className="text-[10px] uppercase tracking-widest">Anterior</span>}
            </button>
            
            <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/60 font-bold">
                {LORE_CHAPTERS.findIndex(c => c.id === currentChapter.id) + 1} / {LORE_CHAPTERS.length}
              </span>
            </div>

            <button
              onClick={() => navigateChapter('next')}
              disabled={LORE_CHAPTERS.findIndex(c => c.id === currentChapter.id) === LORE_CHAPTERS.length - 1}
              className="group flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/60 backdrop-blur-md border border-white/10 text-white/40 hover:text-white hover:border-white/30 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
              title={LORE_CHAPTERS.findIndex(c => c.id === currentChapter.id) === LORE_CHAPTERS.length - 1 ? "Não há mais capítulos futuros para ler" : "Próximo Capítulo"}
            >
              {!isReadingMode && <span className="text-[10px] uppercase tracking-widest">Próximo</span>}
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={toggleReadingMode}
              className={`p-2 rounded-full transition-all ${
                isReadingMode 
                  ? 'bg-white text-zinc-950 shadow-[0_0_20px_rgba(255,255,255,0.3)]' 
                  : 'bg-zinc-900/60 text-white/40 hover:text-white border border-white/10'
              }`}
              title={isReadingMode ? "Sair do Modo de Leitura" : "Modo de Leitura"}
            >
              {isReadingMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="absolute top-6 left-1/2 bg-zinc-900 border border-red-900/50 text-red-400 px-6 py-3 rounded-2xl text-sm shadow-2xl z-50 flex items-center gap-3 min-w-[320px]"
          >
            <div className="w-8 h-8 rounded-full bg-red-950/30 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
            <p className="font-medium">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Always-visible app canvas */}
      <div className="absolute inset-0 flex flex-col-reverse md:flex-row w-full h-full z-10 bg-[#050505] overflow-hidden">
        {/* Code Panel */}
        <AnimatePresence>
          {showCode && (
            <motion.div
              initial={{ [isMobile ? 'height' : 'width']: 0, opacity: 0 }}
              animate={{ 
                [isMobile ? 'height' : 'width']: isMobile ? '40%' : '33.333333%', 
                [isMobile ? 'width' : 'height']: '100%',
                opacity: 1 
              }}
              exit={{ [isMobile ? 'height' : 'width']: 0, opacity: 0 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className={`border-t md:border-t-0 md:border-r border-white/10 overflow-auto p-6 shadow-inner shrink-0 flex flex-col bg-zinc-950`}
            >
              <div className="flex items-center justify-between mb-4 shrink-0">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">Escritura Celestial</h3>
              </div>
              <pre className="flex-1 text-[11px] font-mono whitespace-pre-wrap break-words leading-relaxed text-white/60">
                <code>{appCode}</code>
              </pre>
              <div className="mt-6 shrink-0 text-center">
                <p className="text-[10px] text-white/30 italic">
                  As visões do Oráculo podem oscilar e mudar.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Preview Panel */}
        <div className="flex-1 w-full relative bg-[#050505] min-h-0 min-w-0 flex flex-col">
          <AnimatePresence>
            {!isReadingMode && (
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onClick={() => setShowCode(!showCode)}
                className="absolute bottom-0 left-1/2 -translate-x-1/2 md:bottom-auto md:top-1/2 md:left-0 md:-translate-y-1/2 md:translate-x-0 z-50 flex items-center justify-center w-14 h-6 md:w-6 md:h-14 bg-zinc-900 border border-white/10 border-b-0 md:border-b md:border-l-0 rounded-t-lg md:rounded-t-none md:rounded-r-lg shadow-md text-white/40 hover:text-white hover:bg-zinc-800 transition-all"
                title={showCode ? "Ocultar Escritura" : "Mostrar Escritura"}
              >
                {isMobile ? (
                  showCode ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />
                ) : (
                  showCode ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                )}
              </motion.button>
            )}
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.div
              key={appCode.substring(0, 100) + appCode.length} // Unique key for content changes
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="flex-1 w-full flex flex-col"
            >
              <iframe
                srcDoc={appCode}
                className="flex-1 w-full border-none"
                title="Live App"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            </motion.div>
          </AnimatePresence>

          {/* Floating Mic Button - Now inside Preview Panel */}
          <AnimatePresence>
            {!isReadingMode && (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  left: isConnected ? '2rem' : '50%',
                  bottom: isConnected ? '2rem' : '6rem',
                  x: isConnected ? '0%' : '-50%',
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className="absolute z-50"
              >
            <div className="relative group">
              {/* Audio Level Ring */}
              {isConnected && (
                <motion.div
                  className="absolute rounded-full border-2 pointer-events-none"
                  style={{
                    inset: '-6px',
                    borderColor: isModelSpeaking 
                      ? 'rgba(255, 255, 255, 0.6)' 
                      : 'rgba(255, 255, 255, 0.2)',
                  }}
                  animate={{ 
                    scale: isModelSpeaking ? [1, 1.15, 1] : ringScale,
                    opacity: isModelSpeaking ? [0.4, 0.8, 0.4] : Math.min(audioLevel * 10, 1),
                  }}
                  transition={isModelSpeaking ? { duration: 1.2, repeat: Infinity } : { duration: 0.05 }}
                />
              )}

              {/* Pulse effect when connected */}
              {isConnected && (
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -inset-4 rounded-full bg-white/10"
                />
              )}
              
              <motion.button
                onClick={isConnected ? disconnect : connect}
                disabled={isConnecting}
                animate={isConnected && !isModelSpeaking ? {
                  scale: [1, 1.05, 1],
                  opacity: [1, 0.8, 1],
                } : { scale: 1, opacity: 1 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className={`
                  relative flex items-center justify-center rounded-full 
                  transition-all duration-500
                  ${isConnected 
                    ? 'bg-zinc-900 text-white border border-white/20 w-12 h-12 shadow-[0_20px_55px_rgba(255,255,255,0.1)]' 
                    : 'bg-zinc-950 text-white hover:scale-105 active:scale-95 border border-white/10 w-16 h-16 shadow-[0_20px_55px_rgba(255,255,255,0.1)]'
                  }
                  ${isConnecting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {isConnecting ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : isConnected ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-6 h-6" />
                )}
              </motion.button>
              
              {/* Status Label */}
              <AnimatePresence>
                {!isConnected && !isConnecting && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.4em] pl-[0.4em] text-white/40"
                  >
                    Consultar Oráculo
                  </motion.div>
                )}
                {isConnecting && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.4em] pl-[0.4em] text-white/20"
                  >
                    Alinhando Estrelas...
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div>

      {/* Top Right Controls */}
      <AnimatePresence>
        {!isReadingMode && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-6 right-6 z-50 flex items-center gap-3"
          >
            {/* Lore Archive Toggle */}
            <button
              onClick={() => setShowArchive(true)}
              className="p-3 rounded-full bg-zinc-900/60 backdrop-blur-md border border-white/10 text-white/40 hover:text-white hover:border-white/30 transition-all shadow-sm"
              title="Abrir Arquivo de Lore"
            >
              <BookOpen className="w-4 h-4" />
            </button>

            {/* Navigation Controls */}
            <div className="flex items-center gap-1 bg-zinc-900/60 backdrop-blur-md border border-white/10 rounded-full p-1">
              <button
                onClick={() => navigateHistory('prev')}
                disabled={historyIndex === 0}
                className={`p-2 rounded-full transition-all ${
                  historyIndex === 0 ? 'text-white/10 opacity-30 cursor-not-allowed' : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
                title={historyIndex === 0 ? "Não há mais visões anteriores para navegar" : "Visão Anterior"}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="px-2 text-[9px] font-bold text-white/20 uppercase tracking-widest">
                {historyIndex + 1} / {history.length}
              </div>
              <button
                onClick={() => navigateHistory('next')}
                disabled={historyIndex === history.length - 1}
                className={`p-2 rounded-full transition-all ${
                  historyIndex === history.length - 1 ? 'text-white/10 opacity-30 cursor-not-allowed' : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
                title={historyIndex === history.length - 1 ? "Não há mais visões futuras para navegar" : "Próxima Visão"}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {appCode !== INITIAL_APP_CODE && (
              <button
                onClick={resetToOrigin}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/90 backdrop-blur-md border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-all shadow-sm font-medium text-xs uppercase tracking-widest"
                title="Resetar para a Origem Celestial"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Resetar</span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
