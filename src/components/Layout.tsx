import { useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isTabletopRoute = location.pathname.startsWith("/mesa");
  const isAtlasRoute = location.pathname.startsWith("/mapa");

  if (isTabletopRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col scrollbar-dark">
      <Header />
      <main
        className={
          isAtlasRoute
            ? "flex-1 bg-[radial-gradient(circle_at_top,hsl(var(--brand)/0.08),transparent_34%)] pt-16"
            : "flex-1 pt-16"
        }
      >
        {children}
      </main>
      {!isAtlasRoute ? <Footer /> : null}
    </div>
  );
}
