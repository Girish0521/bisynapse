'use client';

import React from 'react';
import { Building2, Rocket, Users, GraduationCap, ShieldCheck, TrendingUp } from 'lucide-react';

export const ImpactMetrics: React.FC = () => {
  const stakeholderCards = [
    { title: 'MSMEs', desc: 'Reduce time spent searching standards and certification procedures by 60%.', icon: Building2 },
    { title: 'Startups', desc: 'Quickly understand mandatory QCO compliance requirements before hardware production.', icon: Rocket },
    { title: 'Consumers', desc: 'Find official services for checking hallmarks, HUID codes and ISI marks.', icon: Users },
    { title: 'Students', desc: 'Make Indian Standards searchable and understandable in plain language for research.', icon: GraduationCap },
    { title: 'Government Officers', desc: 'Access high-density compliance verification and regulatory reporting metrics.', icon: ShieldCheck }
  ];

  return (
    <section id="metrics" className="py-12 bg-slate-50 border-t border-slate-200 scroll-mt-20 font-sans text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="border-b border-slate-200 pb-4 mb-8">
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded bg-blue-100 text-[#0F4C81] text-xs font-bold mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>National Impact & Target Benchmarks</span>
          </div>
          <h2 className="text-2xl font-black text-[#0A2540]">
            Transforming Access to Indian Standards
          </h2>
          <p className="text-xs text-slate-600">
            Empowering key stakeholders across the Indian manufacturing and consumer ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {stakeholderCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div key={idx} className="bg-white rounded-lg p-4 border border-slate-200 shadow-2xs space-y-2">
                <div className="w-8 h-8 rounded bg-slate-100 text-[#0F4C81] flex items-center justify-center font-bold">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{card.title}</h3>
                <p className="text-xs text-slate-600 leading-normal">{card.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="bg-[#0A2540] text-white rounded-lg p-6 shadow-2xs flex flex-wrap justify-between items-center gap-4 text-xs">
          <div>
            <span className="font-bold text-amber-400 block text-sm">60% Faster Discovery</span>
            <span className="text-slate-300">Target Time Reduction for Standards Search</span>
          </div>
          <div>
            <span className="font-bold text-amber-400 block text-sm">24×7 Digital Access</span>
            <span className="text-slate-300">Prototype Access Target</span>
          </div>
          <div>
            <span className="font-bold text-amber-400 block text-sm">Pan-India Multilingual</span>
            <span className="text-slate-300">English, Hindi & Telugu Support</span>
          </div>
          <div>
            <span className="font-bold text-amber-400 block text-sm">1 Unified Portal</span>
            <span className="text-slate-300">Standards, Certification & Verification</span>
          </div>
        </div>

      </div>
    </section>
  );
};
