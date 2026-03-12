import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";
import { Sword, BookOpen, Map, Users, ShoppingBag, Dice6 } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Campanha",
    desc: "Leia a saga épica publicada em capítulos. Cada decisão molda o destino.",
    path: "/campanha",
  },
  {
    icon: Sword,
    title: "Jogar RPG",
    desc: "Sistema próprio com combate por turnos, dados e ficha de personagem.",
    path: "/jogar",
  },
  {
    icon: Map,
    title: "Universo",
    desc: "Explore o lore completo: reinos, facções, bestiário e história.",
    path: "/universo",
  },
  {
    icon: Users,
    title: "Comunidade",
    desc: "Fórum, notícias, eventos e encontre outros aventureiros.",
    path: "/comunidade",
  },
  {
    icon: ShoppingBag,
    title: "Loja",
    desc: "Conteúdo digital exclusivo: mapas, aventuras, tokens e mais.",
    path: "/loja",
  },
  {
    icon: Dice6,
    title: "Criar Personagem",
    desc: "Forje seu herói ou vilão com raças, classes e habilidades únicas.",
    path: "/jogar",
  },
];

const news = [
  {
    title: "Capítulo XII: A Queda de Valdris",
    date: "10 Mar 2026",
    excerpt: "O cerco à fortaleza de Valdris chegou ao fim. Mas a que custo?",
    tag: "Campanha",
  },
  {
    title: "Nova Classe: Ceifador Arcano",
    date: "5 Mar 2026",
    excerpt: "Uma nova classe que mistura magia negra com combate corpo a corpo.",
    tag: "Sistema",
  },
  {
    title: "Torneio de Inverno — Inscrições Abertas",
    date: "1 Mar 2026",
    excerpt: "Participe do torneio PvP e ganhe recompensas exclusivas.",
    tag: "Evento",
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative h-[90vh] flex items-end overflow-hidden">
        <img
          src={heroBg}
          alt="Dark fantasy landscape"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="relative container pb-20 z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-gold-gradient leading-tight mb-6">
              Realm of Shadows
            </h1>
            <p className="text-lg md:text-xl text-foreground/80 mb-8 max-w-lg">
              Entre num mundo onde a escuridão sussurra e cada escolha carrega o peso do destino. Leia. Jogue. Conquiste.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/campanha"
                className="font-heading text-sm tracking-[0.15em] uppercase bg-gold-gradient px-8 py-3 text-primary-foreground transition-all duration-300 hover:shadow-[0_0_30px_hsl(40_60%_50%/0.3)]"
              >
                Começar a Saga
              </Link>
              <Link
                to="/jogar"
                className="font-heading text-sm tracking-[0.15em] uppercase border border-primary/40 px-8 py-3 text-primary transition-all duration-300 hover:bg-primary/10"
              >
                Jogar Agora
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container py-24">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-3xl md:text-4xl text-gold-gradient ornament-line mb-6">
            Explore o Realm
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto mt-8">
            Tudo que você precisa para mergulhar em um universo de dark fantasy completo.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Link
                to={f.path}
                className="block p-6 bg-card-gradient border border-gold/10 hover:border-gold/30 transition-all duration-500 group shadow-card h-full"
              >
                <f.icon className="w-8 h-8 text-primary mb-4 group-hover:text-gold-light transition-colors" />
                <h3 className="font-heading text-lg text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* News */}
      <section className="border-t border-gold/10 bg-card/50">
        <div className="container py-24">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-3xl md:text-4xl text-gold-gradient ornament-line mb-6">
              Crônicas Recentes
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {news.map((n, i) => (
              <motion.article
                key={n.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 bg-card-gradient border border-gold/10 hover:border-gold/20 transition-all duration-300 shadow-card"
              >
                <span className="font-heading text-[10px] tracking-[0.2em] uppercase text-primary">
                  {n.tag}
                </span>
                <h3 className="font-heading text-base text-foreground mt-2 mb-2">
                  {n.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">{n.excerpt}</p>
                <span className="text-xs text-muted-foreground">{n.date}</span>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-24 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto"
        >
          <h2 className="font-display text-2xl md:text-3xl text-gold-gradient mb-4">
            Sua história começa agora
          </h2>
          <p className="text-muted-foreground mb-8">
            Crie sua conta, forje seu personagem e entre nas trevas.
          </p>
          <Link
            to="/conta"
            className="inline-block font-heading text-sm tracking-[0.15em] uppercase bg-gold-gradient px-10 py-3 text-primary-foreground transition-all duration-300 hover:shadow-[0_0_30px_hsl(40_60%_50%/0.3)]"
          >
            Criar Conta Gratuita
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
