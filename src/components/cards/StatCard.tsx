import type { ReactNode } from "react";

import ArtifactCard from "./ArtifactCard";

interface StatCardProps {
  label: ReactNode;
  value: ReactNode;
  note?: ReactNode;
  className?: string;
}

export default function StatCard({ label, value, note, className }: StatCardProps) {
  return (
    <ArtifactCard variant="minimal" className={className}>
      <div className="space-y-3 p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary/74">
          {label}
        </p>
        <div className="font-display text-3xl leading-none text-foreground">{value}</div>
        {note ? <p className="text-sm leading-6 text-foreground/68">{note}</p> : null}
      </div>
    </ArtifactCard>
  );
}
