'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { FolderDown } from 'lucide-react';
import styles from './OfflineSupport.module.css';
import { recordRecentMaterial, RECENT_MATERIALS_EVENT } from '@/lib/recentMaterials';

export default function OfflineSupport() {
  const pathname = usePathname();
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    const record = (event) => {
      if (![0, 1].includes(event.button)) return;
      const anchor = event.target.closest?.('a[data-recent-title]');
      if (!anchor || anchor.hasAttribute('download')) return;
      try {
        recordRecentMaterial(localStorage, { title: anchor.dataset.recentTitle, href: anchor.href }, location.origin);
        window.dispatchEvent(new Event(RECENT_MATERIALS_EVENT));
      } catch { /* Reading materials works without browser history storage. */ }
    };
    document.addEventListener('click', record, true);
    document.addEventListener('auxclick', record, true);
    return () => {
      document.removeEventListener('click', record, true);
      document.removeEventListener('auxclick', record, true);
    };
  }, []);
  useEffect(() => {
    const bar = document.querySelector('.portalUtilityBar');
    if (!bar) return;
    const measure = () => document.documentElement.style.setProperty(
      '--portal-utility-height', `${Math.ceil(bar.getBoundingClientRect().height)}px`
    );
    measure();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    observer?.observe(bar);
    window.addEventListener('resize', measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);
  useEffect(() => {
    const sync = () => setOffline(!navigator.onLine);
    sync();
    window.addEventListener('online', sync);
    window.addEventListener('offline', sync);
    // Full navigations use cached HTML when Next's client router cannot reach RSC.
    const navigate = (event) => {
      if (navigator.onLine || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target.closest('a[href]');
      if (!link || link.target === '_blank' || link.hasAttribute('download')) return;
      const url = new URL(link.href);
      if (url.origin !== location.origin || (url.pathname === location.pathname && url.hash)) return;
      event.preventDefault();
      event.stopPropagation();
      location.assign(url.href);
    };
    document.addEventListener('click', navigate, true);
    return () => {
      window.removeEventListener('online', sync);
      window.removeEventListener('offline', sync);
      document.removeEventListener('click', navigate, true);
    };
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
    let cancelled = false;
    async function prepare() {
      await navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' });
      await navigator.serviceWorker.ready;
      if (cancelled) return;
      // Cache full HTML even when the page was reached through client navigation.
      const page = await fetch(pathname, { headers: { Accept: 'text/html' } });
      if (page.ok && page.headers.get('content-type')?.includes('text/html')) {
        await (await caches.open('dhurandhar-pages-v1')).put(pathname, page);
      }
      // Assets loaded before the worker took control are also needed on first offline reload.
      const assets = [...new Set(performance.getEntriesByType('resource').map((entry) => entry.name))]
        .filter((value) => value.startsWith(`${location.origin}/_next/static/`));
      const cache = await caches.open('dhurandhar-assets-v1');
      await Promise.allSettled(assets.map(async (url) => {
        if (await cache.match(url)) return;
        const response = await fetch(url);
        if (response.ok) await cache.put(url, response);
      }));
    }
    prepare().catch(() => { /* Online reading remains available if device storage is blocked. */ });
    return () => { cancelled = true; };
  }, [pathname]);

  return <div className={styles.bar}>
    <span className={styles.message} data-online={!offline} role="status">{offline ? 'You’re offline. Open your saved PDFs.' : 'Save PDFs to read without internet.'}</span>
    <a className={styles.libraryLink} href="/offline"><FolderDown size={17} aria-hidden="true" /> Saved PDFs</a>
  </div>;
}
