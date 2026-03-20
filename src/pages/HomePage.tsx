import { type PointerEvent, type ReactNode, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpenText,
  Compass,
  Flame,
  type LucideIcon,
  Map,
  ScrollText,
  Shield,
  Sparkles,
  Sword,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

import heroFrameBg from "@/assets/hero-bg.jpg";
import heroBg from "@/assets/hero-zerrikania.jpg";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import ContinentMap from "@/components/world/ContinentMap";
import { CURRENT_PROTAGONISTS } from "@/lib/immersive-lore";
import {
  bulletinPanels,
  campaignPublicationLabel,
  editorialFallbacks,
  heroSignals,
  manifestoPanels,
  manifestoQuotes,
  moduleViews,
  portalEmberSpecs,
  promoBanners,
  type PortalEditorialEntry,
  type PortalModuleCardSpec,
  type PortalModuleViewKey,
  type PortalPromoBannerSpec,
} from "@/lib/portal-content";
import { usePortalShellMode } from "@/lib/portal-state";
import { type CampaignPublication, useCampaignPublications } from "@/lib/publications";
import { cn } from "@/lib/utils";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatEditorialDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR");
}

function ArtifactLink({
  to,
  children,
  secondary = false,
  className,
}: {
  to: string;
  children: ReactNode;
  secondary?: boolean;
  className?: string;
}) {
  return (
    <Link to={to} className={cn("artifact-cta", secondary && "artifact-cta-secondary", className)}>
      {children}
    </Link>
  );
}

function CampaignSlot({
  index,
  name,
  status,
}: {
  index: number;
  name: string;
  status: string;
}) {
  return (
    <div className="campaign-slot">
      <div className="campaign-portrait">{getInitials(name)}</div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-[0.24em] text-primary/74">
          Slot {String(index + 1).padStart(2, "0")}
        </p>
        <h3 className="mt-2 font-display text-[1.55rem] leading-none text-foreground">{name}</h3>
        <p className="mt-1 text-sm text-foreground/68">{status}</p>
      </div>
    </div>
  );
}

function EditorialCard({
  entry,
  featured = false,
  className,
}: {
  entry: PortalEditorialEntry;
  featured?: boolean;
  className?: string;
}) {
  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className={cn(
        "group relative isolate overflow-hidden border border-[hsl(var(--brand)/0.16)] bg-[linear-gradient(180deg,hsl(var(--surface-strong)/0.92),hsl(var(--surface-base)/0.98))] shadow-elevated",
        featured ? "min-h-[360px] md:col-span-2 xl:min-h-[420px]" : "min-h-[250px]",
        className,
      )}
    >
      <div className="absolute inset-0">
        <img
          src={featured ? heroBg : heroFrameBg}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover opacity-20 transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--brand)/0.16),transparent_36%),linear-gradient(180deg,hsl(var(--surface-strong)/0.82),hsl(var(--surface-base)/0.94)_48%,hsl(var(--background-strong)/0.98))]" />
      </div>

      <Link to={entry.href} className="relative flex h-full flex-col justify-between p-6 md:p-7">
        <div className="flex flex-wrap gap-2">
          <Badge variant={featured ? "warning" : "outline"}>{entry.label}</Badge>
          <Badge variant="secondary">{entry.location}</Badge>
        </div>

        <div>
          <p className="section-kicker">{featured ? "Cronica em foco" : "Eco recente"}</p>
          <h3
            className={cn(
              "mt-4 font-display leading-[0.95] text-foreground",
              featured ? "text-5xl md:text-6xl" : "text-3xl md:text-[2.3rem]",
            )}
          >
            {entry.title}
          </h3>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-foreground/76 md:text-base">
            {entry.excerpt}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <span className="text-[11px] uppercase tracking-[0.22em] text-primary/72">
              Atualizada em {formatEditorialDate(entry.updatedAt)}
            </span>
            <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Abrir
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

