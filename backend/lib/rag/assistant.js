const { retrieve } = require('./retrieval');
const { generate } = require('./provider');
const { prompt } = require('./prompts');
const { validateAnswer } = require('./validation');
function message(text, status, sources = [], extra = {}) {
  return { id: 'rag-'+crypto.randomUUID(), sender:'assistant', timestamp:new Date().toISOString(), text, sources,
    ragStatus:status, isPrototypeNotice:true, ...extra };
}
const crypto = require('node:crypto');
async function answer(query, { language='en', history=[] } = {}, provider=generate) {
  const recent = history.slice(-4);
  const context = recent.filter(h => h.role === 'user').map(h => h.text).join(' ');
  const full = query + ' ' + context;
  if (!/water|14543|13428|fssai|पानी|जल|నీరు/i.test(full)) {
    return message('This corpus covers packaged drinking water and natural mineral water. What product are you asking about?', 'clarification', [], {followUps:['I manufacture packaged drinking water','I manufacture natural mineral water']});
  }
  if (/huid|hallmark|steel|kettle|charger/i.test(query)) return message('That product is outside the captured water-sector corpus. I cannot verify its requirements from these sources.', 'abstained');
  if (/which.*standard|standard.*appl|what.*standard/i.test(query) && !/packaged|natural|mineral|14543|13428/i.test(full)) return message('Do you mean bottled packaged drinking water, natural mineral water, or a water purifier?', 'clarification');
  let evidence;
  try { evidence = retrieve(full); } catch { return message('The source corpus is unavailable or failed integrity checks. No answer was generated.', 'corpus_unavailable'); }
  if (!evidence.length) return message('I could not find enough matching evidence in the captured documents. Please specify the product, IS number and the requirement you want to check.', 'abstained');
  let feedback;
  for (let attempt=0; attempt<2; attempt++) {
    let value;
    try { value = await provider(prompt(query,recent,language,evidence,feedback)); }
    catch (error) {
      if (error instanceof SyntaxError) { feedback = 'Return valid JSON matching the response schema.'; continue; }
      return message('The language model is unavailable or not configured. Retrieved passages are available below, but no AI answer or verification was generated.', 'provider_unavailable', evidence.slice(0,3).map(source));
    }
    feedback = validateAnswer(value,evidence);
    if (!feedback) {
      const selected = [...new Set(value.citations.map(c => c.evidenceId))].map(id => source(evidence.find(e => e.evidenceId === id)));
      return message(value.answer,value.status,selected,{followUps:value.followUps,repairAttempts:attempt});
    }
  }
  return message('The generated answer failed source citation checks after one repair attempt. I cannot provide a verified answer. Please consult the retrieved sources.', 'validation_failed', evidence.slice(0,3).map(source));
}
function source(e) { return {title:e.citation_label,url:e.source_url+'#page='+e.page_physical,page:String(e.page_physical),excerpt:e.text,chunkId:e.chunk_id}; }
module.exports = { answer };
