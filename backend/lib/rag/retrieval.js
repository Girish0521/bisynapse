const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../../..');
const stop = new Set('the a an is are of for to in and what which how my does do can please it this that under'.split(' '));
function tokens(text) {
  return (text.toLowerCase().match(/[\p{L}\p{N}]+/gu) || []).filter(t => !stop.has(t));
}
let cached;
function loadCorpus() {
  if (cached) return cached;
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'data/sources/manifest.json'), 'utf8'));
  const documents = new Map(manifest.documents.map(d => [d.document_id, d]));
  const extractions = new Map();
  for (const d of documents.values()) {
    const original = fs.readFileSync(path.join(root, d.local_file_path));
    if (crypto.createHash('sha256').update(original).digest('hex') !== d.original_sha256) throw new Error('Corpus PDF hash mismatch');
    const bytes = fs.readFileSync(path.join(root, d.extracted_file_path));
    if (crypto.createHash('sha256').update(bytes).digest('hex') !== d.extracted_sha256) throw new Error('Corpus extraction hash mismatch');
    extractions.set(d.document_id, JSON.parse(bytes));
  }
  const pages = fs.readFileSync(path.join(root, 'data/processed/chunks.jsonl'), 'utf8').trim().split('\n').map(JSON.parse);
  const active = pages.filter(p => documents.has(p.document_id) && documents.get(p.document_id).retrieval_status !== 'historical');
  for (const p of active) {
    const extracted = extractions.get(p.document_id);
    if (extracted.pages[p.page_physical - 1]?.text !== p.text) throw new Error('Chunk provenance mismatch');
    p.source_url = documents.get(p.document_id).official_url;
    p.document_type = documents.get(p.document_id).document_type;
  }
  // Paragraph windows retain exact text/page provenance; never split table rows mid-line.
  cached = active.flatMap(p => {
    const lines = p.text.split('\n'); const windows = []; let text = '';
    for (const line of lines) {
      if (text.length + line.length > 1600 && text) { windows.push(text.trim()); text = ''; }
      text += line + '\n';
    }
    if (text.trim()) windows.push(text.trim());
    return windows.map((text, i) => ({ ...p, text, evidenceId: `${p.chunk_id}-w${i}`, terms: tokens(text) }))
      .filter(p => !p.text.includes('(cid:') && !p.text.includes('\uFFFD'));
  });
  return cached;
}
function retrieve(query, limit = 5) {
  const corpus = loadCorpus(); const terms = [...new Set(tokens(query))];
  const avg = corpus.reduce((n,p) => n + p.terms.length, 0) / corpus.length;
  const ranked = corpus.map(p => {
    let score = 0; let hits = 0;
    for (const term of terms) {
      const count = p.terms.filter(t => t === term).length;
      if (!count) continue;
      hits++;
      const df = corpus.filter(c => c.terms.includes(term)).length;
      score += Math.log(1 + (corpus.length - df + .5) / (df + .5)) * count * 2.2 / (count + 1.2 * (.25 + .75 * p.terms.length / avg));
    }
    if (/fssai|2026|mandatory|mandatory.*bis|testing scheme/i.test(query) && p.document_id.startsWith('fssai-')) score *= 1.8;
    return { ...p, score, hits };
  }).filter(p => p.hits >= Math.min(2, terms.length) && p.score > 0);
  return ranked.sort((a,b) => b.score - a.score).slice(0, limit);
}
module.exports = { retrieve, loadCorpus, tokens };
