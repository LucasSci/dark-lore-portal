import { Link } from "react-router-dom";
import { BookOpenText, Compass, Instagram, Shield, Users, Youtube } from "lucide-react";

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

      <div className="container relative z-10 py-14 md:py-18">
        <div className="mx-auto max-w-6xl space-y-10">
          <div className="flex flex-col items-center gap-5 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[hsl(var(--brand)/0.22)] bg-[linear-gradient(180deg,hsl(var(--background)/0.82),hsl(var(--surface-base)/0.96))] shadow-panel">
              <img src={logoEmblem} alt="Emblema da campanha" className="h-10 w-10 object-contain" />
            </div>
            <div className="space-y-3">
              <p className="section-kicker">Portal do continente</p>
              <h3 className="font-display text-4xl text-brand-gradient md:text-5xl">
                Estrada, rumor, mapa e sessao na mesma moldura.
              </h3>
              <p className="mx-auto max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
                O rodape agora fecha a pagina como nas referencias: mais escuro, mais cerimonial e
                com menos ruido, para a experiencia terminar com peso de universo e nao de app.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link to="/universo">Abrir o arquivo</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/criacao">Forjar personagem</Link>
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 border-y border-[hsl(var(--brand)/0.16)] py-5">
            {footerLinks.flatMap((column) => column.links).map((link) => (
              <Link key={link.path} to={link.path} className="reference-footer-link">
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Badge variant="outline"><Compass className="mr-2 h-3.5 w-3.5" />Atlas</Badge>
            <Badge variant="outline"><BookOpenText className="mr-2 h-3.5 w-3.5" />Campanha</Badge>
            <Badge variant="outline"><Users className="mr-2 h-3.5 w-3.5" />Comunidade</Badge>
            <Badge variant="outline"><Shield className="mr-2 h-3.5 w-3.5" />Mestre</Badge>
          </div>

          <div className="flex items-center justify-center gap-3">
            <Link to="/comunidade" className="reference-social-orb" aria-label="Comunidade">
              <Users className="h-4 w-4" />
            </Link>
            <Link to="/universo" className="reference-social-orb" aria-label="Universo">
              <Instagram className="h-4 w-4" />
            </Link>
            <Link to="/campanha" className="reference-social-orb" aria-label="Campanha">
              <Youtube className="h-4 w-4" />
            </Link>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            <p>(c) 2026 Areias de Zerrikania. Todos os direitos reservados.</p>
            <p className="mt-2">Ambientacao autoral com direcao visual dark fantasy editorial.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
