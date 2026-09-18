// ============================================================
// BIS SAARTHI AI / BISYNAPSE — DATABASE CLIENT & RAG LAYER
// Supabase PostgreSQL Client with Intelligent In-Memory / File Fallback
// ============================================================

const { createClient } = require('@supabase/supabase-js');
const seedData = require('./seedData');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
// Explicit opt-in protects the shared database during prototype development.
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || '';
const enableSupabase = process.env.ENABLE_SUPABASE === 'true';

let supabase = null;
let isConnectedToSupabase = false;

if (enableSupabase && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Service-role access is disabled until backend authorization is implemented.');
}

if (enableSupabase && SUPABASE_URL && SUPABASE_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false },
    });
    isConnectedToSupabase = true;
    console.log('✅ Supabase PostgreSQL Client successfully initialized');
  } catch (err) {
    console.warn('⚠️ Supabase init failed, using built-in database layer:', err.message);
  }
} else {
  console.log('ℹ️ No SUPABASE_URL configured — operating on built-in active database layer');
}

// ── In-Memory Store populated with Seed Data ──
const store = {
  standards: [...seedData.standardsData],
  documents: [...seedData.documentsData],
  chunks: [...seedData.documentChunksData],
  products: [...seedData.productsData],
  hallmarking: [...seedData.hallmarkingData],
  laboratories: [...seedData.laboratoriesData],
  services: [...seedData.bisServicesData],
  faqs: [...seedData.faqsData],
  queryHistory: [],
  scanRecords: [...seedData.scanRecordsData],
};

// Seed records are examples, never evidence of certification or current limits.
for (const records of Object.values(store)) {
  for (const record of records) record.is_demo = true;
}
store.standards = store.standards.filter(s => !s.standard_number.startsWith('IS 15410'))
  .map(s => ({ ...s, status: 'Needs Verification', source: 'Prototype fixture',
    key_requirements: [], testing_required: [] }));
const sourceManifest = require('../../data/sources/manifest.json');
for (const [number, title, documentId] of [
  ['IS 14543:2024', 'Packaged Drinking Water (Other Than Packaged Natural Mineral Water)', 'bis-pm-14543-jul2025'],
  ['IS 13428:2024', 'Packaged Natural Mineral Water', 'bis-pm-13428-jul2024'],
]) {
  const document = sourceManifest.documents.find(d => d.document_id === documentId);
  store.standards.unshift({ standard_number: number, title, category: 'Food',
    description: 'Captured BIS product manual metadata. Full standard clauses and current mandatory applicability are not verified.',
    searchable_text: `${number} ${title} water food fssai`, status: 'Needs Verification',
    scheme: 'BIS product certification manual', document_url: document.official_url,
    key_requirements: [], testing_required: [], is_demo: false });
}

// ── Database Methods ──────────────────────────────────────────

async function getHealth() {
  return {
    database: isConnectedToSupabase ? 'Supabase client configured (connectivity not verified)' : 'Prototype seed data (not official verification)',
    supabaseConfigured: isConnectedToSupabase,
    counts: {
      standards: store.standards.length,
      products: store.products.length,
      laboratories: store.laboratories.length,
      services: store.services.length,
      faqs: store.faqs.length,
      chunks: store.chunks.length,
      scanRecords: store.scanRecords.length,
    },
  };
}

