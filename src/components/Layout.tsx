import { useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { usePortalState } from "@/lib/portal-state";
import { resolveRouteManifest } from "@/lib/route-manifest";

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const currentRoute = resolveRouteManifest(location.pathname);
  const { motionIntensity, navigationMode } = usePortalState();
  const themeMode = currentRoute?.theme ?? (location.pathname.startsWith("/mapa/") ? "atlas" : "editorial");
  const showHeader = currentRoute?.showHeader ?? true;
  const showFooter = currentRoute?.showFooter ?? !location.pathname.startsWith("/mapa/");
  const isStandaloneRoute = themeMode === "tabletop" || themeMode === "oracle";
  const isAtlasRoute = themeMode === "atlas" && location.pathname.startsWith("/mapa/");

  if (isStandaloneRoute) {
    return <>{children}</>;
  }

  const shellMode = isAtlasRoute ? "atlas" : navigationMode;
  const shellMotion = isAtlasRoute ? "atlas" : motionIntensity;

  return (
    <div className="page-shell min-h-screen flex flex-col scrollbar-dark">
      <a href="#main-content" className="skip-link">
        Pular para o conteudo principal
      </a>
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="page-reading-focus absolute inset-y-0 left-1/2 w-[min(calc(100%-1.5rem),88rem)] -translate-x-1/2" />
        <div className="page-edge-vignette absolute inset-0" />
        <div
          className={`absolute bottom-[8rem] left-[40%] blur-3xl ${
            shellMode === "atlas"
              ? "h-[14rem] w-[14rem] bg-[radial-gradient(circle,hsl(28_34%_10%/0.1),transparent_72%)]"
              : "h-[20rem] w-[20rem] bg-[radial-gradient(circle,hsl(28_34%_10%/0.12),transparent_72%)]"
          }`}
        />
      </div>
      {showHeader ? <Header /> : null}
      <main
        id="main-content"
        tabIndex={-1}
        className={`relative z-10 flex-1 ${
          isAtlasRoute ? "pb-0 pt-24 md:pt-28" : "pb-16 pt-28 md:pt-32"
        }`}
      >
        {children}
      </main>
      {showFooter ? <Footer /> : null}
    </div>
  );
}
