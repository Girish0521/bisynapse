const fs = require('node:fs');
const path = require('node:path');
const { validate } = require('./validate_water_eval');
const { retrieve } = require('../../backend/lib/rag/retrieval');
const { answer, retrievalAliases } = require('../../backend/lib/rag/assistant');

const root = path.resolve(__dirname, '../..');
const dataset = JSON.parse(fs.readFileSync(path.join(root, 'data/eval/water_eval_v1.json'), 'utf8'));

function argument(name, fallback) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

function percentage(value, total) {
  return total ? Number((100 * value / total).toFixed(1)) : null;
}

function matchesEvidence(item, evidence) {
  return evidence.some(expected => item.document_id === expected.document_id && item.page_physical === expected.page_physical);
}

function expectedStatus(behavior) {
  if (behavior === 'clarify') return new Set(['clarification']);
  if (behavior === 'abstain') return new Set(['abstained']);
  return new Set(['answered', 'verified_fallback']);
}

function sourceMatches(source, evidence) {
  return evidence.some(expected => source.title?.startsWith(`${expected.document_id},`) && String(source.page) === String(expected.page_physical));
}

function termsMatch(text, terms) {
  const normalized = text.normalize('NFKC').toLocaleLowerCase().replace(/\s+/gu, ' ');
  return terms.every(term => normalized.includes(term.normalize('NFKC').toLocaleLowerCase()));
}

async function main() {
  validate();
  const split = argument('--split', 'all');
  const limit = Number(argument('--limit', '0')) || Infinity;
  const live = process.argv.includes('--live');
  const selected = dataset.questions.filter(question => split === 'all' || question.split === split).slice(0, limit);
  const rows = [];

  for (const question of selected) {
    const evidence = question.evidence || [];
    const ranked = retrieve(retrievalAliases(question.query), 5);
    const firstRank = question.expected_behavior === 'answer_with_evidence'
      ? ranked.findIndex(item => matchesEvidence(item, evidence)) + 1
      : 0;
    const row = {
      evalId: question.eval_id,
      split: question.split,
      category: question.category,
      language: question.language,
      expectedBehavior: question.expected_behavior,
      retrievalHitAt3: firstRank > 0 && firstRank <= 3,
      retrievalHitAt5: firstRank > 0 && firstRank <= 5,
      reciprocalRank: firstRank > 0 ? 1 / firstRank : 0,
    };

    if (live) {
      const result = await answer(question.query, { language: question.language, history: [] });
      row.ragStatus = result.ragStatus;
      row.behaviorCorrect = expectedStatus(question.expected_behavior).has(result.ragStatus);
      row.answerKeyTermsPresent = termsMatch(result.text || '', question.answer_key_terms);
      row.citationPageCorrect = question.expected_behavior === 'answer_with_evidence'
        ? Boolean(result.sources?.some(source => sourceMatches(source, evidence)))
        : !result.sources?.length;
    }
    rows.push(row);
    const retrievalResult = question.expected_behavior === 'answer_with_evidence'
      ? (row.retrievalHitAt3 ? 'pass' : 'fail')
      : 'n/a';
    console.log(`${question.eval_id}: R@3=${retrievalResult}${live ? ` behavior=${row.behaviorCorrect ? 'pass' : 'fail'} status=${row.ragStatus}` : ''}`);
  }

  const answerRows = rows.filter(row => row.expectedBehavior === 'answer_with_evidence');
  const report = {
    dataset: dataset.dataset_id,
    reviewStatus: dataset.review_status,
    mode: live ? 'live_generation' : 'retrieval_only',
    split,
    evaluatedCases: rows.length,
    answerableCases: answerRows.length,
    retrieval: {
      recallAt3Percent: percentage(answerRows.filter(row => row.retrievalHitAt3).length, answerRows.length),
      recallAt5Percent: percentage(answerRows.filter(row => row.retrievalHitAt5).length, answerRows.length),
      meanReciprocalRankAt5: answerRows.length ? Number((answerRows.reduce((sum, row) => sum + row.reciprocalRank, 0) / answerRows.length).toFixed(3)) : null,
    },
  };
  if (live) {
    report.generation = {
      behaviorAccuracyPercent: percentage(rows.filter(row => row.behaviorCorrect).length, rows.length),
      answerKeyCoveragePercent: percentage(rows.filter(row => row.answerKeyTermsPresent).length, rows.length),
      citationPageAccuracyPercent: percentage(rows.filter(row => row.citationPageCorrect).length, rows.length),
    };
  }
  console.log('\n' + JSON.stringify(report, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
