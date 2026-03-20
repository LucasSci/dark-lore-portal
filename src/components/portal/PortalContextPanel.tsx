import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataSection } from "@/components/ui/data-section";
import type {
  AtlasContextAction,
  AtlasContextLink,
  AtlasContextMetric,
} from "@/lib/atlas-context";
import { cn } from "@/lib/utils";

interface PortalContextPanelProps {
  eyebrow: string;
  title: string;
  description: string;
  image?: string;
  metrics?: AtlasContextMetric[];
  actions?: AtlasContextAction[];
  related?: AtlasContextLink[];
  relatedLabel?: string;
  className?: string;
}

export default function PortalContextPanel({
  eyebrow,
  title,
  description,
  image,
  metrics = [],
  actions = [],
  related = [],
  relatedLabel = "Ligacoes relacionadas",
  className,
}: PortalContextPanelProps) {
  return (
    <Card variant="panel" className={cn("portal-context-panel overflow-hidden", className)}>
      {image ? (
        <div className="relative h-40 overflow-hidden border-b border-[hsl(var(--outline-variant)/0.14)]">
          <img src={image} alt="" aria-hidden="true" className="h-full w-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,hsl(var(--background)/0.1),hsl(var(--background-strong)/0.9)_100%),radial-gradient(circle_at_top_left,hsl(var(--brand)/0.2),transparent_36%)]" />
        </div>
      ) : null}

      <CardContent className="space-y-5 p-6">
        <div>
          <p className="section-kicker">{eyebrow}</p>
          <h3 className="mt-2 font-heading text-2xl text-foreground">{title}</h3>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">{description}</p>
        </div>

        {metrics.length ? (
          <div className="grid gap-3">
            {metrics.map((metric) => (
              <DataSection
                key={`${title}-${metric.label}`}
                label={metric.label}
                value={metric.value}
                variant="quiet"
                tone={metric.tone}
              />
            ))}
          </div>
        ) : null}

        {actions.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {actions.map((action) => (
              <Button
                key={`${title}-${action.label}`}
                asChild
                variant={action.variant ?? "outline"}
                className="w-full"
              >
                <Link to={action.href}>{action.label}</Link>
              </Button>
            ))}
          </div>
        ) : null}

        {related.length ? (
          <div className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              {relatedLabel}
            </p>
            <div className="space-y-3">
              {related.map((item) => (
                <Link
                  key={`${title}-${item.label}`}
                  to={item.href}
                  className="portal-context-link block border border-[hsl(var(--outline-variant)/0.14)] bg-[linear-gradient(180deg,hsl(var(--surface-base)/0.42),hsl(var(--background-strong)/0.74))] p-4 transition-colors hover:border-[hsl(var(--brand)/0.18)]"
                >
                  <p className="font-heading text-sm text-foreground">{item.label}</p>
                  {item.description ? (
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {item.description}
                    </p>
                  ) : null}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