function QuoteSeal({ quote, source }: { quote: string; source: string }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="paper-strip border border-[hsl(36_32%_42%/0.22)] p-5 md:p-6"
    >
      <p className="font-display text-4xl leading-none text-[hsl(25_34%_20%/0.62)]">"</p>
      <p className="mt-3 font-display text-3xl leading-tight text-[hsl(24_31%_16%)]">{quote}</p>
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(24_31%_20%/0.76)]">
        {source}
      </p>
    </motion.div>
  );
}

function ModuleCard({
  item,
  featured = false,
  className,
}: {
  item: PortalModuleCardSpec;
  featured?: boolean;
  className?: string;
}) {
  const Icon = item.icon;

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className={cn(
        "group relative isolate overflow-hidden border border-[hsl(var(--brand)/0.16)] bg-[linear-gradient(180deg,hsl(var(--surface-strong)/0.92),hsl(var(--surface-base)/0.98))] shadow-elevated",
        featured ? "min-h-[360px] lg:col-span-2" : "min-h-[280px]",
        className,
      )}
    >
      <img
        src={item.image}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-24 transition duration-700 group-hover:scale-105"
        style={{ objectPosition: item.imagePosition ?? "center" }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,hsl(var(--background)/0.1),hsl(var(--background)/0.42)_24%,hsl(var(--background-strong)/0.9)_100%),radial-gradient(circle_at_top_left,hsl(var(--brand)/0.18),transparent_36%)]" />

      <Link to={item.path} className="relative flex h-full flex-col justify-between p-6 md:p-7">
        <div className="flex items-center justify-between gap-4">
          <Badge variant="outline">{item.eyebrow}</Badge>
          <div className="icon-slot h-11 w-11 shrink-0">
            <Icon className="h-4 w-4" />
          </div>
        </div>

        <div>
          <h3
            className={cn(
              "max-w-3xl font-display leading-[0.96] text-foreground",
              featured ? "text-5xl md:text-6xl" : "text-4xl",
            )}
          >
            {item.title}
          </h3>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-foreground/76 md:text-base">
            {item.description}
          </p>
          <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Abrir rota
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </Link>
    </motion.article>
  );
}

