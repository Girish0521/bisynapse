'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Shield, UserCheck, Store, Building2, CheckCircle2, AlertCircle } from 'lucide-react';
import { UserRole } from '@/lib/types';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { signInWithGoogle } from '@/lib/supabaseClient';
import { EmailOtpLogin } from '@/components/EmailOtpLogin';

function LoginContent() {
  const searchParams = useSearchParams();
  const [selectedRole, setSelectedRole] = useState<UserRole>(() => {
    const role = searchParams.get('role');
    return role === 'retailer' || role === 'industry' || role === 'officer' ? role : 'consumer';
  });
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const roles = [
    { id: 'consumer' as UserRole, title: 'Consumer', description: 'Product information and quality guidance', icon: UserCheck },
    { id: 'retailer' as UserRole, title: 'Retailer', description: 'Supplier and compliance guidance', icon: Store },
    { id: 'industry' as UserRole, title: 'Industry / MSME', description: 'Standards and certification guidance', icon: Building2 },
    { id: 'officer' as UserRole, title: 'Government Officer', description: 'Requires administrator approval', icon: Shield },
  ];

  const handleGoogleSignIn = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const result = await signInWithGoogle(selectedRole);
      if (result.error) throw result.error;
      if (!result.data.url) throw new Error('Google sign-in did not return a login URL.');
    } catch (error) {
      setAuthError(error instanceof Error ? error.message :
        typeof error === 'object' && error && 'message' in error ? String(error.message) :
        'Unable to sign in with Google. Please try again.');
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="max-w-2xl w-full space-y-8">
      <div className="text-center space-y-2">
        <Shield className="w-10 h-10 text-[#0F4C81] mx-auto" />
        <h1 className="text-3xl font-black text-[#0A2540]">Sign in to BISynapse</h1>
        <p className="text-sm text-slate-600">Choose how you use the prototype, then sign in.</p>
      </div>
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {roles.map(({ id, title, description, icon: Icon }) => (
            <button key={id} type="button" disabled={isAuthenticating}
              onClick={() => { setSelectedRole(id); setAuthError(null); }}
              className={`p-4 rounded-lg border text-left flex gap-3 ${selectedRole === id
                ? 'bg-[#0F4C81] text-white border-[#0A2540]' : 'bg-slate-50 text-slate-800 border-slate-200'}`}>
              <Icon className="w-5 h-5 shrink-0" />
              <span className="flex-1">
                <span className="font-bold text-sm">{title}</span>
                <span className="block text-xs mt-1">{description}</span>
              </span>
              {selectedRole === id && <CheckCircle2 className="w-4 h-4 shrink-0" />}
            </button>
          ))}
        </div>
        {selectedRole === 'officer' && (
          <p className="text-xs text-amber-800 bg-amber-50 p-3 rounded">
            Sign-in verifies your account. Officer access requires separate administrator approval.
          </p>
        )}
        {authError && (
          <div role="alert" className="text-sm text-rose-800 bg-rose-50 p-3 rounded flex gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /><span>{authError}</span>
          </div>
        )}
        <button type="button" onClick={handleGoogleSignIn} disabled={isAuthenticating}
          className="w-full py-3 bg-[#0F4C81] text-white font-bold text-sm rounded-lg disabled:opacity-50">
          {isAuthenticating ? 'Please wait...' : 'Continue with Google'}
        </button>
        {process.env.NEXT_PUBLIC_ENABLE_EMAIL_OTP === 'true' && (
          <EmailOtpLogin selectedRole={selectedRole} disabled={isAuthenticating} onBusyChange={setIsAuthenticating} />
        )}
      </div>
      <p className="text-center text-xs text-slate-500">Independent SIH prototype. This is not an official BIS account.</p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
      <Navbar currentLang="en" onLanguageChange={() => {}} />
      <main className="flex-1 py-12 px-4 flex items-center justify-center">
        <Suspense fallback={<p>Loading sign-in...</p>}><LoginContent /></Suspense>
      </main>
      <Footer currentLang="en" onNavigate={() => {}} />
    </div>
  );
}
