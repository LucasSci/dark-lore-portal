import { motion } from "framer-motion";
import { Crown, ScrollText, Sword } from "lucide-react";
import { Link } from "react-router-dom";

import GameMasterPanel from "@/components/rpg/GameMasterPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataSection } from "@/components/ui/data-section";

export default function MestrePage() {
  return (
    <div className="container py-12 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12"
      >
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_340px]">
          <Card variant="elevated" className="overflow-hidden">
            <CardContent className="grid gap-8 p-6 md:p-8 xl:grid-cols-[minmax(0,1fr)_280px]">
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="outline">Painel do mestre</Badge>
                  <Badge variant="warning">Sessao, NPCs e publicacoes</Badge>
                </div>

                <div className="max-w-3xl space-y-4">
                <p className="section-kicker">Comando do mestre</p>
                  <h1 className="font-display text-5xl leading-[0.95] text-brand-gradient md:text-6xl">
                    Sessao, combate, NPCs e publicacoes reunidos no quadro de comando do mestre.
                  </h1>
                  <p className="text-base leading-8 text-foreground/88">
                    O mestre encontra aqui os rastros da campanha, os controles da cena e os
                    registros que precisam circular para o grupo.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <DataSection label="Eixos" value="Sessao, combate e arquivo" variant="quiet" />
                  <DataSection label="Uso" value="Controle rapido em mesa" variant="quiet" tone="info" />
                  <DataSection label="Saida" value="Campanha viva entre sessoes" variant="quiet" />
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button asChild size="sm">
                    <Link to="/story-engine">
                      <ScrollText className="h-4 w-4" />
                      Abrir Story Engine
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link to="/jogar">
                      <Sword className="h-4 w-4" />
                      Voltar ao hub
                    </Link>
                  </Button>
                </div>
              </div>

              <Card variant="panel">
                <CardContent className="space-y-4 p-5">
                  <div>
                    <p className="section-kicker">Modulos</p>
                    <h2 className="mt-2 font-heading text-2xl text-foreground">
                      Leituras do painel
                    </h2>
                  </div>

                  <DataSection
                    label="Sessao"
                    value="Pulso da campanha"
                    icon={<Crown className="h-4 w-4" />}
                    variant="quiet"
                  />
                  <DataSection
                    label="Combate"
                    value="Cena, trackers e pressao"
                    icon={<Sword className="h-4 w-4" />}
                    variant="quiet"
                  />
                  <DataSection
                    label="Publicacoes"
                    value="Arquivo para jogadores"
                    icon={<ScrollText className="h-4 w-4" />}
                    variant="quiet"
                    tone="warn"
                  />
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            <DataSection label="Papel" value="Direcao narrativa e controle tatico" tone="info" />
            <DataSection label="Tom" value="Comando de campanha em estilo editorial" />
          </div>
        </section>

        <GameMasterPanel />
      </motion.div>
    </div>
  );
}
