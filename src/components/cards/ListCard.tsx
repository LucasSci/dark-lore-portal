import type { ReactNode } from "react";

import ArtifactCard from "./ArtifactCard";

interface ListCardProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function ListCard({
  eyebrow,
  title,
  description,
  actions,
  children,
  className,
}: ListCardProps) {
  return (
    <ArtifactCard variant="minimal" className={className}>
      <div className="space-y-5 p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            {eyebrow ? <p className="section-kicker">{eyebrow}</p> : null}
            <h3 className="font-heading text-2xl text-foreground">{title}</h3>
            {description ? (
              <p className="max-w-[60ch] text-sm leading-7 text-foreground/72">{description}</p>
            ) : null}
          </div>

          {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
        </div>

        <div className="space-y-3">{children}</div>
      </div>
    </ArtifactCard>
  );
}
