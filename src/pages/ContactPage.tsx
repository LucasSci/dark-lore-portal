import { Mail, MapPin, MessageSquareMore } from "lucide-react";
import { Link } from "react-router-dom";

import { archiveBrand } from "@/lib/archive-reference";
import { usePortalShellMode } from "@/lib/portal-state";

const contactPanels = [
  {
    icon: Mail,
    title: "Correio do Arquivo",
    body: "Canal para pedidos de acesso, relatos entregues ao arquivo e correspondencias de campanha.",
    action: "arquivo@zerrikania.cont",
  },
  {
    icon: MessageSquareMore,
    title: "Sala de Sessao",
    body: "Acesso rapido ao nucleo de jogo para mesa, oraculo e acompanhamento da campanha.",
    action: "Ir para jogar",
    href: "/jogar",
  },
  {
    icon: MapPin,
    title: "Cartografia e Dossies",
    body: "Sugestoes de verbetes, monstros e locais podem ser entregues ao arquivo central.",
    action: "Ver universo",
    href: "/universo",
  },
];

export default function ContactPage() {
  usePortalShellMode("editorial", "ambient");

  return (
    <div className="mx-auto max-w-[1280px] space-y-10 px-4 py-10 md:px-6 md:py-14">
      <section className="dark-lore-page-frame dark-lore-page-hero dark-lore-contact-hero">
        <div className="dark-lore-hero-copy dark-lore-hero-copy-centered">
          <p className="dark-lore-section-kicker justify-center">{archiveBrand.subtitle}</p>
          <h1 className="dark-lore-display-title">Fale com o Arquivo</h1>
          <p className="dark-lore-hero-text max-w-3xl text-center">
            Toda correspondencia que cruza estas portas passa por Areias de Zerrikania. Se houver
            algo a registrar, este e o limiar.
          </p>
        </div>
      </section>

      <section className="dark-lore-page-frame px-6 py-8 md:px-8 md:py-10">
        <div className="grid gap-5 md:grid-cols-3">
          {contactPanels.map(({ icon: Icon, title, body, action, href }) => (
            <article key={title} className="dark-lore-archive-card">
              <div className="flex h-11 w-11 items-center justify-center border border-[hsl(var(--brand)/0.22)] bg-[hsl(var(--background)/0.36)] text-primary">
                <Icon className="h-4 w-4" />
              </div>
              <h2 className="font-display text-3xl text-[hsl(var(--gold-light))]">{title}</h2>
              <p className="text-sm leading-7 text-[hsl(var(--foreground)/0.76)]">{body}</p>
              {href ? (
                <Link to={href} className="dark-lore-button dark-lore-button-ghost">
                  {action}
                </Link>
              ) : (
                <span className="dark-lore-contact-inline">{action}</span>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
