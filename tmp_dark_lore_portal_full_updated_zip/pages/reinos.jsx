import React from 'react';
import RegionCard from '../components/RegionCard';
import OrnamentalDivider from '../components/OrnamentalDivider';

/**
 * Page showcasing the realms and factions of the world.
 */
const Reinos = () => {
  const introduction = [
    'Os reinos deste mundo são diversos, cada um com sua própria cultura, governos e ambições.',
    'Das montanhas sombrias às vastas planícies, as facções lutam pelo poder e pela sobrevivência.'
  ];
  const regions = [
    {
      name: 'Floresta Sussurrante',
      description: 'Uma vasta floresta onde as árvores parecem sussurrar segredos antigos aos viajantes.',
      imageSrc: '/images/world_illustration.png'
    },
    {
      name: 'Montanhas Sombrias',
      description: 'Picos íngremes envoltos em névoa, lar de dragões e criaturas ancestrais.',
      imageSrc: '/images/world_illustration.png'
    },
    {
      name: 'Ruínas do Império',
      description: 'Restos de uma civilização outrora gloriosa, agora engolida pela vegetação e pelo tempo.',
      imageSrc: '/images/world_illustration.png'
    },
    {
      name: 'Praias do Crepúsculo',
      description: 'Costas onde o sol nunca se ergue completamente, banhadas por mares bioluminescentes.',
      imageSrc: '/images/world_illustration.png'
    },
    {
      name: 'Cavernas de Cristal',
      description: 'Cavernas subterrâneas cheias de cristais brilhantes que amplificam energia mágica.',
      imageSrc: '/images/world_illustration.png'
    },
    {
      name: 'Cidade de Ébano',
      description: 'Uma metrópole obscura construída em pedra negra, centro de comércio e intrigas.',
      imageSrc: '/images/world_illustration.png'
    }
  ];
  return (
    <main>
      {/* Hero */}
      <section className="relative h-64 md:h-80 flex items-center justify-center bg-hero bg-center bg-cover">
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-6xl font-display text-antiqueGold drop-shadow-lg">Reinos</h1>
          <p className="mt-2 text-softAmber italic">Terras e facções</p>
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
      {/* Regions grid */}
      <section className="py-12 px-4 md:px-8 lg:px-16 bg-secondaryDark">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regions.map((region) => (
              <RegionCard key={region.name} {...region} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Reinos;