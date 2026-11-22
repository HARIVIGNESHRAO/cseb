import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../src/lib/savedPdfGroups.js', import.meta.url), 'utf8');
const { groupSavedPdfs } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

test('existing saved files become subject cards with units in natural order', () => {
  const files = ['STM · Unit 10', 'DM · Unit 4', 'STM · Unit 2', 'STM · Unit 1'].map((title, index) => ({ title, url: `/saved/${index}` }));
  const groups = groupSavedPdfs(files, [{ code: 'STM', name: 'Software Testing Methodologies', color: '#123456' }, { code: 'DM', name: 'Data Mining' }]);
  assert.deepEqual(groups.map(group => group.name), ['Data Mining', 'Software Testing Methodologies']);
  assert.deepEqual(groups[1].files.map(file => file.label), ['Unit 1', 'Unit 2', 'Unit 10']);
  assert.equal(groups[1].files[0].url, '/saved/3');
  assert.equal(groups[1].color, '#123456');
});

test('unknown subjects and older untitled files stay accessible without changing saved data', () => {
  const groups = groupSavedPdfs([{ title: 'XYZ · Notes · Chapter 1', url: '/a' }, { title: 'Old notes', url: '/b' }]);
  assert.equal(groups.length, 2);
  assert.equal(groups.find(group => group.code === 'XYZ').files[0].label, 'Notes · Chapter 1');
  assert.equal(groups.find(group => group.code === 'Other').files[0].label, 'Old notes');
  assert.deepEqual(groupSavedPdfs([]), []);
});
