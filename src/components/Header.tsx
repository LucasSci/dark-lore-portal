import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Flame, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Início", path: "/" },
  { label: "Campanha", path: "/campanha" },
  { label: "Mesa", path: "/jogar" },
  { label: "Universo", path: "/universo" },
  { label: "Comunidade", path: "/comunidade" },
  { label: "Loja", path: "/loja" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/70 bg-background/82 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 bg-primary/10 shadow-panel">
            <Flame className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-display text-lg tracking-[0.18em] text-brand-gradient">
              AREIAS DE ZERRIKÂNIA
            </p>
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              A Caçada ao Escorpião de Vidro
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 lg:flex">
          {navItems.map((item) => {
            const active = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`rounded-[calc(var(--radius)-4px)] px-4 py-2 font-heading text-xs uppercase tracking-[0.18em] transition-colors ${
                  active
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Badge variant="outline" className="border-primary/25 text-primary">
            <Flame className="mr-2 h-3.5 w-3.5" />
            Zerrikânia
          </Badge>
          <Button asChild variant="outline">
            <Link to="/conta">Conta</Link>
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-[calc(var(--radius)-2px)] border border-border/70 bg-secondary/60 text-foreground transition-colors hover:border-primary/30 hover:bg-secondary lg:hidden"
          onClick={() => setMobileOpen((previous) => !previous)}
          aria-label={mobileOpen ? "Fechar navegação" : "Abrir navegação"}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-border/70 bg-background/96 lg:hidden"
          >
            <div className="container space-y-4 py-4">
              <Badge variant="outline" className="border-primary/25 text-primary">
                Areias de Zerrikânia
              </Badge>

              <div className="grid gap-2">
                {[...navItems, { label: "Conta", path: "/conta" }].map((item) => {
                  const active = location.pathname === item.path;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`rounded-[calc(var(--radius)-4px)] border px-4 py-3 font-heading text-xs uppercase tracking-[0.18em] transition-colors ${
                        active
                          ? "border-primary/30 bg-secondary text-foreground"
                          : "border-border/70 bg-background/40 text-muted-foreground hover:border-primary/20 hover:text-foreground"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
