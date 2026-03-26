import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Play, VolumeX } from "lucide-react";
import { gsap } from "gsap";
import { Link } from "react-router-dom";

import logoEmblem from "@/assets/logo-emblem-256.webp";
import { portalEmberSpecs, portalHeroScenes, portalReferenceArt } from "@/lib/portal-content";
import { cn } from "@/lib/utils";

export default function CinematicHero() {
  const reduceMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement | null>(null);
  const pointerPlaneRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const controlsRef = useRef<HTMLDivElement | null>(null);
  const fogFarRef = useRef<HTMLDivElement | null>(null);
  const fogNearRef = useRef<HTMLDivElement | null>(null);
  const sceneRefs = useRef<Array<HTMLDivElement | null>>([]);
  const mediaRefs = useRef<Array<HTMLDivElement | null>>([]);
  const moteRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const [activeScene, setActiveScene] = useState(0);
  const [videoFailures, setVideoFailures] = useState<Record<string, boolean>>({});

  const currentScene = portalHeroScenes[activeScene];
  const currentSceneHasVideo = Boolean(
    currentScene?.video && !videoFailures[currentScene.id] && !reduceMotion,
  );

  useEffect(() => {
    if (portalHeroScenes.length < 2) {
      return;
    }

    const rotationId = window.setInterval(() => {
      setActiveScene((current) => (current + 1) % portalHeroScenes.length);
    }, 9000);

    return () => {
      window.clearInterval(rotationId);
    };
  }, []);

  useEffect(() => {
    if (!heroRef.current) {
      return;
    }

    const ctx = gsap.context(() => {
      const contentItems = contentRef.current ? Array.from(contentRef.current.children) : [];
      const controlItems = controlsRef.current ? Array.from(controlsRef.current.children) : [];
      const sceneLayers = sceneRefs.current.filter(Boolean);
      const motes = moteRefs.current.filter(Boolean);

      gsap.set(sceneLayers, { autoAlpha: 0 });
      if (sceneRefs.current[0]) {
        gsap.set(sceneRefs.current[0], { autoAlpha: 1 });
      }

      if (reduceMotion) {
        gsap.set(contentItems, { autoAlpha: 1, y: 0 });
        gsap.set(controlItems, { autoAlpha: 1, y: 0 });
        gsap.set(motes, { autoAlpha: 0.25, scale: 1 });
        return;
      }

      gsap.set(contentItems, { autoAlpha: 0, y: 24 });
      gsap.set(controlItems, { autoAlpha: 0, y: 28 });
      gsap.set(motes, { autoAlpha: 0, scale: 0.68 });

      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
      intro
        .fromTo(pointerPlaneRef.current, { scale: 1.01 }, { scale: 1.05, duration: 2.8 }, 0)
        .to(contentItems, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.1 }, 0.16)
        .to(controlItems, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08 }, 0.44)
        .to(motes, { autoAlpha: 0.58, scale: 1, duration: 1.2, stagger: 0.04 }, 0.32);

      if (fogFarRef.current) {
        gsap.to(fogFarRef.current, {
          xPercent: 4,
          yPercent: -2,
          duration: 16,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      }

      if (fogNearRef.current) {
        gsap.to(fogNearRef.current, {
          xPercent: -6,
          yPercent: 3,
          duration: 12,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      }

      motes.forEach((mote, index) => {
        gsap.to(mote, {
          x: index % 2 === 0 ? 10 : -12,
          y: index % 3 === 0 ? -24 : -18,
          duration: 8 + index * 0.6,
          delay: index * 0.14,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      });
    }, heroRef);

    return () => ctx.revert();
  }, [reduceMotion]);

  useEffect(() => {
    const sceneLayers = sceneRefs.current;

    sceneLayers.forEach((sceneLayer, index) => {
      if (!sceneLayer) {
        return;
      }

      const mediaLayer = mediaRefs.current[index];
      const isActive = index === activeScene;

      if (reduceMotion) {
        gsap.set(sceneLayer, { autoAlpha: isActive ? 1 : 0, y: 0 });
        if (mediaLayer) {
          gsap.set(mediaLayer, { scale: isActive ? 1.03 : 1, filter: "blur(0px)" });
        }
        return;
      }

      gsap.to(sceneLayer, {
        autoAlpha: isActive ? 1 : 0,
        y: isActive ? 0 : 8,
        duration: isActive ? 1.1 : 0.65,
        ease: "power2.out",
        overwrite: "auto",
      });

      if (mediaLayer) {
        gsap.to(mediaLayer, {
          scale: isActive ? 1.05 : 1.01,
          duration: 1.2,
          ease: "power3.out",
          overwrite: "auto",
        });
      }
    });

    if (contentRef.current) {
      const contentItems = Array.from(contentRef.current.children);

      if (reduceMotion) {
        gsap.set(contentItems, { autoAlpha: 1, y: 0 });
        return;
      }

      gsap.set(contentItems, { autoAlpha: 0, y: 18 });
      gsap.to(contentItems, {
        autoAlpha: 1,
        y: 0,
        duration: 0.72,
        stagger: 0.08,
        ease: "power3.out",
        overwrite: "auto",
      });
    }
  }, [activeScene, reduceMotion]);

  useEffect(() => {
    if (!heroRef.current) {
      return;
    }

    let animationFrame = 0;

    const updateFromScroll = () => {
      animationFrame = 0;

      if (!heroRef.current) {
        return;
      }

      const heroBounds = heroRef.current.getBoundingClientRect();
      const progress = Math.min(Math.max(-heroBounds.top / Math.max(heroBounds.height * 0.78, 1), 0), 1);
      const activeMedia = mediaRefs.current[activeScene];
      const activeLayer = sceneRefs.current[activeScene];

      if (activeMedia) {
        gsap.set(activeMedia, {
          y: reduceMotion ? 0 : progress * 52,
          scale: reduceMotion ? 1.03 : 1.05 + progress * 0.02,
          filter: `blur(${reduceMotion ? 0 : progress * 1.6}px)`,
        });
      }

      if (activeLayer && !reduceMotion) {
        gsap.set(activeLayer, { y: progress * -10 });
      }

      if (overlayRef.current) {
        gsap.set(overlayRef.current, {
          opacity: 0.72 + progress * 0.16,
        });
      }
    };

    const handleScroll = () => {
      if (animationFrame) {
        return;
      }

      animationFrame = window.requestAnimationFrame(updateFromScroll);
    };

    updateFromScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [activeScene, reduceMotion]);

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (reduceMotion || !heroRef.current || window.innerWidth < 768) {
      return;
    }

    const bounds = heroRef.current.getBoundingClientRect();
    const offsetX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const offsetY = (event.clientY - bounds.top) / bounds.height - 0.5;

    gsap.to(pointerPlaneRef.current, {
      x: offsetX * 18,
      y: offsetY * 14,
      duration: 1.2,
      ease: "power3.out",
      overwrite: "auto",
    });

    gsap.to(contentRef.current, {
      x: offsetX * 8,
      y: offsetY * 6,
      duration: 1.1,
      ease: "power3.out",
      overwrite: "auto",
    });

    gsap.to(fogFarRef.current, {
      x: offsetX * 22,
      y: offsetY * 16,
      duration: 1.2,
      ease: "power3.out",
      overwrite: "auto",
    });

    gsap.to(fogNearRef.current, {
      x: offsetX * 34,
      y: offsetY * 24,
      duration: 1.3,
      ease: "power3.out",
      overwrite: "auto",
    });
  };

  const resetPointerState = () => {
    if (reduceMotion) {
      return;
    }

    [pointerPlaneRef.current, contentRef.current, fogFarRef.current, fogNearRef.current].forEach((target) => {
      if (!target) {
        return;
      }

      gsap.to(target, {
        x: 0,
        y: 0,
        duration: 1.1,
        ease: "power3.out",
        overwrite: "auto",
      });
    });
  };

  return (
    <section
      ref={heroRef}
      className="cinematic-hero relative isolate min-h-[100svh] overflow-hidden border-b border-[hsl(var(--brand)/0.16)]"
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointerState}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div ref={pointerPlaneRef} className="absolute inset-0 will-change-transform">
          {portalHeroScenes.map((scene, index) => {
            const shouldRenderVideo =
              index === activeScene && scene.video && !videoFailures[scene.id] && !reduceMotion;

            return (
              <div
                key={scene.id}
                ref={(element) => {
                  sceneRefs.current[index] = element;
                }}
                className="absolute inset-0 opacity-0"
              >
                <div
                  ref={(element) => {
                    mediaRefs.current[index] = element;
                  }}
                  className="absolute inset-0 will-change-transform"
                >
                  <img
                    src={scene.poster}
                    alt=""
                    aria-hidden="true"
                    className="h-full w-full object-cover object-center"
                  />

                  {shouldRenderVideo ? (
                    <video
                      key={`${scene.id}-video`}
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="metadata"
                      poster={scene.poster}
                      className="absolute inset-0 h-full w-full object-cover object-center"
                      onError={() =>
                        setVideoFailures((current) => ({
                          ...current,
                          [scene.id]: true,
                        }))
                      }
                    >
                      <source src={scene.video} type="video/mp4" />
                    </video>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        <div
          ref={fogFarRef}
          className="pointer-events-none absolute inset-[-10%] bg-[radial-gradient(circle_at_50%_30%,rgba(124,173,198,0.16),transparent_22%),radial-gradient(circle_at_18%_26%,rgba(231,207,148,0.12),transparent_18%),radial-gradient(circle_at_72%_58%,rgba(92,127,148,0.12),transparent_24%)] opacity-70 blur-3xl mix-blend-screen"
        />
        <div
          ref={fogNearRef}
          className="pointer-events-none absolute inset-x-[-16%] bottom-[-16%] top-[46%] bg-[linear-gradient(180deg,rgba(4,9,13,0.02),rgba(4,9,13,0.44)_28%,rgba(4,9,13,0.84)_100%)] opacity-90 blur-2xl"
        />
        <div
          ref={overlayRef}
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_26%,rgba(23,48,67,0.12),transparent_22%),linear-gradient(180deg,rgba(0,0,0,0.18)_0%,rgba(4,10,16,0.4)_22%,rgba(4,9,13,0.78)_72%,rgba(4,6,10,0.96)_100%)]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.62),transparent_18%,transparent_82%,rgba(0,0,0,0.62))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_42%,rgba(0,0,0,0.36)_100%)]" />

        {portalEmberSpecs.map((ember, index) => (
          <span
            key={`${ember.left}-${ember.top}`}
            ref={(element) => {
              moteRefs.current[index] = element;
            }}
            className="pointer-events-none absolute rounded-full will-change-transform"
            style={{
              left: ember.left,
              top: ember.top,
              width: ember.size + 2,
              height: ember.size + 2,
              background:
                "radial-gradient(circle, rgba(235,221,171,0.95) 0%, rgba(184,220,255,0.48) 44%, rgba(184,220,255,0) 76%)",
              boxShadow: "0 0 28px rgba(248,216,139,0.28)",
            }}
            aria-hidden="true"
          />
        ))}
      </div>

      <div className="container relative flex min-h-[100svh] flex-col justify-between pb-6 pt-24 md:pb-8 md:pt-28">
        <div className="flex flex-1 items-center justify-center">
          <div
            ref={contentRef}
            className="mx-auto flex w-full max-w-5xl flex-col items-center text-center"
          >
            <p className="reference-hero-eyebrow">{currentScene.eyebrow}</p>

            <div className="mt-7 flex items-center justify-center">
              <img
                src={portalReferenceArt.logo}
                alt="Dark Lore Portal"
                decoding="async"
                className="h-32 w-auto object-contain drop-shadow-[0_0_40px_rgba(200,160,80,0.4)] md:h-40 lg:h-48"
              />
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <span className="rounded-full border border-[hsl(var(--brand)/0.22)] bg-[rgba(6,12,18,0.42)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.34em] text-primary/80 backdrop-blur-md">
                {currentScene.sceneLabel}
              </span>
              {currentSceneHasVideo ? (
                <span className="rounded-full border border-[hsl(var(--foreground)/0.14)] bg-[rgba(8,11,16,0.36)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-foreground/78 backdrop-blur-md">
                  <Play className="mr-2 inline h-3.5 w-3.5 text-primary/78" />
                  Video em loop
                  <VolumeX className="ml-2 inline h-3.5 w-3.5 text-foreground/52" />
                </span>
              ) : null}
            </div>

            <h1 className="mt-8 max-w-5xl font-display text-5xl leading-[0.88] text-brand-gradient drop-shadow-[0_20px_46px_rgba(4,6,10,0.58)] sm:text-6xl lg:text-8xl xl:text-[6.4rem]">
              {currentScene.title}
            </h1>

            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-foreground/82 md:text-lg">
              {currentScene.description}
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link to={currentScene.primaryPath} className="cinematic-hero-cta cinematic-hero-cta-primary">
                {currentScene.primaryCta}
              </Link>
              <Link
                to={currentScene.secondaryPath}
                className="cinematic-hero-cta cinematic-hero-cta-secondary"
              >
                {currentScene.secondaryCta}
              </Link>
            </div>
          </div>
        </div>

        <div ref={controlsRef} className="space-y-4 md:space-y-5">
          <div className="mx-auto flex w-fit items-center gap-3 rounded-full border border-[hsl(var(--brand)/0.18)] bg-[rgba(3,7,12,0.42)] px-3 py-2 backdrop-blur-md">
            <button
              type="button"
              className="cinematic-scene-step"
              onClick={() =>
                setActiveScene((current) => (current - 1 + portalHeroScenes.length) % portalHeroScenes.length)
              }
              aria-label="Cena anterior"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2">
              {portalHeroScenes.map((scene, index) => (
                <button
                  key={scene.id}
                  type="button"
                  data-active={index === activeScene ? "true" : "false"}
                  className="cinematic-scene-step px-3"
                  onClick={() => setActiveScene(index)}
                  aria-label={`Abrir ${scene.sceneLabel}`}
                >
                  {String(index + 1).padStart(2, "0")}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="cinematic-scene-step"
              onClick={() => setActiveScene((current) => (current + 1) % portalHeroScenes.length)}
              aria-label="Próxima cena"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {portalHeroScenes.map((scene, index) => (
              <button
                key={scene.id}
                type="button"
                data-active={index === activeScene ? "true" : "false"}
                className={cn(
                  "cinematic-scene-card group text-left",
                  index === activeScene && "shadow-[0_0_0_1px_hsl(var(--brand)/0.42),0_24px_64px_rgba(0,0,0,0.42)]",
                )}
                onClick={() => setActiveScene(index)}
              >
                <span className="absolute inset-0">
                  <img src={scene.thumbnail} alt="" aria-hidden="true" className="h-full w-full object-cover object-center opacity-72 transition duration-700 group-hover:scale-105" />
                </span>
                <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,10,14,0.06),rgba(6,10,14,0.32)_34%,rgba(4,6,10,0.94)_100%)]" />
                <span className="relative flex min-h-[220px] flex-col justify-between p-5 md:min-h-[250px] md:p-6">
                  <span className="flex items-start justify-between gap-3">
                    <span className="section-kicker">{scene.sceneLabel}</span>
                    <ArrowRight className="h-4 w-4 text-primary/76 transition group-hover:text-primary" />
                  </span>

                  <span className="block">
                    <span className="block font-display text-[1.9rem] leading-[0.94] text-foreground md:text-[2.2rem]">
                      {scene.thumbnailTitle}
                    </span>
                    <span className="mt-3 block text-sm leading-6 text-foreground/72">
                      {scene.thumbnailBody}
                    </span>
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
