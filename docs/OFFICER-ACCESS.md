# Officer prototype access

The officer workspace is an independent prototype, not an official BIS account or enforcement system.

## Sign in

1. Open `/login?role=officer` and continue with Google using the account approved by the project administrator.
2. An unapproved account cannot enter `/officer`. Choosing the officer category does not grant approval.
3. After administrator approval, sign out and sign in again, selecting Government Officer.

## Administrator approval

Identify the account by its authenticated Supabase user ID in the configured project's Auth user list. Verify the intended recipient before changing access.

The application requires `app_metadata.role` to equal `officer`. Apply that field through Supabase's trusted administrative user-update capability, preserving any unrelated metadata. This is privileged provisioning and must stay outside the browser application. The public `user_metadata.role` field and local storage preferences cannot authorize officer access.

Never place a Supabase secret/service-role key in frontend code, a `NEXT_PUBLIC_` variable, or a chat message. No account was approved as part of this UI refinement.

To revoke access, remove the officer role using the same administrative capability and revoke the account's sessions as appropriate. Test revocation before exposing any officer-only data.

## Limits and verification

The current guard verifies identity through Supabase Auth and checks the administrator-managed metadata. It protects the prototype UI; it does not replace JWT authorization in backend endpoints or database RLS. Private history is disabled and no private officer API has been introduced.

Verify signed-out redirection, rejection for consumer accounts, approved-account access, account switching, and revocation using separate test accounts. Approved-account and revocation tests require explicitly provisioned accounts and remain pending until those accounts are available.
