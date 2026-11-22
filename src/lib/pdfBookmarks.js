export const PDF_BOOKMARKS_KEY = 'cseb-pdf-bookmarks-v1';
export const PDF_BOOKMARKS_EVENT = 'cseb-pdf-bookmarks-change';

export function readPdfBookmarks(storage) {
  try {
    const bookmarks = JSON.parse(storage.getItem(PDF_BOOKMARKS_KEY) || '[]');
    if (!Array.isArray(bookmarks)) return [];
    return bookmarks.filter((bookmark) => {
      if (!bookmark || typeof bookmark.href !== 'string' || typeof bookmark.label !== 'string' ||
          typeof bookmark.title !== 'string' || !Number.isSafeInteger(bookmark.page) || bookmark.page < 1) return false;
      try {
        return ['http:', 'https:'].includes(new URL(bookmark.href).protocol);
      } catch {
        return false;
      }
    });
  } catch {
    return [];
  }
}

export function savePdfBookmark(storage, { title, href }, pageInput, labelInput) {
  const page = Number(pageInput);
  const label = labelInput.trim();
  if (!Number.isSafeInteger(page) || page < 1 || !label || label.length > 80) return false;

  const source = new URL(href);
  if (!['http:', 'https:'].includes(source.protocol)) return false;
  source.hash = '';
  const bookmarks = readPdfBookmarks(storage).filter((bookmark) =>
    bookmark.href !== source.href || bookmark.page !== page || bookmark.label !== label);
  storage.setItem(PDF_BOOKMARKS_KEY, JSON.stringify([{ title, href: source.href, page, label }, ...bookmarks]));
  return true;
}

export function removePdfBookmark(storage, { sourceHref, page, label }) {
  const bookmarks = readPdfBookmarks(storage).filter((bookmark) =>
    bookmark.href !== sourceHref || bookmark.page !== page || bookmark.label !== label);
  storage.setItem(PDF_BOOKMARKS_KEY, JSON.stringify(bookmarks));
}
