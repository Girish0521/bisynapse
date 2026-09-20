const crypto = require('node:crypto');

function positiveInteger(value, fallback) {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function createResponseCache({ ttlMs = 15 * 60 * 1000, maxEntries = 100 } = {}) {
  const ttl = positiveInteger(ttlMs, 15 * 60 * 1000);
  const limit = positiveInteger(maxEntries, 100);
  const entries = new Map();
  const inFlight = new Map();

  function cacheKey(query, { language = 'en', history = [] } = {}) {
    if (history.length) return null;
    const normalized = query.trim().toLocaleLowerCase(language).replace(/\s+/gu, ' ');
    return crypto.createHash('sha256').update(`${language}\0${normalized}`).digest('hex');
  }

  function freshCopy(value, cacheHit) {
    return {
      ...value,
      id: `rag-${crypto.randomUUID()}`,
      timestamp: new Date().toISOString(),
      cacheHit,
    };
  }

  function get(key) {
    const entry = entries.get(key);
    if (!entry) return null;
    if (entry.expiresAt <= Date.now()) {
      entries.delete(key);
      return null;
    }
    entries.delete(key);
    entries.set(key, entry);
    return freshCopy(entry.value, true);
  }

  function set(key, value) {
    entries.delete(key);
    entries.set(key, { value, expiresAt: Date.now() + ttl });
    while (entries.size > limit) entries.delete(entries.keys().next().value);
  }

  async function run(query, options, loader) {
    const key = cacheKey(query, options);
    if (!key) return loader();
    const cached = get(key);
    if (cached) return cached;
    if (inFlight.has(key)) return freshCopy(await inFlight.get(key), false);

    const pending = loader();
    inFlight.set(key, pending);
    try {
      const result = await pending;
      if (result?.ragStatus === 'answered') set(key, result);
      return { ...result, cacheHit: false };
    } finally {
      inFlight.delete(key);
    }
  }

  return { run };
}

const responseCache = createResponseCache({
  ttlMs: process.env.RAG_CACHE_TTL_MS,
  maxEntries: process.env.RAG_CACHE_MAX_ENTRIES,
});

module.exports = { createResponseCache, responseCache };
