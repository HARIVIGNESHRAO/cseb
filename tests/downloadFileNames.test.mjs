import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../src/lib/downloadFileNames.js', import.meta.url), 'utf8');
const { getZipUnitFileName } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

test('ES archive units use readable names instead of Cloudinary URLs and suffixes', () => {
  for (let n = 1; n <= 5; n++) {
    assert.equal(getZipUnitFileName({ code: 'ES' }, {
      id: `unit${n}`, name: `Unit ${n}`, pdfFile: `https://res.cloudinary.com/example/image/upload/v123/ES_UNIT_${n}_random.pdf`,
    }), `ES_UNIT_${n}.pdf`);
  }
});

test('other archive entries preserve local filenames and name remote resources safely', () => {
  assert.equal(getZipUnitFileName({ code: 'DVT' }, { pdfFile: 'DVT_UNIT_1 ' }), 'DVT_UNIT_1.pdf');
  assert.equal(getZipUnitFileName({ code: 'ES' }, { name: 'Important Questions', pdfFile: 'https://example.com/random.pdf' }), 'ES_Important_Questions.pdf');
});
