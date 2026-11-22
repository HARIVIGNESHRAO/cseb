export const PDF_CACHE = 'dhurandhar-pdfs-v1';
export const PDF_INFO_CACHE = 'dhurandhar-pdf-info-v1';
export const MAX_PDF_BYTES = 50 * 1024 * 1024;
export const savedPdfPath = (url) => `/__offline_pdf__/${encodeURIComponent(url)}`;

export async function saveOfflinePdf(url, title, details = {}) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('The PDF host did not respond. Try again when your connection improves.');
  if (Number(response.headers.get('content-length')) > MAX_PDF_BYTES) {
    throw new Error('This file is over 50 MB. Use Download PDF to keep it on your device instead.');
  }
  const blob = await response.blob();
  if (blob.size > MAX_PDF_BYTES) throw new Error('This file is over 50 MB. Use Download PDF instead.');
  if (!(await blob.slice(0, 1024).text()).includes('%PDF-')) throw new Error('The host did not return a PDF. Use Open PDF or Download PDF instead.');
  const key = savedPdfPath(url);
  const files = await caches.open(PDF_CACHE);
  const previous = await files.match(key);
  await files.put(key, new Response(blob, { headers: { 'Content-Type': 'application/pdf', 'Accept-Ranges': 'bytes' } }));
  try {
    const info = await caches.open(PDF_INFO_CACHE);
    await info.put(key, new Response(JSON.stringify({ title, size: blob.size, savedAt: Date.now(), sourceUrl: url, catalogId: details.catalogId, revision: details.revision || '' }), { headers: { 'Content-Type': 'application/json' } }));
  } catch (error) {
    if (previous) await files.put(key, previous);
    else await files.delete(key);
    throw error;
  }
  return key;
}

export async function readSavedPdfFiles(cacheStorage = caches) {
  const pdfs = await cacheStorage.open(PDF_CACHE);
  const info = await cacheStorage.open(PDF_INFO_CACHE);
  const files = await Promise.all((await info.keys()).map(async (key) => {
    if (!(await pdfs.match(key))) return null;
    try {
      const response = await info.match(key);
      if (!response) return null;
      return { ...await response.json(), url: key.url };
    } catch { return null; }
  }));
  return files.filter(Boolean).sort((a, b) => b.savedAt - a.savedAt);
}

export async function removeSavedPdfs(urls, cacheStorage = caches) {
  const pdfs = await cacheStorage.open(PDF_CACHE);
  const info = await cacheStorage.open(PDF_INFO_CACHE);
  for (const url of urls) {
    await pdfs.delete(url);
    await info.delete(url);
  }
}

export async function updateSavedPdf(file, current) {
  const key = await saveOfflinePdf(current.sourceUrl, current.title, {
    catalogId: current.id, revision: current.revision,
  });
  // Keep the old copy until its replacement has been fully saved.
  const oldPath = new URL(file.url, 'https://portal.local').pathname;
  if (oldPath !== new URL(key, 'https://portal.local').pathname) await removeSavedPdfs([file.url]);
  return key;
}
