import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      console.log('🎨 Initial theme from localStorage:', saved || 'light');
      return saved || 'light';
    }
    return 'light';
  });

  // Apply theme on mount and when theme changes
  useEffect(() => {
    const html = document.documentElement;
    console.log('🎨 Setting theme to:', theme);
    console.log('🎨 Available themes:', themes);
    html.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Initialize theme from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved) {
      console.log('🎨 Initializing theme from localStorage:', saved);
      setTheme(saved);
      document.documentElement.setAttribute('data-theme', saved);
    }
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const themes = [
    'light',
    'dark',
    'cupcake',
    'bumblebee',
    'emerald',
    'corporate',
    'synthwave',
    'retro',
    'cyberpunk',
    'valentine',
    'halloween',
    'garden',
    'forest',
    'aqua',
    'lofi',
    'pastel',
    'fantasy',
    'wireframe',
    'black',
    'luxury',
    'dracula',
    'cmyk',
    'autumn',
    'business',
    'acid',
    'lemonade',
    'night',
    'coffee',
    'winter',
    'dim',
    'nord',
    'sunset'
  ];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
