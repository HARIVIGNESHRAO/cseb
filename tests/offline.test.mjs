import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const ORIGIN = 'https://portal.test';
function memoryCaches() {
  const stores = new Map();
  const key = (request) => new URL(typeof request === 'string' ? request : request.url, ORIGIN).href;
  return {
    stores,
    async open(name) {
      if (!stores.has(name)) stores.set(name, new Map());
      const store = stores.get(name);
      return {
        async put(request, response) { store.set(key(request), response.clone()); },
        async match(request) { return store.get(key(request))?.clone(); },
        async delete(request) { return store.delete(key(request)); },
        async keys() { return [...store.keys()].map(url => new Request(url)); },
        async addAll(urls) { for (const url of urls) store.set(key(url), new Response('offline shell')); },
      };
    },
  };
}
function worker(network = async () => { throw new TypeError('offline'); }) {
  const caches = memoryCaches();
  const handlers = {};
  vm.runInNewContext(readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8'), {
    caches, fetch: network, URL, Response, setTimeout, clearTimeout,
    self: { location: { origin: ORIGIN }, clients: { claim: async () => {} }, skipWaiting: async () => {},
      addEventListener(type, callback) { handlers[type] = callback; } },
  });
  return { caches, async install() {
    let pending;
    handlers.install({ waitUntil(value) { pending = value; } });
    await pending;
  }, async request(path, headers = {}, mode) {
    const pending = [];
    let response;
    const request = new Request(ORIGIN + path, { headers });
    handlers.fetch({ request: mode ? { url: request.url, method: request.method, headers: request.headers, mode } : request,
      respondWith(value) { response = Promise.resolve(value); }, waitUntil(value) { pending.push(value); } });
    const result = await response;
    await Promise.all(pending);
    return result;
  } };
}

test('saved PDF routes support full, byte-range and suffix reads offline', async () => {
  const app = worker();
  const cache = await app.caches.open('dhurandhar-pdfs-v1');
  await cache.put('/__offline_pdf__/sample', new Response('%PDF-12345', { headers: { 'Content-Type': 'application/pdf' } }));
  assert.equal(await (await app.request('/__offline_pdf__/sample')).text(), '%PDF-12345');
  const navigation = await app.request('/__offline_pdf__/sample', { accept: 'text/html' }, 'navigate');
  assert.equal(navigation.headers.get('content-type'), 'application/pdf');
  assert.equal(await navigation.text(), '%PDF-12345');
  const part = await app.request('/__offline_pdf__/sample', { range: 'bytes=0-3' });
  assert.equal(part.status, 206);
  assert.equal(part.headers.get('content-range'), 'bytes 0-3/10');
  assert.equal(await part.text(), '%PDF');
  assert.equal(await (await app.request('/__offline_pdf__/sample', { range: 'bytes=-3' })).text(), '345');
  for (const range of ['bytes=50-60', 'bytes=-', 'bytes=8-3', 'bytes=0-2,5-7']) {
    assert.equal((await app.request('/__offline_pdf__/sample', { range })).status, 416);
  }
  assert.equal((await app.request('/__offline_pdf__/missing')).status, 404);
});

test('offline HTML uses a visited page or the saved-file library, never cached APIs or RSC', async () => {
  const app = worker();
  await (await app.caches.open('dhurandhar-pages-v1')).put('/subject/cp/unit1', new Response('saved study page'));
  await (await app.caches.open('dhurandhar-shell-v5')).put('/offline', new Response('saved-file library'));
  assert.equal(await (await app.request('/subject/cp/unit1', { accept: 'text/html' })).text(), 'saved study page');
  assert.equal(await (await app.request('/subject/not-visited', { accept: 'text/html' })).text(), 'saved-file library');
  assert.equal(await app.request('/api/visits'), undefined);
  assert.equal(await app.request('/subject/cp?_rsc=123', { accept: 'text/html' }), undefined);
  assert.equal(await app.request('/subject/cp', { RSC: '1' }), undefined);
  await (await app.caches.open('dhurandhar-shell-v5')).put('/_next/static/chunks/offline-abcdef123.js', new Response('library script'));
  assert.equal(await (await app.request('/_next/static/chunks/offline-abcdef123.js')).text(), 'library script');
});

test('online pages refresh cached HTML; cache capacity cannot evict the offline shell', async () => {
  const app = worker(async () => new Response('updated page', { headers: { 'Content-Type': 'text/html' } }));
  const shell = await app.caches.open('dhurandhar-shell-v5');
  await shell.put('/offline', new Response('library'));
  for (let i = 0; i < 82; i++) await app.request(`/subject/test/${i}`, { accept: 'text/html' });
  assert.equal((await (await app.caches.open('dhurandhar-pages-v1')).keys()).length, 80);
  assert.ok(await shell.match('/offline'));
  const page = await (await app.caches.open('dhurandhar-pages-v1')).match('/subject/test/81');
  assert.equal(await page.text(), 'updated page');
});

const librarySource = readFileSync(new URL('../src/lib/offlinePdfs.js', import.meta.url), 'utf8');
function library(caches, fetch) {
  const context = { caches, fetch, Response, URL };
  const script = librarySource.replace(/export /g, '') + '\nthis.save = saveOfflinePdf; this.readFiles = readSavedPdfFiles; this.removeFiles = removeSavedPdfs; this.updateFile = updateSavedPdf;';
  vm.runInNewContext(script, context);
  context.save.readFiles = context.readFiles;
  context.save.removeFiles = context.removeFiles;
  context.save.updateFile = context.updateFile;
  return context.save;
}

