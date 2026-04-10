import { Link, useParams } from "react-router-dom";

import { SozSectionIntro, SozTimelineList } from "@/components/soz/SozPrimitives";
import { getEncyclopediaEntry, getLinkedEntries } from "@/lib/encyclopedia";
import { usePortalShellMode } from "@/lib/portal-state";

export default function CharacterPage() {
  usePortalShellMode("editorial", "ambient");

  const { entrySlug } = useParams<{ entrySlug: string }>();
  const entry = entrySlug ? getEncyclopediaEntry(entrySlug) : null;

  if (!entry || entry.category !== "personagens") {
    return (
      <div className="soz-page">
        <section className="soz-page-section">
          <div className="soz-container">
            <div className="soz-empty">
              Nenhum personagem foi encontrado para este dossie. Volte para{" "}
              <Link to="/personagens" className="soz-inline-link">
                Personagens
              </Link>
              .
            </div>
          </div>
        </section>
      </div>
    );
  }

  const linkedEntries = getLinkedEntries(entry).slice(0, 4);

  return (
    <div className="soz-page">
      <section className="soz-page-section">
        <div className="soz-container soz-detail-grid">
          <div className="soz-detail-image">
            <img src={entry.image} alt={entry.imageAlt} decoding="async" />
          </div>

          <div className="soz-detail-stack">
            <div className="soz-panel">
              <p className="soz-eyebrow">Dossie individual</p>
              <h1 className="soz-section-title">{entry.title}</h1>
              <p className="soz-section-copy">{entry.subtitle}</p>
              <p className="soz-card-copy">{entry.summary}</p>
              <div className="soz-chip-row">
                {entry.stats.map((stat) => (
                  <span key={stat.label} className="soz-chip">
                    {stat.label}: {stat.value}
                  </span>
                ))}
              </div>
            </div>

            <div className="soz-grid-2">
              <article className="soz-info-card">
                <p className="soz-card-meta">Motivacao</p>
                <p className="soz-card-copy">
                  {entry.narrative[1]?.body ?? entry.summary}
                </p>
              </article>
              <article className="soz-info-card">
                <p className="soz-card-meta">Aliancas</p>
                <p className="soz-card-copy">
                  {linkedEntries.length > 0
                    ? linkedEntries.map((linkedEntry) => linkedEntry.title).join(", ")
                    : "Nenhuma alianca explicita registrada no arquivo."}
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
              eyebrow="Historia"
              title={entry.narrative[0]?.heading ?? "Historia do personagem"}
              copy={entry.narrative[0]?.body ?? entry.summary}
            />
          </div>

          <div className="soz-panel">
            <SozSectionIntro
              eyebrow="Motivacao"
              title={entry.narrative[1]?.heading ?? "Motivacao e conflito"}
              copy={entry.narrative[1]?.body ?? entry.summary}
            />
          </div>
        </div>
      </section>

      <section className="soz-page-section">
        <div className="soz-container">
          <SozSectionIntro
            eyebrow="Eventos importantes"
            title="O personagem em movimento na cronica"
            copy="A linha do tempo abaixo reune os marcos que mais definem a posicao deste personagem no colapso do Veu."
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

      {linkedEntries.length > 0 ? (
        <section className="soz-page-section">
          <div className="soz-container">
            <SozSectionIntro
              eyebrow="Aliancas e ecos"
              title="Outras entradas ligadas a este personagem"
              copy="As ligacoes abaixo ajudam a continuar a leitura para lugares, eventos e forcas que ampliam o dossie."
            />

            <div className="soz-grid-3">
              {linkedEntries.map((linkedEntry) => {
                const targetPath =
                  linkedEntry.category === "monstros"
                    ? `/criatura/${linkedEntry.slug}`
                    : linkedEntry.category === "personagens"
                      ? `/personagem/${linkedEntry.slug}`
                      : "/mundo";

                return (
                  <article key={linkedEntry.slug} className="soz-info-card">
                    <p className="soz-card-meta">{linkedEntry.subtitle}</p>
                    <h2 className="soz-card-title">{linkedEntry.title}</h2>
                    <p className="soz-card-copy">{linkedEntry.summary}</p>
                    <Link to={targetPath} className="soz-card-link">
                      Continuar leitura
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
