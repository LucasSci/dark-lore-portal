import { Flame } from "lucide-react";
import { Link } from "react-router-dom";

import { archiveBrand } from "@/lib/archive-reference";
import { getFooterEntries } from "@/lib/route-manifest";

const footerLinks = getFooterEntries();

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-[rgba(201,161,90,0.18)] bg-black py-12 safe-bottom">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(201,161,90,0.08),transparent_55%)]" />
      <div className="relative mx-auto flex max-w-[1440px] flex-col items-center gap-8 px-6 text-center">
        <Flame className="h-7 w-7 text-[rgba(255,204,102,0.45)]" />
        <div className="flex flex-wrap justify-center gap-6">
          {footerLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="font-heading text-xs uppercase tracking-[0.24em] text-[rgba(227,218,203,0.56)] transition-colors hover:text-[#ffcc66]"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <p className="text-xs tracking-[0.18em] text-[rgba(227,218,203,0.34)]">
          (c) 2026 {archiveBrand.title}. O arquivo permanece aberto.
        </p>
      </div>
    </footer>
  );
}
