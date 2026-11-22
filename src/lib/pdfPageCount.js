import { PDFDocument } from 'pdf-lib';
import { PDF_CACHE } from './offlinePdfs.js';

const counts = new Map();

export function getPdfPageCount({ href, saved }) {
  const url = new URL(href, window.location.origin);
  url.hash = '';
  const key = url.href;
  if (counts.has(key)) return counts.get(key);

  const count = (async () => {
    const response = saved
      ? await (await caches.open(PDF_CACHE)).match(key)
      : await fetch(key);
    if (!response?.ok) throw new Error('PDF is unavailable');

    const pdf = await PDFDocument.load(await response.arrayBuffer(), { updateMetadata: false });
    const pages = pdf.getPageCount();
    if (pages < 1) throw new Error('PDF has no pages');
    return pages;
  })().catch((error) => {
    counts.delete(key);
    throw error;
  });

  counts.set(key, count);
  return count;
}
