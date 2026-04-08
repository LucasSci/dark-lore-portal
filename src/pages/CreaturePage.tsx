import { Link, useParams } from "react-router-dom";

import { SozSectionIntro, SozTimelineList } from "@/components/soz/SozPrimitives";
import { getEncyclopediaEntry } from "@/lib/encyclopedia";
import { usePortalShellMode } from "@/lib/portal-state";
import { getWitcherBestiaryMetadata } from "@/lib/witcher-bestiary";

export default function CreaturePage() {
  usePortalShellMode("editorial", "ambient");

  const { entrySlug } = useParams<{ entrySlug: string }>();
  const entry = entrySlug ? getEncyclopediaEntry(entrySlug) : null;
  const metadata = entrySlug ? getWitcherBestiaryMetadata(entrySlug) : null;

  if (!entry || entry.category !== "monstros") {
    return (
      <div className="soz-page">
        <section className="soz-page-section">
          <div className="soz-container">
            <div className="soz-empty">
              Nenhuma criatura foi encontrada para este dossie. Volte para{" "}
              <Link to="/bestiario" className="soz-inline-link">
                o bestiario
              </Link>
              .
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="soz-page">
      <section className="soz-page-section">
        <div className="soz-container soz-detail-grid">
          <div className="soz-detail-image">
            <img src={entry.image} alt={entry.imageAlt} decoding="async" />
          </div>

          <div className="soz-detail-stack">
            <div className="soz-panel">
              <p className="soz-eyebrow">Criatura</p>
              <h1 className="soz-section-title">{entry.title}</h1>
              <p className="soz-section-copy">{entry.subtitle}</p>
              <p className="soz-card-copy">{entry.summary}</p>
              <div className="soz-chip-row">
                <span className="soz-chip">Tipo: {metadata?.type ?? "Nao catalogado"}</span>
                <span className="soz-chip">Perigo: {metadata?.dangerLevel ?? "?"}/5</span>
                <span className="soz-chip">
                  Habitat: {metadata?.regions.join(", ") ?? "Regiao nao catalogada"}
                </span>
              </div>
            </div>

            <div className="soz-grid-2">
              <article className="soz-info-card">
                <p className="soz-card-meta">Origem</p>
                <p className="soz-card-copy">{entry.narrative[0]?.body ?? entry.summary}</p>
              </article>
              <article className="soz-info-card">
                <p className="soz-card-meta">Curiosidades</p>
                <p className="soz-card-copy">
                  {metadata?.weaknesses.length
                    ? `As fraquezas registradas incluem ${metadata.weaknesses.join(", ")}.`
                    : "Nenhuma contramedida confiavel foi preservada nos relatos."}
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="soz-page-section">
        <div className="soz-container soz-grid-2">
          <div className="soz-panel">
            <SozSectionIntro
              eyebrow="Descricao"
              title="O que o dossie realmente registra"
              copy={entry.narrative[0]?.body ?? entry.summary}
            />
          </div>

          <div className="soz-panel">
            <SozSectionIntro
              eyebrow="Habitat e risco"
              title="Onde a criatura aparece e quao letal ela se torna"
              copy={`Habitat: ${metadata?.regions.join(", ") ?? "Regiao nao catalogada"}. Nivel de perigo: ${metadata?.dangerLevel ?? "?"}/5.`}
            />
            <p className="soz-card-copy">
              {entry.narrative[2]?.body ??
                "Os avistamentos reunidos pelo bestiario ajudam a mapear regioes, padroes e zonas de risco."}
            </p>
          </div>
        </div>
      </section>

      <section className="soz-page-section">
        <div className="soz-container">
          <SozSectionIntro
            eyebrow="Eventos e observacoes"
            title="Como a criatura entrou para a memoria de caca"
            copy="Mesmo quando o bestiario fala em doutrina de caca, a pagina continua lendo a criatura como parte da historia do mundo."
          />

          <SozTimelineList
            items={entry.timeline.map((event) => ({
              eyebrow: event.period,
              title: event.title,
              description: event.description,
            }))}
          />
        </div>
      </section>
    </div>
  );
}
