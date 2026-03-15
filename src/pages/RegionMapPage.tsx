import {
  ArrowLeft,
  Compass,
  ImagePlus,
  LocateFixed,
  Trash2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {
  type ChangeEvent,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useParams } from "react-router-dom";

import AtlasBreadcrumbs from "@/components/world/AtlasBreadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import {
  WORLD_MAP_DIMENSIONS,
  createWorldRegionBaseImageStorageKey,
  getWorldRegion,
  percentToWorldPosition,
  worldPositionToSvg,
} from "@/lib/world-map";

interface RegionBaseImage {
  name: string;
  src: string;
  opacity: number;
}

interface ViewportState {
  scale: number;
  x: number;
  y: number;
}

interface DragState {
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
}

const SVG_WIDTH = WORLD_MAP_DIMENSIONS.svgWidth;
const SVG_HEIGHT = WORLD_MAP_DIMENSIONS.svgHeight;
const MIN_SCALE = 0.82;
const MAX_SCALE = 3.8;

function clampViewport(viewport: ViewportState, rect: DOMRect) {
  const scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, viewport.scale));
  const scaledWidth = SVG_WIDTH * scale;
  const scaledHeight = SVG_HEIGHT * scale;

  return {
    scale,
    x:
      scaledWidth <= rect.width
        ? (rect.width - scaledWidth) / 2
        : Math.min(0, Math.max(rect.width - scaledWidth, viewport.x)),
    y:
      scaledHeight <= rect.height
        ? (rect.height - scaledHeight) / 2
        : Math.min(0, Math.max(rect.height - scaledHeight, viewport.y)),
  };
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Nao foi possivel ler a imagem da regiao."));
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Formato invalido de imagem regional."));
    };
    reader.readAsDataURL(file);
  });
}

async function optimizeRegionImage(file: File) {
  const src = await readFileAsDataUrl(file);
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const target = new window.Image();
    target.onload = () => resolve(target);
    target.onerror = () => reject(new Error("Nao foi possivel processar a imagem regional."));
    target.src = src;
  });
  const longestSide = Math.max(image.width, image.height);

  if (longestSide <= 1600) {
    return src;
  }

  const scale = 1600 / longestSide;
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (!context) {
    return src;
  }

  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL("image/webp", 0.92);
}

