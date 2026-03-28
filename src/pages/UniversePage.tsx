import characterIllustration from "@/assets/encyclopedia/character-illustration.svg";
import factionIllustration from "@/assets/encyclopedia/faction-illustration.svg";
import historyIllustration from "@/assets/encyclopedia/history-illustration.svg";
import locationIllustration from "@/assets/encyclopedia/location-illustration.svg";
import monsterIllustration from "@/assets/encyclopedia/monster-illustration.svg";
import { Fragment, type ComponentType, type ReactNode, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookMarked,
  Flag,
  MapPin,
  Search,
  Skull,
  Sparkles,
  Users,
} from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";

import ContinentMap from "@/components/world/ContinentMap";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getAtlasContextForEntry } from "@/lib/atlas-context";
import { sanitizeImmersiveEntry } from "@/lib/immersive-lore";
import {
  encyclopediaCategories,
  encyclopediaEntries,
  getEncyclopediaEntry,
  getEntriesByCategory,
  getLinkedEntries,
  type EncyclopediaCategory,
  type EncyclopediaEntry,
  type EncyclopediaTimelineEvent,
} from "@/lib/encyclopedia";
import { usePortalShellMode } from "@/lib/portal-state";
import {
  getUniversePublication,
  universePublications,
  type UniversePublication,
  type UniversePublicationMention,
} from "@/lib/universe-publications";
import {
  getWitcherBestiaryMetadata,
  witcherBestiaryRegions,
  witcherBestiaryTypes,
} from "@/lib/witcher-bestiary";
import { archiveReferenceArt } from "@/lib/archive-reference";
import { cn } from "@/lib/utils";

type CategoryFilter = "todas" | EncyclopediaCategory;

type SectionNavItem = {
  id: string;
  label: string;
};

const categoryIcons: Record<EncyclopediaCategory, ComponentType<{ className?: string }>> = {
  personagens: Users,
  monstros: Skull,
  locais: MapPin,
  faccoes: Flag,
  historia: BookMarked,
};

const categoryFallbackImages: Record<EncyclopediaCategory, string> = {
  personagens: characterIllustration,
  monstros: monsterIllustration,
  locais: locationIllustration,
  faccoes: factionIllustration,
  historia: historyIllustration,
};

const revealViewport = { once: true, amount: 0.22 };

const bestiaryOrigins = [
  {
    title: "Cultos Profanos",
    description: "Criaturas invocadas por rituais proibidos, restos de fe corrompida e sangue mal consagrado.",
    icon: Sparkles,
  },
  {
    title: "Reinos Caidos",
    description: "Bestas nascidas de linhagens partidas, cidades perdidas e maldicoes deixadas sem vigia.",
    icon: Flag,
  },
  {
    title: "Horrores Cosmicos",
    description: "Entidades antigas que nao pertencem a este mundo e tratam a realidade como pele fina.",
    icon: Skull,
  },
] as const;

const archiveCategoryDescriptions: Record<EncyclopediaCategory, string> = {
  personagens: "Perfis, linhagens e nomes que sustentam as cronicas e os conflitos do continente.",
  monstros: "Criaturas, ameacas e registros de caca cruzados com atlas, fraquezas e sessao.",
  locais: "Ruinas, cidades, fronteiras e passagens que ancoram a geografia do arquivo.",
  faccoes: "Ordens, cultos e interesses em choque, mantidos sob o mesmo selo editorial.",
  historia: "Capitulos, acontecimentos e ecos de eras antigas organizados para leitura continua.",
};

function useActiveUniverseSection(items: SectionNavItem[]) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");

  useEffect(() => {
    if (!items.some((item) => item.id === activeId)) {
      setActiveId(items[0]?.id ?? "");
    }
  }, [activeId, items]);

  useEffect(() => {
    const sectionElements = items
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (sectionElements.length === 0 || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (left, right) =>
              right.intersectionRatio - left.intersectionRatio ||
              left.boundingClientRect.top - right.boundingClientRect.top,
          );

        if (visibleEntries[0]) {
          setActiveId(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: "-18% 0px -58% 0px",
        threshold: [0.16, 0.32, 0.5],
      },
    );

    sectionElements.forEach((sectionElement) => observer.observe(sectionElement));

    return () => observer.disconnect();
  }, [items]);

  return { activeId, setActiveId };
}

function UniverseSectionNav({ label, items }: { label: string; items: SectionNavItem[] }) {
  const { activeId, setActiveId } = useActiveUniverseSection(items);

  return (
    <nav aria-label={label} className="dark-lore-scrollspy">
      <div className="flex items-center gap-2 overflow-x-auto">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            aria-current={activeId === item.id ? "location" : undefined}
            onClick={() => setActiveId(item.id)}
            className={cn("dark-lore-chip", activeId === item.id && "is-active")}
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function renderPublicationParagraph(paragraph: string, mentions: UniversePublicationMention[]) {
  const orderedMentions = [...mentions].sort((left, right) => right.label.length - left.label.length);

  if (orderedMentions.length === 0) {
    return paragraph;
  }

  const mentionByLabel = new Map(orderedMentions.map((mention) => [mention.label.toLowerCase(), mention]));
  const pattern = new RegExp(orderedMentions.map((mention) => escapeRegExp(mention.label)).join("|"), "gi");
  const nodes: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of paragraph.matchAll(pattern)) {
    const start = match.index ?? 0;
    const value = match[0];

    if (start > lastIndex) {
      nodes.push(<Fragment key={`text-${lastIndex}`}>{paragraph.slice(lastIndex, start)}</Fragment>);
    }

    const mention = mentionByLabel.get(value.toLowerCase());

    if (mention) {
      nodes.push(
        <Link
          key={`${mention.slug}-${start}`}
          to={`/universo/${mention.slug}`}
          className="font-medium text-primary transition-colors hover:text-primary/80"
        >
          {value}
        </Link>,
      );
    } else {
      nodes.push(<Fragment key={`match-${start}`}>{value}</Fragment>);
    }

    lastIndex = start + value.length;
  }

  if (lastIndex < paragraph.length) {
    nodes.push(<Fragment key={`tail-${lastIndex}`}>{paragraph.slice(lastIndex)}</Fragment>);
  }

  return nodes;
}

function EncyclopediaImage({
  entry,
  className,
}: {
  entry: EncyclopediaEntry;
  className?: string;
}) {
  const fallbackImage = categoryFallbackImages[entry.category];
  const [imageSrc, setImageSrc] = useState(entry.image);

  useEffect(() => {
    setImageSrc(entry.image);
  }, [entry.image]);

  return (
    <img
      src={imageSrc}
      alt={entry.imageAlt}
      className={className}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => {
        if (imageSrc !== fallbackImage) {
          setImageSrc(fallbackImage);
        }
      }}
    />
  );
}

