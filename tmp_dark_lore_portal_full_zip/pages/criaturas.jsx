import React from 'react';
import BestiaryCard from '../components/BestiaryCard';
import OrnamentalDivider from '../components/OrnamentalDivider';

/**
 * Page showcasing the creatures of the world. Presents a brief introduction
 * followed by a grid of cards describing each creature.
 */
const Criaturas = () => {
  const introduction = [
    'Ao explorar este bestiário, você encontrará uma coleção de criaturas extraordinárias que habitam o mundo de fantasia.',
    'De dragões imponentes a seres furtivos das sombras, cada entrada revela detalhes sobre sua origem, poderes e lendas associadas.'
  ];
  const creatures = [
    {
      name: 'Dragão das Chamas Eternas',
      classification: 'Criatura Lendária',
      imageSrc: '/images/world_illustration.png'
    },
    {
      name: 'Serpente do Abismo',
      classification: 'Monstro Marinho',
      imageSrc: '/images/world_illustration.png'
    },
    {
      name: 'Fênix Sombria',
      classification: 'Ave Mítica',
      imageSrc: '/images/world_illustration.png'
    },
    {
      name: 'Licantropo',
      classification: 'Ser Transformador',
      imageSrc: '/images/world_illustration.png'
    },
    {
      name: 'Quimera',
      classification: 'Aberração',
      imageSrc: '/images/world_illustration.png'
    },
    {
      name: 'Espectro do Norte',
      classification: 'Entidade Fantasmagórica',
      imageSrc: '/images/world_illustration.png'
    },
    {
      name: 'Basilisco',
      classification: 'Serpente Mortal',
      imageSrc: '/images/world_illustration.png'
    },
    {
      name: 'Grifo',
      classification: 'Criatura Alada',
      imageSrc: '/images/world_illustration.png'
    },
    {
      name: 'Golem de Pedra',
      classification: 'Construto Ancestral',
      imageSrc: '/images/world_illustration.png'
    }
  ];
  return (
    <main>
      {/* Hero section */}
      <section className="relative h-64 md:h-80 flex items-center justify-center bg-hero bg-center bg-cover">
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-6xl font-display text-antiqueGold drop-shadow-lg">Criaturas</h1>
          <p className="mt-2 text-softAmber italic">Bestiário do mundo</p>
        </div>
      </section>
      {/* Introduction */}
      <section className="py-12 px-4 md:px-8 lg:px-16 bg-parchment bg-cover bg-center">
        <div className="max-w-6xl mx-auto text-secondaryDark">
          {introduction.map((paragraph, idx) => (
            <p key={idx} className="text-lg leading-relaxed mb-4">
              {paragraph}
            </p>
          ))}
          <OrnamentalDivider />
        </div>
      </section>
      {/* Creatures grid */}
      <section className="py-12 px-4 md:px-8 lg:px-16 bg-secondaryDark">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {creatures.map((creature) => (
              <BestiaryCard key={creature.name} {...creature} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Criaturas;