const test = require('node:test');
const assert = require('node:assert/strict');
const { answer } = require('../lib/rag/assistant');
const { retrieve, loadCorpus } = require('../lib/rag/retrieval');
const { validateAnswer } = require('../lib/rag/validation');
const query = 'What does the FSSAI water testing scheme cover?';
function valid(input) {
  const e = JSON.parse(input).evidence[0];
  return {status:'answered', answer:'The retrieved passage is shown below.', citations:[{evidenceId:e.evidenceId,quote:e.text.slice(0,100)}], followUps:[]};
}
test('retrieval excludes superseded documents and damaged extraction', () => {
  const corpus = loadCorpus();
  assert.ok(corpus.length > 0);
  assert.ok(corpus.every(p => p.document_id !== 'bis-pm-14543-jul2024' && !p.text.includes('(cid:')));
  assert.ok(retrieve(query).length > 0);
});
test('clarification does not call the provider', async () => {
  const result = await answer('Which standard applies?', {}, () => { throw Error('Should not call'); });
  assert.equal(result.ragStatus,'clarification');
});
test('unsupported product with water history abstains', async () => {
  const result = await answer('What about a kettle?', {history:[{role:'user',text:query}]}, () => { throw Error('Should not call'); });
  assert.equal(result.ragStatus,'abstained');
});
test('ambiguous water questions clarify and unsupported live lookups abstain without provider calls', async () => {
  const cases = [
    ['Can I use this source for packaged water?', 'clarification'],
    ['What packaging rules apply to my water product?', 'clarification'],
    ['Which nearby laboratory is currently FSSAI notified for my water tests?', 'abstained'],
    ['Is licence CM/L-1234567 currently valid in the live BIS registry?', 'abstained'],
    ['What is the exact permissible arsenic limit in the full text of IS 10500?', 'abstained'],
  ];
  for (const [question, status] of cases) {
    const result = await answer(question, {}, () => { throw Error('Should not call'); });
    assert.equal(result.ragStatus, status, question);
    assert.equal(result.sources.length, 0);
  }
});
test('Hindi and Telugu water-testing terms retrieve FSSAI evidence', async () => {
  for (const [query, language] of [
    ['FSSAI जल परीक्षण योजना में क्या शामिल है?', 'hi'],
    ['FSSAI నీరు పరీక్ష పథకంలో ఏమి ఉంది?', 'te'],
  ]) {
    let citations;
    const result = await answer(query, {language}, input => {
      const parsed=JSON.parse(input); citations=parsed.evidence.map(e=>e.citation);
      return valid(input);
    });
    assert.equal(result.ragStatus,'answered');
    assert.ok(citations.some(citation => citation.startsWith('fssai-testing-20251217')));
  }
});
test('domain-aware retrieval ranks standards and multilingual controls', () => {
  const cases = [
    ['Which standard covers packaged drinking water?', 'bis-pm-14543-jul2025', 1],
    ['Which standard applies to natural mineral water?', 'bis-pm-13428-jul2024', 1],
    ['पैकेज्ड पानी की शेल्फ लाइफ कैसे तय होती है?', 'bis-pm-14543-jul2025', 31],
    ['కొత్త నీటి వనరుకు ఏ అనుమతి అవసరం?', 'bis-pm-14543-jul2025', 51],
  ];
  for (const [question, documentId, page] of cases) {
    const top = retrieve(require('../lib/rag/assistant').retrievalAliases(question), 5);
    assert.ok(top.slice(0,3).some(hit => hit.document_id === documentId && hit.page_physical === page), question);
  }
});
test('invalid citation is repaired exactly once', async () => {
  let calls=0;
  const result = await answer(query, {}, input => {
    calls++;
    if(calls===1) return {...valid(input),citations:[{evidenceId:'invented',quote:'fabricated evidence quotation'}]};
    assert.ok(JSON.parse(input).validationFeedback);
    return valid(input);
  });
  assert.equal(calls,2); assert.equal(result.ragStatus,'answered'); assert.equal(result.repairAttempts,1);
  assert.ok(result.sources[0].url.startsWith('https://')); assert.ok(result.sources[0].excerpt);
});
test('repeated malformed JSON is bounded to two calls', async () => {
  let calls=0;
  const result=await answer(query,{},()=>{calls++; throw new SyntaxError('bad JSON');});
  assert.equal(calls,2); assert.equal(result.ragStatus,'validation_failed');
});
test('non-allowlisted provider outage returns passages without retrying',async()=>{
  let calls=0;
  const result=await answer('What source-water controls apply?',{},()=>{calls++; throw Error('PROVIDER_HTTP_429');});
  assert.equal(calls,1); assert.equal(result.ragStatus,'provider_unavailable'); assert.ok(result.sources.length);
});
test('reviewed demo questions use verified PDF fallbacks for 429, 503 and timeout',async()=>{
  const cases = [
    ['Which standard covers packaged drinking water?', 'PROVIDER_HTTP_429_RESOURCE_EXHAUSTED', ['1']],
    ['What does the FSSAI water testing scheme cover?', 'PROVIDER_HTTP_503_UNAVAILABLE', ['3','16']],
    ['What does IS 13428 cover?', 'PROVIDER_TIMEOUT', ['1']],
    ['What evidence is missing from this water corpus?', 'PROVIDER_HTTP_429', ['1','1','3']],
  ];
  for (const [question,error,pages] of cases) {
    const result=await answer(question,{},()=>{throw Error(error);});
    assert.equal(result.ragStatus,'verified_fallback');
    assert.equal(result.providerFallback,true);
    assert.deepEqual(result.sources.map(source=>source.page),pages);
    assert.ok(result.sources.every(source=>source.excerpt && source.url.includes(`#page=${source.page}`)));
  }
});
test('null citations and fabricated quotes fail validation',()=>{
  const evidence=retrieve(query);
  assert.ok(validateAnswer({status:'answered',answer:'Test',citations:[null],followUps:[]},evidence));
  assert.ok(validateAnswer({status:'answered',answer:'Test',citations:[{evidenceId:evidence[0].evidenceId,quote:'This is an invented quote with no evidence'}],followUps:[]},evidence));
});
test('provider parses REST model_output and ignores thought steps',async()=>{
  const oldFetch=global.fetch; const oldKey=process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY='test-key';
  global.fetch=async(url,options)=>{
    const body=JSON.parse(options.body);
    assert.equal(url,'https://generativelanguage.googleapis.com/v1beta/interactions');
    assert.equal(body.store,false); assert.equal(body.generation_config.max_output_tokens,1600);
    assert.ok(body.system_instruction.includes('Answer only from supplied evidence'));
    assert.equal(body.response_format.mime_type,'application/json');
    return {ok:true,json:async()=>({status:'completed',steps:[{type:'thought',content:[{type:'text',text:'private'}]},{type:'model_output',content:[{type:'text',text:JSON.stringify({status:'abstained'})}]}]})};
  };
  try { assert.equal((await require('../lib/rag/provider').generate('{}')).status,'abstained'); }
  finally { global.fetch=oldFetch; if(oldKey===undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY=oldKey; }
});
test('provider defaults to Gemini 3.6 Flash without enabling an optional fallback',async()=>{
  const oldFetch=global.fetch; const oldKey=process.env.GEMINI_API_KEY;
  const oldModel=process.env.GEMINI_MODEL; const oldFallback=process.env.GEMINI_FALLBACK_MODEL;
  process.env.GEMINI_API_KEY='test-key'; delete process.env.GEMINI_MODEL; delete process.env.GEMINI_FALLBACK_MODEL;
  let calls=0;
  global.fetch=async(_url,options)=>{
    calls++;
    assert.equal(JSON.parse(options.body).model,'gemini-3.6-flash');
    return {ok:true,json:async()=>({status:'completed',steps:[{type:'model_output',content:[{type:'text',text:JSON.stringify({status:'abstained'})}]}]})};
  };
  try { await require('../lib/rag/provider').generate('{}'); assert.equal(calls,1); }
  finally {
    global.fetch=oldFetch;
    if(oldKey===undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY=oldKey;
    if(oldModel===undefined) delete process.env.GEMINI_MODEL; else process.env.GEMINI_MODEL=oldModel;
    if(oldFallback===undefined) delete process.env.GEMINI_FALLBACK_MODEL; else process.env.GEMINI_FALLBACK_MODEL=oldFallback;
  }
});
test('provider reports bounded timeout without leaking request data',async()=>{
  const oldFetch=global.fetch; const oldKey=process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY='test-key';
  global.fetch=async()=>{ const error=new Error('secret prompt and key'); error.name='TimeoutError'; throw error; };
  try { await assert.rejects(require('../lib/rag/provider').generate('private input'), /PROVIDER_TIMEOUT/); }
  finally { global.fetch=oldFetch; if(oldKey===undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY=oldKey; }
});
test('provider retries one transient service failure',async()=>{
  const oldFetch=global.fetch; const oldKey=process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY='test-key'; let calls=0;
  global.fetch=async()=>++calls===1
    ? {ok:false,status:503,json:async()=>({error:{status:'UNAVAILABLE'}})}
    : {ok:true,json:async()=>({status:'completed',steps:[{type:'model_output',content:[{type:'text',text:JSON.stringify({status:'abstained'})}]}]})};
  try { assert.equal((await require('../lib/rag/provider').generate('{}')).status,'abstained'); assert.equal(calls,2); }
  finally { global.fetch=oldFetch; if(oldKey===undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY=oldKey; }
});
test('provider falls back once when the primary model reaches its quota',async()=>{
  const oldFetch=global.fetch; const oldKey=process.env.GEMINI_API_KEY;
  const oldModel=process.env.GEMINI_MODEL; const oldFallback=process.env.GEMINI_FALLBACK_MODEL;
  process.env.GEMINI_API_KEY='test-key'; process.env.GEMINI_MODEL='gemini-3.6-flash';
  process.env.GEMINI_FALLBACK_MODEL='gemini-3.8-flash'; let calls=0;
  global.fetch=async(_url,options)=>{
    const model=JSON.parse(options.body).model; calls++;
    if(calls===1) { assert.equal(model,'gemini-3.6-flash'); return {ok:false,status:429,json:async()=>({error:{status:'RESOURCE_EXHAUSTED'}})}; }
    assert.equal(model,'gemini-3.8-flash');
    return {ok:true,json:async()=>({status:'completed',steps:[{type:'model_output',content:[{type:'text',text:JSON.stringify({status:'abstained'})}]}]})};
  };
  try { assert.equal((await require('../lib/rag/provider').generate('{}')).status,'abstained'); assert.equal(calls,2); }
  finally {
    global.fetch=oldFetch;
    if(oldKey===undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY=oldKey;
    if(oldModel===undefined) delete process.env.GEMINI_MODEL; else process.env.GEMINI_MODEL=oldModel;
    if(oldFallback===undefined) delete process.env.GEMINI_FALLBACK_MODEL; else process.env.GEMINI_FALLBACK_MODEL=oldFallback;
  }
});
