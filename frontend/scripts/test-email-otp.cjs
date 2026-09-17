const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const assert = require('node:assert/strict');
const ts = require('typescript');

const source = fs.readFileSync(path.join(__dirname, '../src/lib/supabaseClient.ts'), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const sent = [];
const verified = [];
const preferences = new Map();
let sendError = null;
let verifyError = null;
let session = { user: { id: 'test-user' } };
const auth = {
  signInWithOtp: async request => { sent.push(request); return { error: sendError }; },
  verifyOtp: async request => { verified.push(request); return { data: { session }, error: verifyError }; },
};
const exportsObject = {};
vm.runInNewContext(compiled, {
  exports: exportsObject,
  require: name => { assert.equal(name, '@supabase/supabase-js'); return { createClient: () => ({ auth }) }; },
  process: { env: { NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co', NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'public-test-key' } },
  window: { location: { origin: 'https://prototype.example' } },
  localStorage: { setItem: (key, value) => preferences.set(key, value) },
});

(async () => {
  const { sendEmailLoginCode: send, verifyEmailLoginCode: verify, resolveUserRole } = exportsObject;
  await assert.rejects(send('invalid', 'consumer'), /valid email/);
  assert.equal(sent.length, 0);
  assert.equal(await send('  Person@Example.com  ', 'industry'), 'person@example.com');
  assert.equal(sent[0].email, 'person@example.com');
  assert.equal(sent[0].options.shouldCreateUser, true);
  assert.equal(sent[0].options.emailRedirectTo, 'https://prototype.example/auth/callback');
  await assert.rejects(verify('person@example.com', '123', 'consumer'), /six-digit/);
  assert.equal(verified.length, 0);
  sendError = new Error('Email delivery unavailable');
  await assert.rejects(send('person@example.com', 'officer'), /delivery unavailable/);
  assert.equal(preferences.get('bisynapse_pending_role'), 'industry');
  verifyError = new Error('Code expired');
  await assert.rejects(verify('person@example.com', '123456', 'officer'), /expired/);
  assert.equal(preferences.get('bisynapse_pending_role'), 'industry');
  verifyError = null;
  session = null;
  await assert.rejects(verify('person@example.com', '123456', 'officer'), /could not be verified/);
  session = { user: { id: 'test-user' } };
  await verify(' Person@Example.com ', '123456', 'retailer');
  assert.equal(verified.at(-1).type, 'email');
  assert.equal(verified.at(-1).email, 'person@example.com');
  assert.equal(preferences.get('bisynapse_pending_role'), 'retailer');
  assert.equal(resolveUserRole({ user_metadata: { role: 'officer' }, app_metadata: {} }, 'officer'), 'consumer');
  console.log('PASS: email validation, send options, delivery failures, invalid/expired codes, session requirement, selected category, and officer denial');
})().catch(error => { console.error(error); process.exitCode = 1; });
