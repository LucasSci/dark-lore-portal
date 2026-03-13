import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Shield, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import logoEmblem from "@/assets/logo-emblem.png";

const navItems = [
  { label: "Home", path: "/" },
  { label: "Campanha", path: "/campanha" },
  { label: "Jogar", path: "/jogar" },
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
          <div className="rounded-full border border-primary/20 bg-background/60 p-2 shadow-panel">
            <img src={logoEmblem} alt="Realm emblem" className="h-8 w-8" />
          </div>
          <div className="min-w-0">
            <p className="font-display text-lg tracking-[0.22em] text-brand-gradient">REALM</p>
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Noir Chronicle UI
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
            <Shield className="mr-2 h-3.5 w-3.5" />
            Original dark fantasy
          </Badge>
          <Button asChild variant="outline">
            <Link to="/conta">Conta</Link>
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-[calc(var(--radius)-2px)] border border-border/70 bg-secondary/60 text-foreground transition-colors hover:border-primary/30 hover:bg-secondary lg:hidden"
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
            <div className="container space-y-4 py-4">
              <Badge variant="outline" className="border-primary/25 text-primary">
                Original dark fantasy
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
