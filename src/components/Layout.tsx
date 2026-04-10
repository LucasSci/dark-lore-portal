import { useLocation } from "react-router-dom";

import Header from "./Header";
import Footer from "./Footer";
import { usePortalState } from "@/lib/portal-state";
import { resolveRouteManifest } from "@/lib/route-manifest";

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const currentRoute = resolveRouteManifest(location.pathname);
  const { navigationMode } = usePortalState();
  const themeMode = currentRoute?.theme ?? (location.pathname.startsWith("/mapa/") ? "atlas" : "editorial");
  const showHeader = currentRoute?.showHeader ?? true;
  const showFooter = currentRoute?.showFooter ?? !location.pathname.startsWith("/mapa/");
  const isStandaloneRoute = themeMode === "tabletop" || themeMode === "oracle";
  const isSessionRoute = themeMode === "session";
  const isHomeRoute = location.pathname === "/";

  if (isStandaloneRoute) {
    return <>{children}</>;
  }

  if (isSessionRoute) {
    return (
      <div className="session-shell-layout text-[#e3dacb] selection:bg-[#c9a15a]/28">
        <a href="#main-content" className="skip-link">
          Pular para o conteudo principal
        </a>
        {showHeader ? <Header /> : null}
        <main id="main-content" tabIndex={-1} className="session-shell-main">
          {children}
        </main>
        {showFooter ? <Footer /> : null}
      </div>
    );
  }

  return (
    <div className="soz-site-shell selection:bg-[#c9a15a]/30">
      <a href="#main-content" className="skip-link">
        Pular para o conteudo principal
      </a>
      {showHeader ? <Header /> : null}
      <main
        id="main-content"
        tabIndex={-1}
        className={`soz-main ${isHomeRoute ? "" : "pt-24 md:pt-28"}`}
        data-navigation-mode={navigationMode}
      >
        {children}
      </main>
      {showFooter ? <Footer /> : null}
    </div>
  );
}
