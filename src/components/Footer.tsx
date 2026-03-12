import { Link } from "react-router-dom";
import logoEmblem from "@/assets/logo-emblem.png";

const footerLinks = [
  {
    title: "Explorar",
    links: [
      { label: "Campanha", path: "/campanha" },
      { label: "Universo", path: "/universo" },
      { label: "Loja", path: "/loja" },
    ],
  },
  {
    title: "Jogar",
    links: [
      { label: "Criar Personagem", path: "/jogar" },
      { label: "Encontrar Sessão", path: "/jogar" },
      { label: "Regras", path: "/universo" },
    ],
  },
  {
    title: "Comunidade",
    links: [
      { label: "Fórum", path: "/comunidade" },
      { label: "Discord", path: "/comunidade" },
      { label: "Notícias", path: "/comunidade" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-gold/10 bg-card">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src={logoEmblem} alt="Emblem" className="h-8 w-8" />
              <span className="font-display text-base tracking-widest text-gold">REALM</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Um universo de dark fantasy onde lendas são forjadas pelo destino e pela lâmina.
            </p>
          </div>

          {/* Link columns */}
          {footerLinks.map((col) => (
            <div key={col.title}>
              <h4 className="font-heading text-xs tracking-[0.2em] uppercase text-primary mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.path}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-gold/10 text-center">
          <p className="text-xs text-muted-foreground tracking-wider">
            © 2026 REALM. Todos os direitos reservados. Forjado nas trevas.
          </p>
        </div>
      </div>
    </footer>
  );
}
