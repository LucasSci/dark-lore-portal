import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-none border border-transparent text-[11px] font-semibold uppercase tracking-[0.16em] ring-offset-background transition-[background-color,border-color,color,box-shadow] duration-150 hover:border-[hsl(var(--brand)/0.14)] hover:bg-[hsl(var(--brand)/0.08)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:border-[hsl(var(--brand)/0.24)] data-[state=on]:bg-[linear-gradient(135deg,hsl(47_100%_82%),hsl(var(--primary))_44%,hsl(var(--warning))_100%)] data-[state=on]:text-primary-foreground",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border-[hsl(var(--outline-variant)/0.18)] bg-[linear-gradient(180deg,hsl(var(--surface-raised)/0.9),hsl(var(--surface-base)/0.96))]",
      },
      size: {
        default: "h-10 px-3",
        sm: "h-9 px-2.5 text-[10px]",
        lg: "h-11 px-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root ref={ref} className={cn(toggleVariants({ variant, size, className }))} {...props} />
));

Toggle.displayName = TogglePrimitive.Root.displayName;

export { Toggle, toggleVariants };
