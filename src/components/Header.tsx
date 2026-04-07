import { useEffect, useState } from "react";
import { Compass, Flame, Menu, Swords, WandSparkles, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { archiveBrand } from "@/lib/archive-reference";
import { getNavigationEntries, resolveRouteManifest } from "@/lib/route-manifest";
import { DEFAULT_WITCHER_CAMPAIGN_ID } from "@/features/witcher-system";

const leftNavItems = getNavigationEntries("primary-left");
const rightNavItems = getNavigationEntries("primary-right");
const mobileNavItems = [...leftNavItems, ...rightNavItems];
const desktopNavItems = [...leftNavItems, ...rightNavItems];
const sessionNavItems = [
  { label: "Jogar", path: "/jogar" },
  { label: "Mesa", path: `/mesa/${DEFAULT_WITCHER_CAMPAIGN_ID}` },
  { label: "Mestre", path: "/mestre" },
  { label: "Ficha", path: "/ficha" },
  { label: "Story Engine", path: "/story-engine" },
] as const;

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const currentRoute = resolveRouteManifest(location.pathname);
  const isSessionRoute = currentRoute?.theme === "session";

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20 || location.pathname !== "/");
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  const isActivePath = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname === path || location.pathname.startsWith(`${path}/`);

  if (isSessionRoute) {
    return (
      <header className="fixed inset-x-0 top-0 z-50 safe-top">
        <div className="session-topbar">
          <div className="session-topbar-row">
            <Link to="/jogar" className="session-topbar-brand">
              <span className="session-topbar-brand-mark">
                <Flame className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="session-topbar-kicker">Suite de sessao</span>
                <span className="session-topbar-title">{archiveBrand.title}</span>
              </span>
            </Link>

            <nav className="session-topbar-nav">
              {sessionNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  data-active={isActivePath(item.path)}
                  className="session-topbar-link"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="session-topbar-actions">
              <span className="session-topbar-meta">
                <Swords className="h-3.5 w-3.5" />
                Foundry utilitario
              </span>
              <Link to="/oraculo" className="session-topbar-link">
                <WandSparkles className="mr-2 h-3.5 w-3.5" />
                Oraculo
              </Link>
              <Link to="/" className="session-topbar-cta">
                <Compass className="mr-2 h-3.5 w-3.5" />
                Voltar ao portal
              </Link>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 safe-top">
      <div
        className="dark-lore-nav-shell mx-auto max-w-[1480px] border-x border-b transition-all duration-300"
        data-scrolled={scrolled}
      >
        <div className="dark-lore-nav-rail">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="tool-rail-button h-10 w-10 text-[#c9a15a] md:hidden"
              onClick={() => setMobileOpen((value) => !value)}
              aria-label={mobileOpen ? "Fechar navegacao" : "Abrir navegacao"}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            <Link to="/" className="dark-lore-brand min-w-0 justify-start">
              <Flame className="h-4 w-4 text-[#c9a15a]" />
              <span className="min-w-0">
                <span className="dark-lore-brand-kicker">Narrative Shell</span>
                <span className="dark-lore-brand-text">{archiveBrand.title}</span>
              </span>
            </Link>
          </div>

          <nav className="hidden items-center justify-center gap-1 md:flex">
            {desktopNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                data-active={isActivePath(item.path)}
                className="dark-lore-nav-link"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center justify-end gap-2 md:flex">
            <span className="session-topbar-meta">Lore + sessao</span>
            <Link to="/jogar" className="session-topbar-cta">
              <Swords className="mr-2 h-3.5 w-3.5" />
              Entrar na suite
            </Link>
          </div>
        </div>
      </div>

      {mobileOpen ? (
        <nav className="border-b border-[rgba(201,161,90,0.18)] bg-[rgba(23,20,17,0.98)] px-6 py-6 md:hidden">
          <div className="flex flex-col gap-4">
            {mobileNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`font-heading text-sm uppercase tracking-[0.24em] ${
                  isActivePath(item.path) ? "text-[#ffcc66]" : "text-[rgba(227,218,203,0.74)]"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/jogar"
              className="mt-2 inline-flex w-fit border border-[rgba(201,161,90,0.8)] px-4 py-2 font-heading text-xs uppercase tracking-[0.24em] text-[#c9a15a]"
            >
              Abrir Arquivo
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
