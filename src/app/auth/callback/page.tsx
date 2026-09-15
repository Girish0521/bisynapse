'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase, getUserProfile, saveUserProfile, isAuthorizedOfficerEmail } from '@/lib/supabaseClient';
import { UserRole } from '@/lib/types';
import { Shield, CheckCircle2, AlertCircle } from 'lucide-react';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [statusMessage, setStatusMessage] = useState('Authenticating with BISynapse...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function handleAuthCallback() {
      if (!supabase) {
        // Fallback for offline demo setup
        const pendingRole = (localStorage.getItem('bisynapse_pending_role') as UserRole) || 'consumer';
        localStorage.setItem('bisynapse_user_role', pendingRole);
        localStorage.setItem('bisynapse_user_email', 'google.user@bisynapse.gov.in');
        localStorage.removeItem('bisynapse_pending_role');

        if (pendingRole === 'consumer') router.push('/consumer');
        else if (pendingRole === 'retailer') router.push('/retailer');
        else if (pendingRole === 'industry') router.push('/industry');
        else if (pendingRole === 'officer') router.push('/officer');
        else router.push('/select-role');
        return;
      }

      try {
        setStatusMessage('Processing Google OAuth credentials...');
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session) {
          console.warn('OAuth session error or missing session:', error?.message);
          setErrorMessage('Unable to complete Google sign in. Please try logging in again.');
          setTimeout(() => router.push('/login'), 2500);
          return;
        }

        const user = session.user;
        const email = user.email || '';
        const name = user.user_metadata?.full_name || user.user_metadata?.name || email.split('@')[0] || 'User';

        setStatusMessage('Checking user profile & role authorization...');
        
        // 1. Check existing profile in Supabase DB
        let profile = await getUserProfile(user.id);
        const pendingRole = localStorage.getItem('bisynapse_pending_role') as UserRole | null;
        let role: UserRole | null = (profile?.role as UserRole) || pendingRole || null;

        // 2. Validate officer role authorization if requested
        if (role === 'officer') {
          const isOfficerAuth = isAuthorizedOfficerEmail(email);
          if (!isOfficerAuth) {
            console.warn('User requested Officer role but lacks authorized government domain:', email);
            role = 'consumer'; // Default to safe consumer role
          }
        }

        // 3. Save / Upsert user profile
        if (role) {
          await saveUserProfile({
            auth_user_id: user.id,
            name,
            email,
            role,
          });

          localStorage.setItem('bisynapse_user_role', role);
          localStorage.setItem('bisynapse_user_email', email);
          localStorage.setItem('bisynapse_user_name', name);
          localStorage.setItem('bisynapse_user_id', user.id);
          localStorage.removeItem('bisynapse_pending_role');

          setStatusMessage(`Authentication successful! Redirecting to ${role.toUpperCase()} Portal...`);

          setTimeout(() => {
            if (role === 'consumer') router.push('/consumer');
            else if (role === 'retailer') router.push('/retailer');
            else if (role === 'industry') router.push('/industry');
            else if (role === 'officer') router.push('/officer');
            else router.push('/select-role');
          }, 600);
        } else {
          // If no role set, redirect to /select-role
          localStorage.setItem('bisynapse_user_email', email);
          localStorage.setItem('bisynapse_user_name', name);
          localStorage.setItem('bisynapse_user_id', user.id);

          setStatusMessage('Account verified! Please select your portal user role...');
          setTimeout(() => router.push('/select-role'), 600);
        }
      } catch (err: any) {
        console.error('Exception during auth callback:', err);
        setErrorMessage('Authentication error occurred. Redirecting to login...');
        setTimeout(() => router.push('/login'), 2000);
      }
    }

    handleAuthCallback();
  }, [router, searchParams]);

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
