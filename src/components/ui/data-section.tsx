import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const dataSectionVariants = cva(
  "rounded-[var(--radius)] border border-border/70 px-4 py-3 text-left transition-colors",
  {
    variants: {
      variant: {
        panel: "bg-surface-raised/75 shadow-panel",
        quiet: "bg-background/40",
      },
      tone: {
        neutral: "border-border/70",
        good: "border-status-good/25 bg-status-good/10",
        warn: "border-status-warn/30 bg-status-warn/10",
        bad: "border-status-bad/30 bg-status-bad/10",
        info: "border-info/30 bg-info/10",
      },
    },
    defaultVariants: {
      variant: "panel",
      tone: "neutral",
    },
  },
);

export interface DataSectionProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dataSectionVariants> {
  label: React.ReactNode;
  value?: React.ReactNode;
  icon?: React.ReactNode;
  aside?: React.ReactNode;
}

const DataSection = React.forwardRef<HTMLDivElement, DataSectionProps>(
  ({ className, variant, tone, label, value, icon, aside, children, ...props }, ref) => (
    <div ref={ref} className={cn(dataSectionVariants({ variant, tone }), className)} {...props}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          {icon ? (
            <div className="mt-0.5 rounded-full border border-border/60 bg-background/60 p-2 text-primary">
              {icon}
            </div>
          ) : null}

          <div className="min-w-0">
            <p className="font-heading text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {label}
            </p>
            {value ? <div className="mt-2 font-heading text-lg text-foreground">{value}</div> : null}
          </div>
        </div>

        {aside ? <div className="shrink-0">{aside}</div> : null}
      </div>

      {children ? <div className="mt-3 border-t border-border/60 pt-3">{children}</div> : null}
    </div>
  ),
);
DataSection.displayName = "DataSection";

export { DataSection, dataSectionVariants };
