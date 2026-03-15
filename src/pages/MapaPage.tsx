import { ArrowRight, Compass, Layers3, MapPinned, Route } from "lucide-react";
import { Link } from "react-router-dom";

import AtlasBreadcrumbs from "@/components/world/AtlasBreadcrumbs";
import ContinentMap from "@/components/world/ContinentMap";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { worldRegions } from "@/lib/world-map";

const atlasLevels = [
  {
    icon: Compass,
    title: "Continente",
    description:
      "Camada macro para localizar a companhia, medir viagem e decidir a rota.",
  },
  {
    icon: Route,
    title: "Regiao",
    description:
      "Cada reino ou zona abre um mapa proprio, com arte unica e marcos de aprofundamento.",
  },
  {
    icon: Layers3,
    title: "Local",
    description:
      "O terceiro nivel recebe imagens de cidade, ruina, vale ou enclave para jogo de perto.",
  },
];

export default function MapaPage() {
  return (
    <div className="container py-16">
      <div className="space-y-8">
        <AtlasBreadcrumbs items={[{ label: "Atlas do Continente" }]} />

        <div className="space-y-4">
          <Badge variant="outline" className="border-primary/30 text-primary">
            Navegacao em camadas
          </Badge>
          <h1 className="font-display text-4xl text-gold-gradient md:text-6xl">
            Continente, regioes e pontos locais
          </h1>
          <p className="max-w-4xl text-base leading-8 text-muted-foreground">
            O atlas agora trabalha em tres niveis. Primeiro voce ve o continente,
            depois mergulha em uma regiao, e dali abre o mapa local do ponto que
            interessa para a campanha.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {atlasLevels.map((level) => (
            <Card key={level.title} variant="panel">
              <CardContent className="space-y-4 p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-primary/20 bg-background/60 text-primary">
                  <level.icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-heading text-xl text-foreground">{level.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {level.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card variant="panel">
          <CardContent className="space-y-5 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-3">
                  <MapPinned className="h-5 w-5 text-primary" />
                  <h2 className="font-heading text-2xl text-foreground">
                    Entradas rapidas das regioes
                  </h2>
                </div>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                  Use estes atalhos quando ja souber onde quer abrir o atlas em
                  profundidade. O clique no continente continua funcionando no mapa
                  principal logo abaixo.
                </p>
              </div>
              <Badge variant="outline" className="border-primary/25 text-primary">
                {worldRegions.length} regioes ativas
              </Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {worldRegions.map((region) => (
                <Card key={region.id} variant="elevated" className="h-full">
                  <CardContent className="flex h-full flex-col gap-4 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-heading text-xl text-foreground">
                          {region.name}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {region.subtitle}
                        </p>
                      </div>
                      <Badge
                        variant={
                          region.hue === "warning"
                            ? "warning"
                            : region.hue === "info"
                              ? "info"
                              : region.hue === "success"
                                ? "success"
                                : "default"
                        }
                      >
                        {region.landmarks.length} locais
                      </Badge>
                    </div>

                    <p className="text-sm leading-6 text-foreground/88">
                      {region.summary}
                    </p>

                    <Button asChild variant="outline" className="mt-auto w-full justify-between">
                      <Link to={`/mapa/${region.slug}`}>
                        Abrir regiao
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <ContinentMap mode="explorer" />
      </div>
    </div>
  );
}
