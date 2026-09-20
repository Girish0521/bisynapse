const { loadCorpus } = require('./retrieval');

const answers = [
  {
    question: 'Which standard covers packaged drinking water?',
    answer: 'IS 14543:2024 covers packaged drinking water other than packaged natural mineral water. The captured BIS document is a product manual for certification under that standard; it is not the full text of the standard.',
    citations: [
      {
        evidenceId: 'bis-pm-14543-jul2025-p1-w0',
        quote: 'Packaged Drinking Water (other than Packaged Natural Mineral Water) — Specification\nACCORDING TO IS 14543:2024',
      },
    ],
  },
  {
    question: 'What does the FSSAI water testing scheme cover?',
    answer: 'The captured FSSAI document contains separate schemes for packaged drinking water under FSSR 2.10.8 and mineral water under FSSR 2.10.7. The schemes cover test records, packaging, levels of control, microbiological non-compliance and source-water testing; later tables provide parameter-specific frequencies and laboratory requirements.',
    citations: [
      {
        evidenceId: 'fssai-testing-20251217-p3-w0',
        quote: 'SCHEME OF TESTING FOR PACKAGED DRINKING WATER (OTHER THAN PACKAGED\nNATURAL MINERAL WATER) IN ACCORDANCE WITH FSSR 2.10.8.',
      },
      {
        evidenceId: 'fssai-testing-20251217-p16-w0',
        quote: 'SCHEME OF TESTING FOR MINERAL WATER IN ACCORDANCE WITH FSSR 2.10.7.',
      },
    ],
  },
  {
    question: 'What does IS 13428 cover?',
    answer: 'IS 13428:2024 covers packaged natural mineral water. The captured BIS document is the product manual used for certification practice and prospective applicants; it is not the full standard text.',
    citations: [
      {
        evidenceId: 'bis-pm-13428-jul2024-p1-w0',
        quote: 'Packaged Natural Mineral Water — Specification\nACCORDING TO IS 13428:2024',
      },
    ],
  },
  {
    question: 'What evidence is missing from this water corpus?',
    answer: 'According to the corpus inventory, the main missing evidence is the full text of the standards, the October 2024 Gazette document, and verified live laboratory scope or registry records. The captured material includes BIS product manuals and an FSSAI testing scheme, so it does not support claims of complete clause-level standards coverage or live registry verification.',
    citations: [
      {
        evidenceId: 'bis-pm-14543-jul2025-p1-w0',
        quote: 'PRODUCT MANUAL FOR\nPackaged Drinking Water (other than Packaged Natural Mineral Water) — Specification',
      },
      {
        evidenceId: 'bis-pm-13428-jul2024-p1-w0',
        quote: 'PRODUCT MANUAL FOR\nPackaged Natural Mineral Water — Specification',
      },
      {
        evidenceId: 'fssai-testing-20251217-p3-w0',
        quote: 'SCHEME OF TESTING FOR PACKAGED DRINKING WATER (OTHER THAN PACKAGED\nNATURAL MINERAL WATER) IN ACCORDANCE WITH FSSR 2.10.8.',
      },
    ],
  },
];

function normalizeQuestion(value) {
  return value.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
}

function source(evidence, quote) {
  return {
    title: evidence.citation_label,
    url: `${evidence.source_url}#page=${evidence.page_physical}`,
    page: String(evidence.page_physical),
    excerpt: quote,
    chunkId: evidence.chunk_id,
  };
}

function findVerifiedAnswer(query) {
  const entry = answers.find(candidate => normalizeQuestion(candidate.question) === normalizeQuestion(query));
  if (!entry) return null;
  const corpus = loadCorpus();
  const sources = entry.citations.map(citation => {
    const evidence = corpus.find(item => item.evidenceId === citation.evidenceId);
    if (!evidence || !evidence.text.includes(citation.quote)) {
      throw new Error(`Verified fallback provenance mismatch: ${citation.evidenceId}`);
    }
    return source(evidence, citation.quote);
  });
  return { answer: entry.answer, sources };
}

function supportsVerifiedFallback(error) {
  const code = error instanceof Error ? error.message : '';
  return code === 'PROVIDER_TIMEOUT' || /^PROVIDER_HTTP_(429|503)(?:_|$)/.test(code);
}

module.exports = { findVerifiedAnswer, normalizeQuestion, supportsVerifiedFallback };
