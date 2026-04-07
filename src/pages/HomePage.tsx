import { BookMarked, Compass, ScrollText, Shield, Skull, Sparkles, Swords, Users } from "lucide-react";
import { Link } from "react-router-dom";

import { V2QuoteBlock, V2Timeline } from "@/components/portal/v2/PortalV2";
import { archiveBrand, archiveReferenceArt } from "@/lib/archive-reference";
import { getEntriesByCategory, globalTimeline } from "@/lib/encyclopedia";
import { usePortalShellMode } from "@/lib/portal-state";
import { useCampaignPublications } from "@/lib/publications";

const journeyCards = [
  {
    title: "Universo",
    meta: "Characters / Factions / Lore",
    description:
      "Reinos, linhagens, ordens e segredos do continente organizados como um codex ritual.",
    href: "/universo",
    cta: "Explorar universo",
    image: archiveReferenceArt.wanderer,
    icon: BookMarked,
  },
  {
    title: "Bestiario",
    meta: "Creatures / Entities",
    description:
      "Criaturas, horrores e presencas raras catalogadas como dossies de caca e sobrevivencia.",
    href: "/bestiario",
    cta: "Abrir bestiario",
    image: archiveReferenceArt.creature,
    icon: Skull,
  },
  {
    title: "Cronicas",
    meta: "Archive / Manuscripts",
    description:
      "Relatos de estrada, contratos e memoria de sessao preservados como entradas de arquivo.",
    href: "/cronicas",
    cta: "Ler cronicas",
    image: archiveReferenceArt.desk,
    icon: ScrollText,
  },
] as const;

