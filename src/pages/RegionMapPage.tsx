import { Link, useParams } from "react-router-dom";
import { Compass } from "lucide-react";

import AtlasPageShell from "@/components/portal/AtlasPageShell";
import MapGenieWitcherAtlas from "@/components/world/MapGenieWitcherAtlas";
import RegionalTileAtlas from "@/components/world/RegionalTileAtlas";
import { Button } from "@/components/ui/button";
import { buildAtlasContextModel } from "@/lib/atlas-context";
import { resolveAtlasRegionToRegionalMapId } from "@/lib/mapgenie-witcher";

export default function RegionMapPage() {
  const { regionSlug } = useParams();
  const regionalMapId = resolveAtlasRegionToRegionalMapId(regionSlug);
  const atlasContext = buildAtlasContextModel({ regionSlug });

  return (
    <AtlasPageShell
      context={{
        ...atlasContext,
        title: regionalMapId ? "Mapa regional em alta" : atlasContext.title,
        description: regionalMapId
          ? "Esta rota agora abre diretamente a carta regional em alta resolucao, para evitar o borrado do mundi ao aproximar."
          : "Esta camada mostra as sub-regioes, estradas, rios e assentamentos do territorio em foco.",
      }}
      headerActions={
        <>
          <Button asChild size="sm" variant="outline">
            <Link to="/mapa">
              <Compass className="h-4 w-4" />
              Voltar ao atlas
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
          <MapGenieWitcherAtlas focus={{ regionSlug }} immersive />
        )}
      </div>
    </AtlasPageShell>
  );
}
