import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../src/lib/semesterDefault.js', import.meta.url), 'utf8');
const { getSemesterDefaults, SEMESTER_ROLLOVER } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

test('semester default changes exactly at November 20, 2 PM IST', () => {
  assert.equal(SEMESTER_ROLLOVER, Date.parse('2026-11-20T08:30:00Z'));
  assert.equal(getSemesterDefaults(SEMESTER_ROLLOVER - 1).semester, '4-1');
  assert.equal(getSemesterDefaults(SEMESTER_ROLLOVER).semester, '4-2');
  assert.equal(getSemesterDefaults(SEMESTER_ROLLOVER + 86400000).semester, '4-2');
});

test('old saved preferences do not override the new semester default', () => {
  assert.notEqual(getSemesterDefaults(SEMESTER_ROLLOVER - 1).storageKey, getSemesterDefaults(SEMESTER_ROLLOVER).storageKey);
});
