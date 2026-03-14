import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import GameMasterPanel from "@/components/rpg/GameMasterPanel";

export default function MestrePage() {
  return (
    <div className="container py-20">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="outline">Painel do Mestre</Badge>
          <h1 className="mt-4 font-display text-4xl text-gold-gradient md:text-5xl">
            Game Master
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
            Ferramentas de narrativa e gestão de sessão para o mestre da campanha.
          </p>
        </div>
        <GameMasterPanel />
      </motion.div>
    </div>
  );
}
