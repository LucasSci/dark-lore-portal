import { Compass, ExternalLink, MapPinned, Route } from "lucide-react";

import AtlasBreadcrumbs from "@/components/world/AtlasBreadcrumbs";
import MapGenieWitcherAtlas from "@/components/world/MapGenieWitcherAtlas";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const atlasHighlights = [
  {
    icon: Compass,
    title: "Embeds prontos",
    description: "Os mapas agora usam a estrutura de embed do MapGenie para navegacao imediata.",
  },
  {
    icon: Route,
    title: "Troca rapida",
    description: "Skellige, White Orchard, Velen, Kaer Morhen e outros pontos em um hub unico.",
  },
  {
    icon: MapPinned,
    title: "Regioes centrais",
    description: "A sessao de mapa passa a se apoiar nos cenarios jogaveis mais fortes de Witcher 3.",
  },
  {
    icon: ExternalLink,
    title: "Servico externo",
    description: "A experiencia depende do embed do MapGenie e acompanha a disponibilidade deles.",
  },
];

export default function MapaPage() {
  return (
    <div className="container py-16">
      <div className="space-y-8">
        <AtlasBreadcrumbs items={[{ label: "Atlas do Continente" }]} />

        <div className="space-y-4">
          <Badge variant="outline" className="border-primary/30 text-primary">
            Hub de mapas
          </Badge>
          <h1 className="font-display text-4xl text-gold-gradient md:text-6xl">
            Navegacao regional via MapGenie
          </h1>
          <p className="max-w-4xl text-base leading-8 text-muted-foreground">
            A area de mapas foi reestruturada para usar os embeds do MapGenie nas
            regioes principais do universo jogavel de The Witcher 3. Em vez de
            simular um atlas interno, a pagina agora funciona como um hub de
            navegacao para esses mapas externos.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          {atlasHighlights.map((highlight) => (
            <Card key={highlight.title} variant="panel">
              <CardContent className="space-y-4 p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-primary/20 bg-background/60 text-primary">
                  <highlight.icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-heading text-xl text-foreground">
                    {highlight.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {highlight.description}
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
                    Como ficou a navegacao
                  </h2>
                </div>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                  O foco agora e abrir rapidamente a regiao certa para a mesa ou para
                  consulta, com busca simples, selecao lateral e o embed principal em
                  destaque. Isso deixa a experiencia mais direta para jogo.
                </p>
              </div>
              <Badge variant="outline" className="border-primary/25 text-primary">
                Skellige, Velen, White Orchard, Kaer Morhen e mais
              </Badge>
            </div>
          </CardContent>
        </Card>

        <MapGenieWitcherAtlas />
      </div>
    </div>
  );
}
