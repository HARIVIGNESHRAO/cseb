'use client';

import Link from 'next/link';
import { useMemo, useState, useRef } from 'react';
import { buildSearchItems, normalizeSearchValue } from '@/lib/searchItems';
import styles from '@/app/page.module.css';

export default function HomeSearch() {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const searchItems = useMemo(() => buildSearchItems(), []);
  const normalizedQuery = normalizeSearchValue(query);
  
  const results = normalizedQuery
    ? searchItems
        .filter((item) => item.searchText.includes(normalizedQuery))
        .slice(0, 8)
    : [];

  // Voice Search
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

  return (
    <section className={styles.searchSection} aria-label="Search study portal">
      <div className={styles.searchBox}>
        <span className={styles.searchIcon} aria-hidden="true">
          🔎
        </span>

        <input
          type="search"
          className={styles.searchInput}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search subjects, units, papers..."
          aria-label="Search subjects, units, papers"
        />

        {/* Nice SVG Microphone */}
        <button
          type="button"
          className={`${styles.micButton} ${isListening ? styles.listening : ''}`}
          onClick={isListening ? stopListening : startListening}
          aria-label={isListening ? "Stop listening" : "Voice search"}
          title={isListening ? "Listening... Click to stop" : "Search with voice"}
        >
          <svg width="22" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="22" />
          </svg>
        </button>

        {query ? (
          <button
            type="button"
            className={styles.searchClear}
            onClick={() => setQuery('')}
            aria-label="Clear search"
          >
            ×
          </button>
        ) : null}
      </div>

      {normalizedQuery ? (
        <div className={styles.searchResults}>
          {results.length ? (
            results.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={styles.searchResult}
                style={{ '--result-color': item.color }}
              >
                <span className={styles.searchResultIcon}>{item.icon}</span>
                <span className={styles.searchResultText}>
                  <span className={styles.searchResultTitle}>{item.title}</span>
                  <span className={styles.searchResultMeta}>{item.meta}</span>
                </span>
                <span className={styles.searchResultArrow}>→</span>
              </Link>
            ))
          ) : (
            <p className={styles.searchEmpty}>No matching study material found.</p>
          )}
        </div>
      ) : null}

      {isListening && (
        <p className={styles.listeningText}>🎙️ Listening... Speak now</p>
      )}
    </section>
  );
}