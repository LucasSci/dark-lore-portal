import { Link } from "react-router-dom";
import { archiveBrand } from "@/lib/archive-reference";
import { getFooterEntries } from "@/lib/route-manifest";

const footerLinks = getFooterEntries().map(({ label, path }) => ({
  label,
  path,
}));

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
              {archiveBrand.subtitle} reune dossies, cronicas, cartas do atlas e entradas de
              sessao sob o mesmo selo.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 border-y border-[hsl(var(--brand)/0.18)] py-5">
            {footerLinks.map((link) => (
              <Link key={link.path} to={link.path} className="dark-lore-footer-link">
                {link.label}
              </Link>
            ))}
          </div>

          <div className="space-y-2 text-center text-xs tracking-[0.14em] text-[hsl(var(--foreground)/0.54)]">
            <p>(c) 2026 {archiveBrand.title}</p>
            <p>Universo, bestiario, cronicas, cartografia e sessao em torno de Areias de Zerrikania.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
