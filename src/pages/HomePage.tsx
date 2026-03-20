import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpenText,
  Compass,
  Flame,
  Map,
  ScrollText,
  Shield,
  Sparkles,
  Sword,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

import heroBg from "@/assets/hero-zerrikania.jpg";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataSection } from "@/components/ui/data-section";
import ContinentMap from "@/components/world/ContinentMap";
import { CURRENT_PROTAGONISTS } from "@/lib/immersive-lore";
import { useCampaignPublications } from "@/lib/publications";

const featureCards = [
  {
    icon: ScrollText,
    eyebrow: "Arquivo vivo",
    title: "Cronicas e contratos em fluxo",
    description: "Publicacoes do mestre viram parte do mundo, nao apenas um mural fora de personagem.",
    path: "/campanha",
  },
  {
    icon: Map,
    eyebrow: "Atlas diegetico",
    title: "Continente em camadas",
    description: "Do mundi para regioes e pontos locais, com leitura de viagem, fronteira e risco.",
    path: "/mapa",
  },
  {
    icon: Sword,
    eyebrow: "Mesa e combate",
    title: "Pronto para ir do lore ao jogo",
    description: "A mesma linguagem visual serve mapa, mesa virtual, ficha e material de campanha.",
    path: "/mesa",
  },
  {
    icon: Shield,
    eyebrow: "Conta e biblioteca",
    title: "Acervo pessoal integrado",
    description: "Downloads, compras e progresso ficam reunidos no mesmo reliquario.",
    path: "/conta",
  },
];

const atlasSignals = [
  {
    title: "Velen e Novigrad",
    description: "Ruinas, politica suja e contratos onde a estrada nunca fica limpa por muito tempo.",
  },
  {
    title: "Skellige",
    description: "Costas violentas, bruma salgada e leitura de travessia em alto risco.",
  },
  {
    title: "Toussaint",
    description: "Luxo, ritual e uma fachada brilhante escondendo ameacas bem antigas.",
  },
  {
    title: "Kaer Morhen",
    description: "Pedra, memoria e ecos de uma era que insiste em permanecer viva.",
  },
];

const protagonistRows = CURRENT_PROTAGONISTS.map((name, index) => ({
  id: index + 1,
  name,
  status: index === 0 ? "Linha de frente" : index === 1 ? "Leitura tensa" : "Sobrevivencia de estrada",
}));

