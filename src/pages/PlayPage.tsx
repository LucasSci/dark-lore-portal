import { Fragment, useEffect, useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Search,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

import { archiveBrand, archiveReferenceArt } from "@/lib/archive-reference";
import { usePortalShellMode } from "@/lib/portal-state";
import {
  type UniversePublication,
  type UniversePublicationMention,
  universePublications,
} from "@/lib/universe-publications";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function renderPublicationParagraph(paragraph: string, mentions: UniversePublicationMention[]) {
  if (mentions.length === 0) {
    return paragraph;
  }

  const orderedMentions = [...mentions].sort((left, right) => right.label.length - left.label.length);
  const mentionByLabel = new Map(orderedMentions.map((mention) => [mention.label.toLowerCase(), mention]));
  const pattern = new RegExp(orderedMentions.map((mention) => escapeRegExp(mention.label)).join("|"), "gi");
  const nodes: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of paragraph.matchAll(pattern)) {
    const start = match.index ?? 0;
    const value = match[0];

    if (start > lastIndex) {
      nodes.push(<Fragment key={`text-${lastIndex}`}>{paragraph.slice(lastIndex, start)}</Fragment>);
    }

    const mention = mentionByLabel.get(value.toLowerCase());

    if (mention) {
      nodes.push(
        <Link
          key={`${mention.slug}-${start}`}
          to={`/universo/${mention.slug}`}
          className="font-medium text-primary transition-colors hover:text-white"
        >
          {value}
        </Link>,
      );
    } else {
      nodes.push(<Fragment key={`match-${start}`}>{value}</Fragment>);
    }

    lastIndex = start + value.length;
  }

  if (lastIndex < paragraph.length) {
    nodes.push(<Fragment key={`tail-${lastIndex}`}>{paragraph.slice(lastIndex)}</Fragment>);
  }

  return nodes;
}

const allPublications = [...universePublications].sort((left, right) => left.chapterNumber - right.chapterNumber);

