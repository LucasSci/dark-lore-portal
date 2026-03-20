import { Link, useParams } from "react-router-dom";
import { Compass } from "lucide-react";

import AtlasPageShell from "@/components/portal/AtlasPageShell";
import MapGenieWitcherAtlas from "@/components/world/MapGenieWitcherAtlas";
import RegionalTileAtlas from "@/components/world/RegionalTileAtlas";
import { Button } from "@/components/ui/button";
import { buildAtlasContextModel } from "@/lib/atlas-context";
import { resolveAtlasRegionToRegionalMapId } from "@/lib/mapgenie-witcher";

export default function LocationMapPage() {
  const { regionSlug, subRegionSlug, locationSlug } = useParams();
  const regionalMapId = resolveAtlasRegionToRegionalMapId(regionSlug, subRegionSlug, locationSlug);
  const atlasContext = buildAtlasContextModel({ regionSlug, subRegionSlug, locationSlug });

  return (
    <AtlasPageShell
      context={{
        ...atlasContext,
        title: regionalMapId ? "Mapa regional em alta" : atlasContext.title,
        description: regionalMapId
          ? "Locais detalhados agora abrem sobre a carta regional em alta resolucao sempre que existir mapa dedicado para essa area."
          : "Nesta camada o atlas revela POIs, NPCs, comercio e o link direto para a mesa jogavel.",
      }}
      headerActions={
        <>
          <Button asChild size="sm" variant="outline">
            <Link to={regionSlug && subRegionSlug ? `/mapa/${regionSlug}/${subRegionSlug}` : "/mapa"}>
              <Compass className="h-4 w-4" />
              Voltar um nivel
            </Link>
          </Button>
          {regionalMapId ? (
            <Button asChild size="sm" variant="secondary">
              <Link to={`/mapa/regional/${regionalMapId}`}>Carta regional</Link>
            </Button>
          ) : null}
        </>
      }
    >
      <div className="flex-1">
        {regionalMapId ? (
          <RegionalTileAtlas initialMapId={regionalMapId} immersive />
        ) : (
          <MapGenieWitcherAtlas focus={{ regionSlug, subRegionSlug, locationSlug }} immersive />
        )}
      </div>
    </AtlasPageShell>
  );
}
