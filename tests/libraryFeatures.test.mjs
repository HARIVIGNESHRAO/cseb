import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const moduleFrom = async path => {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8');
  return import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
};
const { savedPdfUpdate, filterSavedFiles } = await moduleFrom('../src/lib/savedPdfUpdates.js');
const { recordRecentMaterial, readRecentMaterials, recentPageUrl, saveRecentPage, RECENT_MATERIALS_KEY } = await moduleFrom('../src/lib/recentMaterials.js');
const oldUrl = 'https://cdn.test/stm-old.pdf';
const oldFile = { title: 'STM · Unit 1', url: 'https://portal.test/__offline_pdf__/' + encodeURIComponent(oldUrl) };

test('updates match old saves by title and new saves by stable identity', () => {
  const current = { id: 'stm/unit1', title: 'STM · Unit 1', sourceUrl: 'https://cdn.test/new.pdf', revision: '' };
  assert.equal(savedPdfUpdate(oldFile, [current]).outdated, true);
  const renamed = { ...current, title: 'STM · Testing notes' };
  assert.equal(savedPdfUpdate({ ...oldFile, catalogId: 'stm/unit1', sourceUrl: oldUrl }, [renamed]).outdated, true);
  assert.equal(savedPdfUpdate({ ...oldFile, sourceUrl: current.sourceUrl }, [current]).outdated, false);
});

test('revision changes trigger notices, ambiguous legacy subjects do not guess', () => {
  const same = { id: 'stm/unit1', title: oldFile.title, sourceUrl: oldUrl, revision: '2' };
  assert.equal(savedPdfUpdate({ ...oldFile, revision: '1' }, [same]).outdated, true);
  assert.equal(savedPdfUpdate({ ...oldFile, revision: '2' }, [same]).outdated, false);
  const ambiguous = [{ ...same, sourceUrl: 'https://cdn.test/a.pdf' }, { ...same, id: 'stm-sem2/unit1', sourceUrl: 'https://cdn.test/b.pdf' }];
  assert.equal(savedPdfUpdate(oldFile, ambiguous).current, null);
  assert.equal(savedPdfUpdate(oldFile, []).outdated, false);
});

test('saved PDF search matches full subject names, codes, and multiple terms', () => {
  const files = [{ title: 'STM · Unit 1' }, { title: 'DM · Unit 2' }, { title: 'STM · Unit 10' }];
  const subjects = [{ code: 'STM', name: 'Software Testing Methodologies' }];
  assert.equal(filterSavedFiles(files, 'testing unit 1', subjects).length, 2);
  assert.deepEqual(filterSavedFiles(files, ' dm  2 ', subjects), [files[1]]);
  assert.equal(filterSavedFiles(files, '', subjects).length, 3);
  assert.equal(filterSavedFiles(files, 'missing', subjects).length, 0);
});

function storage() {
  const values = new Map();
  return { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) };
}

test('recent materials deduplicate online and offline openings and keep only eight items', () => {
  const store = storage();
  for (let i = 0; i < 10; i++) recordRecentMaterial(store, { title: `Unit ${i}`, href: `https://cdn.test/${i}.pdf` }, 'https://portal.test', i);
  assert.equal(readRecentMaterials(store).length, 8);
  recordRecentMaterial(store, { title: 'Unit 9', href: '/__offline_pdf__/' + encodeURIComponent('https://cdn.test/9.pdf') }, 'https://portal.test', 20);
  const recent = readRecentMaterials(store);
  assert.equal(recent.length, 8);
  assert.equal(recent[0].openedAt, 20);
  assert.equal(recent.filter(entry => entry.title === 'Unit 9').length, 1);
});

test('recent history ignores corrupt storage, non-web links and unavailable storage', () => {
  const store = storage();
  store.setItem(RECENT_MATERIALS_KEY, '{broken');
  assert.deepEqual(readRecentMaterials(store), []);
  assert.deepEqual(recordRecentMaterial(store, { title: 'Bad', href: 'javascript:alert(1)' }, 'https://portal.test'), []);
  const blocked = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } };
  assert.deepEqual(readRecentMaterials(blocked), []);
  assert.deepEqual(recordRecentMaterial(blocked, { title: 'Notes', href: '/notes.pdf' }, 'https://portal.test'), []);
});


