'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, UserCheck, Store, Building2, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { UserRole } from '@/lib/types';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { saveUserProfile } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/authContext';

export default function SelectRolePage() {
  const router = useRouter();
  const { user, setRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('consumer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [officerWarning, setOfficerWarning] = useState<string | null>(null);

  const roles = [
    {
      id: 'consumer' as UserRole,
      title: 'Consumer',
      description: 'Verify products, certifications and BIS information.',
      icon: UserCheck,
    },
    {
      id: 'retailer' as UserRole,
      title: 'Retailer',
      description: 'Verify products and access compliance information.',
      icon: Store,
    },
    {
      id: 'industry' as UserRole,
      title: 'Industry / MSME',
      description: 'Find standards and certification requirements.',
      icon: Building2,
    },
    {
      id: 'officer' as UserRole,
      title: 'Government Officer',
      description: 'Access authorized BIS information and compliance tools.',
      icon: Shield,
    },
  ];

  const handleRoleSelect = (roleId: UserRole) => {
    setSelectedRole(roleId);
    setErrorMsg(null);

    if (roleId === 'officer') {
      if (!user?.isOfficerAuthorized) {
        setOfficerWarning(
          'Officer access requires administrator approval. Your Google email alone does not grant access.'
        );
      } else {
        setOfficerWarning(null);
      }
    } else {
      setOfficerWarning(null);
    }
  };

  const handleConfirmRole = async () => {
    if (!user) {
      router.replace('/login');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg(null);

    let finalRole = selectedRole;
    const userEmail = user.email;
    const userId = user.id;
    const userName = user.name;

    // Verify Officer Security Authorization
    if (selectedRole === 'officer') {
      const isAuthorized = user.isOfficerAuthorized;
      if (!isAuthorized) {
        setErrorMsg('Officer access requires administrator approval. Assigning Consumer category.');
        finalRole = 'consumer';
      }
    }

    try {
      await saveUserProfile({
          auth_user_id: userId,
          name: userName,
          email: userEmail,
          role: finalRole,
      });

      setRole(finalRole);

      setTimeout(() => {
        setIsSubmitting(false);
        if (finalRole === 'consumer') router.push('/consumer');
        else if (finalRole === 'retailer') router.push('/retailer');
        else if (finalRole === 'industry') router.push('/industry');
        else if (finalRole === 'officer') router.push('/officer');
      }, 500);
    } catch (err) {
      console.error('Error saving role:', err);
      setErrorMsg('Failed to save your category. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 text-left">
      <Navbar currentLang="en" onLanguageChange={() => {}} />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-xl w-full space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-[#0F4C81] text-amber-400 flex items-center justify-center mx-auto shadow-xs border border-blue-900">
              <Shield className="w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0A2540] tracking-tight">
              Welcome to BISynapse
            </h1>
            <p className="text-sm text-slate-600 font-medium">
              How will you use BISynapse?
            </p>
          </div>

          {/* Role Cards Container */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-6">
            
            <div className="grid grid-cols-1 gap-3">
              {roles.map((r) => {
                const Icon = r.icon;
                const isSelected = selectedRole === r.id;

                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleRoleSelect(r.id)}
                    className={`p-4 rounded-lg border text-left transition-all flex items-start space-x-3.5 ${
                      isSelected
                        ? 'bg-[#0F4C81] text-white border-[#0A2540] shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-white/20 text-amber-300' : 'bg-slate-200 text-[#0F4C81]'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm">{r.title}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                      </div>
                      <p className={`text-xs mt-0.5 ${isSelected ? 'text-slate-200' : 'text-slate-500'}`}>
                        {r.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {officerWarning && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>{officerWarning}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleConfirmRole}
              disabled={isSubmitting}
              className="w-full py-3 bg-[#0F4C81] hover:bg-[#0A2540] text-white font-bold text-xs rounded-lg shadow-2xs transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Configuring your portal...' : `Continue as ${selectedRole.toUpperCase()}`}</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>

          </div>

          <div className="text-center text-xs text-slate-500">
            <span>Official Bureau of Indian Standards Service Gateway</span>
          </div>

        </div>
      </main>

      <Footer currentLang="en" onNavigate={() => {}} />
    </div>
  );
}
