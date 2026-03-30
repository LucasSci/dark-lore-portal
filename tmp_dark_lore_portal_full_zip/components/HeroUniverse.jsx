import React from 'react';
import OrnamentalDivider from './OrnamentalDivider';

/**
 * HeroUniverse renders the cinematic hero section for the Universo page.
 */
const HeroUniverse = () => {
  return (
    <section className="relative h-screen flex items-center justify-center bg-hero bg-center bg-cover">
      <div className="absolute inset-0 bg-black/70" />
      <div className="relative z-10 text-center px-4">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-display text-antiqueGold drop-shadow-lg">
          UNIVERSO
        </h1>
        <p className="mt-4 text-lg md:text-2xl italic text-softAmber max-w-3xl mx-auto">
          Crônicas de um Mundo Antigo
        </p>
        <OrnamentalDivider />
      </div>
    </section>
  );
};

export default HeroUniverse;