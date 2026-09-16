'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase, resolveUserRole, saveUserProfile } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/authContext';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setRole } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function completeSignIn() {
      try {
        const oauthError = searchParams.get('error_description') || searchParams.get('error');
        if (oauthError) throw new Error(oauthError);
        if (!supabase) throw new Error('Sign-in is not configured yet.');
        // The client handles implicit-flow tokens before getUser verifies identity.
        const { data, error: authError } = await supabase.auth.getUser();
        if (authError || !data.user) throw new Error(authError?.message || 'No authenticated session was found.');
        const user = data.user;
        const pending = localStorage.getItem('bisynapse_pending_role');
        const role = resolveUserRole(user, pending);
        if (pending) {
          await saveUserProfile({
            auth_user_id: user.id, role, email: user.email || '',
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          });
        }
        if (cancelled) return;
        localStorage.removeItem('bisynapse_pending_role');
        setRole(role);
        router.replace('/' + role);
      } catch (failure) {
        if (!cancelled) setError(failure instanceof Error ? failure.message : 'Sign-in could not be completed. Please try again.');
      }
    }
    void completeSignIn();
    return () => { cancelled = true; };
  }, [router, searchParams, setRole]);

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-900">
      <div className="max-w-md bg-white border rounded-xl p-8 text-center space-y-4">
        <h1 className="text-xl font-bold">Completing sign-in</h1>
        {error ? <><p role="alert" className="text-sm text-rose-800">{error}</p><a href="/login" className="text-blue-800 underline">Return to sign-in</a></>
          : <p>Verifying your Google account...</p>}
      </div>
    </main>
  );
}

export default function AuthCallbackPage() {
  return <Suspense fallback={<p>Completing sign-in...</p>}><AuthCallbackContent /></Suspense>;
}
