import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Flame, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import logoEmblem from "@/assets/logo-emblem.png";
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

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isActivePath = (path: string) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 safe-top sm:px-4 lg:px-6">
      <div className="mx-auto max-w-[1520px] pt-3 md:pt-4">
        <div className="ornate-frame border border-[hsl(var(--outline-variant)/0.22)] bg-[linear-gradient(180deg,hsl(var(--surface-strong)/0.9),hsl(var(--surface-base)/0.96))] shadow-elevated backdrop-blur-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--brand)/0.08),transparent_34%),linear-gradient(90deg,transparent,hsl(var(--foreground)/0.05),transparent)]" />

          <div className="relative flex items-center gap-4 px-4 py-3 lg:px-6">
            <Link to="/" className="flex min-w-0 items-center gap-3 lg:flex-[0_0_auto]">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-[hsl(var(--brand)/0.22)] bg-[linear-gradient(180deg,hsl(var(--surface-strong)/0.9),hsl(var(--surface-base)/0.98))] shadow-panel">
                <img src={logoEmblem} alt="Emblema de Areias de Zerrikania" className="h-7 w-7 object-contain" />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary/82">
                  Digital Reliquary
                </p>
                <p className="font-display text-lg tracking-[0.08em] text-brand-gradient sm:text-xl">
                  Areias de Zerrikania
                </p>
              </div>
            </Link>

            <nav className="hidden min-w-0 flex-1 items-center justify-center xl:flex">
              <div className="flex min-w-0 items-center gap-1 border border-[hsl(var(--outline-variant)/0.16)] bg-[linear-gradient(180deg,hsl(var(--surface-raised)/0.7),hsl(var(--surface-base)/0.88))] px-2 py-1 shadow-panel">
                {navItems.map((item) => {
                  const active = isActivePath(item.path);

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`relative px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors ${
                        active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {item.label}
                      <span
                        className={`absolute inset-x-3 bottom-1 h-px origin-left bg-[linear-gradient(90deg,hsl(var(--brand)),transparent)] transition-transform duration-200 ${
                          active ? "scale-x-100" : "scale-x-0"
                        }`}
                      />
                    </Link>
                  );
                })}
              </div>
            </nav>

            <div className="hidden items-center gap-3 lg:flex">
              <Badge variant="outline" className="border-[hsl(var(--info)/0.24)] text-info">
                <Flame className="mr-2 h-3.5 w-3.5" />
                Arquivo em campanha
              </Badge>
              <Button asChild size="sm">
                <Link to="/conta">Conta</Link>
              </Button>
            </div>

            <button
              type="button"
              className="ml-auto inline-flex h-11 w-11 items-center justify-center border border-[hsl(var(--outline-variant)/0.22)] bg-[linear-gradient(180deg,hsl(var(--surface-strong)/0.82),hsl(var(--surface-base)/0.92))] text-foreground transition-colors hover:border-[hsl(var(--brand)/0.24)] hover:text-primary xl:hidden"
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
                className="relative overflow-hidden border-t border-[hsl(var(--outline-variant)/0.16)] xl:hidden"
              >
                <div className="space-y-4 px-4 py-4 sm:px-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Badge variant="outline">Arquivo vivo do continente</Badge>
                    <Button asChild size="sm" variant="outline">
                      <Link to="/conta">Conta</Link>
                    </Button>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    {navItems.map((item) => {
                      const active = isActivePath(item.path);

                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`border px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors ${
                            active
                              ? "border-[hsl(var(--brand)/0.24)] bg-[linear-gradient(135deg,hsl(var(--brand)/0.22),transparent)] text-primary"
                              : "border-[hsl(var(--outline-variant)/0.18)] bg-[linear-gradient(180deg,hsl(var(--surface-base)/0.56),hsl(var(--background)/0.36))] text-muted-foreground hover:border-[hsl(var(--brand)/0.18)] hover:text-foreground"
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
        </div>
      </div>
    </header>
  );
}
