import { useEffect, type ReactNode } from "react";
import { Compass, Smartphone, Sparkles } from "lucide-react";

import PortalContextPanel from "@/components/portal/PortalContextPanel";
import AtlasBreadcrumbs from "@/components/world/AtlasBreadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DataSection } from "@/components/ui/data-section";
import type { AtlasContextModel } from "@/lib/atlas-context";
import { setPortalAtlasFocus, usePortalShellMode } from "@/lib/portal-state";

interface AtlasPageShellProps {
  context: AtlasContextModel;
  children: ReactNode;
  headerActions?: ReactNode;
}

const stageLabels: Record<AtlasContextModel["stage"], string> = {
  world: "Mundo",
  region: "Regiao",
  subregion: "Sub-regiao",
  location: "Local",
  battlemap: "Battlemap",
};

export default function AtlasPageShell({
  context,
  children,
  headerActions,
}: AtlasPageShellProps) {
  usePortalShellMode("atlas", "atlas");
  const stageLabel = stageLabels[context.stage];

  useEffect(() => {
    const segments = context.href.split("/").filter(Boolean);

    setPortalAtlasFocus({
      regionSlug: segments[1],
      subRegionSlug: segments[2],
      locationSlug: segments[3],
      stage: context.stage,
      title: context.title,
      description: context.description,
      href: context.href,
    });
  }, [context.description, context.href, context.stage, context.title]);

  return (
    <div className="atlas-mode-shell min-h-screen bg-[radial-gradient(circle_at_top,hsl(var(--brand)/0.16),transparent_32%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--background-strong)))]">
      <div className="container flex max-w-[1780px] flex-col gap-6 pb-8 pt-28 md:gap-8 md:pb-10 md:pt-32">
        <Card variant="elevated" className="atlas-stage-card overflow-hidden">
          <CardContent className="space-y-6 p-6 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div className="max-w-4xl space-y-4">
                <AtlasBreadcrumbs items={context.breadcrumbs} className="atlas-stage-breadcrumbs" />
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="atlas-stage-badge border-primary/30 text-primary">
                    {context.eyebrow}
                  </Badge>
                  <Badge variant="outline" className="atlas-stage-badge border-primary/25 text-primary">
                    <Compass className="mr-2 h-3.5 w-3.5" />
                    Camada {stageLabel}
                  </Badge>
                </div>
                <div>
                  <h1 className="atlas-stage-title font-display text-4xl text-gold-gradient md:text-5xl">
                    {context.title}
                  </h1>
                  <p className="atlas-stage-description mt-3 max-w-4xl text-sm leading-7 text-muted-foreground md:text-base">
                    {context.description}
                  </p>
                </div>
              </div>

              {headerActions ? <div className="atlas-stage-actions flex flex-wrap items-center gap-2">{headerActions}</div> : null}
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {context.metrics.map((metric) => (
                <DataSection
                  key={`${context.title}-${metric.label}`}
                  label={metric.label}
                  value={metric.value}
                  variant="quiet"
                  tone={metric.tone}
                  className={`atlas-stage-metric atlas-stage-metric--${metric.tone ?? "neutral"}`}
                />
              ))}
            </div>

            <div className="atlas-stage-note field-note flex flex-wrap items-start gap-3 border-primary/20 bg-primary/10 px-4 py-3">
              <Smartphone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p className="text-sm leading-6 text-foreground/84">{context.orientationHint}</p>
            </div>
          </CardContent>
        </Card>

        {children}

        <PortalContextPanel
          eyebrow="Leitura conectada"
          title={`Continuar a partir de ${context.title}`}
          description="Atlas, universo, campanha e mesa seguem ligados pelos mesmos rastros desta leitura."
          image={context.image}
          metrics={context.metrics.slice(0, 3)}
          actions={context.actions}
          related={context.related}
          relatedLabel="Dossies e verbetes ligados a esta leitura"
        />

        <div className="field-note flex flex-wrap items-start gap-3 px-4 py-3">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-sm leading-6 text-foreground/84">
            O atlas guarda o contexto da travessia e mantem os atalhos entre mapa, lore e sessao
            sempre a mao.
          </p>
        </div>
      </div>
    </div>
  );
}
