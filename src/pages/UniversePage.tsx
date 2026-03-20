import characterIllustration from "@/assets/encyclopedia/character-illustration.svg";
import factionIllustration from "@/assets/encyclopedia/faction-illustration.svg";
import historyIllustration from "@/assets/encyclopedia/history-illustration.svg";
import locationIllustration from "@/assets/encyclopedia/location-illustration.svg";
import monsterIllustration from "@/assets/encyclopedia/monster-illustration.svg";
import type { ComponentType } from "react";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookMarked,
  Clock3,
  Flag,
  Maximize2,
  MapPin,
  Network,
  Search,
  ScrollText,
  Skull,
  Sparkles,
  Users,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import ContinentMap from "@/components/world/ContinentMap";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataSection } from "@/components/ui/data-section";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CURRENT_PROTAGONISTS, sanitizeImmersiveEntry, sanitizeImmersiveTimeline } from "@/lib/immersive-lore";
import {
  encyclopediaCategories,
  encyclopediaEntries,
  getEncyclopediaEntry,
  getEntriesByCategory,
  getLinkedEntries,
  getVttReadyEntries,
  globalTimeline,
  type EncyclopediaCategory,
  type EncyclopediaEntry,
  type EncyclopediaTimelineEvent,
} from "@/lib/encyclopedia";
import {
  getWitcherBestiaryMetadata,
  witcherBestiaryRegions,
  witcherBestiaryTypes,
} from "@/lib/witcher-bestiary";
import { cn } from "@/lib/utils";

type CategoryFilter = "todas" | EncyclopediaCategory;

const categoryIcons: Record<EncyclopediaCategory, ComponentType<{ className?: string }>> = {
  personagens: Users,
  monstros: Skull,
  locais: MapPin,
  faccoes: Flag,
  historia: ScrollText,
};

const categoryFallbackImages: Record<EncyclopediaCategory, string> = {
  personagens: characterIllustration,
  monstros: monsterIllustration,
  locais: locationIllustration,
  faccoes: factionIllustration,
  historia: historyIllustration,
};

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