const publicationLabels = {
  cronica: "Cronica",
  contrato: "Contrato",
  rumor: "Rumor",
  relatorio: "Relatorio",
} as const;

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function HomePage() {
  const { publishedPublications } = useCampaignPublications();
  const spotlight = publishedPublications.slice(0, 3);
  const leadPublication = spotlight[0];
  const secondaryPublications = spotlight.slice(1);

  const heroMetrics = [
    {
      label: "Registros ativos",
      value: String(publishedPublications.length).padStart(2, "0"),
      detail: "cronicas, contratos e rumores em circulacao",
    },
    {
      label: "Companhia central",
      value: "03",
      detail: "protagonistas sustentando a frente atual",
    },
    {
      label: "Portais de jogo",
      value: "06",
      detail: "atlas, mesa, campanha, conta, comunidade e loja",
    },
  ];

  return (
    <div className="space-y-20 pb-8 md:space-y-24">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroBg}
            alt="Areias de Zerrikania - muralhas e desertos sob um ceu escuro"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-hero-gradient" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--brand)/0.18),transparent_30%),radial-gradient(circle_at_84%_18%,hsl(var(--info)/0.16),transparent_18%),radial-gradient(circle_at_bottom_right,hsl(var(--destructive)/0.14),transparent_26%)]" />
        </div>

        <div className="container relative py-12 md:py-20 xl:py-24">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_420px] xl:items-end">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="space-y-7"
            >
              <Badge variant="outline" className="border-[hsl(var(--brand)/0.24)] bg-background/20 backdrop-blur-sm">
                <Flame className="mr-2 h-3.5 w-3.5" />
                The Alchemist&apos;s Archive
              </Badge>

              <div className="max-w-4xl space-y-4">
                <p className="section-kicker">Dark fantasy editorial UI</p>
                <h1 className="engraved-title font-display text-5xl leading-[0.92] text-brand-gradient sm:text-6xl xl:text-7xl">
                  Um portal que parece artefato. Nao uma dashboard qualquer.
                </h1>
                <p className="max-w-2xl text-base leading-8 text-foreground/88 md:text-lg">
                  O site foi reformulado como reliquario digital: atlas navegavel, cronicas,
                  contratos, mesa virtual e conta pessoal costurados por uma direcao visual
                  cinematografica, pesada e intencional.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {heroMetrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="border border-[hsl(var(--outline-variant)/0.16)] bg-[linear-gradient(180deg,hsl(var(--surface-base)/0.56),hsl(var(--background-strong)/0.72))] p-4 backdrop-blur-sm"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                      {metric.label}
                    </p>
                    <p className="mt-3 font-display text-4xl text-brand-gradient">{metric.value}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{metric.detail}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link to="/mapa">
                    Explorar o atlas
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/campanha">Ler cronicas e contratos</Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.12, ease: "easeOut" }}
            >
              <Card variant="elevated" className="overflow-hidden">
                <CardContent className="space-y-6 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="section-kicker">Frente de campanha</p>
                      <h2 className="mt-2 font-display text-3xl text-foreground">
                        Dossie da companhia
                      </h2>
                    </div>
                    <Badge variant="info">Mapa + mesa + arquivo</Badge>
                  </div>

                  <div className="grid gap-3">
                    {protagonistRows.map((entry) => (
                      <div
                        key={entry.name}
                        className="grid grid-cols-[52px_minmax(0,1fr)] gap-3 border border-[hsl(var(--outline-variant)/0.14)] bg-[linear-gradient(180deg,hsl(var(--surface-base)/0.46),hsl(var(--background-strong)/0.78))] p-3"
                      >
                        <div className="paper-strip flex h-12 w-12 items-center justify-center text-lg font-bold uppercase">
                          {getInitials(entry.name)}
                        </div>
                        <div>
                          <p className="font-heading text-lg text-foreground">{entry.name}</p>
                          <p className="text-sm text-muted-foreground">{entry.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <p className="section-kicker">Legendas do atlas</p>
                    <div className="grid gap-3">
                      {atlasSignals.slice(0, 3).map((signal) => (
                        <div key={signal.title} className="flex gap-3">
                          <div className="mt-1 h-2.5 w-2.5 shrink-0 bg-info shadow-[0_0_18px_hsl(var(--info)/0.5)]" />
                          <div>
                            <p className="font-heading text-base text-foreground">{signal.title}</p>
                            <p className="text-sm leading-6 text-muted-foreground">
                              {signal.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="container -mt-10 relative z-10">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <Card variant="panel">
            <CardContent className="grid gap-6 p-6 md:p-8 lg:grid-cols-[minmax(0,1fr)_260px]">
              <div className="space-y-5">
                <div>
                  <p className="section-kicker">Composicao assimetrica</p>
                  <h2 className="mt-2 font-display text-4xl text-brand-gradient">
                    Hero cinematografico, atlas vivo e ficha no mesmo idioma visual.
                  </h2>
                </div>
                <p className="max-w-2xl text-base leading-8 text-foreground/88">
                  As referencias pediam peso, atmosfera e leitura de "AAA interface". A nova
                  entrada do site cruza molduras de metal, brilho arcano e fundos de mapa para
                  transformar navegacao em worldbuilding.
                </p>

                <div className="grid gap-3 md:grid-cols-2">
                  <DataSection
                    label="North star"
                    value="Digital Reliquary"
                    variant="quiet"
                    tone="info"
                  />
                  <DataSection
                    label="Tipografia"
                    value="Newsreader + Manrope"
                    variant="quiet"
                  />
                </div>
              </div>

              <div
                className="min-h-[240px] border border-[hsl(var(--outline-variant)/0.16)] bg-cover bg-center"
                style={{
                  backgroundImage:
                    "linear-gradient(180deg, rgba(10,14,20,0.1), rgba(10,14,20,0.92)), url('/maps/witcher-mundi.png')",
                }}
              >
                <div className="flex h-full flex-col justify-end p-5">
                  <Badge variant="outline" className="w-fit">
                    Atlas overview
                  </Badge>
                  <p className="mt-3 font-display text-3xl text-brand-gradient">
                    O mapa deixa de ser apendice e vira palco.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {featureCards.slice(0, 2).map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <Card variant={index === 0 ? "elevated" : "panel"} className="h-full">
                  <CardContent className="flex h-full gap-4 p-6">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-[hsl(var(--brand)/0.18)] bg-[linear-gradient(180deg,hsl(var(--surface-strong)/0.88),hsl(var(--surface-base)/0.96))] text-primary">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-3">
                      <p className="section-kicker">{feature.eyebrow}</p>
                      <h3 className="font-heading text-xl text-foreground">{feature.title}</h3>
                      <p className="text-sm leading-7 text-muted-foreground">
                        {feature.description}
                      </p>
                      <Button asChild variant="ghost" size="sm" className="pl-0">
                        <Link to={feature.path}>Abrir modulo</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="container">
        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <Card variant="panel">
            <CardContent className="space-y-6 p-6 md:p-8">
              <div>
                <p className="section-kicker">Explore the realm</p>
                <h2 className="mt-2 font-display text-4xl text-brand-gradient">
                  Atlas forjado como mesa de estrategia.
                </h2>
              </div>

              <p className="text-sm leading-7 text-muted-foreground md:text-base">
                Em vez de tratar mapa como imagem isolada, o design o assume como centro de
                navegacao. O brilho mistico indica pontos de interesse, enquanto cada camada do
                atlas parece talhada em pedra e metal.
              </p>

              <div className="grid gap-3">
                {atlasSignals.map((signal, index) => (
                  <DataSection
                    key={signal.title}
                    label={`Regiao ${String(index + 1).padStart(2, "0")}`}
                    value={signal.title}
                    variant="quiet"
                    tone={index % 2 === 0 ? "info" : "neutral"}
                  >
                    <p className="text-sm leading-6 text-muted-foreground">{signal.description}</p>
                  </DataSection>
                ))}
              </div>

              <Button asChild variant="outline" className="w-full">
                <Link to="/mapa">Abrir atlas completo</Link>
              </Button>
            </CardContent>
          </Card>

          <ContinentMap />
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,hsl(var(--surface-base)/0.4),transparent)]">
        <div className="container py-14 md:py-20">
          <div className="mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="section-kicker">Arquivo em movimento</p>
              <h2 className="mt-2 font-display text-4xl text-brand-gradient">
                Publicacoes que parecem achados de campanha, nao cards genericos.
              </h2>
            </div>
            <Badge variant="secondary">
              <BookOpenText className="mr-2 h-3.5 w-3.5" />
              {publishedPublications.length} entradas publicadas
            </Badge>
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.2fr)]">
            <Card variant="elevated" className="h-full">
              <CardContent className="space-y-6 p-6 md:p-8">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="section-kicker">Capitulo dominante</p>
                    <h3 className="mt-2 font-display text-3xl text-foreground">
                      {leadPublication ? leadPublication.title : "Nenhum registro ainda"}
                    </h3>
                  </div>
                  <div className="paper-strip px-4 py-3 text-center">
                    <p className="text-[10px] uppercase tracking-[0.22em]">capitulo</p>
                    <p className="font-display text-3xl">
                      {leadPublication
                        ? String(leadPublication.chapterNumber).padStart(2, "0")
                        : "00"}
                    </p>
                  </div>
                </div>

                <p className="text-base leading-8 text-foreground/88">
                  {leadPublication
                    ? leadPublication.excerpt
                    : "As novas publicacoes do mestre aparecerao aqui assim que forem liberadas."}
                </p>

                <div className="grid gap-3 md:grid-cols-2">
                  <DataSection
                    label="Tom"
                    value="Estrada, pressao e fronteira"
                    variant="quiet"
                  />
                  <DataSection
                    label="Companhia"
                    value={CURRENT_PROTAGONISTS.join(" / ")}
                    variant="quiet"
                    tone="info"
                  />
                </div>

                {leadPublication ? (
                  <div className="flex flex-wrap gap-3">
                    <Badge variant="outline">{publicationLabels[leadPublication.kind]}</Badge>
                    <Badge variant="secondary">{leadPublication.location}</Badge>
                    <Badge variant="info">
                      atualizado em{" "}
                      {new Date(leadPublication.updatedAt).toLocaleDateString("pt-BR")}
                    </Badge>
                  </div>
                ) : null}

                <Button asChild>
                  <Link to="/campanha">Abrir o arquivo da campanha</Link>
                </Button>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              {secondaryPublications.length > 0 ? (
                secondaryPublications.map((publication, index) => (
                  <motion.div
                    key={publication.id}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08 }}
                  >
                    <Card variant="panel" className="h-full">
                      <CardContent className="space-y-4 p-6">
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">{publicationLabels[publication.kind]}</Badge>
                          <Badge variant="secondary">{publication.location}</Badge>
                        </div>
                        <div>
                          <h3 className="font-heading text-xl text-foreground">
                            {publication.title}
                          </h3>
                          <p className="mt-3 text-sm leading-7 text-muted-foreground">
                            {publication.excerpt}
                          </p>
                        </div>
                        <div className="grid gap-3">
                          <DataSection
                            label="Protagonistas"
                            value={publication.protagonists.join(" / ")}
                            variant="quiet"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <>
                  {featureCards.slice(2).map((feature) => (
                    <Card key={feature.title} variant="panel" className="h-full">
                      <CardContent className="space-y-4 p-6">
                        <div className="flex h-12 w-12 items-center justify-center border border-[hsl(var(--brand)/0.18)] bg-[linear-gradient(180deg,hsl(var(--surface-strong)/0.88),hsl(var(--surface-base)/0.96))] text-primary">
                          <feature.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="section-kicker">{feature.eyebrow}</p>
                          <h3 className="mt-2 font-heading text-xl text-foreground">
                            {feature.title}
                          </h3>
                          <p className="mt-3 text-sm leading-7 text-muted-foreground">
                            {feature.description}
                          </p>
                        </div>
                        <Button asChild variant="outline">
                          <Link to={feature.path}>Abrir modulo</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="container">
        <Card variant="elevated">
          <CardContent className="grid gap-8 p-6 md:p-8 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-center">
            <div className="space-y-5">
              <p className="section-kicker">Sigilos da campanha</p>
              <h2 className="font-display text-4xl text-brand-gradient">
                Tudo pronto para alternar entre leitura, jogo e descoberta sem quebrar o clima.
              </h2>
              <p className="max-w-2xl text-base leading-8 text-foreground/88">
                O redesign usa a mesma familia visual para home, universo, campanha, comunidade,
                conta e componentes-base. Assim o site inteiro passa a parecer uma obra so.
              </p>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="border border-[hsl(var(--outline-variant)/0.16)] bg-[linear-gradient(180deg,hsl(var(--surface-base)/0.48),hsl(var(--background-strong)/0.72))] p-4">
                  <Compass className="h-5 w-5 text-info" />
                  <p className="mt-3 font-heading text-xl text-foreground">Atlas</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Exploracao com leitura geopolitica e mistica.
                  </p>
                </div>
                <div className="border border-[hsl(var(--outline-variant)/0.16)] bg-[linear-gradient(180deg,hsl(var(--surface-base)/0.48),hsl(var(--background-strong)/0.72))] p-4">
                  <Users className="h-5 w-5 text-primary" />
                  <p className="mt-3 font-heading text-xl text-foreground">Companhia</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Personagens, conta e biblioteca no mesmo fluxo.
                  </p>
                </div>
                <div className="border border-[hsl(var(--outline-variant)/0.16)] bg-[linear-gradient(180deg,hsl(var(--surface-base)/0.48),hsl(var(--background-strong)/0.72))] p-4">
                  <Sparkles className="h-5 w-5 text-info" />
                  <p className="mt-3 font-heading text-xl text-foreground">Atmosfera</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Ouro fosco, sangue, pedra e brilho arcano.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <DataSection label="Proximo passo" value="Abrir a estrada" tone="info">
                <p className="text-sm leading-6 text-muted-foreground">
                  Entre pelo atlas para explorar o mundo ou pelo arquivo para seguir a campanha.
                </p>
              </DataSection>

              <div className="grid gap-3">
                <Button asChild size="lg">
                  <Link to="/mapa">Entrar pelo atlas</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/universo">Abrir a enciclopedia</Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link to="/criacao">Preparar ficha</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
