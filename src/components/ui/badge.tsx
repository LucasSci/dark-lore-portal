import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "relic-badge inline-flex items-center rounded-none border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-[hsl(var(--brand)/0.22)] bg-[linear-gradient(180deg,hsl(var(--brand)/0.18),hsl(var(--brand)/0.08))] text-primary",
        primary: "border-[hsl(var(--brand)/0.22)] bg-[linear-gradient(180deg,hsl(var(--brand)/0.18),hsl(var(--brand)/0.08))] text-primary",
        secondary: "border-[hsl(var(--outline-variant)/0.2)] bg-[linear-gradient(180deg,hsl(var(--surface-raised)/0.84),hsl(var(--surface-base)/0.9))] text-secondary-foreground",
        success: "border-[hsl(var(--success)/0.26)] bg-[linear-gradient(180deg,hsl(var(--success)/0.16),hsl(var(--success)/0.08))] text-status-good",
        warning: "border-[hsl(var(--warning)/0.28)] bg-[linear-gradient(180deg,hsl(var(--warning)/0.18),hsl(var(--warning)/0.08))] text-warning",
        destructive: "border-[hsl(var(--destructive-foreground)/0.22)] bg-[linear-gradient(180deg,hsl(var(--destructive-foreground)/0.12),hsl(var(--destructive)/0.12))] text-status-bad",
        danger: "border-[hsl(var(--destructive-foreground)/0.22)] bg-[linear-gradient(180deg,hsl(var(--destructive-foreground)/0.12),hsl(var(--destructive)/0.12))] text-status-bad",
        info: "border-[hsl(var(--info)/0.28)] bg-[linear-gradient(180deg,hsl(var(--info)/0.16),hsl(var(--info)/0.08))] text-info",
        outline: "border-[hsl(var(--outline-variant)/0.24)] bg-transparent text-foreground",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
