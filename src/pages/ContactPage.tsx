import { Mail, MapPin, MessageSquareMore } from "lucide-react";
import { Link } from "react-router-dom";

import { V2MetadataPanel, V2QuoteBlock } from "@/components/portal/v2/PortalV2";
import { archiveBrand, archiveReferenceArt } from "@/lib/archive-reference";
import { usePortalShellMode } from "@/lib/portal-state";

const contactPanels = [
  {
    icon: Mail,
    title: "Correio do Arquivo",
    body: "Pedidos de acesso, relatos entregues ao arquivo e correspondencias de campanha.",
    action: "arquivo@zerrikania.cont",
  },
  {
    icon: MessageSquareMore,
    title: "Suite de sessao",
    body: "Acesso rapido a mesa, Story Engine, oraculo e acompanhamento da campanha.",
    action: "Abrir jogar",
    href: "/jogar",
  },
  {
    icon: MapPin,
    title: "Dossies e cartografia",
    body: "Sugestoes de verbetes, criaturas ou locais podem ser entregues ao arquivo central.",
    action: "Ver universo",
    href: "/universo",
  },
] as const;

export default function ContactPage() {
  usePortalShellMode("editorial", "ambient");

  return (
    <div className="portal-v2-page">
      <section className="portal-v2-section relative min-h-[28rem] overflow-hidden">
        <div className="portal-v2-hero-media">
          <img src={archiveReferenceArt.forgotten} alt="" aria-hidden="true" decoding="async" />
        </div>
        <div className="portal-v2-hero-overlay" />
        <div className="relative z-[1] flex min-h-[28rem] flex-col justify-end gap-5 p-6 md:p-10">
          <p className="portal-v2-kicker">{archiveBrand.subtitle}</p>
          <h1 className="portal-v2-title max-w-[10ch]">Toda correspondencia digna do arquivo comeca aqui.</h1>
          <p className="portal-v2-body max-w-[44rem]">
            A V2 trata contato como parte do produto: um ponto de passagem entre leitura,
            campanha e dossies, e nao uma pagina esquecida fora do universo visual.
          </p>
        </div>
      </section>

      <section className="portal-v2-grid-3">
        {contactPanels.map(({ icon: Icon, title, body, action, href }) => (
          <article key={title} className="portal-v2-detail-card">
            <div className="portal-v2-card-body">
              <p className="portal-v2-card-meta">
                <Icon className="h-4 w-4" />
                Contact channel
              </p>
              <h2 className="portal-v2-card-title">{title}</h2>
              <p className="portal-v2-card-copy">{body}</p>
              {href ? (
                <Link to={href} className="dark-lore-button dark-lore-button-ghost">
                  {action}
                </Link>
              ) : (
                <span className="dark-lore-contact-inline">{action}</span>
              )}
            </div>
          </article>
        ))}
      </section>

      <section className="portal-v2-subgrid">
        <V2MetadataPanel
          title="Como usar este limiar"
          rows={[
            {
              label: "Para campanha",
              value: "Abrir suporte de mesa, alinhar preparo visual ou conectar manuscritos a uma sessao ativa.",
            },
            {
              label: "Para lore",
              value: "Entregar referencias de faccoes, criaturas, locais e ecos que devam entrar no arquivo.",
            },
            {
              label: "Para produto",
              value: "Sugerir ajustes de UX, novos modulos internos ou integracoes para a suite narrativa.",
            },
          ]}
        />

        <div className="space-y-5">
          <V2QuoteBlock>
            "Se uma rota existe no portal, ela precisa soar como parte do mesmo mundo. Contato
            tambem e worldbuilding."
          </V2QuoteBlock>
          <div className="portal-v2-actions">
            <Link to="/cronicas" className="dark-lore-button dark-lore-button-ghost">
              Abrir cronicas
            </Link>
            <Link to="/mapa" className="dark-lore-button dark-lore-button-ghost">
              Abrir atlas
            </Link>
            <Link to="/jogar" className="dark-lore-button">
              Entrar na suite
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
