import { cn } from "@/lib/utils";

type RitualSectionHeadingProps = {
  kicker: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
};

export default function RitualSectionHeading({
  kicker,
  title,
  description,
  align = "left",
  className,
  titleClassName,
  descriptionClassName,
}: RitualSectionHeadingProps) {
  return (
    <div
      className={cn(
        "dark-lore-section-intro",
        align === "center" && "is-centered",
        className,
      )}
    >
      <p className={cn("dark-lore-section-kicker", align === "center" && "justify-center")}>
        {kicker}
      </p>
      <h2 className={cn("dark-lore-section-title", titleClassName)}>{title}</h2>
      <div className="dark-lore-divider" aria-hidden="true" />
      {description ? (
        <p className={cn("dark-lore-section-description", descriptionClassName)}>{description}</p>
      ) : null}
    </div>
  );
}
