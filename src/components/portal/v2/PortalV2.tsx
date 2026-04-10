import { Search } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function V2SearchBar({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={cn("portal-v2-searchbar", className)}>
      <Search className="h-4 w-4 shrink-0 text-[rgb(123_216_255_/_0.72)]" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder ?? "Buscar"}
      />
    </label>
  );
}

export function V2FilterTabs<T extends string>({
  value,
  options,
  onChange,
  className,
}: {
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div className={cn("portal-v2-filter-tabs", className)} role="tablist" aria-label="Filtros">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className="portal-v2-filter-tab"
          data-active={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function V2MetadataPanel({
  title,
  rows,
  footer,
  className,
}: {
  title: string;
  rows: Array<{ label: string; value: ReactNode }>;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <aside className={cn("portal-v2-metadata-panel", className)}>
      <h2 className="portal-v2-metadata-heading">{title}</h2>
      <div className="portal-v2-metadata-list">
        {rows.map((row) => (
          <div key={row.label} className="portal-v2-metadata-row">
            <p className="portal-v2-metadata-label">{row.label}</p>
            <div className="portal-v2-metadata-value">{row.value}</div>
          </div>
        ))}
      </div>
      {footer ? <div className="pt-2">{footer}</div> : null}
    </aside>
  );
}

export function V2QuoteBlock({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <blockquote className={cn("portal-v2-quote", className)}>{children}</blockquote>;
}

export function V2Timeline({
  events,
  className,
}: {
  events: Array<{ period: string; title: string; description: string }>;
  className?: string;
}) {
  return (
    <div className={cn("portal-v2-timeline", className)}>
      {events.map((event) => (
        <article key={`${event.period}-${event.title}`} className="portal-v2-timeline-node">
          <div className="portal-v2-timeline-track">
            <span className="portal-v2-timeline-dot" aria-hidden="true" />
          </div>
          <div>
            <p className="portal-v2-timeline-period">{event.period}</p>
            <h3 className="portal-v2-timeline-title">{event.title}</h3>
            <p className="portal-v2-timeline-copy">{event.description}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
