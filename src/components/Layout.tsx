import { useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isTabletopRoute = location.pathname.startsWith("/mesa");
  const isAtlasRoute = location.pathname.startsWith("/mapa");

  if (isTabletopRoute || isAtlasRoute) {
    return <>{children}</>;
  }

  return (
    <div className="page-shell min-h-screen flex flex-col scrollbar-dark">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute left-[2%] top-[7rem] h-[26rem] w-[26rem] bg-[radial-gradient(circle,hsl(var(--brand)/0.16),transparent_68%)] blur-3xl" />
        <div className="absolute right-[4%] top-[18rem] h-[24rem] w-[24rem] bg-[radial-gradient(circle,hsl(var(--info)/0.14),transparent_70%)] blur-3xl" />
        <div className="absolute bottom-[8rem] left-[40%] h-[20rem] w-[20rem] bg-[radial-gradient(circle,hsl(var(--destructive)/0.1),transparent_72%)] blur-3xl" />
      </div>
      <Header />
      <main className="relative z-10 flex-1 pb-16 pt-28 md:pt-32">
        {children}
      </main>
      <Footer />
    </div>
  );
}
