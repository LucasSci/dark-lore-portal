import { motion } from "framer-motion";
import { ShoppingBag, Map, Scroll, Palette, Sword } from "lucide-react";

const products = [
  { icon: Map, title: "Pacote de Mapas: Terras Sombrias", price: "R$ 19,90", tag: "Mapas" },
  { icon: Scroll, title: "Aventura: A Cripta dos Esquecidos", price: "R$ 14,90", tag: "Aventura" },
  { icon: Palette, title: "Token Pack: Bestiário Vol. I", price: "R$ 9,90", tag: "Tokens" },
  { icon: Sword, title: "Suplemento: Classes Avançadas", price: "R$ 24,90", tag: "Regras" },
  { icon: Map, title: "Mapa Mundi HD — Realm of Shadows", price: "R$ 29,90", tag: "Mapas" },
  { icon: Scroll, title: "Aventura: O Ritual de Sangue", price: "R$ 14,90", tag: "Aventura" },
];

export default function StorePage() {
  return (
    <div className="container py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <ShoppingBag className="w-10 h-10 text-primary mx-auto mb-4" />
        <h1 className="font-display text-3xl md:text-5xl text-gold-gradient mb-4">
          Loja
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Conteúdo digital exclusivo para enriquecer suas sessões e campanhas.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {products.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="p-6 bg-card-gradient border border-gold/10 hover:border-gold/30 transition-all duration-300 cursor-pointer shadow-card group"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="font-heading text-[10px] tracking-[0.2em] uppercase text-primary">{p.tag}</span>
              <p.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <h3 className="font-heading text-base text-foreground mb-3">{p.title}</h3>
            <div className="flex items-center justify-between">
              <span className="font-heading text-lg text-primary">{p.price}</span>
              <span className="font-heading text-xs tracking-[0.1em] uppercase border border-primary/30 text-primary px-3 py-1 group-hover:bg-primary/10 transition-colors">
                Comprar
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