export default function HomePage() {
  usePortalShellMode("editorial", "ambient");

  const characters = getEntriesByCategory("personagens").slice(0, 3);
  const factions = getEntriesByCategory("faccoes").slice(0, 2);
  const locations = getEntriesByCategory("locais").slice(0, 3);
  const { publishedPublications } = useCampaignPublications();

  return (
    <div className="portal-v2-page">
      <section className="portal-v2-section portal-v2-hero">
        <div className="portal-v2-hero-media">
          <img src={archiveReferenceArt.hero} alt="" aria-hidden="true" fetchPriority="high" decoding="async" />
        </div>
        <div className="portal-v2-hero-overlay" />
        <div className="portal-v2-hero-content">
          <div className="portal-v2-copy">
            <p className="portal-v2-kicker">{archiveBrand.subtitle}</p>
            <h1 className="portal-v2-title">Um codex vivo para ler o continente antes de joga-lo.</h1>
            <p className="portal-v2-body">
              A V2 do Arquivo do Continente trata lore, bestiario, atlas e cronicas como partes
              da mesma travessia. Primeiro voce le o mundo. Depois cruza criaturas, faccoes e
              manuscritos. Por fim, leva tudo para a mesa.
            </p>
            <div className="portal-v2-actions">
              <Link to="/universo" className="dark-lore-button">
                Abrir universo
              </Link>
              <Link to="/bestiario" className="dark-lore-button dark-lore-button-ghost">
                Ver criaturas
              </Link>
              <Link to="/jogar" className="dark-lore-button dark-lore-button-ghost">
                Entrar na suite
              </Link>
            </div>
            <div className="portal-v2-stat-grid">
              <article className="portal-v2-stat">
                <p className="portal-v2-stat-label">Dossies</p>
                <p className="portal-v2-stat-value">
                  {characters.length + factions.length + locations.length} portas iniciais
                </p>
              </article>
              <article className="portal-v2-stat">
                <p className="portal-v2-stat-label">Cronicas</p>
                <p className="portal-v2-stat-value">{publishedPublications.length} registros publicados</p>
              </article>
              <article className="portal-v2-stat">
                <p className="portal-v2-stat-label">Session shell</p>
                <p className="portal-v2-stat-value">Mesa, mestre, ficha e Story Engine</p>
              </article>
            </div>
          </div>

          <aside className="portal-v2-sidecard">
            <p className="portal-v2-card-meta">
              <Shield className="h-4 w-4" />
              Source of truth
            </p>
            <h2 className="portal-v2-sidecard-title">A leitura editorial e o uso em campanha finalmente falam a mesma lingua.</h2>
            <p className="portal-v2-sidecard-text">
              O portal deixa de ser so vitrine. Atlas, manuscritos e bestiario agora apontam para a
              sessao como parte do mesmo fluxo.
            </p>
            <V2QuoteBlock>
              "Cada pagina do arquivo deve parecer um objeto raro, nao um bloco de interface
              genérico."
            </V2QuoteBlock>
          </aside>
        </div>
      </section>

      <section className="portal-v2-section">
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="portal-v2-kicker">HOME / Journey</p>
            <h2 className="dark-lore-section-title">Tres portas principais para entrar no arquivo.</h2>
            <p className="portal-v2-body max-w-[48rem]">
              Universo, bestiario e cronicas funcionam como a espinha da V2. Cada uma tem papel
              claro: orientar, ameaçar e registrar.
            </p>
          </div>

          <div className="portal-v2-grid-3">
            {journeyCards.map(({ title, meta, description, href, cta, image, icon: Icon }) => (
              <Link key={title} to={href} className="portal-v2-journey-card">
                <div className="portal-v2-journey-media">
                  <img src={image} alt="" aria-hidden="true" loading="lazy" decoding="async" />
                </div>
                <div className="portal-v2-journey-body">
                  <p className="portal-v2-card-meta">
                    <Icon className="h-4 w-4" />
                    {meta}
                  </p>
                  <h3 className="portal-v2-card-title">{title}</h3>
                  <p className="portal-v2-card-copy">{description}</p>
                  <span className="dark-lore-button dark-lore-button-small">{cta}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="portal-v2-section">
        <div className="space-y-6">
          <div className="portal-v2-subgrid">
            <div className="space-y-4">
              <p className="portal-v2-kicker">Character / Desktop</p>
              <h2 className="dark-lore-section-title">Personagens que carregam a lenda e a fissura.</h2>
              <p className="portal-v2-body max-w-[42rem]">
                A V2 transforma o dossie de personagem numa ficha lendaria de codex. Aqui entram
                retrato, epiteto, funcao narrativa e ligacoes diretas com artefatos, faccoes e
                eventos.
              </p>
            </div>

            <div className="portal-v2-sidecard">
              <p className="portal-v2-card-meta">
                <Users className="h-4 w-4" />
                Spotlight
              </p>
              <p className="portal-v2-sidecard-text">
                Cada detalhe de personagem precisa ler como arquivo vivo, nunca como post de blog.
              </p>
            </div>
          </div>

          <div className="portal-v2-grid-3">
            {characters.map((entry) => (
              <Link key={entry.slug} to={`/universo/${entry.slug}`} className="portal-v2-detail-card">
                <div className="portal-v2-journey-media">
                  <img src={entry.image} alt={entry.imageAlt} loading="lazy" decoding="async" />
                </div>
                <div className="portal-v2-card-body">
                  <p className="portal-v2-card-meta">{entry.subtitle}</p>
                  <h3 className="portal-v2-card-title">{entry.title}</h3>
                  <p className="portal-v2-card-copy">{entry.summary}</p>
                  <div className="flex flex-wrap gap-2">
                    {entry.stats.slice(0, 2).map((stat) => (
                      <span key={stat.label} className="dark-lore-chip">
                        {stat.label}: {stat.value}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="portal-v2-section">
        <div className="portal-v2-grid-2">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="portal-v2-kicker">Faction / Desktop</p>
              <h2 className="dark-lore-section-title">Ordens, conclaves e pressões do continente.</h2>
              <p className="portal-v2-body max-w-[42rem]">
                Faccoes ganham leitura ritualistica e institucional. O objetivo nao e listar nomes,
                mas mostrar credo, hierarquia e conflito em tom de registro proibido.
              </p>
            </div>

            {factions.map((entry) => (
              <Link key={entry.slug} to={`/universo/${entry.slug}`} className="portal-v2-archive-entry block">
                <div className="portal-v2-card-body">
                  <p className="portal-v2-card-meta">
                    <Sparkles className="h-4 w-4" />
                    Faction record
                  </p>
                  <h3 className="portal-v2-card-title">{entry.title}</h3>
                  <p className="portal-v2-card-copy">{entry.summary}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <p className="portal-v2-kicker">Chronology preview</p>
              <h2 className="dark-lore-section-title">O eixo magico da cronologia aparece antes da pagina completa.</h2>
            </div>
            <V2Timeline events={globalTimeline.slice(0, 3)} />
          </div>
        </div>
      </section>

      <section className="portal-v2-section">
        <div className="portal-v2-subgrid">
          <div className="space-y-4">
            <p className="portal-v2-kicker">Atlas / Session Shell</p>
            <h2 className="dark-lore-section-title">O mapa emoldura a campanha; a suite transforma leitura em uso.</h2>
            <p className="portal-v2-body max-w-[44rem]">
              A linguagem V2 nao separa mais paginas bonitas de ferramentas operacionais. O atlas
              conduz para local, criatura e manuscrito. A suite interna entra para preparar, narrar
              e registrar.
            </p>
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
          </div>

          <div className="portal-v2-sidecard">
            <p className="portal-v2-card-meta">
              <ScrollText className="h-4 w-4" />
              Recent archive
            </p>
            <div className="space-y-3">
              {publishedPublications.slice(0, 3).map((entry) => (
                <Link key={entry.id} to={`/cronicas/${entry.slug}`} className="block">
                  <p className="font-display text-[1.2rem] text-[var(--v2-soft-gold)]">{entry.title}</p>
                  <p className="mt-1 text-sm leading-7 text-[rgb(232_224_207_/_0.72)]">{entry.excerpt}</p>
                </Link>
              ))}
            </div>
            <div className="grid gap-2 pt-2">
              {locations.map((entry) => (
                <Link key={entry.slug} to={`/universo/${entry.slug}`} className="dark-lore-chip justify-start">
                  {entry.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
