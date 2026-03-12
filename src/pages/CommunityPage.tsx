import { motion } from "framer-motion";
import { Users, MessageSquare, Calendar, Trophy } from "lucide-react";

const sections = [
  { icon: MessageSquare, title: "Fórum", desc: "Discussões sobre lore, estratégias, builds e teoria." },
  { icon: Calendar, title: "Eventos", desc: "Torneios, sessões especiais e encontros da comunidade." },
  { icon: Trophy, title: "Rankings", desc: "Os maiores heróis e mestres do Realm." },
  { icon: Users, title: "Guildas", desc: "Encontre ou crie uma guilda para jogar com aliados." },
];

const recentPosts = [
  { author: "Kaelith", title: "Melhor build para Ceifador Arcano?", replies: 23, time: "2h atrás" },
  { author: "Morgath", title: "Teoria: O Rei Cinzento ainda vive", replies: 47, time: "5h atrás" },
  { author: "Lirien", title: "Galeria de arte: meus personagens", replies: 12, time: "8h atrás" },
];

export default function CommunityPage() {
  return (
    <div className="container py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <Users className="w-10 h-10 text-primary mx-auto mb-4" />
        <h1 className="font-display text-3xl md:text-5xl text-gold-gradient mb-4">
          Comunidade
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Conecte-se com outros aventureiros, compartilhe histórias e forje alianças.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
        {sections.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="p-6 bg-card-gradient border border-gold/10 hover:border-gold/30 transition-all duration-300 cursor-pointer text-center shadow-card group"
          >
            <s.icon className="w-7 h-7 text-primary mx-auto mb-3 group-hover:text-gold-light transition-colors" />
            <h3 className="font-heading text-base text-foreground mb-1">{s.title}</h3>
            <p className="text-xs text-muted-foreground">{s.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent posts */}
      <div className="max-w-2xl mx-auto">
        <h2 className="font-heading text-xl text-foreground mb-6 ornament-line text-center">Discussões Recentes</h2>
        <div className="space-y-3 mt-10">
          {recentPosts.map((post, i) => (
            <motion.div
              key={post.title}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              className="p-4 bg-card-gradient border border-gold/10 hover:border-gold/20 transition-all cursor-pointer flex items-center justify-between"
            >
              <div>
                <h4 className="font-heading text-sm text-foreground">{post.title}</h4>
                <p className="text-xs text-muted-foreground">por {post.author} · {post.time}</p>
              </div>
              <span className="text-xs text-primary font-heading">{post.replies} respostas</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
