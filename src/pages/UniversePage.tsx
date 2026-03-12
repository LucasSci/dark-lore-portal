import { motion } from "framer-motion";
import { Map, Crown, Skull, BookText, Scroll } from "lucide-react";

const loreCategories = [
  { icon: Map, title: "Reinos & Terras", desc: "Explore as regiões do mundo: dos desertos de Ashkara às tundras de Nordheim.", count: 12 },
  { icon: Crown, title: "Facções & Ordens", desc: "Conheça as organizações que disputam o poder no Realm.", count: 8 },
  { icon: Skull, title: "Bestiário", desc: "Criaturas, demônios e aberrações que espreitam nas sombras.", count: 45 },
  { icon: BookText, title: "História & Eras", desc: "Das Eras Primordiais à Grande Ruína: a cronologia completa.", count: 5 },
  { icon: Scroll, title: "Magia & Runas", desc: "Os sistemas arcanos, escolas de magia e artefatos lendários.", count: 20 },
];

export default function UniversePage() {
  return (
    <div className="container py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <Map className="w-10 h-10 text-primary mx-auto mb-4" />
        <h1 className="font-display text-3xl md:text-5xl text-gold-gradient mb-4">
          O Universo
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Mergulhe no lore completo do Realm of Shadows. Cada detalhe foi forjado para criar um mundo vivo.
        </p>
      </motion.div>

      <div className="max-w-3xl mx-auto space-y-4">
        {loreCategories.map((cat, i) => (
          <motion.div
            key={cat.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="group p-6 bg-card-gradient border border-gold/10 hover:border-gold/30 transition-all duration-300 cursor-pointer flex items-center gap-5 shadow-card"
          >
            <cat.icon className="w-8 h-8 text-primary/60 group-hover:text-primary transition-colors flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-heading text-lg text-foreground">{cat.title}</h3>
              <p className="text-sm text-muted-foreground">{cat.desc}</p>
            </div>
            <span className="font-heading text-xs text-muted-foreground">{cat.count} entradas</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
