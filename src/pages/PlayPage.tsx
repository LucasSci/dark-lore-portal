import {
  BookMarked,
  Clapperboard,
  Compass,
  Map,
  ScrollText,
  Sparkles,
  Sword,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  ActionStrip,
  MetricCard,
  ModuleCard,
  PanelCard,
  SectionHeader,
  SidebarModule,
  StatusBanner,
} from "@/components/product/ProductShell";
import { archiveBrand } from "@/lib/archive-reference";
import { usePortalShellMode } from "@/lib/portal-state";
import { getTabletopLoreCompendium } from "@/lib/tabletop-lore";
import {
  DEFAULT_WITCHER_CAMPAIGN_ID,
  getWitcherSceneSeed,
  WITCHER_CAMPAIGNS,
} from "@/features/witcher-system";

const moduleCards = [
  {
    title: "Mesa de sessao",
    description: "Abra o palco tatico, organize visao, token, iniciativa e cadencia da cena.",
    path: `/mesa/${DEFAULT_WITCHER_CAMPAIGN_ID}`,
    cta: "Entrar na mesa",
    icon: Map,
    meta: "Playfield protegido",
  },
  {
    title: "Oraculo",
    description: "Desca para leitura ritual, consulta em voz alta e resposta contextual da campanha.",
    path: "/oraculo",
    cta: "Abrir Luna",
    icon: Sparkles,
    meta: "Leitura e resposta",
  },
  {
    title: "Ficha",
    description: "Revise atributos, carga, sinais e o estado da companhia antes da proxima batida.",
    path: "/ficha",
    cta: "Abrir ficha",
    icon: BookMarked,
    meta: "Dossie jogavel",
  },
  {
    title: "Painel do mestre",
    description: "Controle encontros, ameacas, publicacoes e o fio operacional da sessao.",
    path: "/mestre",
    cta: "Ir para o painel",
    icon: ScrollText,
    meta: "Comando da campanha",
  },
  {
    title: "Story Engine",
    description: "Transforme contratos e sementes em elenco, cenas e storyboard visual de apoio.",
    path: `/story-engine?campaignId=${DEFAULT_WITCHER_CAMPAIGN_ID}&sceneId=estrada-velha`,
    cta: "Abrir workspace",
    icon: Clapperboard,
    meta: "Producao vinculada",
  },
] as const;

const defaultCampaign =
  WITCHER_CAMPAIGNS.find((campaign) => campaign.id === DEFAULT_WITCHER_CAMPAIGN_ID) ??
  WITCHER_CAMPAIGNS[0];
const defaultScene = getWitcherSceneSeed(defaultCampaign.defaultSceneId);
const loreCompendium = getTabletopLoreCompendium();

