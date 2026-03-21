import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  active?: boolean;
}

export default function Tag({ className, active = false, ...props }: TagProps) {
  return (
    <span
      className={cn(
        "relic-badge inline-flex items-center rounded-none border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] transition-[border-color,background-color,color,box-shadow] duration-200",
        active
          ? "border-[hsl(var(--brand)/0.3)] bg-[linear-gradient(180deg,hsl(var(--brand)/0.18),hsl(var(--brand)/0.08))] text-primary shadow-[0_0_18px_hsl(var(--brand)/0.12)]"
          : "border-[hsl(var(--outline-variant)/0.18)] bg-[linear-gradient(180deg,hsl(var(--surface-raised)/0.84),hsl(var(--surface-base)/0.9))] text-foreground/78",
        className,
      )}
      {...props}
    />
  );
}
