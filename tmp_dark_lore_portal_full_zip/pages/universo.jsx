import React from 'react';
import HeroUniverse from '../components/HeroUniverse';
import LoreSection from '../components/LoreSection';
import CodexCard from '../components/CodexCard';
import RegionCard from '../components/RegionCard';
import Timeline from '../components/Timeline';
import BestiaryCard from '../components/BestiaryCard';
import ArchivePortal from '../components/ArchivePortal';

/**
 * Universo page: provides the full lore overview with narrative sections,
 * structure cards, regions grid, timeline, creatures preview and archive portals.
 */
const Universo = () => {
  const introduction = [
    'Há milênios, este mundo foi moldado por forças arcanas e conflitos antigos. Suas terras são marcadas por reinos decadentes, florestas sombrias e mares tempestuosos.',
    'Segredos esquecidos estão escondidos nas ruínas que resistem ao tempo, aguardando aqueles ousados o suficiente para desvendá‑los. As lendas contam sobre criaturas magníficas e artefatos de poder incalculável, guardados por facções em guerra.',
    'Explore este arquivo e descubra as crônicas de um mundo onde luz e sombra travam uma batalha eterna.'
  ];
  const structureCards = [
    {
      icon: '🏰',
      title: 'Reinos',
      description: 'Territórios governados por dinastias antigas, cada um com sua própria cultura e intrigas.'
    },
    {
      icon: '⚔️',
      title: 'Facções',
      description: 'Grupos de poderosos magos, guerreiros e guildas que disputam a supremacia sobre as terras.'
    },
    {
      icon: '🐉',
      title: 'Criaturas',
      description: 'Seres místicos e monstros lendários que habitam florestas, montanhas e mares.'
    },
    {
      icon: '🗡️',
      title: 'Artefatos',
      description: 'Objetos antigos impregnados de magia, capazes de mudar o curso da história.'
    },
    {
      icon: '📜',
      title: 'História',
      description: 'Crônicas que narram as eras, guerras e alianças que moldaram este mundo.'
    }
  ];
  const timelineData = [
    {
      title: 'Era I',
      description: 'A criação do mundo, quando os deuses forjaram as terras e plantaram as sementes da magia.'
    },
    {
      title: 'Era II',
      description: 'O surgimento das civilizações e das primeiras dinastias que ergueram monumentos grandiosos.'
    },
    {
      title: 'Era III',
      description: 'Guerras de poder entre reinos e facções, resultando em enormes cataclismos e sombras eternas.'
    },
    {
      title: 'Era IV',
      description: 'A busca pela harmonia e a redescoberta de conhecimento perdido, um novo despertar.'
    }
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
    }
  ];
  const portals = [
    {
      title: 'Criaturas',
      description: 'Descubra as feras, bestas e seres lendários que habitam este mundo.'
    },
    {
      title: 'Reinos',
      description: 'Explore os territórios, culturas e histórias dos reinos ancestrais.'
    },
    {
      title: 'Artefatos',
      description: 'Conheça objetos mágicos de poder incalculável e suas origens.'
    },
    {
      title: 'Crônicas',
      description: 'Leia relatos antigos de aventuras, guerras e alianças que moldaram o mundo.'
    }
  ];
  return (
    <main>
      <HeroUniverse />
      <LoreSection
        title="Introdução ao Mundo"
        text={introduction}
        imageSrc="/images/world_illustration.png"
      />
      <section className="py-12 px-4 md:px-8 lg:px-16 bg-tertiaryDark">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display text-softAmber mb-8 text-center">
            Estrutura do Mundo
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {structureCards.map((card) => (
              <CodexCard key={card.title} {...card} />
            ))}
          </div>
        </div>
      </section>
      <section className="py-12 px-4 md:px-8 lg:px-16 bg-primaryDark border-t border-deepCrimson">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display text-softAmber mb-8 text-center">
            Regiões e Facções
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regions.map((region) => (
              <RegionCard key={region.name} {...region} />
            ))}
          </div>
        </div>
      </section>
      <Timeline eras={timelineData} />
      <section className="py-12 px-4 md:px-8 lg:px-16 bg-secondaryDark">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display text-softAmber mb-8 text-center">
            Criaturas & Lendas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {creatures.map((creature) => (
              <BestiaryCard key={creature.name} {...creature} />
            ))}
          </div>
        </div>
      </section>
      <ArchivePortal portals={portals} />
    </main>
  );
};

export default Universo;