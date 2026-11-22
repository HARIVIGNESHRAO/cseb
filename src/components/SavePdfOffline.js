'use client';

import { useEffect, useRef, useState } from 'react';
import { PDF_CACHE, savedPdfPath, saveOfflinePdf } from '@/lib/offlinePdfs';
import styles from './PdfViewer.module.css';

export default function SavePdfOffline({ url, title, compact = false, buttonClassName, catalogId, revision = '' }) {
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const lock = useRef(false);
  useEffect(() => {
    let cancelled = false;
    setSaved(false);
    setMessage('');
    if ('caches' in window) caches.open(PDF_CACHE).then((cache) => cache.match(savedPdfPath(url)))
      .then((file) => { if (!cancelled) setSaved(Boolean(file)); }).catch(() => {});
    return () => { cancelled = true; };
  }, [url]);
  async function save() {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setMessage('Saving PDF… Keep this page open until it finishes.');
    try {
      if (process.env.NODE_ENV !== 'production') throw new Error('Offline saving is available in the production build. Use npm run build and npm start, or the deployed website.');
      if (!('caches' in window) || !('serviceWorker' in navigator)) throw new Error('Offline saving is unavailable in this browser. Use Download PDF instead.');
      await navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' });
      await navigator.serviceWorker.ready;
      await saveOfflinePdf(url, title, { catalogId, revision });
      setSaved(true);
      setMessage('Saved on this device. Find it under Saved PDFs, even without internet.');
      navigator.storage?.persist?.().catch(() => {});
    } catch (error) {
      setMessage(error.name === 'QuotaExceededError'
        ? 'Device storage is full. Remove a saved PDF or use Download PDF.'
        : error instanceof TypeError ? 'Could not save from this PDF host. Use Download PDF to read offline instead.' : error.message);
    } finally { lock.current = false; setBusy(false); }
  }
  return <div className={`${styles.offlineActions} ${compact ? styles.compactOffline : ''}`}>
    {saved ? <a className={buttonClassName || styles.askAiButton} href={savedPdfPath(url)} data-recent-title={title} target="_blank" rel="noopener noreferrer">{compact ? 'Saved · Open' : 'Open saved PDF ↗'}</a>
      : <button type="button" className={buttonClassName || styles.askAiButton} disabled={busy} onClick={save}>{busy ? 'Saving PDF…' : compact ? 'Save offline' : 'Save for offline'}</button>}
    <p className={styles.accessStatus} role="status">{message}</p>
  </div>;
}
