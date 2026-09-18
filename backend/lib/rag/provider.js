const { schema, system } = require('./prompts');
async function generate(input) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('PROVIDER_NOT_CONFIGURED');
  const model = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
    method:'POST', signal:AbortSignal.timeout(20000),
    headers:{'Content-Type':'application/json','x-goog-api-key':key},
    body: JSON.stringify({ model, system_instruction:system, input, store:false,
      generation_config:{max_output_tokens:1600},
      response_format:{type:'text',mime_type:'application/json',schema} })
  });
  if (!response.ok) throw new Error(`PROVIDER_HTTP_${response.status}`);
  const data = await response.json();
  if (data.status !== 'completed') throw new Error('PROVIDER_INCOMPLETE');
  const text = (data.steps || []).filter(p => p.type === 'model_output')
    .flatMap(p => p.content || []).filter(p => p.type === 'text').map(p => p.text).join('');
  return JSON.parse(text);
}
module.exports = { generate };
