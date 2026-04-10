import { useEffect, useState } from "react";
import { Compass, Flame, Menu, Swords, WandSparkles, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { archiveBrand } from "@/lib/archive-reference";
import { getNavigationEntries, resolveRouteManifest } from "@/lib/route-manifest";
import { DEFAULT_WITCHER_CAMPAIGN_ID } from "@/features/witcher-system";

const leftNavItems = getNavigationEntries("primary-left");
const rightNavItems = getNavigationEntries("primary-right");
const publicNavItems = [...leftNavItems, ...rightNavItems];
const sessionNavItems = [
  { label: "Jogar", path: "/jogar" },
  { label: "Mesa", path: `/mesa/${DEFAULT_WITCHER_CAMPAIGN_ID}` },
  { label: "Mestre", path: "/mestre" },
  { label: "Ficha", path: "/ficha" },
  { label: "Story Engine", path: "/story-engine" },
] as const;

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const currentRoute = resolveRouteManifest(location.pathname);
  const isSessionRoute = currentRoute?.theme === "session";

  useEffect(() => {
    setMobileOpen(false);
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
    <header className="soz-nav">
      <div className="soz-container">
        <div className="soz-nav-inner">
          <Link to="/" className="soz-brand">
            <span className="soz-brand-mark">
              <Flame className="h-4 w-4" />
            </span>
            <span className="soz-brand-copy">
              <span className="soz-brand-kicker">Universo • Lore • Campanhas</span>
              <strong className="soz-brand-name">{archiveBrand.title}</strong>
            </span>
          </Link>

          <nav className="soz-nav-links">
            {publicNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                data-active={isActivePath(item.path)}
                className="soz-nav-link"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Link to="/campanhas" className="soz-nav-cta">
            Explorar
          </Link>

          <button
            type="button"
            className="soz-mobile-toggle"
            onClick={() => setMobileOpen((value) => !value)}
            aria-label={mobileOpen ? "Fechar navegacao" : "Abrir navegacao"}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <div className={`soz-mobile-nav ${mobileOpen ? "is-open" : ""}`}>
          <div className="soz-mobile-nav-links">
            {publicNavItems.map((item) => (
              <Link key={item.path} to={item.path}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
