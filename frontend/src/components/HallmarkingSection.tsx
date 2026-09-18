'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Gem, Scan } from 'lucide-react';
import { Language } from '@/lib/types';

interface HallmarkingSectionProps {
  currentLang: Language;
  onOpenScanner?: () => void;
  onSendToChat: (query: string) => void;
}

export const HallmarkingSection: React.FC<HallmarkingSectionProps> = () => {
  const [huidInput, setHuidInput] = useState('');
  const [huidResult, setHuidResult] = useState<string | null>(null);

  const handleVerifyHuid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!huidInput.trim()) return;

    setHuidResult(/^[A-Z0-9]{6}$/.test(huidInput.trim().toUpperCase())
      ? 'No live HUID lookup is connected. Authenticity, purity and jeweller details cannot be confirmed. Verify with the official BIS Care service.'
      : 'Enter exactly six letters or digits.');
  };

  return (
    <section id="hallmarking" className="py-12 bg-white border-t border-slate-200 scroll-mt-20 font-sans text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="border-b border-slate-200 pb-4 mb-8">
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 text-xs font-bold mb-2">
            <Gem className="w-3.5 h-3.5 text-amber-600" />
            <span>Mandatory Gold Jewellery Hallmarking</span>
          </div>
          <h2 className="text-2xl font-black text-[#0A2540]">
            BIS Hallmarking & HUID Verification
          </h2>
          <p className="text-xs text-slate-600">
            Governed by IS 1417:2016. Ensure purity, authenticity and 6-digit HUID laser etching on all gold artefacts.
          </p>
        </div>

        {/* 3 Hallmark Component Cards */}
        <div className="bg-[#0A2540] rounded-xl p-6 text-white shadow-xs mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-3 gap-2">
            <div>
              <span className="text-[10px] font-bold text-amber-400 ">Mandatory 3 Marks</span>
              <h3 className="text-lg font-bold text-white">How to Identify Genuine BIS Hallmarked Gold</h3>
            </div>
            <Link
              href="/scan"
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded shadow flex items-center space-x-1.5 shrink-0"
            >
              <Scan className="w-3.5 h-3.5" />
              <span>Verify Hallmark with Scanner</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-800/80 p-4 rounded border border-slate-700 space-y-1">
              <span className="font-bold text-amber-400 block text-sm">1. BIS Triangular Logo</span>
              <p className="text-slate-300 leading-normal text-[11px]">Official emblem of Bureau of Indian Standards confirming quality compliance.</p>
            </div>
            <div className="bg-slate-800/80 p-4 rounded border border-slate-700 space-y-1">
              <span className="font-bold text-amber-400 block text-sm">2. Purity & Fineness Mark</span>
              <p className="text-slate-300 leading-normal text-[11px]">Indicates gold karatage and fineness (e.g., 22K916 for 91.6% pure gold).</p>
            </div>
            <div className="bg-slate-800/80 p-4 rounded border border-slate-700 space-y-1">
              <span className="font-bold text-amber-400 block text-sm">3. 6-Digit Alphanumeric HUID</span>
              <p className="text-slate-300 leading-normal text-[11px]">Unique laser-etched Hallmark Unique Identification code (e.g. K92A8M).</p>
            </div>
          </div>
        </div>

        {/* HUID Verification Lookup */}
        <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 shadow-2xs mb-8 text-center max-w-xl mx-auto space-y-3">
          <h3 className="font-bold text-sm text-[#0A2540]">HUID Verification Guidance</h3>
          <p className="text-xs text-slate-600">Enter 6-character alphanumeric code engraved on gold jewellery:</p>

          <form onSubmit={handleVerifyHuid} className="flex gap-2 max-w-md mx-auto">
            <input
              aria-label="HUID code"
              type="text"
              maxLength={6}
              value={huidInput}
              onChange={(e) => setHuidInput(e.target.value.toUpperCase())}
              placeholder="e.g. K92A8M"
              className="flex-1 bg-white text-slate-900 px-3 py-2 rounded border border-slate-300 font-mono text-center font-bold uppercase focus:ring-2 focus:ring-[#0F4C81]"
            />
            <button type="submit" className="px-4 py-2 bg-[#0F4C81] text-white font-bold text-xs rounded">
              Verify
            </button>
          </form>

          {huidResult && <p role="status" className="p-4 bg-amber-50 rounded border border-amber-300 text-xs text-left text-amber-900">{huidResult}</p>}
        </div>

      </div>
    </section>
  );
};
