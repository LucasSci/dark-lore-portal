import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

import { cn } from "@/lib/utils";

interface AtlasBreadcrumbItem {
  label: string;
  to?: string;
}

interface AtlasBreadcrumbsProps {
  items: AtlasBreadcrumbItem[];
  className?: string;
}

export default function AtlasBreadcrumbs({
  items,
  className,
}: AtlasBreadcrumbsProps) {
  return (
    <nav
      aria-label="Trilha do atlas"
      className={cn("flex flex-wrap items-center gap-2", className)}
    >
      {items.map((item, index) => {
        const isCurrent = index === items.length - 1;

        return (
          <div key={`${item.label}-${index}`} className="flex items-center gap-2">
            {item.to && !isCurrent ? (
              <Link
                to={item.to}
                className="metric-panel px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
              >
                {item.label}
              </Link>
            ) : (
              <span className="field-note border-primary/25 bg-primary/10 px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-primary">
                {item.label}
              </span>
            )}
            {!isCurrent ? (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/70" />
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
