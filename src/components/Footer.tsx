import { Link } from "react-router-dom";

import { archiveBrand } from "@/lib/archive-reference";
import { getFooterEntries } from "@/lib/route-manifest";

const footerLinks = getFooterEntries();

export default function Footer() {
  return (
    <footer className="soz-footer">
      <div className="soz-container">
        <div className="soz-footer-inner">
          <div>
            <strong
              style={{
                fontFamily: "var(--font-display)",
                color: "#f4ecdf",
                display: "block",
                marginBottom: "0.35rem",
              }}
            >
              {archiveBrand.title}
            </strong>
            <span>{archiveBrand.subtitle} • universo, lore, bestiario e campanhas.</span>
          </div>

          <div className="soz-footer-links">
            {footerLinks.map((link) => (
              <Link key={link.path} to={link.path}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
