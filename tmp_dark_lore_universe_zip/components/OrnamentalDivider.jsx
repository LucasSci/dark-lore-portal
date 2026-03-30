import React from 'react';

/**
 * A simple ornamental divider made of lines and a central symbol.  
 * The divider can be reused between sections to evoke a sense of medieval craftsmanship.
 */
const OrnamentalDivider = () => {
  return (
    <div className="flex items-center justify-center my-6">
      <span className="flex-1 border-t border-antiqueGold" />
      <span className="mx-4 text-antiqueGold text-xl">✦</span>
      <span className="flex-1 border-t border-antiqueGold" />
    </div>
  );
};

export default OrnamentalDivider;