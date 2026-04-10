import { BookMarked, Compass, Sparkles, Swords, Users } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type { WitcherCampaign, WitcherCampaignSceneSeed } from "../types";

const toneIconMap = {
  chronicle: BookMarked,
  atlas: Compass,
  dossier: Swords,
  oracle: Sparkles,
  sheet: Users,
  tool: Swords,
} as const;

interface WitcherCampaignBriefProps {
  campaign: WitcherCampaign;
  activeScene: WitcherCampaignSceneSeed;
  scenes: WitcherCampaignSceneSeed[];
  className?: string;
  compact?: boolean;
}

export default function WitcherCampaignBrief({
  campaign,
  activeScene,
  scenes,
  className,
  compact = false,
}: WitcherCampaignBriefProps) {
  return (
    <section className={cn("info-panel", compact ? "p-4" : "p-5 md:p-6", className)}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.2em] text-primary/78">
              {campaign.gmLabel} · {campaign.stageLabel}
            </p>
            <div className="space-y-2">
              <h2 className={cn("font-heading text-foreground", compact ? "text-xl" : "text-2xl")}>
                {campaign.title}
              </h2>
              <p className="text-sm leading-7 text-foreground/78">{campaign.summary}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-primary/30 text-primary">
              {campaign.players.length} jogadores
            </Badge>
            <Badge variant="outline" className="border-border/40 text-foreground/76">
              {campaign.atmosphere}
            </Badge>
          </div>
        </div>

        <div className={cn("grid gap-3", compact ? "lg:grid-cols-1" : "lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]")}>
          <div className="tool-stage-frame space-y-3 px-3 py-3">
            <p className="text-[11px] uppercase tracking-[0.2em] text-primary/78">Cena ativa</p>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-heading text-lg text-foreground">{activeScene.name}</h3>
                <Badge variant="outline" className="border-border/40 text-[10px] uppercase tracking-[0.14em]">
                  {activeScene.region}
                </Badge>
              </div>
              <p className="text-sm leading-7 text-foreground/78">{activeScene.briefing}</p>
              <p className="text-xs leading-6 text-muted-foreground">{activeScene.intro}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {activeScene.threatLabels.map((threat) => (
                <Badge
                  key={`${activeScene.id}-${threat}`}
                  variant="outline"
                  className="border-border/40 text-[10px] uppercase tracking-[0.14em]"
                >
                  {threat}
                </Badge>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {activeScene.supportLinks.map((link) => {
                const Icon = toneIconMap[link.tone ?? "tool"];

                return (
                  <Link
                    key={`${activeScene.id}-${link.href}`}
                    to={link.href}
                    className="dark-lore-button dark-lore-button-small dark-lore-button-ghost"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <div className="tool-stage-frame space-y-3 px-3 py-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-primary/78">Companhia</p>
              <div className="grid gap-2">
                {campaign.players.map((player) => (
                  <div key={player.id} className="tool-list-item flex items-center justify-between gap-3 px-3 py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{player.name}</p>
                      <p className="text-xs leading-5 text-foreground/74">{player.role}</p>
                    </div>
                    {player.sheetHref ? (
                      <Link to={player.sheetHref} className="text-[11px] uppercase tracking-[0.14em] text-primary/78 transition-colors hover:text-primary">
                        Ficha
                      </Link>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            <div className="tool-stage-frame space-y-3 px-3 py-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-primary/78">Travessias da campanha</p>
              <div className="flex flex-wrap gap-2">
                {scenes.map((scene) => (
                  <Link
                    key={scene.id}
                    to={`/mesa/${campaign.id}/${scene.id}`}
                    className={cn(
                      "dark-lore-chip",
                      scene.id === activeScene.id ? "is-active" : "is-muted",
                    )}
                  >
                    {scene.name}
                  </Link>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {campaign.supportLinks.map((link) => {
                  const Icon = toneIconMap[link.tone ?? "tool"];

                  return (
                    <Link
                      key={`${campaign.id}-${link.href}`}
                      to={link.href}
                      className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-foreground/68 transition-colors hover:text-primary"
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
