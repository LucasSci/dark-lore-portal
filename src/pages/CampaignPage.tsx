import { BookMarked, Compass, ScrollText, Sparkles, Swords } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  V2FilterTabs,
  V2MetadataPanel,
  V2QuoteBlock,
  V2SearchBar,
} from "@/components/portal/v2/PortalV2";
import { archiveReferenceArt } from "@/lib/archive-reference";
import { usePortalShellMode } from "@/lib/portal-state";
import { getCampaignPublicationBySlug, useCampaignPublications, type PublicationKind } from "@/lib/publications";

const archiveGallery = [
  archiveReferenceArt.desk,
  archiveReferenceArt.wanderer,
  archiveReferenceArt.forgotten,
] as const;

const filterOptions = [
  { value: "todos", label: "Todos" },
  { value: "cronica", label: "Cronicas" },
  { value: "contrato", label: "Contratos" },
  { value: "rumor", label: "Rumores" },
  { value: "relatorio", label: "Relatorios" },
] as const;

type ChronicleFilter = (typeof filterOptions)[number]["value"];

function formatPublicationKind(kind: PublicationKind) {
  switch (kind) {
    case "cronica":
      return "Cronica";
    case "contrato":
      return "Contrato";
    case "rumor":
      return "Rumor";
    case "relatorio":
      return "Relatorio";
    default:
      return kind;
  }
}

