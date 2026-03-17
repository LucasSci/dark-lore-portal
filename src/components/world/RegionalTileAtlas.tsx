import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import L from "leaflet";
import { Compass, ExternalLink, ImageIcon, Search } from "lucide-react";

import "leaflet/dist/leaflet.css";
import "./leaflet-atlas-overrides.css";

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

const witcherRasterCRS = L.extend({}, L.CRS.Simple, {
  transformation: new L.Transformation(1, 0, 1, 0),
});

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
  const [activeMapId, setActiveMapId] = useState<MapGenieWitcherMapId>(initialMapId);
  const [query, setQuery] = useState("");
  const [isMapReady, setIsMapReady] = useState(false);
  const [tileFallbackActive, setTileFallbackActive] = useState(false);
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

  const activeMap = getMapGenieWitcherMap(activeMapId);
  const hasTiles = activeMap.kind === "tiles" && Boolean(activeMap.tileFolder);
  const overlayMaxZoom = Math.min(activeMap.maxZoom, activeMap.imageNativeZoom ?? activeMap.maxZoom);

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
      zoomDelta: hasTiles ? 0.25 : 0.125,
      zoomSnap: hasTiles ? 0.25 : 0.125,
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

    // Always add the bundled regional image underlay when available.
    // It prevents "blank map" in deploys that don't ship the local tile pack,
    // and tiles (when available) will fade in on top.
    if (activeMap.imagePath) {
      L.imageOverlay(activeMap.imagePath, bounds, {
        opacity: 1,
        className: "atlas-hires-image",
      }).addTo(map);
    }

    if (hasTiles) {
      const tileLayerOptions: L.TileLayerOptions = {
        bounds,
        noWrap: true,
        tms: activeMap.crs !== "simple",
        keepBuffer: 8,
        maxNativeZoom: activeMap.maxZoom,
        detectRetina: true,
        updateWhenIdle: true,
        updateWhenZooming: true,
      };

      if (activeMap.crs === "simple") {
        tileLayerOptions.continuousWorld = true;
      }

      const tileLayer = L.tileLayer(getLocalWitcherTileUrl(activeMap.id), tileLayerOptions);
      tileLayer.setOpacity(0);

      if (activeMap.crs === "simple") {
        tileLayer.getTileUrl = (coords) => {
          const resolvedY = resolveLocalWitcherTileY(activeMap.id, coords.z, coords.y);

          return getLocalWitcherTileUrl(activeMap.id)
            .replace("{z}", String(coords.z))
            .replace("{x}", String(coords.x))
            .replace("{y}", String(resolvedY));
        };
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

        // If tiles are missing on this machine/deploy, keep showing the underlay.
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
  }, [activeMapId]);

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
                      "w-full rounded-xl border p-4 text-left transition-colors",
                      isActive
                        ? "border-primary/35 bg-primary/10"
                        : "border-border/70 bg-background/70 backdrop-blur-md hover:border-primary/25",
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
            </div>
            <Button asChild variant="outline">
              <Link to="/mapa">
                <ExternalLink className="h-4 w-4" />
                Voltar ao atlas
              </Link>
            </Button>
          </div>

          <div className="relative overflow-hidden rounded-[var(--radius)] border border-border/70 bg-[#090806]">
            {!isMapReady ? <AtlasSkeleton immersive={immersive} /> : null}
            <div
              className={cn(
                "w-full bg-[#090806] transition-opacity duration-300",
                isMapReady ? "opacity-100" : "opacity-0",
                immersive ? "h-[calc(100vh-16rem)] min-h-[620px]" : "h-[70vh] min-h-[560px]",
              )}
            >
              {tileFallbackActive ? (
                <div className="absolute left-4 top-4 z-20 max-w-[360px] rounded-xl border border-warning/30 bg-background/80 px-4 py-3 text-sm text-foreground shadow-brand backdrop-blur-md">
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
