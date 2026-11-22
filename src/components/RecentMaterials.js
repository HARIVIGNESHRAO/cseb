'use client';

import { useEffect, useId, useState } from 'react';
import { BookOpen, Bookmark, Clock3, FileText } from 'lucide-react';
import { PDF_CACHE, savedPdfPath } from '@/lib/offlinePdfs';
import { RECENT_MATERIALS_KEY, RECENT_MATERIALS_EVENT, readRecentMaterials, recentPageUrl, saveRecentPage } from '@/lib/recentMaterials';
import { PDF_BOOKMARKS_EVENT, readPdfBookmarks, removePdfBookmark, savePdfBookmark } from '@/lib/pdfBookmarks';
import { getPdfPageCount } from '@/lib/pdfPageCount';
import styles from './RecentMaterials.module.css';

export default function RecentMaterials({ onlySaved = false }) {
  const [{ entries, bookmarks }, setMaterials] = useState({ entries: [], bookmarks: [] });
  const [bookmarking, setBookmarking] = useState(null);
  const [status, setStatus] = useState('');
  const [editing, setEditing] = useState(null);
  const [checkingPage, setCheckingPage] = useState(false);
  const [pageWarning, setPageWarning] = useState('');
  const pageWarningId = useId();
  useEffect(() => {
    let cancelled = false;
    let generation = 0;
    async function sync() {
      const run = ++generation;
      try {
        const recent = readRecentMaterials(localStorage);
        const cache = 'caches' in window ? await caches.open(PDF_CACHE).catch(() => null) : null;
        const resolve = async (entry) => {
          const source = new URL(entry.key || entry.href);
          source.hash = '';
          const candidates = [savedPdfPath(source.href)];
          if (source.origin === location.origin) candidates.push(savedPdfPath(source.pathname + source.search));
          for (const href of candidates) {
            if (await cache?.match(href).catch(() => null)) return { ...entry, sourceHref: source.href, href, saved: true };
          }
          return { ...entry, sourceHref: source.href, href: new URL(entry.href).pathname.startsWith('/__offline_pdf__/') ? source.href : entry.href, saved: false };
        };
        const [resolvedEntries, resolvedBookmarks] = await Promise.all([
          Promise.all(recent.map(resolve)),
          Promise.all(readPdfBookmarks(localStorage).map(resolve)),
        ]);
        const available = (entry) => (!onlySaved && navigator.onLine) || entry.saved;
        const availableEntries = resolvedEntries.filter(available);
        const availableBookmarks = resolvedBookmarks.filter(available);
        const isCurrent = () => !cancelled && run === generation;
        const verifyPage = async (entry) => {
          if (!Number.isSafeInteger(entry.page) || entry.page < 1) return false;
          try {
            return entry.page <= await getPdfPageCount(entry);
          } catch {
            return false;
          }
        };

        if (!isCurrent()) return;
        setMaterials((previous) => {
          const visible = (entry) => (other) => other.href === entry.href && other.page === entry.page;
          return {
            entries: availableEntries.map((entry) => previous.entries.some(visible(entry))
              ? entry : { ...entry, page: undefined }),
            bookmarks: availableBookmarks.filter((bookmark) =>
              previous.bookmarks.some((other) => visible(bookmark)(other) && other.label === bookmark.label)),
          };
        });
        const [checkedEntries, checkedBookmarks] = await Promise.all([
          Promise.all(availableEntries.map(async (entry) =>
            await verifyPage(entry) ? entry : { ...entry, page: undefined })),
          Promise.all(availableBookmarks.map(async (bookmark) => await verifyPage(bookmark) ? bookmark : null)),
        ]);
        if (isCurrent()) setMaterials({ entries: checkedEntries, bookmarks: checkedBookmarks.filter(Boolean) });
      } catch {
        if (!cancelled && run === generation) setMaterials({ entries: [], bookmarks: [] });
      }
    }
    sync();
    window.addEventListener(RECENT_MATERIALS_EVENT, sync);
    window.addEventListener(PDF_BOOKMARKS_EVENT, sync);
    window.addEventListener('storage', sync);
    window.addEventListener('focus', sync);
    window.addEventListener('online', sync);
    window.addEventListener('offline', sync);
    return () => {
      cancelled = true;
      window.removeEventListener(RECENT_MATERIALS_EVENT, sync);
      window.removeEventListener(PDF_BOOKMARKS_EVENT, sync);
      window.removeEventListener('storage', sync);
      window.removeEventListener('focus', sync);
      window.removeEventListener('online', sync);
      window.removeEventListener('offline', sync);
    };
  }, [onlySaved]);
  if (!entries.length && !bookmarks.length && !status) return null;
  const readingPositions = entries
    .filter((entry) => Number.isSafeInteger(entry.page) && entry.page > 0 && Number.isFinite(entry.pageSavedAt))
    .sort((first, second) => second.pageSavedAt - first.pageSavedAt);

  async function savePage(event, entry, isBookmark = false) {
    event.preventDefault();
    if (checkingPage) return;
    setPageWarning('');
    setStatus('');
    const fields = new FormData(event.currentTarget);
    const pageInput = fields.get('page');
    const page = Number(pageInput);
    if (!/^[1-9]\d*$/.test(pageInput) || !Number.isSafeInteger(page)) {
      setStatus('Enter a whole page number greater than zero.');
      return;
    }

    setCheckingPage(true);
    try {
      const pages = await getPdfPageCount(entry).catch(() => null);
      if (pages === null) {
        setStatus('Could not verify this PDF’s page count. Open it online or save an offline copy and try again.');
        return;
      }
      if (page > pages) {
        setPageWarning(`This PDF has ${pages} ${pages === 1 ? 'page' : 'pages'}. Enter a page from 1 to ${pages}.`);
        return;
      }
      const saved = isBookmark
        ? savePdfBookmark(localStorage, { title: entry.title, href: entry.sourceHref }, pageInput, fields.get('label'))
        : saveRecentPage(localStorage, entry.key || entry.href, pageInput);
      if (!saved) {
        setStatus(isBookmark ? 'Enter a bookmark label.' : 'This PDF is no longer in your recent history.');
        return;
      }
      setStatus(isBookmark ? 'Bookmark saved.' : `Page ${page} saved.`);
      setEditing(null);
      setBookmarking(null);
      window.dispatchEvent(new Event(isBookmark ? PDF_BOOKMARKS_EVENT : RECENT_MATERIALS_EVENT));
    } catch {
      setStatus('Could not save your page in this browser.');
    } finally {
      setCheckingPage(false);
    }
  }

  function deleteBookmark(bookmark) {
    try {
      removePdfBookmark(localStorage, bookmark);
      setStatus('Bookmark removed.');
      window.dispatchEvent(new Event(PDF_BOOKMARKS_EVENT));
    } catch {
      setStatus('Could not remove your bookmark in this browser.');
    }
  }

  return <>
    {readingPositions.length > 0 && <section className={styles.section} aria-label="Continue reading">
      <div className={styles.heading}><h2><BookOpen size={17} aria-hidden="true" /> Continue reading</h2></div>
      <div className={styles.grid}>{readingPositions.map((entry) => (
        <a key={entry.key || entry.href} href={recentPageUrl(entry.href, entry.page)} data-recent-title={entry.title} target="_blank" rel="noopener noreferrer" className={styles.item}>
          <FileText size={20} aria-hidden="true" />
          <span><strong>{entry.title}</strong><small>Resume on page {entry.page}{entry.saved ? ' · Saved on this device' : ''}</small></span>
        </a>
      ))}</div>
    </section>}
    {bookmarks.length > 0 && <section className={styles.section} aria-label="PDF bookmarks">
      <div className={styles.heading}><h2><Bookmark size={17} aria-hidden="true" /> PDF bookmarks</h2></div>
      <div className={styles.grid}>{bookmarks.map((bookmark) => (
        <div key={JSON.stringify([bookmark.sourceHref, bookmark.page, bookmark.label])} className={styles.recentCard}>
          <a href={recentPageUrl(bookmark.href, bookmark.page)} data-recent-title={bookmark.title} target="_blank" rel="noopener noreferrer" className={styles.item}>
            <Bookmark size={20} aria-hidden="true" />
            <span><strong>{bookmark.label}</strong><small>{bookmark.title} · Page {bookmark.page}{bookmark.saved ? ' · Saved on this device' : ''}</small></span>
          </a>
          <button type="button" className={styles.pageButton} aria-label={`Remove bookmark ${bookmark.label}, ${bookmark.title}, page ${bookmark.page}`} onClick={() => deleteBookmark(bookmark)}>Remove bookmark</button>
        </div>
      ))}</div>
    </section>}
    {entries.length > 0 && <section className={styles.section} aria-label="Recently opened materials">
      <div className={styles.heading}><h2><Clock3 size={17} aria-hidden="true" /> Recently opened</h2><button type="button" onClick={() => {
        try {
          localStorage.removeItem(RECENT_MATERIALS_KEY);
          setEditing(null);
          setBookmarking(null);
          setStatus('');
          window.dispatchEvent(new Event(RECENT_MATERIALS_EVENT));
        } catch { setStatus('Could not clear history in this browser.'); }
      }}>Clear history</button></div>
      <div className={styles.grid}>{entries.slice(0, 4).map((entry) => {
        const key = entry.key || entry.href;
        const pageField = <div className={styles.pageField}>
          <label>Page <input
            name="page"
            type="number"
            min="1"
            step="1"
            required
            defaultValue={entry.page}
            aria-invalid={pageWarning ? true : undefined}
            aria-describedby={pageWarning ? pageWarningId : undefined}
            onChange={() => setPageWarning('')}
            readOnly={checkingPage}
          /></label>
          {pageWarning && <p id={pageWarningId} className={styles.pageWarning} role="alert">{pageWarning}</p>}
        </div>;
        return <div key={key} className={styles.recentCard}>
          <a href={entry.href} data-recent-title={entry.title} target="_blank" rel="noopener noreferrer" className={styles.item}>
            <FileText size={20} aria-hidden="true" /><span><strong>{entry.title}</strong><small>{entry.saved ? 'Saved on this device' : 'Online material'}</small></span>
          </a>
          {editing === key ? <form className={styles.pageForm} onSubmit={(event) => savePage(event, entry)}>
            {pageField}
            <button type="submit" disabled={checkingPage}>{checkingPage ? 'Checking…' : 'Save'}</button>
            <button type="button" disabled={checkingPage} onClick={() => setEditing(null)}>Cancel</button>
          </form> : <button type="button" className={styles.pageButton} disabled={checkingPage} onClick={() => { setEditing(key); setBookmarking(null); setStatus(''); setPageWarning(''); }}>
            {entry.page ? `Update page ${entry.page}` : 'Save reading page'}
          </button>}
          {bookmarking === key ? <form className={styles.pageForm} onSubmit={(event) => savePage(event, entry, true)}>
            {pageField}
            <label>Label <input name="label" className={styles.bookmarkLabel} type="text" required maxLength={80} /></label>
            <button type="submit" disabled={checkingPage}>{checkingPage ? 'Checking…' : 'Save bookmark'}</button>
            <button type="button" disabled={checkingPage} onClick={() => setBookmarking(null)}>Cancel</button>
          </form> : <button type="button" className={styles.pageButton} disabled={checkingPage} onClick={() => {
            setPageWarning('');
            setBookmarking(key);
            setEditing(null);
            setStatus('');
          }}>Add bookmark</button>}
        </div>;
      })}</div>
    </section>}
    {status && <p className={styles.status} role="status">{status}</p>}
  </>;
}
