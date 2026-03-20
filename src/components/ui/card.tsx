import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const cardVariants = cva(
  "ornate-frame reliquary-grain relative overflow-hidden rounded-none border text-card-foreground transition-[border-color,background-color,box-shadow] duration-200",
  {
  variants: {
    variant: {
      panel:
        "border-[hsl(var(--outline-variant)/0.16)] bg-[linear-gradient(180deg,hsl(var(--surface-raised)/0.96),hsl(var(--surface-base)/0.98)_48%,hsl(var(--background-strong)/0.98))] shadow-panel backdrop-blur-sm",
      elevated:
        "border-[hsl(var(--brand)/0.18)] bg-[linear-gradient(180deg,hsl(var(--surface-strong)/0.92),hsl(var(--surface-raised)/0.94)_38%,hsl(var(--background-strong)/0.98))] shadow-elevated backdrop-blur-sm",
      outline:
        "border-[hsl(var(--outline-variant)/0.14)] bg-[linear-gradient(180deg,hsl(var(--surface-base)/0.52),hsl(var(--background)/0.3))] shadow-none",
    },
  },
  defaultVariants: {
    variant: "panel",
  },
});

interface CardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, variant, ...props }, ref) => (
  <div ref={ref} className={cn(cardVariants({ variant }), className)} {...props} />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-2 p-6 md:p-7", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("font-heading text-2xl leading-none tracking-[-0.03em]", className)} {...props} />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm leading-relaxed text-muted-foreground", className)} {...props} />
  ),
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 pt-0 md:p-7 md:pt-0", className)} {...props} />,
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0 md:p-7 md:pt-0", className)} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants };
