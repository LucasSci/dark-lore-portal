import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
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
      { label: "Criar ficha", path: "/jogar" },
      { label: "Mesa virtual", path: "/jogar" },
      { label: "Biblioteca de regras", path: "/universo" },
    ],
  },
  {
    title: "Conta",
    links: [
      { label: "Dashboard", path: "/conta" },
      { label: "Biblioteca", path: "/conta" },
      { label: "Downloads", path: "/conta" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-border/70 bg-surface-strong/80">
      <div className="container py-16">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,1fr))]">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="rounded-full border border-primary/20 bg-background/60 p-2">
                <img src={logoEmblem} alt="Realm emblem" className="h-8 w-8" />
              </div>
              <div>
                <p className="font-display text-lg tracking-[0.22em] text-brand-gradient">REALM</p>
                <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  Noir Chronicle UI
                </p>
              </div>
            </div>

            <p className="max-w-sm text-sm leading-7 text-muted-foreground">
              Um universo de dark fantasy original com foco em cronicas, personagens, combate e conteudo digital propio.
            </p>

            <Badge variant="outline" className="border-primary/25 text-primary">
              Assets originais ou licenciados
            </Badge>
          </div>

          {footerLinks.map((column) => (
            <div key={column.title}>
              <h4 className="font-heading text-xs uppercase tracking-[0.2em] text-primary">
                {column.title}
              </h4>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.path}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border/70 pt-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>(c) 2026 Realm. Todos os direitos reservados.</p>
          <p>Dark fantasy original, sem referencia direta a IPs de terceiros.</p>
        </div>
      </div>
    </footer>
  );
}
