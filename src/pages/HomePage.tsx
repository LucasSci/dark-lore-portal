import {
  ArrowRight,
  BookMarked,
  Compass,
  ScrollText,
  Shield,
  Skull,
  Sparkles,
  Swords,
  Users,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";

import { V2MetadataPanel, V2QuoteBlock, V2Timeline } from "@/components/portal/v2/PortalV2";
import { archiveBrand, archiveReferenceArt } from "@/lib/archive-reference";
import { getEntriesByCategory, globalTimeline } from "@/lib/encyclopedia";
import { usePortalShellMode } from "@/lib/portal-state";
import { useCampaignPublications } from "@/lib/publications";

const journeyCards = [
  {
    title: "Universo",
    meta: "Characters / Factions / Lore",
    description:
      "Casas, eruditos, ordens e memorias do colapso organizados como um codex raro, pronto para leitura longa.",
    href: "/universo",
    cta: "Abrir o codex",
    image: archiveReferenceArt.wanderer,
    icon: BookMarked,
  },
  {
    title: "Bestiario",
    meta: "Creatures / Threats / Signs",
    description:
      "Entidades, contratos de caca e sinais de sobrevivencia apresentados como dossies para ler antes do encontro.",
    href: "/bestiario",
    cta: "Rastrear ameacas",
    image: archiveReferenceArt.creature,
    icon: Skull,
  },
  {
    title: "Cronicas",
    meta: "Archive / Manuscripts / Session Memory",
    description:
      "Relatos, contratos e registros de campanha preservados como manuscritos vivos do proprio arquivo.",
    href: "/cronicas",
    cta: "Ler manuscritos",
    image: archiveReferenceArt.desk,
    icon: ScrollText,
  },
] as const;

const revealViewport = { once: true, amount: 0.2 };

function trimCopy(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trimEnd()}...`;
}

export default function HomePage() {
  usePortalShellMode("editorial", "ambient");

  const shouldReduceMotion = useReducedMotion();
  const characters = getEntriesByCategory("personagens").slice(0, 3);
  const factions = getEntriesByCategory("faccoes").slice(0, 2);
  const locations = getEntriesByCategory("locais").slice(0, 3);
  const timelinePreview = globalTimeline.slice(0, 4);
  const { publishedPublications } = useCampaignPublications();

  const featuredCharacter = characters[0] ?? null;
  const supportingCharacters = characters.slice(1, 3);
  const featuredFaction = factions[0] ?? null;
  const archiveDoorCount = characters.length + factions.length + locations.length;
  const latestPublication = publishedPublications[0] ?? null;

  const sectionReveal = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 28 },
        whileInView: { opacity: 1, y: 0 },
        viewport: revealViewport,
        transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
      };

  const riseIn = (delay = 0) =>
    shouldReduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 22 },
          whileInView: { opacity: 1, y: 0 },
          viewport: revealViewport,
          transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
        };

  return (
    <div className="portal-v2-page portal-v2-home">
      <motion.section
        className="portal-v2-section portal-v2-home-hero"
        aria-labelledby="home-hero-title"
        {...sectionReveal}
      >
        <div className="portal-v2-home-hero-media">
          <img
            src={archiveReferenceArt.hero}
            alt=""
            aria-hidden="true"
            fetchPriority="high"
            decoding="async"
          />
        </div>
        <div className="portal-v2-home-hero-overlay" />

        <div className="portal-v2-home-hero-grid">
          <motion.div className="portal-v2-home-hero-copy" {...riseIn(0.05)}>
            <p className="portal-v2-kicker">
              <Sparkles className="h-4 w-4" />
              {archiveBrand.subtitle} / HOME
            </p>
            <h1 id="home-hero-title" className="portal-v2-title">
              Leia a fissura. Escolha uma rota. Leve o mundo para a mesa.
            </h1>
            <p className="portal-v2-body">
              O Arquivo do Continente organiza Areias de Zerrikania como um codex vivo:
              personagens, criaturas, faccoes, atlas e manuscritos preparados para serem lidos
              primeiro e usados depois. A Home deixa de ser vitrine e passa a ser a primeira
              travessia do portal.
            </p>
            <p className="portal-v2-home-hero-note">{archiveBrand.heroLine}</p>

            <div className="portal-v2-actions">
              <Link to="/universo" className="dark-lore-button">
                Abrir universo
              </Link>
              <Link to="/cronicas" className="dark-lore-button">
                Ler cronicas
              </Link>
              <Link to="/jogar" className="dark-lore-button dark-lore-button-ghost">
                Entrar na suite
              </Link>
            </div>

            <div className="portal-v2-stat-grid">
              <article className="portal-v2-stat">
                <p className="portal-v2-stat-label">Portas iniciais</p>
                <p className="portal-v2-stat-value">{archiveDoorCount} entradas de leitura</p>
              </article>
              <article className="portal-v2-stat">
                <p className="portal-v2-stat-label">Linha do colapso</p>
                <p className="portal-v2-stat-value">{timelinePreview.length} marcos principais</p>
              </article>
              <article className="portal-v2-stat">
                <p className="portal-v2-stat-label">Arquivo vivo</p>
                <p className="portal-v2-stat-value">
                  {publishedPublications.length} manuscritos publicados
                </p>
              </article>
            </div>
          </motion.div>

          <motion.aside className="portal-v2-home-hero-aside" {...riseIn(0.16)}>
            <div className="portal-v2-home-sigil" aria-hidden="true">
              <img src={archiveReferenceArt.portalMark} alt="" loading="lazy" decoding="async" />
            </div>
            <p className="portal-v2-card-meta">
              <Shield className="h-4 w-4" />
              Manuscrito em destaque
            </p>
            <h2 className="portal-v2-sidecard-title">
              {latestPublication?.title ??
                "Cada entrada do arquivo prepara o proximo passo da campanha."}
            </h2>
            <p className="portal-v2-sidecard-text">
              {latestPublication?.excerpt ??
                "A nova Home guia a leitura do continente como percurso, nao como colecao de blocos soltos."}
            </p>

            <div className="portal-v2-home-route-list">
              <div className="portal-v2-home-route-item">
                <p className="portal-v2-home-route-label">Ler o mundo</p>
                <Link to="/universo" className="portal-v2-home-route-link">
                  Personagens, ordens e eventos do arquivo
                </Link>
              </div>
              <div className="portal-v2-home-route-item">
                <p className="portal-v2-home-route-label">Medir o risco</p>
                <Link to="/bestiario" className="portal-v2-home-route-link">
                  Criaturas, sinais e dossies de caca
                </Link>
              </div>
              <div className="portal-v2-home-route-item">
                <p className="portal-v2-home-route-label">Levar para a sessao</p>
                <Link to="/jogar" className="portal-v2-home-route-link">
                  Mesa, mestre, ficha e Story Engine
                </Link>
              </div>
            </div>

            <V2QuoteBlock>
              "O arquivo nao termina na leitura; ele continua quando o continente encontra a
              sessao."
            </V2QuoteBlock>
          </motion.aside>
        </div>
      </motion.section>

      <motion.section
        className="portal-v2-section"
        aria-labelledby="home-journey-title"
        {...sectionReveal}
      >
        <div className="portal-v2-home-section-header">
          <p className="portal-v2-kicker">Journey / Three doors</p>
          <h2 id="home-journey-title" className="dark-lore-section-title">
            Tres portas principais para entrar no arquivo.
          </h2>
          <p className="portal-v2-body">
            Depois do hero, a Home precisa orientar em segundos. Universo oferece contexto.
            Bestiario mede a ameaca. Cronicas mostram como o mundo ja foi atravessado por outros.
          </p>
        </div>

        <div className="portal-v2-home-door-grid">
          {journeyCards.map(({ title, meta, description, href, cta, image, icon: Icon }, index) => (
            <motion.div key={title} {...riseIn(0.08 + index * 0.06)}>
              <Link to={href} className="portal-v2-home-door">
                <div className="portal-v2-home-door-media">
                  <img src={image} alt="" aria-hidden="true" loading="lazy" decoding="async" />
                </div>
                <div className="portal-v2-home-door-body">
                  <span className="portal-v2-home-door-badge" aria-hidden="true">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="portal-v2-card-meta">{meta}</p>
                  <h3 className="portal-v2-home-door-title">{title}</h3>
                  <p className="portal-v2-home-door-copy">{description}</p>
                  <span className="portal-v2-home-door-cta">
                    {cta}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {featuredCharacter ? (
        <motion.section
          className="portal-v2-section"
          aria-labelledby="home-characters-title"
          {...sectionReveal}
        >
          <div className="portal-v2-home-section-header">
            <p className="portal-v2-kicker">Featured characters</p>
            <h2 id="home-characters-title" className="dark-lore-section-title">
              Personagens lidos como codex, nao como listagem.
            </h2>
            <p className="portal-v2-body">
              A Home mostra que cada personagem e uma porta para moral, memoria e ruptura. A
              primeira leitura precisa soar como descoberta de arquivo raro, nao como card
              generico.
            </p>
          </div>

          <div className="portal-v2-home-character-grid">
            <motion.div {...riseIn(0.08)}>
              <Link to={`/universo/${featuredCharacter.slug}`} className="portal-v2-home-spotlight">
                <div className="portal-v2-home-spotlight-media">
                  <img
                    src={featuredCharacter.image}
                    alt={featuredCharacter.imageAlt}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="portal-v2-home-spotlight-body">
                  <p className="portal-v2-card-meta">
                    <Users className="h-4 w-4" />
                    Featured record
                  </p>
                  <h3 className="portal-v2-card-title">{featuredCharacter.title}</h3>
                  <p className="portal-v2-sidecard-text">{featuredCharacter.subtitle}</p>
                  <p className="portal-v2-card-copy">{featuredCharacter.summary}</p>
                  <V2QuoteBlock>
                    {trimCopy(
                      featuredCharacter.narrative[0]?.body ?? featuredCharacter.summary,
                      220,
                    )}
                  </V2QuoteBlock>
                  <div className="portal-v2-home-chip-row">
                    {featuredCharacter.stats.slice(0, 3).map((stat) => (
                      <span key={stat.label} className="dark-lore-chip">
                        {stat.label}: {stat.value}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            </motion.div>

            <div className="portal-v2-home-ledger-stack">
              {supportingCharacters.map((entry, index) => (
                <motion.div key={entry.slug} {...riseIn(0.14 + index * 0.06)}>
                  <Link to={`/universo/${entry.slug}`} className="portal-v2-home-ledger-card">
                    <p className="portal-v2-card-meta">{entry.subtitle}</p>
                    <h3 className="portal-v2-card-title">{entry.title}</h3>
                    <p className="portal-v2-card-copy">{trimCopy(entry.summary, 180)}</p>
                    <div className="portal-v2-home-chip-row">
                      {entry.stats.slice(0, 2).map((stat) => (
                        <span key={stat.label} className="dark-lore-chip">
                          {stat.label}: {stat.value}
                        </span>
                      ))}
                    </div>
                    <span className="portal-v2-home-door-cta">
                      Ler dossie
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      ) : null}

      <motion.section
        className="portal-v2-section"
        aria-labelledby="home-factions-title"
        {...sectionReveal}
      >
        <div className="portal-v2-home-faction-grid">
          <div className="space-y-6">
            <div className="portal-v2-home-section-header">
              <p className="portal-v2-kicker">Factions / Orders</p>
              <h2 id="home-factions-title" className="dark-lore-section-title">
                Ordens, templos e conclaves como maquinas de pressao.
              </h2>
              <p className="portal-v2-body">
                A Home precisa deixar claro que o universo nao e feito apenas de individuos. Ele e
                conduzido por instituicoes, credo, leitura ritual e disputa sobre quem tem o direito
                de interpretar a crise.
              </p>
            </div>

            {featuredFaction ? (
              <Link to={`/universo/${featuredFaction.slug}`} className="portal-v2-home-manifesto">
                <p className="portal-v2-card-meta">
                  <Sparkles className="h-4 w-4" />
                  Featured order
                </p>
                <h3 className="portal-v2-home-manifesto-title">{featuredFaction.title}</h3>
                <p className="portal-v2-home-manifesto-copy">{featuredFaction.summary}</p>
                <V2QuoteBlock>
                  {trimCopy(featuredFaction.narrative[0]?.body ?? featuredFaction.summary, 220)}
                </V2QuoteBlock>
              </Link>
            ) : null}
          </div>

          <div className="portal-v2-home-ledger-stack">
            {factions.map((entry, index) => (
              <motion.div key={entry.slug} {...riseIn(0.1 + index * 0.06)}>
                <Link to={`/universo/${entry.slug}`} className="portal-v2-home-ledger-card">
                  <p className="portal-v2-card-meta">{entry.subtitle}</p>
                  <h3 className="portal-v2-card-title">{entry.title}</h3>
                  <p className="portal-v2-card-copy">{trimCopy(entry.summary, 170)}</p>
                  <div className="portal-v2-home-chip-row">
                    {entry.stats.slice(0, 2).map((stat) => (
                      <span key={stat.label} className="dark-lore-chip">
                        {stat.label}: {stat.value}
                      </span>
                    ))}
                  </div>
                </Link>
              </motion.div>
            ))}

            <motion.div {...riseIn(0.24)}>
              <V2MetadataPanel
                title="Como ler as ordens"
                rows={[
                  {
                    label: "Conclaves",
                    value: "Medem, registram e tentam conter a falha pelo vocabulario.",
                  },
                  {
                    label: "Templos",
                    value: "Transformam versos, medo e profecia em destino socialmente util.",
                  },
                  {
                    label: "Na Home",
                    value: "A preview precisa soar institucional, tensa e historica desde o primeiro scroll.",
                  },
                ]}
              />
            </motion.div>
          </div>
        </div>
      </motion.section>

      <motion.section
        className="portal-v2-section portal-v2-home-chronology"
        aria-labelledby="home-chronology-title"
        {...sectionReveal}
      >
        <div className="portal-v2-home-chronology-grid">
          <div className="space-y-6">
            <div className="portal-v2-home-section-header">
              <p className="portal-v2-kicker">Chronology preview</p>
              <h2 id="home-chronology-title" className="dark-lore-section-title">
                A cronologia entra como eixo narrativo, nao como decoracao.
              </h2>
              <p className="portal-v2-body">
                A Home antecipa a leitura do colapso antes da pagina completa. O objetivo nao e
                despejar datas, mas fazer o usuario sentir que existe uma linha de pressao conduzindo
                todo o arquivo.
              </p>
            </div>

            <V2Timeline events={timelinePreview} />
          </div>

          <div className="portal-v2-home-ledger-stack">
            <motion.div {...riseIn(0.12)}>
              <V2MetadataPanel
                title="Como entrar no colapso"
                rows={[
                  {
                    label: "Primeiro passo",
                    value: "Abra Merlin e a Cedencia do Veu para entender a primeira fratura.",
                  },
                  {
                    label: "Segundo passo",
                    value: "Cruze Nashara, os templos e os Guardioes para sentir a pressao institucional.",
                  },
                  {
                    label: "Terceiro passo",
                    value: "Use cronicas e a suite para transformar leitura em campanha.",
                  },
                ]}
                footer={
                  <Link to="/cronicas" className="dark-lore-button dark-lore-button-small">
                    Percorrer cronicas
                  </Link>
                }
              />
            </motion.div>

            <motion.div {...riseIn(0.18)}>
              <div className="portal-v2-home-chronicle-list">
                {publishedPublications.slice(0, 3).map((entry) => (
                  <Link
                    key={entry.id}
                    to={`/cronicas/${entry.slug}`}
                    className="portal-v2-home-chronicle-item"
                  >
                    <p className="portal-v2-home-chronicle-title">{entry.title}</p>
                    <p className="portal-v2-home-chronicle-copy">{entry.excerpt}</p>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      <motion.section
        className="portal-v2-section"
        aria-labelledby="home-bridge-title"
        {...sectionReveal}
      >
        <div className="portal-v2-home-bridge-grid">
          <motion.div className="portal-v2-home-bridge-media" {...riseIn(0.08)}>
            <img
              src={archiveReferenceArt.portal}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
            />
            <div className="portal-v2-home-bridge-points">
              {locations.map((entry) => (
                <Link
                  key={entry.slug}
                  to={`/universo/${entry.slug}`}
                  className="portal-v2-home-bridge-point"
                >
                  <Compass className="h-4 w-4" />
                  {entry.title}
                </Link>
              ))}
            </div>
          </motion.div>

          <motion.div className="portal-v2-home-bridge-copy" {...riseIn(0.15)}>
            <div className="portal-v2-home-section-header">
              <p className="portal-v2-kicker">Atlas + Session bridge</p>
              <h2 id="home-bridge-title" className="dark-lore-section-title">
                O atlas emoldura a rota; a suite transforma leitura em uso.
              </h2>
              <p className="portal-v2-body">
                A Home precisa fechar o arco entre pagina editorial e ferramenta real. O atlas
                mostra onde a fissura atravessa o continente. A suite interna recebe esse material e
                o transforma em mesa, mestre, ficha e Story Engine.
              </p>
            </div>

            <div className="portal-v2-home-ledger-stack">
              <div className="portal-v2-home-ledger-card">
                <p className="portal-v2-card-meta">
                  <Compass className="h-4 w-4" />
                  Atlas
                </p>
                <h3 className="portal-v2-card-title">Locais para ler antes da sessao</h3>
                <p className="portal-v2-card-copy">
                  Do deserto rasgado a Elarion, o mapa deixa de ser apendice e passa a ser o eixo
                  espacial da navegacao.
                </p>
                <div className="portal-v2-home-chip-row">
                  {locations.map((entry) => (
                    <span key={entry.slug} className="dark-lore-chip">
                      {entry.title}
                    </span>
                  ))}
                </div>
              </div>

              <div className="portal-v2-home-ledger-card">
                <p className="portal-v2-card-meta">
                  <Swords className="h-4 w-4" />
                  Session shell
                </p>
                <h3 className="portal-v2-card-title">Uma ponte clara para a campanha</h3>
                <p className="portal-v2-card-copy">
                  Jogar, mestre, ficha e Story Engine aparecem aqui como continuidade natural do
                  que foi lido, e nao como produtos separados do portal.
                </p>
              </div>
            </div>

            <div className="portal-v2-actions">
              <Link to="/mapa" className="dark-lore-button">
                <Compass className="mr-2 h-4 w-4" />
                Abrir atlas
              </Link>
              <Link to="/jogar" className="dark-lore-button dark-lore-button-ghost">
                <Swords className="mr-2 h-4 w-4" />
                Entrar na suite
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        className="portal-v2-section portal-v2-home-final"
        aria-labelledby="home-final-title"
        {...sectionReveal}
      >
        <div className="portal-v2-home-final-grid">
          <div className="portal-v2-home-final-copy">
            <p className="portal-v2-kicker">Final CTA</p>
            <h2 id="home-final-title" className="dark-lore-section-title">
              Escolha por onde a travessia comeca.
            </h2>
            <p className="portal-v2-body">
              Se voce quer contexto, abra o universo. Se quer pressao, entre no bestiario. Se quer
              transformar tudo isso em campanha, siga para a suite. A nova Home existe para tornar
              essa decisao imediata.
            </p>
          </div>

          <div className="portal-v2-actions">
            <Link to="/universo" className="dark-lore-button">
              Universo
            </Link>
            <Link to="/bestiario" className="dark-lore-button dark-lore-button-ghost">
              Bestiario
            </Link>
            <Link to="/jogar" className="dark-lore-button dark-lore-button-ghost">
              Jogar
            </Link>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
