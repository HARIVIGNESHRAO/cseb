'use client';

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { Check, ChevronDown, FileText, HardDrive, Mic, Search, X } from 'lucide-react';
import { readSavedPdfFiles } from '@/lib/offlinePdfs';
import { RECENT_MATERIALS_EVENT } from '@/lib/recentMaterials';
import { searchPdfMaterials } from '@/lib/materialSearch';
import useSemesterSearch from '@/hooks/useSemesterSearch';
import SearchScope from '@/components/SearchScope';
import styles from '@/app/page.module.css';
import searchStyles from './HomeSearch.module.css';

export default function HomeSearch({ pdfCatalog = [] }) {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('portal');
  const [savedOnly, setSavedOnly] = useState(false);
  const [savedState, setSavedState] = useState({ files: [], offline: false, origin: '', loading: true });
  const pdfMode = mode === 'pdf';
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const { semester, scope, setScope, results, normalizedQuery } = useSemesterSearch(query);

  useEffect(() => {
    if (!pdfMode) return;
    let active = true;
    let request = 0;
    async function refresh() {
      const current = ++request;
      const offline = !navigator.onLine;
      if (active) setSavedState((state) => ({ ...state, offline }));
      const files = await readSavedPdfFiles().catch(() => []);
      if (active && current === request) {
        setSavedState({ files, offline, origin: window.location.origin, loading: false });
      }
    }
    const events = ['focus', 'online', 'offline', RECENT_MATERIALS_EVENT];
    for (const event of events) window.addEventListener(event, refresh);
    refresh();
    return () => {
      active = false;
      for (const event of events) window.removeEventListener(event, refresh);
    };
  }, [pdfMode]);

  const filterSaved = savedOnly || savedState.offline;
  const pdfResults = pdfMode ? searchPdfMaterials(pdfCatalog, query, savedState.files, {
    savedOnly: filterSaved,
    origin: savedState.origin,
  }) : [];

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
      <div className={searchStyles.searchRow}>
        <div className={searchStyles.field}>
          <Search size={19} className={searchStyles.searchIcon} aria-hidden="true" />
          <input
            type="search"
            className={searchStyles.input}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={pdfMode ? 'Search PDFs by title, subject, or unit…' : 'Search subjects, units, papers…'}
            aria-label={pdfMode ? 'Search PDFs by title, subject, or unit' : 'Search subjects, units, papers'}
          />
          {query && <button
            type="button"
            className={searchStyles.iconButton}
            onClick={() => setQuery('')}
            aria-label="Clear search"
          ><X size={17} aria-hidden="true" /></button>}
          <button
            type="button"
            className={searchStyles.iconButton}
            onClick={isListening ? stopListening : startListening}
            aria-pressed={isListening}
            aria-label="Voice search"
          ><Mic size={17} aria-hidden="true" /></button>
        </div>

        <div className={searchStyles.mode}>
          <select aria-label="Search type" value={mode} onChange={(event) => setMode(event.target.value)}>
            <option value="portal">Subjects and units</option>
            <option value="pdf">PDF materials</option>
          </select>
          <ChevronDown className={searchStyles.modeArrow} size={24} aria-hidden="true" />
        </div>
      </div>

      {pdfMode && <button
        type="button"
        className={searchStyles.savedFilter}
        aria-pressed={filterSaved}
        disabled={savedState.offline}
        onClick={() => setSavedOnly((enabled) => !enabled)}
      >
        <HardDrive size={15} aria-hidden="true" />
        Saved offline
        {filterSaved && <Check size={14} aria-hidden="true" />}
      </button>}

      {pdfMode && (normalizedQuery || filterSaved) && <div className={styles.searchResults}>
        {filterSaved && savedState.loading ? <div className={styles.searchEmpty} role="status">Checking saved PDFs…</div> :
          pdfResults.length ? pdfResults.map((pdf) => (
            <a key={pdf.id} href={pdf.href} className={styles.searchResult} target="_blank" rel="noopener noreferrer" data-recent-title={pdf.title}>
              <span className={styles.searchResultIcon}><FileText size={17} aria-hidden="true" /></span>
              <span className={styles.searchResultText}>
                <span className={styles.searchResultTitle}>{pdf.title}</span>
                <span className={styles.searchResultMeta}>
                  {pdf.subjectName} · {pdf.unitName}{pdf.saved ? ' · Saved offline' : ''}
                </span>
              </span>
              <span className={styles.searchResultArrow} aria-hidden="true">↗</span>
            </a>
          )) : <div className={styles.searchEmpty} role="status">{filterSaved ? 'No matching PDFs saved offline.' : 'No matching PDFs found.'}</div>}
      </div>}

      {!pdfMode && normalizedQuery ? (
        <div className={styles.searchResults}>
          <SearchScope semester={semester} scope={scope} setScope={setScope} />
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
                  <span className={styles.searchResultMeta}><span className={styles.searchSemesterBadge}>{item.semester}</span> {item.meta.slice(item.semester.length + 3)}</span>
                </span>
                <span className={styles.searchResultArrow}>→</span>
              </Link>
            ))
          ) : (
            <div className={styles.searchEmpty} role="status">
              <p>{scope === 'current' ? `No results in semester ${semester}.` : 'No matching study material found.'}</p>
              {scope === 'current' && <button type="button" className={styles.searchExpandScope} onClick={() => setScope('all')}>Search all semesters</button>}
            </div>
          )}
        </div>
      ) : null}

      {isListening && (
        <p className={styles.listeningText}>🎙️ Listening... Speak now</p>
      )}
    </section>
  );
}