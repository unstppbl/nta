// frontend/src/components/CharacterCounter.js
import React from 'react';
import '../styles/CharacterCounter.css';

const CharacterCounter = ({ current, limit = null }) => {
  // If no limit is provided, just display the count
  const isApproachingLimit = limit && current > limit * 0.8;
  const isAtLimit = limit && current >= limit;
  
  return (
    <div className={`character-counter ${isApproachingLimit ? 'approaching' : ''} ${isAtLimit ? 'at-limit' : ''}`}>
      {limit ? (
        <span>{current}/{limit}</span>
      ) : (
        <span>{current} chars</span>
      )}
    </div>
  );
};

export default CharacterCounter;