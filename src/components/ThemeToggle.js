'use client';

import { useEffect, useState } from 'react';

const themes = ['light', 'dark', 'revenge'];
const labels = { light: 'Light', dark: 'Blue Night', revenge: 'Revenge' };
const storageKey = 'cseb-theme';
const themeEvent = 'cseb-theme-change';

export default function ThemeToggle() {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    function syncTheme() {
      const current = document.documentElement.dataset.theme;
      setTheme(themes.includes(current) ? current : 'dark');
    }
    function handleChange(event) {
      const next = event.detail?.theme;
      if (themes.includes(next)) {
        document.documentElement.dataset.theme = next;
        setTheme(next);
      }
    }
    function handleStorage(event) {
      if (event.key === storageKey) {
        const next = themes.includes(event.newValue) ? event.newValue : 'dark';
        document.documentElement.dataset.theme = next;
        setTheme(next);
      }
    }
    syncTheme();
    window.addEventListener(themeEvent, handleChange);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener(themeEvent, handleChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  function changeTheme(event) {
    const next = event.target.value;
    document.documentElement.dataset.theme = next;
    setTheme(next);
    try { localStorage.setItem(storageKey, next); } catch { /* Keep selection usable when storage is unavailable. */ }
    window.dispatchEvent(new CustomEvent(themeEvent, { detail: { theme: next } }));
  }

  return (
    <label className="themePicker">
      <span className="themePicker__label">Theme</span>
      <select aria-label="Color theme" value={theme} onChange={changeTheme}>
        {themes.map((value) => <option key={value} value={value}>{labels[value]}</option>)}
      </select>
    </label>
  );
}
