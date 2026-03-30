import React from 'react';
import CodexCard from '../components/CodexCard';
import OrnamentalDivider from '../components/OrnamentalDivider';

/**
 * Page showcasing powerful artifacts of the world.
 */
const Artefatos = () => {
  const introduction = [
    'Os artefatos deste mundo são objetos raros, imbuídos com poderes além da compreensão mortal.',
    'Forjados por deuses, magos ou forças desconhecidas, eles podem alterar o curso da história nas mãos certas — ou erradas.'
  ];
  const artifacts = [
    {
      icon: '🗡️',
      title: 'Espada do Caos',
      description: 'Uma lâmina forjada no coração de um vulcão, capaz de cortar a realidade.'
    },
    {
      icon: '🧭',
      title: 'Bússola do Destino',
      description: 'Sempre aponta para aquilo que o portador mais deseja, seja ele bom ou mau.'
    },
    {
      icon: '📿',
      title: 'Amuleto da Eternidade',
      description: 'Concede vida eterna a quem o usar, mas a um preço terrível.'
    },
    {
      icon: '🧿',
      title: 'Olho do Vidente',
      description: 'Permite ao seu dono ver todos os eventos do passado e do futuro.'
    },
    {
      icon: '📜',
      title: 'Pergaminho de Fluxo Temporal',
      description: 'Capaz de reverter ou acelerar o tempo em um local específico.'
    },
    {
      icon: '🔮',
      title: 'Esfera do Vazio',
      description: 'Pode criar um portal para uma dimensão desconhecida de puro nada.'
    }
  ];
  return (
    <main>
      {/* Hero */}
      <section className="relative h-64 md:h-80 flex items-center justify-center bg-hero bg-center bg-cover">
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-6xl font-display text-antiqueGold drop-shadow-lg">Artefatos</h1>
          <p className="mt-2 text-softAmber italic">Relíquias de poder</p>
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
      {/* Artifacts grid */}
      <section className="py-12 px-4 md:px-8 lg:px-16 bg-secondaryDark">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {artifacts.map((artifact) => (
              <CodexCard key={artifact.title} {...artifact} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Artefatos;