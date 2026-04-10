import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type PanelTone = "default" | "muted" | "warning";
type BannerTone = "default" | "info" | "warning" | "danger";

export function SectionHeader({
  kicker,
  title,
  description,
  aside,
  className,
}: {
  kicker?: string;
  title: string;
  description?: ReactNode;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("session-shell-header", className)}>
      <div className="session-shell-copy">
        {kicker ? <p className="session-shell-kicker">{kicker}</p> : null}
        <h1 className="session-shell-title">{title}</h1>
        {description ? <div className="session-shell-text">{description}</div> : null}
      </div>
      {aside ? <div className="session-shell-badge-strip">{aside}</div> : null}
    </div>
  );
}

export function PanelCard({
  title,
  description,
  actions,
  tone = "default",
  className,
  children,
}: {
  title?: string;
  description?: ReactNode;
  actions?: ReactNode;
  tone?: PanelTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("session-shell-panel", className)} data-tone={tone}>
      {title || description || actions ? (
        <div className="session-shell-panel-header">
          <div className="space-y-2">
            {title ? <h2 className="session-shell-panel-title">{title}</h2> : null}
            {description ? <div className="session-shell-panel-copy">{description}</div> : null}
          </div>
          {actions ? <div className="session-shell-actions">{actions}</div> : null}
        </div>
      ) : null}
      <div className="relative z-[1]">{children}</div>
    </section>
  );
}

export function MetricCard({
  label,
  value,
  detail,
  className,
}: {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  className?: string;
}) {
  return (
    <article className={cn("session-shell-metric", className)}>
      <p className="session-shell-metric-label">{label}</p>
      <p className="session-shell-metric-value">{value}</p>
      {detail ? <div className="session-shell-metric-detail">{detail}</div> : null}
    </article>
  );
}

export function ActionStrip({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn("session-shell-action-strip", className)}>{children}</div>;
}

export function SidebarModule({
  title,
  description,
  className,
  children,
}: {
  title: string;
  description?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <PanelCard title={title} description={description} tone="muted" className={className}>
      {children}
    </PanelCard>
  );
}

export function StatusBanner({
  title,
  children,
  tone = "default",
  className,
}: {
  title: string;
  children: ReactNode;
  tone?: BannerTone;
  className?: string;
}) {
  return (
    <div className={cn("session-shell-banner", className)} data-status={tone}>
      <p className="session-shell-banner-title">{title}</p>
      <div className="session-shell-banner-copy">{children}</div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("session-shell-empty", className)}>
      <h3 className="session-shell-empty-title">{title}</h3>
      <div className="session-shell-empty-copy">{description}</div>
      {children ? <div className="session-shell-actions mt-4">{children}</div> : null}
    </div>
  );
}

export function ModuleCard({
  title,
  description,
  meta,
  className,
  children,
  ...props
}: HTMLAttributes<HTMLElement> & {
  title: string;
  description: ReactNode;
  meta?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <article className={cn("session-shell-module", className)} {...props}>
      {meta ? <div className="session-shell-kicker">{meta}</div> : null}
      <h3 className="session-shell-module-title">{title}</h3>
      <div className="session-shell-module-copy">{description}</div>
      {children ? <div className="session-shell-actions mt-auto">{children}</div> : null}
    </article>
  );
}
