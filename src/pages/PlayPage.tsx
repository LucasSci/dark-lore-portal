import { BookMarked, Map, ScrollText, Sparkles, Sword } from "lucide-react";
import { Link } from "react-router-dom";

import ArchivePortalSection from "@/components/portal/ArchivePortalSection";
import { archiveBrand, archiveReferenceArt } from "@/lib/archive-reference";
import { usePortalShellMode } from "@/lib/portal-state";
import { getTabletopLoreCompendium } from "@/lib/tabletop-lore";

const sessionMetrics = [
  { label: "Nucleo", value: "Mesa, oraculo e comando" },
  { label: "Ritmo", value: "Preparar, narrar, resolver" },
  { label: "Entrada rapida", value: "Sessao ao vivo em um clique" },
] as const;

const moduleCards = [
  {
    title: "Mesa de sessao",
    description: "Abra o palco tatico, organize tokens, luzes, nevoa e fluxo de combate.",
    path: "/mesa",
    cta: "Abrir mesa",
    icon: Map,
  },
  {
    title: "Oraculo do arquivo",
    description: "Abra Luna em pagina completa, com leitura ritual, voz e visoes do arquivo no formato original.",
    path: "/oraculo",
    cta: "Abrir Luna",
    icon: Sparkles,
  },
  {
    title: "Ficha de personagem",
    description: "Revise atributos, inventario, grimorio e o estado da companhia antes da sessao.",
    path: "/ficha",
    cta: "Abrir ficha",
    icon: BookMarked,
  },
  {
    title: "Painel do mestre",
    description: "Conduza encontros, acompanhe a sessao e gerencie os movimentos do grupo.",
    path: "/mestre",
    cta: "Entrar no painel",
    icon: ScrollText,
  },
] as const;

const supportRoutes = [
  {
    title: "Criar personagem",
    path: "/criacao",
  },
  {
    title: "Seguir cronicas",
    path: "/cronicas",
  },
] as const;

const sessionPortals = [
  {
    title: "Mesa",
    description: "Abra o palco tatico, mova tokens, organize visibilidade e conduza a cena ao vivo.",
    to: "/mesa",
    cta: "Abrir mesa",
  },
  {
    title: "Oraculo",
    description: "Converse com Luna, leia registros do arquivo e mantenha o fio da campanha.",
    to: "/oraculo",
    cta: "Abrir Luna",
  },
  {
    title: "Cronicas",
    description: "Volte aos manuscritos quando a sessao pedir contexto, memoria ou pressagio.",
    to: "/cronicas",
    cta: "Ler manuscritos",
  },
  {
    title: "Mapa",
    description: "Cruze o jogo com o atlas para levar regioes, rotas e locais para a mesa.",
    to: "/mapa",
    cta: "Abrir atlas",
  },
] as const;

const tabletopLoreCompendium = getTabletopLoreCompendium();

