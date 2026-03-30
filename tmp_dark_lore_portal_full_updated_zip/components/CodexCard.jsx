import React from 'react';

/**
 * Represents a codex entry with optional icon, a title and description.
 */
const CodexCard = ({ icon, title, description }) => {
  return (
    <div className="bg-secondaryDark border-2 border-antiqueGold rounded-lg p-4 shadow-md transition-transform transform hover:-translate-y-1 hover:shadow-lg hover:border-softAmber">
      {icon && <div className="text-3xl text-softAmber mb-2">{icon}</div>}
      <h3 className="text-xl font-display text-antiqueGold mb-2">{title}</h3>
      <p className="text-antiqueGold text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export default CodexCard;