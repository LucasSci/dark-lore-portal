import { motion } from "framer-motion";
import { User, LogIn } from "lucide-react";

export default function AccountPage() {
  return (
    <div className="container py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto text-center"
      >
        <User className="w-10 h-10 text-primary mx-auto mb-4" />
        <h1 className="font-display text-3xl md:text-4xl text-gold-gradient mb-4">
          Sua Conta
        </h1>
        <p className="text-muted-foreground mb-10">
          Faça login para acessar seus personagens, campanhas e compras.
        </p>

        <div className="p-8 bg-card-gradient border border-gold/10 shadow-card space-y-4">
          <div>
            <label className="block font-heading text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2 text-left">
              Email
            </label>
            <input
              type="email"
              placeholder="seu@email.com"
              className="w-full bg-muted border border-gold/10 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors font-body"
            />
          </div>
          <div>
            <label className="block font-heading text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2 text-left">
              Senha
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full bg-muted border border-gold/10 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors font-body"
            />
          </div>
          <button className="w-full font-heading text-sm tracking-[0.15em] uppercase bg-gold-gradient px-8 py-3 text-primary-foreground transition-all duration-300 hover:shadow-[0_0_20px_hsl(40_60%_50%/0.3)] flex items-center justify-center gap-2">
            <LogIn className="w-4 h-4" />
            Entrar
          </button>
          <p className="text-xs text-muted-foreground">
            Não tem conta?{" "}
            <span className="text-primary cursor-pointer hover:underline">Criar conta gratuita</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
