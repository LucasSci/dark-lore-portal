import type { HTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";

import { cn } from "@/lib/utils";

type ArtifactCardVariant = "relic" | "scroll" | "minimal";

const variantClasses: Record<ArtifactCardVariant, string> = {
  relic:
    "border-[hsl(var(--brand)/0.22)] bg-[radial-gradient(circle_at_top,hsl(var(--brand)/0.08),transparent_36%),linear-gradient(180deg,hsl(var(--surface-strong)/0.52),hsl(var(--surface-raised)/0.66)_40%,hsl(var(--background-strong)/0.86))] shadow-elevated",
  scroll:
    "border-[hsl(36_28%_28%/0.34)] bg-[linear-gradient(180deg,hsl(38_28%_78%/0.94),hsl(34_22%_66%/0.94)),var(--witcher-gold-texture-bright)] text-[hsl(24_28%_16%)] shadow-[0_28px_80px_hsl(var(--shadow-deep)/0.24)]",
  minimal:
    "border-[hsl(var(--outline-variant)/0.16)] bg-[linear-gradient(180deg,hsl(var(--surface-raised)/0.4),hsl(var(--surface-base)/0.56)_44%,hsl(var(--background-strong)/0.72))] shadow-panel",
};

interface ArtifactCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: ArtifactCardVariant;
  href?: string;
  children: ReactNode;
}

export default function ArtifactCard({
  className,
  variant = "relic",
  href,
  children,
  ...props
}: ArtifactCardProps) {
  const classes = cn(
    "ornate-frame relative isolate overflow-hidden rounded-none border backdrop-blur-xl",
    variantClasses[variant],
    className,
  );

  if (href) {
    return (
      <Link to={href} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <article className={classes} {...props}>
      {children}
    </article>
  );
}
