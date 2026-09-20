const { retrieve } = require('./retrieval');
const { generate } = require('./provider');
const { prompt } = require('./prompts');
const { validateAnswer } = require('./validation');
const { findVerifiedAnswer, supportsVerifiedFallback } = require('./verifiedAnswers');
function message(text, status, sources = [], extra = {}) {
  return { id: 'rag-'+crypto.randomUUID(), sender:'assistant', timestamp:new Date().toISOString(), text, sources,
    ragStatus:status, isPrototypeNotice:true, ...extra };
}
const crypto = require('node:crypto');
function retrievalAliases(text) {
  const aliases = [];
  if (/पानी|जल|నీరు|నీళ్ళు/i.test(text)) aliases.push('water');
  if (/परीक्षण|जाँच|पరీక్ష|పరీక్షలు/i.test(text)) aliases.push('testing test');
  if (/योजना|स्कीम|పథకం|స్కీమ్/i.test(text)) aliases.push('scheme');
  if (/खनिज|मिनरल|మినరల్|ఖనిజ/i.test(text)) aliases.push('mineral');
  if (/पैकेज्ड|बोतलबंद|ప్యాకేజ్డ్|సీసా/i.test(text)) aliases.push('packaged drinking');
  if (/ड्रिंकिंग|డ్రింకింగ్/i.test(text)) aliases.push('drinking');
  if (/नैचुरल|प्राकृतिक|నేచురల్|సహజ/i.test(text)) aliases.push('natural');
  if (/मानक|ప్రమాణం|ప్రామాణికం/i.test(text)) aliases.push('Indian standard specification');
  if (/लागू|వర్తిస్తుంది|వర్తించే/i.test(text)) aliases.push('applies covers');
  if (/न्यूनतम|కనీస/i.test(text)) aliases.push('minimum');
  if (/शेल्फ\s*लाइफ|షెల్ఫ్\s*లైఫ్/i.test(text)) aliases.push('declared shelf life');
  if (/कितनी\s*बार|ఎంత\s*తరచుగా/i.test(text)) aliases.push('frequency once');
  if (/सभी\s*पैरामीटर|అన్ని\s*పారామీటర్లు/i.test(text)) aliases.push('all parameters');
  if (/कोलिफॉर्म|కొలిఫార్మ్/i.test(text)) aliases.push('coliform bacteria');
  if (/(?:नया|नई).{0,16}स्रोत|కొత్త.{0,16}వనరు/i.test(text)) aliases.push('new source raw water approval BIS');
  if (/निर्माता|తయారీదారు/i.test(text)) aliases.push('manufacturer');
  if (!aliases.length) return text;
  const identifiers = text.match(/\b(?:FSSAI|BIS|IS\s*\d+)\b/gi) || [];
  return `${identifiers.join(' ')} ${aliases.join(' ')}`.trim();
}
async function answer(query, { language='en', history=[] } = {}, provider=generate) {
  const recent = history.slice(-4);
  const context = recent.filter(h => h.role === 'user').map(h => h.text).join(' ');
  const full = query + ' ' + context;
  if (/nearby laboratory|currently fssai notified/i.test(query)) {
    return message('The captured corpus has no verified live laboratory directory, so I cannot identify a currently notified nearby laboratory.', 'abstained');
  }
  if (/huid|hallmark/i.test(query)) {
    return message('I cannot verify a HUID or hallmark against a live registry from the captured water-sector corpus.', 'abstained');
  }
  if (/steel|kettle|charger/i.test(query)) {
    return message('That product is outside the captured water-sector corpus, so I cannot identify its applicable standard.', 'abstained');
  }
  if (/whatsapp.*(?:status|application)|(?:status|application).*whatsapp/i.test(query)) {
    return message('WhatsApp application-status access is not available in this assistant.', 'abstained');
  }
  if (/licen[cs]e.*(?:currently valid|live.*registry)|live.*registry/i.test(query)) {
    return message('The captured corpus has no live licence registry, so current licence validity cannot be verified.', 'abstained');
  }
  if (/is\s*10500|arsenic limit/i.test(query)) {
    return message('The full text of IS 10500 is not present in this corpus, so I cannot provide or cite that limit.', 'abstained');
  }
  if (!/water|14543|13428|fssai|पानी|जल|నీరు/i.test(full)) {
    return message('This corpus covers packaged drinking water and natural mineral water. What product are you asking about?', 'clarification', [], {followUps:['I manufacture packaged drinking water','I manufacture natural mineral water']});
  }
  const productSpecified = /packaged drinking|natural mineral|14543|13428/i.test(full);
  if (!productSpecified && /which.*(?:standard|licen[cs]e)|what tests|tests.*required|use this source|compl(?:y|iance)|packaging rules/i.test(query)) {
    return message('Please specify the water product type—packaged drinking water or natural mineral water—and the exact source, container, test evidence or licence question.', 'clarification');
  }
  if (/which.*standard|standard.*appl|what.*standard/i.test(query) && !/packaged|natural|mineral|14543|13428/i.test(full)) return message('Do you mean bottled packaged drinking water, natural mineral water, or a water purifier?', 'clarification');
  let evidence;
  try { evidence = retrieve(retrievalAliases(full), 3); } catch { return message('The source corpus is unavailable or failed integrity checks. No answer was generated.', 'corpus_unavailable'); }
  if (!evidence.length) return message('I could not find enough matching evidence in the captured documents. Please specify the product, IS number and the requirement you want to check.', 'abstained');
  let feedback;
  for (let attempt=0; attempt<2; attempt++) {
    let value;
    try { value = await provider(prompt(query,recent,language,evidence,feedback)); }
    catch (error) {
      if (error instanceof SyntaxError) { feedback = 'Return valid JSON matching the response schema.'; continue; }
      console.warn('RAG provider unavailable:', error instanceof Error ? error.message : 'PROVIDER_UNKNOWN_ERROR');
      if (supportsVerifiedFallback(error)) {
        try {
          const verified = findVerifiedAnswer(query);
          if (verified) return message(verified.answer, 'verified_fallback', verified.sources, {
            followUps: [], providerFallback: true,
          });
        } catch (fallbackError) {
          console.warn('Verified fallback unavailable:', fallbackError instanceof Error ? fallbackError.message : 'FALLBACK_UNKNOWN_ERROR');
        }
      }
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
module.exports = { answer, retrievalAliases };
