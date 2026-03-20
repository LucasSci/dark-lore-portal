import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Flame, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import logoEmblem from "@/assets/logo-emblem.png";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePortalState } from "@/lib/portal-state";

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
  const { atlasFocus, navigationMode } = usePortalState();
  const isAtlasRoute = location.pathname.startsWith("/mapa");
  const atlasMode = navigationMode === "atlas" || isAtlasRoute;

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isActivePath = (path: string) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 safe-top sm:px-4 lg:px-6">
      <div className={`mx-auto pt-3 md:pt-4 ${atlasMode ? "max-w-[1780px]" : "max-w-[1520px]"}`}>
        <div
          className={`artifact-nav-shell border-transparent backdrop-blur-xl ${
            atlasMode ? "shadow-panel" : "shadow-elevated"
          }`}
        >
          <div className="absolute inset-0 bg-[linear-gradient(90deg,hsl(var(--background)/0.14),transparent_14%,transparent_86%,hsl(var(--background)/0.16))]" />

          <div className={`relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 lg:px-6 xl:grid-cols-[auto_minmax(0,1fr)_auto] ${atlasMode ? "xl:py-2.5" : ""}`}>
            <Link to="/" className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-[hsl(var(--brand)/0.3)] bg-[linear-gradient(180deg,hsl(var(--surface-strong)/0.9),hsl(var(--surface-base)/0.98))] shadow-[0_18px_34px_hsl(var(--background)/0.34)]">
                <img src={logoEmblem} alt="Emblema de Areias de Zerrikania" className="h-7 w-7 object-contain" />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary/82">
                  Digital Reliquary
                </p>
                <p className="font-display text-lg tracking-[0.05em] text-brand-gradient drop-shadow-[0_0_18px_hsl(var(--brand)/0.12)] sm:text-xl">
                  Areias de Zerrikania
                </p>
              </div>
            </Link>

            <nav className="hidden min-w-0 items-center justify-center xl:flex">
              <div className="artifact-nav-track w-full max-w-[780px]">
                {navItems.map((item) => {
                  const active = isActivePath(item.path);

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      data-active={active ? "true" : "false"}
                      className={`artifact-nav-link ${active ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </nav>

            <div className="hidden items-center justify-end gap-3 xl:flex">
              <div className="header-status-pill">
                <Flame className="mr-2 h-3.5 w-3.5" />
                {atlasMode ? atlasFocus?.title ?? "Atlas em foco" : "Arquivo em campanha"}
              </div>
              {atlasMode && atlasFocus?.stage ? (
                <Badge variant="outline" className="border-primary/25 text-primary">
                  {atlasFocus.stage}
                </Badge>
              ) : null}
              <Link to="/conta" className="header-account-button">
                Conta
              </Link>
            </div>

            <button
              type="button"
              className="ml-auto inline-flex h-11 w-11 items-center justify-center border border-[hsl(var(--brand)/0.2)] bg-[linear-gradient(180deg,hsl(var(--surface-strong)/0.82),hsl(var(--surface-base)/0.92))] text-foreground transition-colors hover:border-[hsl(var(--brand)/0.34)] hover:text-primary justify-self-end xl:hidden"
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
                className="relative overflow-hidden border-t border-[hsl(var(--brand)/0.14)] xl:hidden"
              >
                <div className="space-y-4 px-4 py-4 sm:px-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Badge variant="outline">
                      {atlasMode ? atlasFocus?.title ?? "Atlas do continente" : "Arquivo vivo do continente"}
                    </Badge>
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
                              ? "border-[hsl(var(--brand)/0.28)] bg-[linear-gradient(135deg,hsl(var(--brand)/0.24),transparent)] text-primary"
                              : "border-[hsl(var(--brand)/0.14)] bg-[linear-gradient(180deg,hsl(var(--surface-base)/0.56),hsl(var(--background)/0.36))] text-muted-foreground hover:border-[hsl(var(--brand)/0.2)] hover:text-foreground"
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