function TimelineRail({
  title,
  events,
}: {
  title: string;
  events: EncyclopediaTimelineEvent[];
}) {
  return (
    <div className="dark-lore-archive-card dark-lore-archive-card-compact">
      <div className="space-y-5 p-6 md:p-7">
        <div>
          <p className="dark-lore-section-kicker">{title}</p>
          <h2 className="dark-lore-section-title mt-3 text-left">Linha do tempo</h2>
        </div>

        <div className="space-y-4">
          {events.map((event, index) => (
            <div key={`${event.period}-${event.title}`} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="h-3.5 w-3.5 border border-primary/40 bg-primary/90" />
                {index < events.length - 1 ? <div className="mt-2 h-full w-px bg-primary/28" /> : null}
              </div>
              <div className="pb-4">
                <p className="dark-lore-card-meta">{event.period}</p>
                <h3 className="dark-lore-card-title mt-2 text-[clamp(1.5rem,2vw,1.95rem)]">
                  {event.title}
                </h3>
                <p className="dark-lore-card-copy mt-2">{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function UniverseAtlasActionButton({
  to,
  label,
  icon: Icon,
  variant = "primary",
}: {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  variant?: "primary" | "secondary";
}) {
  return (
    <Link
      to={to}
      className={cn(
        "dark-lore-button dark-lore-button-small dark-lore-atlas-action-button",
        variant === "secondary" && "dark-lore-atlas-action-button-secondary",
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  );
}

function EncyclopediaEntryCard({
  entry,
  detailBase,
}: {
  entry: EncyclopediaEntry;
  detailBase: "/universo" | "/bestiario";
}) {
  const Icon = categoryIcons[entry.category];
  const bestiaryMeta = getWitcherBestiaryMetadata(entry.slug);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={revealViewport}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="dark-lore-hover-surface"
    >
      <Link to={`${detailBase}/${entry.slug}`} className="dark-lore-entry-card">
        <div className="dark-lore-entry-card-media">
          <EncyclopediaImage
            entry={entry}
            className={cn(
              "dark-lore-hover-image h-full w-full transition duration-500 group-hover:scale-[1.03]",
              entry.category === "monstros"
                ? "dark-lore-monster-thumb object-contain p-4"
                : "object-cover",
            )}
          />
        </div>

        <div className="space-y-4 p-5 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <Badge variant="outline" className="border-primary/30 text-primary">
              {encyclopediaCategories[entry.category].label}
            </Badge>
            <Icon className="h-4 w-4 text-primary/78" />
          </div>

          <div className="space-y-2">
            <h3 className="dark-lore-card-title text-[clamp(1.6rem,2vw,2.2rem)]">{entry.title}</h3>
            <p className="dark-lore-card-copy">{entry.summary}</p>
          </div>

          {bestiaryMeta ? (
            <p className="dark-lore-card-meta">
              {bestiaryMeta.type} - Perigo {bestiaryMeta.dangerLevel}/5
            </p>
          ) : (
            <p className="dark-lore-card-meta">{entry.subtitle}</p>
          )}
        </div>
      </Link>
    </motion.article>
  );
}

function UniversePublicationCard({ publication }: { publication: UniversePublication }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={revealViewport}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="dark-lore-hover-surface"
    >
      <Link to={`/universo/${publication.slug}`} className="dark-lore-entry-card">
        <div className="dark-lore-entry-card-media">
          <img
            src={publication.image}
            alt={publication.title}
            className="dark-lore-hover-image h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        </div>

        <div className="space-y-4 p-5 md:p-6">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-primary/30 text-primary">
              {publication.chapterLabel}
            </Badge>
            <Badge variant="secondary">{publication.location}</Badge>
          </div>

          <div className="space-y-2">
            <h3 className="dark-lore-card-title text-[clamp(1.6rem,2vw,2.2rem)]">{publication.title}</h3>
            <p className="dark-lore-card-copy">{publication.excerpt}</p>
          </div>

          <p className="dark-lore-card-meta">Cronica exclusiva</p>
        </div>
      </Link>
    </motion.article>
  );
}

function UniverseIndex() {
  const location = useLocation();
  const bestiaryMode = location.pathname.startsWith("/bestiario");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>(() =>
    bestiaryMode ? "monstros" : "todas",
  );
  const [monsterType, setMonsterType] = useState("all");
  const [monsterRegion, setMonsterRegion] = useState("all");
  const [monsterDanger, setMonsterDanger] = useState("all");
  const [heroDrift, setHeroDrift] = useState({ x: 0, y: 0 });
  const [scrollOffset, setScrollOffset] = useState(0);

  const immersiveEntries = useMemo(() => encyclopediaEntries.map(sanitizeImmersiveEntry), []);
  const showMonsterFilters = bestiaryMode || activeCategory === "monstros";
  const hasMonsterFilters =
    monsterType !== "all" || monsterRegion !== "all" || monsterDanger !== "all";
  const categories = Object.keys(encyclopediaCategories) as EncyclopediaCategory[];
  const detailBase: "/universo" | "/bestiario" = bestiaryMode ? "/bestiario" : "/universo";

  useEffect(() => {
    if (bestiaryMode) {
      setActiveCategory("monstros");
    }
  }, [bestiaryMode]);

  useEffect(() => {
    const syncScrollOffset = () => setScrollOffset(window.scrollY);
    syncScrollOffset();
    window.addEventListener("scroll", syncScrollOffset, { passive: true });
    return () => window.removeEventListener("scroll", syncScrollOffset);
  }, []);

  const filteredPublications = useMemo(() => {
    if (activeCategory !== "todas" && activeCategory !== "historia") {
      return [];
    }

    const term = search.trim().toLowerCase();

    return universePublications.filter((publication) => {
      if (!term) {
        return true;
      }

      const searchable = `${publication.title} ${publication.excerpt} ${publication.location}`.toLowerCase();
      return searchable.includes(term);
    });
  }, [activeCategory, search]);

  const filteredEntries = useMemo(
    () =>
      immersiveEntries.filter((entry) => {
        const matchesCategory =
          activeCategory === "todas" ? true : entry.category === activeCategory;
        const searchable = `${entry.title} ${entry.subtitle} ${entry.summary}`.toLowerCase();
        const matchesSearch = searchable.includes(search.trim().toLowerCase());

        if (!matchesCategory || !matchesSearch) {
          return false;
        }

        if (!showMonsterFilters) {
          return true;
        }

        if (entry.category !== "monstros") {
          return false;
        }

        const bestiaryMeta = getWitcherBestiaryMetadata(entry.slug);

        if (!bestiaryMeta) {
          return !hasMonsterFilters;
        }

        const matchesType = monsterType === "all" ? true : bestiaryMeta.type === monsterType;
        const matchesRegion =
          monsterRegion === "all" ? true : bestiaryMeta.regions.includes(monsterRegion);
        const matchesDanger =
          monsterDanger === "all" ? true : String(bestiaryMeta.dangerLevel) === monsterDanger;

        return matchesType && matchesRegion && matchesDanger;
      }),
    [
      activeCategory,
      hasMonsterFilters,
      immersiveEntries,
      monsterDanger,
      monsterRegion,
      monsterType,
      search,
      showMonsterFilters,
    ],
  );

  const filteredMonsterEntries = useMemo(
    () => filteredEntries.filter((entry) => entry.category === "monstros"),
    [filteredEntries],
  );
  const activeFilterCount = [monsterType, monsterRegion, monsterDanger].filter(
    (value) => value !== "all",
  ).length;

  const featuredMonster =
    filteredMonsterEntries[0] ??
    immersiveEntries.find((entry) => entry.category === "monstros") ??
    immersiveEntries[0];
  const archiveCategoryCards = useMemo(
    () =>
      categories.map((category) => ({
        category,
        count: getEntriesByCategory(category).length,
        description: archiveCategoryDescriptions[category],
      })),
    [categories],
  );
  const featuredPublications = filteredPublications.slice(0, 3);
  const archivePublicationList = filteredPublications.slice(3, 7);

  const heroImage = bestiaryMode
    ? featuredMonster?.image ?? archiveReferenceArt.creature
    : archiveReferenceArt.wanderer;
  const heroTitle = bestiaryMode ? "Bestiario do Continente" : "Arquivo do Universo";
  const heroSubtitle = bestiaryMode
    ? "Criaturas antigas, entidades sem repouso e rastros de caca preservados em dossies do arquivo."
    : "Reinos velados, mapas perdidos, cronicas exclusivas e nomes enterrados sob as areias do continente.";
  const heroPrimaryPath = bestiaryMode ? "/jogar" : "/mapa";
  const heroPrimaryLabel = bestiaryMode ? "Ler no Arquivo Vivo" : "Abrir Mapa";
  const heroSecondaryPath = bestiaryMode ? "/mesa" : "/jogar";
  const heroSecondaryLabel = bestiaryMode ? "Levar para a Mesa" : "Abrir Arquivo Vivo";

  const sectionNavItems = useMemo(() => {
    if (bestiaryMode) {
      return [
        { id: "universo-visao-geral", label: "Arquivo" },
        { id: "universo-categorias", label: "Filtros" },
        { id: "universo-verbetes", label: "Criaturas" },
        { id: "universo-atlas", label: "Destaque" },
      ] satisfies SectionNavItem[];
    }

    const items: SectionNavItem[] = [
      { id: "universo-visao-geral", label: "Limiar" },
      { id: "universo-categorias", label: "Arquivos" },
      { id: "universo-atlas", label: "Cartografia" },
    ];

    if (filteredPublications.length > 0) {
      items.push({ id: "universo-cronicas", label: "Cronicas" });
    }

    items.push({ id: "universo-verbetes", label: "Dossies" });
    return items;
  }, [bestiaryMode, filteredPublications.length]);

  const archiveHighlights = [
    {
      title: "Reinos Perdidos",
      description: "Rotas, capitais partidas e geografias esquecidas ainda pulsando sob o mapa.",
      image: archiveReferenceArt.wanderer,
      path: "/mapa",
      cta: "Abrir mapa",
    },
    {
      title: "Arquivo Vivo",
      description: "Capitulos exclusivos, leitura em camadas e um indice continuo do lore do continente.",
      image: archiveReferenceArt.desk,
      path: "/jogar",
      cta: "Abrir arquivo",
    },
    {
      title: "Mitologias Ocultas",
      description: "Criaturas, faccoes e rumores mantidos vivos entre um dossie e outro.",
      image: archiveReferenceArt.creature,
      path: "/bestiario",
      cta: "Abrir bestiario",
    },
  ];

  const archiveFilters = (
    <div className="dark-lore-filter-stack">
      <div className="dark-lore-filter-search">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/60" />
        <Input
          id="universe-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={
            bestiaryMode
              ? "Buscar criatura, entidade ou tipo..."
              : "Buscar dossie, reino, faccao ou criatura..."
          }
          autoComplete="off"
          className="dark-lore-input pl-10"
        />
      </div>

      {!bestiaryMode ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveCategory("todas")}
            className={cn("dark-lore-chip", activeCategory === "todas" && "is-active")}
          >
            Todas
          </button>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={cn("dark-lore-chip", activeCategory === category && "is-active")}
            >
              {encyclopediaCategories[category].label}
            </button>
          ))}
        </div>
      ) : null}

      {showMonsterFilters ? (
        <div className="grid gap-3 md:grid-cols-3">
          <select
            value={monsterType}
            onChange={(event) => setMonsterType(event.target.value)}
            className="dark-lore-native-select"
          >
            <option value="all">Todos os tipos</option>
            {witcherBestiaryTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <select
            value={monsterRegion}
            onChange={(event) => setMonsterRegion(event.target.value)}
            className="dark-lore-native-select"
          >
            <option value="all">Todas as regioes</option>
            {witcherBestiaryRegions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>

          <select
            value={monsterDanger}
            onChange={(event) => setMonsterDanger(event.target.value)}
            className="dark-lore-native-select"
          >
            <option value="all">Todo perigo</option>
            <option value="1">Perigo 1</option>
            <option value="2">Perigo 2</option>
            <option value="3">Perigo 3</option>
            <option value="4">Perigo 4</option>
            <option value="5">Perigo 5</option>
          </select>
        </div>
      ) : null}
    </div>
  );

  const featuredAtlasContext = featuredMonster ? getAtlasContextForEntry(featuredMonster) : null;

  return (
    <div className="mx-auto max-w-[1320px] space-y-10 px-4 py-8 md:px-6 md:py-12">
      <UniverseSectionNav
        label={bestiaryMode ? "Navegacao do bestiario" : "Navegacao do universo"}
        items={sectionNavItems}
      />

      <section
        id="universo-visao-geral"
        className={cn(
          "dark-lore-page-frame dark-lore-page-hero",
          bestiaryMode ? "dark-lore-bestiary-hero" : "dark-lore-universe-hero",
        )}
        onMouseMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width - 0.5;
          const y = (event.clientY - rect.top) / rect.height - 0.5;
          setHeroDrift({ x, y });
        }}
        onMouseLeave={() => setHeroDrift({ x: 0, y: 0 })}
      >
        <motion.img
          src={heroImage}
          alt=""
          aria-hidden="true"
          className="dark-lore-hero-background"
          animate={{
            x: heroDrift.x * 24,
            y: heroDrift.y * 20 + scrollOffset * -0.08,
            scale: 1.06,
          }}
          transition={{ type: "spring", stiffness: 80, damping: 18 }}
        />
        <div className="dark-lore-grain-overlay" />
        <div className="dark-lore-candle-glow dark-lore-candle-glow-left" />
        <div className="dark-lore-candle-glow dark-lore-candle-glow-right" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="dark-lore-hero-copy dark-lore-hero-copy-centered"
        >
          <p className="dark-lore-section-kicker justify-center">
            {bestiaryMode ? "Arquivo das criaturas" : "Arquivo do continente"}
          </p>
          <h1 className="dark-lore-display-title">{heroTitle}</h1>
          <p className="dark-lore-hero-text max-w-3xl text-center">{heroSubtitle}</p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link to={heroPrimaryPath} className="dark-lore-button">
              {heroPrimaryLabel}
            </Link>
            <Link to={heroSecondaryPath} className="dark-lore-button dark-lore-button-ghost">
              {heroSecondaryLabel}
            </Link>
          </div>
        </motion.div>
      </section>

      {bestiaryMode ? (
        <>
          <section
            id="universo-categorias"
            className="dark-lore-anchor-section dark-lore-page-frame px-6 py-8 md:px-8 md:py-10"
          >
            <div className="space-y-6">
              <div className="text-center">
                <p className="dark-lore-section-kicker justify-center">Busca ritual</p>
                <h2 className="dark-lore-section-title mx-auto">Filtre o arquivo das criaturas</h2>
              </div>
              {archiveFilters}
              <div className="grid gap-3 md:grid-cols-3">
                <div className="dark-lore-archive-card dark-lore-archive-card-compact">
                  <p className="dark-lore-card-meta">Criaturas</p>
                  <h3 className="dark-lore-card-title mt-2 text-[clamp(1.5rem,2vw,1.95rem)]">
                    {filteredMonsterEntries.length}
                  </h3>
                </div>
                <div className="dark-lore-archive-card dark-lore-archive-card-compact">
                  <p className="dark-lore-card-meta">Filtros ativos</p>
                  <h3 className="dark-lore-card-title mt-2 text-[clamp(1.5rem,2vw,1.95rem)]">
                    {activeFilterCount}
                  </h3>
                </div>
                <div className="dark-lore-archive-card dark-lore-archive-card-compact">
                  <p className="dark-lore-card-meta">Camada</p>
                  <h3 className="dark-lore-card-title mt-2 text-[clamp(1.4rem,1.8vw,1.8rem)]">
                    Bestiario vivo
                  </h3>
                </div>
              </div>
            </div>
          </section>

          <section id="universo-verbetes" className="dark-lore-anchor-section space-y-6">
            <div className="text-center">
              <p className="dark-lore-section-kicker justify-center">Criaturas catalogadas</p>
              <h2 className="dark-lore-section-title mx-auto">O arquivo das criaturas</h2>
            </div>

            {filteredMonsterEntries.length > 0 ? (
              <div className="dark-lore-bestiary-grid">
                {filteredMonsterEntries.map((entry) => (
                  <EncyclopediaEntryCard key={entry.slug} entry={entry} detailBase="/bestiario" />
                ))}
              </div>
            ) : (
              <div className="dark-lore-page-frame px-6 py-10 text-center md:px-8">
                <Skull className="mx-auto h-10 w-10 text-primary" />
                <h2 className="dark-lore-section-title mx-auto mt-4">Nenhuma criatura encontrada</h2>
                <p className="mx-auto max-w-3xl text-sm leading-8 text-[hsl(var(--foreground)/0.76)] md:text-base">
                  Ajuste os filtros do arquivo para localizar outra ameaca, tipo ou regiao.
                </p>
              </div>
            )}
          </section>

          <section id="universo-atlas" className="dark-lore-anchor-section space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              {bestiaryOrigins.map(({ title, description, icon: Icon }, index) => (
                <motion.article
                  key={title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={revealViewport}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  className="dark-lore-archive-card dark-lore-archive-card-compact"
                >
                  <div className="flex items-center gap-3">
                    <div className="dark-lore-icon-emblem">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="dark-lore-card-title text-[clamp(1.35rem,1.8vw,1.7rem)]">{title}</p>
                      <p className="dark-lore-card-copy mt-2">{description}</p>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>

            {featuredMonster ? (
              <section className="dark-lore-page-frame dark-lore-editorial-grid">
                <div className="dark-lore-editorial-copy">
                  <p className="dark-lore-section-kicker">Entrada em destaque</p>
                  <h2 className="dark-lore-section-title">{featuredMonster.title}</h2>
                  <p className="dark-lore-editorial-text">{featuredMonster.summary}</p>
                  {featuredAtlasContext ? (
                    <p className="dark-lore-card-meta">
                      {featuredAtlasContext.title} - {featuredAtlasContext.orientationHint}
                    </p>
                  ) : null}
                  <div className="flex flex-wrap gap-3 pt-2">
                    <Link to={`/bestiario/${featuredMonster.slug}`} className="dark-lore-button">
                      Ver ficha completa
                    </Link>
                    {featuredMonster.vtt ? (
                      <Link to={`/mesa?spawn=${featuredMonster.slug}`} className="dark-lore-button dark-lore-button-ghost">
                        Levar para a mesa
                      </Link>
                    ) : null}
                  </div>
                </div>

                <div className="dark-lore-editorial-figure">
                  <EncyclopediaImage
                    entry={featuredMonster}
                    className="dark-lore-editorial-image object-contain p-6"
                  />
                  <div className="dark-lore-editorial-glow" />
                </div>
              </section>
            ) : null}
          </section>

          <section className="dark-lore-cta-band">
            <p className="dark-lore-cta-line">Cada sombra esconde um nome. Cada nome, uma maldicao.</p>
            <Link to="/cronicas" className="dark-lore-button">
              Explorar Cronicas
            </Link>
          </section>
        </>
      ) : (
        <>
          <section id="universo-categorias" className="dark-lore-anchor-section space-y-6">
            <section className="dark-lore-page-frame dark-lore-editorial-grid">
              <div className="dark-lore-editorial-copy">
                <p className="dark-lore-section-kicker">Introducao ao mundo</p>
                <h2 className="dark-lore-section-title">
                  Entre as areias, o arquivo ainda respira.
                </h2>
                <p className="dark-lore-editorial-text">
                  O universo do continente mistura reinos esquecidos, capitulos velados, faccoes
                  em choque e criaturas que seguem atadas a lugares, ruinas e nomes proibidos.
                </p>
                <p className="dark-lore-editorial-text">
                  A leitura foi organizada como estante de arquivo: primeiro o limiar do mundo,
                  depois a cartografia, os manuscritos e por fim os dossies que sustentam cada
                  rastro.
                </p>
                <Link to="/jogar" className="dark-lore-button">
                  Abrir Arquivo Vivo
                </Link>
              </div>

              <div className="dark-lore-editorial-figure">
                <img
                  src={archiveReferenceArt.forgotten}
                  alt=""
                  aria-hidden="true"
                  className="dark-lore-editorial-image"
                />
                <div className="dark-lore-editorial-glow" />
              </div>
            </section>

            <section className="dark-lore-page-frame px-6 py-8 md:px-8 md:py-10">
              <div className="space-y-6">
                <div className="text-center">
                  <p className="dark-lore-section-kicker justify-center">Estrutura do arquivo</p>
                  <h2 className="dark-lore-section-title mx-auto">
                    Cinco trilhas sustentam a leitura do continente
                  </h2>
                </div>

                <div className="dark-lore-codex-grid">
                  {archiveCategoryCards.map(({ category, count, description }, index) => {
                    const Icon = categoryIcons[category];

                    return (
                      <motion.article
                        key={category}
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={revealViewport}
                        transition={{ duration: 0.45, delay: index * 0.05 }}
                        className="dark-lore-archive-card dark-lore-archive-card-compact"
                      >
                        <Link
                          to={category === "monstros" ? "/bestiario" : "/universo#universo-verbetes"}
                          className="dark-lore-codex-card"
                        >
                          <div className="dark-lore-icon-emblem">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="space-y-3">
                            <p className="dark-lore-card-meta">
                              {String(count).padStart(2, "0")} registros
                            </p>
                            <h3 className="dark-lore-card-title text-[clamp(1.35rem,1.8vw,1.72rem)]">
                              {encyclopediaCategories[category].label}
                            </h3>
                            <p className="dark-lore-card-copy">{description}</p>
                          </div>
                        </Link>
                      </motion.article>
                    );
                  })}
                </div>
              </div>
            </section>
          </section>

          <section id="universo-atlas" className="dark-lore-anchor-section space-y-6">
            <div className="text-center">
              <p className="dark-lore-section-kicker justify-center">Cartografia</p>
              <h2 className="dark-lore-section-title mx-auto">Rotas, reinos e arquivos arcanos</h2>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(21rem,0.92fr)]">
              <div className="dark-lore-map-wrapper">
                <ContinentMap compact />
              </div>

              <div className="grid auto-rows-fr gap-4 md:grid-cols-3 xl:grid-cols-1">
                {archiveHighlights.map((highlight, index) => (
                  <motion.article
                    key={highlight.title}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={revealViewport}
                    transition={{ duration: 0.45, delay: index * 0.08 }}
                    className="dark-lore-feature-card"
                  >
                    <div className="dark-lore-feature-image-wrap">
                      <img src={highlight.image} alt="" aria-hidden="true" className="dark-lore-feature-image" />
                    </div>
                    <div className="dark-lore-feature-body">
                      <h3 className="dark-lore-card-title text-[clamp(1.5rem,1.8vw,1.95rem)]">
                        {highlight.title}
                      </h3>
                      <p className="dark-lore-card-copy">{highlight.description}</p>
                      <Link to={highlight.path} className="dark-lore-button dark-lore-button-small">
                        {highlight.cta}
                      </Link>
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>
          </section>

          {filteredPublications.length > 0 ? (
            <section id="universo-cronicas" className="dark-lore-anchor-section space-y-6">
              <div className="text-center">
                <p className="dark-lore-section-kicker justify-center">Leitura exclusiva</p>
                <h2 className="dark-lore-section-title mx-auto">Manuscritos velados</h2>
              </div>

              <div className="dark-lore-feature-grid">
                {featuredPublications.map((publication) => (
                  <UniversePublicationCard key={publication.slug} publication={publication} />
                ))}
              </div>

              {archivePublicationList.length > 0 ? (
                <div className="dark-lore-list-grid">
                  {archivePublicationList.map((publication, index) => (
                    <motion.article
                      key={publication.slug}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.45, delay: index * 0.05 }}
                      className="dark-lore-archive-card"
                    >
                      <p className="dark-lore-card-meta">
                        {publication.chapterLabel} · {publication.location}
                      </p>
                      <h3 className="dark-lore-card-title text-[clamp(1.5rem,2vw,2rem)]">
                        {publication.title}
                      </h3>
                      <p className="dark-lore-card-copy">{publication.excerpt}</p>
                      <Link
                        to={`/universo/${publication.slug}`}
                        className="dark-lore-button dark-lore-button-small"
                      >
                        Ler manuscrito
                      </Link>
                    </motion.article>
                  ))}
                </div>
              ) : null}
            </section>
          ) : null}

          <section id="universo-verbetes" className="dark-lore-anchor-section space-y-6">
            <div className="text-center">
              <p className="dark-lore-section-kicker justify-center">Dossies do continente</p>
              <h2 className="dark-lore-section-title mx-auto">Arquivos arcanos</h2>
            </div>

            <div className="dark-lore-page-frame px-6 py-8 md:px-8 md:py-10">
              {archiveFilters}
            </div>

            <div className="dark-lore-feature-grid">
              {filteredEntries.slice(0, 9).map((entry) => (
                <EncyclopediaEntryCard key={entry.slug} entry={entry} detailBase={detailBase} />
              ))}
            </div>
          </section>

        <section className="dark-lore-cta-band">
          <p className="dark-lore-cta-line">O arquivo permanece aberto.</p>
          <Link to="/jogar" className="dark-lore-button">
            Abrir Arquivo Vivo
          </Link>
        </section>
        </>
      )}
    </div>
  );
}

function UniversePublicationPage({ publication }: { publication: UniversePublication }) {
  const linkedEntries = publication.mentions
    .map((mention) => getEncyclopediaEntry(mention.slug))
    .filter((entry): entry is EncyclopediaEntry => Boolean(entry))
    .map(sanitizeImmersiveEntry);
  const [heroDrift, setHeroDrift] = useState({ x: 0, y: 0 });
  const [scrollOffset, setScrollOffset] = useState(0);
  const sectionNavItems = useMemo(
    () =>
      [
        { id: "universo-visao-geral", label: "Abertura" },
        { id: "universo-corpo", label: "Leitura" },
        { id: "universo-relacoes", label: "Mencoes" },
      ] satisfies SectionNavItem[],
    [],
  );

  useEffect(() => {
    const syncScrollOffset = () => setScrollOffset(window.scrollY);
    syncScrollOffset();
    window.addEventListener("scroll", syncScrollOffset, { passive: true });
    return () => window.removeEventListener("scroll", syncScrollOffset);
  }, []);

  return (
    <div className="mx-auto max-w-[1200px] space-y-10 px-4 py-8 md:px-6 md:py-12">
      <UniverseSectionNav label="Navegacao da cronica" items={sectionNavItems} />

      <section
        id="universo-visao-geral"
        className="dark-lore-page-frame dark-lore-page-hero dark-lore-chronicles-hero"
        onMouseMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width - 0.5;
          const y = (event.clientY - rect.top) / rect.height - 0.5;
          setHeroDrift({ x, y });
        }}
        onMouseLeave={() => setHeroDrift({ x: 0, y: 0 })}
      >
        <motion.img
          src={publication.image}
          alt=""
          aria-hidden="true"
          className="dark-lore-hero-background"
          animate={{
            x: heroDrift.x * 20,
            y: heroDrift.y * 16 + scrollOffset * -0.06,
            scale: 1.06,
          }}
          transition={{ type: "spring", stiffness: 80, damping: 18 }}
        />
        <div className="dark-lore-grain-overlay" />
        <div className="dark-lore-candle-glow dark-lore-candle-glow-left" />
        <div className="dark-lore-candle-glow dark-lore-candle-glow-right" />

        <div className="dark-lore-hero-copy">
          <Link to="/universo" className="dark-lore-chip is-muted">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Universo
          </Link>
          <p className="dark-lore-section-kicker">{publication.chapterLabel}</p>
          <h1 className="dark-lore-display-title">{publication.title}</h1>
          <p className="dark-lore-hero-text max-w-3xl">{publication.excerpt}</p>
        </div>
      </section>

      <section id="universo-corpo" className="dark-lore-page-frame px-6 py-8 md:px-8 md:py-10">
        <div className="space-y-6">
          <div>
            <p className="dark-lore-section-kicker">Leitura do manuscrito</p>
            <h2 className="dark-lore-section-title mt-3 text-left">{publication.heading}</h2>
          </div>

          <div className="dark-lore-reading-flow space-y-6">
            {publication.paragraphs.map((paragraph, index) => (
              <p key={`${publication.slug}-${index}`} className="dark-lore-reading-paragraph">
                {renderPublicationParagraph(paragraph, publication.mentions)}
              </p>
            ))}
          </div>
        </div>
      </section>

      {linkedEntries.length > 0 ? (
        <section id="universo-relacoes" className="space-y-6">
          <div className="text-center">
            <p className="dark-lore-section-kicker justify-center">Mencoes conectadas</p>
            <h2 className="dark-lore-section-title mx-auto">Personagens e nomes citados</h2>
          </div>

          <div className="dark-lore-feature-grid">
            {linkedEntries.map((entry) => (
              <EncyclopediaEntryCard key={entry.slug} entry={entry} detailBase="/universo" />
            ))}
          </div>
        </section>
      ) : null}

      <section className="dark-lore-cta-band">
        <p className="dark-lore-cta-line">O arquivo permanece aberto.</p>
        <Link to="/bestiario" className="dark-lore-button">
          Abrir Bestiario
        </Link>
      </section>
    </div>
  );
}

