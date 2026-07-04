'use client';

import { useEffect, useState } from 'react';

const storageKey = 'cseb-theme';
const themeEvent = 'cseb-theme-change';

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem(storageKey);
    const nextTheme = savedTheme === 'light' ? 'light' : 'dark';

    setTheme(nextTheme);
    applyTheme(nextTheme);

    function handleThemeChange(event) {
      const nextEventTheme = event.detail?.theme;

      if (nextEventTheme === 'light' || nextEventTheme === 'dark') {
        setTheme(nextEventTheme);
        applyTheme(nextEventTheme);
      }
    }

    window.addEventListener(themeEvent, handleThemeChange);

    return () => window.removeEventListener(themeEvent, handleThemeChange);
  }, []);

  function handleToggle() {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';

    setTheme(nextTheme);
    applyTheme(nextTheme);
    localStorage.setItem(storageKey, nextTheme);
    window.dispatchEvent(new CustomEvent(themeEvent, { detail: { theme: nextTheme } }));
  }

  return (
    <button
      type="button"
      className="themeToggle"
      onClick={handleToggle}
      role="switch"
      aria-checked={theme === 'light'}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      data-theme-state={theme}
    >
      <span className="themeToggle__icon themeToggle__icon--moon" aria-hidden="true">
        ☾
      </span>
      <span className="themeToggle__icon themeToggle__icon--sun" aria-hidden="true">
        ☀
      </span>
      <span className="themeToggle__thumb" aria-hidden="true" />
    </button>
  );
}
