import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Flame, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Inicio", path: "/" },
  { label: "Campanha", path: "/campanha" },
  { label: "Jogar", path: "/jogar" },
  { label: "Mesa", path: "/mesa" },
  { label: "Mapa", path: "/mapa" },
  { label: "Universo", path: "/universo" },
  { label: "Comunidade", path: "/comunidade" },
  { label: "Loja", path: "/loja" },
  { label: "Mestre", path: "/mestre" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isActivePath = (path: string) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/70 bg-background/82 backdrop-blur-xl safe-top">
      <div className="container flex h-14 items-center justify-between gap-3 sm:h-16">
        <Link to="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 shadow-panel sm:h-10 sm:w-10">
            <Flame className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
          </div>
          <div className="min-w-0">
            <p className="font-display text-sm tracking-[0.14em] text-brand-gradient sm:text-lg sm:tracking-[0.18em]">
              AREIAS DE ZERRIKANIA
            </p>
            <p className="hidden text-[10px] uppercase tracking-[0.22em] text-muted-foreground sm:block">
              Alaric, Sorrow e Hauz em rota para Elarion
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1.5 lg:flex">
          {navItems.map((item) => {
            const active = isActivePath(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`rounded-[calc(var(--radius)-4px)] px-3 py-2 font-heading text-[11px] uppercase tracking-[0.16em] transition-colors ${
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
            Continente em campanha
          </Badge>
          <Button asChild variant="outline" size="sm">
            <Link to="/conta">Conta</Link>
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-[calc(var(--radius)-2px)] border border-border/70 bg-secondary/60 text-foreground transition-colors hover:border-primary/30 hover:bg-secondary lg:hidden"
          onClick={() => setMobileOpen((previous) => !previous)}
          aria-label={mobileOpen ? "Fechar navegacao" : "Abrir navegacao"}
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
            <div className="container space-y-3 py-3">
              <Badge variant="outline" className="border-primary/25 text-primary">
                Areias de Zerrikania
              </Badge>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {[...navItems, { label: "Conta", path: "/conta" }].map((item) => {
                  const active = isActivePath(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`rounded-[calc(var(--radius)-4px)] border px-3 py-2.5 text-center font-heading text-[11px] uppercase tracking-[0.16em] transition-colors ${
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
