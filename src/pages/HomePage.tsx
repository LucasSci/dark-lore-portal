import { BookMarked, Compass, ScrollText, Skull, Swords } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import ArchivePortalSection from "@/components/portal/ArchivePortalSection";
import { encyclopediaEntries } from "@/lib/encyclopedia";
import { archiveBrand, archiveReferenceArt } from "@/lib/archive-reference";
import { usePortalShellMode } from "@/lib/portal-state";
import { getWitcherBestiaryMetadata } from "@/lib/witcher-bestiary";

const featureCards = [
  {
    title: "Universo",
    description: "Reinos esquecidos, linhagens partidas e nomes soterrados sob o mesmo arquivo.",
    path: "/universo",
    image: archiveReferenceArt.wanderer,
    cta: "Explorar Universo",
  },
  {
    title: "Bestiario",
    description: "Criaturas antigas, entidades sem repouso e dossies de caca preservados no escuro.",
    path: "/bestiario",
    image: archiveReferenceArt.creature,
    cta: "Abrir Bestiario",
  },
  {
    title: "Cronicas",
    description: "Relatos de sessao, contratos velados e manuscritos que continuaram a respirar.",
    path: "/cronicas",
    image: archiveReferenceArt.desk,
    cta: "Explorar Cronicas",
  },
] as const;

const archiveIndexCards = [
  {
    icon: BookMarked,
    title: "Universo",
    description: "Origem, eras, faccoes, ruinas e dossies que sustentam a leitura do continente.",
    path: "/universo",
  },
  {
    icon: Skull,
    title: "Bestiario",
    description: "Monstros, reliquias vivas e ameacas catalogadas com fraquezas, regioes e risco.",
    path: "/bestiario",
  },
  {
    icon: ScrollText,
    title: "Cronicas",
    description: "Capitulos exclusivos, memoria de estrada e registros de sessao preservados no arquivo.",
    path: "/cronicas",
  },
  {
    icon: Compass,
    title: "Mapa",
    description: "Rotas, fronteiras, locais e leituras em camadas conectadas aos verbetes do portal.",
    path: "/mapa",
  },
  {
    icon: Swords,
    title: "Jogar",
    description: "Hub de sessao com mesa, oraculo e caminhos de leitura viva para continuar a campanha.",
    path: "/jogar",
  },
] as const;

const homeArchivePortals = [
  {
    title: "Universo",
    description: "Leia eras, faccoes, locais e personagens antes de descer para o restante do arquivo.",
    to: "/universo",
    cta: "Abrir universo",
  },
  {
    title: "Bestiario",
    description: "Cruze criaturas, fraquezas, regioes e niveis de perigo num unico indice de caca.",
    to: "/bestiario",
    cta: "Abrir bestiario",
  },
  {
    title: "Cronicas",
    description: "Entre nos manuscritos de sessao, contratos e registros que mantem a campanha viva.",
    to: "/cronicas",
    cta: "Ler cronicas",
  },
  {
    title: "Mapa",
    description: "Abra o continente por camadas e ligue rotas, dossies e a mesa sem romper a leitura.",
    to: "/mapa",
    cta: "Abrir atlas",
  },
] as const;

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
            <Link to="/bestiario" className="dark-lore-button dark-lore-button-ghost">
              Abrir Bestiario
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="dark-lore-page-frame dark-lore-editorial-grid">
        <div className="dark-lore-editorial-copy">
          <p className="dark-lore-section-kicker">Sobre o portal</p>
          <h2 className="dark-lore-section-title">
            Um arquivo unico para ler o continente com calma, peso e continuidade.
          </h2>
          <p className="dark-lore-editorial-text">
            O portal reune universo, bestiario, cronicas, cartografia e sessao sob a mesma
            linguagem de leitura. Cada rota abre um tipo de registro, mas todas pertencem ao mesmo
            arquivo.
          </p>
          <p className="dark-lore-editorial-text">
            Em vez de telas isoladas, a travessia foi organizada como estante viva: primeiro voce
            entende o mundo, depois cruza as criaturas, desce aos manuscritos e por fim leva tudo
            para a mesa.
          </p>
          <Link to="/jogar" className="dark-lore-button dark-lore-button-ghost">
            Abrir a camara de sessao
          </Link>
        </div>

        <div className="dark-lore-editorial-figure">
          <img
            src={archiveReferenceArt.desk}
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
            <p className="dark-lore-section-kicker justify-center">Indice do arquivo</p>
            <h2 className="dark-lore-section-title mx-auto">O que permanece acessivel no limiar</h2>
          </div>

          <div className="dark-lore-codex-grid">
            {archiveIndexCards.map(({ icon: Icon, title, description, path }, index) => (
              <motion.article
                key={title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.45, delay: index * 0.05 }}
                className="dark-lore-archive-card dark-lore-archive-card-compact"
              >
                <Link to={path} className="dark-lore-codex-card">
                  <div className="dark-lore-icon-emblem">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="dark-lore-card-title text-[clamp(1.35rem,1.8vw,1.7rem)]">
                      {title}
                    </h3>
                    <p className="dark-lore-card-copy">{description}</p>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
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

      <section className="dark-lore-page-frame px-6 py-8 md:px-8 md:py-10">
        <div className="space-y-6">
          <div className="text-center">
            <p className="dark-lore-section-kicker justify-center">Criaturas em vigilia</p>
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
                      {metadata ? ` - Perigo ${metadata.dangerLevel}/5` : ""}
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

      <ArchivePortalSection
        kicker="Explore o arquivo"
        title="Quatro portas para continuar a leitura"
        description="O portal inteiro foi organizado como uma estante coerente: mundo, criaturas, manuscritos e atlas se abrem sob a mesma voz editorial."
        items={homeArchivePortals}
      />

      <section className="dark-lore-cta-band">
        <p className="dark-lore-cta-line">O arquivo permanece aberto.</p>
        <Link to="/jogar" className="dark-lore-button">
          Entrar no Portal
        </Link>
      </section>
    </div>
  );
}
