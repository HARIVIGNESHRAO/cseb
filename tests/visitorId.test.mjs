import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../src/lib/visitorId.js', import.meta.url), 'utf8');
const { createVisitorId } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

test('uses native UUID support when available', () => {
  assert.equal(createVisitorId({ randomUUID: () => 'native-uuid' }), 'native-uuid');
});
test('supports browsers without randomUUID, including non-secure origins', () => {
  const id = createVisitorId({ getRandomValues: (bytes) => bytes.fill(171) });
  assert.equal(id, 'ab'.repeat(16));
  for (const api of [null, {}]) assert.match(createVisitorId(api), /^[a-zA-Z0-9-]{16,80}$/);
});
