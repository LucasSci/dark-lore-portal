import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Compass, MapPinned, Route, ScrollText } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AtlasSkeleton from "@/components/world/AtlasSkeleton";
import { cn } from "@/lib/utils";

const DeferredMapGenieWitcherAtlas = lazy(() => import("@/components/world/MapGenieWitcherAtlas"));

interface ContinentMapProps {
  compact?: boolean;
}

const mapSignals = [
  {
    icon: MapPinned,
    label: "Escala",
    value: "Mundi + regioes",
  },
  {
    icon: Route,
    label: "Leitura",
    value: "Rotas e fronteiras",
  },
  {
    icon: ScrollText,
    label: "Uso",
    value: "Sessao e dossie",
  },
] as const;

export default function ContinentMap({ compact = true }: ContinentMapProps) {
  const atlasPreviewRef = useRef<HTMLDivElement | null>(null);
  const [shouldLoadAtlas, setShouldLoadAtlas] = useState(false);

  useEffect(() => {
    if (shouldLoadAtlas) {
      return;
    }

    const target = atlasPreviewRef.current;

    if (!target) {
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      setShouldLoadAtlas(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoadAtlas(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "320px 0px",
      },
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [shouldLoadAtlas]);

  const atlasSkeletonClasses = cn(
    "atlas-map-frame tool-stage-frame relative overflow-hidden bg-[#090806]",
    compact ? "h-[340px] md:h-[420px] xl:h-[480px]" : "h-[70vh] min-h-[560px]",
  );

  return (
    <section className="space-y-6">
      <div className="continent-map-shell space-y-6 p-6 md:p-8">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl space-y-4">
            <Badge variant="outline" className="border-primary/25 bg-background/30 text-primary">
              <Compass className="mr-2 h-3.5 w-3.5" />
              Cartografia do continente
            </Badge>
            <div className="space-y-3">
              <h2 className="font-display text-4xl leading-[0.94] text-brand-gradient md:text-5xl">
                A carta do continente abre as rotas, fronteiras e descidas para cada camada do mundo.
              </h2>
              <p className="max-w-[66ch] text-base leading-8 text-foreground/78">
                Primeiro vem a geografia ampla; depois, as regioes, estradas, locais e battlemaps
                se revelam sem quebrar o fio da travessia.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button asChild variant="outline" className="backdrop-blur-md">
              <Link to="/mapa">Abrir atlas completo</Link>
            </Button>
            <Button asChild className="backdrop-blur-md">
              <Link to="/universo">Cruzar com o universo</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {mapSignals.map(({ icon: Icon, label, value }) => (
            <div key={label} className="continent-map-stat">
              <div className="icon-slot h-10 w-10 shrink-0">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary/72">
                  {label}
                </p>
                <p className="mt-2 font-display text-2xl leading-none text-foreground">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div ref={atlasPreviewRef}>
        {shouldLoadAtlas ? (
          <Suspense
            fallback={
              <div className={atlasSkeletonClasses}>
                <AtlasSkeleton compact={compact} />
              </div>
            }
          >
            <DeferredMapGenieWitcherAtlas compact={compact} />
          </Suspense>
        ) : (
          <div className={atlasSkeletonClasses}>
            <AtlasSkeleton compact={compact} />
          </div>
        )}
      </div>
    </section>
  );
}
