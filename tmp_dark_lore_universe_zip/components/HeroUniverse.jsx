import React from 'react';
import OrnamentalDivider from './OrnamentalDivider';

/**
 * HeroUniverse renders the cinematic landing section of the Universe page.  
 * It uses a full‑screen background image (specified via Tailwind's custom
 * background classes) with a dark overlay and displays the page title and
 * subtitle centrally. The ornamental divider adds a touch of fantasy flair.
 */
const HeroUniverse = () => {
  return (
    <section
      className="relative h-screen flex items-center justify-center bg-hero bg-center bg-cover"
    >
      {/* Dark overlay to improve text readability */}
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