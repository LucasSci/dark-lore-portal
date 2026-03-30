import React from 'react';

/**
 * BestiaryCard previews a creature or legend entry in the archive. It
 * showcases an image, a name and a classification. Cards look like
 * collectible pages from a codex. On hover they subtly lift and glow.
 */
const BestiaryCard = ({ imageSrc, name, classification }) => {
  return (
    <div className="bg-secondaryDark border-2 border-antiqueGold rounded-lg overflow-hidden shadow-md transition-transform transform hover:-translate-y-1 hover:shadow-lg hover:border-softAmber cursor-pointer">
      {imageSrc && (
        <div className="h-40 md:h-56 w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt={name}
            className="object-cover w-full h-full"
          />
        </div>
      )}
      <div className="p-4">
          <h4 className="text-lg font-display text-antiqueGold mb-1">{name}</h4>
          <p className="text-antiqueGold text-xs opacity-80">{classification}</p>
      </div>
    </div>
  );
};

export default BestiaryCard;