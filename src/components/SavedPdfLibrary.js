'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, FileText, FolderDown, HardDrive, Trash2, BookOpen, Search, RefreshCw } from 'lucide-react';
import { readSavedPdfFiles, removeSavedPdfs, updateSavedPdf } from '@/lib/offlinePdfs';
import styles from './SavedPdfLibrary.module.css';
import { groupSavedPdfs } from '@/lib/savedPdfGroups';
import { filterSavedFiles, savedPdfUpdate } from '@/lib/savedPdfUpdates';
import RecentMaterials from './RecentMaterials';

const CATALOG_KEY = 'cseb-pdf-catalog-v1';
const formatSize = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

export default function SavedPdfLibrary({ subjects = [], initialCatalog = [], initialCatalogAt = 0 }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(null);
  const [notice, setNotice] = useState('');
  const [selectedCode, setSelectedCode] = useState(null);
  const [query, setQuery] = useState('');
  const [catalog, setCatalog] = useState(initialCatalog);
  const [checkedAt, setCheckedAt] = useState(initialCatalogAt);
  const [estimate, setEstimate] = useState(null);
  const [confirmGroup, setConfirmGroup] = useState(null);
  const lock = useRef(false);
  const cancelButton = useRef(null);
  const allGroups = groupSavedPdfs(files, subjects);
  const selected = allGroups.find((group) => group.code === selectedCode);
  const searching = Boolean(query.trim());
  const matches = filterSavedFiles(selected?.files || files, query, subjects);
  const groups = groupSavedPdfs(matches, subjects);
  const visibleFiles = selected || searching ? matches : [];
  const totalBytes = files.reduce((total, file) => total + (file.size || 0), 0);
  const outdatedCount = files.filter((file) => savedPdfUpdate(file, catalog).outdated).length;

  async function refreshStorage() {
    try { if (navigator.storage?.estimate) setEstimate(await navigator.storage.estimate()); }
    catch { /* The PDF total remains available without browser quota estimates. */ }
  }
  async function reloadFiles() {
    setFiles(await readSavedPdfFiles());
    await refreshStorage();
  }
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        if (!('caches' in window)) throw new Error('Offline storage is unavailable in this browser.');
        const entries = await readSavedPdfFiles();
        if (!cancelled) setFiles(entries);
        if (navigator.storage?.estimate) {
          const value = await navigator.storage.estimate().catch(() => null);
          if (!cancelled) setEstimate(value);
        }
      } catch (failure) {
        if (!cancelled) setError(failure.message || 'Could not read saved PDFs. Please try again.');
      } finally { if (!cancelled) setLoading(false); }
    }
    load();
    try {
      const cached = JSON.parse(localStorage.getItem(CATALOG_KEY) || 'null');
      if (cached && cached.checkedAt > initialCatalogAt && Array.isArray(cached.files)) {
        setCatalog(cached.files); setCheckedAt(cached.checkedAt);
      }
    } catch { /* The page includes a catalog even when local storage is blocked. */ }
    return () => { cancelled = true; };
  }, [initialCatalogAt]);
  useEffect(() => { if (confirmGroup) cancelButton.current?.focus(); }, [confirmGroup]);

  async function removeEntries(entries) {
    if (lock.current) return;
    lock.current = true;
    setBusy('remove'); setError(''); setNotice('');
    try {
      await removeSavedPdfs(entries.map((file) => file.url));
      setNotice(`${entries.length} saved ${entries.length === 1 ? 'PDF removed' : 'PDFs removed'} from this device.`);
    } catch { setError('Some files could not be removed. The list shows the copies still on this device.'); }
    finally {
      try { await reloadFiles(); } catch { setError('Could not refresh saved files. Reload this page.'); }
      setConfirmGroup(null); lock.current = false; setBusy(null);
      window.dispatchEvent(new Event('cseb-recent-materials-change'));
    }
  }
  async function checkUpdates() {
    if (lock.current) return;
    if (!navigator.onLine) { setError('Connect to the internet to check for updated notes.'); return; }
    lock.current = true; setBusy('check'); setError(''); setNotice('');
    try {
      const response = await fetch('/api/pdf-catalog', { cache: 'no-store' });
      if (!response.ok) throw new Error('Could not check updates. Please try again later.');
      const data = await response.json();
      if (!Array.isArray(data.files) || !Number.isFinite(data.checkedAt)) throw new Error('Could not read the latest update information.');
      setCatalog(data.files); setCheckedAt(data.checkedAt);
      try { localStorage.setItem(CATALOG_KEY, JSON.stringify(data)); } catch { /* Keep the current check usable. */ }
      const count = files.filter((file) => savedPdfUpdate(file, data.files).outdated).length;
      setNotice(count ? `${count} saved ${count === 1 ? 'copy has' : 'copies have'} updated notes available.` : 'No changes found in the portal’s file links or revisions.');
    } catch (failure) { setError(failure.message || 'Could not check updates. Please try again.'); }
    finally { lock.current = false; setBusy(null); }
  }
  async function updateFile(file, current) {
    if (lock.current) return;
    if (!navigator.onLine) { setError('Connect to the internet to update this saved PDF.'); return; }
    lock.current = true; setBusy(file.url); setError(''); setNotice('Saving the updated PDF… Keep this page open.');
    try {
      await updateSavedPdf(file, current);
      await reloadFiles();
      setNotice('Updated PDF saved. Your offline copy is ready.');
    } catch { setNotice(''); setError('Could not finish updating. Reload the library to check your saved copies, then try again.'); }
    finally { lock.current = false; setBusy(null); }
  }

  return <main className={styles.page}>
    <nav className={styles.navigation} aria-label="Library navigation">
      <a className={styles.back} href="/"><ArrowLeft size={16} /> Back to portal</a>
      <span className={styles.brand}>DHURANDHAR</span>
    </nav>
    <header className={styles.hero}>
      <span className={styles.eyebrow}><FolderDown size={18} /> Your offline library</span>
      <h1>Your saved PDFs</h1>
      <p>Find your saved subjects, pick up where you left off, and keep your notes ready for offline study.</p>
    </header>
    <div className={styles.summary} role="status">
      <HardDrive size={18} aria-hidden="true" />
      <span>{loading ? 'Loading saved files…' : `${files.length} saved PDF${files.length === 1 ? '' : 's'} on this device`}</span>
      {!loading && <span className={styles.total}>{formatSize(totalBytes)}</span>}
    </div>
    {!loading && <details className={styles.storage}>
      <summary>Storage usage · {formatSize(totalBytes)} of saved PDFs</summary>
      <p>Remove individual files or open a subject to remove all its saved PDFs.</p>
      {estimate?.quota > 0 && <>
        <label className={styles.storageLabel}>Browser storage used (includes cached pages)<span>{formatSize(estimate.usage || 0)} / {formatSize(estimate.quota)}</span></label>
        <progress className={styles.storageMeter} value={Math.min(estimate.usage || 0, estimate.quota)} max={estimate.quota} aria-label="Estimated browser storage used" />
        <small>Browser estimates vary by device. This is the site’s storage allowance, not your device’s total capacity.</small>
      </>}
    </details>}
    <div className={styles.libraryTools}>
      <label className={styles.search}><Search size={18} aria-hidden="true" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={selected ? `Search ${selected.name}` : 'Search saved subjects or units…'} aria-label="Search saved PDFs" />{query && <button type="button" onClick={() => setQuery('')} aria-label="Clear saved PDF search">×</button>}</label>
      <button className={styles.back} type="button" disabled={Boolean(busy) || loading} onClick={checkUpdates}><RefreshCw size={16} />{busy === 'check' ? 'Checking…' : 'Check for updates'}</button>
    </div>
    {!loading && <p className={styles.catalogHint}>Update info: {checkedAt ? new Date(checkedAt).toLocaleDateString() : 'available portal snapshot'}. {outdatedCount > 0 ? `${outdatedCount} saved ${outdatedCount === 1 ? 'copy needs' : 'copies need'} updating.` : 'Only changed file links or revisions can be detected.'}</p>}
    {error && <p className={styles.error} role="alert">{error}</p>}
    {notice && <p className={styles.notice} role="status">{notice}</p>}
    {!selected && !searching && !loading && <RecentMaterials onlySaved />}
    {!loading && files.length > 0 && !selected && !searching && <>
      <div className={styles.sectionHeading}><h2>Your saved subjects</h2><span>{groups.length} {groups.length === 1 ? 'subject' : 'subjects'}</span></div>
      <section className={styles.subjectGrid} aria-label="Saved subjects">
        {groups.map((group) => <button key={group.code} type="button" className={styles.subjectCard}
          style={{ '--subject-color': group.color || 'var(--accent)', '--subject-bg': group.bg || 'var(--soft-bg-strong)' }}
          onClick={() => { setSelectedCode(group.code); setConfirmGroup(null); }} aria-label={`Open ${group.name}, ${group.files.length} saved PDFs`}>
          <span className={styles.subjectTop}><span className={styles.subjectCode}>{group.code}</span><span className={styles.subjectIcon}><BookOpen size={24} strokeWidth={1.6} /></span></span>
          <h3>{group.name}</h3>
          {group.files.some((file) => savedPdfUpdate(file, catalog).outdated) && <span className={styles.updateBadge}>Updated notes available</span>}
          <span className={styles.subjectFooter}><span>{group.files.length} saved {group.files.length === 1 ? 'PDF' : 'PDFs'} · {formatSize(group.files.reduce((sum, file) => sum + (file.size || 0), 0))}</span><span className={styles.viewUnits}>View files</span></span>
        </button>)}
      </section>
    </>}
    {selected && <div className={styles.subjectHeading}>
      <button type="button" className={styles.back} onClick={() => { setSelectedCode(null); setQuery(''); setConfirmGroup(null); }}><ArrowLeft size={16} /> All saved subjects</button>
      <div className={styles.subjectManagement}><div><span className={styles.eyebrow}>{selected.code}</span><h2>{selected.name}</h2><p>{selected.files.length} saved {selected.files.length === 1 ? 'PDF' : 'PDFs'} · {formatSize(selected.files.reduce((sum, file) => sum + (file.size || 0), 0))}</p></div>
        <button className={styles.remove} type="button" disabled={Boolean(busy)} onClick={() => setConfirmGroup(selected.code)}><Trash2 size={15} /> Remove subject’s saved PDFs</button>
      </div>
    </div>}
    {confirmGroup && selected && <div className={styles.confirmation} role="alert">
      <p>Remove all {selected.files.length} saved PDFs for <strong>{selected.name}</strong> from this device? You’ll need internet to save them again.</p>
      <div><button ref={cancelButton} className={styles.back} type="button" disabled={Boolean(busy)} onClick={() => setConfirmGroup(null)}>Keep files</button><button className={styles.remove} type="button" disabled={Boolean(busy)} onClick={() => removeEntries(selected.files)}>{busy === 'remove' ? 'Removing…' : `Remove ${selected.files.length} PDFs`}</button></div>
    </div>}
    {searching && !loading && <p className={styles.resultCount} role="status">{matches.length} saved {matches.length === 1 ? 'PDF matches' : 'PDFs match'} “{query.trim()}”</p>}
    <section className={styles.files} aria-label="Saved PDF files" aria-busy={loading}>
      {!loading && !error && files.length === 0 && <div className={styles.empty}>
        <span className={styles.emptyIcon}><FolderDown size={30} strokeWidth={1.5} /></span><h2>Your library starts here</h2><p>Save a PDF while online, then come back to read it without internet.</p><a className={styles.back} href="/">Browse study materials</a>
      </div>}
      {searching && matches.length === 0 && files.length > 0 && <div className={styles.empty}><Search size={28} /><h2>No matching saved PDFs</h2><p>Try a subject name, code, or unit number.</p><button className={styles.back} type="button" onClick={() => setQuery('')}>Clear search</button></div>}
      {visibleFiles.map((file) => {
        const update = savedPdfUpdate(file, catalog);
        return <article className={styles.file} key={file.url}>
          <span className={styles.fileIcon} aria-hidden="true"><FileText size={25} strokeWidth={1.5} /><small>PDF</small></span>
          <div className={styles.fileDetails}>
            <a className={styles.fileTitle} href={file.url} data-recent-title={file.title} target="_blank" rel="noopener noreferrer">{searching && !selected ? file.title : file.label || file.title}</a>
            <span className={styles.meta}>{formatSize(file.size || 0)} · Saved {new Date(file.savedAt).toLocaleDateString()}</span>
            {update.outdated && <span className={styles.updateBadge}>Updated notes available · You’re viewing an older saved copy</span>}
          </div>
          <div className={styles.fileActions}>
            {update.outdated && <button className={styles.back} type="button" disabled={Boolean(busy)} onClick={() => updateFile(file, update.current)}><RefreshCw size={14} />{busy === file.url ? 'Updating…' : 'Update saved copy'}</button>}
            <button className={styles.remove} type="button" disabled={Boolean(busy)} onClick={() => removeEntries([file])} aria-label={`Remove ${file.title}`}><Trash2 size={15} />Remove</button>
          </div>
        </article>;
      })}
    </section>
    <details className={styles.help}><summary>How offline reading and updates work</summary>
      <p>Saved PDFs are available in this browser on this device. Files stay here until you remove them or browser storage is cleared. Your browser may also free storage when space is low.</p>
      <p>Check for updates reads the portal’s current file links and revisions without downloading PDFs. Replacing a file at the same external URL cannot be detected unless its revision is also changed. Offline update notices use the last available portal information.</p>
      <p>Videos, AI tools, and unsaved files need internet. Recently visited study pages are available offline; pages you have not visited may be unavailable.</p>
    </details>
    <p className={styles.deviceNote}>Stored on your device · No extra download needed to reopen a saved PDF</p>
  </main>;
}
