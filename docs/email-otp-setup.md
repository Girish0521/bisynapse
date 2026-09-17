# Email-code sign-in setup

Google remains available. Email login stays hidden until
`NEXT_PUBLIC_ENABLE_EMAIL_OTP=true` is set at build time.

In the BIS Supabase project (`sbdfhgtqnlswkzomypli`):

1. Keep email sign-in enabled and email confirmation on. Set OTP length to six digits; use a short expiration (for example, 10 minutes).
2. In Authentication → Emails, update both **Magic Link** and **Confirm signup** templates to show `{{ .Token }}`. New users may receive the signup template; existing users receive the magic-link template.
3. Use this subject: `Your BISynapse sign-in code`. Suggested HTML:

   ```html
   <h2>Your BISynapse sign-in code</h2>
   <p>Enter this one-time code in the sign-in screen:</p>
   <p><strong>{{ .Token }}</strong></p>
   <p>Do not share this code. If you did not request it, ignore this email.</p>
   ```

4. Configure a custom SMTP sender for public users. Enter its password/key directly in Supabase, never in frontend environment variables or source control. Verify the sending domain with the email provider.
5. Keep Supabase rate limits enabled. The UI adds a 60-second resend cooldown, but it is not a server-side abuse control. Configure CAPTCHA before broad public rollout.
6. Enable the frontend flag locally and in Vercel Production, then rebuild/deploy `Work`.
7. Test a new email, an existing email, invalid/expired codes, resend, session persistence after refresh, logout, and denial of Officer access without admin approval. Enter test codes in the website, not in chat.

Without custom SMTP, Supabase's default sender is testing-only and restricted to organization-team emails, with a small project-wide hourly quota. Do not present it as public email login.

References: https://supabase.com/docs/guides/auth/auth-email-passwordless and https://supabase.com/docs/guides/auth/auth-smtp
