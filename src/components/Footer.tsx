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
      { label: "Criar ficha", path: "/criacao" },
      { label: "Mesa virtual", path: "/mesa" },
      { label: "Painel do mestre", path: "/mestre" },
    ],
  },
  {
    title: "Conta",
    links: [
      { label: "Arquivo pessoal", path: "/conta" },
      { label: "Biblioteca", path: "/conta" },
      { label: "Mercado", path: "/loja" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-border/70 bg-surface-strong/80 safe-bottom">
      <div className="container py-10 sm:py-16">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,1fr))]">
          <div className="space-y-4 sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="rounded-full border border-primary/20 bg-background/60 p-2">
                <img src={logoEmblem} alt="Emblema da campanha" className="h-7 w-7 sm:h-8 sm:w-8" />
              </div>
              <div>
                <p className="font-display text-base tracking-[0.18em] text-brand-gradient sm:text-lg sm:tracking-[0.22em]">
                  AREIAS DE ZERRIKANIA
                </p>
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:text-[11px] sm:tracking-[0.22em]">
                  Arquivo vivo do continente
                </p>
              </div>
            </div>
            <p className="max-w-sm text-sm leading-6 text-muted-foreground sm:leading-7">
              Um ecossistema de campanha focado em estrada, rumor, combate e cronicas do mestre.
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
              <ul className="mt-3 space-y-2.5 sm:mt-4 sm:space-y-3">
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

        <div className="mt-8 flex flex-col gap-2 border-t border-border/70 pt-5 text-xs text-muted-foreground sm:mt-12 sm:flex-row sm:items-center sm:justify-between sm:pt-6 sm:text-sm">
          <p>(c) 2026 Areias de Zerrikania. Todos os direitos reservados.</p>
          <p>Ambientacao autoral inspirada no tom dark fantasy.</p>
        </div>
      </div>
    </footer>
  );
}