function UniverseEntryPage({ entry }: { entry: EncyclopediaEntry }) {
  const location = useLocation();
  const bestiaryMode = location.pathname.startsWith("/bestiario");
  const indexPath = bestiaryMode ? "/bestiario" : "/universo";
  const linkedEntries = getLinkedEntries(entry).map(sanitizeImmersiveEntry);
  const sameCategoryEntries = getEntriesByCategory(entry.category)
    .filter((relatedEntry) => relatedEntry.slug !== entry.slug)
    .slice(0, 4)
    .map(sanitizeImmersiveEntry);
  const bestiaryMeta = getWitcherBestiaryMetadata(entry.slug);
  const atlasContext = getAtlasContextForEntry(entry);
  const [heroDrift, setHeroDrift] = useState({ x: 0, y: 0 });
  const [scrollOffset, setScrollOffset] = useState(0);
  const bestiaryHeadline = bestiaryMeta
    ? `${bestiaryMeta.type} - ameaca ${bestiaryMeta.dangerLevel}/5`
    : entry.subtitle;
  const sectionNavItems = useMemo(
    () =>
      [
        { id: "universo-visao-geral", label: "Abertura" },
        { id: "universo-detalhes", label: "Narrativa" },
        { id: "universo-cronologia", label: "Cronologia" },
        { id: "universo-relacoes", label: "Relacoes" },
      ] satisfies SectionNavItem[],
    [],
  );

  useEffect(() => {
    const syncScrollOffset = () => setScrollOffset(window.scrollY);
    syncScrollOffset();
    window.addEventListener("scroll", syncScrollOffset, { passive: true });
    return () => window.removeEventListener("scroll", syncScrollOffset);
  }, []);

  return (
    <div className="mx-auto max-w-[1320px] space-y-10 px-4 py-8 md:px-6 md:py-12">
      <UniverseSectionNav
        label={bestiaryMode ? "Navegacao do verbete de criatura" : "Navegacao do verbete"}
        items={sectionNavItems}
      />

      <section
        id="universo-visao-geral"
        className={cn(
          "dark-lore-anchor-section dark-lore-page-frame dark-lore-page-hero",
          bestiaryMode ? "dark-lore-bestiary-hero" : "dark-lore-universe-hero",
        )}
        onMouseMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width - 0.5;
          const y = (event.clientY - rect.top) / rect.height - 0.5;
          setHeroDrift({ x, y });
        }}
        onMouseLeave={() => setHeroDrift({ x: 0, y: 0 })}
      >
        {bestiaryMode ? (
          <>
            <div className="dark-lore-grain-overlay dark-lore-bestiary-overlay" />
            <div className="dark-lore-candle-glow dark-lore-candle-glow-left" />
            <div className="dark-lore-candle-glow dark-lore-candle-glow-right" />

            <div className="dark-lore-bestiary-layout">
              <motion.div
                animate={{
                  x: heroDrift.x * 16,
                  y: heroDrift.y * 12 + scrollOffset * -0.04,
                  scale: 1.04,
                }}
                transition={{ type: "spring", stiffness: 82, damping: 18 }}
                className="dark-lore-bestiary-showcase"
              >
                <div className="dark-lore-bestiary-portrait-shell">
                  <div className="dark-lore-bestiary-portrait-glow" />
                  <EncyclopediaImage
                    entry={entry}
                    className="dark-lore-bestiary-portrait object-contain p-6 md:p-10"
                  />
                </div>
              </motion.div>

              <div className="dark-lore-hero-copy dark-lore-bestiary-copy">
                <Link to={indexPath} className="dark-lore-chip is-muted w-fit">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar ao arquivo
                </Link>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="border-primary/30 text-primary">
                    {encyclopediaCategories[entry.category].label}
                  </Badge>
                  {bestiaryMeta ? (
                    <Badge variant="secondary">
                      {bestiaryMeta.type} - Perigo {bestiaryMeta.dangerLevel}/5
                    </Badge>
                  ) : null}
                </div>
                <h1 className="dark-lore-display-title dark-lore-bestiary-title">{entry.title}</h1>
                <p className="dark-lore-hero-text max-w-2xl">{bestiaryHeadline}</p>
                <p className="dark-lore-card-copy max-w-3xl">{entry.summary}</p>
                <div className="grid gap-3 sm:grid-cols-3 dark-lore-bestiary-stat-grid">
                  {entry.stats.slice(0, 3).map((stat) => (
                    <div key={`${entry.slug}-${stat.label}`} className="dark-lore-hero-stat">
                      <p className="dark-lore-card-meta">{stat.label}</p>
                      <p className="dark-lore-card-copy mt-2 text-[hsl(var(--foreground)/0.92)]">
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <motion.div
              animate={{
                x: heroDrift.x * 22,
                y: heroDrift.y * 18 + scrollOffset * -0.06,
                scale: 1.05,
              }}
              transition={{ type: "spring", stiffness: 80, damping: 18 }}
              className="absolute inset-0"
            >
              <EncyclopediaImage
                entry={entry}
                className="dark-lore-hero-background object-contain p-8 md:p-12"
              />
            </motion.div>
            <div className="dark-lore-grain-overlay" />
            <div className="dark-lore-candle-glow dark-lore-candle-glow-left" />
            <div className="dark-lore-candle-glow dark-lore-candle-glow-right" />

            <div className="dark-lore-hero-copy">
              <Link to={indexPath} className="dark-lore-chip is-muted">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao arquivo
              </Link>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="border-primary/30 text-primary">
                  {encyclopediaCategories[entry.category].label}
                </Badge>
                {bestiaryMeta ? (
                  <Badge variant="secondary">
                    {bestiaryMeta.type} - Perigo {bestiaryMeta.dangerLevel}/5
                  </Badge>
                ) : null}
              </div>
              <h1 className="dark-lore-display-title">{entry.title}</h1>
              <p className="dark-lore-hero-text max-w-3xl">{entry.subtitle}</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {entry.stats.slice(0, 3).map((stat) => (
                  <div key={`${entry.slug}-${stat.label}`} className="dark-lore-hero-stat">
                    <p className="dark-lore-card-meta">{stat.label}</p>
                    <p className="dark-lore-card-copy mt-2 text-[hsl(var(--foreground)/0.92)]">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </section>

      <section
        id="universo-detalhes"
        className="dark-lore-anchor-section dark-lore-page-frame px-6 py-8 md:px-8 md:py-10"
      >
        <div className="space-y-6">
          <div>
            <p className="dark-lore-section-kicker">Leitura narrativa</p>
            <h2 className="dark-lore-section-title mt-3 text-left">Corpo do verbete</h2>
          </div>

          <div className="space-y-5">
            {entry.narrative.map((block, index) => (
              <motion.article
                key={`${entry.slug}-${block.heading}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={revealViewport}
                transition={{ duration: 0.45, delay: index * 0.04 }}
                className="dark-lore-archive-card dark-lore-archive-card-horizontal"
              >
                <div className="dark-lore-paper-index">{String(index + 1).padStart(2, "0")}</div>
                <div className="space-y-3">
                  <h3 className="dark-lore-card-title text-[clamp(1.65rem,2vw,2.1rem)]">{block.heading}</h3>
                  <p className="dark-lore-card-copy">{block.body}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="universo-cronologia"
        className="dark-lore-anchor-section grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]"
      >
        <TimelineRail title="Rastro temporal" events={entry.timeline} />

        <div className="space-y-6">
          {atlasContext ? (
            <div className="dark-lore-archive-card dark-lore-archive-card-compact">
              <div className="space-y-4 p-6 md:p-7">
                <p className="dark-lore-section-kicker">{atlasContext.eyebrow}</p>
                <h2 className="dark-lore-section-title mt-3 text-left">{atlasContext.title}</h2>
                <p className="dark-lore-card-copy">{atlasContext.description}</p>
                <div className="grid gap-3">
                  {atlasContext.metrics.slice(0, 3).map((metric) => (
                    <div key={metric.label} className="dark-lore-inline-metric">
                      <span className="dark-lore-card-meta">{metric.label}</span>
                      <span className="dark-lore-card-copy text-[hsl(var(--foreground)/0.92)]">{metric.value}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3 pt-2">
                  <UniverseAtlasActionButton
                    to={atlasContext.actions[0]?.href ?? atlasContext.href}
                    label="Abrir atlas completo"
                    icon={MapPin}
                  />
                  <UniverseAtlasActionButton
                    to={atlasContext.actions[1]?.href ?? "/universo"}
                    label="Cruzar com o universo"
                    icon={BookMarked}
                    variant="secondary"
                  />
                </div>
              </div>
            </div>
          ) : null}

          {bestiaryMeta ? (
            <div className="dark-lore-archive-card dark-lore-archive-card-compact">
              <div className="space-y-4 p-6 md:p-7">
                <p className="dark-lore-section-kicker">Dossie de caca</p>
                <h2 className="dark-lore-section-title mt-3 text-left">Leitura de campo</h2>
                <div className="grid gap-3">
                  <div className="dark-lore-inline-metric">
                    <span className="dark-lore-card-meta">Fraquezas</span>
                    <span className="dark-lore-card-copy text-[hsl(var(--foreground)/0.92)]">
                      {bestiaryMeta.weaknesses.join(", ")}
                    </span>
                  </div>
                  <div className="dark-lore-inline-metric">
                    <span className="dark-lore-card-meta">Regioes</span>
                    <span className="dark-lore-card-copy text-[hsl(var(--foreground)/0.92)]">
                      {bestiaryMeta.regions.join(", ")}
                    </span>
                  </div>
                </div>
                {entry.vtt ? (
                  <Link to={`/mesa?spawn=${entry.slug}`} className="dark-lore-button">
                    Levar para a Mesa
                  </Link>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section id="universo-relacoes" className="dark-lore-anchor-section space-y-6">
        <div className="text-center">
          <p className="dark-lore-section-kicker justify-center">Relacoes</p>
          <h2 className="dark-lore-section-title mx-auto">Lacos, nomes e rastros vizinhos</h2>
        </div>

        {linkedEntries.length > 0 ? (
          <div className="dark-lore-feature-grid">
            {linkedEntries.map((linkedEntry) => (
              <EncyclopediaEntryCard key={linkedEntry.slug} entry={linkedEntry} detailBase={indexPath} />
            ))}
          </div>
        ) : null}

        {sameCategoryEntries.length > 0 ? (
          <div className="dark-lore-feature-grid">
            {sameCategoryEntries.map((relatedEntry) => (
              <EncyclopediaEntryCard key={relatedEntry.slug} entry={relatedEntry} detailBase={indexPath} />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}

export default function UniversePage() {
  usePortalShellMode("editorial", "ambient");
  const location = useLocation();
  const { entrySlug } = useParams();
  const bestiaryMode = location.pathname.startsWith("/bestiario");

  if (!entrySlug) {
    return <UniverseIndex />;
  }

  if (bestiaryMode) {
    const bestiaryEntry = getEncyclopediaEntry(entrySlug);

    if (!bestiaryEntry) {
      return (
        <div className="mx-auto max-w-[900px] px-4 py-16 md:px-6">
          <div className="dark-lore-page-frame px-6 py-10 text-center md:px-8">
            <BookMarked className="mx-auto h-10 w-10 text-primary" />
            <h1 className="dark-lore-section-title mx-auto mt-4">Criatura nao encontrada</h1>
            <p className="mx-auto max-w-2xl text-sm leading-8 text-[hsl(var(--foreground)/0.76)] md:text-base">
              Este registro nao existe ou ainda nao foi gravado no arquivo das criaturas.
            </p>
            <div className="flex justify-center pt-4">
              <Link to="/bestiario" className="dark-lore-button">
                Voltar ao Bestiario
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return <UniverseEntryPage entry={sanitizeImmersiveEntry(bestiaryEntry)} />;
  }

  const publication = getUniversePublication(entrySlug);

  if (publication) {
    return <UniversePublicationPage publication={publication} />;
  }

  const entry = getEncyclopediaEntry(entrySlug);

  if (!entry) {
    return (
      <div className="mx-auto max-w-[900px] px-4 py-16 md:px-6">
        <div className="dark-lore-page-frame px-6 py-10 text-center md:px-8">
          <BookMarked className="mx-auto h-10 w-10 text-primary" />
          <h1 className="dark-lore-section-title mx-auto mt-4">Registro nao encontrado</h1>
          <p className="mx-auto max-w-2xl text-sm leading-8 text-[hsl(var(--foreground)/0.76)] md:text-base">
            Este manuscrito nao existe ou ainda nao foi catalogado no arquivo do continente.
          </p>
          <div className="flex justify-center pt-4">
            <Link to="/universo" className="dark-lore-button">
              Voltar ao Universo
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <UniverseEntryPage entry={sanitizeImmersiveEntry(entry)} />;
}
