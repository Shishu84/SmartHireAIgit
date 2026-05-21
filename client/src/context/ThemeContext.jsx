import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('smart_hire_theme');
      if (stored === 'dark' || stored === 'light') return stored;
    }
    return 'system';
  });

  const getSystemTheme = () => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const [activeTheme, setActiveTheme] = useState(() => {
    return theme === 'system' ? getSystemTheme() : theme;
  });

  const applyTheme = useCallback((targetTheme) => {
    const root = window.document.documentElement;
    const resolvedTheme = targetTheme === 'system' ? getSystemTheme() : targetTheme;
    
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
    
    setActiveTheme(resolvedTheme);
  }, []);

  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('smart_hire_theme', newTheme);
    applyTheme(newTheme);
  }, [applyTheme]);

  const toggleTheme = useCallback(() => {
    const current = theme === 'system' ? getSystemTheme() : theme;
    setTheme(current === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  // Handle system theme changes when in 'system' mode
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, applyTheme]);

  // Initial application
  useEffect(() => {
    applyTheme(theme);
  }, []); // Run once on mount

  return (
    <ThemeContext.Provider value={{ theme, setTheme, activeTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
