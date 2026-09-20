import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, utimesSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const source = readFileSync(new URL('../src/lib/pdfAssets.js', import.meta.url), 'utf8');

test('PDF versions follow content and preserve query strings and fragments', async () => {
  const root = mkdtempSync(path.join(tmpdir(), 'portal-pdf-test-'));
  const originalCwd = process.cwd();
  try {
    mkdirSync(path.join(root, 'public/pdfs'), { recursive: true });
    const file = path.join(root, 'public/pdfs/test file.pdf');
    writeFileSync(file, 'first PDF content');
    process.chdir(root);
    const { withPdfAssetVersion, getUnitPdfUrl } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
    process.chdir(originalCwd);
    const first = withPdfAssetVersion('/pdfs/test file.pdf?download=1&v=old#page=2');
    assert.match(first, /test%20file.pdf\?download=1&v=[a-f0-9]{20}#page=2$/);
    assert.equal(withPdfAssetVersion(first), first);
    utimesSync(file, new Date(), new Date(Date.now() + 5000));
    assert.equal(withPdfAssetVersion(first), first, 'checkout timestamps do not change the version');
    writeFileSync(file, 'replacement PDF content');
    const updated = withPdfAssetVersion(first);
    assert.notEqual(updated, first);
    assert.equal(new URL(updated, 'https://test.local').searchParams.getAll('v').length, 1);
    assert.match(getUnitPdfUrl({}, { pdfUrl: '/pdfs/test file.pdf' }), /\?v=/);
    assert.equal(withPdfAssetVersion('https://example.com/file.pdf?token=x'), 'https://example.com/file.pdf?token=x');
    assert.equal(withPdfAssetVersion('/pdfs/missing.pdf'), '/pdfs/missing.pdf');
    assert.equal(withPdfAssetVersion('/pdfs/%ZZ.pdf'), '/pdfs/%ZZ.pdf');
    assert.equal(withPdfAssetVersion(undefined), undefined);
  } finally {
    process.chdir(originalCwd);
    rmSync(root, { recursive: true, force: true });
  }
});
