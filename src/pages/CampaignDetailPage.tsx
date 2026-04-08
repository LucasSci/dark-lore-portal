import { Link, useParams } from "react-router-dom";

import { SozSectionIntro } from "@/components/soz/SozPrimitives";
import { useCampaignPublications } from "@/lib/publications";
import { archiveReferenceArt } from "@/lib/archive-reference";
import { usePortalShellMode } from "@/lib/portal-state";
import { getSozCampaign, resolveSozCharacters, resolveSozLocations } from "@/lib/soz-content";

export default function CampaignDetailPage() {
  usePortalShellMode("editorial", "ambient");

  const { campaignSlug } = useParams<{ campaignSlug: string }>();
  const { publishedPublications } = useCampaignPublications();
  const campaign = campaignSlug ? getSozCampaign(campaignSlug) : null;

  if (!campaign) {
    return (
      <div className="soz-page">
        <section className="soz-page-section">
          <div className="soz-container">
            <div className="soz-empty">
              Nenhuma campanha foi encontrada para este registro. Volte para{" "}
              <Link to="/campanhas" className="soz-inline-link">
                Campanhas
              </Link>
              .
            </div>
          </div>
        </section>
      </div>
    );
  }

  const characters = resolveSozCharacters(campaign.characterSlugs);
  const locations = resolveSozLocations(campaign.locationSlugs);

  return (
    <div className="soz-page">
      <section className="soz-page-section">
        <div className="soz-container soz-detail-grid">
          <div className="soz-detail-image">
            <img src={campaign.image ?? archiveReferenceArt.portal} alt="" aria-hidden="true" decoding="async" />
          </div>

          <div className="soz-detail-stack">
            <div className="soz-panel">
              <p className="soz-eyebrow">
                {campaign.status} • {campaign.era}
              </p>
              <h1 className="soz-section-title">{campaign.title}</h1>
              <p className="soz-section-copy">{campaign.synopsis}</p>
              <p className="soz-card-copy">{campaign.description}</p>
            </div>

            <div className="soz-grid-2">
              <article className="soz-info-card">
                <p className="soz-card-meta">Locais importantes</p>
                <div className="soz-chip-row">
                  {locations.map((location) => (
                    <span key={location.slug} className="soz-chip">
                      {location.title}
                    </span>
                  ))}
                </div>
              </article>
              <article className="soz-info-card">
                <p className="soz-card-meta">Campo de operacao</p>
                <p className="soz-card-copy">
                  A campanha mistura expedicao ao deserto, leitura de profecia e disputa por
                  ruinas que nao deveriam responder a ninguem.
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="soz-page-section">
        <div className="soz-container">
          <SozSectionIntro
            eyebrow="Personagens envolvidos"
            title="Elenco principal da campanha"
            copy="A campanha atual se organiza ao redor de vetores que ja carregam a crise em seus corpos, livros, armas e escolhas."
          />

          <div className="soz-grid-3">
            {characters.map((character) => (
              <article key={character.slug} className="soz-character-card">
                <div className="soz-character-image" aria-hidden="true">
                  <img src={character.image} alt="" loading="lazy" decoding="async" />
                </div>
                <div className="soz-character-content">
                  <p className="soz-eyebrow">{character.subtitle}</p>
                  <h2 className="soz-card-title">{character.title}</h2>
                  <p className="soz-card-copy">{character.summary}</p>
                  <Link to={`/personagem/${character.slug}`} className="soz-card-link">
                    Abrir personagem
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="soz-page-section">
        <div className="soz-container soz-grid-2">
          <div className="soz-panel">
            <SozSectionIntro
              eyebrow="Eventos da campanha"
              title="Quatro linhas de pressao que definem Ecos de Areth-Ur"
              copy="A campanha atual se move por grimorio, areia negra, profecia e ruinas soterradas."
            />
            <ul className="soz-list">
              {campaign.eventHighlights.map((event) => (
                <li key={event}>{event}</li>
              ))}
            </ul>
          </div>

          <div className="soz-panel">
            <SozSectionIntro
              eyebrow="Registros de campo"
              title="Rumores, contratos e ecos que cercam a campanha"
              copy="O site usa relatorios curtos para dar densidade de mundo ao arco atual."
            />
            <ul className="soz-list">
              {campaign.fieldReports.map((report) => (
                <li key={report}>{report}</li>
              ))}
              {publishedPublications.slice(0, 2).map((publication) => (
                <li key={publication.id}>
                  {publication.title}: {publication.excerpt}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="soz-page-section">
        <div className="soz-container">
          <div className="soz-cta-panel">
            <div className="soz-section-intro" style={{ marginBottom: 0 }}>
              <p className="soz-eyebrow">Continuar a campanha</p>
              <h2 className="soz-section-title">
                Leitura, bestiario e cronologia agora orbitam o mesmo arco.
              </h2>
              <p className="soz-section-copy">
                Use as paginas do site para aprofundar personagens, criaturas e eras antes de levar
                a campanha para a mesa.
              </p>
            </div>

            <div className="soz-button-row">
              <Link to="/personagens" className="soz-button">
                Personagens
              </Link>
              <Link to="/bestiario" className="soz-button-secondary">
                Bestiario
              </Link>
              <Link to="/cronologia" className="soz-button-secondary">
                Cronologia
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
