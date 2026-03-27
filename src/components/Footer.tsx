import { Link } from "react-router-dom";
import { Facebook, Twitter, Youtube } from "lucide-react";
import { archiveBrand } from "@/lib/archive-reference";

const footerLinks = [
  { label: "Universo", path: "/universo" },
  { label: "Bestiario", path: "/bestiario" },
  { label: "Cronicas", path: "/cronicas" },
  { label: "Jogar", path: "/jogar" },
  { label: "Mapa", path: "/mapa" },
  { label: "Contato", path: "/contato" },
];

export default function Footer() {
  return (
    <footer className="dark-lore-footer safe-bottom">
      <div className="mx-auto max-w-[1480px] px-4 py-14 md:px-6 md:py-16">
        <div className="dark-lore-footer-inner">
          <div className="space-y-4 text-center">
            <p className="dark-lore-section-kicker justify-center">O arquivo permanece aberto</p>
            <h2 className="font-display text-4xl text-[hsl(var(--gold-light))] md:text-5xl">
              {archiveBrand.title}
            </h2>
            <p className="mx-auto max-w-2xl text-sm leading-7 text-[hsl(var(--foreground)/0.78)] md:text-base">
              {archiveBrand.subtitle} reune dossies, cronicas, mapas e nomes proibidos em um
              unico arquivo respirando como um mundo vivo.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 border-y border-[hsl(var(--brand)/0.18)] py-5">
            {footerLinks.map((link) => (
              <Link key={link.path} to={link.path} className="dark-lore-footer-link">
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center justify-center gap-3">
            <Link to="/contato" className="dark-lore-social-link" aria-label="Contato">
              <Twitter className="h-4 w-4" />
            </Link>
            <Link to="/cronicas" className="dark-lore-social-link" aria-label="Cronicas">
              <Youtube className="h-4 w-4" />
            </Link>
            <Link to="/universo" className="dark-lore-social-link" aria-label="Universo">
              <Facebook className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-2 text-center text-xs tracking-[0.14em] text-[hsl(var(--foreground)/0.54)]">
            <p>(c) 2026 {archiveBrand.title}</p>
            <p>Arquivo vivo de universo, bestiario, cronicas, cartografia e jogo ritual.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
