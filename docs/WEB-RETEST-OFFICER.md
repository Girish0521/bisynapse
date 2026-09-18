# Officer flow refinement and browser retest

## Changes

- Signed-out portal redirects preserve the requested category, including `/login?role=officer`.
- Login categories expose their selected state to assistive technology.
- Restricted-access messaging distinguishes prototype approval from official BIS credentials and handles non-officer category mismatches.
- Change Account signs out before returning to login and reports sign-out failures.
- Officer dashboard replaces invented national counts and authorization levels with integration availability. Guidance cards describe actual capabilities; absent surveillance/case-file modules no longer link to unrelated pages.

## Verified

- ESLint and the Next.js production build, including TypeScript, passed.
- In-app browser: local `/officer` redirected to `/login?role=officer`, selected Government Officer, and displayed the approval instructions.
- Changing the local login category updated `aria-pressed` and hid officer-specific instructions. No horizontal overflow or browser console errors observed at the available browser width.
- Hosted assistant returned real FSSAI PDF page passages with a provider-unavailable notice.
- Hosted IS 14543 search returned captured manual metadata; the details dialog closed with Escape and restored focus to its trigger.
- Hosted laboratories displayed an unavailable notice by default; explicitly enabled demo records were labelled unverified.
- Hosted signed-out `/officer` redirected to login before these refinements were deployed.

## Pending

Approved officer access, consumer-account rejection after these changes, Change Account under a real session, sign-out failure handling, and officer revocation require authenticated test accounts. No account was provisioned or elevated, and no sessions were fabricated. These checks are not reported as passed.

Browser viewport was not overridden; exact phone/desktop dimensions and physical-device tests remain pending. Gemini generation and Supabase migration/isolation tests also remain pending.