export default function RegionMapPage() {
  const { regionSlug } = useParams();
  const region = regionSlug ? getWorldRegion(regionSlug) : null;
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewport, setViewport] = useState<ViewportState>({ scale: 1, x: 0, y: 0 });
  const viewportRef = useRef(viewport);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [baseImage, setBaseImage] = useState<RegionBaseImage | null>(null);
  const [selectedLandmarkId, setSelectedLandmarkId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    viewportRef.current = viewport;
  }, [viewport]);

  useEffect(() => {
    if (!region || typeof window === "undefined") {
      return;
    }

    try {
      const raw = window.localStorage.getItem(createWorldRegionBaseImageStorageKey(region.slug));

      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw) as unknown;

      if (
        typeof parsed === "object" &&
        parsed !== null &&
        typeof (parsed as Record<string, unknown>).name === "string" &&
        typeof (parsed as Record<string, unknown>).src === "string" &&
        typeof (parsed as Record<string, unknown>).opacity === "number"
      ) {
        setBaseImage({
          name: String((parsed as Record<string, unknown>).name),
          src: String((parsed as Record<string, unknown>).src),
          opacity: Number((parsed as Record<string, unknown>).opacity),
        });
      }
    } catch {
      // Ignore corrupted region image cache.
    }
  }, [region]);

  useEffect(() => {
    if (!region || typeof window === "undefined") {
      return;
    }

    const storageKey = createWorldRegionBaseImageStorageKey(region.slug);

    if (!baseImage) {
      window.localStorage.removeItem(storageKey);
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(baseImage));
  }, [baseImage, region]);

  useEffect(() => {
    if (!region || selectedLandmarkId || region.landmarks.length === 0) {
      return;
    }

    setSelectedLandmarkId(region.landmarks[0].id);
  }, [region, selectedLandmarkId]);

  useEffect(() => {
    const syncViewport = () => {
      if (!containerRef.current) {
        return;
      }

      const rect = containerRef.current.getBoundingClientRect();
      const next = clampViewport(
        {
          scale: Math.min(rect.width / SVG_WIDTH, rect.height / SVG_HEIGHT) * 0.96,
          x: (rect.width - SVG_WIDTH * Math.min(rect.width / SVG_WIDTH, rect.height / SVG_HEIGHT) * 0.96) / 2,
          y: (rect.height - SVG_HEIGHT * Math.min(rect.width / SVG_WIDTH, rect.height / SVG_HEIGHT) * 0.96) / 2,
        },
        rect,
      );

      setViewport((current) =>
        current.scale === 1 && current.x === 0 && current.y === 0 ? next : clampViewport(current, rect),
      );
    };

    syncViewport();
    window.addEventListener("resize", syncViewport);
    return () => window.removeEventListener("resize", syncViewport);
  }, []);

  const fitToRegion = () => {
    if (!containerRef.current) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const scale = Math.max(
      MIN_SCALE,
      Math.min(MAX_SCALE, Math.min(rect.width / SVG_WIDTH, rect.height / SVG_HEIGHT) * 0.96),
    );
    setViewport(clampViewport({
      scale,
      x: (rect.width - SVG_WIDTH * scale) / 2,
      y: (rect.height - SVG_HEIGHT * scale) / 2,
    }, rect));
  };

  const updateViewport = (next: ViewportState) => {
    if (!containerRef.current) {
      return;
    }

    setViewport(clampViewport(next, containerRef.current.getBoundingClientRect()));
  };

  const centerOnLandmark = (xPercent: number, yPercent: number, scale = Math.max(1.2, viewportRef.current.scale)) => {
    if (!containerRef.current) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const point = worldPositionToSvg(percentToWorldPosition(xPercent, yPercent));
    updateViewport({
      scale,
      x: rect.width / 2 - point.x * scale,
      y: rect.height / 2 - point.y * scale,
    });
  };

  const handleWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    event.preventDefault();

    if (!containerRef.current) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const pointerX = event.clientX - rect.left;
    const pointerY = event.clientY - rect.top;
    const factor = event.deltaY > 0 ? 0.92 : 1.08;
    const nextScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, viewportRef.current.scale * factor));
    const svgX = (pointerX - viewportRef.current.x) / viewportRef.current.scale;
    const svgY = (pointerY - viewportRef.current.y) / viewportRef.current.scale;

    updateViewport({
      scale: nextScale,
      x: pointerX - svgX * nextScale,
      y: pointerY - svgY * nextScale,
    });
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }

    const target = event.target as Element;

    if (target.closest("[data-landmark]") || target.closest("[data-map-control]")) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    setDragState({
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: viewportRef.current.x,
      originY: viewportRef.current.y,
    });
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    updateViewport({
      scale: viewportRef.current.scale,
      x: dragState.originX + (event.clientX - dragState.startX),
      y: dragState.originY + (event.clientY - dragState.startY),
    });
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    setDragState(null);
  };

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsUploading(true);

    try {
      const src = await optimizeRegionImage(file);
      setBaseImage({
        name: file.name.replace(/\.[^/.]+$/, ""),
        src,
        opacity: 1,
      });
      toast({
        variant: "success",
        title: "Mapa regional anexado",
        description: "A regiao agora usa sua imagem como base principal.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Falha ao anexar mapa",
        description:
          error instanceof Error ? error.message : "Nao foi possivel usar a imagem regional.",
      });
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const selectedLandmark = useMemo(
    () => region?.landmarks.find((landmark) => landmark.id === selectedLandmarkId) ?? null,
    [region, selectedLandmarkId],
  );

  if (!region) {
    return (
      <div className="container py-20">
        <Card variant="panel">
          <CardContent className="space-y-4 p-8">
            <h1 className="font-heading text-3xl text-foreground">Regiao nao encontrada</h1>
            <p className="text-muted-foreground">
              Essa camada regional ainda nao foi configurada no atlas.
            </p>
            <Button asChild variant="outline">
              <Link to="/mapa">Voltar ao atlas</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-16">
      <div className="space-y-8">
        <AtlasBreadcrumbs
          items={[
            { label: "Continente", to: "/mapa" },
            { label: region.name },
          ]}
        />

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-4">
            <Button asChild variant="ghost" className="pl-0 text-primary">
              <Link to="/mapa">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao atlas do continente
              </Link>
            </Button>
            <div>
              <Badge variant="outline" className="border-primary/30 text-primary">
                Regiao aprofundada
              </Badge>
              <h1 className="mt-4 font-display text-4xl text-gold-gradient md:text-6xl">
                {region.name}
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-8 text-muted-foreground">
                {region.subtitle} {region.summary}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={fitToRegion}>
              <Compass className="mr-2 h-4 w-4" />
              Ajustar regiao
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <ImagePlus className="mr-2 h-4 w-4" />
              {baseImage ? "Trocar mapa" : "Anexar mapa"}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_360px]">
          <Card variant="elevated" className="overflow-hidden">
            <CardContent className="p-0">
              <div
                ref={containerRef}
                className="relative min-h-[620px] overflow-hidden bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.08),transparent_28%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--surface-strong)))]"
                onWheel={handleWheel}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={() => setDragState(null)}
              >
                <svg
                  viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
                  className="absolute left-0 top-0"
                  style={{
                    width: SVG_WIDTH,
                    height: SVG_HEIGHT,
                    transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`,
                    transformOrigin: "0 0",
                  }}
                >
                  {baseImage ? (
                    <image
                      href={baseImage.src}
                      x="0"
                      y="0"
                      width={SVG_WIDTH}
                      height={SVG_HEIGHT}
                      opacity={baseImage.opacity}
                      preserveAspectRatio="none"
                    />
                  ) : (
                    <>
                      <rect
                        x="0"
                        y="0"
                        width={SVG_WIDTH}
                        height={SVG_HEIGHT}
                        fill="hsl(var(--surface-strong))"
                      />
                      <rect
                        x="0"
                        y="0"
                        width={SVG_WIDTH}
                        height={SVG_HEIGHT}
                        fill="url(#regionPlaceholderGlow)"
                      />
                      <defs>
                        <radialGradient id="regionPlaceholderGlow" cx="50%" cy="45%" r="70%">
                          <stop offset="0%" stopColor="hsl(var(--primary) / 0.24)" />
                          <stop offset="100%" stopColor="transparent" />
                        </radialGradient>
                      </defs>
                      <text
                        x={SVG_WIDTH / 2}
                        y={SVG_HEIGHT / 2 - 10}
                        textAnchor="middle"
                        fill="hsl(var(--foreground) / 0.9)"
                        fontSize="42"
                        letterSpacing="0.12em"
                        fontFamily="Cinzel, serif"
                      >
                        {region.name.toUpperCase()}
                      </text>
                      <text
                        x={SVG_WIDTH / 2}
                        y={SVG_HEIGHT / 2 + 32}
                        textAnchor="middle"
                        fill="hsl(var(--muted-foreground))"
                        fontSize="18"
                        letterSpacing="0.14em"
                        fontFamily="Cinzel, serif"
                      >
                        ANEXE O MAPA DETALHADO DA REGIAO
                      </text>
                    </>
                  )}

                  <g opacity="0.22">
                    {Array.from({ length: 9 }).map((_, column) => {
                      const x = (column / 8) * SVG_WIDTH;
                      return (
                        <line
                          key={`region-column-${column}`}
                          x1={x}
                          x2={x}
                          y1="0"
                          y2={SVG_HEIGHT}
                          stroke="hsl(var(--foreground) / 0.44)"
                          strokeWidth="1"
                        />
                      );
                    })}
                    {Array.from({ length: 7 }).map((_, row) => {
                      const y = (row / 6) * SVG_HEIGHT;
                      return (
                        <line
                          key={`region-row-${row}`}
                          x1="0"
                          x2={SVG_WIDTH}
                          y1={y}
                          y2={y}
                          stroke="hsl(var(--foreground) / 0.44)"
                          strokeWidth="1"
                        />
                      );
                    })}
                  </g>

                  {region.landmarks.map((landmark) => {
                    const point = worldPositionToSvg(
                      percentToWorldPosition(landmark.xPercent, landmark.yPercent),
                    );
                    const selected = selectedLandmarkId === landmark.id;

                    return (
                      <g
                        key={landmark.id}
                        data-landmark
                        className="cursor-pointer"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedLandmarkId(landmark.id);
                          centerOnLandmark(landmark.xPercent, landmark.yPercent);
                        }}
                      >
                        <circle
                          cx={point.x}
                          cy={point.y}
                          r={selected ? 14 : 11}
                          fill="hsl(var(--primary))"
                          stroke="hsl(var(--background))"
                          strokeWidth="3"
                        />
                        <circle
                          cx={point.x}
                          cy={point.y}
                          r={selected ? 22 : 18}
                          fill="transparent"
                          stroke="hsl(var(--warning))"
                          strokeWidth="2"
                          strokeDasharray="6 6"
                        />
                        <text
                          x={point.x + 18}
                          y={point.y - 12}
                          fill="hsl(var(--foreground))"
                          fontSize="12"
                          letterSpacing="0.14em"
                          fontFamily="Cinzel, serif"
                        >
                          {landmark.label.toUpperCase()}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-border/70 bg-background/74 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground backdrop-blur">
                  Arraste para navegar e use o zoom para inspecionar a regiao.
                </div>
                <div className="absolute right-4 top-4 flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      updateViewport({
                        ...viewportRef.current,
                        scale: viewportRef.current.scale * 1.16,
                      })
                    }
                    data-map-control
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      updateViewport({
                        ...viewportRef.current,
                        scale: viewportRef.current.scale / 1.16,
                      })
                    }
                    data-map-control
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  {selectedLandmark ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        centerOnLandmark(selectedLandmark.xPercent, selectedLandmark.yPercent)
                      }
                      data-map-control
                    >
                      <LocateFixed className="h-4 w-4" />
                    </Button>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {selectedLandmark ? (
              <Card variant="elevated">
                <CardContent className="space-y-4 p-6">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-primary/80">
                      Marco selecionado
                    </p>
                    <h2 className="mt-2 font-heading text-2xl text-foreground">
                      {selectedLandmark.label}
                    </h2>
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {selectedLandmark.description}
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        centerOnLandmark(
                          selectedLandmark.xPercent,
                          selectedLandmark.yPercent,
                        )
                      }
                    >
                      Centralizar no mapa
                    </Button>
                    <Button asChild className="w-full">
                      <Link to={`/mapa/${region.slug}/${selectedLandmark.id}`}>
                        Abrir mapa local
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            <Card variant="panel">
              <CardContent className="space-y-4 p-6">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-primary/80">
                    Base regional
                  </p>
                  <h2 className="mt-2 font-heading text-2xl text-foreground">
                    Mapa unico da regiao
                  </h2>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={handleUpload}
                />
                <p className="text-sm leading-6 text-muted-foreground">
                  Cada regiao pode ter sua propria arte de mapa. Se ainda nao existir uma imagem
                  pronta, basta anexar aqui e ela vira a base visual dessa camada do atlas.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <ImagePlus className="mr-2 h-4 w-4" />
                    {baseImage ? "Trocar mapa regional" : "Anexar mapa regional"}
                  </Button>
                  {baseImage ? (
                    <Button type="button" variant="outline" onClick={() => setBaseImage(null)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remover imagem
                    </Button>
                  ) : null}
                </div>

                {baseImage ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-muted-foreground">Opacidade da imagem</span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(baseImage.opacity * 100)}%
                      </span>
                    </div>
                    <Slider
                      value={[baseImage.opacity * 100]}
                      min={25}
                      max={100}
                      step={1}
                      onValueChange={([value]) => {
                        if (!value) {
                          return;
                        }

                        setBaseImage((current) =>
                          current ? { ...current, opacity: value / 100 } : current,
                        );
                      }}
                    />
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card variant="panel">
              <CardContent className="p-0">
                <div className="border-b border-border/70 p-6">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-primary/80">
                    Marcos da regiao
                  </p>
                  <h2 className="mt-2 font-heading text-2xl text-foreground">
                    Pontos de aprofundamento
                  </h2>
                </div>
                <ScrollArea className="h-[420px]">
                  <div className="space-y-3 p-6">
                    {region.landmarks.map((landmark) => (
                      <div
                        key={landmark.id}
                        className={cn(
                          "rounded-[var(--radius)] border p-4 transition-colors",
                          selectedLandmarkId === landmark.id
                            ? "border-primary/35 bg-primary/10"
                            : "border-border/70 bg-background/50",
                        )}
                      >
                        <p className="font-heading text-lg text-foreground">{landmark.label}</p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {landmark.description}
                        </p>
                        <div className="mt-4 grid gap-2 sm:grid-cols-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setSelectedLandmarkId(landmark.id);
                              centerOnLandmark(landmark.xPercent, landmark.yPercent);
                            }}
                          >
                            Localizar na regiao
                          </Button>
                          <Button asChild>
                            <Link to={`/mapa/${region.slug}/${landmark.id}`}>
                              Abrir mapa local
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
