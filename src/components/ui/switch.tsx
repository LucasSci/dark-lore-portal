import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-none border border-[hsl(var(--outline-variant)/0.18)] bg-[linear-gradient(180deg,hsl(var(--surface-raised)/0.92),hsl(var(--surface-base)/0.98))] transition-colors data-[state=checked]:border-[hsl(var(--brand)/0.34)] data-[state=checked]:bg-[linear-gradient(180deg,hsl(var(--brand)/0.16),hsl(var(--surface-base)/0.96))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 border border-[hsl(var(--brand)/0.32)] bg-[linear-gradient(180deg,hsl(47_100%_82%),hsl(var(--brand))_52%,hsl(var(--warning))_100%)] shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-0.5",
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
