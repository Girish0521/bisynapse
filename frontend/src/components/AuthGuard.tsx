'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/lib/types';
import { useAuth } from '@/lib/authContext';
import { Shield, Lock, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRole?: UserRole | UserRole[];
  requireOfficerAuth?: boolean;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  allowedRole,
  requireOfficerAuth = false,
}) => {
  const { user, role, isLoading, logout } = useAuth();
  const [isChangingAccount, setIsChangingAccount] = useState(false);
  const [changeError, setChangeError] = useState<string | null>(null);
  const router = useRouter();
  const roleAllowed = !allowedRole || (role && (Array.isArray(allowedRole)
    ? allowedRole.includes(role) : allowedRole === role));
  const officerRequired = requireOfficerAuth || role === 'officer';
  const accessDenied = Boolean(user && (!roleAllowed || (officerRequired && !user.isOfficerAuthorized)));
  const loginUrl = typeof allowedRole === 'string' ? `/login?role=${allowedRole}` : '/login';

  async function changeAccount() {
    setIsChangingAccount(true);
    setChangeError(null);
    try {
      await logout();
      router.replace(loginUrl);
    } catch {
      setChangeError('Unable to sign out. Please try again before signing in with another account.');
      setIsChangingAccount(false);
    }
  }

  useEffect(() => {
    if (isLoading) return;

    if (!user) router.replace(loginUrl);
  }, [user, isLoading, router, loginUrl]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center font-sans">
        <div className="w-12 h-12 rounded-xl bg-[#0F4C81] text-amber-400 flex items-center justify-center animate-pulse mb-4 shadow-sm border border-blue-900">
          <Shield className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-[#0A2540]">Verifying BISynapse Session...</h2>
        <p className="text-xs text-slate-500 mt-1">Checking secure authentication credentials and authorization level</p>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center font-sans">
        <div className="max-w-md w-full bg-white rounded-xl p-8 border border-slate-200 shadow-sm space-y-6 text-left">
          <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center border border-rose-200">
            <Lock className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-extrabold text-[#0A2540]">
              {officerRequired ? 'Access Restricted — Officer Prototype Portal' : 'Access Restricted — Account Category'}
            </h1>
            <p className="text-xs text-slate-600 leading-relaxed">
              {officerRequired
                ? 'This account has not been approved for the officer prototype portal. Approval by the project administrator does not establish official BIS credentials.'
                : 'Your current account category does not match this portal. Choose the appropriate category when signing in.'}
            </p>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              {officerRequired
                ? 'Ask the project administrator to approve the account you used to sign in. After approval, sign out and sign in again.'
                : 'You can return to the public services or sign in using another account category.'}
            </span>
          </div>

          <div className="pt-2 flex items-center space-x-3">
            <Link
              href="/services"
              className="flex-1 py-2.5 bg-[#0F4C81] hover:bg-[#0A2540] text-white font-bold text-xs rounded text-center transition-colors flex items-center justify-center space-x-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Public services</span>
            </Link>

            <button
              type="button" onClick={() => { void changeAccount(); }} disabled={isChangingAccount}
              className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded transition-colors disabled:opacity-50"
            >
              {isChangingAccount ? 'Signing out...' : 'Change Account'}
            </button>
          </div>
          {changeError && <p role="alert" className="text-xs text-rose-700">{changeError}</p>}
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
};
