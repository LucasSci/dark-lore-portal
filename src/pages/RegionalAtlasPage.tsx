import { Link, useParams } from "react-router-dom";
import { Compass } from "lucide-react";

import AtlasBreadcrumbs from "@/components/world/AtlasBreadcrumbs";
import RegionalTileAtlas from "@/components/world/RegionalTileAtlas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getRegionalMapGenieMaps,
  type MapGenieWitcherMapId,
} from "@/lib/mapgenie-witcher";

function isRegionalMapId(value?: string): value is MapGenieWitcherMapId {
  return getRegionalMapGenieMaps().some((entry) => entry.id === value);
}

export default function RegionalAtlasPage() {
  const { mapId } = useParams();
  const initialMapId = isRegionalMapId(mapId) ? mapId : "velen-novigrad";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,hsl(var(--brand)/0.1),transparent_30%)]">
      <div className="container flex min-h-screen flex-col gap-6 py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-4">
            <AtlasBreadcrumbs
              items={[
                { label: "Atlas do Continente", to: "/mapa" },
                { label: "Cartas regionais" },
              ]}
            />
            <div className="space-y-3">
              <Badge variant="outline" className="border-primary/30 text-primary">
                Alta resolucao regional
              </Badge>
              <h1 className="font-display text-4xl text-gold-gradient md:text-5xl">
                Cartas regionais em detalhe
              </h1>
              <p className="max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
                Este modo evita depender do mundi e abre diretamente os mapas regionais em maior nitidez.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="border-primary/25 text-primary">
              <Compass className="mr-2 h-3.5 w-3.5" />
              Qualidade maxima
            </Badge>
            <Button asChild variant="outline">
              <Link to="/mapa">Voltar ao atlas</Link>
            </Button>
          </div>
        </div>

        <div className="flex-1">
          <RegionalTileAtlas initialMapId={initialMapId} immersive />
        </div>
      </div>
    </div>
  );
}
