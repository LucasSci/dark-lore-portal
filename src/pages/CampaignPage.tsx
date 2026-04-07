import { BookMarked, ScrollText, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";

import ArchivePortalSection from "@/components/portal/ArchivePortalSection";
import RitualSectionHeading from "@/components/portal/RitualSectionHeading";
import { archiveReferenceArt } from "@/lib/archive-reference";
import { usePortalShellMode } from "@/lib/portal-state";
import { getCampaignPublicationBySlug, useCampaignPublications } from "@/lib/publications";

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
  const { entrySlug } = useParams();
  usePortalShellMode("editorial", "ambient");
  const { publishedPublications } = useCampaignPublications();
  const publication = entrySlug ? getCampaignPublicationBySlug(entrySlug) : null;
  const featured = publishedPublications.slice(0, 3);
  const archive = publishedPublications.slice(3);

  if (entrySlug) {
    if (!publication) {
      return (
        <div className="mx-auto max-w-[960px] px-4 py-10 md:px-6 md:py-14">
          <section className="dark-lore-page-frame space-y-6 px-6 py-8 md:px-8 md:py-10">
            <p className="dark-lore-section-kicker">Registro nao encontrado</p>
            <h1 className="dark-lore-section-title">Este manuscrito nao existe no arquivo.</h1>
            <p className="dark-lore-editorial-text">
              O slug informado nao corresponde a uma cronica publicada. Volte ao arquivo para abrir outro manuscrito.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/cronicas" className="dark-lore-button">
                Voltar as cronicas
              </Link>
              <Link to="/jogar" className="dark-lore-button dark-lore-button-ghost">
                Ir para a sessao
              </Link>
            </div>
          </section>
        </div>
      );
    }

    const paragraphs = publication.body
      .split(/\n+/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);

    return (
      <div className="mx-auto max-w-[1080px] space-y-8 px-4 py-8 md:px-6 md:py-12">
        <section className="dark-lore-page-frame dark-lore-reading-hero px-6 py-8 md:px-8 md:py-10">
          <p className="dark-lore-section-kicker">{publication.kind} do arquivo</p>
          <h1 className="dark-lore-display-title">{publication.title}</h1>
          <p className="dark-lore-hero-text max-w-3xl">{publication.excerpt}</p>
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="dark-lore-card-meta">{publication.location}</span>
            <span className="dark-lore-card-meta">Capitulo {String(publication.chapterNumber).padStart(2, "0")}</span>
            <span className="dark-lore-card-meta">{publication.author}</span>
          </div>
          <div className="flex flex-wrap gap-3 pt-4">
            <Link to="/cronicas" className="dark-lore-button">
              Voltar ao arquivo
            </Link>
            <Link to="/jogar" className="dark-lore-button dark-lore-button-ghost">
              Levar para a sessao
            </Link>
          </div>
        </section>

        <section className="dark-lore-reading-layout">
          <article className="dark-lore-page-frame dark-lore-reading-column space-y-6 px-6 py-8 md:px-8 md:py-10">
            {paragraphs.map((paragraph, index) => (
              <p key={`${publication.id}-${index}`} className="dark-lore-reading-paragraph">
                {paragraph}
              </p>
            ))}
          </article>

          <aside className="dark-lore-reading-rail dark-lore-page-frame space-y-4 px-5 py-6">
            <div className="space-y-2">
              <p className="dark-lore-section-kicker">Ficha do manuscrito</p>
              <h2 className="dark-lore-card-title text-[clamp(1.35rem,1.8vw,1.7rem)]">
                {publication.title}
              </h2>
            </div>
            <div className="space-y-3">
              <div className="metric-panel px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-primary/74">Origem</p>
                <p className="mt-2 text-sm leading-7 text-foreground/84">{publication.location}</p>
              </div>
              <div className="metric-panel px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-primary/74">Respostas</p>
                <p className="mt-2 text-sm leading-7 text-foreground/84">{publication.replies}</p>
              </div>
              <div className="metric-panel px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-primary/74">Atualizacao</p>
                <p className="mt-2 text-sm leading-7 text-foreground/84">
                  {new Date(publication.updatedAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>
          </aside>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1320px] space-y-10 px-4 py-8 md:px-6 md:py-12">
      <section className="dark-lore-page-frame dark-lore-page-hero dark-lore-chronicles-hero">
        <img
          src={archiveReferenceArt.desk}
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          decoding="async"
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
          <span className="dark-lore-portal-sigil" aria-hidden="true" />
          <p className="dark-lore-section-kicker justify-center">Arquivo das cronicas</p>
          <h1 className="dark-lore-display-title">Cronicas Veladas</h1>
          <p className="dark-lore-hero-text max-w-3xl text-center">
            Relatos de sessao, contratos, pressagios e testemunhos que continuaram a respirar
            dentro do arquivo.
          </p>
          <div className="dark-lore-divider" aria-hidden="true" />
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
            loading="lazy"
            decoding="async"
            className="dark-lore-editorial-image"
          />
          <div className="dark-lore-editorial-glow" />
        </div>
      </section>

      <section className="dark-lore-page-frame px-6 py-8 md:px-8 md:py-10">
        <div className="space-y-6">
          <RitualSectionHeading
            kicker="Formas de leitura"
            title="Tres trilhas para entrar no arquivo"
            description="As cronicas foram organizadas como registros vivos: leitura corrida, rastro ritual e arquivo continuo para reaparecer em campanha."
            align="center"
          />

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

      <section id="cronicas-arquivo" className="space-y-6">
        <RitualSectionHeading
          kicker="Manuscritos em destaque"
          title="Tres entradas para abrir o arquivo"
          description="Comece pelos registros que melhor sustentam o tom da campanha: um manuscrito central, um rastro de estrada e um eco que pode voltar a mesa."
          align="center"
        />

        <div className="dark-lore-feature-grid">
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
                  loading="lazy"
                  decoding="async"
                  className="dark-lore-feature-image"
                />
              </div>
              <div className="dark-lore-feature-body">
                <p className="dark-lore-card-meta">
                  {String(publication.chapterNumber).padStart(2, "0")} - {publication.location}
                </p>
                <h2 className="dark-lore-card-title">{publication.title}</h2>
                <p className="dark-lore-card-copy">{publication.excerpt}</p>
                <Link to={`/cronicas/${publication.slug}`} className="dark-lore-button dark-lore-button-small">
                  Ler relato
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {archive.length > 0 ? (
        <section className="dark-lore-page-frame px-6 py-8 md:px-8 md:py-10">
          <div className="space-y-6">
            <RitualSectionHeading
              kicker="Arquivo continuo"
              title="Rastros, contratos e rumores preservados"
              description="Quando o manuscrito principal termina, o arquivo continua em relatos menores, ecos de sessao e registros que mantem a campanha respirando."
              align="center"
            />

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
                  <Link
                    to={`/cronicas/${publication.slug}`}
                    className="dark-lore-button dark-lore-button-small"
                  >
                    Abrir manuscrito
                  </Link>
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
