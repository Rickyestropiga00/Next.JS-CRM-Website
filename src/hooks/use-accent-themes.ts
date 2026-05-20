'use client';

import { useEffect, useState } from 'react';

const themes = ['blue', 'emerald', 'violet', 'rose'];

export function useAccentTheme() {
  const [theme, setTheme] = useState('rose');

  useEffect(() => {
    const storedTheme = localStorage.getItem('accent-theme');

    if (storedTheme && themes.includes(storedTheme)) {
      document.documentElement.classList.add(`theme-${storedTheme}`);
      setTheme(storedTheme);
    }
  }, []);

  const changeTheme = (newTheme: string) => {
    themes.forEach((theme) => {
      document.documentElement.classList.remove(`theme-${theme}`);
    });

    document.documentElement.classList.add(`theme-${newTheme}`);

    localStorage.setItem('accent-theme', newTheme);

    setTheme(newTheme);
  };

  return {
    theme,
    changeTheme,
  };
}
