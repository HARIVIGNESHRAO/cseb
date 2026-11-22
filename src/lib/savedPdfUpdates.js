const BASE = 'https://portal.local';
export function savedSourceUrl(file) {
  if (file.sourceUrl) return file.sourceUrl;
  try {
    const path = new URL(file.url, BASE).pathname;
    return path.startsWith('/__offline_pdf__/') ? decodeURIComponent(path.slice('/__offline_pdf__/'.length)) : null;
  } catch { return null; }
}
function normalize(url) {
  try { const value = new URL(url, BASE); value.hash = ''; return value.href; }
  catch { return url; }
}
export function savedPdfUpdate(file, catalog) {
  const source = savedSourceUrl(file);
  let current = file.catalogId ? catalog.find((entry) => entry.id === file.catalogId) : null;
  if (!current) {
    const candidates = catalog.filter((entry) => entry.title === file.title);
    current = candidates.find((entry) => normalize(entry.sourceUrl) === normalize(source));
    if (!current && new Set(candidates.map((entry) => normalize(entry.sourceUrl))).size === 1) current = candidates[0];
  }
  if (!current || !source) return { current: null, outdated: false };
  return {
    current,
    outdated: normalize(source) !== normalize(current.sourceUrl) ||
      Boolean(current.revision && current.revision !== (file.revision || '')),
  };
}
export function filterSavedFiles(files, query, subjects = []) {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return files.filter((file) => {
    const code = String(file.title || '').split(' · ')[0];
    const name = subjects.find((subject) => subject.code === code)?.name || '';
    const text = `${file.title} ${name}`.toLocaleLowerCase();
    return terms.every((term) => text.includes(term));
  });
}
