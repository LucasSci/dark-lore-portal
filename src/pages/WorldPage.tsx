import { Link } from "react-router-dom";

import { SozSectionIntro, SozTimelineList } from "@/components/soz/SozPrimitives";
import { archiveReferenceArt } from "@/lib/archive-reference";
import { SOZ_CHRONOLOGY_ERAS, SOZ_SITE, SOZ_WORLD_PILLARS } from "@/lib/soz-content";
import { usePortalShellMode } from "@/lib/portal-state";

export default function WorldPage() {
  usePortalShellMode("editorial", "ambient");

  return (
    <div className="soz-page">
      <section className="soz-page-section">
        <div className="soz-container soz-detail-grid">
          <div className="soz-detail-image">
          <img src={archiveReferenceArt.hero} alt="" aria-hidden="true" decoding="async" />
          </div>

          <div className="soz-detail-stack">
            <div className="soz-panel">
              <p className="soz-eyebrow">O Mundo</p>
              <h1 className="soz-section-title">
                O Veu, o caos e a areia que aprendeu a sangrar.
              </h1>
              <p className="soz-section-copy">
                {SOZ_SITE.universeLine} Esta pagina serve como eixo narrativo do universo, reunindo
                os cinco pilares que sustentam a cronica de Zerrikania.
              </p>
            </div>

            <div className="soz-grid-2">
              {SOZ_WORLD_PILLARS.slice(0, 4).map((pillar) => (
                <article key={pillar.id} className="soz-info-card">
                  <p className="soz-card-meta">{pillar.eyebrow}</p>
                  <h2 className="soz-card-title">{pillar.title}</h2>
                  <p className="soz-card-copy">{pillar.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="soz-page-section">
        <div className="soz-container">
          <SozSectionIntro
            eyebrow="Pilares narrativos"
            title="Cinco eixos para entender o universo de Sands of Zerrikania"
            copy="Aqui o mundo nao e explicado como compendio escolar, e sim como estrutura de tensao. Cada pilar revela o tipo de forca que disputa o destino do continente."
          />

          <div className="soz-grid-2">
            {SOZ_WORLD_PILLARS.map((pillar) => (
              <article id={pillar.id} key={pillar.id} className="soz-panel">
                <p className="soz-card-meta">{pillar.eyebrow}</p>
                <h2 className="soz-card-title">{pillar.title}</h2>
                <p className="soz-card-copy">{pillar.description}</p>
                <p className="soz-card-copy" style={{ color: "#e7cb94" }}>
                  {pillar.accent}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="soz-page-section">
        <div className="soz-container soz-grid-2">
          <div className="soz-visual-panel">
            <img src={archiveReferenceArt.portal} alt="" aria-hidden="true" loading="lazy" decoding="async" />
            <div className="soz-visual-caption">
              <strong style={{ display: "block", marginBottom: "0.5rem", color: "#e7cb94", fontFamily: "var(--font-display)" }}>
                Zerrikania
              </strong>
              O deserto nao e apenas cenario. E o lugar onde profecia, realeza, magia e
              contencao viva deixam de poder ser separadas.
            </div>
          </div>

          <div className="soz-panel">
            <SozSectionIntro
              eyebrow="Zerrikania"
              title="O coracao dourado da crise"
              copy="Zerrikania concentra a tensao entre poder politico, profecia e ruina. As Sete Cobras, os Guardioes e as areias negras transformam o deserto em palco de um conflito que diz respeito ao continente inteiro."
            />
            <div className="soz-chip-row">
              <span className="soz-chip">Sete Cobras</span>
              <span className="soz-chip">Guardioes</span>
              <span className="soz-chip">Areia negra</span>
              <span className="soz-chip">Profecia</span>
            </div>
          </div>
        </div>
      </section>

      <section className="soz-page-section">
        <div className="soz-container">
          <SozSectionIntro
            eyebrow="Cronologia do mundo"
            title="O universo pode ser lido como uma sucessao de fraturas"
            copy="A leitura do mundo se aprofunda quando cada era mostra como o continente deixou de ser inteiro e passou a viver em estado de pressao permanente."
          />

          <SozTimelineList
            items={SOZ_CHRONOLOGY_ERAS.map((era) => ({
              eyebrow: era.eyebrow,
              title: era.title,
              description: era.highlight,
            }))}
          />
        </div>
      </section>

      <section className="soz-page-section">
        <div className="soz-container">
          <div className="soz-cta-panel">
            <div className="soz-section-intro" style={{ marginBottom: 0 }}>
              <p className="soz-eyebrow">Continuar a travessia</p>
              <h2 className="soz-section-title">Depois do mundo, siga pelas faces e pelas feras.</h2>
              <p className="soz-section-copy">
                Abra os personagens para ler motivacoes e alianças. Depois atravesse o bestiario
                para entender o que a falha do Veu deixou no rastro do continente.
              </p>
            </div>

            <div className="soz-button-row">
              <Link to="/personagens" className="soz-button">
                Ver personagens
              </Link>
              <Link to="/bestiario" className="soz-button-secondary">
                Abrir bestiario
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
