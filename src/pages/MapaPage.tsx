import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

import AtlasPageShell from "@/components/portal/AtlasPageShell";
import AtlasBreadcrumbs from "@/components/world/AtlasBreadcrumbs";
import MapGenieWitcherAtlas from "@/components/world/MapGenieWitcherAtlas";
import { Button } from "@/components/ui/button";
import { buildAtlasContextModel } from "@/lib/atlas-context";
import { getRegionalMapGenieMaps } from "@/lib/mapgenie-witcher";

export default function MapaPage() {
  const regionalMaps = getRegionalMapGenieMaps();
  const atlasContext = buildAtlasContextModel();

  return (
    <AtlasPageShell
      context={{
        ...atlasContext,
        title: "Cartografia do continente",
        description:
          "Do mundi aos battlemaps, esta carta conduz a travessia por regioes, sub-regioes, locais e frentes de cena.",
      }}
      headerActions={
        <>
          {regionalMaps.slice(0, 4).map((entry) => (
            <Button key={entry.id} asChild size="sm" variant="secondary">
              <Link to={`/mapa/regional/${entry.id}`}>{entry.title}</Link>
            </Button>
          ))}
          <Button asChild size="sm" variant="outline">
            <Link to="/universo">
              <Compass className="h-4 w-4" />
              Abrir dossies
            </Link>
          </Button>
        </>
      }
    >
      <div className="flex-1">
        <MapGenieWitcherAtlas immersive />
      </div>
    </AtlasPageShell>
  );
}
