'use client';

import React from 'react';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export const SourceBackedSection: React.FC = () => {
  const badges = [
    { label: 'BIS Official Portal', count: 'bis.gov.in' },
    { label: 'Indian Standard Gazette', count: 'e-Standards' },
    { label: 'Product Certification', count: 'ManakOnline' },
    { label: 'Hallmarking & HUID', count: 'IS 1417:2016' },
    { label: 'Laboratory Services', count: 'BIS LIMS' },
    { label: 'Quality Control Orders', count: 'Mandatory QCOs' }
  ];

  const steps = [
    'User Query',
    'Intent Detection',
    'Entity Extraction',
    'BIS Knowledge Retrieval',
    'Reranking',
    'Citation Verification',
    'Answer + Official Sources'
  ];

  return (
    <section className="py-12 bg-white border-t border-slate-200 font-sans text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="border-b border-slate-200 pb-4 mb-8 text-center">
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Traceable Compliance References</span>
          </div>
          <h2 className="text-2xl font-black text-[#0A2540]">
            Every Answer Cites Official BIS Publications
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            BISynapse cites clause numbers, gazette references, and official government portal links for technical accuracy.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-8">
          {badges.map((b, idx) => (
            <div key={idx} className="bg-slate-50 p-3 rounded border border-slate-200 text-center space-y-1">
              <span className="font-bold text-xs text-slate-900 block">{b.label}</span>
              <span className="text-[10px] text-[#0F4C81] font-mono font-bold">{b.count}</span>
            </div>
          ))}
        </div>

        <div className="bg-slate-50 rounded-lg p-5 border border-slate-200 text-center space-y-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Verification Pipeline Flowchart
          </span>

          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            {steps.map((step, idx) => (
              <React.Fragment key={idx}>
                <div className={`px-3 py-1.5 rounded font-bold border ${idx === steps.length - 1 ? 'bg-[#0F4C81] text-white border-[#0A2540]' : 'bg-white text-slate-800 border-slate-300'}`}>
                  {step}
                </div>
                {idx < steps.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
