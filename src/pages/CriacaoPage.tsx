import { motion } from "framer-motion";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import CharacterCreator, { type CharacterData } from "@/components/rpg/CharacterCreator";
import { buildCharacterFromCreator, type CharacterRow } from "@/lib/rpg-ui";

export default function CriacaoPage() {
  const handleCreateCharacter = (draft: CharacterData) => {
    const character = buildCharacterFromCreator({
      ...draft,
      race: draft.race as CharacterRow["race"],
      class: draft.class as CharacterRow["class"],
    });
    // TODO: persist to database
    toast.success(`${character.name} criado com sucesso!`);
  };

  return (
    <div className="container py-20">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="outline">Criação</Badge>
          <h1 className="mt-4 font-display text-4xl text-gold-gradient md:text-5xl">
            Criar Personagem
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
            Monte seu personagem escolhendo raça, classe, atributos e história.
          </p>
        </div>
        <CharacterCreator onSave={handleCreateCharacter} />
      </motion.div>
    </div>
  );
}
