'use client';

import React, { useState } from 'react';
import { Cpu } from 'lucide-react';

export const RagArchitecture: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'text' | 'vision'>('text');

  return (
    <section id="architecture" className="py-12 bg-white border-t border-slate-200 scroll-mt-20 font-sans text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="border-b border-slate-200 pb-4 mb-8">
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded bg-blue-100 text-[#0F4C81] text-xs font-bold mb-2">
            <Cpu className="w-3.5 h-3.5" />
            <span>BISynapse Architecture</span>
          </div>
          <h2 className="text-2xl font-black text-[#0A2540]">
            System Architecture & Vision Pipeline
          </h2>
          <p className="text-xs text-slate-600">
            How BISynapse combines e-Standards indexing, vector search, QCO gazette mapping, and camera OCR verification.
          </p>
        </div>

        <div className="flex justify-center mb-6">
          <div className="bg-slate-100 p-1 rounded-lg flex space-x-1 border border-slate-300">
            <button
              onClick={() => setActiveTab('text')}
              className={`px-4 py-1.5 rounded text-xs font-bold transition-colors ${activeTab === 'text' ? 'bg-[#0F4C81] text-white shadow-2xs' : 'text-slate-700 hover:text-slate-900'}`}
            >
              Text Query Pipeline
            </button>
            <button
              onClick={() => setActiveTab('vision')}
              className={`px-4 py-1.5 rounded text-xs font-bold transition-colors ${activeTab === 'vision' ? 'bg-[#0F4C81] text-white shadow-2xs' : 'text-slate-700 hover:text-slate-900'}`}
            >
              Camera & OCR Verification Pipeline
            </button>
          </div>
        </div>

        {activeTab === 'text' ? (
          <div className="bg-slate-50 rounded-lg p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="bg-white p-4 rounded border border-slate-200 space-y-1">
                <span className="font-bold text-[#0F4C81] block">1. Data Sources</span>
                <p className="text-slate-600">BIS e-Standards, Quality Control Orders, ManakOnline, LIMS Directory.</p>
              </div>
              <div className="bg-white p-4 rounded border border-slate-200 space-y-1">
                <span className="font-bold text-[#0F4C81] block">2. Indexing</span>
                <p className="text-slate-600">Gazette Chunking, Metadata Extraction, Vector-BM25 Hybrid Retrieval.</p>
              </div>
              <div className="bg-white p-4 rounded border border-slate-200 space-y-1">
                <span className="font-bold text-[#0F4C81] block">3. Orchestration</span>
                <p className="text-slate-600">Intent Routing, Entity Extraction, Confidence Scoring & Guardrails.</p>
              </div>
              <div className="bg-white p-4 rounded border border-slate-200 space-y-1">
                <span className="font-bold text-[#0F4C81] block">4. Grounded Output</span>
                <p className="text-slate-600">Standard Cards, Next Steps, Clause Citations, Official Portal Links.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#0A2540] text-white rounded-lg p-6 border border-slate-800 shadow-2xs space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center text-xs">
              <div className="bg-slate-800 p-3 rounded border border-slate-700 space-y-1">
                <span className="font-bold text-amber-400 block">1. Image Input</span>
                <span className="text-[10px] text-slate-300">Camera / Photo Upload</span>
              </div>
              <div className="bg-slate-800 p-3 rounded border border-slate-700 space-y-1">
                <span className="font-bold text-emerald-400 block">2. OCR Engine</span>
                <span className="text-[10px] text-slate-300">Text & Logo Detection</span>
              </div>
              <div className="bg-slate-800 p-3 rounded border border-slate-700 space-y-1">
                <span className="font-bold text-indigo-400 block">3. Entity Match</span>
                <span className="text-[10px] text-slate-300">CM/L & HUID Matching</span>
              </div>
              <div className="bg-slate-800 p-3 rounded border border-slate-700 space-y-1">
                <span className="font-bold text-purple-400 block">4. Verification</span>
                <span className="text-[10px] text-slate-300">QCO Scope & Lab Test Match</span>
              </div>
              <div className="bg-slate-800 p-3 rounded border border-slate-700 space-y-1">
                <span className="font-bold text-amber-400 block">5. Result Card</span>
                <span className="text-[10px] text-slate-300">Verified / Unverified Status</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
