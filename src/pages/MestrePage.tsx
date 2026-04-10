import { motion } from "framer-motion";
import { Crown, ScrollText, Sparkles, Sword } from "lucide-react";
import { Link } from "react-router-dom";

import {
  ActionStrip,
  MetricCard,
  PanelCard,
  SectionHeader,
  SidebarModule,
  StatusBanner,
} from "@/components/product/ProductShell";
import GameMasterPanel from "@/components/rpg/GameMasterPanel";
import { getTabletopLoreCompendium } from "@/lib/tabletop-lore";
import { usePortalShellMode } from "@/lib/portal-state";
import { DEFAULT_WITCHER_CAMPAIGN_ID, getWitcherCampaignById } from "@/features/witcher-system";

const activeCampaign = getWitcherCampaignById(DEFAULT_WITCHER_CAMPAIGN_ID);
const loreCompendium = getTabletopLoreCompendium();

export default function MestrePage() {
  usePortalShellMode("editorial", "interactive");

  return (
    <div className="session-page">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <section className="session-shell-hero">
          <SectionHeader
            kicker="Command Deck / Mestre"
            title="Comando tatico, editorial e logistico da campanha."
            description={
              <>
                <p>
                  O painel do mestre agora funciona como console real: abrir cena, conduzir
                  combate, puxar ameacas, registrar publicacoes e disparar preparacao visual sem
                  saltar entre linguagens diferentes.
                </p>
                <p>
                  Aqui o arquivo nao e uma decoracao. Ele entra como infraestrutura de sessao.
                </p>
              </>
            }
            aside={
              <>
                <span className="session-topbar-meta">{activeCampaign.title}</span>
                <span className="session-topbar-meta">{activeCampaign.stageLabel}</span>
                <span className="session-topbar-meta">Mestre ativo</span>
              </>
            }
          />

          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_360px]">
            <div className="space-y-5">
              <ActionStrip>
                <Link to={`/mesa/${activeCampaign.id}`} className="session-shell-action">
                  <Sword className="h-4 w-4" />
                  Abrir mesa
                </Link>
                <Link
                  to={`/story-engine?campaignId=${activeCampaign.id}&sceneId=${activeCampaign.defaultSceneId}`}
                  className="session-shell-action"
                >
                  <ScrollText className="h-4 w-4" />
                  Story Engine
                </Link>
                <Link to="/oraculo" className="session-shell-action">
                  <Sparkles className="h-4 w-4" />
                  Consultar oraculo
                </Link>
              </ActionStrip>

              <div className="grid gap-4 md:grid-cols-3">
                <MetricCard
                  label="Campanha"
                  value={activeCampaign.title}
                  detail={activeCampaign.summary}
                />
                <MetricCard
                  label="Companhia"
                  value={`${activeCampaign.players.length} agentes`}
                  detail={activeCampaign.players.map((player) => player.role).join(" · ")}
                />
                <MetricCard
                  label="Suporte de lore"
                  value={`${loreCompendium.sessionSeeds.length} sementes`}
                  detail="Dossie, cronica e atlas prontos para abrir em apoio ao mestre."
                />
              </div>

              <StatusBanner title="Prioridade de uso" tone="warning">
                Use este painel para controlar o ritmo da campanha e deixar a mesa focada na cena.
                O palco tatico continua na mesa; o comando e a publicacao ficam aqui.
              </StatusBanner>
            </div>

            <div className="session-shell-sidebar">
              <SidebarModule
                title="Leituras do comando"
                description="Os tres eixos que o mestre controla sem sair da mesma shell."
              >
                <div className="session-shell-list">
                  <div className="session-shell-list-item">
                    <p className="session-shell-list-item-title">Sessao</p>
                    <p className="session-shell-list-item-copy">
                      Abrir cena, escolher pressao e empurrar o grupo para a proxima batida.
                    </p>
                  </div>
                  <div className="session-shell-list-item">
                    <p className="session-shell-list-item-title">Combate</p>
                    <p className="session-shell-list-item-copy">
                      Acompanhar tracker, ameacas e o pulso do encontro sem cobrir o playfield.
                    </p>
                  </div>
                  <div className="session-shell-list-item">
                    <p className="session-shell-list-item-title">Publicacao</p>
                    <p className="session-shell-list-item-copy">
                      Registrar ecos da campanha e manter o arquivo vivo entre sessoes.
                    </p>
                  </div>
                </div>
              </SidebarModule>

              <SidebarModule
                title="Atalhos do mestre"
                description="Pontes rapidas entre comando, lore e sessao ativa."
              >
                <div className="session-shell-list">
                  {activeCampaign.supportLinks.map((link) => (
                    <div key={link.href} className="session-shell-list-item">
                      <p className="session-shell-list-item-title">{link.label}</p>
                      <Link to={link.href} className="session-shell-action w-fit">
                        <Crown className="h-4 w-4" />
                        Abrir rota
                      </Link>
                    </div>
                  ))}
                </div>
              </SidebarModule>
            </div>
          </div>
        </section>

        <PanelCard
          title="Console central"
          description="Abaixo ficam combate, NPCs, sessoes e publicacoes dentro do mesmo quadro operacional."
        >
          <GameMasterPanel />
        </PanelCard>
      </motion.div>
    </div>
  );
}
