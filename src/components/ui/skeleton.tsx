import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse border border-[hsl(var(--outline-variant)/0.12)] bg-[linear-gradient(180deg,hsl(var(--surface-raised)/0.72),hsl(var(--surface-base)/0.86))]", className)} {...props} />;
}

export { Skeleton };
