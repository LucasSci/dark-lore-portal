import type { ComponentType } from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookMarked,
  Clock3,
  Flag,
  MapPin,
  Network,
  Search,
  ScrollText,
  Skull,
  Sparkles,
  Users,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataSection } from "@/components/ui/data-section";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

type CategoryFilter = "todas" | EncyclopediaCategory;

const categoryIcons: Record<EncyclopediaCategory, ComponentType<{ className?: string }>> = {
  personagens: Users,
  monstros: Skull,
  locais: MapPin,
  faccoes: Flag,
  historia: ScrollText,
};

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

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
      <Card variant="panel" className="h-full overflow-hidden transition-colors hover:border-primary/30">
        <CardContent className="flex h-full flex-col gap-5 p-0">
          <img
            src={entry.image}
            alt={entry.imageAlt}
            className="h-48 w-full object-cover"
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

            <div className="mt-auto pt-2">
              <Button asChild className="w-full">
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

  const filteredEntries = encyclopediaEntries.filter((entry) => {
    const matchesCategory =
      activeCategory === "todas" ? true : entry.category === activeCategory;
    const searchable = `${entry.title} ${entry.subtitle} ${entry.summary}`.toLowerCase();
    const matchesSearch = searchable.includes(search.trim().toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-10"
      >
        <div className="text-center">
          <BookMarked className="mx-auto mb-4 h-10 w-10 text-primary" />
          <h1 className="mb-4 font-display text-3xl text-gold-gradient md:text-5xl">
            Enciclopedia do Universo
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Explore personagens, monstros, locais, faccoes e historia em um arquivo
            vivo do Realm of Shadows, com paginas interligadas e linha do tempo.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <Card variant="elevated">
            <CardContent className="space-y-4 p-6">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-[260px] flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar por nome, tema ou resumo..."
                    className="bg-background/60 pl-10"
                  />
                </div>
                <Badge variant="outline" className="border-primary/30 text-primary">
                  {filteredEntries.length} verbetes
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={activeCategory === "todas" ? "default" : "outline"}
                  onClick={() => setActiveCategory("todas")}
                >
                  Todas
                </Button>
                {(Object.keys(encyclopediaCategories) as EncyclopediaCategory[]).map(
                  (category) => (
                    <Button
                      key={category}
                      size="sm"
                      variant={activeCategory === category ? "default" : "outline"}
                      onClick={() => setActiveCategory(category)}
                    >
                      {encyclopediaCategories[category].label}
                    </Button>
                  ),
                )}
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {(Object.keys(encyclopediaCategories) as EncyclopediaCategory[]).map(
                  (category) => {
                    const Icon = categoryIcons[category];

                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setActiveCategory(category)}
                        className="rounded-xl border border-border/70 bg-background/50 p-4 text-left transition-colors hover:border-primary/30"
                      >
                        <div className="flex items-center gap-3">
                          <div className="rounded-full border border-primary/20 bg-background/50 p-3">
                            <Icon className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-heading text-base text-foreground">
                              {encyclopediaCategories[category].label}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              {getEntriesByCategory(category).length} verbetes
                            </p>
                          </div>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                          {encyclopediaCategories[category].description}
                        </p>
                      </button>
                    );
                  },
                )}
              </div>
            </CardContent>
          </Card>

          <TimelineRail title="Linha do tempo geral" events={globalTimeline} />
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          {filteredEntries.map((entry) => (
            <EncyclopediaEntryCard key={entry.slug} entry={entry} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function UniverseEntryPage({ entry }: { entry: EncyclopediaEntry }) {
  const linkedEntries = getLinkedEntries(entry);
  const categoryEntries = getEntriesByCategory(entry.category).filter(
    (relatedEntry) => relatedEntry.slug !== entry.slug,
  );
  const Icon = categoryIcons[entry.category];
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  return (
    <div className="container py-16 md:py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12"
      >
        <Button asChild variant="ghost" className="pl-0 text-primary">
          <Link to="/universo">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para a enciclopedia
          </Link>
        </Button>

        <section
          className="relative min-h-[72vh] overflow-hidden rounded-[var(--radius)] border border-border/70"
          onMouseMove={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const offsetX = (event.clientX - rect.left) / rect.width - 0.5;
            const offsetY = (event.clientY - rect.top) / rect.height - 0.5;

            setParallax({ x: offsetX, y: offsetY });
          }}
          onMouseLeave={() => setParallax({ x: 0, y: 0 })}
        >
          <motion.img
            src={entry.image}
            alt={entry.imageAlt}
            className="absolute inset-0 h-full w-full object-cover"
            animate={{
              x: parallax.x * 26,
              y: parallax.y * 20,
              scale: 1.08,
            }}
            transition={{ type: "spring", stiffness: 70, damping: 18 }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,hsl(var(--background)/0.16),hsl(var(--background)/0.42)_34%,hsl(var(--background-strong)/0.92)_74%,hsl(var(--background-strong))_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.16),transparent_30%),radial-gradient(circle_at_bottom_right,hsl(var(--destructive)/0.16),transparent_26%)]" />

          <div className="relative grid min-h-[72vh] items-end gap-6 p-6 md:p-8 xl:grid-cols-[minmax(0,1.2fr)_360px] xl:p-12">
            <div className="max-w-3xl space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="outline" className="border-primary/30 text-primary">
                  {encyclopediaCategories[entry.category].label}
                </Badge>
                <Icon className="h-5 w-5 text-primary/70" />
                {entry.vtt ? (
                  <Badge variant="secondary" className="bg-secondary/80 text-foreground">
                    Pronto para VTT
                  </Badge>
                ) : null}
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-primary/80">
                  Verbete imersivo
                </p>
                <h1 className="mt-3 font-display text-4xl text-gold-gradient md:text-6xl">
                  {entry.title}
                </h1>
                <p className="mt-3 text-base leading-7 text-muted-foreground">
                  {entry.subtitle}
                </p>
              </div>

              <p className="max-w-2xl text-base leading-8 text-foreground/92">
                {entry.summary}
              </p>
            </div>

            <div className="rounded-[var(--radius)] border border-border/70 bg-background/70 p-5 shadow-panel backdrop-blur-sm">
              <div className="space-y-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-primary/80">
                    Resumo tatico
                  </p>
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
              </div>
            </div>
          </div>
        </section>

        <EntryShowcase entry={entry} />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <Card variant="panel">
              <CardContent className="space-y-6 p-6 md:p-8">
                {entry.narrative.map((block) => (
                  <section
                    key={block.heading}
                    className="rounded-[var(--radius)] border border-border/60 bg-background/35 p-6"
                  >
                    <p className="text-[11px] uppercase tracking-[0.22em] text-primary/80">
                      Capitulo
                    </p>
                    <h2 className="mt-3 font-heading text-2xl text-foreground">
                      {block.heading}
                    </h2>
                    <p className="mt-4 text-base leading-8 text-foreground/90">
                      {block.body}
                    </p>
                  </section>
                ))}
              </CardContent>
            </Card>

            <RelationshipMap entry={entry} linkedEntries={linkedEntries} />
          </div>

          <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
            <TimelineRail title="Linha do tempo desta pagina" events={entry.timeline} />

            <Card variant="panel">
              <CardContent className="space-y-4 p-6">
                <div>
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
                      className="block rounded-xl border border-border/70 bg-background/50 p-4 transition-colors hover:border-primary/30"
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
              Verbeta nao encontrado
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

  return <UniverseEntryPage entry={entry} />;
}
