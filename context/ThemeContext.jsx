'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark'); // Default to dark as per current design
  const [accentColor, setAccentColor] = useState('#4F46E5'); // Default primary indigo

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const savedAccent = localStorage.getItem('accentColor') || '#4F46E5';
    setTheme(savedTheme);
    setAccentColor(savedAccent);
    
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(savedTheme);
    document.documentElement.style.setProperty('--primary', savedAccent);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newTheme);
  };

  const changeAccent = (color) => {
    setAccentColor(color);
    localStorage.setItem('accentColor', color);
    document.documentElement.style.setProperty('--primary', color);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, accentColor, changeAccent }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
