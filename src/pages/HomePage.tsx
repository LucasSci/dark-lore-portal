import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import { encyclopediaEntries } from "@/lib/encyclopedia";
import { archiveBrand, archiveReferenceArt } from "@/lib/archive-reference";
import { usePortalShellMode } from "@/lib/portal-state";
import { getWitcherBestiaryMetadata } from "@/lib/witcher-bestiary";

const featureCards = [
  {
    title: "Universo",
    description: "Rastros de reinos, linhagens partidas e historias soterradas pelas areias do continente.",
    path: "/universo",
    image: archiveReferenceArt.wanderer,
    cta: "Explorar Universo",
  },
  {
    title: "Bestiario",
    description: "Criaturas antigas, entidades abandonadas e dossies de caca preservados no arquivo.",
    path: "/bestiario",
    image: archiveReferenceArt.creature,
    cta: "Abrir Bestiario",
  },
  {
    title: "Cronicas",
    description: "Manuscritos velados, contratos, memorias de estrada e testemunhos que voltaram a respirar.",
    path: "/cronicas",
    image: archiveReferenceArt.desk,
    cta: "Explorar Cronicas",
  },
];

const bestiaryPreview = encyclopediaEntries
  .filter((entry) => entry.category === "monstros")
  .slice(0, 4);

export default function HomePage() {
  usePortalShellMode("editorial", "ambient");

  return (
    <div className="mx-auto max-w-[1320px] space-y-10 px-4 py-8 md:px-6 md:py-12">
      <section className="dark-lore-page-frame dark-lore-page-hero dark-lore-home-hero">
        <img
          src={archiveReferenceArt.hero}
          alt=""
          aria-hidden="true"
          className="dark-lore-hero-background"
        />
        <div className="dark-lore-grain-overlay" />
        <div className="dark-lore-candle-glow dark-lore-candle-glow-left" />
        <div className="dark-lore-candle-glow dark-lore-candle-glow-right" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="dark-lore-hero-copy dark-lore-hero-copy-centered"
        >
          <p className="dark-lore-section-kicker justify-center">{archiveBrand.subtitle}</p>
          <h1 className="dark-lore-display-title">{archiveBrand.title}</h1>
          <p className="dark-lore-hero-text max-w-3xl text-center">
            {archiveBrand.heroLine}
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link to="/universo" className="dark-lore-button">
              Explorar Universo
            </Link>
            <Link to="/jogar" className="dark-lore-button dark-lore-button-ghost">
              Entrar para Jogar
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="dark-lore-feature-grid">
        {featureCards.map((card, index) => (
          <motion.article
            key={card.title}
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, delay: index * 0.08 }}
            className="dark-lore-feature-card"
          >
            <div className="dark-lore-feature-image-wrap">
              <img src={card.image} alt="" aria-hidden="true" className="dark-lore-feature-image" />
            </div>
            <div className="dark-lore-feature-body">
              <h2 className="dark-lore-card-title">{card.title}</h2>
              <p className="dark-lore-card-copy">{card.description}</p>
              <Link to={card.path} className="dark-lore-button dark-lore-button-small">
                {card.cta}
              </Link>
            </div>
          </motion.article>
        ))}
      </section>

      <section className="dark-lore-page-frame dark-lore-editorial-grid">
        <div className="dark-lore-editorial-copy">
          <p className="dark-lore-section-kicker">O Chamado</p>
          <h2 className="dark-lore-section-title">O arquivo desperta antes da leitura.</h2>
          <p className="dark-lore-editorial-text">
            Entre pedra escurecida, brasa fria e paginas marcadas por poeira, repousa um arquivo
            de nomes proibidos. Ali, criaturas recebem contorno, ruinas recuperam memoria e
            cronicas de estrada retornam como se nunca tivessem sido encerradas.
          </p>
          <p className="dark-lore-editorial-text">
            Universo, bestiario, cronicas, cartografia e sessao partilham o mesmo eixo de leitura,
            com Areias de Zerrikania servindo de selo para tudo o que e aberto aqui.
          </p>
          <Link to="/jogar" className="dark-lore-button dark-lore-button-ghost">
            Abrir a camara de sessao
          </Link>
        </div>

        <div className="dark-lore-editorial-figure">
          <img
            src={archiveReferenceArt.forgotten}
            alt=""
            aria-hidden="true"
            className="dark-lore-editorial-image"
          />
          <div className="dark-lore-editorial-glow" />
        </div>
      </section>

      <section className="dark-lore-page-frame px-6 py-8 md:px-8 md:py-10">
        <div className="space-y-6">
          <div className="text-center">
            <p className="dark-lore-section-kicker justify-center">Dossies do bestiario</p>
            <h2 className="dark-lore-section-title mx-auto">Quatro presencas ja despertas</h2>
          </div>

          <div className="dark-lore-bestiary-grid">
            {bestiaryPreview.map((entry, index) => {
              const metadata = getWitcherBestiaryMetadata(entry.slug);

              return (
                <motion.article
                  key={entry.slug}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.5, delay: index * 0.06 }}
                  className="dark-lore-beast-card"
                >
                  <div className="dark-lore-beast-image-wrap">
                    <img src={entry.image} alt={entry.imageAlt} className="dark-lore-beast-image" />
                  </div>
                  <div className="dark-lore-beast-body">
                    <h3 className="dark-lore-card-title text-[clamp(1.55rem,2vw,2rem)]">
                      {entry.title}
                    </h3>
                    <p className="dark-lore-card-meta">
                      {metadata?.type ?? "Entidade"}
                      {metadata ? ` · Perigo ${metadata.dangerLevel}/5` : ""}
                    </p>
                    <p className="dark-lore-card-copy">{entry.summary}</p>
                    <Link
                      to={`/bestiario/${entry.slug}`}
                      className="dark-lore-button dark-lore-button-small"
                    >
                      Ver ficha
                    </Link>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="dark-lore-cta-band">
        <p className="dark-lore-cta-line">As paginas ainda respiram.</p>
        <Link to="/jogar" className="dark-lore-button">
          Entrar no Arquivo
        </Link>
      </section>
    </div>
  );
}
