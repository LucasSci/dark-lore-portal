import { motion } from "framer-motion";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import CharacterCreator, { type CharacterData } from "@/components/rpg/CharacterCreator";
import { createCharacterBundle } from "@/lib/sheets/persistence";
import type { CharacterRow } from "@/lib/rpg-ui";

export default function CriacaoPage() {
  const navigate = useNavigate();

  const handleCreateCharacter = async (draft: CharacterData) => {
    const bundle = await createCharacterBundle({
      ...draft,
      race: draft.race as CharacterRow["race"],
      class: draft.class as CharacterRow["class"],
    });

    toast.success(
      bundle.source === "remote"
        ? `${bundle.character.name} criado e salvo no grimorio da conta.`
        : `${bundle.character.name} criado com fallback local.`,
    );
    navigate(`/ficha?character=${bundle.character.id}`);
  };

  return (
    <div className="container py-12 sm:py-20">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 sm:space-y-8">
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="outline">Criacao Persistida</Badge>
          <h1 className="mt-3 font-display text-3xl text-gold-gradient sm:mt-4 sm:text-4xl md:text-5xl">
            Criar Personagem
          </h1>
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:mt-4 sm:text-base sm:leading-7">
            Monte seu personagem escolhendo raca, classe, atributos e historia.
          </p>
        </div>
        <CharacterCreator onSave={(data) => void handleCreateCharacter(data)} />
      </motion.div>
    </div>
  );
}
