import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button className="theme-toggle" onClick={toggleTheme} aria-label="Переключить тему">
      {isDark ? '🌙' : '☀️'}
    </button>
  );
};

export default ThemeToggle;
