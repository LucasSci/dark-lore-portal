import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

import AtlasBreadcrumbs from "@/components/world/AtlasBreadcrumbs";
import MapGenieWitcherAtlas from "@/components/world/MapGenieWitcherAtlas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getRegionalMapGenieMaps } from "@/lib/mapgenie-witcher";

export default function MapaPage() {
  const regionalMaps = getRegionalMapGenieMaps();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,hsl(var(--brand)/0.1),transparent_30%)]">
      <div className="container flex min-h-screen flex-col gap-6 py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-4">
            <AtlasBreadcrumbs items={[{ label: "Atlas do Continente" }]} />
            <div className="space-y-3">
              <Badge variant="outline" className="border-primary/30 text-primary">
                Atlas hierarquico
              </Badge>
              <h1 className="font-display text-4xl text-gold-gradient md:text-5xl">
                Cartografia do continente
              </h1>
              <p className="max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
                Explore o mundo em camadas: continente, regioes, sub-regioes, locais e battlemaps jogaveis.
              </p>
              <p className="max-w-3xl text-sm leading-7 text-muted-foreground/90">
                Estrategia de qualidade: use o mundi para leitura geografica macro e abra as cartas regionais quando quiser nitidez total e zoom profundo.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="border-primary/25 text-primary">
              <Compass className="mr-2 h-3.5 w-3.5" />
              Google Maps de RPG
            </Badge>
            <Button asChild variant="outline">
              <Link to="/">Voltar ao portal</Link>
            </Button>
          </div>
        </div>

        <div className="flex-1">
          <MapGenieWitcherAtlas immersive />
        </div>

        <div className="rounded-2xl border border-border/60 bg-background/30 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-primary/80">
                Cartas regionais
              </p>
              <h2 className="mt-2 font-heading text-2xl text-foreground">
                Abrir direto em alta resolucao
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
                Se voce nao quiser passar pelo mundi, estas entradas ja abrem os mapas regionais individualmente.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link to={`/mapa/regional/${regionalMaps[0]?.id ?? "velen-novigrad"}`}>
                Ver cartas regionais
              </Link>
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {regionalMaps.map((entry) => (
              <Button key={entry.id} asChild size="sm" variant="secondary">
                <Link to={`/mapa/regional/${entry.id}`}>{entry.title}</Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