test('offline save validates PDFs and writes both readable bytes and library metadata', async () => {
  const caches = memoryCaches();
  const save = library(caches, async () => new Response('%PDF-1.7 sample'));
  const path = await save('https://cdn.test/unit.pdf', 'MS Unit 1');
  assert.match(path, /^\/__offline_pdf__\//);
  const file = await (await caches.open('dhurandhar-pdfs-v1')).match(path);
  assert.equal(file.headers.get('content-type'), 'application/pdf');
  const metadata = await (await (await caches.open('dhurandhar-pdf-info-v1')).match(path)).json();
  assert.equal(metadata.title, 'MS Unit 1');
});

test('failed, blocked, non-PDF and oversized responses never appear as saved', async () => {
  for (const fetch of [
    async () => { throw new TypeError('CORS blocked'); },
    async () => new Response('error', { status: 403 }),
    async () => new Response('<html>Access denied</html>'),
    async () => new Response('%PDF-', { headers: { 'Content-Length': String(51 * 1024 * 1024) } }),
  ]) {
    const caches = memoryCaches();
    await assert.rejects(library(caches, fetch)('https://cdn.test/unit.pdf', 'Unit 1'));
    assert.equal((await (await caches.open('dhurandhar-pdf-info-v1')).keys()).length, 0);
  }
});

test('metadata storage failure rolls back the saved PDF', async () => {
  const caches = memoryCaches();
  const normalOpen = caches.open.bind(caches);
  caches.open = async (name) => {
    if (name === 'dhurandhar-pdf-info-v1') throw new Error('Quota exceeded');
    return normalOpen(name);
  };
  await assert.rejects(library(caches, async () => new Response('%PDF-1.7'))('https://cdn.test/unit.pdf', 'Unit 1'));
  assert.equal((await (await normalOpen('dhurandhar-pdfs-v1')).keys()).length, 0);
});

test('installation saves the native offline page and all its local scripts and styles', async () => {
  const html = '<html><link href="/_next/static/css/abc12345.css" rel="stylesheet"><script src="/_next/static/chunks/offline-abcdef123.js"></script><script src="/_next/static/chunks/offline-abcdef123.js"></script></html>';
  const app = worker(async () => new Response(html, { headers: { 'Content-Type': 'text/html' } }));
  await app.install();
  const shell = await app.caches.open('dhurandhar-shell-v5');
  assert.equal(await (await shell.match('/offline')).text(), html);
  assert.ok(await shell.match('/_next/static/css/abc12345.css'));
  assert.ok(await shell.match('/_next/static/chunks/offline-abcdef123.js'));
  assert.equal((await shell.keys()).length, 3);
});


test('saving a replacement rolls back existing bytes if metadata storage fails', async () => {
  const caches = memoryCaches();
  const files = await caches.open('dhurandhar-pdfs-v1');
  const path = '/__offline_pdf__/' + encodeURIComponent('https://cdn.test/unit.pdf');
  await files.put(path, new Response('%PDF-old copy'));
  const normalOpen = caches.open.bind(caches);
  caches.open = async name => {
    if (name === 'dhurandhar-pdf-info-v1') throw new Error('Quota exceeded');
    return normalOpen(name);
  };
  await assert.rejects(library(caches, async () => new Response('%PDF-new copy'))('https://cdn.test/unit.pdf', 'MS · Unit 1'));
  assert.equal(await (await files.match(path)).text(), '%PDF-old copy');
});

test('bulk removal deletes only the requested subject files and their metadata', async () => {
  const caches = memoryCaches();
  const save = library(caches, async () => new Response('%PDF-test'));
  const stm1 = await save('https://cdn.test/stm1.pdf', 'STM · Unit 1');
  const stm2 = await save('https://cdn.test/stm2.pdf', 'STM · Unit 2');
  const dm = await save('https://cdn.test/dm.pdf', 'DM · Unit 1');
  await save.removeFiles([stm1, stm2], caches);
  const remaining = await save.readFiles(caches);
  assert.equal(remaining.length, 1);
  assert.equal(remaining[0].title, 'DM · Unit 1');
  assert.ok(await (await caches.open('dhurandhar-pdfs-v1')).match(dm));
  assert.equal((await (await caches.open('dhurandhar-pdf-info-v1')).keys()).length, 1);
});

test('updated copies retain catalog identity and replace the older saved URL only after success', async () => {
  const caches = memoryCaches();
  let fail = false;
  const save = library(caches, async () => {
    if (fail) throw new TypeError('offline');
    return new Response('%PDF-material');
  });
  const oldKey = await save('https://cdn.test/old.pdf', 'MS · Unit 1', { catalogId: 'ms/unit1' });
  const oldFile = (await save.readFiles(caches))[0];
  const current = { id: 'ms/unit1', title: 'MS · Unit 1', sourceUrl: 'https://cdn.test/new.pdf', revision: '2026-11-22' };
  fail = true;
  await assert.rejects(save.updateFile(oldFile, current));
  assert.ok(await (await caches.open('dhurandhar-pdfs-v1')).match(oldKey));
  fail = false;
  await save.updateFile(oldFile, current);
  const entries = await save.readFiles(caches);
  assert.equal(entries.length, 1);
  assert.equal(entries[0].catalogId, current.id);
  assert.equal(entries[0].revision, current.revision);
  assert.equal(entries[0].sourceUrl, current.sourceUrl);
  assert.equal(await (await caches.open('dhurandhar-pdfs-v1')).match(oldKey), undefined);
});
