import { useParams } from "react-router-dom";

import AtlasBreadcrumbs from "@/components/world/AtlasBreadcrumbs";
import MapGenieWitcherAtlas from "@/components/world/MapGenieWitcherAtlas";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { resolveMapGenieWitcherMapId } from "@/lib/mapgenie-witcher";

export default function LocationMapPage() {
  const { regionSlug, landmarkId } = useParams();
  const initialMapId = resolveMapGenieWitcherMapId(regionSlug, landmarkId);

  return (
    <div className="container py-16">
      <div className="space-y-8">
        <AtlasBreadcrumbs
          items={[
            { label: "Atlas do Continente", to: "/mapa" },
            { label: regionSlug ?? "Regiao", to: regionSlug ? `/mapa/${regionSlug}` : "/mapa" },
            { label: landmarkId ?? "Local" },
          ]}
        />

        <div className="space-y-4">
          <Badge variant="outline" className="border-primary/30 text-primary">
            Ponto local
          </Badge>
          <h1 className="font-display text-4xl text-gold-gradient md:text-6xl">
            Mapa do ponto em foco
          </h1>
          <p className="max-w-4xl text-base leading-8 text-muted-foreground">
            Esta tela foi unificada ao mesmo hub de navegacao. Quando o local nao
            tem um embed proprio, a pagina abre o mapa regional mais proximo.
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
