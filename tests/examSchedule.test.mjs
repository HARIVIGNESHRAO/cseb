import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/lib/examSchedule.js', import.meta.url), 'utf8');
const { EXAMS, getExamState, getSelectedExamState, getAvailableExamIndices } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
const at = (date) => new Date(`${date}+05:30`);

test('October 30 exams are disabled, including previous navigation', () => {
  const now = at('2026-10-30T10:00:00');
  assert.equal(getExamState(now).exam.start, '2026-10-31T09:30:00+05:30');
  assert.ok(getAvailableExamIndices(now).every((i) => !EXAMS[i].start.startsWith('2026-10-30')));
});

test('October 31 content disappears at 4:30 PM and advances to November 1', () => {
  const before = at('2026-10-31T16:29:59');
  assert.equal(getExamState(before).exam.id, 'es');
  assert.equal(getExamState(before).phase, 'live');
  const after = at('2026-10-31T16:30:00');
  assert.equal(getExamState(after).exam.start, '2026-11-01T09:30:00+05:30');
  assert.ok(getAvailableExamIndices(after).every((i) => EXAMS[i].startTime >= at('2026-11-01T00:00:00').getTime()));
});

test('November 1 exams remain available until each ends, then advance to November 12', () => {
  assert.equal(getExamState(at('2026-11-01T10:00:00')).phase, 'live');
  const after = at('2026-11-01T16:30:00');
  assert.equal(getExamState(after).exam.start, '2026-11-12T10:00:00+05:30');
  assert.ok(getAvailableExamIndices(after).every((i) => EXAMS[i].endTime > after.getTime()));
  assert.ok(getAvailableExamIndices(after).every((i) => !EXAMS[i].start.startsWith('2026-11-01')));
});

test('November exams start at 10 AM, end at 1 PM, and disappear at the end boundary', () => {
  for (const [day, id] of [[12, 'befa'], [14, 'stm'], [16, 'dm'], [18, 'irs'], [20, 'dvt']]) {
    const start = at(`2026-11-${day}T10:00:00`);
    const end = at(`2026-11-${day}T13:00:00`);
    const state = getExamState(start);
    assert.equal(state.exam.id, id);
    assert.equal(state.phase, 'live');
    assert.equal(state.remainingMs, 3 * 60 * 60 * 1000);
    assert.equal(getSelectedExamState(state.exam, end).phase, 'ended');
    assert.ok(!getAvailableExamIndices(end).includes(EXAMS.indexOf(state.exam)));
  }
});

test('holidays stay hidden from navigation until the final exam ends', () => {
  for (const date of ['2026-10-30T17:00:00', '2026-11-20T09:00:00', '2026-11-20T12:59:59']) {
    const now = at(date);
    assert.ok(getAvailableExamIndices(now).every((i) => EXAMS[i].kind !== 'holiday'));
    assert.notEqual(getExamState(now).exam.kind, 'holiday');
  }
  const now = at('2026-11-20T12:59:59');
  assert.equal(EXAMS[getAvailableExamIndices(now).at(-1)].id, 'dvt');
});

test('final exam transitions directly to holidays and counts down to December 1 reopening', () => {
  for (const date of ['2026-11-20T13:00:00', '2026-11-21T00:00:00', '2026-11-30T23:59:59', '2026-12-01T09:29:59']) {
    const now = at(date);
    const state = getExamState(now);
    assert.equal(state.phase, 'holiday');
    assert.equal(state.exam.id, 'holidays');
    assert.equal(state.remainingMs, at('2026-12-01T09:30:00').getTime() - now.getTime());
    assert.equal(getAvailableExamIndices(now).length, 1);
  }
  assert.equal(getExamState(at('2026-12-01T09:30:00')).phase, 'done');
  assert.deepEqual(getAvailableExamIndices(at('2026-12-01T09:30:00')), []);
  assert.equal(getExamState(null).phase, 'loading');
});