function EntryArtworkPreview({
  entry,
  frameClassName,
  imageClassName,
  buttonLabel = "Tela cheia",
}: {
  entry: EncyclopediaEntry;
  frameClassName?: string;
  imageClassName?: string;
  buttonLabel?: string;
}) {
  const bestiaryMeta = getWitcherBestiaryMetadata(entry.slug);

  return (
    <Dialog>
      <div
        className={cn(
          "group relative overflow-hidden rounded-[var(--radius)] border border-border/70 bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.14),transparent_42%),linear-gradient(180deg,hsl(var(--background-strong)),hsl(var(--card)))]",
          frameClassName,
        )}
      >
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,transparent_60%,hsl(var(--background-strong)/0.72))]" />
        <EncyclopediaImage
          entry={entry}
          className={cn("relative h-full w-full", imageClassName)}
        />
        <DialogTrigger asChild>
          <Button
            size="sm"
            variant="secondary"
            className="absolute right-3 top-3 z-10 border border-border/70 bg-background/78 text-foreground shadow-sm backdrop-blur-sm"
          >
            <Maximize2 className="mr-2 h-3.5 w-3.5" />
            {buttonLabel}
          </Button>
        </DialogTrigger>
      </div>

      <DialogContent className="max-w-[min(96vw,1380px)] border-border/70 bg-background/96 p-4 sm:p-6">
        <DialogHeader className="pr-12">
          <DialogTitle>{entry.title}</DialogTitle>
          <DialogDescription>{entry.subtitle}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="overflow-hidden rounded-[var(--radius)] border border-border/70 bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.12),transparent_44%),linear-gradient(180deg,hsl(var(--background-strong)),hsl(var(--card)))]">
            <EncyclopediaImage
              entry={entry}
              className="max-h-[78vh] w-full object-contain p-4 md:p-6"
            />
          </div>

          <div className="space-y-4 rounded-[var(--radius)] border border-border/70 bg-background/40 p-4">
            <p className="text-sm leading-7 text-foreground/90">{entry.summary}</p>

            <div className="grid gap-3">
              {entry.stats.slice(0, 4).map((stat) => (
                <DataSection
                  key={`${entry.slug}-${stat.label}-fullscreen`}
                  label={stat.label}
                  value={stat.value}
                  variant="quiet"
                />
              ))}
            </div>

            {bestiaryMeta ? (
              <div className="space-y-2 rounded-xl border border-border/60 bg-background/50 p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-primary/80">
                  Dossie de caca
                </p>
                <p className="text-sm leading-6 text-muted-foreground">
                  Fraquezas: {bestiaryMeta.weaknesses.join(", ")}.
                </p>
                <p className="text-sm leading-6 text-muted-foreground">
                  Regioes: {bestiaryMeta.regions.join(", ")}.
                </p>
                {entry.vtt ? (
                  <Button asChild className="mt-2 w-full">
                    <Link to={`/mesa?spawn=${entry.slug}`}>Levar criatura para a mesa</Link>
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
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
    <Card variant="panel">
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-full border border-primary/20 bg-background/50 p-3">
            <Clock3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-heading text-lg text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">
              Marco historico para navegar pelo universo.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {events.map((event, index) => (
            <div key={`${event.period}-${event.title}`} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="h-3.5 w-3.5 rounded-full bg-primary" />
                {index < events.length - 1 && (
                  <div className="mt-2 h-full w-px bg-primary/30" />
                )}
              </div>
              <div className="pb-4">
                <p className="font-heading text-xs uppercase tracking-[0.2em] text-primary/80">
                  {event.period}
                </p>
                <h4 className="mt-1 font-heading text-base text-foreground">
                  {event.title}
                </h4>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {event.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function EncyclopediaEntryCard({ entry }: { entry: EncyclopediaEntry }) {
  const Icon = categoryIcons[entry.category];
  const vttReady = getVttReadyEntries().some((candidate) => candidate.slug === entry.slug);
  const bestiaryMeta = getWitcherBestiaryMetadata(entry.slug);

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
        <Card variant="panel" className="h-full overflow-hidden transition-colors hover:border-primary/30">
          <CardContent className="flex h-full flex-col gap-5 p-0">
          <EntryArtworkPreview
            entry={entry}
            frameClassName="h-56"
            imageClassName={cn(
              "transition-transform duration-300 group-hover:scale-[1.015]",
              entry.category === "monstros" ? "object-contain p-4" : "object-cover",
            )}
            buttonLabel="Ampliar"
          />
          <div className="flex h-full flex-col gap-4 p-6">
            <div className="flex items-center justify-between gap-3">
              <Badge variant="outline" className="border-primary/30 text-primary">
                {encyclopediaCategories[entry.category].label}
              </Badge>
              <div className="flex items-center gap-2">
                {vttReady ? (
                  <Badge variant="secondary" className="bg-secondary/80 text-foreground">
                    Mesa pronta
                  </Badge>
                ) : null}
                <Icon className="h-5 w-5 text-primary/70" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-heading text-xl text-foreground">{entry.title}</h3>
              <p className="text-sm leading-6 text-muted-foreground">{entry.subtitle}</p>
            </div>

            <p className="text-sm leading-6 text-foreground/90">{entry.summary}</p>

            {bestiaryMeta ? (
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-background/70 text-foreground">
                  {bestiaryMeta.type}
                </Badge>
                <Badge variant="outline" className="border-primary/30 text-primary">
                  Perigo {bestiaryMeta.dangerLevel}/5
                </Badge>
                <Badge variant="secondary" className="bg-background/70 text-foreground">
                  {bestiaryMeta.regions[0] ?? "Regiao desconhecida"}
                </Badge>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              {entry.internalLinks.slice(0, 3).map((slug) => {
                const linkedEntry = getEncyclopediaEntry(slug);

                if (!linkedEntry) {
                  return null;
                }

                return (
                  <Badge key={slug} variant="secondary" className="bg-secondary/70">
                    {linkedEntry.title}
                  </Badge>
                );
              })}
            </div>

            <div className="mt-auto flex gap-2 pt-2">
              {entry.category === "monstros" && entry.vtt ? (
                <Button asChild variant="outline" className="flex-1">
                  <Link to={`/mesa?spawn=${entry.slug}`}>Levar para a mesa</Link>
                </Button>
              ) : null}
              <Button asChild className={entry.category === "monstros" && entry.vtt ? "flex-1" : "w-full"}>
                <Link to={`/universo/${entry.slug}`}>Abrir verbete</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function getShowcaseTone(index: number) {
  const tones = [
    "from-primary/18 via-primary/8 to-transparent",
    "from-destructive/18 via-destructive/8 to-transparent",
    "from-info/18 via-info/8 to-transparent",
    "from-warning/18 via-warning/8 to-transparent",
  ];

  return tones[index % tones.length];
}

function getShowcaseLabel(entry: EncyclopediaEntry) {
  if (entry.category === "personagens") {
    return "Dons e marcas";
  }

  if (entry.category === "monstros") {
    return "Ameaca tatica";
  }

  if (entry.category === "locais") {
    return "Camadas do lugar";
  }

  if (entry.category === "faccoes") {
    return "Vetores de poder";
  }

  return "Fragmentos da cronica";
}

function EntryShowcase({ entry }: { entry: EncyclopediaEntry }) {
  const panels = entry.stats.map((stat, index) => ({
    id: `${entry.slug}-${stat.label}`,
    label: stat.label,
    value: stat.value,
    description:
      entry.narrative[index % entry.narrative.length]?.body ?? entry.summary,
    heading:
      entry.narrative[index % entry.narrative.length]?.heading ?? entry.subtitle,
    tone: getShowcaseTone(index),
  }));

  if (panels.length === 0) {
    return null;
  }

  return (
    <Card variant="panel" className="overflow-hidden">
      <CardContent className="space-y-6 p-6 md:p-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-primary/80">
              {getShowcaseLabel(entry)}
            </p>
            <h2 className="mt-2 font-heading text-2xl text-foreground">
              Painel interativo do verbete
            </h2>
          </div>
          <Sparkles className="h-5 w-5 text-primary" />
        </div>

        <Tabs defaultValue={panels[0].id} className="space-y-5">
          <TabsList className="grid h-auto w-full gap-2 md:grid-cols-4">
            {panels.map((panel) => (
              <TabsTrigger
                key={panel.id}
                value={panel.id}
                className="font-heading uppercase tracking-[0.16em]"
              >
                {panel.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {panels.map((panel, index) => (
            <TabsContent key={panel.id} value={panel.id} className="mt-0">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative min-h-[280px] overflow-hidden rounded-[var(--radius)] border border-primary/18 bg-background/70"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${panel.tone}`}
                  />
                  <motion.div
                    className="absolute -left-12 top-10 h-40 w-40 rounded-full bg-primary/16 blur-3xl"
                    animate={{ x: [0, 24, -12, 0], y: [0, -18, 12, 0] }}
                    transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.div
                    className="absolute bottom-0 right-0 h-44 w-44 rounded-full bg-destructive/14 blur-3xl"
                    animate={{ x: [0, -18, 14, 0], y: [0, 16, -14, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <div className="relative flex h-full flex-col justify-between p-6">
                    <div className="space-y-3">
                      <Badge variant="outline" className="border-primary/30 text-primary">
                        Sequencia {index + 1}
                      </Badge>
                      <div>
                        <p className="font-heading text-sm uppercase tracking-[0.2em] text-primary/78">
                          {panel.label}
                        </p>
                        <h3 className="mt-3 font-display text-3xl text-gold-gradient">
                          {panel.value}
                        </h3>
                      </div>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                      {entry.stats.slice(0, 4).map((stat) => (
                        <div
                          key={`${panel.id}-${stat.label}`}
                          className="rounded-xl border border-border/60 bg-background/46 px-3 py-2"
                        >
                          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                            {stat.label}
                          </p>
                          <p className="mt-1 text-sm text-foreground">{stat.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                <div className="space-y-4 rounded-[var(--radius)] border border-border/70 bg-background/40 p-6">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-primary/80">
                      Leitura narrativa
                    </p>
                    <h3 className="mt-2 font-heading text-2xl text-foreground">
                      {panel.heading}
                    </h3>
                  </div>
                  <p className="text-base leading-8 text-foreground/90">
                    {panel.description}
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <DataSection
                      label="Linha do tempo"
                      value={`${entry.timeline.length} marcos`}
                      variant="quiet"
                    />
                    <DataSection
                      label="Ligacoes"
                      value={`${entry.internalLinks.length} conexoes`}
                      variant="quiet"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}

function RelationshipMap({
  entry,
  linkedEntries,
}: {
  entry: EncyclopediaEntry;
  linkedEntries: EncyclopediaEntry[];
}) {
  if (linkedEntries.length === 0) {
    return null;
  }

  const orbitRadius = linkedEntries.length === 1 ? 0 : 34;

  return (
    <Card variant="panel" className="overflow-hidden">
      <CardContent className="space-y-5 p-6 md:p-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-primary/80">
              Lore ties
            </p>
            <h2 className="mt-2 font-heading text-2xl text-foreground">
              Mapa de relacionamentos
            </h2>
          </div>
          <Network className="h-5 w-5 text-primary" />
        </div>

        <div className="relative min-h-[420px] overflow-hidden rounded-[var(--radius)] border border-border/70 bg-background/55">
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {linkedEntries.map((linkedEntry, index) => {
              const angle = (Math.PI * 2 * index) / linkedEntries.length - Math.PI / 2;
              const x = linkedEntries.length === 1 ? 50 : 50 + Math.cos(angle) * orbitRadius;
              const y = linkedEntries.length === 1 ? 18 : 50 + Math.sin(angle) * orbitRadius;

              return (
                <line
                  key={`line-${linkedEntry.slug}`}
                  x1="50"
                  y1="50"
                  x2={x}
                  y2={y}
                  stroke="hsl(var(--primary) / 0.32)"
                  strokeWidth="0.55"
                />
              );
            })}
          </svg>

          <div className="absolute inset-0">
            <motion.div
              className="absolute left-1/2 top-1/2 w-[220px] -translate-x-1/2 -translate-y-1/2"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="rounded-[var(--radius)] border border-primary/25 bg-background/88 p-5 text-center shadow-panel">
                <Badge variant="outline" className="border-primary/30 text-primary">
                  Centro narrativo
                </Badge>
                <p className="mt-3 font-display text-2xl text-gold-gradient">
                  {entry.title}
                </p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {entry.subtitle}
                </p>
              </div>
            </motion.div>

            {linkedEntries.map((linkedEntry, index) => {
              const angle = (Math.PI * 2 * index) / linkedEntries.length - Math.PI / 2;
              const x = linkedEntries.length === 1 ? 50 : 50 + Math.cos(angle) * orbitRadius;
              const y = linkedEntries.length === 1 ? 18 : 50 + Math.sin(angle) * orbitRadius;

              return (
                <motion.div
                  key={linkedEntry.slug}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="absolute w-[180px] -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${x}%`, top: `${y}%` }}
                >
                  <Link
                    to={`/universo/${linkedEntry.slug}`}
                    className="block rounded-[var(--radius)] border border-border/70 bg-background/84 p-4 transition-colors hover:border-primary/30"
                  >
                    <p className="font-heading text-base text-foreground">
                      {linkedEntry.title}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {linkedEntry.subtitle}
                    </p>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function UniverseIndex() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("todas");
  const [monsterType, setMonsterType] = useState("all");
  const [monsterRegion, setMonsterRegion] = useState("all");
  const [monsterDanger, setMonsterDanger] = useState("all");
  const immersiveEntries = useMemo(
    () => encyclopediaEntries.map(sanitizeImmersiveEntry),
    [],
  );
  const immersiveTimeline = useMemo(
    () => sanitizeImmersiveTimeline(globalTimeline),
    [],
  );
  const showMonsterFilters = activeCategory === "monstros";
  const hasMonsterFilters =
    monsterType !== "all" || monsterRegion !== "all" || monsterDanger !== "all";
  const categories = Object.keys(encyclopediaCategories) as EncyclopediaCategory[];
  const activeCategoryLabel =
    activeCategory === "todas"
      ? "Todas as categorias"
      : encyclopediaCategories[activeCategory].label;
  const activeFilterCount = [monsterType, monsterRegion, monsterDanger].filter(
    (value) => value !== "all",
  ).length;

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

  return (
    <div className="container py-12 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12"
      >
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_340px]">
          <Card variant="elevated" className="overflow-hidden">
            <CardContent className="space-y-6 p-6 md:p-8">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="outline">
                  <BookMarked className="mr-2 h-3.5 w-3.5" />
                  Enciclopedia do universo
                </Badge>
                <Badge variant="info">{filteredEntries.length} verbetes visiveis</Badge>
              </div>

              <div className="max-w-4xl space-y-4">
                <p className="section-kicker">Immersive archive</p>
                <h1 className="font-display text-5xl leading-[0.95] text-brand-gradient md:text-6xl">
                  Personagens, monstros, faccoes e lugares tratados como dossie de campanha.
                </h1>
                <p className="text-base leading-8 text-foreground/88">
                  A enciclopedia agora funciona como arquivo nobre do portal: busca, filtros,
                  atlas e verbetes foram organizados para leitura imersiva, sem perder a utilidade
                  em mesa.
                </p>
              </div>

              <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_240px]">
                <div className="space-y-5">
                  <div className="relative border border-[hsl(var(--outline-variant)/0.14)] bg-[linear-gradient(180deg,hsl(var(--surface-base)/0.44),hsl(var(--background-strong)/0.72))] px-4 py-3">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Buscar por nome, tema ou resumo..."
                      className="pl-8"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant={activeCategory === "todas" ? "default" : "outline"}
                      onClick={() => {
                        setActiveCategory("todas");
                        setMonsterType("all");
                        setMonsterRegion("all");
                        setMonsterDanger("all");
                      }}
                    >
                      Todas
                    </Button>
                    {categories.map((category) => (
                      <Button
                        key={category}
                        size="sm"
                        variant={activeCategory === category ? "default" : "outline"}
                        onClick={() => {
                          setActiveCategory(category);
                          if (category !== "monstros") {
                            setMonsterType("all");
                            setMonsterRegion("all");
                            setMonsterDanger("all");
                          }
                        }}
                      >
                        {encyclopediaCategories[category].label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3">
                  <DataSection
                    label="Categoria ativa"
                    value={activeCategoryLabel}
                    variant="quiet"
                  />
                  <DataSection
                    label="Trilha central"
                    value={CURRENT_PROTAGONISTS.join(" / ")}
                    variant="quiet"
                    tone="info"
                  />
                  <DataSection
                    label="Filtros bestiario"
                    value={showMonsterFilters ? `${activeFilterCount} ativos` : "Indisponiveis"}
                    variant="quiet"
                  />
                </div>
              </div>

              {showMonsterFilters ? (
                <div className="grid gap-3 border border-[hsl(var(--outline-variant)/0.16)] bg-[linear-gradient(180deg,hsl(var(--surface-base)/0.44),hsl(var(--background-strong)/0.76))] p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_180px_auto]">
                  <div className="space-y-2">
                    <p className="section-kicker">Tipo</p>
                    <Select value={monsterType} onValueChange={setMonsterType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os tipos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os tipos</SelectItem>
                        {witcherBestiaryTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <p className="section-kicker">Regiao</p>
                    <Select value={monsterRegion} onValueChange={setMonsterRegion}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas as regioes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as regioes</SelectItem>
                        {witcherBestiaryRegions.map((region) => (
                          <SelectItem key={region} value={region}>
                            {region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <p className="section-kicker">Perigo</p>
                    <Select value={monsterDanger} onValueChange={setMonsterDanger}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {[1, 2, 3, 4, 5].map((danger) => (
                          <SelectItem key={danger} value={String(danger)}>
                            {danger}/5
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => {
                        setMonsterType("all");
                        setMonsterRegion("all");
                        setMonsterDanger("all");
                      }}
                    >
                      Limpar filtros
                    </Button>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <div className="grid gap-4">
            <Card variant="panel">
              <CardContent className="space-y-4 p-6">
                <div>
                  <p className="section-kicker">Scope</p>
                  <h2 className="mt-2 font-heading text-2xl text-foreground">
                    Leitura do arquivo
                  </h2>
                </div>

                <DataSection
                  label="Entradas totais"
                  value={immersiveEntries.length}
                  variant="quiet"
                />
                <DataSection
                  label="Categorias"
                  value={categories.length}
                  variant="quiet"
                />
                <DataSection
                  label="Tom"
                  value="Bestiario, politica, lugares e memoria"
                  variant="quiet"
                  tone="info"
                />
              </CardContent>
            </Card>

            <DataSection
              label="Pista"
              value="Use a busca para localizar criatura, local ou faccao antes de abrir o verbete."
              icon={<Sparkles className="h-4 w-4" />}
              tone="info"
            />
          </div>
        </section>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {categories.map((category) => {
            const Icon = categoryIcons[category];
            const active = activeCategory === category;

            return (
              <button
                key={category}
                type="button"
                onClick={() => {
                  setActiveCategory(category);
                  if (category !== "monstros") {
                    setMonsterType("all");
                    setMonsterRegion("all");
                    setMonsterDanger("all");
                  }
                }}
                className={cn(
                  "border p-5 text-left transition-[border-color,background-color,transform] duration-200 hover:-translate-y-px",
                  active
                    ? "border-[hsl(var(--brand)/0.22)] bg-[linear-gradient(180deg,hsl(var(--brand)/0.12),hsl(var(--surface-base)/0.94))]"
                    : "border-[hsl(var(--outline-variant)/0.16)] bg-[linear-gradient(180deg,hsl(var(--surface-base)/0.44),hsl(var(--background-strong)/0.72))] hover:border-[hsl(var(--brand)/0.16)]",
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center border border-[hsl(var(--brand)/0.16)] bg-[linear-gradient(180deg,hsl(var(--surface-strong)/0.84),hsl(var(--surface-base)/0.96))] text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-heading text-lg text-foreground">
                      {encyclopediaCategories[category].label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {getEntriesByCategory(category).length} verbetes
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  {encyclopediaCategories[category].description}
                </p>
              </button>
            );
          })}
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <ContinentMap />
          <TimelineRail title="Linha do tempo geral" events={immersiveTimeline} />
        </div>

        {filteredEntries.length > 0 ? (
          <div className="grid gap-6 xl:grid-cols-3">
            {filteredEntries.map((entry) => (
              <EncyclopediaEntryCard key={entry.slug} entry={entry} />
            ))}
          </div>
        ) : (
          <Card variant="panel">
            <CardContent className="space-y-3 p-8 text-center">
              <Skull className="mx-auto h-10 w-10 text-primary" />
              <h2 className="font-heading text-2xl text-foreground">
                Nenhum verbete encontrado
              </h2>
              <p className="mx-auto max-w-2xl text-sm leading-6 text-muted-foreground">
                Ajuste os filtros do bestiario ou refine a busca para encontrar outra criatura,
                regiao ou cronica.
              </p>
              {showMonsterFilters ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setMonsterType("all");
                    setMonsterRegion("all");
                    setMonsterDanger("all");
                    setSearch("");
                  }}
                >
                  Limpar busca e filtros
                </Button>
              ) : null}
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}

function UniverseEntryPage({ entry }: { entry: EncyclopediaEntry }) {
  const linkedEntries = getLinkedEntries(entry).map(sanitizeImmersiveEntry);
  const categoryEntries = getEntriesByCategory(entry.category)
    .filter((relatedEntry) => relatedEntry.slug !== entry.slug)
    .map(sanitizeImmersiveEntry);
  const Icon = categoryIcons[entry.category];
  const bestiaryMeta = getWitcherBestiaryMetadata(entry.slug);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [heroImage, setHeroImage] = useState(entry.image);

  useEffect(() => {
    setHeroImage(entry.image);
  }, [entry.image]);

  return (
    <div className="container py-12 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-10 md:space-y-12"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button asChild variant="ghost" className="pl-0 text-primary">
            <Link to="/universo">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para a enciclopedia
            </Link>
          </Button>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{encyclopediaCategories[entry.category].label}</Badge>
            {entry.vtt ? <Badge variant="secondary">Pronto para VTT</Badge> : null}
            {bestiaryMeta ? <Badge variant="info">Perigo {bestiaryMeta.dangerLevel}/5</Badge> : null}
          </div>
        </div>

        <section
          className="ornate-frame relative min-h-[72vh] overflow-hidden border border-[hsl(var(--outline-variant)/0.18)]"
          onMouseMove={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const offsetX = (event.clientX - rect.left) / rect.width - 0.5;
            const offsetY = (event.clientY - rect.top) / rect.height - 0.5;

            setParallax({ x: offsetX, y: offsetY });
          }}
          onMouseLeave={() => setParallax({ x: 0, y: 0 })}
        >
          <motion.img
            src={heroImage}
            alt={entry.imageAlt}
            className="absolute inset-0 h-full w-full object-cover"
            animate={{
              x: parallax.x * 26,
              y: parallax.y * 20,
              scale: 1.08,
            }}
            transition={{ type: "spring", stiffness: 70, damping: 18 }}
            referrerPolicy="no-referrer"
            onError={() => {
              const fallbackImage = categoryFallbackImages[entry.category];
              if (heroImage !== fallbackImage) {
                setHeroImage(fallbackImage);
              }
            }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,hsl(var(--background)/0.14),hsl(var(--background)/0.38)_28%,hsl(var(--background-strong)/0.9)_72%,hsl(var(--background-strong))_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.18),transparent_26%),radial-gradient(circle_at_84%_24%,hsl(var(--info)/0.16),transparent_18%),radial-gradient(circle_at_bottom_right,hsl(var(--destructive)/0.16),transparent_26%)]" />

          <div className="relative grid min-h-[72vh] items-end gap-6 p-6 md:p-8 xl:grid-cols-[minmax(0,1.15fr)_380px] xl:p-12">
            <div className="max-w-3xl space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="outline">
                  {encyclopediaCategories[entry.category].label}
                </Badge>
                <Icon className="h-5 w-5 text-primary/70" />
                <Badge variant="secondary">Verbete imersivo</Badge>
              </div>

              <div>
                <p className="section-kicker">Immersive dossier</p>
                <h1 className="mt-3 font-display text-5xl leading-[0.95] text-gold-gradient md:text-6xl">
                  {entry.title}
                </h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
                  {entry.subtitle}
                </p>
              </div>

              <p className="max-w-2xl text-base leading-8 text-foreground/92">
                {entry.summary}
              </p>

              <div className="grid gap-3 sm:grid-cols-3">
                {entry.stats.slice(0, 3).map((stat) => (
                  <div
                    key={`${entry.slug}-${stat.label}-hero`}
                    className="border border-[hsl(var(--outline-variant)/0.14)] bg-[linear-gradient(180deg,hsl(var(--surface-base)/0.44),hsl(var(--background-strong)/0.74))] p-4 backdrop-blur-sm"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="mt-3 font-heading text-xl text-foreground">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 border border-[hsl(var(--outline-variant)/0.18)] bg-[linear-gradient(180deg,hsl(var(--surface-strong)/0.74),hsl(var(--background-strong)/0.88))] p-5 shadow-elevated backdrop-blur-sm">
              <div className="space-y-4">
                <div>
                  <p className="section-kicker">Quick read</p>
                  <h2 className="mt-2 font-heading text-2xl text-foreground">
                    Leitura rapida
                  </h2>
                </div>
                <div className="grid gap-3">
                  {entry.stats.slice(0, 4).map((stat) => (
                    <DataSection
                      key={stat.label}
                      label={stat.label}
                      value={stat.value}
                      variant="quiet"
                    />
                  ))}
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <DataSection
                    label="Linha do tempo"
                    value={`${entry.timeline.length} marcos`}
                    variant="quiet"
                  />
                  <DataSection
                    label="Conexoes"
                    value={`${linkedEntries.length} elos`}
                    variant="quiet"
                  />
                </div>
                {bestiaryMeta ? (
                  <>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                      <DataSection label="Tipo" value={bestiaryMeta.type} variant="quiet" />
                      <DataSection
                        label="Nivel de perigo"
                        value={`${bestiaryMeta.dangerLevel}/5`}
                        variant="quiet"
                      />
                    </div>
                    <Button asChild className="w-full">
                      <Link to={`/mesa?spawn=${entry.slug}`}>Levar criatura para a mesa</Link>
                    </Button>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_340px]">
          <Card variant="panel" className="overflow-hidden">
            <CardContent className="grid gap-6 p-6 md:p-8 lg:grid-cols-[minmax(0,1.15fr)_320px]">
              <EntryArtworkPreview
                entry={entry}
                frameClassName="min-h-[320px] md:min-h-[420px]"
                imageClassName="object-contain p-5 md:p-8"
                buttonLabel="Ver em tela cheia"
              />

              <div className="space-y-4 border border-[hsl(var(--outline-variant)/0.14)] bg-[linear-gradient(180deg,hsl(var(--surface-base)/0.42),hsl(var(--background-strong)/0.74))] p-5">
                <div>
                  <p className="section-kicker">Art board</p>
                  <h2 className="mt-2 font-heading text-2xl text-foreground">
                    Leitura clara da arte
                  </h2>
                </div>

                <p className="text-sm leading-7 text-muted-foreground">
                  A ilustracao fica em quadro proprio, sem cortes agressivos, para facilitar a
                  leitura da criatura, do personagem ou do local antes de abrir em tela cheia.
                </p>

                <div className="grid gap-3">
                  <DataSection
                    label="Categoria"
                    value={encyclopediaCategories[entry.category].label}
                    variant="quiet"
                  />
                  <DataSection
                    label="Imagem"
                    value={entry.imageAlt}
                    variant="quiet"
                  />
                  <DataSection
                    label="Modo"
                    value={
                      entry.category === "monstros" ? "Enquadramento completo" : "Painel ampliado"
                    }
                    variant="quiet"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="panel">
            <CardContent className="space-y-4 p-6">
              <div>
                <p className="section-kicker">Field notes</p>
                <h2 className="mt-2 font-heading text-2xl text-foreground">
                  Notas de leitura
                </h2>
              </div>

              <DataSection
                label="Conexoes"
                value={`${linkedEntries.length} elos diretos`}
                variant="quiet"
              />
              <DataSection
                label="Categoria"
                value={encyclopediaCategories[entry.category].label}
                variant="quiet"
              />
              {bestiaryMeta ? (
                <DataSection
                  label="Caca em campo"
                  value={`Perigo ${bestiaryMeta.dangerLevel}/5`}
                  variant="quiet"
                  tone="warn"
                >
                  <p className="text-sm leading-6 text-muted-foreground">
                    Tipo {bestiaryMeta.type.toLowerCase()}. Use a arte em tela cheia para ler
                    silhueta, volume e postura antes da cena.
                  </p>
                </DataSection>
              ) : (
                <DataSection
                  label="Uso"
                  value="Leitura de lore e referencia narrativa"
                  variant="quiet"
                  tone="info"
                />
              )}
            </CardContent>
          </Card>
        </div>

        <EntryShowcase entry={entry} />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <Card variant="panel">
              <CardContent className="space-y-6 p-6 md:p-8">
                <div>
                  <p className="section-kicker">Narrative reading</p>
                  <h2 className="mt-2 font-display text-4xl text-brand-gradient">
                    Corpo principal do verbete
                  </h2>
                </div>

                {entry.narrative.map((block, index) => (
                  <section
                    key={block.heading}
                    className="grid gap-4 border border-[hsl(var(--outline-variant)/0.14)] bg-[linear-gradient(180deg,hsl(var(--surface-base)/0.42),hsl(var(--background-strong)/0.74))] p-6 md:grid-cols-[92px_minmax(0,1fr)]"
                  >
                    <div className="paper-strip h-fit p-4 text-center">
                      <p className="text-[10px] uppercase tracking-[0.22em]">Capitulo</p>
                      <p className="mt-2 font-display text-3xl">
                        {String(index + 1).padStart(2, "0")}
                      </p>
                    </div>

                    <div>
                      <p className="section-kicker">Arquivo</p>
                      <h2 className="mt-2 font-heading text-2xl text-foreground">
                        {block.heading}
                      </h2>
                      <p className="mt-4 text-base leading-8 text-foreground/90">
                        {block.body}
                      </p>
                    </div>
                  </section>
                ))}
              </CardContent>
            </Card>

            <RelationshipMap entry={entry} linkedEntries={linkedEntries} />
          </div>

          <div className="space-y-6 xl:sticky xl:top-28 xl:self-start">
            <TimelineRail title="Linha do tempo desta pagina" events={entry.timeline} />

            <Card variant="panel">
              <CardContent className="space-y-4 p-6">
                <div>
                  <p className="section-kicker">Related entries</p>
                  <h3 className="font-heading text-lg text-foreground">
                    Mais em {encyclopediaCategories[entry.category].label}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Outros verbetes da mesma categoria.
                  </p>
                </div>

                <div className="space-y-3">
                  {categoryEntries.map((relatedEntry) => (
                    <Link
                      key={relatedEntry.slug}
                      to={`/universo/${relatedEntry.slug}`}
                      className="block border border-[hsl(var(--outline-variant)/0.14)] bg-[linear-gradient(180deg,hsl(var(--surface-base)/0.42),hsl(var(--background-strong)/0.74))] p-4 transition-colors hover:border-[hsl(var(--brand)/0.18)]"
                    >
                      <p className="font-heading text-sm text-foreground">
                        {relatedEntry.title}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {relatedEntry.subtitle}
                      </p>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function UniversePage() {
  const { entrySlug } = useParams();

  if (!entrySlug) {
    return <UniverseIndex />;
  }

  const entry = getEncyclopediaEntry(entrySlug);

  if (!entry) {
    return (
      <div className="container py-24">
        <Card variant="panel" className="mx-auto max-w-2xl">
          <CardContent className="space-y-5 p-8 text-center">
            <BookMarked className="mx-auto h-10 w-10 text-primary" />
            <h1 className="font-display text-3xl text-gold-gradient">
              Verbete nao encontrado
            </h1>
            <p className="text-muted-foreground">
              Este registro nao existe ou ainda nao foi catalogado pela enciclopedia.
            </p>
            <Button asChild>
              <Link to="/universo">Voltar para a enciclopedia</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <UniverseEntryPage entry={sanitizeImmersiveEntry(entry)} />;
}
