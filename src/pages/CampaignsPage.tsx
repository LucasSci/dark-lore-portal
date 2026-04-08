import { Link } from "react-router-dom";

import { SozSectionIntro } from "@/components/soz/SozPrimitives";
import { archiveReferenceArt } from "@/lib/archive-reference";
import { usePortalShellMode } from "@/lib/portal-state";
import { SOZ_CAMPAIGNS, resolveSozCharacters, resolveSozLocations } from "@/lib/soz-content";

export default function CampaignsPage() {
  usePortalShellMode("editorial", "ambient");

  return (
    <div className="soz-page">
      <section className="soz-page-section">
        <div className="soz-container soz-detail-grid">
          <div className="soz-detail-image">
          <img src={archiveReferenceArt.portal} alt="" aria-hidden="true" decoding="async" />
          </div>

          <div className="soz-detail-stack">
            <div className="soz-panel">
              <p className="soz-eyebrow">Campanhas</p>
              <h1 className="soz-section-title">
                O portal narrativo encontra a campanha atual sob as areias.
              </h1>
              <p className="soz-section-copy">
                As campanhas agora sao tratadas como parte oficial do site: sinopse, personagens,
                locais importantes e eventos do arco atual. O objetivo e fazer a campanha parecer
                producao canonica do universo.
              </p>
            </div>

            <div className="soz-grid-2">
              <article className="soz-info-card">
                <p className="soz-card-meta">Formato</p>
                <p className="soz-card-copy">
                  Cada campanha recebe sua propria pagina, com identidade visual premium e leitura
                  organizada por sinopse, elenco, lugares e eventos.
                </p>
              </article>
              <article className="soz-info-card">
                <p className="soz-card-meta">Objetivo</p>
                <p className="soz-card-copy">
                  Unir o universo de lore com o eixo vivo de jogo, sem depender da arquitetura
                  antiga do portal.
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="soz-page-section">
        <div className="soz-container">
          <SozSectionIntro
            eyebrow="Campanha atual"
            title="A campanha recebe status de frente narrativa oficial"
            copy="A lista pode crescer depois, mas a primeira versao do novo site ja entrega uma pagina completa para a campanha central."
          />

          <div className="soz-grid-2">
            {SOZ_CAMPAIGNS.map((campaign) => {
              const characters = resolveSozCharacters(campaign.characterSlugs).slice(0, 3);
              const locations = resolveSozLocations(campaign.locationSlugs).slice(0, 3);

              return (
                <article key={campaign.slug} className="soz-campaign-card is-featured">
                  <p className="soz-card-meta">
                    {campaign.status} • {campaign.era}
                  </p>
                  <h2 className="soz-card-title">{campaign.title}</h2>
                  <p className="soz-card-copy">{campaign.synopsis}</p>
                  <div className="soz-chip-row">
                    {characters.map((character) => (
                      <span key={character.slug} className="soz-chip">
                        {character.title}
                      </span>
                    ))}
                    {locations.map((location) => (
                      <span key={location.slug} className="soz-chip">
                        {location.title}
                      </span>
                    ))}
                  </div>
                  <div className="soz-card-action">
                    <Link to={`/campanha/${campaign.slug}`} className="soz-card-link">
                      Abrir campanha
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
