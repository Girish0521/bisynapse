'use client';

import React, { useEffect } from 'react';
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
  const { user, role, isLoading } = useAuth();
  const router = useRouter();
  const roleAllowed = !allowedRole || (role && (Array.isArray(allowedRole)
    ? allowedRole.includes(role) : allowedRole === role));
  const officerRequired = requireOfficerAuth || role === 'officer';
  const accessDenied = Boolean(user && (!roleAllowed || (officerRequired && !user.isOfficerAuthorized)));

  useEffect(() => {
    if (isLoading) return;

    if (!user) router.replace('/login');
  }, [user, isLoading, router]);

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
              Access Restricted — Government Officer Portal
            </h1>
            <p className="text-xs text-slate-600 leading-relaxed">
              You do not have the required authorization to access the Government Officer Regulatory Portal. Access is restricted to verified BIS regulatory officers with official credentials.
            </p>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              If you require officer access, request administrative approval for your authenticated account.
            </span>
          </div>

          <div className="pt-2 flex items-center space-x-3">
            <Link
              href="/consumer"
              className="flex-1 py-2.5 bg-[#0F4C81] hover:bg-[#0A2540] text-white font-bold text-xs rounded text-center transition-colors flex items-center justify-center space-x-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Consumer Portal</span>
            </Link>

            <Link
              href="/login"
              className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded transition-colors"
            >
              Change Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
};
