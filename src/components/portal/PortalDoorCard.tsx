import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

type PortalDoorCardProps = {
  title: string;
  description: string;
  to: string;
  cta: string;
  icon: LucideIcon;
  image?: string;
};

export default function PortalDoorCard({
  title,
  description,
  to,
  cta,
  icon: Icon,
  image,
}: PortalDoorCardProps) {
  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      className="dark-lore-door-card"
    >
      <Link to={to} className="dark-lore-door-card-link">
        <div className="dark-lore-door-media">
          {image ? <img src={image} alt="" aria-hidden="true" className="dark-lore-door-image" /> : null}
          <div className="dark-lore-door-overlay" />
          <div className="dark-lore-door-icon-ring" aria-label={title}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <div className="dark-lore-door-content">
          <h3 className="dark-lore-card-title text-[clamp(1.85rem,2.4vw,2.45rem)]">{title}</h3>
          <p className="dark-lore-card-copy">{description}</p>
        </div>
        <span className="dark-lore-button dark-lore-button-small">{cta}</span>
      </Link>
    </motion.article>
  );
}