test('reading pages survive reopening the same PDF from its saved copy', () => {
  const data = new Map();
  const storage = { getItem: (key) => data.get(key), setItem: (key, value) => data.set(key, value) };
  const origin = 'https://portal.test';
  recordRecentMaterial(storage, { title: oldFile.title, href: oldUrl }, origin, 10);
  assert.equal(saveRecentPage(storage, oldUrl, '0'), false);
  assert.equal(saveRecentPage(storage, oldUrl, '2.5'), false);
  assert.equal(saveRecentPage(storage, oldUrl, '12', 20), true);
  const href = recentPageUrl(oldFile.url, 12);
  assert.equal(href, oldFile.url + '#page=12');
  recordRecentMaterial(storage, { title: oldFile.title, href }, origin, 30);
  assert.deepEqual(readRecentMaterials(storage), [
    { title: oldFile.title, href, key: oldUrl, openedAt: 30, page: 12, pageSavedAt: 20 },
  ]);
  assert.equal(recentPageUrl('/pdfs/test.pdf?v=1#zoom=80&page=2', 12), '/pdfs/test.pdf?v=1#zoom=80&page=12');
});


test('PDF bookmarks keep multiple labeled pages independently of recent history', async () => {
  const { readPdfBookmarks, removePdfBookmark, savePdfBookmark } = await moduleFrom('../src/lib/pdfBookmarks.js');
  const data = new Map();
  const storage = { getItem: (key) => data.get(key), setItem: (key, value) => data.set(key, value) };
  const pdf = { title: oldFile.title, href: oldUrl + '#page=2' };
  assert.equal(savePdfBookmark(storage, pdf, '2.5', 'Invalid'), false);
  assert.equal(savePdfBookmark(storage, pdf, '2', '  '), false);
  assert.equal(savePdfBookmark(storage, pdf, '2', ' Formula '), true);
  assert.equal(savePdfBookmark(storage, pdf, '7', 'Practice'), true);
  assert.equal(savePdfBookmark(storage, pdf, '2', 'Formula'), true);

  data.delete(RECENT_MATERIALS_KEY);
  assert.deepEqual(readPdfBookmarks(storage).map(({ href, page, label }) => [href, page, label]), [
    [oldUrl, 2, 'Formula'], [oldUrl, 7, 'Practice'],
  ]);
  removePdfBookmark(storage, { sourceHref: oldUrl, page: 2, label: 'Formula' });
  assert.deepEqual(readPdfBookmarks(storage).map(({ page }) => page), [7]);
});

test('material search matches title, subject, and unit and opens saved copies when filtered', async () => {
  const { searchPdfMaterials } = await moduleFrom('../src/lib/materialSearch.js');
  const catalog = [
    { id: 'cn/unit2', title: 'CN · Network Layer', subjectName: 'Computer Networks', unitName: 'Unit 2', sourceUrl: '/pdfs/cn2.pdf?v=2' },
    { id: 'cn/unit12', title: 'CN · Routing 2', subjectName: 'Computer Networks', unitName: 'Unit 12', sourceUrl: '/pdfs/cn12.pdf' },
  ];
  const origin = 'https://portal.test';
  const savedFiles = [{ sourceUrl: origin + catalog[0].sourceUrl, url: origin + '/__offline_pdf__/cn2' }];
  const find = (query, savedOnly = false) => searchPdfMaterials(catalog, query, savedFiles, { savedOnly, origin });

  assert.deepEqual(find('networks unit2').map((pdf) => pdf.id), ['cn/unit2']);
  assert.equal(find('CN network layer')[0].href, catalog[0].sourceUrl);
  assert.equal(find('CN network layer')[0].saved, true);
  assert.deepEqual(find('', true).map((pdf) => pdf.href), [savedFiles[0].url]);
  assert.deepEqual(find('unit 12', true), []);
});
