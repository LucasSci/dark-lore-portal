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
  const isAtlasRoute = themeMode === "atlas" && location.pathname.startsWith("/mapa/");
  const isSessionRoute = themeMode === "session";

  if (isStandaloneRoute) {
    return <>{children}</>;
  }

  const shellMode = isAtlasRoute ? "atlas" : navigationMode;
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
    <div className="min-h-screen bg-[#0f0d0b] text-[#e3dacb] selection:bg-[#c9a15a]/30">
      <a href="#main-content" className="skip-link">
        Pular para o conteudo principal
      </a>
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(201,161,90,0.08),transparent_35%),linear-gradient(180deg,rgba(5,5,7,0.45),rgba(5,5,7,0.94))]" />
        <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
        <div className={`absolute bottom-[8rem] left-[40%] blur-3xl ${
          shellMode === "atlas"
            ? "h-[14rem] w-[14rem] bg-[radial-gradient(circle,rgba(130,78,26,0.12),transparent_72%)]"
            : "h-[20rem] w-[20rem] bg-[radial-gradient(circle,rgba(130,78,26,0.16),transparent_72%)]"
        }`} />
      </div>
      {showHeader ? <Header /> : null}
      <main
        id="main-content"
        tabIndex={-1}
        className={`relative z-10 flex-1 ${
          isAtlasRoute ? "pb-0 pt-24 md:pt-28" : "pb-16 pt-24 md:pt-28"
        }`}
      >
        {children}
      </main>
      {showFooter ? <Footer /> : null}
    </div>
  );
}
