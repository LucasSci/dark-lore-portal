import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type PanelTone = "default" | "muted" | "accent";

const toneClasses: Record<PanelTone, string> = {
  default:
    "border-[hsl(var(--outline-variant)/0.18)] bg-[linear-gradient(180deg,hsl(var(--surface-raised)/0.5),hsl(var(--surface-base)/0.66)_44%,hsl(var(--background-strong)/0.8))]",
  muted:
    "border-[hsl(var(--outline-variant)/0.14)] bg-[linear-gradient(180deg,hsl(var(--background)/0.3),hsl(var(--surface-base)/0.5))]",
  accent:
    "border-[hsl(var(--brand)/0.2)] bg-[radial-gradient(circle_at_top,hsl(var(--brand)/0.08),transparent_38%),linear-gradient(180deg,hsl(var(--surface-strong)/0.48),hsl(var(--surface-base)/0.7)_48%,hsl(var(--background-strong)/0.82))]",
};

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  tone?: PanelTone;
}

export default function Panel({ className, tone = "default", ...props }: PanelProps) {
  return (
    <div
      className={cn(
        "ornate-frame overflow-hidden rounded-none border shadow-panel backdrop-blur-xl",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
