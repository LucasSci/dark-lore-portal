import { BookMarked, Map, ScrollText, Sparkles, Sword } from "lucide-react";
import { Link } from "react-router-dom";

import { archiveBrand, archiveReferenceArt } from "@/lib/archive-reference";
import { usePortalShellMode } from "@/lib/portal-state";

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

export default function PlayPage() {
  usePortalShellMode("editorial", "ambient");

  return (
    <div className="container max-w-[1480px] space-y-10 py-10 md:space-y-12 md:py-14">
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
            <span className="dark-lore-section-kicker">Camara de sessao</span>
            <h1 className="dark-lore-section-title max-w-[12ch]">Jogar sem romper o arquivo.</h1>
            <p className="dark-lore-hero-text max-w-[62ch] text-base md:text-lg">
              O nucleo de jogo volta a reunir mesa, oraculo, ficha e comando. A sessao acontece
              aqui, e o oraculo entra como uma camada viva do mesmo ritual, nao como substituicao.
            </p>

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

      <section className="dark-lore-cta-band">
        <p className="dark-lore-section-kicker">Arquivo vivo</p>
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
