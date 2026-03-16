import { useEffect, useMemo, useState } from "react";
import { ExternalLink, MapPinned, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  getMapGenieWitcherMap,
  mapGenieWitcherMaps,
  searchMapGenieWitcherMaps,
  type MapGenieWitcherMapId,
} from "@/lib/mapgenie-witcher";

interface MapGenieWitcherAtlasProps {
  initialMapId?: MapGenieWitcherMapId;
  compact?: boolean;
  className?: string;
}

export default function MapGenieWitcherAtlas({
  initialMapId = "velen-novigrad",
  compact = false,
  className,
}: MapGenieWitcherAtlasProps) {
  const [query, setQuery] = useState("");
  const [activeMapId, setActiveMapId] = useState<MapGenieWitcherMapId>(initialMapId);

  useEffect(() => {
    setActiveMapId(initialMapId);
  }, [initialMapId]);

  const filteredMaps = useMemo(
    () => searchMapGenieWitcherMaps(query),
    [query],
  );

  const activeMap = getMapGenieWitcherMap(activeMapId);

  return (
    <div
      className={cn(
        "grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]",
        className,
      )}
    >
      <Card variant="panel" className="overflow-hidden">
        <CardContent className="flex h-full flex-col gap-4 p-4 md:p-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-primary/80">
                  Mapas jogaveis
                </p>
                <h2 className="mt-2 font-heading text-xl text-foreground">
                  Hub regional
                </h2>
              </div>
              <Badge variant="outline" className="border-primary/30 text-primary">
                {filteredMaps.length} regioes
              </Badge>
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar mapa ou regiao..."
                className="pl-10"
              />
            </div>
          </div>

          <ScrollArea className={cn("min-h-0 flex-1", compact ? "h-[320px]" : "h-[520px]")}>
            <div className="space-y-3 pr-3">
              {filteredMaps.map((entry) => {
                const isActive = entry.id === activeMapId;

                return (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => setActiveMapId(entry.id)}
                    className={cn(
                      "w-full rounded-[var(--radius)] border p-4 text-left transition-colors",
                      isActive
                        ? "border-primary/35 bg-primary/10"
                        : "border-border/70 bg-background/45 hover:border-primary/25",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-heading text-base text-foreground">{entry.title}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-primary/80">
                          {entry.subtitle}
                        </p>
                      </div>
                      {isActive ? (
                        <Badge variant="secondary" className="bg-secondary/80">
                          Ativo
                        </Badge>
                      ) : null}
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {entry.description}
                    </p>
                  </button>
                );
              })}

              {filteredMaps.length === 0 ? (
                <div className="rounded-[var(--radius)] border border-dashed border-border/70 bg-background/35 p-4 text-sm leading-6 text-muted-foreground">
                  Nenhum mapa corresponde a essa busca. Tente procurar por Velen,
                  Novigrad, Skellige, Toussaint ou Kaer Morhen.
                </div>
              ) : null}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card variant="elevated" className="overflow-hidden">
        <CardContent className="space-y-5 p-4 md:p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPinned className="h-4 w-4 text-primary" />
                <p className="text-[11px] uppercase tracking-[0.22em] text-primary/80">
                  Embed ativo
                </p>
              </div>
              <h2 className="font-display text-3xl text-gold-gradient">
                {activeMap.title}
              </h2>
              <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
                {activeMap.description}
              </p>
            </div>

            <Button asChild variant="outline">
              <a
                href={activeMap.externalUrl}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Abrir no MapGenie
              </a>
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {activeMap.regions.map((region) => (
              <Badge key={region} variant="outline" className="border-primary/20 text-primary/90">
                {region}
              </Badge>
            ))}
          </div>

          <div className="overflow-hidden rounded-[var(--radius)] border border-border/70 bg-background/45">
            <iframe
              key={activeMap.id}
              src={activeMap.iframeSrc}
              title={`Mapa de ${activeMap.title}`}
              className={cn(
                "w-full border-0 bg-background",
                compact ? "h-[440px]" : "h-[70vh] min-h-[560px]",
              )}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
