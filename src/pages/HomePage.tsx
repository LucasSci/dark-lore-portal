import { type ReactNode, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpenText,
  Compass,
  type LucideIcon,
  Map,
  ScrollText,
  Shield,
  Sword,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

import CinematicHero from "@/components/portal/CinematicHero";
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
  portalReferenceArt,
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
        "reference-frame reference-surface-card group relative isolate overflow-hidden",
        featured ? "min-h-[360px] md:col-span-2 xl:min-h-[420px]" : "min-h-[250px]",
        className,
      )}
    >
      <div className="absolute inset-0">
        <img
          src={featured ? portalReferenceArt.hero : portalReferenceArt.bannerRedkit}
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
        "reference-frame reference-surface-card group relative isolate overflow-hidden",
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
  const lightCard = image === portalReferenceArt.bannerConcert;

  return (
    <motion.article whileHover={{ y: -4 }} transition={{ duration: 0.22, ease: "easeOut" }}>
      <Link
        to={path}
        className={cn(
          "reference-frame group relative isolate block min-h-[320px] overflow-hidden shadow-elevated",
          lightCard ? "reference-promo-card-light" : "reference-promo-card-dark",
        )}
      >
        <img
          src={image}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-24 transition duration-700 group-hover:scale-105"
          style={{ objectPosition: imagePosition ?? "center" }}
        />
        <div
          className={cn(
            "absolute inset-0",
            lightCard
              ? "bg-[linear-gradient(90deg,hsl(41_37%_90%/0.95),hsl(41_37%_90%/0.76)_42%,transparent_82%)]"
              : "bg-[linear-gradient(180deg,hsl(var(--background)/0.1),hsl(var(--background)/0.42)_26%,hsl(var(--background-strong)/0.92)_100%),radial-gradient(circle_at_top,hsl(var(--brand)/0.16),transparent_36%)]",
          )}
        />

        <div className="relative flex h-full flex-col justify-between p-6 md:p-8">
          <div className="flex items-center justify-between gap-4">
            <Badge variant={lightCard ? "warning" : "secondary"}>{eyebrow}</Badge>
            <div className="icon-slot h-11 w-11 shrink-0">
              <Icon className="h-4 w-4" />
            </div>
          </div>

          <div className="max-w-xl">
            <h3 className={cn("font-display text-5xl leading-[0.95]", lightCard ? "text-[hsl(30_24%_14%)]" : "text-foreground")}>
              {title}
            </h3>
            <p className={cn("mt-4 text-sm leading-7 md:text-base", lightCard ? "text-[hsl(28_16%_24%/0.9)]" : "text-foreground/78")}>
              {body}
            </p>
            <div className="mt-6">
              <span className={cn("reference-inline-cta", lightCard && "reference-inline-cta-light")}>{cta}</span>
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

  return (
    <div className="space-y-16 pb-12 md:space-y-24">
      <CinematicHero />

      <section className="container grid gap-4 md:grid-cols-3">
        {heroSignals.map((signal) => {
          const Icon = signal.icon;

          return (
            <div key={signal.title} className="reference-frame reference-surface-card p-5">
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
      </section>

      <section className="container space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <p className="section-kicker">Ultimos ecos do continente</p>
            <h2 className="font-display text-5xl leading-[0.94] text-brand-gradient">
              Cronicas, contratos e modulos abrem a entrada principal do arquivo.
            </h2>
            <p className="text-sm leading-7 text-foreground/76 md:text-base">
              Noticias da estrada, capitulos de campanha e trilhas abertas do arquivo aparecem
              reunidos aqui, para que cada retorno ao portal comece pelo que mudou no continente.
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
                  Um reliquiario feito para guardar rotas, nomes e sinais do continente.
                </h2>
                <p className="mt-5 text-sm leading-7 text-foreground/76 md:text-base">
                  Cada secao funciona como um caderno de campo: algumas abrem caminho para a
                  proxima sessao, outras preservam memoria, rumor e perigo antes que a estrada os
                  apague.
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
                    Um topo de vigilia, uma grade de ecos e atalhos para tudo que continua vivo.
                  </p>
                  <p className="mt-4 text-sm leading-7 text-[hsl(24_31%_22%/0.84)]">
                    O arquivo abre pelo que importa agora: o rumor mais recente, a rota mais
                    perigosa e o modulo que pede atencao antes do proximo descanso.
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
                Cada ala do arquivo conduz a um tipo diferente de travessia.
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
            <Card variant="panel">
              <CardContent className="grid gap-6 p-6 md:p-8 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
                <div className="space-y-5">
                  <div className="space-y-4">
                    <Badge variant="outline">Ritmo de sessao</Badge>
                    <h3 className="font-display text-5xl leading-[0.95] text-brand-gradient">
                      Campanha, dossies e preparacao da mesa seguindo a mesma trilha.
                    </h3>
                    <p className="text-sm leading-7 text-foreground/76">
                      Quando a historia aperta, o portal aponta sem rodeio para o proximo relatorio,
                      para a ala do mestre e para os nomes que ainda precisam de resposta.
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
                        A ala do mestre fica logo ao alcance quando a sessao pede preparo rapido.
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
              src={portalReferenceArt.bannerRedkit}
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
                  Abra seu dossie pessoal, siga os ecos da comunidade e acompanhe o que acabou de
                  entrar no arquivo sem perder o fio da campanha.
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
