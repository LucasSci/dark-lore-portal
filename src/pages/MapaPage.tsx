import { useEffect, useMemo } from "react";
import { Compass, MapPinned, Route, ScrollText, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";

import MapGenieWitcherAtlas from "@/components/world/MapGenieWitcherAtlas";
import { archiveReferenceArt } from "@/lib/archive-reference";
import { buildAtlasContextModel, toPortalAtlasFocusState } from "@/lib/atlas-context";
import { getRegionalMapGenieMaps } from "@/lib/mapgenie-witcher";
import { setPortalAtlasFocus, usePortalShellMode } from "@/lib/portal-state";

const atlasHighlights = [
  {
    icon: MapPinned,
    label: "Entrada",
    value: "Mappa mundi e cartas regionais",
  },
  {
    icon: Route,
    label: "Leitura",
    value: "Descida por camadas sem perder contexto",
  },
  {
    icon: ScrollText,
    label: "Ponte",
    value: "Mapa, dossies e sessao no mesmo eixo",
  },
] as const;

export default function MapaPage() {
  usePortalShellMode("editorial", "ambient");

  const regionalMaps = useMemo(() => getRegionalMapGenieMaps(), []);
  const atlasContext = useMemo(() => buildAtlasContextModel(), []);

  useEffect(() => {
    setPortalAtlasFocus(toPortalAtlasFocusState(atlasContext));
  }, [atlasContext]);

  return (
    <div className="container max-w-[1580px] space-y-10 py-10 md:space-y-12 md:py-14">
      <section className="dark-lore-page-frame overflow-hidden">
        <div className="dark-lore-page-hero dark-lore-contact-hero relative">
          <img
            src={archiveReferenceArt.forgotten}
            alt=""
            className="dark-lore-hero-background object-[center_36%]"
          />
          <div className="dark-lore-grain-overlay" />
          <div className="dark-lore-candle-glow dark-lore-candle-glow-left" />
          <div className="dark-lore-candle-glow dark-lore-candle-glow-right" />

          <div className="dark-lore-hero-copy relative z-10 max-w-6xl">
            <div className="flex flex-wrap gap-2">
              <span className="dark-lore-chip is-active">{atlasContext.eyebrow}</span>
              <span className="dark-lore-chip is-muted">
                <Compass className="mr-2 h-4 w-4" />
                Camada mundo
              </span>
            </div>

            <h1 className="dark-lore-section-title max-w-[11ch]">{atlasContext.title}</h1>
            <p className="dark-lore-hero-text max-w-[68ch] text-base md:text-lg">
              {atlasContext.description}
            </p>

            <div className="flex flex-wrap gap-3">
              <Link to="/universo" className="dark-lore-button">
                Abrir dossies
              </Link>
              <Link to="/mesa" className="dark-lore-button dark-lore-button-ghost">
                Levar para a mesa
              </Link>
              <Link to="/campanha" className="dark-lore-button dark-lore-button-ghost">
                Cruzar campanha
              </Link>
            </div>

            <div className="grid gap-3 pt-2 md:grid-cols-2 xl:grid-cols-4">
              {atlasContext.metrics.map((metric) => (
                <div key={metric.label} className="dark-lore-inline-metric">
                  <p className="dark-lore-card-meta">{metric.label}</p>
                  <p className="mt-2 font-display text-xl text-foreground">{metric.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_300px]">
        <aside className="space-y-6">
          <article className="dark-lore-archive-card">
            <div className="space-y-3">
              <p className="dark-lore-card-meta">Atlas hierarquico</p>
              <h2 className="dark-lore-card-title text-3xl">Exploracao por camadas</h2>
              <p className="dark-lore-card-copy text-sm">
                Entre pelo mundo, desca para a regiao, mergulhe no local e leve a leitura para a
                mesa sem trocar de linguagem.
              </p>
            </div>

            <div className="space-y-3">
              {atlasHighlights.map(({ icon: Icon, label, value }) => (
                <div key={label} className="dark-lore-inline-metric">
                  <div className="flex items-start gap-3">
                    <div className="dark-lore-icon-emblem">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="dark-lore-card-meta">{label}</p>
                      <p className="mt-2 text-sm leading-7 text-foreground/84">{value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="dark-lore-archive-card">
            <div className="space-y-3">
              <p className="dark-lore-card-meta">Cartas regionais</p>
              <h3 className="dark-lore-card-title text-2xl">Rotas de acesso rapido</h3>
            </div>

            <div className="grid gap-2">
              {regionalMaps.map((entry) => (
                <Link
                  key={entry.id}
                  to={`/mapa/regional/${entry.id}`}
                  className="dark-lore-chip justify-start px-4"
                >
                  {entry.title}
                </Link>
              ))}
            </div>
          </article>
        </aside>

        <section className="dark-lore-page-frame overflow-hidden">
          <div className="space-y-5 p-3 md:p-4">
            <div className="flex flex-wrap items-start justify-between gap-4 px-2 pt-1 md:px-4">
              <div className="space-y-3">
                <p className="dark-lore-card-meta">Palco cartografico</p>
                <h2 className="dark-lore-card-title text-3xl md:text-4xl">
                  O continente conhecido
                </h2>
                <p className="dark-lore-card-copy max-w-[70ch] text-sm">
                  Abra o mappa mundi, desca por regioes e carregue a leitura ate a mesa sem perder
                  o fio entre cartografia, dossies e campanha.
                </p>
              </div>

              <div className="dark-lore-inline-metric max-w-sm">
                <div className="flex items-start gap-3">
                  <Smartphone className="mt-1 h-4 w-4 shrink-0 text-[hsl(var(--brand))]" />
                  <p className="text-sm leading-7 text-foreground/82">{atlasContext.orientationHint}</p>
                </div>
              </div>
            </div>

            <div className="dark-lore-map-wrapper">
              <MapGenieWitcherAtlas immersive />
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <article className="dark-lore-archive-card">
            <div className="space-y-3">
              <p className="dark-lore-card-meta">Leitura conectada</p>
              <h3 className="dark-lore-card-title text-2xl">Dossies ligados ao mapa</h3>
              <p className="dark-lore-card-copy text-sm">
                Os mesmos rastros do atlas conduzem aos verbetes e publicacoes que sustentam a
                leitura do continente.
              </p>
            </div>

            <div className="space-y-3">
              {atlasContext.related.map((entry) => (
                <Link
                  key={entry.href}
                  to={entry.href}
                  className="block border border-[hsl(var(--brand)/0.18)] bg-[linear-gradient(180deg,hsl(24_16%_14%/.72),hsl(20_18%_8%/.9))] px-4 py-3 transition-[border-color,transform] duration-200 hover:-translate-y-px hover:border-[hsl(var(--brand)/0.34)]"
                >
                  <p className="font-display text-lg text-gold-light">{entry.label}</p>
                  {entry.description ? (
                    <p className="mt-2 text-sm leading-6 text-foreground/72">{entry.description}</p>
                  ) : null}
                </Link>
              ))}
            </div>
          </article>

          <article className="dark-lore-archive-card">
            <div className="space-y-3">
              <p className="dark-lore-card-meta">Proxima acao</p>
              <h3 className="dark-lore-card-title text-2xl">Desdobrar a leitura</h3>
            </div>

            <div className="flex flex-col gap-3">
              {atlasContext.actions.map((action) => (
                <Link
                  key={action.href}
                  to={action.href}
                  className={`dark-lore-button ${
                    action.variant === "outline" || action.variant === "secondary"
                      ? "dark-lore-button-ghost"
                      : ""
                  }`}
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </article>
        </aside>
      </section>

      <section className="dark-lore-cta-band">
        <p className="dark-lore-section-kicker">Travessia</p>
        <h2 className="dark-lore-cta-line">Toda rota pede contexto.</h2>
        <p className="dark-lore-hero-text text-center">
          O atlas conserva suas camadas, filtros e cartas regionais, agora ligados ao mesmo ritmo
          de leitura do restante do arquivo.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/universo" className="dark-lore-button">
            Abrir universo
          </Link>
          <Link to="/jogar" className="dark-lore-button dark-lore-button-ghost">
            Voltar ao jogo
          </Link>
        </div>
      </section>
    </div>
  );
}
