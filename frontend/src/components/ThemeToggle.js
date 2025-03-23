// frontend/src/components/ThemeToggle.js
import React from 'react';
import '../styles/ThemeToggle.css';

const ThemeToggle = ({ darkMode, toggleDarkMode }) => {
  return (
    <button 
      className="theme-toggle" 
      onClick={toggleDarkMode}
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      <div className="toggle-track">
        <div className="toggle-indicator">
          {darkMode ? (
            <span className="toggle-icon">☀️</span>
          ) : (
            <span className="toggle-icon">🌙</span>
          )}
        </div>
      </div>
    </button>
  );
};

export default ThemeToggle;