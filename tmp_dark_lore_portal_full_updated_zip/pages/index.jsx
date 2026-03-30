import React from 'react';
import HeroHome from '../components/HeroHome';
import LoreSection from '../components/LoreSection';
import CodexCard from '../components/CodexCard';
import ArchivePortal from '../components/ArchivePortal';
import Link from 'next/link';

/**
 * Home page for the Dark Lore Portal. Introduces the site and highlights
 * the primary categories available for exploration.
 */
const Home = () => {
  const intro = [
    'O Dark Lore Portal é um compêndio interativo de histórias, criaturas, artefatos e reinos de um mundo de fantasia sombria.',
    'Aqui você poderá explorar eras antigas, descobrir facções em guerra e aprender sobre seres lendários que habitam terras inexploradas.',
    'Prepare‑se para uma jornada cheia de mistérios, magia e aventuras.'
  ];
  // Features to showcase on the home page
  const features = [
    {
      icon: '🌌',
      title: 'Universo',
      description: 'Conheça a origem, as eras e a cosmologia deste mundo.',
      href: '/universo'
    },
    {
      icon: '🐲',
      title: 'Criaturas',
      description: 'Um bestiário com monstros, feras e lendas antigas.',
      href: '/criaturas'
    },
    {
      icon: '🏰',
      title: 'Reinos',
      description: 'Explore as nações, seus líderes e conflitos.',
      href: '/reinos'
    },
    {
      icon: '🗝️',
      title: 'Artefatos',
      description: 'Descubra objetos de poder que moldam o destino.',
      href: '/artefatos'
    },
    {
      icon: '📖',
      title: 'Crônicas',
      description: 'Leia contos e histórias que narram grandes aventuras.',
      href: '/cronicas'
    }
  ];
  // Portals for deep exploration
  const portals = features.map(({ title, description, href }) => ({ title, description }));
  return (
    <main>
      <HeroHome />
      <LoreSection
        title="Sobre o Portal"
        text={intro}
        imageSrc="/images/world_illustration.png"
      />
      <section className="py-12 px-4 md:px-8 lg:px-16 bg-tertiaryDark">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display text-softAmber mb-8 text-center">
            O que você vai encontrar
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {features.map(({ icon, title, description, href }) => (
              <Link href={href} key={title} className="block">
                <CodexCard icon={icon} title={title} description={description} />
              </Link>
            ))}
          </div>
        </div>
      </section>
      <ArchivePortal portals={portals} />
    </main>
  );
};

export default Home;