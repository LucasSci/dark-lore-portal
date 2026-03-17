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
            Atlas do continente
          </p>
          <h2 className="mt-2 font-heading text-2xl text-foreground">
            Mundi e regioes principais do continente
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
            Consulte primeiro o mundi do continente e depois aprofunde a leitura nos grandes
            recortes geograficos para orientar deslocamentos, fronteiras e jornadas.
          </p>
        </div>

        <MapGenieWitcherAtlas compact={compact} />
      </CardContent>
    </Card>
  );
}
