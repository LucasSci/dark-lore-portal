import { memo, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

type HeroEmbersProps = {
  count?: number;
  className?: string;
};

type EmberParticle = {
  id: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
  depth: number;
};

function HeroEmbers({ count = 28, className }: HeroEmbersProps) {
  const reduceMotion = useReducedMotion();

  const particles = useMemo<EmberParticle[]>(
    () =>
      Array.from({ length: count }, (_, index) => ({
        id: index,
        left: (index * 13.7) % 100,
        size: 2 + ((index * 7) % 5),
        delay: (index * 0.31) % 3.8,
        duration: 6 + (index % 6),
        depth: 0.4 + ((index * 11) % 7) * 0.08,
      })),
    [count],
  );

  return (
    <div className={`dark-lore-embers-layer ${className ?? ""}`.trim()} aria-hidden="true">
      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="dark-lore-ember"
          style={{
            left: `${particle.left}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.depth,
          }}
          initial={
            reduceMotion
              ? { opacity: particle.depth * 0.7 }
              : { y: 56, opacity: 0, scale: 0.8 }
          }
          animate={
            reduceMotion
              ? { opacity: particle.depth * 0.7 }
              : {
                  y: -420,
                  opacity: [0, particle.depth, particle.depth * 0.72, 0],
                  x: [0, -8, 10, -4],
                  scale: [0.75, 1, 1.06, 0.9],
                }
          }
          transition={
            reduceMotion
              ? undefined
              : {
                  duration: particle.duration,
                  delay: particle.delay,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }
          }
        />
      ))}
    </div>
  );
}

export default memo(HeroEmbers);
