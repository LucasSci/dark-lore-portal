import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type GridLayout = "cards" | "stats" | "feature" | "sidebar";

const gridClasses: Record<GridLayout, string> = {
  cards: "grid gap-4 md:grid-cols-2 xl:grid-cols-4",
  stats: "grid gap-4 md:grid-cols-3",
  feature: "grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_340px]",
  sidebar: "grid gap-6 xl:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.2fr)]",
};

interface GridProps extends HTMLAttributes<HTMLDivElement> {
  layout?: GridLayout;
}

export default function Grid({ className, layout = "cards", ...props }: GridProps) {
  return <div className={cn(gridClasses[layout], className)} {...props} />;
}
