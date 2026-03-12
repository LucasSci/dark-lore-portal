import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import logoEmblem from "@/assets/logo-emblem.png";

const navItems = [
  { label: "Home", path: "/" },
  { label: "Campanha", path: "/campanha" },
  { label: "Jogar", path: "/jogar" },
  { label: "Universo", path: "/universo" },
  { label: "Comunidade", path: "/comunidade" },
  { label: "Loja", path: "/loja" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-gold/20 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src={logoEmblem} alt="Emblem" className="h-10 w-10" />
          <span className="font-display text-lg tracking-widest text-gold">
            REALM
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`font-heading text-sm tracking-[0.15em] uppercase transition-colors duration-300 hover:text-primary ${
                location.pathname === item.path
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/conta"
            className="font-heading text-sm tracking-[0.15em] uppercase border border-primary/40 px-4 py-1.5 transition-all duration-300 hover:bg-primary/10 hover:border-primary text-primary"
          >
            Conta
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gold/10 bg-background/95 backdrop-blur-md overflow-hidden"
          >
            <div className="container py-4 flex flex-col gap-3">
              {[...navItems, { label: "Conta", path: "/conta" }].map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`font-heading text-sm tracking-[0.15em] uppercase py-2 transition-colors ${
                    location.pathname === item.path
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
