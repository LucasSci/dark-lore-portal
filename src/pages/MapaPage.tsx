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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,hsl(var(--brand)/0.12),transparent_34%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--background)))]">
      <div className="container flex min-h-screen max-w-[1780px] flex-col gap-5 py-5">
        <div className="flex flex-wrap items-end justify-between gap-4 rounded-3xl border border-border/60 bg-background/35 px-5 py-4 backdrop-blur-xl">
          <div className="space-y-3">
            <AtlasBreadcrumbs items={[{ label: "Atlas do Continente" }]} />
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="outline" className="border-primary/30 text-primary">
                  Atlas hierarquico
                </Badge>
                <Badge variant="outline" className="border-primary/25 text-primary">
                  <Compass className="mr-2 h-3.5 w-3.5" />
                  Inspiracao: mapa narrativo em camadas
                </Badge>
              </div>
              <h1 className="font-display text-4xl text-gold-gradient md:text-5xl">
                Cartografia do continente
              </h1>
              <p className="max-w-4xl text-sm leading-7 text-muted-foreground md:text-base">
                O mapa agora prioriza hierarquia visual, foco por nivel e navegacao progressiva:
                mundo, regiao, sub-regiao, local e battlemap.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {regionalMaps.slice(0, 4).map((entry) => (
              <Button key={entry.id} asChild size="sm" variant="secondary">
                <Link to={`/mapa/regional/${entry.id}`}>{entry.title}</Link>
              </Button>
            ))}
            <Button asChild variant="outline">
              <Link to="/">Voltar ao portal</Link>
            </Button>
          </div>
        </div>

        <div className="flex-1">
          <MapGenieWitcherAtlas immersive />
        </div>
      </div>
    </div>
  );
}
