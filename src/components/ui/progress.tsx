import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

const toneStyles = {
  default: "bg-primary",
  good: "bg-status-good",
  warn: "bg-status-warn",
  bad: "bg-status-bad",
  info: "bg-info",
} as const;

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  tone?: keyof typeof toneStyles;
  indicatorClassName?: string;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, tone = "default", indicatorClassName, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-3 w-full overflow-hidden rounded-none border border-[hsl(var(--outline-variant)/0.18)] bg-[linear-gradient(180deg,hsl(var(--surface-base)/0.88),hsl(var(--background)/0.96))] shadow-[inset_0_1px_0_hsl(var(--foreground)/0.04)]",
      className,
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn("h-full w-full flex-1 transition-all duration-200 ease-out", toneStyles[tone], indicatorClassName)}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
