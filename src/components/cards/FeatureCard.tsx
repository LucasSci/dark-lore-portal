import type { ReactNode } from "react";

import ArtifactCard from "./ArtifactCard";

interface FeatureCardProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  badges?: ReactNode;
  aside?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export default function FeatureCard({
  eyebrow,
  title,
  description,
  badges,
  aside,
  children,
  className,
}: FeatureCardProps) {
  return (
    <ArtifactCard variant="relic" className={className}>
      <div className="grid gap-8 p-6 md:p-8 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-6">
          {badges ? <div className="flex flex-wrap items-center gap-3">{badges}</div> : null}

          <div className="max-w-3xl space-y-4">
            {eyebrow ? <p className="section-kicker">{eyebrow}</p> : null}
            <h2 className="max-w-4xl font-display text-5xl leading-[0.95] text-brand-gradient md:text-6xl">
              {title}
            </h2>
            {description ? (
              <p className="max-w-[68ch] text-base leading-8 text-foreground/88">{description}</p>
            ) : null}
          </div>

          {children}
        </div>

        {aside ? <div className="space-y-4">{aside}</div> : null}
      </div>
    </ArtifactCard>
  );
}
