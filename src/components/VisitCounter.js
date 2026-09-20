'use client';

import { useEffect, useState } from 'react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import styles from '@/app/page.module.css';

const VISIT_COUNT_CACHE_KEY = 'cseb-visit-count';
const isValidCount = (value) => Number.isSafeInteger(value) && value >= 0;

export default function VisitCounter() {
  const [count, setCount] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let isMounted = true;
    let trackingUpdated = false;
    let receivedCount = false;
    let pending = 2;
    const controller = new AbortController();

    try {
      const cached = localStorage.getItem(VISIT_COUNT_CACHE_KEY);
      const cachedCount = cached === null ? null : JSON.parse(cached);
      if (isValidCount(cachedCount)) {
        receivedCount = true;
        setCount(cachedCount);
        setStatus('ready');
      }
    } catch {
      // Continue with the live request if browser storage is unavailable or invalid.
    }

    async function loadCount(trackVisit) {
      try {
        let options = {};
        if (trackVisit) {
          const fp = await FingerprintJS.load();
          const { visitorId } = await fp.get();
          if (!isMounted) return;
          options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ visitorId }),
          };
        }

        const response = await fetch('/api/visits', {
          ...options,
          cache: 'no-store',
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('Unable to load visitor count.');
        const data = await response.json();
        if (!isValidCount(data.count)) throw new Error('Invalid visitor count.');

        // The tracking response includes this visit; an older GET must not replace it.
        if (isMounted && (trackVisit || !trackingUpdated)) {
          if (trackVisit) trackingUpdated = true;
          receivedCount = true;
          setCount(data.count);
          setStatus('ready');
          try {
            localStorage.setItem(VISIT_COUNT_CACHE_KEY, JSON.stringify(data.count));
          } catch {
            // Keep the live count even if saving it fails.
          }
        }
      } catch (error) {
        if (isMounted) console.error('Visit counter error:', error);
      } finally {
        pending -= 1;
        if (isMounted && pending === 0 && !receivedCount) setStatus('error');
      }
    }

    // Fetch the current total immediately; identify and register this visit independently.
    void loadCount(false);
    void loadCount(true);

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  return (
    <div className={styles.visitCounter} aria-live="polite">
      {count !== null ? (
        <>
          <span className={styles.visitCounterValue}>
            {new Intl.NumberFormat('en-IN').format(count)}
          </span>
          <span className={styles.visitCounterLabel}>visitors so far</span>
        </>
      ) : (
        <span className={styles.visitCounterLabel}>
          {status === 'loading' ? 'Visitors loading...' : 'Visitors unavailable'}
        </span>
      )}
    </div>
  );
}
