import { ArrowRight, BookOpen, Flame, ScrollText, Swords, UserRound } from "lucide-react";
import { Link } from "react-router-dom";

import { SOZ_CAMPAIGNS, SOZ_CHRONOLOGY_ERAS, SOZ_SITE, resolveSozCharacters } from "@/lib/soz-content";
import { archiveReferenceArt } from "@/lib/archive-reference";
import { usePortalShellMode } from "@/lib/portal-state";
import { SozSectionIntro, SozTimelineList } from "@/components/soz/SozPrimitives";

const featuredCharacters = resolveSozCharacters(["nashara", "alaric-dorne", "sorrow-noxmourn"]);
const currentCampaign = SOZ_CAMPAIGNS[0];

export default function HomePage() {
  usePortalShellMode("editorial", "ambient");

  return (
    <div className="soz-page">
      <section className="soz-hero">
        <div className="soz-hero-image" aria-hidden="true">
          <img src={archiveReferenceArt.hero} alt="" decoding="async" />
        </div>

        <div className="soz-container soz-hero-grid">
          <div className="soz-hero-copy">
            <p className="soz-hero-eyebrow">Dark fantasy • Site oficial do universo</p>
            <h1 className="soz-page-title">Sands of Zerrikania</h1>
            <p className="soz-copy">{SOZ_SITE.universeLine}</p>

            <div className="soz-hero-actions">
              <Link to="/mundo" className="soz-button">
                Explorar o mundo
              </Link>
              <Link to={`/campanha/${currentCampaign.slug}`} className="soz-button-secondary">
                Ler a campanha
              </Link>
            </div>

            <div className="soz-hero-meta">
              <article className="soz-stat-card">
                <strong>O Veu Falhou</strong>
                <span className="soz-card-copy">
                  Mundos antes isolados comecaram a tocar uns aos outros, trazendo ecos,
                  distorcoes e a correcao violenta do caos.
                </span>
              </article>
              <article className="soz-stat-card">
                <strong>Dragao Negro</strong>
                <span className="soz-card-copy">
                  A profecia de N'kara atravessa o deserto e decide quem caira, quem sera provado
                  e quem guardara as areias.
                </span>
              </article>
              <article className="soz-stat-card">
                <strong>1272</strong>
                <span className="soz-card-copy">
                  A campanha atual converge em Zerrikania com Guardioes, grimorios e o Espectro do
                  Caos em movimento.
                </span>
              </article>
            </div>
          </div>

          <div className="soz-hero-side">
            <div className="soz-scene-panel">
              <div className="soz-scene-view">
                <img src={archiveReferenceArt.portal} alt="" aria-hidden="true" loading="lazy" decoding="async" />
                <div className="soz-scene-caption">
                  <div>
                    <strong>Shahr-Rama</strong>
                    <span>A cidade dourada onde politica, magia e guerra se encontram sob o olhar do deserto.</span>
                  </div>
                  <div>
                    <strong>Nashara</strong>
                    <span>A cacadora no limiar da profecia.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="soz-page-section">
        <div className="soz-container soz-grid-2">
          <div className="soz-panel">
            <SozSectionIntro
              eyebrow="O Mundo"
              title="Onde a areia guarda memoria, sangue e profecia"
              copy="Antes da historia ser nomeada, os mundos existiam sob um Veu imovel. Quando ele comecou a ceder, surgiram rasgos, ecos e a forca corretiva conhecida como Espectro do Caos. Seculos depois, Zerrikania se tornou o epicentro de uma nova convergencia."
            />

            <div className="soz-grid-2">
              <article className="soz-info-card">
                <p className="soz-card-meta">Veu Imovel</p>
                <p className="soz-card-copy">A antiga fronteira entre mundos, agora instavel.</p>
              </article>
              <article className="soz-info-card">
                <p className="soz-card-meta">Irmãs de Prata</p>
                <p className="soz-card-copy">Ecos de Luna que surgem quando a realidade enfraquece.</p>
              </article>
              <article className="soz-info-card">
                <p className="soz-card-meta">Sete Cobras</p>
                <p className="soz-card-copy">O centro politico e magico que governa Shahr-Rama.</p>
              </article>
              <article className="soz-info-card">
                <p className="soz-card-meta">Guardioes</p>
                <p className="soz-card-copy">Contencoes vivas que mantem o mundo unido ao redor do rasgo.</p>
              </article>
            </div>
          </div>

          <div className="soz-visual-panel">
            <img src={archiveReferenceArt.forgotten} alt="" aria-hidden="true" loading="lazy" decoding="async" />
            <div className="soz-visual-caption">
              <strong style={{ display: "block", marginBottom: "0.5rem", color: "#e7cb94", fontFamily: "var(--font-display)" }}>
                A ressonancia do Veu
              </strong>
              O novo site usa a fratura entre mundos como nucleo da identidade visual: beleza
              mistica, pressao cosmica e a sensacao de que o deserto inteiro esta ouvindo.
            </div>
          </div>
        </div>
      </section>

      <section className="soz-page-section">
        <div className="soz-container">
          <SozSectionIntro
            eyebrow="Personagens centrais"
            title="Vetores do destino em meio ao caos"
            copy="A Home apresenta os protagonistas como forcas em colisao: a cacadora ligada a profecia, o mago que atravessa portais proibidos e o manipulador cuja presenca altera o rumo da historia."
          />

          <div className="soz-grid-3">
            {featuredCharacters.map((character) => (
              <article key={character.slug} className="soz-character-card">
                <div className="soz-character-image" aria-hidden="true">
                  <img src={character.image} alt="" loading="lazy" decoding="async" />
                </div>
                <div className="soz-character-content">
                  <p className="soz-eyebrow">{character.subtitle}</p>
                  <h3 className="soz-card-title">{character.title}</h3>
                  <p className="soz-card-copy">{character.summary}</p>
                  <Link to={`/personagem/${character.slug}`} className="soz-card-link">
                    Abrir personagem
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="soz-page-section">
        <div className="soz-container">
          <div className="soz-prophecy-box">
            <div className="soz-sigil">
              <Flame className="h-8 w-8" />
            </div>
            <p className="soz-eyebrow">A Profecia do Dragao Negro</p>
            <blockquote className="soz-quote">{SOZ_SITE.prophecy}</blockquote>
          </div>
        </div>
      </section>

      <section className="soz-page-section">
        <div className="soz-container">
          <SozSectionIntro
            eyebrow="Cronologia visual"
            title="Da falha do Veu a convergencia em Zerrikania"
            copy="A homepage usa uma linha do tempo curta, mas forte, para situar novos visitantes sem exigir leitura extensa. Cada era marca um degrau de pressao ate a campanha atual."
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
        <div className="soz-container">
          <div className="soz-cta-panel">
            <div className="soz-section-intro" style={{ marginBottom: 0 }}>
              <p className="soz-eyebrow">Campanha em destaque</p>
              <h2 className="soz-section-title">Ecos de Areth-Ur</h2>
              <p className="soz-section-copy">
                {currentCampaign.synopsis} Use a campanha como ponte entre mundo, bestiario e
                cronologia.
              </p>
            </div>

            <div className="soz-button-row">
              <Link to="/campanhas" className="soz-button">
                <ScrollText className="h-4 w-4" />
                Abrir campanhas
              </Link>
              <Link to={`/campanha/${currentCampaign.slug}`} className="soz-button-secondary">
                <Swords className="h-4 w-4" />
                Ver campanha atual
              </Link>
              <Link to="/personagens" className="soz-button-secondary">
                <UserRound className="h-4 w-4" />
                Ver personagens
              </Link>
              <Link to="/cronologia" className="soz-button-secondary">
                <BookOpen className="h-4 w-4" />
                Abrir cronologia
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