export default function PlayPage() {
  usePortalShellMode("editorial", "interactive");

  return (
    <div className="session-page space-y-6">
      <section className="session-shell-hero">
        <SectionHeader
          kicker="Session Shell / Jogar"
          title="O centro operacional do Arquivo."
          description={
            <>
              <p>
                Mesa, mestre, ficha e Story Engine agora entram no mesmo eixo de produto. Esta
                camada deixa de ser uma colecao de paginas e passa a operar como suite de sessao.
              </p>
              <p>
                O objetivo aqui e abrir rapido, entender o estado da campanha e saltar para a
                ferramenta certa sem perder o contexto do mundo.
              </p>
            </>
          }
          aside={
            <>
              <span className="session-topbar-meta">{archiveBrand.title}</span>
              <span className="session-topbar-meta">{defaultCampaign.stageLabel}</span>
              <span className="session-topbar-meta">Foundry utilitario</span>
            </>
          }
        />

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
          <div className="space-y-5">
            <ActionStrip>
              <Link to={`/mesa/${defaultCampaign.id}`} className="session-shell-action">
                <Map className="h-4 w-4" />
                Abrir mesa ativa
              </Link>
              <Link to="/mestre" className="session-shell-action">
                <ScrollText className="h-4 w-4" />
                Painel do mestre
              </Link>
              <Link
                to={`/story-engine?campaignId=${defaultCampaign.id}&sceneId=${defaultCampaign.defaultSceneId}`}
                className="session-shell-action"
              >
                <Clapperboard className="h-4 w-4" />
                Story Engine
              </Link>
              <Link to="/oraculo" className="session-shell-action">
                <Sparkles className="h-4 w-4" />
                Oraculo
              </Link>
            </ActionStrip>

            <div className="grid gap-4 md:grid-cols-3">
              <MetricCard
                label="Campanha ativa"
                value={defaultCampaign.title}
                detail={defaultCampaign.summary}
              />
              <MetricCard
                label="Cena pronta"
                value={defaultScene.name}
                detail={defaultScene.briefing}
              />
              <MetricCard
                label="Companhia"
                value={`${defaultCampaign.players.length} agentes`}
                detail={defaultCampaign.players.map((player) => player.name).join(" · ")}
              />
            </div>

            <StatusBanner title="Ritmo recomendado" tone="info">
              Comece pela mesa quando a sessao ja pedir posicionamento. Desca para o Story Engine
              quando a campanha precisar preparar elenco e quadros. Use o Oraculo para leitura,
              memoria e reacao em cena.
            </StatusBanner>
          </div>

          <div className="session-shell-sidebar">
            <SidebarModule
              title="Sessao em curso"
              description="Estado rapido da entrada principal da campanha."
            >
              <div className="session-shell-list">
                <div className="session-shell-list-item">
                  <p className="session-shell-list-item-title">Narrador</p>
                  <p className="session-shell-list-item-copy">{defaultCampaign.gmLabel}</p>
                </div>
                <div className="session-shell-list-item">
                  <p className="session-shell-list-item-title">Atmosfera</p>
                  <p className="session-shell-list-item-copy">{defaultCampaign.atmosphere}</p>
                </div>
                <div className="session-shell-list-item">
                  <p className="session-shell-list-item-title">Pressao dramatica</p>
                  <p className="session-shell-list-item-copy">
                    {defaultScene.threatLabels.join(" · ")}
                  </p>
                </div>
              </div>
            </SidebarModule>

            <SidebarModule
              title="Fluxo da suite"
              description="A mesma linguagem de produto agora conduz preparar, narrar, resolver e registrar."
            >
              <div className="session-shell-list">
                {[
                  "1. Jogar: escolher campanha e entrar no modulo certo.",
                  "2. Mesa: posicionar cena, iniciativa e presenca.",
                  "3. Mestre: controlar ameaças e publicar ecos da sessao.",
                  "4. Story Engine: preparar apoio visual e storyboard.",
                ].map((step) => (
                  <div key={step} className="session-shell-list-item">
                    <p className="session-shell-list-item-copy">{step}</p>
                  </div>
                ))}
              </div>
            </SidebarModule>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-5">
        {moduleCards.map(({ title, description, path, cta, icon: Icon, meta }) => (
          <Link key={path} to={path}>
            <ModuleCard
              title={title}
              description={description}
              meta={meta}
              className="h-full"
            >
              <span className="session-shell-action">
                <Icon className="h-4 w-4" />
                {cta}
              </span>
            </ModuleCard>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_360px]">
        <PanelCard
          title="Campanhas prontas para abrir"
          description="Cada campanha nasce com sua propria rota de mesa, cena padrao e links de suporte para continuar a sessao sem preparo extra."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            {WITCHER_CAMPAIGNS.map((campaign) => {
              const scene = getWitcherSceneSeed(campaign.defaultSceneId);

              return (
                <article key={campaign.id} className="tool-list-item p-4">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="session-topbar-meta">{campaign.stageLabel}</span>
                      <span className="session-topbar-meta">{campaign.players.length} agentes</span>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-display text-2xl text-foreground">{campaign.title}</h3>
                      <p className="text-sm leading-7 text-foreground/72">{campaign.summary}</p>
                    </div>
                    <div className="session-shell-list-item">
                      <p className="session-shell-list-item-title">Cena padrao</p>
                      <p className="session-shell-list-item-copy">
                        {scene.name}. {scene.briefing}
                      </p>
                    </div>
                    <ActionStrip>
                      <Link to={`/mesa/${campaign.id}`} className="session-shell-action">
                        <Sword className="h-4 w-4" />
                        Abrir mesa
                      </Link>
                      <Link
                        to={`/story-engine?campaignId=${campaign.id}&sceneId=${campaign.defaultSceneId}`}
                        className="session-shell-action"
                      >
                        <Clapperboard className="h-4 w-4" />
                        Story Engine
                      </Link>
                    </ActionStrip>
                  </div>
                </article>
              );
            })}
          </div>
        </PanelCard>

        <SidebarModule
          title="Pontes com o arquivo"
          description="As sementes continuam ligando atlas, manuscrito, dossie e mesa."
        >
          <div className="session-shell-list">
            {loreCompendium.sessionSeeds.slice(0, 4).map((seed) => (
              <div key={seed.slug} className="session-shell-list-item">
                <p className="session-shell-list-item-title">{seed.title}</p>
                <p className="session-shell-list-item-copy">{seed.summary}</p>
                <div className="flex flex-wrap gap-2">
                  <Link to={seed.dossierHref} className="session-shell-action">
                    <Compass className="h-4 w-4" />
                    Dossie
                  </Link>
                  <Link to={seed.chronicleHref} className="session-shell-action">
                    <ScrollText className="h-4 w-4" />
                    Manuscrito
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </SidebarModule>
      </section>
    </div>
  );
}
