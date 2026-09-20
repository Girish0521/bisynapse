const { schema, system } = require('./prompts');
const TRANSIENT_STATUSES = new Set([502, 503, 504]);
function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
async function generate(input) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('PROVIDER_NOT_CONFIGURED');
  const primaryModel = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
  const fallbackModel = process.env.GEMINI_FALLBACK_MODEL || 'gemini-3.6-flash';
  const models = [...new Set([primaryModel, fallbackModel].filter(Boolean))];
  const deadline = Date.now() + 40000;
  let response;
  for (let attempt = 0; attempt < 2; attempt++) {
    const model = models[Math.min(attempt, models.length - 1)];
    const body = JSON.stringify({ model, system_instruction:system, input, store:false,
        generation_config:{max_output_tokens:1600},
        response_format:{type:'text',mime_type:'application/json',schema} });
    try {
      const remaining = deadline - Date.now();
      if (remaining <= 0) throw Object.assign(new Error(), { name:'TimeoutError' });
      response = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
        method:'POST', signal:AbortSignal.timeout(remaining),
        headers:{'Content-Type':'application/json','x-goog-api-key':key}, body,
      });
    } catch (error) {
      if (error?.name === 'TimeoutError' || error?.name === 'AbortError') throw new Error('PROVIDER_TIMEOUT');
      throw new Error('PROVIDER_NETWORK_ERROR');
    }
    if (response.ok || attempt === 1) break;
    const canUseFallback = models.length > 1 && response.status === 429;
    const canRetryTransient = TRANSIENT_STATUSES.has(response.status);
    if (!canUseFallback && !canRetryTransient) break;
    if (!canUseFallback && models.length === 1) await delay(500);
  }
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const apiStatus = body?.error?.status;
    throw new Error(`PROVIDER_HTTP_${response.status}${apiStatus ? `_${apiStatus}` : ''}`);
  }
  const data = await response.json();
  if (data.status !== 'completed') throw new Error('PROVIDER_INCOMPLETE');
  const text = (data.steps || []).filter(p => p.type === 'model_output')
    .flatMap(p => p.content || []).filter(p => p.type === 'text').map(p => p.text).join('');
  return JSON.parse(text);
}
module.exports = { generate };
