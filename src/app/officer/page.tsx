'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Shield, Scan, Search, FileText, BarChart3, Database, ArrowRight } from 'lucide-react';
import { AuthGuard } from '@/components/AuthGuard';
import { useAuth } from '@/lib/authContext';

function OfficerDashboardContent() {
  const { user, logout } = useAuth();
  const services = [
    { title: 'Product Verification', desc: 'Perform high-speed CM/L & HUID verification', icon: Scan, href: '/scan' },
    { title: 'Certification Verification', desc: 'Inspect factory licence status and scope validity', icon: Shield, href: '/#certification' },
    { title: 'Standards Search', desc: 'Information-dense e-Standards & gazette directory', icon: Search, href: '/#standards' },
    { title: 'Compliance Information', desc: 'Audit Quality Control Orders & gazette notifications', icon: FileText, href: '/#certification' },
    { title: 'Reports & Analytics', desc: 'Review market surveillance & inspection statistics', icon: BarChart3, href: '/#metrics' },
    { title: 'Search / Analytics', desc: 'Query enforcement & complaint case files', icon: Database, href: '/#search' }
  ];

  const auditSummary = [
    { title: 'Active CM/L Licences', count: '48,290', status: 'National Scope' },
    { title: 'CRS Registrations', count: '22,410', status: 'MeitY / Electronic' },
    { title: 'Hallmark AHC Centres', count: '1,420', status: 'IS 1417 Active' },
    { title: 'Surveillance Audits', count: '3,840', status: 'Q3 2026 Completed' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 text-left">
      <Navbar currentLang="en" onLanguageChange={() => {}} activeRole="officer" onLogout={logout} />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
        
        {/* Officer Welcome Banner */}
        <div className="bg-[#0A2540] text-white p-6 sm:p-8 rounded-xl shadow-xs border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded bg-[#0F4C81] text-amber-400 text-xs font-bold">
              <Shield className="w-3.5 h-3.5" />
              <span>Government Officer Regulatory Oversight</span>
            </div>
            <h1 className="text-2xl font-black text-white">
              Welcome, {user?.name || 'Officer'}
            </h1>
            <p className="text-xs text-slate-300">
              Access high-density regulatory verification tools, market surveillance reports, and QCO analytics.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <span className="px-3 py-1 bg-slate-800 text-amber-400 font-mono text-xs font-bold rounded border border-slate-700">
              OFFICER LEVEL-A (AUTHORIZED)
            </span>
          </div>
        </div>

        {/* High-Density Audit Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {auditSummary.map((item, idx) => (
            <div key={idx} className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">{item.title}</span>
              <span className="text-2xl font-black text-[#0A2540] block">{item.count}</span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded inline-block">
                {item.status}
              </span>
            </div>
          ))}
        </div>

        {/* Officer Services Grid */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#0A2540]">Regulatory Oversight Modules</h2>

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
                    <span>Execute Tool</span>
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

export default function OfficerDashboard() {
  return (
    <AuthGuard allowedRole="officer" requireOfficerAuth={true}>
      <OfficerDashboardContent />
    </AuthGuard>
  );
}
