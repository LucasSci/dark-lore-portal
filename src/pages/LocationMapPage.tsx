import { Link, useParams } from "react-router-dom";
import { Compass } from "lucide-react";

import AtlasBreadcrumbs from "@/components/world/AtlasBreadcrumbs";
import MapGenieWitcherAtlas from "@/components/world/MapGenieWitcherAtlas";
import RegionalTileAtlas from "@/components/world/RegionalTileAtlas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { resolveAtlasRegionToRegionalMapId } from "@/lib/mapgenie-witcher";

export default function LocationMapPage() {
  const { regionSlug, subRegionSlug, locationSlug } = useParams();
  const regionalMapId = resolveAtlasRegionToRegionalMapId(regionSlug, subRegionSlug, locationSlug);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,hsl(var(--brand)/0.1),transparent_30%)]">
      <div className="container flex min-h-screen flex-col gap-6 py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-4">
            <AtlasBreadcrumbs
              items={[
                { label: "Atlas do Continente", to: "/mapa" },
                { label: regionSlug ?? "Regiao", to: regionSlug ? `/mapa/${regionSlug}` : "/mapa" },
                {
                  label: subRegionSlug ?? "Sub-regiao",
                  to: regionSlug && subRegionSlug ? `/mapa/${regionSlug}/${subRegionSlug}` : "/mapa",
                },
                { label: locationSlug ?? "Local" },
              ]}
            />
            <div className="space-y-3">
              <Badge variant="outline" className="border-primary/30 text-primary">
                {regionalMapId ? "Carta regional" : "Local detalhado"}
              </Badge>
              <h1 className="font-display text-4xl text-gold-gradient md:text-5xl">
                {regionalMapId ? "Mapa regional em alta" : "Mapa local"}
              </h1>
              <p className="max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
                {regionalMapId
                  ? "Locais detalhados agora abrem sobre a carta regional em alta resolucao sempre que existir mapa dedicado para essa area."
                  : "Nesta camada o atlas revela POIs, NPCs, comercio e o link direto para a mesa jogavel."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="border-primary/25 text-primary">
              <Compass className="mr-2 h-3.5 w-3.5" />
              Vista local
            </Badge>
            <Button asChild variant="outline">
              <Link to={regionSlug && subRegionSlug ? `/mapa/${regionSlug}/${subRegionSlug}` : "/mapa"}>
                Voltar um nivel
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex-1">
          {regionalMapId ? (
            <RegionalTileAtlas initialMapId={regionalMapId} immersive />
          ) : (
            <MapGenieWitcherAtlas focus={{ regionSlug, subRegionSlug, locationSlug }} immersive />
          )}
        </div>
      </div>
    </div>
  );
}
