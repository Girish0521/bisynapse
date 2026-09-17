'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { UserCheck, Scan, Search, Award, Gem, MessageSquare, Flag, History, ArrowRight } from 'lucide-react';
import type { ScanHistoryRecord } from '@/lib/types';
import { fetchHistory } from '@/lib/apiClient';
import { AuthGuard } from '@/components/AuthGuard';
import { useAuth } from '@/lib/authContext';

function ConsumerDashboardContent() {
  const { user, logout } = useAuth();
  const services = [
    { title: 'Scan & Verify Product', desc: 'Scan ISI mark or QR code on product label', icon: Scan, href: '/scan' },
    { title: 'Search BIS Standard', desc: 'Find IS standards matching products', icon: Search, href: '/standards' },
    { title: 'Check Certification', desc: 'Verify CM/L or CRS licence numbers', icon: Award, href: '/certification' },
    { title: 'Hallmark Verification', desc: 'Verify 6-digit HUID code on gold jewellery', icon: Gem, href: '/hallmarking' },
    { title: 'Ask BISynapse', desc: 'Conversational AI assistant for BIS queries', icon: MessageSquare, href: '/assistant' },
    { title: 'Report a Product', desc: 'Report fake ISI marks or sub-standard goods', icon: Flag, href: '/support' }
  ];

  const [scanHistory, setScanHistory] = useState<{ name: string; standard: string; licence: string; status: string; time: string }[]>([
    { name: 'Stainless Steel Electric Kettle', standard: 'IS 302-2-3', licence: 'CM/L-8400012395', status: '✓ VERIFIED', time: 'Today 2:15 PM' },
    { name: '22K Gold Bangle (HUID: K92A8M)', standard: 'IS 1417:2016', licence: 'HM/C-7281923', status: '✓ VERIFIED', time: 'Yesterday' }
  ]);

  useEffect(() => {
    async function loadHistory() {
      try {
        const userId = user?.id || 'consumer_demo_user';
        const res = await fetchHistory(userId);
        if (res && res.recentScans && res.recentScans.length > 0) {
          const formatted = res.recentScans.slice(0, 6).map((s: ScanHistoryRecord) => ({
            name: s.product_name || 'Scanned Article',
            standard: s.extracted_information?.standard || 'IS Verified',
            licence: s.scanned_value || s.matched_record_id || 'CM/L-VERIFIED',
            status: s.verification_status === 'VERIFIED' ? '✓ VERIFIED' : (s.verification_status === 'MATCH FOUND' ? '✓ MATCH FOUND' : '⚠ ' + s.verification_status),
            time: s.created_at ? new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'
          }));
          setScanHistory(formatted);
        }
      } catch (err) {
        console.warn('Consumer history load fallback:', err);
      }
    }
    loadHistory();
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 text-left">
      <Navbar currentLang="en" onLanguageChange={() => {}} activeRole="consumer" onLogout={logout} />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
        
        {/* Welcome Header */}
        <div className="bg-[#0A2540] text-white p-6 sm:p-8 rounded-xl shadow-xs border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded bg-[#0F4C81] text-amber-400 text-xs font-bold">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Consumer Digital Hub</span>
            </div>
            <h1 className="text-2xl font-black text-white">
              Welcome, {user?.name || 'Consumer'}
            </h1>
            <p className="text-xs text-slate-300">
              Verify products, check hallmarking authenticity, and protect your consumer quality rights.
            </p>
          </div>

          <Link
            href="/scan"
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-md shadow-2xs flex items-center space-x-1.5 transition-colors shrink-0"
          >
            <Scan className="w-4 h-4" />
            <span>Open Scanner</span>
          </Link>
        </div>

        {/* Main Services Grid */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#0A2540]">Consumer Services & Verification</h2>

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
                    <span>Access Service</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Searches / Scans History */}
        <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 text-[#0A2540] border-b border-slate-200 pb-3">
            <History className="w-4 h-4 text-[#0F4C81]" />
            <h3 className="font-bold text-sm">Recent Product Verification History</h3>
          </div>

          <div className="space-y-2">
            {scanHistory.map((scan, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded border border-slate-200 text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <span className="font-bold text-slate-900 block">{scan.name}</span>
                  <span className="text-[11px] text-slate-500">Standard: {scan.standard} • Licence: {scan.licence}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300">
                    {scan.status}
                  </span>
                  <span className="text-[10px] text-slate-400">{scan.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      <Footer currentLang="en" onNavigate={() => {}} />
    </div>
  );
}

export default function ConsumerDashboard() {
  return (
    <AuthGuard allowedRole="consumer">
      <ConsumerDashboardContent />
    </AuthGuard>
  );
}
