import { Link, useParams } from "react-router-dom";
import { Compass } from "lucide-react";

import AtlasPageShell from "@/components/portal/AtlasPageShell";
import MapGenieWitcherAtlas from "@/components/world/MapGenieWitcherAtlas";
import RegionalTileAtlas from "@/components/world/RegionalTileAtlas";
import { Button } from "@/components/ui/button";
import { buildAtlasContextModel } from "@/lib/atlas-context";
import { resolveAtlasRegionToRegionalMapId } from "@/lib/mapgenie-witcher";

export default function SubRegionMapPage() {
  const { regionSlug, subRegionSlug } = useParams();
  const regionalMapId = resolveAtlasRegionToRegionalMapId(regionSlug, subRegionSlug);
  const atlasContext = buildAtlasContextModel({ regionSlug, subRegionSlug });

  return (
    <AtlasPageShell
      context={{
        ...atlasContext,
        title: regionalMapId ? "Mapa regional em alta" : atlasContext.title,
        description: regionalMapId
          ? "A sub-regiao usa a carta regional em alta resolucao da area correspondente para manter a leitura nitida."
          : "Aprofunde o territorio e veja estradas, rios, florestas, settlements e locais detalhados.",
      }}
      headerActions={
        <>
          <Button asChild size="sm" variant="outline">
            <Link to={regionSlug ? `/mapa/${regionSlug}` : "/mapa"}>
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
          <MapGenieWitcherAtlas focus={{ regionSlug, subRegionSlug }} immersive />
        )}
      </div>
    </AtlasPageShell>
  );
}
