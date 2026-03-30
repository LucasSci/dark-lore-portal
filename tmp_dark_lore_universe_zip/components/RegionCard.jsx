import React from 'react';

/**
 * RegionCard represents a geographical region or faction in the world grid.  
 * It displays an image, the region name and a brief description. On hover
 * the card lifts slightly and glows to indicate further details are available
 * on click. The click behaviour (opening deeper lore) should be
 * implemented in the future.
 */
const RegionCard = ({ imageSrc, name, description }) => {
  return (
    <div className="group cursor-pointer bg-secondaryDark border-2 border-antiqueGold rounded-lg overflow-hidden shadow-md transition-transform transform hover:-translate-y-1 hover:shadow-lg hover:border-softAmber">
      {imageSrc && (
        <div className="h-40 md:h-56 w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt={name}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="p-4">
        <h4 className="text-lg font-display text-antiqueGold mb-1">{name}</h4>
        <p className="text-antiqueGold text-xs leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

export default RegionCard;