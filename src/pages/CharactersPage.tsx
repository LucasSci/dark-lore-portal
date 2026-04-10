import { Link } from "react-router-dom";

import { SozSectionIntro } from "@/components/soz/SozPrimitives";
import { archiveReferenceArt } from "@/lib/archive-reference";
import { getEntriesByCategory } from "@/lib/encyclopedia";
import { usePortalShellMode } from "@/lib/portal-state";

export default function CharactersPage() {
  usePortalShellMode("editorial", "ambient");

  const characters = getEntriesByCategory("personagens");

  return (
    <div className="soz-page">
      <section className="soz-page-section">
        <div className="soz-container soz-detail-grid">
          <div className="soz-detail-image">
          <img src={archiveReferenceArt.wanderer} alt="" aria-hidden="true" decoding="async" />
          </div>

          <div className="soz-detail-stack">
            <div className="soz-panel">
              <p className="soz-eyebrow">Personagens</p>
              <h1 className="soz-section-title">Faces que carregam profecia, metodo e ruina.</h1>
              <p className="soz-section-copy">
                A pagina de personagens organiza o elenco principal como um arquivo de figuras em
                tensao. Cada card abre uma leitura detalhada de historia, motivacao, aliancas e
                eventos importantes.
              </p>
            </div>

            <div className="soz-grid-2">
              <article className="soz-info-card">
                <p className="soz-card-meta">Profecia</p>
                <p className="soz-card-copy">
                  Personagens como Nashara nao apenas vivem a crise; eles decidem a forma que ela
                  assume no deserto.
                </p>
              </article>
              <article className="soz-info-card">
                <p className="soz-card-meta">Convergencia</p>
                <p className="soz-card-copy">
                  Alaric, Sorrow, Hauz e outros vetores revelam como o mundo passou a reunir vidas
                  diferentes sob a mesma pressao.
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="soz-page-section">
        <div className="soz-container">
          <SozSectionIntro
            eyebrow="Arquivo de personagens"
            title="Um grid feito para abrir dossies individuais"
            copy="Aqui a organizacao e clara, mas a leitura continua cinematografica. Cada card funciona como portal para uma pagina detalhada do personagem."
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
                  <div className="soz-chip-row">
                    {character.stats.slice(0, 2).map((stat) => (
                      <span key={stat.label} className="soz-chip">
                        {stat.label}: {stat.value}
                      </span>
                    ))}
                  </div>
                  <Link to={`/personagem/${character.slug}`} className="soz-card-link">
                    Ver personagem
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
