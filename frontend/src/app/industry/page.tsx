'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Building2, Search, Award, ShieldCheck, FlaskConical, MessageSquare, ArrowRight, Layers, DollarSign } from 'lucide-react';
import { AuthGuard } from '@/components/AuthGuard';
import { useAuth } from '@/lib/authContext';

function IndustryDashboardContent() {
  const { user, logout } = useAuth();
  const services = [
    { title: 'Find Applicable Standards', desc: 'Identify Indian Standards for product engineering', icon: Search, href: '/standards' },
    { title: 'Certification Guidance', desc: 'Step-by-step ManakOnline e-BIS application workflow', icon: Award, href: '/certification' },
    { title: 'Compliance Check', desc: 'Verify mandatory QCO notifications & test parameters', icon: ShieldCheck, href: '/certification' },
    { title: 'Search Standards', desc: 'Deep search e-Standards database by IS number', icon: Layers, href: '/standards' },
    { title: 'Laboratory Information', desc: 'Locate BIS recognized & LIMS test facilities', icon: FlaskConical, href: '/labs' },
    { title: 'Ask BISynapse', desc: 'AI compliance guide for manufacturers & MSMEs', icon: MessageSquare, href: '/assistant' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 text-left">
      <Navbar currentLang="en" onLanguageChange={() => {}} activeRole="industry" onLogout={logout} />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
        
        <div className="bg-[#0A2540] text-white p-6 sm:p-8 rounded-xl shadow-xs border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded bg-[#0F4C81] text-amber-400 text-xs font-bold">
              <Building2 className="w-3.5 h-3.5" />
              <span>Industry & MSME Portal</span>
            </div>
            <h1 className="text-2xl font-black text-white">
              Welcome, {user?.name || 'Industry / MSME'}
            </h1>
            <p className="text-xs text-slate-300">
              Discover applicable standards, follow the 9-stage certification stepper, and claim MSME concessions.
            </p>
          </div>

          <Link
            href="/standards"
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-md shadow-2xs flex items-center space-x-1.5 transition-colors shrink-0"
          >
            <Search className="w-4 h-4" />
            <span>Find Standards</span>
          </Link>
        </div>

        {/* MSME Concessions Callout */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-900 text-xs flex items-start space-x-3">
          <DollarSign className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-sm block">MSME & Startup Fee Concessions</span>
            <p className="mt-0.5 leading-relaxed">
              Under BIS notifications, Micro & Small Enterprises with valid Udyam registration receive a <strong>50% concession</strong> on marking fees and application processing fees.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#0A2540]">Enterprise Compliance Services</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((s, idx) => {
              const Icon = s.icon;
              return (
                <Link
                  key={idx}
                  href={s.href}
                  className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs hover:shadow-md hover:border-[#0F4C81] transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded bg-slate-100 text-[#0F4C81] group-hover:bg-[#0F4C81] group-hover:text-amber-400 flex items-center justify-center font-bold transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#0A2540]">{s.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{s.desc}</p>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#0F4C81]">
                    <span>Open Module</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

      </main>

      <Footer currentLang="en" onNavigate={() => {}} />
    </div>
  );
}

export default function IndustryDashboard() {
  return (
    <AuthGuard allowedRole="industry">
      <IndustryDashboardContent />
    </AuthGuard>
  );
}
