import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[calc(var(--radius)-2px)] border border-transparent px-4 py-2 text-sm font-medium text-foreground ring-offset-background transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border-primary/35 bg-primary text-primary-foreground shadow-brand hover:border-primary/50 hover:brightness-110",
        primary:
          "border-primary/35 bg-primary text-primary-foreground shadow-brand hover:border-primary/50 hover:brightness-110",
        destructive:
          "border-destructive/35 bg-destructive text-destructive-foreground shadow-[0_18px_48px_hsl(var(--destructive)/0.18)] hover:border-destructive/50 hover:brightness-105",
        danger:
          "border-destructive/35 bg-destructive text-destructive-foreground shadow-[0_18px_48px_hsl(var(--destructive)/0.18)] hover:border-destructive/50 hover:brightness-105",
        success:
          "border-success/35 bg-success text-success-foreground shadow-[0_18px_48px_hsl(var(--success)/0.18)] hover:border-success/50 hover:brightness-105",
        warning:
          "border-warning/35 bg-warning text-warning-foreground shadow-[0_18px_48px_hsl(var(--warning)/0.18)] hover:border-warning/50 hover:brightness-105",
        info: "border-info/35 bg-info text-info-foreground shadow-[0_18px_48px_hsl(var(--info)/0.18)] hover:border-info/50 hover:brightness-105",
        outline: "border-input bg-surface-raised/55 text-foreground hover:border-primary/40 hover:bg-secondary/85",
        secondary: "border-border/80 bg-secondary text-secondary-foreground hover:border-primary/30 hover:bg-secondary/85",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "border-transparent px-0 text-primary underline-offset-4 hover:text-primary/85 hover:underline",
      },
      size: {
        default: "h-11 min-w-11",
        sm: "h-9 min-w-9 px-3 text-xs",
        lg: "h-12 min-w-12 px-6 text-base",
        icon: "h-11 w-11 px-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
