import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import L from "leaflet";
import { Compass, ExternalLink, ImageIcon, Search } from "lucide-react";

import "leaflet/dist/leaflet.css";
import "./leaflet-atlas-overrides.css";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import AtlasSkeleton from "@/components/world/AtlasSkeleton";
import {
  getLocalWitcherTileUrl,
  getMapGenieWitcherMap,
  getRegionalMapGenieMaps,
  resolveLocalWitcherTileY,
  type MapGenieWitcherMapId,
} from "@/lib/mapgenie-witcher";

const LEAFLET_TILE_SIZE_PX = 256;

const witcherRasterCRS = L.extend({}, L.CRS.Simple, {
  transformation: new L.Transformation(1, 0, 1, 0),
});

type TileLayerWithCreateTile = L.TileLayer & {
  createTile: (coords: L.Coords, done: L.DoneCallback) => HTMLElement;
};

const baseTileFactory = (L.TileLayer.prototype as unknown as TileLayerWithCreateTile).createTile;

interface RegionalTileAtlasProps {
  initialMapId?: MapGenieWitcherMapId;
  immersive?: boolean;
  className?: string;
}

export default function RegionalTileAtlas({
  initialMapId = "velen-novigrad",
  immersive = false,
  className,
}: RegionalTileAtlasProps) {
  const location = useLocation();
  const [activeMapId, setActiveMapId] = useState<MapGenieWitcherMapId>(initialMapId);
  const [query, setQuery] = useState("");
  const [isMapReady, setIsMapReady] = useState(false);
  const [tileFallbackActive, setTileFallbackActive] = useState(false);
  const [debugTilesEvents, setDebugTilesEvents] = useState<string[]>([]);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  const maps = useMemo(() => getRegionalMapGenieMaps(), []);
  const filteredMaps = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return maps;
    }

    return maps.filter((entry) =>
      `${entry.title} ${entry.subtitle} ${entry.description} ${entry.aliases.join(" ")}`
        .toLowerCase()
        .includes(normalized),
    );
  }, [maps, query]);

  const activeMap = useMemo(() => getMapGenieWitcherMap(activeMapId), [activeMapId]);
  const hasTiles = activeMap.kind === "tiles" && Boolean(activeMap.tileFolder);
  const overlayMaxZoom = Math.min(activeMap.maxZoom, activeMap.imageNativeZoom ?? activeMap.maxZoom);
  const debugTiles = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("debugTiles") === "1";
  }, [location.search]);

  useEffect(() => {
    setActiveMapId(initialMapId);
  }, [initialMapId]);

  useEffect(() => {
    const host = hostRef.current;

    if (!host) {
      return;
    }

    setIsMapReady(false);
    setTileFallbackActive(false);
    setDebugTilesEvents([]);
    host.innerHTML = "";

    const bounds = L.latLngBounds(activeMap.southWest, activeMap.northEast);
    const map = L.map(host, {
      attributionControl: false,
      center: activeMap.center,
      crs: activeMap.crs === "simple" ? witcherRasterCRS : L.CRS.EPSG3857,
      maxZoom: hasTiles ? activeMap.maxZoom : overlayMaxZoom,
      minZoom: hasTiles ? 2 : 1,
      zoom: activeMap.initialZoom,
      zoomControl: false,
      // Fractional zoom looks smoother but it scales raster tiles, which makes the atlas blurry and can
      // amplify host CSS issues (leading to "striped" artifacts). Keep tile maps on integer zooms.
      zoomDelta: hasTiles ? 1 : 0.125,
      zoomSnap: hasTiles ? 1 : 0.125,
      zoomAnimation: true,
      fadeAnimation: true,
      markerZoomAnimation: true,
      inertia: true,
      inertiaDeceleration: 2200,
      easeLinearity: 0.18,
      wheelDebounceTime: 18,
      wheelPxPerZoomLevel: hasTiles ? 140 : 180,
      maxBoundsViscosity: 0.88,
    });

    // Keep static image overlays only for image-based maps.
    // Tile maps should render from the real tile pyramid alone; otherwise transparent tile areas
    // can reveal a misaligned fallback image beneath and create horizontal "banding".
    if (!hasTiles && activeMap.imagePath) {
      L.imageOverlay(activeMap.imagePath, bounds, {
        opacity: 1,
        className: "atlas-hires-image",
      }).addTo(map);
    }

    if (hasTiles) {
      const tileLayerOptions: L.TileLayerOptions = {
        bounds,
        noWrap: true,
        tileSize: LEAFLET_TILE_SIZE_PX,
        className: debugTiles ? "atlas-debug-tiles" : undefined,
        tms: activeMap.usesTms ?? true,
        keepBuffer: 8,
        maxNativeZoom: activeMap.maxZoom,
        // Our tile packs are already "baked" at 256px; Leaflet's retina mode can shift zoom math and cause artifacts.
        detectRetina: false,
        updateWhenIdle: true,
        updateWhenZooming: true,
      };

      if (activeMap.continuousWorld) {
        tileLayerOptions.continuousWorld = true;
      }

      const tileLayer = L.tileLayer(getLocalWitcherTileUrl(activeMap.id), tileLayerOptions);
      // Some hosted previews inject aggressive global styles like `img { width: 100% !important; height: auto !important; }`.
      // Enforce Leaflet's expected tile box sizing on each tile element to prevent "striped" rendering.
      const fixedTileLayer = tileLayer as TileLayerWithCreateTile;
      fixedTileLayer.createTile = function createTileWithFixedSize(coords, done) {
        const tile = baseTileFactory.call(this, coords, done) as HTMLImageElement;
        if (tile?.style) {
          tile.style.setProperty("width", `${LEAFLET_TILE_SIZE_PX}px`, "important");
          tile.style.setProperty("height", `${LEAFLET_TILE_SIZE_PX}px`, "important");
          tile.style.setProperty("max-width", "none", "important");
          tile.style.setProperty("max-height", "none", "important");
        }
        return tile;
      };
      tileLayer.setOpacity(0);

      if (activeMap.crs === "simple" && activeMap.tileRowsByZoom) {
        tileLayer.getTileUrl = (coords) =>
          getLocalWitcherTileUrl(activeMap.id)
            .replace("{z}", String(coords.z))
            .replace("{x}", String(coords.x))
            .replace("{y}", String(resolveLocalWitcherTileY(activeMap.id, coords.z, coords.y)));
      }

      if (debugTiles) {
        const pushEvent = (label: string) => {
          setDebugTilesEvents((current) => {
            const next = [label, ...current];
            return next.length > 14 ? next.slice(0, 14) : next;
          });
        };

        tileLayer.on("tileloadstart", (event: L.TileEvent) => {
          const { z, x, y } = event.coords;
          pushEvent(`loadstart z${z} x${x} y${y}`);
        });

        tileLayer.on("tileload", (event: L.TileEvent) => {
          const { z, x, y } = event.coords;
          const tile = event.tile;
          const rect = tile?.getBoundingClientRect();

          if (
            rect &&
            (Math.round(rect.width) !== LEAFLET_TILE_SIZE_PX ||
              Math.round(rect.height) !== LEAFLET_TILE_SIZE_PX)
          ) {
            pushEvent(
              `SIZE MISMATCH ${Math.round(rect.width)}x${Math.round(rect.height)} z${z} x${x} y${y}`,
            );
            console.warn("[atlas tiles] tile size mismatch", {
              mapId: activeMap.id,
              z,
              x,
              y,
              rect,
              style: tile.style.cssText,
            });
          } else {
            pushEvent(`load z${z} x${x} y${y}`);
          }
        });

        tileLayer.on("tileerror", (event: L.TileErrorEvent) => {
          const { z, x, y } = event.coords;
          pushEvent(`ERROR z${z} x${x} y${y}`);
        });
      }

      tileLayer.on("load", () => {
        // Fade in once at least one wave of tiles has loaded.
        tileLayer.setOpacity(1);
      });

      let tileErrors = 0;
      tileLayer.on("tileerror", () => {
        tileErrors += 1;
        if (tileErrors < 3) {
          return;
        }

        if (activeMap.imagePath) {
          L.imageOverlay(activeMap.imagePath, bounds, {
            opacity: 1,
            className: "atlas-hires-image",
          }).addTo(map);
        }

        // If tiles are missing on this machine/deploy, switch to the static fallback.
        setTileFallbackActive(Boolean(activeMap.imagePath));
      });

      tileLayer.addTo(map);
    }

    L.control.zoom({ position: "topright" }).addTo(map);
    map.fitBounds(bounds, { animate: false, padding: [24, 24] });
    map.setMaxBounds(bounds.pad(0.04));
    map.whenReady(() => {
      map.invalidateSize();
      window.requestAnimationFrame(() => setIsMapReady(true));
    });
    mapRef.current = map;

    const resizeObserver = new ResizeObserver(() => map.invalidateSize());
    resizeObserver.observe(host);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, [activeMap, debugTiles, hasTiles, overlayMaxZoom]);

  return (
    <div className={cn("grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]", className)}>
      <Card variant="panel" className="overflow-hidden backdrop-blur-md">
        <CardContent className="flex h-full flex-col gap-4 p-4 md:p-5">
          <div className="space-y-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-primary/80">
                Alta resolucao
              </p>
              <h2 className="mt-2 font-heading text-xl text-foreground">
                Cartas regionais
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Use estas cartas quando quiser qualidade maxima. Elas abrem direto no recorte regional, sem passar pelo mundi.
              </p>
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar carta regional..."
                className="pl-10"
              />
            </div>
          </div>

          <ScrollArea className={cn("min-h-0 flex-1 pr-3", immersive ? "h-[calc(100vh-16rem)]" : "h-[560px]")}>
            <div className="space-y-3">
              {filteredMaps.map((entry) => {
                const isActive = entry.id === activeMapId;

                return (
                    <button
                      key={entry.id}
                    type="button"
                    onClick={() => setActiveMapId(entry.id)}
                    className={cn(
                      "w-full border p-4 text-left transition-colors",
                      isActive
                        ? "border-primary/35 bg-primary/10"
                        : "info-panel backdrop-blur-md hover:border-primary/25",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-heading text-base text-foreground">{entry.title}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-primary/80">
                          {entry.subtitle}
                        </p>
                      </div>
                      <ImageIcon className="h-4 w-4 text-primary/80" />
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {entry.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card variant="elevated" className="overflow-hidden">
        <CardContent className="space-y-5 p-4 md:p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-primary" />
                <p className="text-[11px] uppercase tracking-[0.22em] text-primary/80">
                  Carta em foco
                </p>
              </div>
              <h2 className="font-display text-3xl text-gold-gradient">{activeMap.title}</h2>
              <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
                {activeMap.description}
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Badge variant="outline" className="border-primary/30 text-primary">
                  {activeMap.crs === "geo" ? "CRS geográfico" : "CRS raster"}
                </Badge>
                <Badge variant="outline" className="border-primary/25 text-primary/90">
                  {activeMap.usesTms ?? true ? "Tiles TMS" : "Tiles XYZ"}
                </Badge>
                <Badge variant="outline" className="border-primary/20 text-primary/80">
                  Zoom inteiro
                </Badge>
                <Badge variant="outline" className="border-border/70 text-muted-foreground">
                  Max zoom {activeMap.maxZoom}
                </Badge>
              </div>
            </div>
            <Button asChild variant="outline">
              <Link to="/mapa">
                <ExternalLink className="h-4 w-4" />
                Voltar ao atlas
              </Link>
            </Button>
          </div>

          <div className="tool-stage-frame relative overflow-hidden bg-[#090806]">
            {!isMapReady ? <AtlasSkeleton immersive={immersive} /> : null}
            <div
              className={cn(
                "w-full bg-[#090806] transition-opacity duration-300",
                isMapReady ? "opacity-100" : "opacity-0",
                immersive ? "h-[calc(100vh-16rem)] min-h-[620px]" : "h-[70vh] min-h-[560px]",
              )}
            >
              {debugTiles ? (
                <div className="field-note absolute right-4 top-14 z-30 w-[360px] p-3 text-xs text-foreground shadow-brand backdrop-blur-md">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-primary/80">
                    Debug Tiles (local)
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    {activeMap.id} | crs={activeMap.crs} | maxZoom={activeMap.maxZoom} | tileSize={LEAFLET_TILE_SIZE_PX}
                  </p>
                  <div className="mt-2 space-y-1 font-mono text-[11px]">
                    {debugTilesEvents.length ? (
                      debugTilesEvents.map((line) => <div key={line}>{line}</div>)
                    ) : (
                      <div className="text-muted-foreground">Aguardando eventos...</div>
                    )}
                  </div>
                </div>
              ) : null}
              {tileFallbackActive ? (
                <div className="field-note absolute left-4 top-4 z-20 max-w-[360px] border-warning/30 px-4 py-3 text-sm text-foreground shadow-brand backdrop-blur-md">
                  Tiles nao encontrados. Usando carta regional compacta como fallback.
                </div>
              ) : null}
              <div ref={hostRef} className="h-full w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
