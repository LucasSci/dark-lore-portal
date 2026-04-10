import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type SectionIntroProps = {
  eyebrow: string;
  title: string;
  copy: string;
  align?: "left" | "center";
};

export function SozSectionIntro({
  eyebrow,
  title,
  copy,
  align = "left",
}: SectionIntroProps) {
  return (
    <div className={`soz-section-intro ${align === "center" ? "is-centered" : ""}`}>
      <p className="soz-eyebrow">{eyebrow}</p>
      <h2 className="soz-section-title">{title}</h2>
      <p className="soz-section-copy">{copy}</p>
    </div>
  );
}

export function SozInfoCard({
  title,
  copy,
  meta,
  action,
  className = "",
}: {
  title: string;
  copy: string;
  meta?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <article className={`soz-info-card ${className}`.trim()}>
      {meta ? <div className="soz-info-meta">{meta}</div> : null}
      <h3 className="soz-card-title">{title}</h3>
      <p className="soz-card-copy">{copy}</p>
      {action ? <div className="soz-card-action">{action}</div> : null}
    </article>
  );
}

export function SozTimelineList({
  items,
}: {
  items: Array<{ eyebrow: string; title: string; description: string }>;
}) {
  return (
    <div className="soz-timeline">
      <div className="soz-timeline-line" aria-hidden="true" />
      <div className="soz-timeline-list">
        {items.map((item, index) => (
          <div key={`${item.eyebrow}-${item.title}`} className="soz-timeline-item">
            <div className="soz-timeline-dot">{String(index + 1).padStart(2, "0")}</div>
            <article className="soz-timeline-card">
              <p className="soz-card-meta">{item.eyebrow}</p>
              <h3 className="soz-card-title">{item.title}</h3>
              <p className="soz-card-copy">{item.description}</p>
            </article>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SozInlineLink({
  to,
  children,
}: {
  to: string;
  children: ReactNode;
}) {
  return (
    <Link to={to} className="soz-inline-link">
      {children}
    </Link>
  );
}
