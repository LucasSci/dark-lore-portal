import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "artifact-button-base inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap overflow-hidden rounded-none border border-transparent px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground ring-offset-background transition-[background-color,border-color,color,box-shadow,transform,opacity] duration-200 ease-out hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "ornate-button-frame text-primary-foreground",
        primary:
          "ornate-button-frame text-primary-foreground",
        destructive:
          "border-[hsl(var(--destructive-foreground)/0.2)] bg-[linear-gradient(135deg,hsl(var(--destructive-foreground)/0.96),hsl(var(--destructive))_42%,hsl(2_73%_18%)_100%)] text-destructive-foreground shadow-[0_24px_54px_hsl(var(--destructive)/0.22)] hover:border-[hsl(var(--destructive-foreground)/0.34)] hover:brightness-105",
        danger:
          "border-[hsl(var(--destructive-foreground)/0.2)] bg-[linear-gradient(135deg,hsl(var(--destructive-foreground)/0.96),hsl(var(--destructive))_42%,hsl(2_73%_18%)_100%)] text-destructive-foreground shadow-[0_24px_54px_hsl(var(--destructive)/0.22)] hover:border-[hsl(var(--destructive-foreground)/0.34)] hover:brightness-105",
        success:
          "border-[hsl(var(--success)/0.28)] bg-[linear-gradient(135deg,hsl(var(--success)/0.92),hsl(148_28%_28%)_100%)] text-success-foreground shadow-[0_24px_54px_hsl(var(--success)/0.18)] hover:border-[hsl(var(--success)/0.42)] hover:brightness-105",
        warning:
          "border-[hsl(var(--warning)/0.34)] bg-[linear-gradient(135deg,hsl(var(--destructive-foreground)),hsl(var(--warning))_48%,hsl(42_58%_42%)_100%)] text-warning-foreground shadow-[0_24px_54px_hsl(var(--warning)/0.2)] hover:border-[hsl(var(--warning)/0.5)] hover:brightness-105",
        info: "border-[hsl(var(--info)/0.3)] bg-[linear-gradient(135deg,hsl(var(--info)/0.94),hsl(209_48%_54%)_100%)] text-info-foreground shadow-[0_24px_54px_hsl(var(--info)/0.18)] hover:border-[hsl(var(--info)/0.42)] hover:brightness-105",
        outline:
          "ornate-button-frame ornate-button-muted shadow-panel",
        secondary:
          "ornate-button-frame ornate-button-muted text-secondary-foreground shadow-panel",
        ghost:
          "border-transparent bg-transparent text-muted-foreground shadow-none hover:border-[hsl(var(--outline-variant)/0.14)] hover:bg-[hsl(var(--surface-raised)/0.28)] hover:text-foreground",
        link: "min-h-0 border-transparent px-0 py-0 text-primary shadow-none hover:text-primary/82 hover:underline",
      },
      size: {
        default: "h-11 min-w-11",
        sm: "h-9 min-w-9 px-3 text-[10px]",
        lg: "h-12 min-w-12 px-6 text-xs",
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
