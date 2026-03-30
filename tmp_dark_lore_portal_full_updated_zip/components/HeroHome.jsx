import React from 'react';
import Link from 'next/link';
import OrnamentalDivider from './OrnamentalDivider';

/**
 * Hero section for the home page. It sets the tone of the portal and invites
 * users to begin exploring the world via a call‑to‑action button.
 */
const HeroHome = () => {
  return (
    <section className="relative h-screen flex items-center justify-center bg-hero bg-center bg-cover">
      <div className="absolute inset-0 bg-black/70" />
      <div className="relative z-10 text-center px-4">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-display text-antiqueGold drop-shadow-lg">
          Bem‑vindo ao Portal das Lendas
        </h1>
        <p className="mt-4 text-lg md:text-2xl italic text-softAmber max-w-3xl mx-auto">
          Descubra a magia, a história e os segredos de um mundo antigo.
        </p>
        <OrnamentalDivider />
        <Link
          href="/universo"
          className="inline-block mt-6 px-6 py-3 border-2 border-antiqueGold text-antiqueGold hover:bg-antiqueGold hover:text-primaryDark transition-colors rounded-lg font-display"
        >
          Explorar o Universo
        </Link>
      </div>
    </section>
  );
};

export default HeroHome;