import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
async function load(file) {
  const source = readFileSync(new URL(file, import.meta.url), 'utf8');
  return import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
}
const { isVideoReleased, VIDEO_RELEASE_AT } = await load('../src/lib/videoRelease.js');

test('release is locked until November 20 at 5 PM IST', () => {
  assert.equal(VIDEO_RELEASE_AT, Date.parse('2026-11-20T11:30:00Z'));
  assert.equal(isVideoReleased(VIDEO_RELEASE_AT - 1), false);
  assert.equal(isVideoReleased(VIDEO_RELEASE_AT), true);
});
