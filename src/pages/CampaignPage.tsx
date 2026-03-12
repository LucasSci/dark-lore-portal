import { motion } from "framer-motion";
import { BookOpen, ChevronRight } from "lucide-react";

const chapters = [
  { num: 1, title: "O Despertar", status: "published", excerpt: "Nas profundezas da Floresta Cinzenta, algo antigo desperta..." },
  { num: 2, title: "Sangue e Cinzas", status: "published", excerpt: "A aldeia de Korven arde. Os sobreviventes fogem para o norte." },
  { num: 3, title: "O Pacto Sombrio", status: "published", excerpt: "Uma escolha impossível: poder absoluto ou a alma de um inocente." },
  { num: 4, title: "A Torre de Obsidiana", status: "published", excerpt: "Os segredos da torre revelam verdades que deveriam permanecer ocultas." },
  { num: 5, title: "Runas Proibidas", status: "published", excerpt: "A magia antiga tem um preço que poucos estão dispostos a pagar." },
  { num: 6, title: "O Cerco de Valdris", status: "new", excerpt: "As muralhas tremem sob o peso de um exército de trevas." },
];

export default function CampaignPage() {
  return (
    <div className="container py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <div className="text-center mb-16">
          <BookOpen className="w-10 h-10 text-primary mx-auto mb-4" />
          <h1 className="font-display text-3xl md:text-5xl text-gold-gradient mb-4">
            A Campanha
          </h1>
          <p className="text-muted-foreground">
            Acompanhe a saga épica capítulo por capítulo. Novas publicações toda semana.
          </p>
        </div>

        <div className="space-y-4">
          {chapters.map((ch, i) => (
            <motion.div
              key={ch.num}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="group p-6 bg-card-gradient border border-gold/10 hover:border-gold/30 transition-all duration-300 cursor-pointer flex items-start gap-4 shadow-card"
            >
              <span className="font-display text-2xl text-primary/40 group-hover:text-primary transition-colors">
                {String(ch.num).padStart(2, "0")}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-heading text-lg text-foreground">{ch.title}</h3>
                  {ch.status === "new" && (
                    <span className="text-[10px] font-heading tracking-widest uppercase bg-primary/20 text-primary px-2 py-0.5">
                      Novo
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{ch.excerpt}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors mt-1" />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
