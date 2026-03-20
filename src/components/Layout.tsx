import { useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { usePortalState } from "@/lib/portal-state";

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isTabletopRoute = location.pathname.startsWith("/mesa");
  const isAtlasRoute = location.pathname.startsWith("/mapa");
  const { motionIntensity, navigationMode } = usePortalState();

  if (isTabletopRoute) {
    return <>{children}</>;
  }

  const shellMode = isAtlasRoute ? "atlas" : navigationMode;
  const shellMotion = isAtlasRoute ? "atlas" : motionIntensity;

  return (
    <div className="page-shell min-h-screen flex flex-col scrollbar-dark">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className={`absolute left-[2%] top-[7rem] blur-3xl ${
            shellMotion === "atlas"
              ? "h-[18rem] w-[18rem] bg-[radial-gradient(circle,hsl(var(--brand)/0.12),transparent_68%)]"
              : shellMotion === "interactive"
                ? "h-[26rem] w-[26rem] bg-[radial-gradient(circle,hsl(var(--brand)/0.16),transparent_68%)]"
                : "h-[20rem] w-[20rem] bg-[radial-gradient(circle,hsl(var(--brand)/0.12),transparent_68%)]"
          }`}
        />
        <div
          className={`absolute right-[4%] top-[18rem] blur-3xl ${
            shellMotion === "atlas"
              ? "h-[18rem] w-[18rem] bg-[radial-gradient(circle,hsl(var(--info)/0.1),transparent_70%)]"
              : "h-[24rem] w-[24rem] bg-[radial-gradient(circle,hsl(var(--info)/0.14),transparent_70%)]"
          }`}
        />
        <div
          className={`absolute bottom-[8rem] left-[40%] blur-3xl ${
            shellMode === "atlas"
              ? "h-[14rem] w-[14rem] bg-[radial-gradient(circle,hsl(var(--destructive)/0.08),transparent_72%)]"
              : "h-[20rem] w-[20rem] bg-[radial-gradient(circle,hsl(var(--destructive)/0.1),transparent_72%)]"
          }`}
        />
      </div>
      <Header />
      <main
        className={`relative z-10 flex-1 ${
          isAtlasRoute ? "pb-0 pt-24 md:pt-28" : "pb-16 pt-28 md:pt-32"
        }`}
      >
        {children}
      </main>
      {!isAtlasRoute ? <Footer /> : null}
    </div>
  );
}
