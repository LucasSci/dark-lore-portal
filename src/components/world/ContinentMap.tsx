import MapGenieWitcherAtlas from "@/components/world/MapGenieWitcherAtlas";
import { Card, CardContent } from "@/components/ui/card";

interface ContinentMapProps {
  compact?: boolean;
}

export default function ContinentMap({ compact = true }: ContinentMapProps) {
  return (
    <Card variant="panel" className="overflow-hidden">
      <CardContent className="space-y-5 p-6">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-primary/80">
            Atlas externo
          </p>
          <h2 className="mt-2 font-heading text-2xl text-foreground">
            Regioes principais do continente
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
            Esta vitrine usa o hub de embeds do MapGenie para abrir rapidamente os
            mapas jogaveis mais relevantes do universo.
          </p>
        </div>

        <MapGenieWitcherAtlas compact={compact} />
      </CardContent>
    </Card>
  );
}
