# BISynapse refinement and security checklist

Updated: 18 September 2026. Tested local Work checkout, including uncommitted RAG changes. This is a first review, not a security certification or a claim that the hosted deployment is updated.

| Check | Status | Evidence / next action |
|---|---|---|
| Public navigation | Pass | Browser visited home, standards, assistant, labs, certification, hallmarking, support, scan, services, about. |
| Google sign-in | Pass | User completed sign-in; browser showed authenticated consumer workspace. |
| Session continuity | Pass | Authenticated identity remained available across page navigations. |
| Officer access for consumer | Pass | Officer page showed access-restricted state for signed-in consumer. This is a UI check; no private officer API is enabled. |
| Sign-out and protected routes | Pass | Signed out through navigation; visiting /consumer redirected to /login. |
| Water standards search | Pass | Correct IS 14543:2024 and IS 13428:2024 manual metadata displayed. Wrong water seed record removed; fallback numerical requirements suppressed. |
| Standard dialog keyboard behavior | Pass | Focus entered native modal, Escape dismissed; focus restoration implemented. |
| Scanner guidance dialog | Pass | Opens with honest implementation limits, Escape closes, focus returns to scanner button. |
| Assistant retrieval fallback | Pass | Missing model key returns captured PDF excerpts and physical-page citations, without simulated AI answers. |
| Assistant follow-up and reset | Pass | Follow-up resolved water context and asked a focused product clarification. Reset cleared conversation. |
| Citation repair and outages | Pass | Automated tests cover invented IDs/quotes, malformed JSON, one repair maximum, and no outage retry. |
| Live generated answer correctness | Not tested | Configure server-only Gemini key, then evaluate evidence support, numerical questions and prompt injection. Citation provenance is not semantic entailment. |
| Hindi/Telugu retrieval | Not tested | UI options and language instructions do not establish retrieval or translation quality. |
| Laboratory availability and demo | Pass | Default reports live integration unavailable; explicitly selected demo mode labels examples. Outage and Retry checked. |
| HUID result honesty | Pass | Arbitrary ABC123 no longer returns fabricated purity/assay/verified result. It directs the user to official verification. |
| Manual product lookup | Pass | Sample licence match is Needs Verification, with explicit prototype limitation. |
| Product lookup outage | Pass | Backend deliberately stopped; sample lookup returned unavailable with no verification result. Backend restored afterward. |
| Image/OCR behavior | Code reviewed | Upload no longer maps every image to a kettle. Legacy image APIs return 503; simulated OCR popup removed. Actual image recognition remains unimplemented. |
| Physical camera / permission denial | Not tested | No camera permission granted during this review. Stream ownership/cleanup reviewed; denial now reports manual-entry alternative. |
| Layout at browser panel width | Pass | No horizontal overflow observed across ten public pages at available panel width (about 631 CSS px). Screenshot visually inspected. |
| Exact 390 px and 1440 px layouts | Blocked | In-app browser ignored viewport overrides; earlier requested-size measurements are not valid proof of these breakpoints. Use a browser supporting effective viewport control or real devices. |
| Complete accessibility audit | Not tested | Search/chat/HUID/lab controls labelled, two dialogs improved. Screen-reader, contrast and full keyboard audit remain. |
| Frontend security headers | Pass | HTTP verified nosniff, frame denial, referrer policy and removal of X-Powered-By. Camera limited to self; microphone/geolocation denied. |
| API security headers | Pass | Automated HTTP assertions verify frame denial, nosniff and no X-Powered-By. |
| Request validation | Pass | Invalid JSON 400, oversized payload 413, system-role history rejected, malformed scan inputs rejected. |
| Public model request budget | Pass | Automated test reaches 429 with Retry-After after instance-wide budget. 30 requests/minute per instance; not distributed or account-specific protection. |
| Private history endpoint | Pass | Endpoint remains 503 until JWT ownership authorization is implemented. Fabricated consumer history removed. |
| Scan ownership spoof / retention | Pass | Public scan lookup ignores supplied user IDs and does not persist private records. |
| Local SQL ownership rules | Prepared | Replaced unrestricted history/scan policies with auth.uid ownership, authenticated-only grants and restrictive guards. Transactional SQL test script prepared. |
| Deployed Supabase public schema | Inspected | Dashboard for configured project shows no public tables and no migrations. Local permissive policies are not deployed there; current project supports Auth, not the reference/history data integration. |
| Supabase callback allowlist | Pass | Read-only dashboard review: exact production /auth/callback and localhost:3000/auth/callback entries; no wildcard callback entries observed. |
| Database isolation runtime tests | Blocked | No local Supabase/Postgres CLI found; target public tables absent. Run SQL test in disposable database after schema/ownership migration. Nothing applied to shared database. |
| Two real accounts / session expiry | Not tested | Requires second test identity and controlled expired-session cases. |
| Production dependency advisories | Pass | npm audit --omit=dev: zero advisories in both frontend and backend at review time; dev dependencies excluded. |
| Frontend lint and production build | Pass | eslint and next build passed after functional changes. |
| API/RAG automated suite | Pass | 14 Node tests passed. |
| Corpus integrity | Pass | Five PDF hashes/extractions and 203 exact page chunks validated; human factual review pending. |
| Hosted Vercel/Render changes | Not tested | Local changes not committed, pushed or deployed during this review. |
| Full production security assessment | Not tested | CSP, deployed TLS/cookies, edge limits, authentication abuse, secret scanning, auth expiry and cross-browser checks remain. |

## Fixed during this review

Removed fabricated HUID answers, personal scan history and scanner outage verification. Default lab retrieval no longer claims an official live connection. Legacy Next API endpoints proxy genuine backend behavior or fail explicitly. Added bounded frontend requests, duplicate-chat guards, safe JSON/body error responses, API request budget, security headers, labelled inputs and native dialogs. Water search now references captured manuals; source capture does not determine current regulatory applicability.

## Next sequence

1. Re-run exact mobile/desktop and cross-browser checks using effective viewport controls; test actual camera permission decline.
2. Configure a server-only model key and run a larger reviewed English/Hindi/Telugu RAG evaluation including prompt injection and irrelevant-but-valid citations.
3. Build and test a disposable database using schema.sql and supabase/tests/private_record_ownership.sql. Review policy/grant inventory before applying any shared migration. Existing anonymous/demo IDs intentionally remain inaccessible.
4. Verify expired sessions and account isolation with two test accounts. Implement server JWT ownership before enabling private history or any officer/private API.
5. Review CSP, deployed headers/TLS, persistent abuse limits and hosting logs. Then deploy and repeat critical end-to-end tests against hosted URLs.

RLS design reference: https://supabase.com/docs/guides/database/postgres/row-level-security
Header review reference: https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html
