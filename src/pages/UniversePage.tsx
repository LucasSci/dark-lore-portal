import type { ComponentType } from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookMarked,
  Clock3,
  Flag,
  MapPin,
  Search,
  ScrollText,
  Skull,
  Users,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataSection } from "@/components/ui/data-section";
import { Input } from "@/components/ui/input";
import {
  encyclopediaCategories,
  encyclopediaEntries,
  getEncyclopediaEntry,
  getEntriesByCategory,
  getLinkedEntries,
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
              <Icon className="h-5 w-5 text-primary/70" />
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

  return (
    <div className="container py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <Button asChild variant="ghost" className="pl-0 text-primary">
          <Link to="/universo">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para a enciclopedia
          </Link>
        </Button>

        <Card variant="elevated" className="overflow-hidden">
          <CardContent className="grid gap-0 p-0 lg:grid-cols-[1.2fr_minmax(0,1fr)]">
            <img
              src={entry.image}
              alt={entry.imageAlt}
              className="h-full min-h-[280px] w-full object-cover"
            />
            <div className="space-y-5 p-6 md:p-8">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="border-primary/30 text-primary">
                  {encyclopediaCategories[entry.category].label}
                </Badge>
                <Icon className="h-5 w-5 text-primary/70" />
              </div>

              <div>
                <h1 className="font-display text-3xl text-gold-gradient md:text-4xl">
                  {entry.title}
                </h1>
                <p className="mt-3 text-base leading-7 text-muted-foreground">
                  {entry.subtitle}
                </p>
              </div>

              <p className="text-sm leading-7 text-foreground/90">{entry.summary}</p>

              <div className="grid gap-3 sm:grid-cols-3">
                {entry.stats.map((stat) => (
                  <DataSection key={stat.label} label={stat.label} value={stat.value} variant="quiet" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <Card variant="panel">
              <CardContent className="space-y-6 p-6 md:p-8">
                {entry.narrative.map((block) => (
                  <section key={block.heading} className="space-y-3">
                    <h2 className="font-heading text-2xl text-foreground">
                      {block.heading}
                    </h2>
                    <p className="text-base leading-8 text-foreground/90">
                      {block.body}
                    </p>
                  </section>
                ))}
              </CardContent>
            </Card>

            <Card variant="panel">
              <CardContent className="space-y-5 p-6">
                <div>
                  <h2 className="font-heading text-2xl text-foreground">Ligacoes internas</h2>
                  <p className="text-sm text-muted-foreground">
                    Continue a leitura por entradas conectadas a este verbete.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {linkedEntries.map((linkedEntry) => (
                    <Link
                      key={linkedEntry.slug}
                      to={`/universo/${linkedEntry.slug}`}
                      className="rounded-xl border border-border/70 bg-background/50 p-4 transition-colors hover:border-primary/30"
                    >
                      <p className="font-heading text-base text-foreground">
                        {linkedEntry.title}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {linkedEntry.subtitle}
                      </p>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
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
