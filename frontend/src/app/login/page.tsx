'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, UserCheck, Store, Building2, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { UserRole } from '@/lib/types';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { signInWithGoogle, isAuthorizedOfficerEmail } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/authContext';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setRole } = useAuth();

  const [selectedRole, setSelectedRole] = useState<UserRole>('consumer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const roleParam = searchParams.get('role') as UserRole;
    if (roleParam && ['consumer', 'retailer', 'industry', 'officer'].includes(roleParam)) {
      setSelectedRole(roleParam);
    }
  }, [searchParams]);

  const roles = [
    {
      id: 'consumer' as UserRole,
      title: 'Consumer',
      description: 'Product verification, ISI marks, Hallmarking & complaints',
      icon: UserCheck,
    },
    {
      id: 'retailer' as UserRole,
      title: 'Retailer',
      description: 'Inventory compliance, supplier product verification & QCOs',
      icon: Store,
    },
    {
      id: 'industry' as UserRole,
      title: 'Industry / MSME',
      description: 'Standards discovery, certification workflow & lab facilities',
      icon: Building2,
    },
    {
      id: 'officer' as UserRole,
      title: 'Government Officer',
      description: 'Surveillance oversight, analytical reports & regulatory search',
      icon: Shield,
    },
  ];

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setAuthError(null);
  };

  const handleGoogleSignIn = async () => {
    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const res = await signInWithGoogle(selectedRole);

      if (res && res.error) {
        setAuthError(res.error.message || 'Unable to sign in with Google. Please try again.');
        setIsAuthenticating(false);
        return;
      }

      // If mock/offline response
      if ((res?.data as any)?.isMock) {
        let finalRole = selectedRole;
        const mockEmail = `${selectedRole}@bisynapse.gov.in`;

        if (selectedRole === 'officer' && !isAuthorizedOfficerEmail(mockEmail)) {
          finalRole = 'consumer';
        }

        if (typeof window !== 'undefined') {
          localStorage.setItem('bisynapse_user_role', finalRole);
          localStorage.setItem('bisynapse_user_email', mockEmail);
          localStorage.setItem('bisynapse_user_name', `Google User (${finalRole.toUpperCase()})`);
        }
        setRole(finalRole);

        setTimeout(() => {
          setIsAuthenticating(false);
          if (finalRole === 'consumer') router.push('/consumer');
          else if (finalRole === 'retailer') router.push('/retailer');
          else if (finalRole === 'industry') router.push('/industry');
          else if (finalRole === 'officer') router.push('/officer');
        }, 500);
      }
    } catch (e: any) {
      console.error('Google OAuth trigger error:', e);
      setAuthError('Unable to sign in with Google. Please try again.');
      setIsAuthenticating(false);
    }
  };

  const handleFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthError('Please enter both email address and password.');
      return;
    }

    setIsAuthenticating(true);
    setAuthError(null);

    let finalRole = selectedRole;
    if (selectedRole === 'officer' && !isAuthorizedOfficerEmail(email)) {
      setAuthError('Government Officer login requires an authorized government email (@bis.gov.in / @gov.in). Access assigned as Consumer.');
      finalRole = 'consumer';
    }

    setTimeout(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('bisynapse_user_role', finalRole);
        localStorage.setItem('bisynapse_user_email', email);
        localStorage.setItem('bisynapse_user_name', email.split('@')[0]);
      }
      setRole(finalRole);
      setIsAuthenticating(false);

      if (finalRole === 'consumer') router.push('/consumer');
      else if (finalRole === 'retailer') router.push('/retailer');
      else if (finalRole === 'industry') router.push('/industry');
      else if (finalRole === 'officer') router.push('/officer');
    }, 400);
  };

  return (
    <div className="max-w-2xl w-full space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-[#0F4C81] text-amber-400 flex items-center justify-center mx-auto shadow-xs border border-blue-900">
          <Shield className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#0A2540] tracking-tight">
          BISynapse
        </h1>
        <p className="text-sm text-slate-600 font-medium">
          Secure access to BIS services and information
        </p>
      </div>

      {/* Main Authentication Box */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-6">
        
        {/* Role Picker */}
        <div>
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-3">
            1. Select User Category:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {roles.map((r) => {
              const Icon = r.icon;
              const isSelected = selectedRole === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleRoleSelect(r.id)}
                  className={`p-4 rounded-lg border text-left transition-all flex items-start space-x-3 ${
                    isSelected
                      ? 'bg-[#0F4C81] text-white border-[#0A2540] shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-white/20 text-amber-300' : 'bg-slate-200 text-[#0F4C81]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{r.title}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                    </div>
                    <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-slate-200' : 'text-slate-500'}`}>
                      {r.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {authError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {/* Authentication Actions */}
        <div className="pt-4 border-t border-slate-200 space-y-4">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            2. Authenticate & Continue:
          </span>

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isAuthenticating}
            className="w-full py-3 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-lg border border-slate-300 shadow-2xs transition-colors flex items-center justify-center space-x-2.5 disabled:opacity-50"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>{isAuthenticating ? 'Connecting to Google OAuth...' : 'Continue with Google'}</span>
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-[10px] text-slate-400 uppercase font-bold">Or Email Credentials</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <form onSubmit={handleFormLogin} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Official Email / Application ID
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={`Enter ${selectedRole} email address...`}
                className="w-full px-3 py-2 bg-slate-50 text-slate-900 text-xs rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full px-3 py-2 bg-slate-50 text-slate-900 text-xs rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
              />
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-2.5 bg-[#0F4C81] hover:bg-[#0A2540] text-white font-bold text-xs rounded shadow-2xs transition-colors flex items-center justify-center space-x-1.5"
            >
              <span>{isAuthenticating ? 'Authenticating...' : `Login as ${selectedRole.toUpperCase()}`}</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
            </button>
          </form>
        </div>
      </div>

      <div className="text-center text-xs text-slate-500">
        <span>Official Bureau of Indian Standards Service Portal • Security Encrypted</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 text-left">
      <Navbar currentLang="en" onLanguageChange={() => {}} />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <Suspense fallback={<div className="p-8 text-center text-xs font-bold text-slate-500">Loading BISynapse Authentication...</div>}>
          <LoginContent />
        </Suspense>
      </main>

      <Footer currentLang="en" onNavigate={() => {}} />
    </div>
  );
}
