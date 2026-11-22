/* global self, caches */
const SHELL_CACHE = 'dhurandhar-shell-v5';
const PAGE_CACHE = 'dhurandhar-pages-v1';
const ASSET_CACHE = 'dhurandhar-assets-v1';
const PDF_CACHE = 'dhurandhar-pdfs-v1';
const SAVED_PREFIX = '/__offline_pdf__/';

async function precacheOfflineLibrary() {
  const cache = await caches.open(SHELL_CACHE);
  const response = await fetch('/offline', { cache: 'reload' });
  if (!response.ok) throw new Error('Offline library is unavailable');
  const html = await response.clone().text();
  const assets = [...new Set(Array.from(html.matchAll(/(?:src|href)="(\/_next\/static\/[^" ]+)"/g), (match) => match[1]))];
  await cache.addAll(assets);
  await cache.put('/offline', response);
}

self.addEventListener('install', (event) => {
  event.waitUntil(precacheOfflineLibrary().then(() => self.skipWaiting()));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

async function remember(cacheName, request, response, limit) {
  if (!response.ok || response.status !== 200 || response.headers.has('content-range')) return;
  const cache = await caches.open(cacheName);
  await cache.put(request, response);
  const keys = await cache.keys();
  await Promise.all(keys.slice(0, Math.max(0, keys.length - limit)).map((key) => cache.delete(key)));
}

async function savedPdf(request) {
  const cached = await (await caches.open(PDF_CACHE)).match(request.url);
  if (!cached) return new Response('This PDF is not saved on this device. Go online and save it first.', { status: 404 });
  const range = request.headers.get('range');
  if (!range) return cached;
  const bytes = await cached.arrayBuffer();
  const match = /^bytes=(\d*)-(\d*)$/.exec(range);
  let start = match?.[1] ? Number(match[1]) : 0;
  let end = match?.[2] ? Number(match[2]) : bytes.byteLength - 1;
  if (match && !match[1] && match[2]) {
    start = Math.max(0, bytes.byteLength - Number(match[2]));
    end = bytes.byteLength - 1;
  }
  end = Math.min(end, bytes.byteLength - 1);
  if (!match || (!match[1] && !match[2]) || start > end || start >= bytes.byteLength) {
    return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${bytes.byteLength}` } });
  }
  return new Response(bytes.slice(start, end + 1), {
    status: 206,
    headers: { 'Content-Type': 'application/pdf', 'Accept-Ranges': 'bytes',
      'Content-Range': `bytes ${start}-${end}/${bytes.byteLength}`, 'Content-Length': String(end - start + 1) },
  });
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  // Development chunks reuse URLs after edits; caching them breaks hydration.
  if (url.pathname.startsWith('/_next/static/') &&
      !/[a-f0-9]{8,}/i.test(url.pathname.split('/').pop())) return;
  if (url.pathname.startsWith(SAVED_PREFIX)) {
    event.respondWith(savedPdf(request));
    return;
  }
  // Never cache API calls or mix Next.js flight responses with full HTML pages.
  if (url.pathname.startsWith('/api/') || request.headers.has('RSC') || url.searchParams.has('_rsc')) return;
  const isPage = request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html');
  if (isPage) {
    const network = fetch(request).then(async (response) => {
      if (response.headers.get('content-type')?.includes('text/html')) {
        await remember(PAGE_CACHE, request, response.clone(), 80).catch(() => {});
      }
      return response;
    });
    event.waitUntil(network.then(() => {}, () => {}));
    event.respondWith((async () => {
      const cache = await caches.open(PAGE_CACHE);
      const cached = await cache.match(request);
      if (cached) {
        let timer;
        try {
          return await Promise.race([network, new Promise((resolve) => {
            timer = setTimeout(() => resolve(cached), 3500);
          })]);
        } catch { return cached; }
        finally { clearTimeout(timer); }
      }
      try { return await network; }
      catch { return (await (await caches.open(SHELL_CACHE)).match('/offline')) || Response.error(); }
    })());
    return;
  }
  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/_next/image') || /\.(png|jpg|webp|woff2|svg)$/.test(url.pathname)) {
    event.respondWith((async () => {
      const cache = await caches.open(ASSET_CACHE);
      const saved = await cache.match(request) || await (await caches.open(SHELL_CACHE)).match(request);
      if (saved) return saved;
      const response = await fetch(request);
      await remember(ASSET_CACHE, request, response.clone(), 300).catch(() => {});
      return response;
    })());
  }
});
