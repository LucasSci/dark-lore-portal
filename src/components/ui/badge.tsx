import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-primary/25 bg-primary/15 text-primary",
        primary: "border-primary/25 bg-primary/15 text-primary",
        secondary: "border-border/70 bg-secondary/65 text-secondary-foreground",
        success: "border-status-good/30 bg-status-good/15 text-status-good",
        warning: "border-status-warn/35 bg-status-warn/15 text-warning",
        destructive: "border-status-bad/30 bg-status-bad/15 text-status-bad",
        danger: "border-status-bad/30 bg-status-bad/15 text-status-bad",
        info: "border-info/30 bg-info/15 text-info",
        outline: "border-border/80 bg-transparent text-foreground",
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
