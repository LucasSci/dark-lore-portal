import React, { useState } from 'react';
import Link from 'next/link';

/**
 * Top navigation bar for the Dark Lore Portal site. Includes a site name and links
 * to all major pages. The bar uses a dark background and golden accents. On
 * smaller screens the navigation collapses to a simple menu button.
 */
const Navbar = () => {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen(!open);
  return (
    <nav className="bg-secondaryDark border-b border-deepCrimson text-antiqueGold sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-16">
        <Link href="/" className="text-2xl font-display hover:text-softAmber transition-colors">
          Dark&nbsp;Lore&nbsp;Portal
        </Link>
        <div className="md:hidden">
          <button
            aria-label="Toggle navigation"
            onClick={toggle}
            className="focus:outline-none text-antiqueGold hover:text-softAmber"
          >
            ☰
          </button>
        </div>
        <div className={`flex-col md:flex-row md:flex md:items-center gap-4 md:gap-8 absolute md:static top-full left-0 right-0 bg-secondaryDark md:bg-transparent border-t md:border-none border-deepCrimson md:border-0 ${open ? 'flex' : 'hidden'}`}
        >
          {[
            { href: '/', label: 'Início' },
            { href: '/universo', label: 'Universo' },
            { href: '/criaturas', label: 'Criaturas' },
            { href: '/reinos', label: 'Reinos' },
            { href: '/artefatos', label: 'Artefatos' },
            { href: '/cronicas', label: 'Crônicas' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block py-3 md:py-0 px-4 md:px-0 text-antiqueGold hover:text-softAmber transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;