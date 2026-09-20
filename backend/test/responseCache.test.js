const test = require('node:test');
const assert = require('node:assert/strict');
const { createResponseCache } = require('../lib/rag/responseCache');

function answer(id = 'original') {
  return { id, timestamp: 'old', ragStatus: 'answered', text: 'Grounded answer', sources: [] };
}

test('normalizes and reuses successful history-free answers', async () => {
  const cache = createResponseCache({ ttlMs: 1000, maxEntries: 2 });
  let calls = 0;
  const first = await cache.run('  Packaged   WATER  ', { language: 'en', history: [] }, async () => {
    calls++;
    return answer();
  });
  const second = await cache.run('packaged water', { language: 'en', history: [] }, async () => {
    calls++;
    return answer('unexpected');
  });
  assert.equal(calls, 1);
  assert.equal(first.cacheHit, false);
  assert.equal(second.cacheHit, true);
  assert.notEqual(second.id, first.id);
});

test('does not cache provider failures or conversations with history', async () => {
  const cache = createResponseCache();
  let calls = 0;
  const unavailable = async () => { calls++; return { ragStatus: 'provider_unavailable' }; };
  await cache.run('water', { language: 'en', history: [] }, unavailable);
  await cache.run('water', { language: 'en', history: [] }, unavailable);
  const loader = async () => { calls++; return answer(); };
  const options = { language: 'en', history: [{ role: 'user', text: 'context' }] };
  await cache.run('water', options, loader);
  await cache.run('water', options, loader);
  assert.equal(calls, 4);
});

test('coalesces simultaneous duplicate requests', async () => {
  const cache = createResponseCache();
  let calls = 0;
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  const loader = async () => { calls++; await gate; return answer(); };
  const first = cache.run('water testing scheme', { language: 'en', history: [] }, loader);
  const second = cache.run('water testing scheme', { language: 'en', history: [] }, loader);
  release();
  const results = await Promise.all([first, second]);
  assert.equal(calls, 1);
  assert.equal(results.length, 2);
});
