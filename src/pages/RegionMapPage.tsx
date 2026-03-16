import { useParams } from "react-router-dom";

import AtlasBreadcrumbs from "@/components/world/AtlasBreadcrumbs";
import MapGenieWitcherAtlas from "@/components/world/MapGenieWitcherAtlas";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { resolveMapGenieWitcherMapId } from "@/lib/mapgenie-witcher";

export default function RegionMapPage() {
  const { regionSlug } = useParams();
  const initialMapId = resolveMapGenieWitcherMapId(regionSlug);

  return (
    <div className="container py-16">
      <div className="space-y-8">
        <AtlasBreadcrumbs
          items={[
            { label: "Atlas do Continente", to: "/mapa" },
            { label: regionSlug ?? "Regiao" },
          ]}
        />

        <div className="space-y-4">
          <Badge variant="outline" className="border-primary/30 text-primary">
            Regiao selecionada
          </Badge>
          <h1 className="font-display text-4xl text-gold-gradient md:text-6xl">
            Mapa regional
          </h1>
          <p className="max-w-4xl text-base leading-8 text-muted-foreground">
            Esta subrota usa o mesmo hub de embeds do MapGenie. Se houver um mapa
            correspondente para a regiao pedida, ele ja abre focado ali.
          </p>
        </div>

        <Card variant="panel">
          <CardContent className="p-6">
            <MapGenieWitcherAtlas initialMapId={initialMapId} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
