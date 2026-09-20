const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const datasetPath = path.join(root, 'data/eval/water_eval_v1.json');
const manifestPath = path.join(root, 'data/sources/manifest.json');

function normalize(value) {
  return String(value).normalize('NFKC').replace(/\s+/gu, ' ').trim();
}

function loadJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function validate() {
  const dataset = loadJson(datasetPath);
  const manifest = loadJson(manifestPath);
  const documents = new Map(manifest.documents.map(document => [document.document_id, document]));
  const pages = new Map();
  for (const document of documents.values()) {
    const extraction = loadJson(path.join(root, document.extracted_file_path));
    for (const page of extraction.pages) pages.set(`${document.document_id}:${page.page_physical}`, page.text);
  }

  if (dataset.schema_version !== '2.0.0') throw new Error('Unexpected evaluation schema version');
  if (dataset.questions.length !== 50) throw new Error(`Expected 50 questions, found ${dataset.questions.length}`);
  const ids = new Set();
  const counts = { factual: 0, numeric_table: 0, multilingual: 0, clarification: 0, abstention: 0 };
  const splits = { development: 0, held_out: 0 };
  for (const question of dataset.questions) {
    if (!question.eval_id || ids.has(question.eval_id)) throw new Error(`Duplicate or missing eval_id: ${question.eval_id}`);
    ids.add(question.eval_id);
    if (!(question.category in counts)) throw new Error(`Unknown category: ${question.category}`);
    if (!(question.split in splits)) throw new Error(`Unknown split: ${question.split}`);
    if (!['en', 'hi', 'te'].includes(question.language)) throw new Error(`Unsupported language: ${question.language}`);
    if (!['answer_with_evidence', 'clarify', 'abstain'].includes(question.expected_behavior)) throw new Error(`Unknown behavior: ${question.expected_behavior}`);
    if (!question.query || !question.expected_answer || !question.answer_key_terms?.length) throw new Error(`Incomplete case: ${question.eval_id}`);
    counts[question.category]++;
    splits[question.split]++;

    const evidence = question.evidence || [];
    if (question.expected_behavior === 'answer_with_evidence' && !evidence.length) throw new Error(`Missing evidence: ${question.eval_id}`);
    if (question.expected_behavior !== 'answer_with_evidence' && evidence.length) throw new Error(`Non-answer case has evidence: ${question.eval_id}`);
    for (const citation of evidence) {
      const document = documents.get(citation.document_id);
      if (!document || document.retrieval_status === 'historical') throw new Error(`Inactive document in ${question.eval_id}`);
      const text = pages.get(`${citation.document_id}:${citation.page_physical}`);
      if (!text) throw new Error(`Missing page in ${question.eval_id}`);
      if (normalize(citation.quote).length < 20 || !normalize(text).includes(normalize(citation.quote))) {
        throw new Error(`Quotation provenance mismatch in ${question.eval_id}`);
      }
    }
  }

  const expectedCounts = { factual: 20, numeric_table: 10, multilingual: 8, clarification: 6, abstention: 6 };
  if (JSON.stringify(counts) !== JSON.stringify(expectedCounts)) throw new Error(`Category counts mismatch: ${JSON.stringify(counts)}`);
  if (splits.development !== 40 || splits.held_out !== 10) throw new Error(`Split counts mismatch: ${JSON.stringify(splits)}`);
  return { dataset: dataset.dataset_id, questions: dataset.questions.length, counts, splits, reviewStatus: dataset.review_status };
}

if (require.main === module) {
  try {
    const result = validate();
    console.log(`PASS: ${result.dataset} has ${result.questions} provenance-valid cases.`);
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(`FAIL: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = { validate };
