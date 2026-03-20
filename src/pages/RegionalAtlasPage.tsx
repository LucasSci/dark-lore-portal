import { Link, useParams } from "react-router-dom";
import { Compass } from "lucide-react";

import AtlasPageShell from "@/components/portal/AtlasPageShell";
import RegionalTileAtlas from "@/components/world/RegionalTileAtlas";
import { Button } from "@/components/ui/button";
import { buildAtlasContextModel } from "@/lib/atlas-context";
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
  const atlasContext = buildAtlasContextModel();

  return (
    <AtlasPageShell
      context={{
        ...atlasContext,
        eyebrow: "Alta resolucao regional",
        title: "Cartas regionais em detalhe",
        description:
          "Este modo evita depender do mundi e abre diretamente os mapas regionais em maior nitidez.",
      }}
      headerActions={
        <Button asChild size="sm" variant="outline">
          <Link to="/mapa">
            <Compass className="h-4 w-4" />
            Voltar ao atlas
          </Link>
        </Button>
      }
    >
      <div className="flex-1">
        <RegionalTileAtlas initialMapId={initialMapId} immersive />
      </div>
    </AtlasPageShell>
  );
}
