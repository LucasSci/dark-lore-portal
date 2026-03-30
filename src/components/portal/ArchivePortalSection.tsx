import { motion } from "framer-motion";
import { Link } from "react-router-dom";

type ArchivePortalItem = {
  title: string;
  description: string;
  to: string;
  cta?: string;
};

type ArchivePortalSectionProps = {
  kicker?: string;
  title: string;
  description?: string;
  items: ArchivePortalItem[];
};

export default function ArchivePortalSection({
  kicker = "Explore o arquivo",
  title,
  description,
  items,
}: ArchivePortalSectionProps) {
  return (
    <section className="dark-lore-page-frame px-6 py-8 md:px-8 md:py-10">
      <div className="space-y-6">
        <div className="text-center">
          <p className="dark-lore-section-kicker justify-center">{kicker}</p>
          <h2 className="dark-lore-section-title mx-auto">{title}</h2>
          {description ? (
            <p className="mx-auto max-w-3xl text-sm leading-8 text-[hsl(var(--foreground)/0.76)] md:text-base">
              {description}
            </p>
          ) : null}
        </div>

        <div className="dark-lore-archive-portal-grid">
          {items.map((item, index) => (
            <motion.article
              key={`${item.to}-${item.title}`}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: index * 0.05 }}
              className="dark-lore-archive-card dark-lore-archive-portal-card"
            >
              <Link to={item.to} className="dark-lore-archive-portal-link">
                <div className="space-y-3">
                  <h3 className="dark-lore-card-title text-[clamp(1.5rem,2vw,1.95rem)]">{item.title}</h3>
                  <p className="dark-lore-card-copy">{item.description}</p>
                </div>
                <span className="dark-lore-button dark-lore-button-small">
                  {item.cta ?? "Abrir"}
                </span>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
