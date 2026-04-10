import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { SozSectionIntro } from "@/components/soz/SozPrimitives";
import { archiveReferenceArt } from "@/lib/archive-reference";
import { getEntriesByCategory } from "@/lib/encyclopedia";
import { usePortalShellMode } from "@/lib/portal-state";
import { getWitcherBestiaryMetadata, witcherBestiaryTypes } from "@/lib/witcher-bestiary";

export default function BestiaryPage() {
  usePortalShellMode("editorial", "ambient");

  const monsters = getEntriesByCategory("monstros");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("Todos");

  const filteredMonsters = useMemo(() => {
    return monsters.filter((monster) => {
      const metadata = getWitcherBestiaryMetadata(monster.slug);
      const matchesQuery =
        query.length === 0 ||
        monster.title.toLowerCase().includes(query.toLowerCase()) ||
        monster.summary.toLowerCase().includes(query.toLowerCase());
      const matchesType = typeFilter === "Todos" || metadata?.type === typeFilter;

      return matchesQuery && matchesType;
    });
  }, [monsters, query, typeFilter]);

  return (
    <div className="soz-page">
      <section className="soz-page-section">
        <div className="soz-container soz-detail-grid">
          <div className="soz-detail-image">
            <img src={archiveReferenceArt.creature} alt="" aria-hidden="true" decoding="async" />
          </div>

          <div className="soz-detail-stack">
            <div className="soz-panel">
              <p className="soz-eyebrow">Bestiario</p>
              <h1 className="soz-section-title">
                Criaturas do continente reorganizadas como um arquivo de caca.
              </h1>
              <p className="soz-section-copy">
                Esta pagina reaproveita descricoes, conceitos e imagens do DarkLorePortal apenas
                como conteudo-fonte. Toda a arquitetura foi reconstruida para funcionar como grid
                narrativo de monstros, com filtro por tipo e pagina individual de criatura.
              </p>
            </div>

            <div className="soz-grid-2">
              <article className="soz-info-card">
                <p className="soz-card-meta">Origem</p>
                <p className="soz-card-copy">
                  Cada entrada preserva descricao, regiao e fraquezas conhecidas do dossie antigo.
                </p>
              </article>
              <article className="soz-info-card">
                <p className="soz-card-meta">Uso</p>
                <p className="soz-card-copy">
                  O novo bestiario foi pensado para leitura rapida, navegacao por tipo e abertura
                  de pagina individual premium.
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="soz-page-section">
        <div className="soz-container">
          <SozSectionIntro
            eyebrow="Arquivo de criaturas"
            title="Grid de monstros com filtro por tipo"
            copy="A base do bestiario continua sendo o conteudo existente, mas a leitura agora e limpa, modular e orientada por descoberta."
          />

          <div className="soz-filter-bar">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar criatura"
              className="soz-filter-input"
              aria-label="Buscar criatura"
            />
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="soz-filter-select"
              aria-label="Filtrar por tipo"
            >
              <option value="Todos">Todos os tipos</option>
              {witcherBestiaryTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="soz-grid-3" style={{ marginTop: "1.4rem" }}>
            {filteredMonsters.map((monster) => {
              const metadata = getWitcherBestiaryMetadata(monster.slug);

              return (
                <article key={monster.slug} className="soz-character-card">
                  <div className="soz-character-image" aria-hidden="true">
                    <img src={monster.image} alt="" loading="lazy" decoding="async" />
                  </div>
                  <div className="soz-character-content">
                    <p className="soz-eyebrow">{metadata?.type ?? monster.subtitle}</p>
                    <h2 className="soz-card-title">{monster.title}</h2>
                    <p className="soz-card-copy">{monster.summary}</p>
                    <div className="soz-chip-row">
                      <span className="soz-chip">{metadata?.regions[0] ?? "Regiao incerta"}</span>
                      <span className="soz-chip">Perigo {metadata?.dangerLevel ?? "?"}/5</span>
                    </div>
                    <Link to={`/criatura/${monster.slug}`} className="soz-card-link">
                      Abrir criatura
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          {filteredMonsters.length === 0 ? (
            <div className="soz-empty" style={{ marginTop: "1.4rem" }}>
              Nenhuma criatura corresponde aos filtros atuais.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
