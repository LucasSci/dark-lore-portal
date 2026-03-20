import { Link } from "react-router-dom";

import logoEmblem from "@/assets/logo-emblem.png";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const footerLinks = [
  {
    title: "Descobrir",
    links: [
      { label: "Atlas", path: "/mapa" },
      { label: "Campanha", path: "/campanha" },
      { label: "Universo", path: "/universo" },
      { label: "Comunidade", path: "/comunidade" },
    ],
  },
  {
    title: "Mesa",
    links: [
      { label: "Criar ficha", path: "/criacao" },
      { label: "Mesa virtual", path: "/mesa" },
      { label: "Painel do mestre", path: "/mestre" },
    ],
  },
  {
    title: "Arquivo",
    links: [
      { label: "Arquivo pessoal", path: "/conta" },
      { label: "Jogar", path: "/jogar" },
      { label: "Loja", path: "/loja" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="artifact-footer-shell safe-bottom">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--brand)/0.08),transparent_26%),radial-gradient(circle_at_84%_22%,hsl(var(--info)/0.08),transparent_20%)] opacity-70" />

      <div className="container relative z-10 pt-16 pb-28 md:pt-20 md:pb-36">
        <div className="reliquary-grain ornate-frame mb-10 border border-[hsl(var(--outline-variant)/0.18)] bg-[linear-gradient(180deg,hsl(var(--surface-strong)/0.72),hsl(var(--surface-base)/0.9))] p-6 shadow-elevated md:p-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_auto] lg:items-center">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center border border-[hsl(var(--brand)/0.2)] bg-[linear-gradient(180deg,hsl(var(--surface-strong)/0.94),hsl(var(--surface-base)/0.98))] shadow-panel">
                  <img src={logoEmblem} alt="Emblema da campanha" className="h-9 w-9 object-contain" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary/78">
                    Forge the journey
                  </p>
                  <p className="font-display text-3xl text-brand-gradient">
                    O atlas, a mesa e o arquivo agora falam a mesma lingua.
                  </p>
                </div>
              </div>

              <p className="max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
                Um portal dark fantasy pensado como reliquario digital: cronicas, contratos,
                mapas e fichas organizados como partes do mesmo artefato.
              </p>

              <div className="flex flex-wrap gap-3">
                <Badge variant="outline">Assets originais ou licenciados</Badge>
                <Badge variant="secondary">Atlas navegavel + VTT + biblioteca</Badge>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/universo">Abrir o arquivo</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/criacao">Forjar personagem</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-10 md:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,1fr))]">
          <div className="space-y-4">
            <p className="section-kicker">Arquivo do continente</p>
            <h3 className="font-display text-2xl text-foreground">
              Estrada, rumor, combate e memoria viva.
            </h3>
            <p className="max-w-md text-sm leading-7 text-muted-foreground">
              O site foi redesenhado para soar menos como dashboard generico e mais como peca de
              mundo: denso, legivel e pronto para sustentar campanha longa.
            </p>
          </div>

          {footerLinks.map((column) => (
            <div key={column.title}>
              <p className="section-kicker">{column.title}</p>
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

        <div className="mt-12 grid gap-3 border-t border-[hsl(var(--outline-variant)/0.14)] pt-5 text-xs text-muted-foreground md:grid-cols-[1fr_auto] md:items-center">
          <p>(c) 2026 Areias de Zerrikania. Todos os direitos reservados.</p>
          <p>Ambientacao autoral com direcao visual dark fantasy editorial.</p>
        </div>
      </div>
    </footer>
  );
}
