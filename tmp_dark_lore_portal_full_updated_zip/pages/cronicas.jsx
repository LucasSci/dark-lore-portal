import React from 'react';
import CodexCard from '../components/CodexCard';
import OrnamentalDivider from '../components/OrnamentalDivider';

/**
 * Page for chronicles and stories of the world.
 */
const Cronicas = () => {
  const introduction = [
    'As crônicas registram as aventuras, guerras e intrigas que definiram o destino do mundo.',
    'Cada conto revela um fragmento do passado e ilumina o caminho para o futuro.'
  ];
  const stories = [
    {
      icon: '📜',
      title: 'A Queda do Império',
      description: 'História do colapso de um império outrora grandioso sob o peso de sua própria corrupção.'
    },
    {
      icon: '⚔️',
      title: 'A Batalha das Sombras',
      description: 'O relato épico de uma guerra onde heróis e monstros lutaram pelo controle da magia.'
    },
    {
      icon: '🏹',
      title: 'A Caçada ao Dragão',
      description: 'A jornada de um grupo de aventureiros em busca de um dragão lendário.'
    },
    {
      icon: '🧙‍♂️',
      title: 'O Destino do Mago',
      description: 'Uma saga sobre o mago que desafiou os deuses para salvar seu povo.'
    },
    {
      icon: '🚪',
      title: 'A Porta Proibida',
      description: 'O mistério de uma porta selada que leva a mundos inimagináveis.'
    },
    {
      icon: '💀',
      title: 'As Crônicas da Morte',
      description: 'Relatos sombrios sobre aqueles que desafiaram a morte — e as consequências.'
    }
  ];
  return (
    <main>
      {/* Hero */}
      <section className="relative h-64 md:h-80 flex items-center justify-center bg-hero bg-center bg-cover">
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-6xl font-display text-antiqueGold drop-shadow-lg">Crônicas</h1>
          <p className="mt-2 text-softAmber italic">Histórias e Contos</p>
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
      {/* Stories grid */}
      <section className="py-12 px-4 md:px-8 lg:px-16 bg-secondaryDark">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <CodexCard key={story.title} {...story} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Cronicas;