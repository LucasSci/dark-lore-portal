import { motion } from "framer-motion";
import { Sword, Users, Dice6, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";

const playOptions = [
  {
    icon: UserPlus,
    title: "Criar Personagem",
    desc: "Escolha raça, classe, atributos e história de fundo para seu herói.",
    action: "Começar",
  },
  {
    icon: Users,
    title: "Encontrar Sessão",
    desc: "Junte-se a uma campanha multiplayer com outros jogadores.",
    action: "Buscar",
  },
  {
    icon: Sword,
    title: "Combate Rápido",
    desc: "Teste suas habilidades em um combate por turnos contra criaturas.",
    action: "Lutar",
  },
  {
    icon: Dice6,
    title: "Rolar Dados",
    desc: "Gerador de dados d4, d6, d8, d10, d12 e d20 com animação.",
    action: "Rolar",
  },
];

export default function PlayPage() {
  return (
    <div className="container py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <Sword className="w-10 h-10 text-primary mx-auto mb-4" />
        <h1 className="font-display text-3xl md:text-5xl text-gold-gradient mb-4">
          Jogar
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Crie personagens, encontre sessões e viva aventuras no Realm of Shadows.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {playOptions.map((opt, i) => (
          <motion.div
            key={opt.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 bg-card-gradient border border-gold/10 hover:border-gold/30 transition-all duration-300 shadow-card group cursor-pointer"
          >
            <opt.icon className="w-8 h-8 text-primary mb-4 group-hover:text-gold-light transition-colors" />
            <h3 className="font-heading text-xl text-foreground mb-2">{opt.title}</h3>
            <p className="text-sm text-muted-foreground mb-6">{opt.desc}</p>
            <span className="font-heading text-xs tracking-[0.15em] uppercase text-primary border-b border-primary/30 pb-0.5 group-hover:border-primary transition-colors">
              {opt.action} →
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
