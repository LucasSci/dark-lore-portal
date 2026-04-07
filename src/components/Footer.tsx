import { Flame } from "lucide-react";
import { Link } from "react-router-dom";

import { archiveBrand, archiveReferenceArt } from "@/lib/archive-reference";
import { getFooterEntries } from "@/lib/route-manifest";

const footerLinks = getFooterEntries();

export default function Footer() {
  return (
    <footer className="relative z-10 px-4 pb-6 pt-12 md:px-6">
      <div className="dark-lore-footer-inner mx-auto max-w-[1440px] overflow-hidden rounded-[24px] px-6 py-8 md:px-10 md:py-10">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top,rgba(89,195,255,0.12),transparent_60%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[url('/reference/generated/footer-runes.svg')] bg-center bg-no-repeat opacity-20" />

        <div className="relative grid gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[rgb(123_216_255_/_0.18)] bg-[rgb(18_26_42_/_0.76)] text-[var(--v2-soft-gold)]">
                <Flame className="h-4 w-4" />
              </span>
              <div>
                <p className="dark-lore-section-kicker">{archiveBrand.subtitle}</p>
                <h2 className="font-display text-[1.8rem] text-[var(--v2-soft-gold)]">
                  {archiveBrand.title}
                </h2>
              </div>
            </div>

            <p className="max-w-[44rem] text-sm leading-8 text-[rgb(232_224_207_/_0.72)]">
              Bestiarios, cronicas, atlas e suite de sessao agora compartilham uma mesma fundacao
              premium. O portal nao termina na leitura; ele continua quando a campanha se abre.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {footerLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="dark-lore-chip justify-start px-4 py-3 text-left"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="relative mt-8 flex flex-col gap-3 border-t border-[rgb(123_216_255_/_0.1)] pt-6 text-xs tracking-[0.16em] text-[rgb(232_224_207_/_0.42)] md:flex-row md:items-center md:justify-between">
          <p>(c) 2026 {archiveBrand.title}. O arquivo permanece aberto.</p>
          <img
            src={archiveReferenceArt.footerRunes}
            alt=""
            aria-hidden="true"
            className="h-4 w-auto opacity-45"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    </footer>
  );
}
