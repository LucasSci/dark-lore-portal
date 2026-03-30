import { BookMarked, ScrollText, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import ArchivePortalSection from "@/components/portal/ArchivePortalSection";
import { archiveReferenceArt } from "@/lib/archive-reference";
import { usePortalShellMode } from "@/lib/portal-state";
import { useCampaignPublications } from "@/lib/publications";

const archiveGallery = [
  archiveReferenceArt.desk,
  archiveReferenceArt.wanderer,
  archiveReferenceArt.forgotten,
] as const;

const chronicleWays = [
  {
    icon: ScrollText,
    title: "Relatos Sombrios",
    description: "Leitura corrida de capitulos, contratos e memorias que sobreviveram ao tempo.",
  },
  {
    icon: Sparkles,
    title: "Maldicoes Ancestrais",
    description: "Rumores de mesa, rastros de horror e profecias que voltam em ciclos.",
  },
  {
    icon: BookMarked,
    title: "Arquivo Velado",
    description: "Um acervo continuo de sessao, campanha e cronicas ligadas ao mesmo mundo.",
  },
] as const;

const chroniclePortals = [
  {
    title: "Universo",
    description: "Cruze os manuscritos com reinos, faccoes e personagens do mesmo arquivo.",
    to: "/universo",
    cta: "Cruzar universo",
  },
  {
    title: "Bestiario",
    description: "Abra criaturas, rastros e ameacas citadas nos relatos para manter o contexto vivo.",
    to: "/bestiario",
    cta: "Abrir bestiario",
  },
  {
    title: "Mapa",
    description: "Siga as rotas, fronteiras e locais mencionados nas cronicas sem perder a trilha.",
    to: "/mapa",
    cta: "Abrir atlas",
  },
  {
    title: "Jogar",
    description: "Leve os relatos para a sessao e transforme manuscritos em cena, mesa e decisao.",
    to: "/jogar",
    cta: "Entrar na sessao",
  },
] as const;

export default function CampaignPage() {
  usePortalShellMode("editorial", "ambient");
  const { publishedPublications } = useCampaignPublications();
  const featured = publishedPublications.slice(0, 3);
  const archive = publishedPublications.slice(3);

  return (
    <div className="mx-auto max-w-[1320px] space-y-10 px-4 py-8 md:px-6 md:py-12">
      <section className="dark-lore-page-frame dark-lore-page-hero dark-lore-chronicles-hero">
        <img
          src={archiveReferenceArt.desk}
          alt=""
          aria-hidden="true"
          className="dark-lore-hero-background object-cover opacity-55"
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
          <p className="dark-lore-section-kicker justify-center">Arquivo das cronicas</p>
          <h1 className="dark-lore-display-title">Cronicas Veladas</h1>
          <p className="dark-lore-hero-text max-w-3xl text-center">
            Relatos de sessao, contratos, pressagios e testemunhos que continuaram a respirar
            dentro do arquivo.
          </p>
          <div className="flex justify-center pt-2">
            <Link to="#cronicas-arquivo" className="dark-lore-button">
              Abrir manuscritos
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="dark-lore-page-frame dark-lore-editorial-grid">
        <div className="dark-lore-editorial-copy">
          <p className="dark-lore-section-kicker">Os manuscritos velados</p>
          <h2 className="dark-lore-section-title">Cada entrada preserva uma noite mal encerrada.</h2>
          <p className="dark-lore-editorial-text">
            O arquivo reune chamadas de sessao, contratos pagos em silencio, memorias de estrada e
            testemunhos recolhidos perto demais do abismo. Cada pagina foi mantida para que a mesa
            nunca perca seu rastro.
          </p>
          <p className="dark-lore-editorial-text">
            Leia as cronicas como registros de mundo, ecos de campanha e documentos que podem ser
            abertos outra vez quando a sessao pedir.
          </p>
          <Link to="/jogar" className="dark-lore-button dark-lore-button-ghost">
            Abrir Arquivo Vivo
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
            <p className="dark-lore-section-kicker justify-center">Formas de leitura</p>
            <h2 className="dark-lore-section-title mx-auto">Tres trilhas para entrar no arquivo</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {chronicleWays.map(({ icon: Icon, title, description }, index) => (
              <motion.article
                key={title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.45, delay: index * 0.05 }}
                className="dark-lore-archive-card dark-lore-archive-card-compact"
              >
                <div className="dark-lore-codex-card">
                  <div className="dark-lore-icon-emblem">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="dark-lore-card-title text-[clamp(1.4rem,1.9vw,1.8rem)]">
                      {title}
                    </h3>
                    <p className="dark-lore-card-copy">{description}</p>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="cronicas-arquivo" className="dark-lore-feature-grid">
        {featured.map((publication, index) => (
          <motion.article
            key={publication.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.28 }}
            transition={{ duration: 0.55, delay: index * 0.08 }}
            className="dark-lore-feature-card"
          >
            <div className="dark-lore-feature-image-wrap">
              <img
                src={archiveGallery[index % archiveGallery.length]}
                alt=""
                aria-hidden="true"
                className="dark-lore-feature-image"
              />
            </div>
            <div className="dark-lore-feature-body">
              <p className="dark-lore-card-meta">
                {String(publication.chapterNumber).padStart(2, "0")} - {publication.location}
              </p>
              <h2 className="dark-lore-card-title">{publication.title}</h2>
              <p className="dark-lore-card-copy">{publication.excerpt}</p>
              <Link to="/jogar" className="dark-lore-button dark-lore-button-small">
                Ler relato
              </Link>
            </div>
          </motion.article>
        ))}
      </section>

      {archive.length > 0 ? (
        <section className="dark-lore-page-frame px-6 py-8 md:px-8 md:py-10">
          <div className="space-y-6">
            <div className="text-center">
              <p className="dark-lore-section-kicker justify-center">Arquivo continuo</p>
              <h2 className="dark-lore-section-title mx-auto">
                Rastros, contratos e rumores preservados
              </h2>
            </div>

            <div className="dark-lore-list-grid">
              {archive.map((publication, index) => (
                <motion.article
                  key={publication.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: index * 0.05 }}
                  className="dark-lore-archive-card"
                >
                  <p className="dark-lore-card-meta">
                    {publication.location} - {publication.kind}
                  </p>
                  <h3 className="dark-lore-card-title text-[clamp(1.5rem,2vw,2rem)]">
                    {publication.title}
                  </h3>
                  <p className="dark-lore-card-copy">{publication.excerpt}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <ArchivePortalSection
        kicker="Portais do arquivo"
        title="Continue a cronica por outras rotas"
        description="Os manuscritos nao terminam na leitura. Cada registro pode abrir criaturas, atlas, sessao ou universo no mesmo compasso."
        items={chroniclePortals}
      />

      <section className="dark-lore-cta-band">
        <p className="dark-lore-cta-line">O arquivo permanece aberto.</p>
        <Link to="/jogar" className="dark-lore-button">
          Entrar na sessao
        </Link>
      </section>
    </div>
  );
}
