'use client';

import React from 'react';
import { Globe, Languages } from 'lucide-react';
import { Language } from '@/lib/types';

interface MultilingualFeatureProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
}

export const MultilingualFeature: React.FC<MultilingualFeatureProps> = ({
  currentLang,
  onLanguageChange
}) => {
  return (
    <section className="py-12 bg-slate-50 border-t border-slate-200 font-sans text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0A2540] rounded-lg p-6 sm:p-8 text-white shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            <div className="md:col-span-7 space-y-3">
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-[#0F4C81] text-amber-400 text-xs font-bold">
                <Globe className="w-3.5 h-3.5" />
                <span>Pan-India Accessibility</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white">
                Multilingual Standards & Compliance Portal
              </h2>

              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                BISynapse provides official technical guidance in multiple regional languages so MSMEs, retailers, jewellers, and citizens across India can access standards without language barriers.
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={() => onLanguageChange('en')}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${currentLang === 'en' ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'}`}
                >
                  English
                </button>
                <button
                  onClick={() => onLanguageChange('hi')}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${currentLang === 'hi' ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'}`}
                >
                  हिन्दी (Hindi)
                </button>
                <button
                  onClick={() => onLanguageChange('te')}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${currentLang === 'te' ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'}`}
                >
                  తెలుగు (Telugu)
                </button>
              </div>
            </div>

            <div className="md:col-span-5 bg-slate-800 p-4 rounded border border-slate-700 space-y-2 text-xs">
              <span className="font-bold text-amber-400 uppercase tracking-wider block flex items-center space-x-1">
                <Languages className="w-4 h-4" />
                <span>Scheduled Languages Support</span>
              </span>
              <p className="text-slate-300 leading-relaxed">
                Architected to scale across Eighth Schedule Indian languages (Tamil, Marathi, Bengali, Gujarati, Kannada, Punjabi, etc.).
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
