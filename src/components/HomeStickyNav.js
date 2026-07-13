'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, useRef } from 'react';
import { buildSearchItems, normalizeSearchValue } from '@/lib/searchItems';
import styles from '@/app/page.module.css';

const navItems = [
  { href: '#subjects', label: 'Subjects' },
  { href: '#papers', label: 'Papers' },
];

export default function HomeStickyNav() {
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);   // ← This was missing

  const searchItems = useMemo(() => buildSearchItems(), []);
  const normalizedQuery = normalizeSearchValue(query);
  
  const results = normalizedQuery
    ? searchItems
        .filter((item) => item.searchText.includes(normalizedQuery))
        .slice(0, 5)
    : [];

  // Voice Search Functions
  const startListening = () => {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      alert("Voice search is not supported in your browser. Please use Chrome or Edge.");
      return;
    }

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN';

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim();
      setQuery(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event);
      setIsListening(false);
      alert('Sorry, voice recognition failed. Please try again.');
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  useEffect(() => {
    function syncVisibility() {
      setVisible(window.scrollY > 260 && window.location.hash !== '#search');
    }

    syncVisibility();
    window.addEventListener('scroll', syncVisibility, { passive: true });
    window.addEventListener('hashchange', syncVisibility);

    return () => {
      window.removeEventListener('scroll', syncVisibility);
      window.removeEventListener('hashchange', syncVisibility);
    };
  }, []);

  return (
    <nav
      className={`${styles.stickyNav} ${visible ? styles.stickyNavVisible : ''}`}
      aria-label="Home sections"
    >
      <a href="#" className={styles.stickyBrand}>
        CSE
      </a>

      <div className={styles.stickySearchWrap}>
        <label className={styles.stickySearch}>
          <span className={styles.stickySearchIcon} aria-hidden="true">
            🔎
          </span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className={styles.stickySearchInput}
            placeholder="Search"
            aria-label="Search study material"
          />

          {/* Nice Microphone SVG */}
          <button
            type="button"
            className={`${styles.stickyMicButton} ${isListening ? styles.listening : ''}`}
            onClick={isListening ? stopListening : startListening}
            aria-label={isListening ? "Stop voice search" : "Voice search"}
            title={isListening ? "Listening... Click to stop" : "Search with voice"}
          >
            <svg width="20" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="22" />
            </svg>
          </button>
        </label>

        {normalizedQuery ? (
          <div className={styles.stickySearchResults}>
            {results.length ? (
              results.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={styles.stickySearchResult}
                  onClick={() => setQuery('')}
                >
                  <span className={styles.stickySearchResultTitle}>{item.title}</span>
                  <span className={styles.stickySearchResultMeta}>{item.meta}</span>
                </Link>
              ))
            ) : (
              <p className={styles.stickySearchEmpty}>No results</p>
            )}
          </div>
        ) : null}
      </div>

      <div className={styles.stickyLinks}>
        {navItems.map((item) => (
          <a key={item.href} href={item.href} className={styles.stickyLink}>
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}