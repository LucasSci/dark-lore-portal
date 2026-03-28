import React from 'react';

/**
 * A reusable ornamental divider consisting of horizontal lines flanking a star‑like symbol.
 */
const OrnamentalDivider = () => (
  <div className="flex items-center justify-center my-6">
    <span className="flex-1 border-t border-antiqueGold" />
    <span className="mx-4 text-antiqueGold text-xl">✦</span>
    <span className="flex-1 border-t border-antiqueGold" />
  </div>
);

export default OrnamentalDivider;