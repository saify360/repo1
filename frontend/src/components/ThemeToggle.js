import React from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = ({ darkMode, toggleTheme }) => {
  return (
    <button 
      className="theme-toggle" 
      onClick={toggleTheme}
      data-testid="theme-toggle"
      aria-label="Toggle theme"
    >
      {darkMode ? (
        <>
          <Sun size={20} />
          <span>Light</span>
        </>
      ) : (
        <>
          <Moon size={20} />
          <span>Dark</span>
        </>
      )}
    </button>
  );
};

export default ThemeToggle;
