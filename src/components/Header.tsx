import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { archiveBrand } from "@/lib/archive-reference";
import { getNavigationEntries } from "@/lib/route-manifest";

const leftNavItems = getNavigationEntries("primary-left").map(({ label, path }) => ({
  label,
  path,
}));
const rightNavItems = getNavigationEntries("primary-right").map(({ label, path }) => ({
  label,
  path,
}));
const mobileNavItems = [...leftNavItems, ...rightNavItems];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const homeRoute = location.pathname === "/";

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const syncScrollState = () => {
      setScrolled(!homeRoute || window.scrollY > 36);
    };

    syncScrollState();
    window.addEventListener("scroll", syncScrollState, { passive: true });
    window.addEventListener("resize", syncScrollState);

    return () => {
      window.removeEventListener("scroll", syncScrollState);
      window.removeEventListener("resize", syncScrollState);
    };
  }, [homeRoute]);

  const isActivePath = (path: string) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname === path || location.pathname.startsWith(`${path}/`);

  const renderNavLink = (item: { label: string; path: string }) => {
    const active = isActivePath(item.path);

    return (
      <Link
        key={item.path}
        to={item.path}
        data-active={active ? "true" : "false"}
        className="dark-lore-nav-link"
      >
        {item.label}
      </Link>
    );
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 safe-top sm:px-5 lg:px-6">
      <div className="mx-auto max-w-[1480px] pt-3 md:pt-4">
        <div
          className="dark-lore-nav-shell"
          data-home={homeRoute ? "true" : "false"}
          data-scrolled={scrolled ? "true" : "false"}
        >
          <div className="dark-lore-nav-rail">
            <div className="hidden min-w-0 items-center justify-end gap-1 xl:flex">
              {leftNavItems.map(renderNavLink)}
            </div>

            <Link to="/" className="dark-lore-brand">
              <span className="dark-lore-brand-kicker">{archiveBrand.subtitle}</span>
              <span className="dark-lore-brand-text">{archiveBrand.title}</span>
            </Link>

            <div className="hidden min-w-0 items-center justify-start gap-1 xl:flex">
              {rightNavItems.map(renderNavLink)}
              <Link to="/jogar" className="dark-lore-entry-button">
                Abrir Arquivo
              </Link>
            </div>

            <button
              type="button"
              className="dark-lore-mobile-toggle xl:hidden"
              onClick={() => setMobileOpen((previous) => !previous)}
              aria-label={mobileOpen ? "Fechar navegacao" : "Abrir navegacao"}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {mobileOpen ? (
            <nav className="dark-lore-mobile-menu xl:hidden">
              <div className="grid gap-2">
                {mobileNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    data-active={isActivePath(item.path) ? "true" : "false"}
                    className="dark-lore-mobile-link"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link to="/jogar" className="dark-lore-entry-button mt-2 text-center">
                  Abrir Arquivo
                </Link>
              </div>
            </nav>
          ) : null}
        </div>
      </div>
    </header>
  );
}
