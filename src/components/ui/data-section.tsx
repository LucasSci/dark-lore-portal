import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const dataSectionVariants = cva(
  "reliquary-grain rounded-none border px-4 py-4 text-left transition-[background-color,border-color,box-shadow] duration-200",
  {
    variants: {
      variant: {
        panel:
          "border-[hsl(var(--outline-variant)/0.16)] bg-[linear-gradient(180deg,hsl(var(--surface-raised)/0.84),hsl(var(--surface-base)/0.9))] shadow-panel",
        quiet:
          "border-[hsl(var(--outline-variant)/0.12)] bg-[linear-gradient(180deg,hsl(var(--background)/0.26),hsl(var(--surface-base)/0.42))]",
      },
      tone: {
        neutral: "",
        good: "border-[hsl(var(--success)/0.24)] bg-[linear-gradient(180deg,hsl(var(--success)/0.14),hsl(var(--surface-base)/0.92))]",
        warn: "border-[hsl(var(--warning)/0.24)] bg-[linear-gradient(180deg,hsl(var(--warning)/0.14),hsl(var(--surface-base)/0.92))]",
        bad: "border-[hsl(var(--destructive-foreground)/0.22)] bg-[linear-gradient(180deg,hsl(var(--destructive-foreground)/0.1),hsl(var(--surface-base)/0.92))]",
        info: "border-[hsl(var(--info)/0.24)] bg-[linear-gradient(180deg,hsl(var(--info)/0.12),hsl(var(--surface-base)/0.92))]",
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
            <div className="mt-0.5 border border-[hsl(var(--outline-variant)/0.18)] bg-[linear-gradient(180deg,hsl(var(--surface-strong)/0.7),hsl(var(--surface-base)/0.82))] p-2 text-primary">
              {icon}
            </div>
          ) : null}

          <div className="min-w-0">
            <p className="font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              {label}
            </p>
            {value ? <div className="mt-2 font-heading text-lg text-foreground">{value}</div> : null}
          </div>
        </div>

        {aside ? <div className="shrink-0">{aside}</div> : null}
      </div>

      {children ? <div className="mt-4 bg-[hsl(var(--background)/0.18)] px-4 py-3">{children}</div> : null}
    </div>
  ),
);
DataSection.displayName = "DataSection";

export { DataSection, dataSectionVariants };
