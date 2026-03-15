import {
  ArrowLeft,
  Compass,
  ImagePlus,
  LocateFixed,
  MapPinned,
  Trash2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {
  type ChangeEvent,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

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
  createWorldLandmarkBaseImageStorageKey,
  getWorldRegionLandmark,
  percentToWorldPosition,
  worldPositionToSvg,
} from "@/lib/world-map";

interface LocationBaseImage {
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
const MIN_SCALE = 0.92;
const MAX_SCALE = 4.4;

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
    reader.onerror = () => reject(new Error("Nao foi possivel ler a imagem do local."));
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Formato invalido de imagem local."));
    };
    reader.readAsDataURL(file);
  });
}

async function optimizeLocationImage(file: File) {
  const src = await readFileAsDataUrl(file);
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const target = new window.Image();
    target.onload = () => resolve(target);
    target.onerror = () => reject(new Error("Nao foi possivel processar a imagem local."));
    target.src = src;
  });
  const longestSide = Math.max(image.width, image.height);

  if (longestSide <= 1800) {
    return src;
  }

  const scale = 1800 / longestSide;
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

export default function LocationMapPage() {
  const { regionSlug, landmarkId } = useParams();
  const navigate = useNavigate();
  const entry =
    regionSlug && landmarkId ? getWorldRegionLandmark(regionSlug, landmarkId) : null;
  const region = entry?.region ?? null;
  const landmark = entry?.landmark ?? null;
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewport, setViewport] = useState<ViewportState>({ scale: 1, x: 0, y: 0 });
  const viewportRef = useRef(viewport);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [baseImage, setBaseImage] = useState<LocationBaseImage | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    viewportRef.current = viewport;
  }, [viewport]);

  useEffect(() => {
    if (!region || !landmark || typeof window === "undefined") {
      return;
    }

    try {
      const raw = window.localStorage.getItem(
        createWorldLandmarkBaseImageStorageKey(region.slug, landmark.id),
      );

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
      // Ignore corrupted local detail map cache.
    }
  }, [landmark, region]);

  useEffect(() => {
    if (!region || !landmark || typeof window === "undefined") {
      return;
    }

    const storageKey = createWorldLandmarkBaseImageStorageKey(region.slug, landmark.id);

    if (!baseImage) {
      window.localStorage.removeItem(storageKey);
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(baseImage));
  }, [baseImage, landmark, region]);

  const updateViewport = (next: ViewportState) => {
    if (!containerRef.current) {
      return;
    }

    setViewport(clampViewport(next, containerRef.current.getBoundingClientRect()));
  };

  const centerOnLandmark = (scale = Math.max(1.38, viewportRef.current.scale)) => {
    if (!containerRef.current || !landmark) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const point = worldPositionToSvg(
      percentToWorldPosition(landmark.xPercent, landmark.yPercent),
    );

    updateViewport({
      scale,
      x: rect.width / 2 - point.x * scale,
      y: rect.height / 2 - point.y * scale,
    });
  };

  useEffect(() => {
    const syncViewport = () => {
      if (!containerRef.current) {
        return;
      }

      const rect = containerRef.current.getBoundingClientRect();
      const scale = Math.max(
        MIN_SCALE,
        Math.min(MAX_SCALE, Math.min(rect.width / SVG_WIDTH, rect.height / SVG_HEIGHT) * 1.06),
      );

      if (landmark && viewportRef.current.scale === 1 && viewportRef.current.x === 0) {
        const point = worldPositionToSvg(
          percentToWorldPosition(landmark.xPercent, landmark.yPercent),
        );
        const next = clampViewport(
          {
            scale,
            x: rect.width / 2 - point.x * scale,
            y: rect.height / 2 - point.y * scale,
          },
          rect,
        );
        setViewport(next);
        return;
      }

      setViewport((current) => clampViewport(current, rect));
    };

    syncViewport();
    window.addEventListener("resize", syncViewport);
    return () => window.removeEventListener("resize", syncViewport);
  }, [landmark]);

  const fitToLocation = () => {
    if (!containerRef.current) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const scale = Math.max(
      MIN_SCALE,
      Math.min(MAX_SCALE, Math.min(rect.width / SVG_WIDTH, rect.height / SVG_HEIGHT) * 1.02),
    );
    setViewport(
      clampViewport(
        {
          scale,
          x: (rect.width - SVG_WIDTH * scale) / 2,
          y: (rect.height - SVG_HEIGHT * scale) / 2,
        },
        rect,
      ),
    );
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
    const nextScale = Math.max(
      MIN_SCALE,
      Math.min(MAX_SCALE, viewportRef.current.scale * factor),
    );
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
      const src = await optimizeLocationImage(file);
      setBaseImage({
        name: file.name.replace(/\.[^/.]+$/, ""),
        src,
        opacity: 1,
      });
      toast({
        variant: "success",
        title: "Mapa local anexado",
        description: "Este ponto agora tem uma camada propria dentro da regiao.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Falha ao anexar mapa local",
        description:
          error instanceof Error
            ? error.message
            : "Nao foi possivel usar a imagem local.",
      });
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  if (!region || !landmark) {
    return (
      <div className="container py-20">
        <Card variant="panel">
          <CardContent className="space-y-4 p-8">
            <h1 className="font-heading text-3xl text-foreground">Local nao encontrado</h1>
            <p className="text-muted-foreground">
              Esse nivel local ainda nao foi configurado no atlas.
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
            { label: region.name, to: `/mapa/${region.slug}` },
            { label: landmark.label },
          ]}
        />

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-4">
            <Button asChild variant="ghost" className="pl-0 text-primary">
              <Link to={`/mapa/${region.slug}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao mapa regional
              </Link>
            </Button>
            <div>
              <Badge variant="outline" className="border-primary/30 text-primary">
                Mapa local
              </Badge>
              <h1 className="mt-4 font-display text-4xl text-gold-gradient md:text-6xl">
                {landmark.label}
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-8 text-muted-foreground">
                {landmark.description} Esta e a camada mais proxima do atlas, pensada para
                ruas, ruinas, enclaves, vales e pontos de sessao dentro de {region.name}.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={fitToLocation}>
              <Compass className="mr-2 h-4 w-4" />
              Ajustar local
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <ImagePlus className="mr-2 h-4 w-4" />
              {baseImage ? "Trocar imagem local" : "Anexar imagem local"}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_360px]">
          <Card variant="elevated" className="overflow-hidden">
            <CardContent className="p-0">
              <div
                ref={containerRef}
                className="relative min-h-[640px] overflow-hidden bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.1),transparent_26%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--surface-strong)))]"
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
                        fill="url(#locationPlaceholderGlow)"
                      />
                      <defs>
                        <radialGradient id="locationPlaceholderGlow" cx="50%" cy="45%" r="72%">
                          <stop offset="0%" stopColor="hsl(var(--warning) / 0.22)" />
                          <stop offset="100%" stopColor="transparent" />
                        </radialGradient>
                      </defs>
                      <text
                        x={SVG_WIDTH / 2}
                        y={SVG_HEIGHT / 2 - 10}
                        textAnchor="middle"
                        fill="hsl(var(--foreground) / 0.92)"
                        fontSize="40"
                        letterSpacing="0.12em"
                        fontFamily="Cinzel, serif"
                      >
                        {landmark.label.toUpperCase()}
                      </text>
                      <text
                        x={SVG_WIDTH / 2}
                        y={SVG_HEIGHT / 2 + 28}
                        textAnchor="middle"
                        fill="hsl(var(--muted-foreground))"
                        fontSize="16"
                        letterSpacing="0.14em"
                        fontFamily="Cinzel, serif"
                      >
                        ANEXE O MAPA DETALHADO DESTE PONTO
                      </text>
                    </>
                  )}

                  <g opacity="0.18">
                    {Array.from({ length: 11 }).map((_, column) => {
                      const x = (column / 10) * SVG_WIDTH;
                      return (
                        <line
                          key={`location-column-${column}`}
                          x1={x}
                          x2={x}
                          y1="0"
                          y2={SVG_HEIGHT}
                          stroke="hsl(var(--foreground) / 0.34)"
                          strokeWidth="1"
                        />
                      );
                    })}
                    {Array.from({ length: 8 }).map((_, row) => {
                      const y = (row / 7) * SVG_HEIGHT;
                      return (
                        <line
                          key={`location-row-${row}`}
                          x1="0"
                          x2={SVG_WIDTH}
                          y1={y}
                          y2={y}
                          stroke="hsl(var(--foreground) / 0.34)"
                          strokeWidth="1"
                        />
                      );
                    })}
                  </g>

                  {region.landmarks.map((entry) => {
                    const point = worldPositionToSvg(
                      percentToWorldPosition(entry.xPercent, entry.yPercent),
                    );
                    const isCurrent = entry.id === landmark.id;

                    return (
                      <g
                        key={entry.id}
                        data-landmark
                        className="cursor-pointer"
                        onClick={(event) => {
                          event.stopPropagation();
                          if (isCurrent) {
                            centerOnLandmark();
                            return;
                          }

                          navigate(`/mapa/${region.slug}/${entry.id}`);
                        }}
                      >
                        <circle
                          cx={point.x}
                          cy={point.y}
                          r={isCurrent ? 15 : 10}
                          fill={isCurrent ? "hsl(var(--primary))" : "hsl(var(--foreground) / 0.7)"}
                          stroke="hsl(var(--background))"
                          strokeWidth="3"
                        />
                        <circle
                          cx={point.x}
                          cy={point.y}
                          r={isCurrent ? 24 : 17}
                          fill="transparent"
                          stroke={isCurrent ? "hsl(var(--warning))" : "hsl(var(--muted-foreground) / 0.6)"}
                          strokeWidth="2"
                          strokeDasharray="6 6"
                        />
                        <text
                          x={point.x + 18}
                          y={point.y - 12}
                          fill={isCurrent ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))"}
                          fontSize="12"
                          letterSpacing="0.14em"
                          fontFamily="Cinzel, serif"
                        >
                          {entry.label.toUpperCase()}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-border/70 bg-background/74 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground backdrop-blur">
                  Arraste, aproxime e troque de ponto para aprofundar a regiao.
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
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => centerOnLandmark()}
                    data-map-control
                  >
                    <LocateFixed className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card variant="elevated">
              <CardContent className="space-y-4 p-6">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-primary/80">
                    Ponto ativo
                  </p>
                  <h2 className="mt-2 font-heading text-2xl text-foreground">
                    {landmark.label}
                  </h2>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  {landmark.description}
                </p>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <div className="rounded-[var(--radius)] border border-border/70 bg-background/55 p-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      Regiao mae
                    </p>
                    <p className="mt-2 font-heading text-base text-foreground">{region.name}</p>
                  </div>
                  <div className="rounded-[var(--radius)] border border-border/70 bg-background/55 p-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      Coordenada regional
                    </p>
                    <p className="mt-2 font-heading text-base text-foreground">
                      {Math.round(landmark.xPercent)} / {Math.round(landmark.yPercent)}
                    </p>
                  </div>
                </div>
                <Button asChild variant="outline" className="w-full">
                  <Link to={`/mapa/${region.slug}`}>Voltar para {region.name}</Link>
                </Button>
              </CardContent>
            </Card>

            <Card variant="panel">
              <CardContent className="space-y-4 p-6">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-primary/80">
                    Base local
                  </p>
                  <h2 className="mt-2 font-heading text-2xl text-foreground">
                    Imagem deste ponto
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
                  Use esta camada para anexar a arte do local especifico: bairro, cidade,
                  ruina, vale ou complexo que sera explorado de perto.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <ImagePlus className="mr-2 h-4 w-4" />
                    {baseImage ? "Trocar imagem" : "Anexar imagem"}
                  </Button>
                  {baseImage ? (
                    <Button type="button" variant="outline" onClick={() => setBaseImage(null)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remover
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
                  <div className="flex items-center gap-3">
                    <MapPinned className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-primary/80">
                        Rede local
                      </p>
                      <h2 className="mt-2 font-heading text-2xl text-foreground">
                        Outros pontos desta regiao
                      </h2>
                    </div>
                  </div>
                </div>
                <ScrollArea className="h-[380px]">
                  <div className="space-y-3 p-6">
                    {region.landmarks.map((entry) => (
                      <div
                        key={entry.id}
                        className={cn(
                          "rounded-[var(--radius)] border p-4 transition-colors",
                          entry.id === landmark.id
                            ? "border-primary/35 bg-primary/10"
                            : "border-border/70 bg-background/50",
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-heading text-lg text-foreground">{entry.label}</p>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                              {entry.description}
                            </p>
                          </div>
                          <Badge variant={entry.id === landmark.id ? "default" : "outline"}>
                            {entry.id === landmark.id ? "ativo" : "vizinho"}
                          </Badge>
                        </div>
                        {entry.id !== landmark.id ? (
                          <Button
                            type="button"
                            variant="outline"
                            className="mt-4 w-full"
                            onClick={() => navigate(`/mapa/${region.slug}/${entry.id}`)}
                          >
                            Abrir este ponto
                          </Button>
                        ) : null}
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
