import React from 'react';

/**
 * Footer for the Dark Lore Portal site. Provides a simple trademark or
 * copyright notice and can be extended with links or social icons.
 */
const Footer = () => (
  <footer className="bg-secondaryDark border-t border-deepCrimson py-6 text-center text-sm text-antiqueGold">
    <p>
      &copy; {new Date().getFullYear()} Dark&nbsp;Lore&nbsp;Portal. Todos os direitos reservados.
    </p>
  </footer>
);

export default Footer;