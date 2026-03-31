import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import HeroEmbers from "@/components/portal/HeroEmbers";

type HeroAction = {
  label: string;
  to: string;
  variant?: "primary" | "secondary";
};

type PortalHeroSectionProps = {
  kicker: string;
  titleTop: string;
  titleBottom: string;
  tagline: string;
  backgroundImage: string;
  actions: HeroAction[];
};

export default function PortalHeroSection({
  kicker,
  titleTop,
  titleBottom,
  tagline,
  backgroundImage,
  actions,
}: PortalHeroSectionProps) {
  return (
    <section className="dark-lore-page-frame dark-lore-page-hero dark-lore-home-hero">
      <img src={backgroundImage} alt="" aria-hidden="true" className="dark-lore-hero-background" />
      <div className="dark-lore-hero-vignette" />
      <div className="dark-lore-grain-overlay" />
      <HeroEmbers />
      <div className="dark-lore-candle-glow dark-lore-candle-glow-left" />
      <div className="dark-lore-candle-glow dark-lore-candle-glow-right" />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="dark-lore-hero-copy dark-lore-hero-copy-centered"
      >
        <span className="dark-lore-portal-sigil" aria-hidden="true" />
        <p className="dark-lore-section-kicker justify-center">{kicker}</p>
        <h1 className="dark-lore-display-title dark-lore-display-title-wide">
          <span className="gold-gradient-text block">{titleTop}</span>
          <span className="gold-gradient-text block">{titleBottom}</span>
        </h1>
        <p className="dark-lore-hero-text dark-lore-hero-tagline max-w-3xl text-center">{tagline}</p>
        <div className="dark-lore-divider" aria-hidden="true" />
        <div className="flex flex-wrap justify-center gap-3 pt-3">
          {actions.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className={
                action.variant === "secondary"
                  ? "dark-lore-button dark-lore-button-ghost"
                  : "dark-lore-button"
              }
            >
              {action.label}
            </Link>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
