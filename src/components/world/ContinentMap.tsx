import { Compass, MapPinned, Route, ScrollText } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import MapGenieWitcherAtlas from "@/components/world/MapGenieWitcherAtlas";

interface ContinentMapProps {
  compact?: boolean;
}

const mapSignals = [
  {
    icon: MapPinned,
    label: "Escala",
    value: "Mundi + regioes",
  },
  {
    icon: Route,
    label: "Leitura",
    value: "Rotas e fronteiras",
  },
  {
    icon: ScrollText,
    label: "Uso",
    value: "Sessao e dossie",
  },
] as const;

export default function ContinentMap({ compact = true }: ContinentMapProps) {
  return (
    <section className="space-y-6">
      <div className="continent-map-shell space-y-6 p-6 md:p-8">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl space-y-4">
            <Badge variant="outline" className="border-primary/25 bg-background/30 text-primary">
              <Compass className="mr-2 h-3.5 w-3.5" />
              Cartografia do continente
            </Badge>
            <div className="space-y-3">
              <h2 className="font-display text-4xl leading-[0.94] text-brand-gradient md:text-5xl">
                Um artefato de navegacao para ler o mundo com calma e profundidade.
              </h2>
              <p className="max-w-[66ch] text-base leading-8 text-foreground/78">
                A carta principal agora entra como peca de palco: escura, focada e integrada ao
                reliquiario. Primeiro voce entende a geografia geral; depois desce por regioes,
                rotas, locais e battlemaps sem perder o fio da leitura.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button asChild variant="outline" className="backdrop-blur-md">
              <Link to="/mapa">Abrir atlas completo</Link>
            </Button>
            <Button asChild className="backdrop-blur-md">
              <Link to="/universo">Cruzar com o universo</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {mapSignals.map(({ icon: Icon, label, value }) => (
            <div key={label} className="continent-map-stat">
              <div className="icon-slot h-10 w-10 shrink-0">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary/72">
                  {label}
                </p>
                <p className="mt-2 font-display text-2xl leading-none text-foreground">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <MapGenieWitcherAtlas compact={compact} />
    </section>
  );
}
