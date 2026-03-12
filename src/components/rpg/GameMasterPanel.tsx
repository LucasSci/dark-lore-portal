import { useState } from "react";
import { motion } from "framer-motion";
import { Crown, Users, Sword, Plus, Play, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import CombatTracker from "./CombatTracker";

type GMTab = 'sessoes' | 'combate' | 'npcs';

interface NPC {
  id: string;
  name: string;
  hp: number;
  ac: number;
  notes: string;
}

export default function GameMasterPanel() {
  const [tab, setTab] = useState<GMTab>('sessoes');
  const [npcs, setNpcs] = useState<NPC[]>([]);
  const [newNpc, setNewNpc] = useState({ name: '', hp: 20, ac: 12, notes: '' });

  const addNpc = () => {
    if (!newNpc.name) return;
    setNpcs(prev => [...prev, { ...newNpc, id: `npc-${Date.now()}` }]);
    setNewNpc({ name: '', hp: 20, ac: 12, notes: '' });
  };

  const tabs: { key: GMTab; label: string; icon: React.ReactNode }[] = [
    { key: 'sessoes', label: 'Sessões', icon: <Crown className="w-4 h-4" /> },
    { key: 'combate', label: 'Combate', icon: <Sword className="w-4 h-4" /> },
    { key: 'npcs', label: 'NPCs', icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* GM Header */}
      <div className="p-4 bg-card-gradient border border-gold/20 flex items-center gap-3">
        <Crown className="w-6 h-6 text-primary" />
        <div>
          <h2 className="font-heading text-lg text-foreground">Painel do Mestre</h2>
          <p className="text-xs text-muted-foreground">Gerencie sessões, NPCs e combates</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 font-heading text-xs tracking-wider uppercase border-b-2 transition-colors ${tab === t.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Sessions */}
      {tab === 'sessoes' && (
        <div className="space-y-4">
          <div className="p-8 bg-card-gradient border border-border text-center">
            <Settings className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Crie uma conta e faça login para gerenciar suas sessões de RPG online.</p>
            <p className="text-xs text-muted-foreground mt-2">Convide jogadores, gerencie campanhas e controle encontros.</p>
          </div>
        </div>
      )}

      {/* Combat */}
      {tab === 'combate' && <CombatTracker />}

      {/* NPCs */}
      {tab === 'npcs' && (
        <div className="space-y-4">
          {/* Add NPC Form */}
          <div className="p-4 bg-card-gradient border border-border space-y-3">
            <h3 className="font-heading text-sm text-foreground">Criar NPC</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Input placeholder="Nome" value={newNpc.name} onChange={e => setNewNpc(p => ({ ...p, name: e.target.value }))} className="bg-secondary text-foreground" />
              <Input type="number" placeholder="HP" value={newNpc.hp} onChange={e => setNewNpc(p => ({ ...p, hp: +e.target.value }))} className="bg-secondary text-foreground" />
              <Input type="number" placeholder="CA" value={newNpc.ac} onChange={e => setNewNpc(p => ({ ...p, ac: +e.target.value }))} className="bg-secondary text-foreground" />
              <Button onClick={addNpc}><Plus className="w-4 h-4 mr-1" /> Adicionar</Button>
            </div>
            <Textarea placeholder="Notas sobre o NPC..." value={newNpc.notes} onChange={e => setNewNpc(p => ({ ...p, notes: e.target.value }))} className="bg-secondary text-foreground" />
          </div>

          {/* NPC List */}
          <div className="space-y-2">
            {npcs.map((npc, i) => (
              <motion.div
                key={npc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-4 bg-card-gradient border border-border"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-heading text-sm text-foreground">{npc.name}</h4>
                    <span className="text-xs text-muted-foreground">HP: {npc.hp} · CA: {npc.ac}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setNpcs(prev => prev.filter(n => n.id !== npc.id))} className="text-blood-light">
                    Remover
                  </Button>
                </div>
                {npc.notes && <p className="text-xs text-muted-foreground mt-2">{npc.notes}</p>}
              </motion.div>
            ))}
            {npcs.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">Nenhum NPC criado ainda.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
