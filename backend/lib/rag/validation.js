const normalize = s => s.replace(/\s+/g,' ').trim();
function validateAnswer(value, evidence) {
  if (!value || !['answered','clarification','abstained'].includes(value.status) || typeof value.answer !== 'string' || !value.answer.trim() || value.answer.length > 6000) return 'Invalid answer schema';
  if (!Array.isArray(value.citations) || value.citations.length > 8 || !Array.isArray(value.followUps) || value.followUps.length > 3 || value.followUps.some(p => typeof p !== 'string' || p.length > 250)) return 'Invalid citation/follow-up schema';
  if (value.status === 'answered' && !value.citations.length) return 'An answer needs source evidence';
  for (const c of value.citations) {
    if (!c || typeof c !== 'object') return 'Invalid citation schema';
    const source = evidence.find(e => e.evidenceId === c.evidenceId);
    if (!source || typeof c.quote !== 'string' || normalize(c.quote).length < 20 || !normalize(source.text).includes(normalize(c.quote))) return 'Citation must use a supplied ID and an exact supporting quote';
  }
  return null;
}
module.exports = { validateAnswer };
