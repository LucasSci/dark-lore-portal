import React from 'react';

/**
 * Portal grid inviting users to explore deeper archives.
 */
const ArchivePortal = ({ portals }) => {
  return (
    <section className="py-16 px-4 md:px-8 lg:px-16 bg-primaryDark border-t border-deepCrimson">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-display text-softAmber mb-6">
          Explore o Arquivo
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {portals.map((portal) => (
            <div
              key={portal.title}
              className="bg-secondaryDark border-2 border-antiqueGold rounded-lg p-6 cursor-pointer transition-transform transform hover:-translate-y-1 hover:shadow-xl hover:border-softAmber"
            >
              <h3 className="text-xl font-display text-antiqueGold mb-2">
                {portal.title}
              </h3>
              <p className="text-antiqueGold text-sm opacity-80">
                {portal.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ArchivePortal;