// ── Standards ──
async function getStandards(params = {}) {
  const { query = '', category = '', sector = '', standardNumber = '' } = params;

  if (isConnectedToSupabase) {
    try {
      let qb = supabase.from('bis_standards').select('*');
      if (standardNumber) qb = qb.ilike('standard_number', `%${standardNumber}%`);
      if (category) qb = qb.ilike('category', `%${category}%`);
      if (sector) qb = qb.ilike('sector', `%${sector}%`);
      if (query) qb = qb.or(`title.ilike.%${query}%,searchable_text.ilike.%${query}%,description.ilike.%${query}%`);
      const { data, error } = await qb;
      if (!error && data && data.length > 0) return data;
    } catch (err) {
      console.warn('Supabase standards query fallback:', err.message);
    }
  }

  const q = (query || '').toLowerCase().trim();
  const cat = (category || '').toLowerCase().trim();
  const sec = (sector || '').toLowerCase().trim();
  const num = (standardNumber || '').toLowerCase().trim();

  const stopWords = new Set(['what', 'which', 'where', 'when', 'how', 'the', 'for', 'and', 'are', 'is', 'a', 'an', 'in', 'of', 'to', 'can', 'you', 'give', 'ans', 'with', 'about', 'applies', 'apply']);
  const queryTerms = q.split(/[\s,?:!]+/).map(w => w.trim()).filter(w => w.length > 2 && !stopWords.has(w));

  const filtered = store.standards.map(s => {
    if (num && !s.standard_number.toLowerCase().includes(num)) return null;
    if (cat && !s.category.toLowerCase().includes(cat)) return null;
    if (sec && !(s.sector || '').toLowerCase().includes(sec)) return null;
    if (!q) return { ...s, score: 1 };

    const fullText = (
      s.standard_number + ' ' +
      s.title + ' ' +
      s.category + ' ' +
      (s.sector || '') + ' ' +
      (s.description || '') + ' ' +
      (s.searchable_text || '')
    ).toLowerCase();

    let score = 0;
    if (fullText.includes(q)) score += 10;
    if (s.standard_number.toLowerCase().includes(q)) score += 20;

    for (const term of queryTerms) {
      if (s.standard_number.toLowerCase().includes(term)) score += 15;
      else if (s.title.toLowerCase().includes(term)) score += 8;
      else if (s.category.toLowerCase().includes(term)) score += 5;
      else if (fullText.includes(term)) score += 3;
    }

    if (score === 0) return null;
    return { ...s, score };
  }).filter(Boolean);

  return filtered.sort((a, b) => b.score - a.score);
}

