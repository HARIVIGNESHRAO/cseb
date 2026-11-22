export const RECENT_MATERIALS_KEY = 'cseb-recent-materials-v1';
export const RECENT_MATERIALS_EVENT = 'cseb-recent-materials-change';
export const RECENT_MATERIALS_LIMIT = 8;

export function readRecentMaterials(storage) {
  try {
    const data = JSON.parse(storage.getItem(RECENT_MATERIALS_KEY) || '[]');
    if (!Array.isArray(data)) return [];
    return data.filter((entry) => entry && typeof entry.title === 'string' &&
      typeof entry.href === 'string' && /^https?:\/\//.test(entry.href) && Number.isFinite(entry.openedAt))
      .slice(0, RECENT_MATERIALS_LIMIT);
  } catch { return []; }
}
export function saveRecentPage(storage, key, value, now = Date.now()) {
  if (!/^[1-9]\d*$/.test(value)) return false;
  const page = Number(value);
  if (!Number.isSafeInteger(page)) return false;

  const entries = readRecentMaterials(storage);
  const entry = entries.find((item) => (item.key ?? item.href) === key);
  if (!entry) return false;

  storage.setItem(RECENT_MATERIALS_KEY, JSON.stringify(entries.map((item) =>
    item === entry ? { ...item, page, pageSavedAt: now } : item
  )));
  return true;
}

export function recentPageUrl(href, page) {
  const url = new URL(href, 'https://portal.local');
  const options = new URLSearchParams(url.hash.slice(1));
  options.set('page', page);
  return `${href.split('#')[0]}#${options}`;
}

export function recordRecentMaterial(storage, { title, href }, base, now = Date.now()) {
  try {
    const url = new URL(href, base);
    if (!['http:', 'https:'].includes(url.protocol) || !title?.trim()) return [];
    let identity = url.href;
    if (url.pathname.startsWith('/__offline_pdf__/')) {
      identity = new URL(decodeURIComponent(url.pathname.slice('/__offline_pdf__/'.length)), base).href;
    }
    const canonical = new URL(identity); canonical.hash = '';
    const recent = readRecentMaterials(storage);
    const previous = recent.find((entry) => (entry.key ?? entry.href) === canonical.href);
    const entries = [{ ...previous, title, href: url.href, key: canonical.href, openedAt: now },
      ...recent.filter((entry) => entry !== previous)]
      .slice(0, RECENT_MATERIALS_LIMIT);
    storage.setItem(RECENT_MATERIALS_KEY, JSON.stringify(entries));
    return entries;
  } catch { return []; }
}
