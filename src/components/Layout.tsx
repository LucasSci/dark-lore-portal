import { useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const FULLSCREEN_ROUTES = ["/mesa"];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isFullscreen = FULLSCREEN_ROUTES.includes(location.pathname);

  if (isFullscreen) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col scrollbar-dark">
      <Header />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </div>
  );
}
