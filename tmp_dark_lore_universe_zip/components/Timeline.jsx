import React from 'react';

/**
 * Timeline visualises a chronological sequence of eras in the world's history.
 * Each node displays its order number, title and a short description. On
 * medium screens and above the nodes are connected horizontally with
 * decorative lines. On small screens the nodes stack vertically.
 */
const Timeline = ({ eras }) => {
  return (
    <section className="py-12 px-4 md:px-8 lg:px-16 bg-tertiaryDark">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-display text-softAmber mb-8 text-center">
          Linha do Tempo
        </h2>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          {eras.map((era, index) => (
            <div
              key={era.title}
              className="relative flex flex-col items-center text-center mb-8 md:mb-0 flex-1"
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-deepCrimson border-2 border-antiqueGold text-antiqueGold font-display text-lg">
                {index + 1}
              </div>
              <h4 className="mt-3 text-antiqueGold font-display text-lg">
                {era.title}
              </h4>
              <p className="mt-1 text-antiqueGold text-xs max-w-xs">
                {era.description}
              </p>
              {/* Horizontal connector for medium and larger screens */}
              {index < eras.length - 1 && (
                <div className="hidden md:block absolute top-5 right-0 w-full md:w-auto h-px md:h-0 md:w-32 border-t border-antiqueGold transform translate-y-1/2" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Timeline;