import { useEffect, useState } from "react";
import { Flame, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { archiveBrand } from "@/lib/archive-reference";
import { getNavigationEntries } from "@/lib/route-manifest";

const leftNavItems = getNavigationEntries("primary-left");
const rightNavItems = getNavigationEntries("primary-right");
const mobileNavItems = [...leftNavItems, ...rightNavItems];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

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

  return (
    <header className="fixed inset-x-0 top-0 z-50 safe-top">
      <div
        className={`mx-auto flex max-w-[1440px] items-center justify-between border-b px-4 transition-all duration-300 md:px-6 ${
          scrolled
            ? "h-16 border-[rgba(201,161,90,0.22)] bg-[rgba(5,5,7,0.86)] backdrop-blur-md"
            : "h-20 border-[rgba(201,161,90,0.16)] bg-[rgba(5,5,7,0.5)] backdrop-blur-sm"
        }`}
      >
        <button
          type="button"
          className="text-[#c9a15a] transition-colors hover:text-[#ffcc66] md:hidden"
          onClick={() => setMobileOpen((value) => !value)}
          aria-label={mobileOpen ? "Fechar navegacao" : "Abrir navegacao"}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <nav className="hidden items-center gap-6 md:flex">
          {leftNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`font-heading text-xs uppercase tracking-[0.28em] transition-colors ${
                isActivePath(item.path) ? "text-[#ffcc66]" : "text-[rgba(227,218,203,0.72)] hover:text-[#ffcc66]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link to="/" className="pointer-events-auto absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-3">
          <Flame className="h-4 w-4 text-[#c9a15a]" />
          <span className="hidden font-heading text-lg tracking-[0.18em] text-[#c9a15a] sm:block">
            {archiveBrand.title}
          </span>
          <Flame className="h-4 w-4 text-[#c9a15a]" />
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {rightNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`font-heading text-xs uppercase tracking-[0.28em] transition-colors ${
                isActivePath(item.path) ? "text-[#ffcc66]" : "text-[rgba(227,218,203,0.72)] hover:text-[#ffcc66]"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/jogar"
            className="border border-[rgba(201,161,90,0.8)] px-4 py-2 font-heading text-xs uppercase tracking-[0.24em] text-[#c9a15a] transition-all hover:bg-[#c9a15a] hover:text-[#0f0d0b]"
          >
            Abrir Arquivo
          </Link>
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
