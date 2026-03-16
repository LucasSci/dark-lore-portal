import { motion } from "framer-motion";

import GameMasterPanel from "@/components/rpg/GameMasterPanel";
import { Badge } from "@/components/ui/badge";

export default function MestrePage() {
  return (
    <div className="container py-12 sm:py-20">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 sm:space-y-8">
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="outline">Painel do Mestre</Badge>
          <h1 className="mt-3 font-display text-3xl text-gold-gradient sm:mt-4 sm:text-4xl md:text-5xl">
            Direcao da Campanha
          </h1>
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:mt-4 sm:text-base sm:leading-7">
            Ferramentas de narrativa, combate, NPCs e publicacoes para manter o continente vivo.
          </p>
        </div>
        <GameMasterPanel />
      </motion.div>
    </div>
  );
}