function PromoBanner({
  eyebrow,
  title,
  body,
  path,
  image,
  imagePosition,
  icon: Icon,
  cta,
}: {
  eyebrow: string;
  title: string;
  body: string;
  path: string;
  image: string;
  imagePosition?: string;
  icon: LucideIcon;
  cta: string;
}) {
  return (
    <motion.article whileHover={{ y: -4 }} transition={{ duration: 0.22, ease: "easeOut" }}>
      <Link
        to={path}
        className="group relative isolate block min-h-[320px] overflow-hidden border border-[hsl(var(--brand)/0.16)] bg-[linear-gradient(180deg,hsl(var(--surface-strong)/0.92),hsl(var(--surface-base)/0.98))] shadow-elevated"
      >
        <img
          src={image}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-24 transition duration-700 group-hover:scale-105"
          style={{ objectPosition: imagePosition ?? "center" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,hsl(var(--background)/0.1),hsl(var(--background)/0.42)_26%,hsl(var(--background-strong)/0.92)_100%),radial-gradient(circle_at_top,hsl(var(--brand)/0.16),transparent_36%)]" />

        <div className="relative flex h-full flex-col justify-between p-6 md:p-8">
          <div className="flex items-center justify-between gap-4">
            <Badge variant="secondary">{eyebrow}</Badge>
            <div className="icon-slot h-11 w-11 shrink-0">
              <Icon className="h-4 w-4" />
            </div>
          </div>

          <div className="max-w-xl">
            <h3 className="font-display text-5xl leading-[0.95] text-foreground">{title}</h3>
            <p className="mt-4 text-sm leading-7 text-foreground/78 md:text-base">{body}</p>
            <div className="mt-6">
              <span className="artifact-chip">{cta}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

export default function HomePage() {
  usePortalShellMode("editorial", "interactive");
  const { publishedPublications } = useCampaignPublications();
  const [heroDrift, setHeroDrift] = useState({ x: 0, y: 0 });
  const [moduleView, setModuleView] = useState<PortalModuleViewKey>("exploracao");

  const editorialEntries: PortalEditorialEntry[] = [
    ...publishedPublications.map((publication) => ({
      id: publication.id,
      title: publication.title,
      excerpt: publication.excerpt,
      location: publication.location,
      label: campaignPublicationLabel[publication.kind],
      updatedAt: publication.updatedAt,
      href: "/campanha",
    })),
    ...editorialFallbacks,
  ].slice(0, 5);

  const featuredEditorial = editorialEntries[0];
  const supportingEditorial = editorialEntries.slice(1);
  const activeModule = moduleViews[moduleView];

  const handleHeroPointerMove = (event: PointerEvent<HTMLElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const offsetX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const offsetY = (event.clientY - bounds.top) / bounds.height - 0.5;
    setHeroDrift({ x: offsetX * 22, y: offsetY * 18 });
  };

  return (
    <div className="space-y-16 pb-12 md:space-y-24">
      <section
        className="relative overflow-hidden border-y border-[hsl(var(--brand)/0.22)]"
        onPointerMove={handleHeroPointerMove}
        onPointerLeave={() => setHeroDrift({ x: 0, y: 0 })}
      >
        <div className="absolute inset-0">
          <motion.img
            src={heroBg}
            alt="Paisagem dourada de Zerrikania"
            className="h-full w-full object-cover object-center opacity-90"
            animate={{ x: heroDrift.x, y: heroDrift.y, scale: 1.08 }}
            transition={{ type: "spring", stiffness: 40, damping: 18, mass: 1.2 }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,hsl(var(--brand)/0.38),transparent_28%),radial-gradient(circle_at_78%_18%,hsl(var(--warning)/0.18),transparent_26%),linear-gradient(180deg,hsl(var(--background)/0.16),hsl(var(--background)/0.6)_26%,hsl(var(--background-strong)/0.94)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,hsl(var(--background)/0.82),transparent_26%,transparent_72%,hsl(var(--background)/0.8)),linear-gradient(180deg,hsl(var(--background)/0.62),transparent_18%,transparent_68%,hsl(var(--background-strong)/0.9))]" />
          <div className="reliquary-grain absolute inset-0 opacity-40" />

          {portalEmberSpecs.map((ember) => (
            <motion.span
              key={`${ember.left}-${ember.top}`}
              className="absolute rounded-full"
              style={{
                left: ember.left,
                top: ember.top,
                width: ember.size,
                height: ember.size,
                background:
                  "radial-gradient(circle, rgba(255,224,159,0.95) 0%, rgba(255,188,86,0.62) 42%, rgba(255,188,86,0) 78%)",
                boxShadow: "0 0 24px rgba(255,193,103,0.45)",
              }}
              animate={{ y: [0, -24, 0], opacity: [0.25, 0.9, 0.3], scale: [0.85, 1.1, 0.92] }}
              transition={{
                duration: ember.duration,
                delay: ember.delay,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        <div className="container relative py-14 md:py-18 xl:py-22">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.02fr)_420px] xl:items-end">
            <div className="space-y-8">
              <div className="max-w-4xl space-y-6">
                <div className="artifact-chip w-fit">
                  <Flame className="h-3.5 w-3.5" />
                  Arquivo do reliquiario
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <h1 className="max-w-4xl font-display text-5xl leading-[0.9] text-brand-gradient drop-shadow-[0_18px_36px_rgba(12,8,3,0.5)] md:text-6xl xl:text-7xl">
                    Um portal de campanha com estrutura de saga.
                  </h1>
                  <p className="mt-6 max-w-3xl text-base leading-8 text-foreground/84 md:text-lg">
                    A referencia oficial virou espinha para a sua home: hero mais claro, cronicas
                    em grade editorial, manifesto de mundo, vitrine de modulos e chamadas fortes
                    para mapa, mesa e arquivo pessoal.
                  </p>
                </motion.div>

                <div className="flex flex-wrap gap-3">
                  <Badge variant="outline">Atlas navegavel</Badge>
                  <Badge variant="outline">Cronicas e contratos</Badge>
                  <Badge variant="outline">Mesa, mestre e criacao</Badge>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <ArtifactLink to="/mapa">
                  Explorar o atlas
                  <ArrowRight className="h-4 w-4" />
                </ArtifactLink>
                <ArtifactLink to="/campanha" secondary>
                  Abrir cronicas
                </ArtifactLink>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {heroSignals.map((signal) => {
                  const Icon = signal.icon;

                  return (
                    <div key={signal.title} className="info-panel p-5">
                      <div className="icon-slot h-10 w-10">
                        <Icon className="h-4 w-4" />
                      </div>
                      <p className="mt-4 font-display text-3xl leading-none text-foreground">
                        {signal.title}
                      </p>
                      <p className="mt-3 text-sm leading-6 text-foreground/72">{signal.body}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <motion.aside
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.15 }}
              className="campaign-board p-6 md:p-7 xl:mb-2"
            >
              <div className="artifact-chip w-fit">
                <ScrollText className="h-3.5 w-3.5" />
                Dossie da campanha
              </div>
              <h2 className="mt-5 font-display text-5xl leading-[0.94] text-foreground">
                Companhia em foco
              </h2>
              <p className="mt-4 text-sm leading-7 text-foreground/72">
                A home agora apresenta a campanha como produto central do portal, com personagens
                ativos e leitura em destaque logo na abertura.
              </p>

              <div className="mt-6 space-y-3">
                {CURRENT_PROTAGONISTS.map((name, index) => (
                  <CampaignSlot
                    key={name}
                    index={index}
                    name={name}
                    status={
                      index === 0
                        ? "Linha de frente"
                        : index === 1
                          ? "Investigacao tensa"
                          : "Sobrevivente da estrada"
                    }
                  />
                ))}
              </div>

              {featuredEditorial ? (
                <div className="mt-6 border-t border-[hsl(var(--brand)/0.18)] pt-6">
                  <p className="section-kicker">Entrada em foco</p>
                  <div className="relic-parchment mt-4 p-5">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="warning">{featuredEditorial.label}</Badge>
                      <Badge variant="secondary">{featuredEditorial.location}</Badge>
                    </div>
                    <h3 className="mt-4 font-display text-4xl leading-[0.98] text-foreground">
                      {featuredEditorial.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-foreground/78">
                      {featuredEditorial.excerpt}
                    </p>
                  </div>
                </div>
              ) : null}
            </motion.aside>
          </div>
        </div>
      </section>

      <section className="container space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <p className="section-kicker">Ultimos ecos do continente</p>
            <h2 className="font-display text-5xl leading-[0.94] text-brand-gradient">
              Cronicas, contratos e modulos agora entram na home como materia editorial.
            </h2>
            <p className="text-sm leading-7 text-foreground/76 md:text-base">
              A referencia oficial ajudou a transformar o topo do site em fluxo de leitura. Em vez
              de caixas soltas, a home agora organiza o que aconteceu, o que esta aberto e para
              onde o jogador deve ir em seguida.
            </p>
          </div>

          <ArtifactLink to="/campanha" className="w-full justify-center lg:w-auto">
            Ver todas as cronicas
            <ArrowRight className="h-4 w-4" />
          </ArtifactLink>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {featuredEditorial ? (
            <EditorialCard
              entry={featuredEditorial}
              featured
              className="xl:col-span-2 xl:row-span-2"
            />
          ) : null}

          {supportingEditorial.map((entry, index) => (
            <EditorialCard
              key={entry.id}
              entry={entry}
              className={index === 2 ? "md:col-span-2 xl:col-span-2" : ""}
            />
          ))}
        </div>
      </section>

      <section className="container">
        <Card variant="elevated" className="reliquary-grain overflow-hidden">
          <CardContent className="p-0">
            <div className="border-b border-[hsl(var(--brand)/0.16)] px-6 py-10 md:px-8 lg:px-10">
              <div className="mx-auto max-w-3xl text-center">
                <p className="section-kicker">Boas-vindas ao novo reliquiario</p>
                <h2 className="mt-4 font-display text-5xl leading-[0.94] text-brand-gradient md:text-6xl">
                  O layout ficou mais proximo de um universo navegavel e menos de um app generico.
                </h2>
                <p className="mt-5 text-sm leading-7 text-foreground/76 md:text-base">
                  O objetivo aqui nao foi copiar a homepage oficial, e sim trazer a mesma clareza
                  estrutural para o seu proprio mundo. A direcao visual continua sua, mas a
                  arquitetura agora respira melhor.
                </p>
              </div>
            </div>

            <div className="grid gap-8 px-6 py-8 md:px-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:px-10">
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  {manifestoPanels.map((panel) => {
                    const Icon = panel.icon;

                    return (
                      <div key={panel.title} className="info-panel p-5">
                        <div className="icon-slot h-10 w-10">
                          <Icon className="h-4 w-4" />
                        </div>
                        <h3 className="mt-4 font-display text-3xl leading-none text-foreground">
                          {panel.title}
                        </h3>
                        <p className="mt-3 text-sm leading-6 text-foreground/72">{panel.body}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="relic-parchment p-6">
                  <p className="section-kicker text-[hsl(24_31%_20%/0.74)]">Leitura de direcao</p>
                  <p className="mt-4 font-display text-4xl leading-[1.02] text-[hsl(24_31%_16%)]">
                    Hero claro, grade editorial forte, manifesto curto e chamadas para os modulos
                    certos.
                  </p>
                  <p className="mt-4 text-sm leading-7 text-[hsl(24_31%_22%/0.84)]">
                    Isso aproxima a experiencia do ritmo de um portal premium de fantasia sombria,
                    mas com o seu proprio lore, sua propria campanha e as suas proprias trilhas de
                    navegacao.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1">
                {manifestoQuotes.map((quote) => (
                  <QuoteSeal key={quote.source} quote={quote.quote} source={quote.source} />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="container grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)] xl:items-start">
        <Card variant="panel" className="reliquary-grain xl:sticky xl:top-32">
          <CardContent className="space-y-6 p-6 md:p-8">
            <div className="space-y-4">
              <p className="section-kicker">Vitrine de modulos</p>
              <h2 className="font-display text-5xl leading-[0.94] text-brand-gradient">
                O portal agora vende caminhos, nao apenas paginas.
              </h2>
              <p className="text-sm leading-7 text-foreground/76">{activeModule.body}</p>
            </div>

            <div className="space-y-2">
              {(Object.entries(moduleViews) as [PortalModuleViewKey, (typeof moduleViews)[PortalModuleViewKey]][]).map(
                ([key, view]) => (
                  <button
                    key={key}
                    type="button"
                    data-active={moduleView === key ? "true" : "false"}
                    className="tool-rail-button w-full justify-between border px-4 py-4 text-left"
                    onClick={() => setModuleView(key)}
                  >
                    <span className="font-display text-2xl text-foreground">{view.label}</span>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary/72">
                      Abrir
                    </span>
                  </button>
                ),
              )}
            </div>

            <div className="relic-parchment p-5">
              <p className="section-kicker text-[hsl(24_31%_20%/0.74)]">Leitura sugerida</p>
              <p className="mt-4 font-display text-3xl leading-[1.02] text-[hsl(24_31%_16%)]">
                {activeModule.title}
              </p>
              <p className="mt-4 text-sm leading-7 text-[hsl(24_31%_22%/0.84)]">
                {activeModule.accent}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <ModuleCard item={activeModule.items[0]} featured />
            <ModuleCard item={activeModule.items[1]} />
            <ModuleCard item={activeModule.items[2]} />
          </div>

          {moduleView === "exploracao" ? (
            <ContinentMap compact />
          ) : (
            <Card variant="panel" className="reliquary-grain">
              <CardContent className="grid gap-6 p-6 md:p-8 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
                <div className="space-y-5">
                  <div className="space-y-4">
                    <Badge variant="outline">Ritmo de sessao</Badge>
                    <h3 className="font-display text-5xl leading-[0.95] text-brand-gradient">
                      Campanha, dossie e conducao respirando no mesmo lugar.
                    </h3>
                    <p className="text-sm leading-7 text-foreground/76">
                      Quando a vitrine entra em modo campanha, a home deixa claro onde a sessao
                      continua, onde o mestre prepara cena e onde os jogadores revisitam a trilha.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="info-panel p-5">
                      <div className="icon-slot h-10 w-10">
                        <BookOpenText className="h-4 w-4" />
                      </div>
                      <h4 className="mt-4 font-display text-3xl leading-none text-foreground">
                        Arquivo de leitura
                      </h4>
                      <p className="mt-3 text-sm leading-6 text-foreground/72">
                        Contratos, relatorios e boatos reforcam o que a mesa acabou de viver.
                      </p>
                    </div>

                    <div className="info-panel p-5">
                      <div className="icon-slot h-10 w-10">
                        <Shield className="h-4 w-4" />
                      </div>
                      <h4 className="mt-4 font-display text-3xl leading-none text-foreground">
                        Controle do mestre
                      </h4>
                      <p className="mt-3 text-sm leading-6 text-foreground/72">
                        O mestre ganha chamada direta e mais legitimidade dentro do fluxo da home.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {CURRENT_PROTAGONISTS.map((name, index) => (
                    <CampaignSlot
                      key={name}
                      index={index}
                      name={name}
                      status={
                        index === 0
                          ? "Pronto para conflito"
                          : index === 1
                            ? "Leitura tensa"
                            : "Rastro ainda aberto"
                      }
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <section className="container">
        <Card variant="elevated" className="reliquary-grain relative overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={heroFrameBg}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover opacity-14"
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--brand)/0.18),transparent_34%),linear-gradient(180deg,hsl(var(--background)/0.04),hsl(var(--background-strong)/0.3)_100%)]" />
          </div>

          <CardContent className="relative grid gap-6 p-6 md:p-8 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-5">
              <div className="space-y-4">
                <p className="section-kicker">Sempre em dia com o reliquiario</p>
                <h2 className="font-display text-5xl leading-[0.94] text-brand-gradient md:text-6xl">
                  Receba o proximo rumor antes da fogueira apagar.
                </h2>
                <p className="max-w-3xl text-sm leading-7 text-foreground/76 md:text-base">
                  Em vez de um formulario generico, esta camada funciona como chamada clara para
                  retomar a campanha: abrir o arquivo pessoal, seguir os ecos da comunidade e
                  acompanhar o que entrou no portal.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {bulletinPanels.map((panel) => {
                  const Icon = panel.icon;

                  return (
                    <div key={panel.title} className="info-panel p-5">
                      <div className="icon-slot h-10 w-10">
                        <Icon className="h-4 w-4" />
                      </div>
                      <h3 className="mt-4 font-display text-3xl leading-none text-foreground">
                        {panel.title}
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-foreground/72">{panel.body}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="campaign-board p-6">
              <Badge variant="outline">Arquivo pessoal</Badge>
              <h3 className="mt-4 font-display text-4xl leading-[0.96] text-foreground">
                Dois caminhos para seguir sem quebrar a imersao.
              </h3>
              <p className="mt-4 text-sm leading-7 text-foreground/72">
                Continue pelo seu dossie pessoal ou atravesse a ponte para comunidade e campanha
                publica. Tudo ainda parece parte do mesmo artefato.
              </p>

              <div className="mt-6 flex flex-col gap-3">
                <ArtifactLink to="/conta" className="justify-center">
                  Abrir a conta
                </ArtifactLink>
                <ArtifactLink to="/comunidade" secondary className="justify-center">
                  Ouvir a comunidade
                </ArtifactLink>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="container grid gap-6 xl:grid-cols-2">
        {promoBanners.map((banner) => (
          <PromoBanner key={banner.title} {...banner} />
        ))}
      </section>
    </div>
  );
}
