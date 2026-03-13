import { useState } from "react";
import { motion } from "framer-motion";
import { BookMarked, Dices, ScrollText, Shield, Swords, WandSparkles } from "lucide-react";
import { toast } from "sonner";

import CharacterCreator, { type CharacterData } from "@/components/rpg/CharacterCreator";
import CharacterSheet from "@/components/rpg/CharacterSheet";
import DiceRoller from "@/components/rpg/DiceRoller";
import GameMasterPanel from "@/components/rpg/GameMasterPanel";
import InventoryPanel from "@/components/rpg/InventoryPanel";
import SpellBook from "@/components/rpg/SpellBook";
import VirtualTabletop from "@/components/rpg/VirtualTabletop";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataSection } from "@/components/ui/data-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { buildCharacterFromCreator, buildDemoCharacter, type CharacterRow } from "@/lib/rpg-ui";

export default function PlayPage() {
  const [activeCharacter, setActiveCharacter] = useState<CharacterRow>(() => buildDemoCharacter());
  const [section, setSection] = useState("ficha");

  const handleCreateCharacter = (draft: CharacterData) => {
    const nextCharacter = buildCharacterFromCreator({
      ...draft,
      race: draft.race as CharacterRow["race"],
      class: draft.class as CharacterRow["class"],
    });

    setActiveCharacter(nextCharacter);
    setSection("ficha");
    toast.success("Ficha criada e pronta para a mesa.");
  };

  return (
    <div className="container py-20">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="outline">Noir Chronicle</Badge>
          <h1 className="mt-4 font-display text-4xl text-gold-gradient md:text-5xl">
            Hub de jogo e ficha narrativa
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
            Biblioteca base, estados semanticos e primeira pagina rolloutados em uma experiencia unica para criar, revisar e levar sua ficha para a mesa.
          </p>
        </div>

        <Alert variant="info">
          <Shield />
          <AlertTitle>Implementacao segura de identidade</AlertTitle>
          <AlertDescription>
            Esta interface usa direcao dark fantasy original, sem assets ou referencias diretas a IPs de terceiros. Pergaminho entra apenas como detalhe de superficie.
          </AlertDescription>
        </Alert>

        <Tabs value={section} onValueChange={setSection} className="space-y-6">
          <TabsList className="grid h-auto w-full grid-cols-2 gap-2 md:grid-cols-4">
            <TabsTrigger value="ficha" className="font-heading uppercase tracking-[0.18em]">
              <BookMarked className="mr-2 h-4 w-4" />
              Ficha
            </TabsTrigger>
            <TabsTrigger value="criacao" className="font-heading uppercase tracking-[0.18em]">
              <WandSparkles className="mr-2 h-4 w-4" />
              Criacao
            </TabsTrigger>
            <TabsTrigger value="mesa" className="font-heading uppercase tracking-[0.18em]">
              <Swords className="mr-2 h-4 w-4" />
              Mesa
            </TabsTrigger>
            <TabsTrigger value="mestre" className="font-heading uppercase tracking-[0.18em]">
              <ScrollText className="mr-2 h-4 w-4" />
              Mestre
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ficha" className="mt-0 space-y-6">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
              <CharacterSheet character={activeCharacter} />

              <div className="space-y-4">
                <Card variant="panel">
                  <CardHeader>
                    <CardTitle className="text-xl">Resumo rapido</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    <DataSection label="Raca" value={activeCharacter.race} variant="quiet" />
                    <DataSection label="Classe" value={activeCharacter.class} variant="quiet" />
                    <DataSection label="Nivel" value={activeCharacter.level} variant="quiet" />
                    <DataSection label="Ouro" value={activeCharacter.gold} variant="quiet" />
                  </CardContent>
                </Card>

                <Card variant="panel">
                  <CardHeader>
                    <CardTitle className="text-xl">Mesa pronta</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0 text-sm text-muted-foreground">
                    <p>
                      A ficha atual esta em modo demo/local. Crie uma nova personagem para atualizar este painel e levar os dados para a mesa da sessao.
                    </p>
                    <p>
                      Os componentes abaixo exercitam o sistema base do plano: dados, inventario e magias com o novo tema.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Tabs defaultValue="dados" className="space-y-4">
              <TabsList className="grid h-auto w-full grid-cols-3">
                <TabsTrigger value="dados" className="font-heading uppercase tracking-[0.18em]">
                  <Dices className="mr-2 h-4 w-4" />
                  Dados
                </TabsTrigger>
                <TabsTrigger value="inventario" className="font-heading uppercase tracking-[0.18em]">
                  <ScrollText className="mr-2 h-4 w-4" />
                  Inventario
                </TabsTrigger>
                <TabsTrigger value="magias" className="font-heading uppercase tracking-[0.18em]">
                  <WandSparkles className="mr-2 h-4 w-4" />
                  Magias
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dados" className="mt-0">
                <Card variant="panel">
                  <CardContent className="p-6">
                    <DiceRoller />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="inventario" className="mt-0">
                <Card variant="panel">
                  <CardContent className="p-6">
                    <InventoryPanel />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="magias" className="mt-0">
                <Card variant="panel">
                  <CardContent className="p-6">
                    <SpellBook />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="criacao" className="mt-0">
            <CharacterCreator onSave={handleCreateCharacter} />
          </TabsContent>

          <TabsContent value="mesa" className="mt-0">
            <VirtualTabletop />
          </TabsContent>

          <TabsContent value="mestre" className="mt-0">
            <GameMasterPanel />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
