# BISynapse development and deployment

## Explicit application structure

- `frontend/`: Next.js, React, TypeScript and Tailwind CSS.
- `backend/`: Node.js and Express.
- `supabase/`: SQL reference schema. Do not run against the shared project without approval.
- Root npm scripts are convenience wrappers. Install dependencies inside each application.

The first restructuring milestone preserves the existing interface. It does not implement or validate the PPT's complete AI architecture, OCR, portal APIs or claimed accuracy.

## Local development

Run `npm install` inside `frontend/` and `npm ci` inside `backend/`. Copy each `.env.example` to the local ignored environment file named in its comments. Start frontend with root `npm run dev` and backend in another terminal with `npm run dev:backend`.

## Your fork's Vercel project

1. Import `Girish0521/bisynapse`.
2. Choose Next.js and Root Directory `frontend` after this Work commit is available on the selected branch.
3. Install: `npm ci`. Build: `npm run build`. Output: Next.js default (`.next`).
4. To deploy this refactor, the selected Git branch must be `Work`. Fork `master` still has the old root layout until a reviewed merge occurs.
5. Configure `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_BACKEND_URL` in the intended Production/Preview scopes before building.
6. Backend URL must be an actual HTTPS Express service base URL without `/api`. Never use localhost on Vercel.
7. Redeploy after changing build-time public variables.

A personal testing project's Vercel "Production" label can still describe a development deployment. It does not make it the friend's production app. Alternatively, keep master as the Vercel production branch and deploy Work as a branch preview using settings compatible with each branch's layout. Do not set a new frontend root while importing old master and expect it to exist there.

## Render: friend-managed backend

The inspected service `bisynapse-qzuy.onrender.com` is connected to `vadagamaguruprasad/bisynapse` and now selects `Work`. Its root is empty, build is `npm install; npm run build`, and start is `npm run start`. These are frontend settings. This was checked without changing them.

An Express service should use Root Directory `backend`, build `npm ci`, start `node server.js`, and health path `/api/health`. Configure its frontend origin and appropriate Supabase access. The owner must explicitly approve/apply changes or identify a different existing Express service. Do not repurpose production silently.

Pushing your fork's Work branch does not update a Render service following your friend's repository. A reviewed PR/sync into the friend's connected branch is required. Database changes need a separate reviewed migration process.

## Shared Supabase

An invitation does not configure application credentials or authenticate website users. Confirm the correct organization/project is visible in your account after accepting the invitation. The inspected Girish0521 account currently shows only Verdure, so access to the friend's project remains unconfirmed.

Use that project's public URL and anon/publishable key under the frontend's existing variable names. Keep service-role keys, DB passwords and model API credentials out of public variables and Git. Ask the project owner to approve your site's `/auth/callback` redirect URL. Do not change the production Site URL just to add a testing deployment.

The current schema's private history/scan policies and backend authorization need repair before testing real personal data. Shared Supabase means shared data, not isolated staging. Do not run seed scripts or SQL migrations on it without permission.

## Verification checklist

- Frontend build succeeds from `frontend/`.
- Browser requests target the real backend, not localhost.
- Express `/api/health` responds and a permitted DB query actually succeeds.
- Auth redirects return to the intended frontend.
- User A cannot read or write User B history/scans.
- Unsupported standards queries return no verified match.
- Mock/example content cannot appear as official product verification.
- Inspect deployed build commit/branch separately for each service.

## Remaining overhaul milestones

1. Secure server identity, roles and private data, then correct demo/verification states.
2. Authorize and version a small BIS source set.
3. Implement ingestion, embeddings, retrieval and citation support checks.
4. Add product clarification and scheme-specific guidance.
5. Validate multilingual conversation and laboratory scope data.
6. Evaluate held-out questions and publish actual results.
7. Consider voice/WhatsApp and optional fine-tuning only after the core works.

No hosted settings, secrets, database data or production branches were changed by the restructuring milestone.