export default function PlayPage() {
  usePortalShellMode("editorial", "ambient");
  const [query, setQuery] = useState("");
  const [selectedSlug, setSelectedSlug] = useState(allPublications[0]?.slug ?? "");
  const [readingMode, setReadingMode] = useState(false);
  const [oracleOpen, setOracleOpen] = useState(false);

  const filteredPublications = useMemo(() => {
    const term = query.trim().toLowerCase();

    if (!term) {
      return allPublications;
    }

    return allPublications.filter((publication) => {
      const searchable = `${publication.chapterLabel} ${publication.title} ${publication.excerpt} ${publication.location}`.toLowerCase();
      return searchable.includes(term);
    });
  }, [query]);

  const selectedPublication = useMemo(() => {
    return (
      filteredPublications.find((publication) => publication.slug === selectedSlug) ??
      allPublications.find((publication) => publication.slug === selectedSlug) ??
      filteredPublications[0] ??
      allPublications[0] ??
      null
    );
  }, [filteredPublications, selectedSlug]);

  useEffect(() => {
    if (selectedPublication && selectedPublication.slug !== selectedSlug) {
      setSelectedSlug(selectedPublication.slug);
    }
  }, [selectedPublication, selectedSlug]);

  const selectedIndex = selectedPublication
    ? allPublications.findIndex((publication) => publication.slug === selectedPublication.slug)
    : -1;
  const previousPublication = selectedIndex > 0 ? allPublications[selectedIndex - 1] : null;
  const nextPublication =
    selectedIndex >= 0 && selectedIndex < allPublications.length - 1
      ? allPublications[selectedIndex + 1]
      : null;

  if (!selectedPublication) {
    return null;
  }

  return (
    <div className="mx-auto max-w-[1480px] space-y-8 px-4 py-8 md:px-6 md:py-12">
      <section className="dark-lore-page-frame dark-lore-page-hero archive-oracle-hero">
        <img
          src={selectedPublication.image || archiveReferenceArt.hero}
          alt=""
          aria-hidden="true"
          className="dark-lore-hero-background object-cover"
        />
        <div className="dark-lore-grain-overlay" />
        <div className="dark-lore-candle-glow dark-lore-candle-glow-left" />
        <div className="dark-lore-candle-glow dark-lore-candle-glow-right" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="dark-lore-hero-copy"
        >
          <p className="dark-lore-section-kicker">{archiveBrand.subtitle}</p>
          <h1 className="dark-lore-display-title">Arquivo Vivo</h1>
          <p className="dark-lore-hero-text max-w-3xl">
            Navegue pelas camadas do lore como quem abre um manuscrito instavel: capitulos,
            mencoes, rotas e rastros preservados no limiar do continente.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link to={`/universo/${selectedPublication.slug}`} className="dark-lore-button">
              Abrir publicacao completa
            </Link>
            <button
              type="button"
              className="dark-lore-button dark-lore-button-ghost"
              onClick={() => setReadingMode((previous) => !previous)}
            >
              {readingMode ? "Voltar ao arquivo" : "Concentrar leitura"}
            </button>
          </div>
        </motion.div>
      </section>

      <section className="archive-oracle-shell">
        <aside className="archive-oracle-panel overflow-hidden">
          <div className="space-y-6 p-5 md:p-6">
            <div className="space-y-3">
              <p className="dark-lore-section-kicker">Indice do arquivo</p>
              <h2 className="dark-lore-section-title text-left">Capitulos e ecos</h2>
              <p className="text-sm leading-7 text-[hsl(var(--foreground)/0.74)]">
                Filtre entradas, salte para um manuscrito especifico e acompanhe a travessia do
                prologo ate as estradas mais recentes.
              </p>
            </div>

            <div className="archive-oracle-search">
              <Search className="archive-oracle-search-icon h-4 w-4" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar capitulo, local ou titulo..."
                className="archive-oracle-input dark-lore-input"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="dark-lore-inline-metric">
                <span className="dark-lore-card-meta">Capitulos</span>
                <span className="dark-lore-card-copy text-[hsl(var(--foreground)/0.92)]">
                  {allPublications.length}
                </span>
              </div>
              <div className="dark-lore-inline-metric">
                <span className="dark-lore-card-meta">Mencoes ativas</span>
                <span className="dark-lore-card-copy text-[hsl(var(--foreground)/0.92)]">
                  {selectedPublication.mentions.length}
                </span>
              </div>
              <div className="dark-lore-inline-metric">
                <span className="dark-lore-card-meta">Leitura atual</span>
                <span className="dark-lore-card-copy text-[hsl(var(--foreground)/0.92)]">
                  {selectedPublication.chapterLabel}
                </span>
              </div>
            </div>
          </div>

          <div className="archive-oracle-list border-t border-[hsl(var(--foreground)/0.08)] p-3">
            {filteredPublications.map((publication) => (
              <button
                key={publication.slug}
                type="button"
                data-active={publication.slug === selectedPublication.slug ? "true" : "false"}
                className="archive-oracle-entry"
                onClick={() => setSelectedSlug(publication.slug)}
              >
                <div className="archive-oracle-entry-thumb">
                  <img src={publication.image} alt="" aria-hidden="true" />
                </div>

                <div className="min-w-0 space-y-2">
                  <p className="dark-lore-card-meta truncate">{publication.chapterLabel}</p>
                  <h3 className="truncate font-display text-lg text-[hsl(var(--gold-light))]">
                    {publication.title}
                  </h3>
                  <p className="line-clamp-2 text-sm leading-6 text-[hsl(var(--foreground)/0.68)]">
                    {publication.excerpt}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <section className="archive-oracle-panel archive-oracle-stage">
          <div className={`archive-oracle-reading ${readingMode ? "is-focused" : ""}`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <span className="dark-lore-chip is-active">{selectedPublication.chapterLabel}</span>
                  <span className="dark-lore-chip">{selectedPublication.location}</span>
                </div>
                <h2 className="font-display text-[clamp(2.4rem,4vw,4.4rem)] leading-none text-[hsl(var(--gold-light))]">
                  {selectedPublication.title}
                </h2>
                <p className="max-w-3xl text-base leading-8 text-[hsl(var(--foreground)/0.82)]">
                  {selectedPublication.excerpt}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="dark-lore-button dark-lore-button-ghost"
                  onClick={() => previousPublication && setSelectedSlug(previousPublication.slug)}
                  disabled={!previousPublication}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Anterior
                </button>
                <button
                  type="button"
                  className="dark-lore-button dark-lore-button-ghost"
                  onClick={() => nextPublication && setSelectedSlug(nextPublication.slug)}
                  disabled={!nextPublication}
                >
                  Proximo
                  <ChevronRight className="ml-2 h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="dark-lore-button dark-lore-button-ghost"
                  onClick={() => setReadingMode((previous) => !previous)}
                >
                  {readingMode ? (
                    <>
                      <Minimize2 className="mr-2 h-4 w-4" />
                      Restaurar
                    </>
                  ) : (
                    <>
                      <Maximize2 className="mr-2 h-4 w-4" />
                      Foco
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="overflow-hidden border border-[hsl(var(--foreground)/0.08)] bg-[hsl(var(--background-strong)/0.36)]">
              <img
                src={selectedPublication.image || archiveReferenceArt.portal}
                alt={selectedPublication.title}
                className="h-[18rem] w-full object-cover opacity-80 md:h-[22rem]"
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div className="space-y-5">
                {selectedPublication.paragraphs.map((paragraph, index) => (
                  <motion.p
                    key={`${selectedPublication.slug}-${index}`}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.22 }}
                    transition={{ duration: 0.42, delay: index * 0.02 }}
                    className="text-[15px] leading-8 text-[hsl(var(--foreground)/0.84)]"
                  >
                    {renderPublicationParagraph(paragraph, selectedPublication.mentions)}
                  </motion.p>
                ))}
              </div>

              <aside className="space-y-4">
                <div className="archive-oracle-panel p-5">
                  <p className="dark-lore-section-kicker">Leitura de contexto</p>
                  <div className="mt-4 space-y-3">
                    <div className="dark-lore-inline-metric">
                      <span className="dark-lore-card-meta">Capitulo</span>
                      <span className="dark-lore-card-copy text-[hsl(var(--foreground)/0.92)]">
                        {selectedPublication.chapterLabel}
                      </span>
                    </div>
                    <div className="dark-lore-inline-metric">
                      <span className="dark-lore-card-meta">Local</span>
                      <span className="dark-lore-card-copy text-[hsl(var(--foreground)/0.92)]">
                        {selectedPublication.location}
                      </span>
                    </div>
                    <div className="dark-lore-inline-metric">
                      <span className="dark-lore-card-meta">Mencoes</span>
                      <span className="dark-lore-card-copy text-[hsl(var(--foreground)/0.92)]">
                        {selectedPublication.mentions.length}
                      </span>
                    </div>
                  </div>
                  <div className="mt-5">
                    <Link to={`/universo/${selectedPublication.slug}`} className="dark-lore-button">
                      Abrir dossie completo
                    </Link>
                  </div>
                </div>

                {selectedPublication.mentions.length > 0 ? (
                  <div className="archive-oracle-panel p-5">
                    <p className="dark-lore-section-kicker">Nomes citados</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {selectedPublication.mentions.map((mention) => (
                        <Link key={mention.slug} to={`/universo/${mention.slug}`} className="dark-lore-chip">
                          {mention.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}
              </aside>
            </div>
          </div>
        </section>

        <aside className="archive-oracle-rail">
          {allPublications.map((publication) => (
            <button
              key={publication.slug}
              type="button"
              className="archive-oracle-dot"
              data-active={publication.slug === selectedPublication.slug ? "true" : "false"}
              onClick={() => setSelectedSlug(publication.slug)}
              aria-label={publication.title}
              title={publication.title}
            />
          ))}
        </aside>
      </section>

      <button type="button" className="archive-oracle-mic" onClick={() => setOracleOpen((previous) => !previous)}>
        <img src={archiveReferenceArt.oracleMic} alt="" aria-hidden="true" />
        <span className="font-display text-sm uppercase tracking-[0.14em] text-[hsl(var(--gold-light))]">
          Oraculo do arquivo
        </span>
      </button>

      {oracleOpen ? (
        <div className="archive-oracle-whisper archive-oracle-panel p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center border border-[hsl(var(--foreground)/0.1)] bg-[hsl(var(--foreground)/0.04)]">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-3">
              <p className="dark-lore-section-kicker">Sussurro guiado</p>
              <h2 className="font-display text-2xl text-[hsl(var(--gold-light))]">
                {selectedPublication.title}
              </h2>
              <p className="text-sm leading-7 text-[hsl(var(--foreground)/0.78)]">
                O oraculo ancora a leitura atual em {selectedPublication.location.toLowerCase()} e
                mantem as mencoes mais proximas ao alcance. Use-o para saltar ao dossie principal
                ou seguir direto para a proxima camada do arquivo.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link to={`/universo/${selectedPublication.slug}`} className="dark-lore-button">
                  Abrir manuscrito
                </Link>
                {selectedPublication.mentions[0] ? (
                  <Link
                    to={`/universo/${selectedPublication.mentions[0].slug}`}
                    className="dark-lore-button dark-lore-button-ghost"
                  >
                    Ver primeira mencao
                  </Link>
                ) : (
                  <Link to="/universo" className="dark-lore-button dark-lore-button-ghost">
                    Voltar ao universo
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <section className="dark-lore-cta-band">
        <div className="space-y-3 text-center">
          <p className="dark-lore-cta-line">O arquivo permanece aberto.</p>
          <p className="mx-auto max-w-3xl text-sm leading-7 text-[hsl(var(--foreground)/0.74)] md:text-base">
            Quando a leitura pede mais contexto, o universo e o bestiario continuam ao alcance da
            mesma camada de arquivo.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/universo" className="dark-lore-button">
            Explorar universo
          </Link>
          <Link to="/bestiario" className="dark-lore-button dark-lore-button-ghost">
            Abrir bestiario
          </Link>
        </div>
      </section>
    </div>
  );
}