export default function CampaignPage() {
  const { entrySlug } = useParams();
  usePortalShellMode("editorial", "ambient");
  const { publishedPublications } = useCampaignPublications();
  const publication = entrySlug ? getCampaignPublicationBySlug(entrySlug) : null;
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ChronicleFilter>("todos");
  const filteredPublications = useMemo(() => {
    return publishedPublications.filter((entry) => {
      const matchesFilter = filter === "todos" ? true : entry.kind === filter;
      const haystack = `${entry.title} ${entry.excerpt} ${entry.location} ${entry.author}`.toLowerCase();
      const matchesQuery = query.trim() ? haystack.includes(query.trim().toLowerCase()) : true;
      return matchesFilter && matchesQuery;
    });
  }, [filter, publishedPublications, query]);

  if (entrySlug) {
    if (!publication) {
      return (
        <div className="portal-v2-page">
          <section className="portal-v2-section space-y-5">
            <p className="portal-v2-kicker">Archive / Missing record</p>
            <h1 className="portal-v2-title max-w-[12ch]">Este manuscrito nao foi preservado no arquivo.</h1>
            <p className="portal-v2-body">
              O slug informado nao corresponde a uma cronica publicada. Volte ao catalogo para
              abrir outro manuscrito.
            </p>
            <div className="portal-v2-actions">
              <Link to="/cronicas" className="dark-lore-button">
                Voltar ao arquivo
              </Link>
              <Link to="/jogar" className="dark-lore-button dark-lore-button-ghost">
                Ir para a suite
              </Link>
            </div>
          </section>
        </div>
      );
    }

    const paragraphs = publication.body
      .split(/\n+/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);

    return (
      <div className="portal-v2-page">
        <section className="portal-v2-section relative min-h-[26rem] overflow-hidden">
          <div className="portal-v2-hero-media">
            <img
              src={archiveGallery[publication.chapterNumber % archiveGallery.length]}
              alt=""
              aria-hidden="true"
              decoding="async"
            />
          </div>
          <div className="portal-v2-hero-overlay" />
          <div className="relative z-[1] flex min-h-[26rem] flex-col justify-end gap-5 p-6 md:p-10">
            <Link to="/cronicas" className="portal-v2-breadcrumb">
              <BookMarked className="h-4 w-4" />
              Archive / Chronicles
            </Link>
            <p className="portal-v2-kicker">
              {formatPublicationKind(publication.kind)} / Capitulo {String(publication.chapterNumber).padStart(2, "0")}
            </p>
            <h1 className="portal-v2-title max-w-[11ch]">{publication.title}</h1>
            <p className="portal-v2-body max-w-[46rem]">{publication.excerpt}</p>
            <div className="portal-v2-actions">
              <Link to="/cronicas" className="dark-lore-button">
                Voltar ao arquivo
              </Link>
              <Link to="/jogar" className="dark-lore-button dark-lore-button-ghost">
                <Swords className="mr-2 h-4 w-4" />
                Levar para a sessao
              </Link>
            </div>
          </div>
        </section>

        <section className="portal-v2-reading-layout">
          <article className="portal-v2-manuscript">
            <div className="space-y-6">
              <V2QuoteBlock>{publication.excerpt}</V2QuoteBlock>
              {paragraphs.map((paragraph, index) => (
                <p key={`${publication.id}-${index}`}>{paragraph}</p>
              ))}
            </div>
          </article>

          <aside className="portal-v2-reading-stack">
            <V2MetadataPanel
              title="Ficha do manuscrito"
              rows={[
                { label: "Origem", value: publication.location },
                { label: "Autor", value: publication.author },
                { label: "Replies", value: publication.replies },
                {
                  label: "Atualizacao",
                  value: new Date(publication.updatedAt).toLocaleDateString("pt-BR"),
                },
                {
                  label: "Protagonistas",
                  value: publication.protagonists.length ? publication.protagonists.join(", ") : "Nao catalogados",
                },
              ]}
              footer={
                <div className="portal-v2-actions">
                  <Link to="/mapa" className="dark-lore-button dark-lore-button-ghost">
                    <Compass className="mr-2 h-4 w-4" />
                    Cruzar atlas
                  </Link>
                  <Link to="/universo" className="dark-lore-button dark-lore-button-ghost">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Abrir dossies
                  </Link>
                </div>
              }
            />

            <V2MetadataPanel
              title="Uso em campanha"
              rows={[
                {
                  label: "Cena sugerida",
                  value: "Use este texto como handout, rumor de taverna ou leitura de abertura do mestre.",
                },
                {
                  label: "Tom",
                  value: "Editorial premium, arquivo raro e registro carregado de consequência.",
                },
              ]}
            />
          </aside>
        </section>
      </div>
    );
  }

  const featured = filteredPublications.slice(0, 2);
  const archive = filteredPublications.slice(2);
  const rareEntries = filteredPublications.filter((entry) => entry.replies <= 3).slice(0, 3);

  return (
    <div className="portal-v2-page">
      <section className="portal-v2-section space-y-6">
        <div className="space-y-3">
          <p className="portal-v2-kicker">ARCHIVE / Desktop</p>
          <h1 className="dark-lore-section-title max-w-[12ch]">Cronicas Veladas e registros do arquivo vivo.</h1>
          <p className="portal-v2-body max-w-[48rem]">
            O catalogo agora funciona como colecao rara e navegavel: busca, filtros, entradas em
            destaque e trilhas prontas para cruzar manuscrito, atlas e sessao.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <V2SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Buscar manuscritos, rumores ou contratos..."
          />
          <V2FilterTabs value={filter} options={filterOptions} onChange={setFilter} />
        </div>
      </section>

      <section className="portal-v2-subgrid">
        <div className="space-y-6">
          <div className="portal-v2-grid-2">
            {featured.map((entry, index) => (
              <Link key={entry.id} to={`/cronicas/${entry.slug}`} className="portal-v2-journey-card">
                <div className="portal-v2-journey-media">
                  <img src={archiveGallery[index % archiveGallery.length]} alt="" aria-hidden="true" loading="lazy" decoding="async" />
                </div>
                <div className="portal-v2-journey-body">
                  <p className="portal-v2-card-meta">
                    <ScrollText className="h-4 w-4" />
                    {formatPublicationKind(entry.kind)} / {entry.location}
                  </p>
                  <h2 className="portal-v2-card-title">{entry.title}</h2>
                  <p className="portal-v2-card-copy">{entry.excerpt}</p>
                  <span className="dark-lore-button dark-lore-button-small">Abrir manuscrito</span>
                </div>
              </Link>
            ))}
          </div>

          <section className="portal-v2-section space-y-5">
            <div className="space-y-3">
              <p className="portal-v2-kicker">Archive catalog</p>
              <h2 className="dark-lore-section-title">Entradas navegaveis para continuar a leitura.</h2>
            </div>
            <div className="space-y-4">
              {archive.map((entry) => (
                <Link key={entry.id} to={`/cronicas/${entry.slug}`} className="portal-v2-detail-card block">
                  <div className="portal-v2-card-body">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="dark-lore-chip">{formatPublicationKind(entry.kind)}</span>
                      <span className="dark-lore-chip">{entry.location}</span>
                    </div>
                    <h3 className="portal-v2-card-title">{entry.title}</h3>
                    <p className="portal-v2-card-copy">{entry.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <V2MetadataPanel
            title="Rare entries"
            rows={rareEntries.map((entry) => ({
              label: entry.location,
              value: (
                <Link to={`/cronicas/${entry.slug}`} className="block">
                  <span className="font-display text-[1.1rem] text-[var(--v2-soft-gold)]">{entry.title}</span>
                  <span className="mt-1 block text-sm leading-7 text-[rgb(232_224_207_/_0.74)]">{entry.excerpt}</span>
                </Link>
              ),
            }))}
          />

          <V2QuoteBlock>
            "Archive must feel rare, forbidden and still easy to navigate. The beauty comes from the
            collection, not from clutter."
          </V2QuoteBlock>

          <V2MetadataPanel
            title="Pontes do arquivo"
            rows={[
              {
                label: "Universo",
                value: "Cruzar personagens, faccoes e lugares mencionados nestes registros.",
              },
              {
                label: "Atlas",
                value: "Levar o contexto geografico da cronica para a proxima travessia.",
              },
              {
                label: "Suite",
                value: "Transformar um manuscrito em handout, cena ou pista da campanha.",
              },
            ]}
            footer={
              <div className="portal-v2-actions">
                <Link to="/universo" className="dark-lore-button dark-lore-button-ghost">
                  Universo
                </Link>
                <Link to="/mapa" className="dark-lore-button dark-lore-button-ghost">
                  Atlas
                </Link>
                <Link to="/jogar" className="dark-lore-button">
                  Sessao
                </Link>
              </div>
            }
          />
        </aside>
      </section>
    </div>
  );
}
