import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

import PageContainer from "./PageContainer";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  containerSize?: "narrow" | "default" | "wide" | "full";
  contentClassName?: string;
}

export default function Section({
  eyebrow,
  title,
  description,
  actions,
  children,
  className,
  containerSize = "default",
  contentClassName,
  ...props
}: SectionProps) {
  return (
    <section className={cn("space-y-8 md:space-y-10", className)} {...props}>
      <PageContainer size={containerSize} className={cn("space-y-6", contentClassName)}>
        {eyebrow || title || description || actions ? (
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-3">
              {eyebrow ? <p className="section-kicker">{eyebrow}</p> : null}
              {title ? (
                <h2 className="max-w-4xl font-display text-4xl leading-[0.94] text-brand-gradient md:text-5xl">
                  {title}
                </h2>
              ) : null}
              {description ? (
                <p className="max-w-[68ch] text-sm leading-8 text-foreground/76 md:text-base">
                  {description}
                </p>
              ) : null}
            </div>

            {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
          </div>
        ) : null}

        {children}
      </PageContainer>
    </section>
  );
}
