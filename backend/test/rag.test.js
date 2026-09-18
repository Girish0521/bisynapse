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
test('provider outage returns passages without retrying',async()=>{
  let calls=0;
  const result=await answer(query,{},()=>{calls++; throw Error('PROVIDER_HTTP_429');});
  assert.equal(calls,1); assert.equal(result.ragStatus,'provider_unavailable'); assert.ok(result.sources.length);
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
    assert.equal(body.store,false); assert.equal(body.generation_config.max_output_tokens,1600);
    return {ok:true,json:async()=>({status:'completed',steps:[{type:'thought',content:[{type:'text',text:'private'}]},{type:'model_output',content:[{type:'text',text:JSON.stringify({status:'abstained'})}]}]})};
  };
  try { assert.equal((await require('../lib/rag/provider').generate('{}')).status,'abstained'); }
  finally { global.fetch=oldFetch; if(oldKey===undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY=oldKey; }
});
