import { useEffect, useState } from 'react';

export function useDarkMode() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(prefersDark);

    // Listen for changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    // Check for user override in localStorage
    const stored = localStorage.getItem('theme');
    if (stored === 'dark') setIsDark(true);
    if (stored === 'light') setIsDark(false);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Allow manual override
  const setTheme = (theme: 'dark' | 'light') => {
    setIsDark(theme === 'dark');
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  };

  // Toggle function for convenience
  const toggleDarkMode = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return { darkMode: isDark, setTheme, toggleDarkMode, mounted };
}
