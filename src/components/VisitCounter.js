'use client';

import { useEffect, useState } from 'react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import styles from '@/app/page.module.css';

export default function VisitCounter() {
  const [count, setCount] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let isMounted = true;

    async function handleVisitTracking() {
      try {
        // 1. Initialize the free client-side fingerprinter agent
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        
        // This is your stable, unique 32-character browser/hardware hash
        const visitorId = result.visitorId;

        // 2. Send the visitor ID to your API route
        // Your backend route should read this ID, check if it's unique, and return the total count
        const response = await fetch('/api/visits', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ visitorId }),
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Unable to handle visit tracking.');
        }

        const data = await response.json();

        if (isMounted) {
          setCount(data.count);
          setStatus('ready');
        }
      } catch (error) {
        console.error('Tracking Error:', error);
        if (isMounted) {
          setCount(null);
          setStatus('error');
        }
      }
    }

    handleVisitTracking();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className={styles.visitCounter} aria-live="polite">
      {status === 'ready' ? (
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