import { Link } from "react-router-dom";

import { SozSectionIntro, SozTimelineList } from "@/components/soz/SozPrimitives";
import { archiveReferenceArt } from "@/lib/archive-reference";
import { SOZ_CHRONOLOGY_ERAS } from "@/lib/soz-content";
import { usePortalShellMode } from "@/lib/portal-state";

export default function ChronologyPage() {
  usePortalShellMode("editorial", "ambient");

  return (
    <div className="soz-page">
      <section className="soz-page-section">
        <div className="soz-container soz-detail-grid">
          <div className="soz-detail-image">
          <img src={archiveReferenceArt.forgotten} alt="" aria-hidden="true" decoding="async" />
          </div>

          <div className="soz-detail-stack">
            <div className="soz-panel">
              <p className="soz-eyebrow">Cronologia</p>
              <h1 className="soz-section-title">
                Linha do tempo do universo, organizada por eras e convergencias.
              </h1>
              <p className="soz-section-copy">
                A cronologia de Sands of Zerrikania organiza a historia do universo por grandes
                fraturas narrativas: a era do Veu, as primeiras convergencias, a queda das Irmas
                de Prata, o deserto sangrando e a era atual.
              </p>
            </div>

            <div className="soz-grid-2">
              <article className="soz-info-card">
                <p className="soz-card-meta">Estrutura</p>
                <p className="soz-card-copy">
                  Em vez de datas secas, cada era funciona como bloco de leitura dramatica e
                  contexto para o restante do site.
                </p>
              </article>
              <article className="soz-info-card">
                <p className="soz-card-meta">Uso</p>
                <p className="soz-card-copy">
                  A cronologia conecta mundo, personagens, bestiario e campanhas sem exigir que o
                  visitante conheca o universo de antemao.
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="soz-page-section">
        <div className="soz-container">
          <SozSectionIntro
            eyebrow="Eras do mundo"
            title="Cinco degraus para entender a historia de Zerrikania"
            copy="A leitura avanca da ordem antiga para a era atual, sempre enfatizando a pressao crescente entre falha, profecia e campanha."
          />

          <SozTimelineList
            items={SOZ_CHRONOLOGY_ERAS.map((era) => ({
              eyebrow: era.eyebrow,
              title: era.title,
              description: era.description,
            }))}
          />
        </div>
      </section>

      <section className="soz-page-section">
        <div className="soz-container soz-grid-2">
          {SOZ_CHRONOLOGY_ERAS.map((era) => (
            <article key={era.id} className="soz-panel">
              <p className="soz-card-meta">{era.eyebrow}</p>
              <h2 className="soz-card-title">{era.title}</h2>
              <p className="soz-card-copy">{era.description}</p>
              <p className="soz-card-copy" style={{ color: "#e7cb94" }}>
                {era.highlight}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="soz-page-section">
        <div className="soz-container">
          <div className="soz-cta-panel">
            <div className="soz-section-intro" style={{ marginBottom: 0 }}>
              <p className="soz-eyebrow">Depois da cronologia</p>
              <h2 className="soz-section-title">Siga para o mundo, para os personagens ou para a campanha.</h2>
              <p className="soz-section-copy">
                A cronologia prepara a leitura das entradas individuais. Depois dela, o ideal e
                abrir o mundo ou acompanhar a campanha atual.
              </p>
            </div>

            <div className="soz-button-row">
              <Link to="/mundo" className="soz-button">
                O mundo
              </Link>
              <Link to="/personagens" className="soz-button-secondary">
                Personagens
              </Link>
              <Link to="/campanhas" className="soz-button-secondary">
                Campanhas
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
