import React from 'react';
import { useRouter } from 'next/router';
import BestiaryCard from '../../components/BestiaryCard';
import OrnamentalDivider from '../../components/OrnamentalDivider';

// Dados temporários das criaturas. Em uma aplicação real, isso deve ser
// substituído por dados vindos de um CMS ou arquivo JSON.
const creatures = [
  {
    name: 'Dragão das Chamas Eternas',
    classification: 'Criatura Lendária',
    imageSrc: '/images/world_illustration.png',
    slug: 'dragao-das-chamas-eternas',
    description:
      'Forjado nas fornalhas do tempo, o Dragão das Chamas Eternas mantém um fogo que nunca se apaga. Suas escamas brilham como brasas e sua lenda inspira temor e reverência.'
  },
  {
    name: 'Serpente do Abismo',
    classification: 'Monstro Marinho',
    imageSrc: '/images/world_illustration.png',
    slug: 'serpente-do-abismo',
    description:
      'Habitante das profundezas mais escuras dos mares, a Serpente do Abismo raramente é vista pela superfície. Reza a lenda que seu olhar pode hipnotizar qualquer marinheiro.'
  },
  {
    name: 'Fênix Sombria',
    classification: 'Ave Mítica',
    imageSrc: '/images/world_illustration.png',
    slug: 'fenix-sombria',
    description:
      'Renascendo das cinzas de seus próprios desastres, a Fênix Sombria simboliza a esperança em meio à escuridão, elevando‑se novamente quando o mundo pensa que ela pereceu.'
  },
  {
    name: 'Licantropo',
    classification: 'Ser Transformador',
    imageSrc: '/images/world_illustration.png',
    slug: 'licantropo',
    description:
      'Entre o homem e a fera, o Licantropo vive uma eterna batalha interna. Seu uivo ressoa pelas florestas, alertando viajantes incautos.'
  },
  {
    name: 'Quimera',
    classification: 'Aberração',
    imageSrc: '/images/world_illustration.png',
    slug: 'quimera',
    description:
      'Com cabeça de leão, corpo de cabra e cauda de serpente, a Quimera é uma amalgama de terrores. Suas múltiplas formas representam a instabilidade da própria magia.'
  },
  {
    name: 'Espectro do Norte',
    classification: 'Entidade Fantasmagórica',
    imageSrc: '/images/world_illustration.png',
    slug: 'espectro-do-norte',
    description:
      'Dizem que o Espectro do Norte é a alma de um antigo rei traído, condenado a vagar pelas nevascas eternas. Sua presença traz uma ventania gélida e sussurros de vingança.'
  },
  {
    name: 'Basilisco',
    classification: 'Serpente Mortal',
    imageSrc: '/images/world_illustration.png',
    slug: 'basilisco',
    description:
      'Com um olhar venenoso capaz de petrificar, o Basilisco é temido por todas as criaturas. Seu rastro deixa um caminho de pedra e desolação.'
  },
  {
    name: 'Grifo',
    classification: 'Criatura Alada',
    imageSrc: '/images/world_illustration.png',
    slug: 'grifo',
    description:
      'Nobre e majestoso, o Grifo combina a força do leão com a agilidade da águia. Os grifos escolhem apenas os guerreiros mais valorosos como companheiros de voo.'
  },
  {
    name: 'Golem de Pedra',
    classification: 'Construto Ancestral',
    imageSrc: '/images/world_illustration.png',
    slug: 'golem-de-pedra',
    description:
      'Criados pelos magos antigos, os Golems de Pedra são guardiões incansáveis. Sua pele de rocha é quase impenetrável, e eles seguem ordens sem questionar.'
  }
];

const CreaturePage = () => {
  const router = useRouter();
  const { slug } = router.query;

  // Encontrar criatura baseada no slug
  const creature = creatures.find((c) => c.slug === slug);

  if (!creature) {
    return (
      <main className="py-20 text-center text-softAmber">
        <h2 className="text-3xl font-display mb-4">Criatura não encontrada</h2>
        <p>Não foi possível encontrar a criatura solicitada.</p>
      </main>
    );
  }

  return (
    <main>
      {/* Hero com nome da criatura */}
      <section className="relative h-64 md:h-80 flex items-center justify-center bg-hero bg-center bg-cover">
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-6xl font-display text-antiqueGold drop-shadow-lg">
            {creature.name}
          </h1>
          <p className="mt-2 text-softAmber italic">{creature.classification}</p>
        </div>
      </section>
      {/* Corpo da criatura */}
      <section className="py-12 px-4 md:px-8 lg:px-16 bg-parchment bg-cover bg-center">
        <div className="max-w-5xl mx-auto text-secondaryDark">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/2 h-64 md:h-96 rounded-lg overflow-hidden shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={creature.imageSrc}
                alt={`${creature.name} — ${creature.classification}`}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="md:w-1/2 flex flex-col justify-center">
              <p className="text-lg leading-relaxed mb-4">{creature.description}</p>
            </div>
          </div>
          <OrnamentalDivider />
        </div>
      </section>
    </main>
  );
};

export default CreaturePage;