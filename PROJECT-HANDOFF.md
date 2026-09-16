# BISynapse prototype handoff — 16 September 2026

## Scope and decisions

SIH26107: source-backed multilingual assistant for Indian Standards and BIS services. Keep original six-content-slide PPT; distinguish proposals from implemented results. Prototype, not an official BIS application. Do not claim evaluations, real RAG, vision verification or official integrations without evidence.

Local repository: C:/Projects/bisynapse. Exact branch: Work (uppercase). Friend repository: vadagamaguruprasad/bisynapse. User fork: Girish0521/bisynapse. Origin still points to friend; do NOT change remotes or push to friend production without permission. Baseline fork commit: 7cbf291e30b4dd3629f6a830a8491dab50ee3638. User subsequently authorized committing/pushing the prototype security changes and this note to fork Work. Verify current HEAD and remote ref; deployment remains a separate operation.

## Layout and verification

- frontend/: Next.js 16.3.5, React 19, TypeScript, Tailwind 4. npm package-lock. Vercel root frontend, preset Next.js, build npm run build; Next default output. Root package.json delegates frontend commands.
- backend/: Express/Node, npm package-lock. Render root backend, build npm ci, start node server.js, health /api/health, PORT=10000 on Render.
- .env.example in each app contains empty placeholders; real .env files ignored.
- Previous frontend typecheck and production build passed. Legacy lint has 34 errors/60 warnings; not clean. Current backend changes passed node --check only; HTTP regression tests still needed.
- User's three untracked presentation/jury markdown files must be preserved.

## Deployment state — NOT deployed by this task

Vercel new-project form: fork Girish0521/bisynapse, Work, frontend, Next.js. Deploy not clicked; environment values empty. Work import needed because fork master still has old root layout. Verify resulting production branch after creation; personal test production label is unrelated to friend's main site.

Render new-web-service form prepared in Bisynapse workspace: bisynapse-work-backend, fork Work, backend, npm ci, node server.js, free $0 plan, PORT=10000, /api/health, auto-deploy On Commit. Deploy not clicked. Public API exposure confirmation pending. Existing service srv-dal32jijnfac73ca621g remains unchanged, tracks friend Work with blank root and Next build/start; public https://bisynapse-qzuy.onrender.com is frontend, NOT verified Express backend.

Supabase access confirmed in signed-in Girish0521 account: friend org csbyphetdeqilbjorcxd, healthy project sxgftkhvjwmhacmktokg, https://sxgftkhvjwmhacmktokg.supabase.co. No GitHub integration; not required for client connection. No database/schema/auth changes made. No keys copied into deployments. Dashboard access does not prove application connectivity or correct RLS.

## Safe local changes this turn

- Backend defaults to seed-only mode; ENABLE_SUPABASE=true required to opt in. Service-role key rejected when enabling; uses server SUPABASE_ANON_KEY only. Do not enable shared DB yet.
- /api/history returns 503 before legacy handler until verified JWT identity/ownership implemented.
- CORS restricted to explicit configured frontend origin and local ports; broad Vercel/Render/localhost substring allowance removed. CORS is not authentication.
- JSON body limited to 256kb; x-powered-by disabled; health no longer claims seed data is verified or initialized Supabase means connected.

## Remaining security and correctness work

1. Run full secret scan of all tracked files AND complete Git history with redacted outputs; initial targeted filename-only scan found no obvious embedded credential formats, but this is NOT proof of no exposure. If any secret was exposed, rotate/revoke it even if removed. Never print secrets.
2. Implement Supabase JWT verification, derive user identity server-side, enforce ownership for history/scans, remove client-assigned privileged roles. Inspect live RLS read-only with owner approval for any changes. Repository SQL previously has permissive history/scans policies; actual deployed policies not yet verified.
3. Disable/replace mock scan/vision and official lab assertions; fixed confidence, mock verified status, template chat and seeded standards are not official validation.
4. Add validation, rate limits, generic errors (route catches currently return exception messages), HTTP regression tests. Prevent unbounded anonymous memory history growth.
5. Inspect users profile table policies and role write restrictions before enabling frontend Supabase auth. Public anon/publishable key is expected public, secret/service-role key must never be NEXT_PUBLIC or reach frontend.
6. Then configure Vercel NEXT_PUBLIC_BACKEND_URL to actual Render HTTPS base (no /api), NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, and Render FRONTEND_URL exact frontend origin. Auth redirects /auth/callback require reviewed Supabase settings. Do not run backend/seed.js on shared DB.
7. Implement licensed/authorized BIS ingestion, retrieval, clause citations, abstention, multilingual support, lab source freshness, then evaluate accuracy/citation quality with labeled tests.
8. Test Work end-to-end, commit only task files, push fork Work, PR to friend's main branch after review. Hosting settings/secrets do not merge with Git.

## Next-chat prompt

Read C:/Projects/bisynapse/PROJECT-HANDOFF.md and DEPLOYMENT.md first. Inspect git status and current browser dashboards before acting. Continue safe prototype hardening on Work step by step, then test and prepare deployments. Do not assume deployment happened. Do not change shared Supabase data/schema, friend's Render, Git remotes or expose secrets without explicit approval. Report remaining issues honestly.