// ── Products ──
async function getProducts(params = {}) {
  const { query = '', regNo = '', category = '', status = '' } = params;

  if (isConnectedToSupabase) {
    try {
      let qb = supabase.from('products').select('*');
      if (regNo) qb = qb.ilike('registration_number', `%${regNo}%`);
      if (category) qb = qb.ilike('category', `%${category}%`);
      if (status) qb = qb.eq('verification_status', status);
      if (query) qb = qb.or(`product_name.ilike.%${query}%,brand.ilike.%${query}%,manufacturer.ilike.%${query}%,standard_number.ilike.%${query}%`);
      const { data, error } = await qb;
      if (!error && data && data.length > 0) return data;
    } catch (err) {
      console.warn('Supabase products query fallback:', err.message);
    }
  }

  const q = (query || '').toLowerCase().trim();
  const r = (regNo || '').toLowerCase().trim();
  const cat = (category || '').toLowerCase().trim();

  return store.products.filter(p => {
    if (r && !p.registration_number.toLowerCase().includes(r)) return false;
    if (cat && !p.category.toLowerCase().includes(cat)) return false;
    if (status && p.verification_status !== status) return false;
    if (q) {
      const match =
        p.product_name.toLowerCase().includes(q) ||
        (p.brand || '').toLowerCase().includes(q) ||
        (p.manufacturer || '').toLowerCase().includes(q) ||
        p.standard_number.toLowerCase().includes(q) ||
        p.registration_number.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });
}

// ── Hallmarking ──
async function getHallmarkByHUID(huid) {
  const code = (huid || '').toUpperCase().trim();
  if (isConnectedToSupabase) {
    try {
      const { data, error } = await supabase.from('hallmarking').select('*').eq('huid', code).single();
      if (!error && data) return data;
    } catch (err) {
      console.warn('Supabase hallmarking lookup fallback:', err.message);
    }
  }
  return store.hallmarking.find(h => h.huid.toUpperCase() === code) || null;
}

// ── Laboratories ──
async function getLaboratories(params = {}) {
  const { state = '', city = '', standard = '', query = '' } = params;

  if (isConnectedToSupabase) {
    try {
      let qb = supabase.from('laboratories').select('*');
      if (state) qb = qb.ilike('state', `%${state}%`);
      if (city) qb = qb.ilike('city', `%${city}%`);
      if (query) qb = qb.or(`name.ilike.%${query}%,product_category.ilike.%${query}%`);
      const { data, error } = await qb;
      if (!error && data && data.length > 0) return data;
    } catch (err) {
      console.warn('Supabase labs query fallback:', err.message);
    }
  }

  const s = (state || '').toLowerCase().trim();
  const c = (city || '').toLowerCase().trim();
  const std = (standard || '').toLowerCase().trim();
  const q = (query || '').toLowerCase().trim();

  return store.laboratories.filter(lab => {
    if (s && !lab.state.toLowerCase().includes(s) && !lab.city.toLowerCase().includes(s)) return false;
    if (c && !lab.city.toLowerCase().includes(c)) return false;
    if (std && !lab.supported_standards.some(st => st.toLowerCase().includes(std))) return false;
    if (q) {
      const match =
        lab.name.toLowerCase().includes(q) ||
        lab.state.toLowerCase().includes(q) ||
        lab.city.toLowerCase().includes(q) ||
        (lab.product_category || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });
}

// ── Services ──
async function getServices(category = '') {
  const cat = (category || '').toLowerCase().trim();
  if (isConnectedToSupabase) {
    try {
      let qb = supabase.from('bis_services').select('*');
      if (cat) qb = qb.ilike('category', `%${cat}%`);
      const { data, error } = await qb;
      if (!error && data && data.length > 0) return data;
    } catch (err) {
      console.warn('Supabase services fallback:', err.message);
    }
  }
  if (!cat) return store.services;
  return store.services.filter(s => s.category.toLowerCase().includes(cat));
}

// ── FAQs ──
async function getFaqs(category = '') {
  const cat = (category || '').toLowerCase().trim();
  if (isConnectedToSupabase) {
    try {
      let qb = supabase.from('faqs').select('*');
      if (cat) qb = qb.ilike('category', `%${cat}%`);
      const { data, error } = await qb;
      if (!error && data && data.length > 0) return data;
    } catch (err) {
      console.warn('Supabase faqs fallback:', err.message);
    }
  }
  if (!cat) return store.faqs;
  return store.faqs.filter(f => f.category.toLowerCase().includes(cat));
}

// ── Query History ──
async function getQueryHistory(userId = 'anonymous_user') {
  if (isConnectedToSupabase) {
    try {
      const { data, error } = await supabase
        .from('query_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(30);
      if (!error && data) return data;
    } catch (err) {
      console.warn('Supabase query_history fallback:', err.message);
    }
  }
  return store.queryHistory.filter(q => q.user_id === userId || userId === 'all');
}

async function saveQueryHistory(record) {
  const entry = {
    id: 'qh-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    user_id: record.user_id || 'anonymous_user',
    query: record.query,
    response: record.response,
    sources_used: record.sources_used || [],
    language: record.language || 'en',
    created_at: new Date().toISOString(),
  };

  if (isConnectedToSupabase) {
    try {
      await supabase.from('query_history').insert([entry]);
    } catch (err) {
      console.warn('Supabase saveQueryHistory error:', err.message);
    }
  }

  store.queryHistory.unshift(entry);
  if (store.queryHistory.length > 100) store.queryHistory.pop();
  return entry;
}

// ── Scan & Verification Records ──
async function getScanRecords(userId = 'consumer_demo_user') {
  if (isConnectedToSupabase) {
    try {
      const { data, error } = await supabase
        .from('scan_records')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);
      if (!error && data && data.length > 0) return data;
    } catch (err) {
      console.warn('Supabase scan_records fallback:', err.message);
    }
  }
  return store.scanRecords;
}

async function saveScanRecord(record) {
  const entry = {
    id: 'scan-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    user_id: record.user_id || 'consumer_demo_user',
    scan_type: record.scan_type || 'camera_label',
    scanned_value: record.scanned_value || '',
    product_name: record.product_name || 'Scanned Item',
    extracted_information: record.extracted_information || {},
    verification_status: record.verification_status || 'VERIFIED',
    matched_record_id: record.matched_record_id || null,
    source: record.source || 'BIS Camera Scanner',
    is_demo: Boolean(record.is_demo),
    created_at: new Date().toISOString(),
  };

  if (isConnectedToSupabase) {
    try {
      await supabase.from('scan_records').insert([entry]);
    } catch (err) {
      console.warn('Supabase saveScanRecord error:', err.message);
    }
  }

  store.scanRecords.unshift(entry);
  return entry;
}

// ── RAG Document Chunks Retrieval ──
async function searchDocumentChunks(query) {
  const terms = (query || '').toLowerCase().split(/\s+/).filter(w => w.length > 2);
  if (terms.length === 0) return store.chunks.slice(0, 3);

  const scored = store.chunks.map(chunk => {
    const text = (chunk.chunk_text + ' ' + (chunk.standard_number || '') + ' ' + (chunk.section || '')).toLowerCase();
    let score = 0;
    for (const t of terms) {
      if (text.includes(t)) score += 1;
    }
    return { ...chunk, score };
  });

  return scored
    .filter(c => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
}

module.exports = {
  supabase,
  isConnectedToSupabase,
  getHealth,
  getStandards,
  getProducts,
  getHallmarkByHUID,
  getLaboratories,
  getServices,
  getFaqs,
  getQueryHistory,
  saveQueryHistory,
  getScanRecords,
  saveScanRecord,
  searchDocumentChunks,
  store,
};
