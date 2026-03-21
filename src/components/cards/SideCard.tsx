import type { ReactNode } from "react";

import ArtifactCard from "./ArtifactCard";

interface SideCardProps {
  icon?: ReactNode;
  eyebrow?: ReactNode;
  title: ReactNode;
  description: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export default function SideCard({
  icon,
  eyebrow,
  title,
  description,
  footer,
  className,
}: SideCardProps) {
  return (
    <ArtifactCard variant="minimal" className={className}>
      <div className="space-y-4 p-5 md:p-6">
        <div className="flex items-start gap-3">
          {icon ? (
            <div className="icon-slot h-11 w-11 shrink-0">
              {icon}
            </div>
          ) : null}

          <div className="min-w-0">
            {eyebrow ? <p className="section-kicker">{eyebrow}</p> : null}
            <h3 className="mt-2 font-heading text-2xl leading-tight text-foreground">{title}</h3>
          </div>
        </div>

        <p className="text-sm leading-7 text-foreground/76">{description}</p>
        {footer ? <div>{footer}</div> : null}
      </div>
    </ArtifactCard>
  );
}