export default function PlayPage() {
  usePortalShellMode("editorial", "ambient");

  return (
    <div className="mx-auto max-w-[1480px] space-y-10 px-4 py-8 md:space-y-12 md:px-6 md:py-12">
      <section className="dark-lore-page-frame overflow-hidden">
        <div className="dark-lore-page-hero dark-lore-contact-hero relative">
          <img
            src={archiveReferenceArt.hero}
            alt=""
            className="dark-lore-hero-background object-[center_38%]"
          />
          <div className="dark-lore-grain-overlay" />
          <div className="dark-lore-candle-glow dark-lore-candle-glow-left" />
          <div className="dark-lore-candle-glow dark-lore-candle-glow-right" />

          <div className="dark-lore-hero-copy relative z-10 max-w-5xl">
            <span className="dark-lore-portal-sigil" aria-hidden="true" />
            <span className="dark-lore-section-kicker">Camara de sessao</span>
            <h1 className="dark-lore-section-title max-w-[12ch]">Jogar sem romper o arquivo.</h1>
            <p className="dark-lore-hero-text max-w-[62ch] text-base md:text-lg">
              A sessao parte deste nucleo. Mesa, oraculo, ficha e painel do mestre entram como
              ferramentas do mesmo jogo, sem disputar o centro da campanha.
            </p>
            <div className="dark-lore-divider" aria-hidden="true" />

            <div className="flex flex-wrap gap-3">
              <Link to="/mesa" className="dark-lore-button">
                Abrir mesa de sessao
              </Link>
              <Link to="/oraculo" className="dark-lore-button dark-lore-button-ghost">
                Abrir Luna em pagina inteira
              </Link>
              <Link to="/jogar/oraculo" className="dark-lore-button dark-lore-button-ghost">
                Consultar o oraculo
              </Link>
              <Link to="/ficha" className="dark-lore-button dark-lore-button-ghost">
                Revisar fichas
              </Link>
            </div>

            <div className="grid gap-3 pt-2 md:grid-cols-3">
              {sessionMetrics.map((metric) => (
                <div key={metric.label} className="dark-lore-inline-metric">
                  <p className="dark-lore-card-meta">{metric.label}</p>
                  <p className="mt-2 font-display text-xl text-foreground">{metric.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {moduleCards.map(({ title, description, path, cta, icon: Icon }) => (
          <Link key={path} to={path} className="dark-lore-hover-surface">
            <article className="dark-lore-feature-card dark-lore-hover-surface">
              <div className="dark-lore-feature-body gap-5">
                <div className="dark-lore-icon-emblem">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="space-y-3">
                  <p className="dark-lore-card-meta">{archiveBrand.title}</p>
                  <h2 className="dark-lore-card-title text-3xl">{title}</h2>
                  <p className="dark-lore-card-copy text-sm">{description}</p>
                </div>
                <div className="mt-auto inline-flex items-center gap-2 font-display text-sm text-gold-light">
                  <Sword className="h-4 w-4" />
                  {cta}
                </div>
              </div>
            </article>
          </Link>
        ))}
      </section>

      <section className="dark-lore-page-frame overflow-hidden">
        <div className="dark-lore-editorial-grid">
          <div className="dark-lore-editorial-copy">
            <span className="dark-lore-section-kicker">Fluxo de sessao</span>
            <h2 className="dark-lore-section-title max-w-[14ch]">Mesa, leitura e resposta no mesmo eixo.</h2>
            <p className="dark-lore-editorial-text">
              Abra a mesa quando a sessao pedir espaco tatico. Desca ao oraculo quando a campanha
              pedir leitura, voz ou visoes. Entre uma cena e outra, a ficha e o painel do mestre
              sustentam o mesmo fio de jogo.
            </p>

            <div className="flex flex-wrap gap-3">
              {supportRoutes.map((route) => (
                <Link
                  key={route.path}
                  to={route.path}
                  className="dark-lore-button dark-lore-button-small dark-lore-button-ghost"
                >
                  {route.title}
                </Link>
              ))}
              <Link to="/oraculo" className="dark-lore-button dark-lore-button-small">
                Abrir experiencia completa
              </Link>
            </div>
          </div>

          <figure className="dark-lore-editorial-figure">
            <img src={archiveReferenceArt.wanderer} alt="" className="dark-lore-editorial-image" />
            <div className="dark-lore-editorial-glow" />
          </figure>
        </div>
      </section>

      <section className="dark-lore-page-frame px-6 py-8 md:px-8 md:py-10">
        <div className="space-y-6">
          <div className="text-center">
            <span className="dark-lore-section-kicker justify-center">Sementes de sessao</span>
            <h2 className="dark-lore-section-title mx-auto">Abra a mesa ja encostada no lore.</h2>
            <p className="mx-auto max-w-3xl text-sm leading-8 text-[hsl(var(--foreground)/0.76)] md:text-base">
              Cada semente cruza dossie, manuscrito e atlas para evitar que a sessao comece do
              zero. Entre por uma cena pronta e deixe o arquivo sustentar o resto.
            </p>
            <div className="mt-5">
              <div className="dark-lore-divider" aria-hidden="true" />
            </div>
          </div>

          <div className="dark-lore-list-grid">
            {tabletopLoreCompendium.sessionSeeds.map((seed) => (
              <article key={seed.slug} className="dark-lore-archive-card dark-lore-archive-card-horizontal">
                <div className="dark-lore-paper-index">{seed.tags[0]?.slice(0, 2).toUpperCase() ?? "AR"}</div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="dark-lore-card-meta">{seed.tags.join(" - ")}</p>
                    <h3 className="dark-lore-card-title text-[clamp(1.6rem,2.1vw,2.1rem)]">{seed.title}</h3>
                    <p className="dark-lore-card-copy">{seed.summary}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link to={seed.dossierHref} className="dark-lore-button dark-lore-button-small dark-lore-button-ghost">
                      Abrir dossie
                    </Link>
                    <Link to={seed.chronicleHref} className="dark-lore-button dark-lore-button-small dark-lore-button-ghost">
                      Ler manuscrito
                    </Link>
                    <Link to={seed.atlasHref} className="dark-lore-button dark-lore-button-small dark-lore-button-ghost">
                      Ver no atlas
                    </Link>
                    {seed.battlemapHref ? (
                      <Link to={seed.battlemapHref} className="dark-lore-button dark-lore-button-small">
                        Carregar battlemap
                      </Link>
                    ) : null}
                    {seed.quickSpawnHref ? (
                      <Link to={seed.quickSpawnHref} className="dark-lore-button dark-lore-button-small">
                        Trazer ameaca
                      </Link>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <ArchivePortalSection
        kicker="Portais de sessao"
        title="Quatro entradas para sustentar o jogo"
        description="A camara de sessao se abre melhor quando mesa, oraculo, cronicas e mapa continuam ligados ao mesmo arquivo."
        items={sessionPortals}
      />

      <section className="dark-lore-cta-band">
        <p className="dark-lore-section-kicker">Sessao em curso</p>
        <h2 className="dark-lore-cta-line">A sessao permanece aberta.</h2>
        <p className="dark-lore-hero-text text-center">
          Entre pela mesa quando for hora de jogar. Abra o oraculo quando o arquivo precisar
          responder.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/mesa" className="dark-lore-button">
            Ir para a mesa
          </Link>
          <Link to="/oraculo" className="dark-lore-button dark-lore-button-ghost">
            Abrir Luna em tela cheia
          </Link>
          <Link to="/jogar/oraculo" className="dark-lore-button dark-lore-button-ghost">
            Abrir oraculo original
          </Link>
        </div>
      </section>
    </div>
  );
}
