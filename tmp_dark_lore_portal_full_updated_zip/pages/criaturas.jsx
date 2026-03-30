import React from 'react';
import BestiaryCard from '../components/BestiaryCard';
import OrnamentalDivider from '../components/OrnamentalDivider';

/**
 * Page showcasing the creatures of the world. Presents a brief introduction
 * followed by a grid of cards describing each creature.
 */
const Criaturas = () => {
  // Termo de busca para filtrar criaturas por nome ou classificação
  const [searchTerm, setSearchTerm] = React.useState('');
  // Texto introdutório explicando o bestiário
  const introduction = [
    'Ao explorar este bestiário, você encontrará uma coleção de criaturas extraordinárias que habitam o mundo de fantasia.',
    'De dragões imponentes a seres furtivos das sombras, cada entrada revela detalhes sobre sua origem, poderes e lendas associadas.'
  ];
  const creatures = [
    {
      name: 'Dragão das Chamas Eternas',
      classification: 'Criatura Lendária',
      imageSrc: '/images/world_illustration.png',
      slug: 'dragao-das-chamas-eternas'
    },
    {
      name: 'Serpente do Abismo',
      classification: 'Monstro Marinho',
      imageSrc: '/images/world_illustration.png',
      slug: 'serpente-do-abismo'
    },
    {
      name: 'Fênix Sombria',
      classification: 'Ave Mítica',
      imageSrc: '/images/world_illustration.png',
      slug: 'fenix-sombria'
    },
    {
      name: 'Licantropo',
      classification: 'Ser Transformador',
      imageSrc: '/images/world_illustration.png',
      slug: 'licantropo'
    },
    {
      name: 'Quimera',
      classification: 'Aberração',
      imageSrc: '/images/world_illustration.png',
      slug: 'quimera'
    },
    {
      name: 'Espectro do Norte',
      classification: 'Entidade Fantasmagórica',
      imageSrc: '/images/world_illustration.png',
      slug: 'espectro-do-norte'
    },
    {
      name: 'Basilisco',
      classification: 'Serpente Mortal',
      imageSrc: '/images/world_illustration.png',
      slug: 'basilisco'
    },
    {
      name: 'Grifo',
      classification: 'Criatura Alada',
      imageSrc: '/images/world_illustration.png',
      slug: 'grifo'
    },
    {
      name: 'Golem de Pedra',
      classification: 'Construto Ancestral',
      imageSrc: '/images/world_illustration.png',
      slug: 'golem-de-pedra'
    }
  ];
  // Filtra a lista de criaturas usando o termo de busca. Caso nenhum termo seja
  // fornecido, retorna a lista completa.
  const filteredCreatures = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return creatures;
    return creatures.filter((creature) => {
      const nameMatch = creature.name.toLowerCase().includes(term);
      const classMatch = creature.classification.toLowerCase().includes(term);
      return nameMatch || classMatch;
    });
  }, [searchTerm, creatures]);

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
      {/* Campo de busca */}
      <section className="py-4 px-4 md:px-8 lg:px-16 bg-secondaryDark border-b border-deepCrimson">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <label htmlFor="search-creature" className="sr-only">
            Procurar criatura ou classificação
          </label>
          <input
            id="search-creature"
            type="text"
            placeholder="Buscar por nome ou tipo de criatura..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-1/2 px-4 py-2 border border-antiqueGold rounded-lg bg-primaryDark text-antiqueGold placeholder:text-softAmber focus:outline-none focus:ring-2 focus:ring-softAmber"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="px-4 py-2 text-sm bg-deepCrimson text-antiqueGold rounded-lg hover:bg-deepCrimson/80 transition"
            >
              Limpar
            </button>
          )}
        </div>
      </section>
      {/* Creatures grid */}
      <section className="py-12 px-4 md:px-8 lg:px-16 bg-secondaryDark">
        <div className="max-w-6xl mx-auto">
          {/* Exibe mensagem caso nenhuma criatura seja encontrada */}
          {filteredCreatures.length === 0 ? (
            <p className="text-softAmber text-center py-8">Nenhuma criatura encontrada.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCreatures.map((creature) => (
                <BestiaryCard key={creature.name} {...creature} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default Criaturas;