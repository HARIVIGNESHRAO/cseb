import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../src/components/ThemeScript.js', import.meta.url), 'utf8');
const script = source.match(/const themeScript = `([\s\S]*?)`;/)[1];

function boot(saved, blocked = false) {
  const document = { documentElement: { dataset: {} } };
  vm.runInNewContext(script, {
    document,
    localStorage: { getItem() { if (blocked) throw new Error('Storage blocked'); return saved; } },
  });
  return document.documentElement.dataset.theme;
}

test('all three saved themes survive page initialization and refresh', () => {
  for (const theme of ['light', 'dark', 'revenge']) {
    assert.equal(boot(theme), theme);
    assert.equal(boot(theme), theme);
  }
});

test('new and invalid preferences use Blue Night without breaking rendering', () => {
  for (const saved of [null, '', 'invalid']) assert.equal(boot(saved), 'dark');
});

test('blocked browser storage still initializes a usable theme', () => {
  assert.equal(boot(null, true), 'dark');
});
