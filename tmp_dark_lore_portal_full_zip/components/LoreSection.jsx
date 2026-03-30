import React from 'react';
import OrnamentalDivider from './OrnamentalDivider';

/**
 * Displays a two‑column section with parchment background for narrative content.
 */
const LoreSection = ({ title, text, imageSrc }) => {
  return (
    <section className="bg-parchment bg-cover bg-center py-12 px-4 md:px-8 lg:px-16">
      <div className="max-w-6xl mx-auto">
        {title && (
          <h2 className="text-3xl md:text-4xl font-display text-deepCrimson mb-4 text-center md:text-left">
            {title}
          </h2>
        )}
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 text-secondaryDark text-lg leading-relaxed space-y-4">
            {Array.isArray(text)
              ? text.map((paragraph, idx) => (
                  <p key={idx} className="drop-shadow-md">
                    {paragraph}
                  </p>
                ))
              : <p className="drop-shadow-md">{text}</p>}
          </div>
          {imageSrc && (
            <div className="flex-1 w-full h-72 md:h-96 relative overflow-hidden rounded-lg shadow-lg border-2 border-antiqueGold">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageSrc}
                alt={title || 'Illustration'}
                className="object-cover w-full h-full"
              />
            </div>
          )}
        </div>
        <OrnamentalDivider />
      </div>
    </section>
  );
};

export default LoreSection;