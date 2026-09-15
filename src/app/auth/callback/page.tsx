'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase, getUserProfile, saveUserProfile, isAuthorizedOfficerEmail } from '@/lib/supabaseClient';
import { UserRole } from '@/lib/types';
import { Shield, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/authContext';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setRole } = useAuth();

  const [statusMessage, setStatusMessage] = useState('Authenticating with Google OAuth...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function handleAuthCallback() {
      // Check for OAuth error parameters in URL
      const errorParam = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (errorParam || errorDescription) {
        const readableError =
          errorDescription ||
          (errorParam === 'access_denied'
            ? 'Authentication was cancelled or access was denied by Google.'
            : 'Google OAuth authentication failed.');
        setErrorMessage(readableError);
        setTimeout(() => router.push('/login'), 3000);
        return;
      }

      if (!supabase) {
        setErrorMessage(
          'Supabase credentials (NEXT_PUBLIC_SUPABASE_URL) are not configured in your environment variables. Please set them in .env.local or Vercel.'
        );
        setTimeout(() => router.push('/login'), 4000);
        return;
      }

      try {
        setStatusMessage('Retrieving Google OAuth session...');
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session) {
          console.warn('OAuth session lookup error:', error?.message);
          setErrorMessage(
            error?.message ||
              'Unable to retrieve Supabase authentication session. Please verify Google OAuth provider configuration in Supabase Dashboard.'
          );
          setTimeout(() => router.push('/login'), 3500);
          return;
        }

        const user = session.user;
        const email = user.email || '';
        const name =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.user_metadata?.preferred_username ||
          email.split('@')[0] ||
          'Google User';
        const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || '';

        setStatusMessage('Verifying user profile and role permissions...');

        // 1. Check existing profile in Supabase DB
        let profile = await getUserProfile(user.id);
        const pendingRole = (typeof window !== 'undefined' ? localStorage.getItem('bisynapse_pending_role') : null) as UserRole | null;
        let role: UserRole | null = (profile?.role as UserRole) || pendingRole || null;

        // 2. Validate Government Officer role authorization
        if (role === 'officer') {
          const isOfficerAuth = isAuthorizedOfficerEmail(email) || profile?.role === 'officer';
          if (!isOfficerAuth) {
            console.warn('User requested Officer role but lacks government email authorization:', email);
            role = 'consumer'; // Default to consumer role safely
          }
        }

        // Store non-sensitive metadata in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('bisynapse_user_email', email);
          localStorage.setItem('bisynapse_user_name', name);
          localStorage.setItem('bisynapse_user_avatar', avatarUrl);
          localStorage.setItem('bisynapse_user_id', user.id);
          localStorage.removeItem('bisynapse_pending_role');
        }

        // 3. Save / Upsert user profile in Supabase users table
        if (role) {
          await saveUserProfile({
            auth_user_id: user.id,
            name,
            email,
            role,
            avatar_url: avatarUrl,
          });

          setRole(role);
          if (typeof window !== 'undefined') {
            localStorage.setItem('bisynapse_user_role', role);
          }

          setStatusMessage(`Google Authentication successful! Redirecting to ${role.toUpperCase()} Portal...`);

          setTimeout(() => {
            if (role === 'consumer') router.push('/consumer');
            else if (role === 'retailer') router.push('/retailer');
            else if (role === 'industry') router.push('/industry');
            else if (role === 'officer') router.push('/officer');
            else router.push('/select-role');
          }, 600);
        } else {
          // If user has no role assigned yet -> Redirect to /select-role
          setStatusMessage('Google Account authenticated! Redirecting to Role Selection...');
          setTimeout(() => router.push('/select-role'), 600);
        }
      } catch (err: any) {
        console.error('Exception during auth callback:', err);
        setErrorMessage('Authentication error occurred during OAuth processing.');
        setTimeout(() => router.push('/login'), 2500);
      }
    }

    handleAuthCallback();
  }, [router, searchParams, setRole]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center font-sans text-slate-900">
      <div className="max-w-md w-full bg-white rounded-xl p-8 border border-slate-200 shadow-sm space-y-6 text-left">
        <div className="w-12 h-12 rounded-xl bg-[#0F4C81] text-amber-400 flex items-center justify-center mx-auto shadow-sm border border-blue-900">
          <Shield className="w-6 h-6" />
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-xl font-extrabold text-[#0A2540]">
            BISynapse OAuth Callback
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            {statusMessage}
          </p>
        </div>

        {errorMessage ? (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        ) : (
          <div className="flex justify-center py-2">
            <div className="w-6 h-6 border-2 border-[#0F4C81] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-600">
        Loading OAuth Callback...
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
