import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../src/lib/developmentOfflineReset.js', import.meta.url), 'utf8');
const { developmentOfflineReset } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

test('development removes portal worker and stale UI caches, retaining saved PDFs', async () => {
  const removed = [];
  let reloads = 0;
  let unregistered = 0;
  const cacheNames = ['dhurandhar-pages-v1', 'dhurandhar-assets-v1', 'dhurandhar-shell-v2', 'dhurandhar-pdfs-v1', 'dhurandhar-pdf-info-v1', 'other-app'];
  await vm.runInNewContext(developmentOfflineReset, {
    URL, window: { caches: {} },
    caches: { keys: async () => cacheNames, delete: async (name) => removed.push(name) },
    location: { origin: 'http://localhost:3000', reload: () => reloads++ },
    navigator: { serviceWorker: {
      controller: { scriptURL: 'http://localhost:3000/sw.js' },
      getRegistrations: async () => [
        { active: { scriptURL: 'http://localhost:3000/sw.js' }, unregister: async () => unregistered++ },
        { active: { scriptURL: 'http://localhost:3000/other-sw.js' }, unregister: async () => assert.fail('Unrelated worker') },
      ],
    } },
  });
  assert.deepEqual(removed, cacheNames.slice(0, 3));
  assert.equal(unregistered, 1);
  assert.equal(reloads, 1);
});

test('development without an active portal controller does not reload', async () => {
  let reloads = 0;
  await vm.runInNewContext(developmentOfflineReset, {
    URL, window: {}, location: { origin: 'http://localhost:3000', reload: () => reloads++ },
    navigator: { serviceWorker: { controller: null, getRegistrations: async () => [] } },
  });
  assert.equal(reloads, 0);
});
