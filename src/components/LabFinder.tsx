'use client';

import React, { useState, useEffect } from 'react';
import { FlaskConical, MapPin, Search, ExternalLink } from 'lucide-react';
import { Language } from '@/lib/types';
import { fetchLabs } from '@/lib/apiClient';
import { mockLabs } from '@/lib/mockData';

interface LabFinderProps {
  currentLang: Language;
  onSendToChat: (query: string) => void;
}

export const LabFinder: React.FC<LabFinderProps> = ({ onSendToChat }) => {
  const [selectedState, setSelectedState] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [labsList, setLabsList] = useState(mockLabs);

  useEffect(() => {
    async function loadLabs() {
      try {
        const res = await fetchLabs({ state: selectedState, query: searchQuery });
        if (res && res.labs && res.labs.length > 0) {
          setLabsList(res.labs);
        }
      } catch (err) {
        console.warn('Labs API load fallback:', err);
      }
    }
    loadLabs();
  }, [selectedState, searchQuery]);

  const filteredLabs = labsList.filter((lab) => {
    const matchesState = !selectedState || lab.state.toLowerCase().includes(selectedState.toLowerCase());
    const matchesQuery = !searchQuery ||
      lab.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lab.productCategory || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lab.supportedStandards || []).some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesState && matchesQuery;
  });

  return (
    <section id="labs" className="py-12 bg-slate-50 border-t border-slate-200 scroll-mt-20 font-sans text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="border-b border-slate-200 pb-4 mb-8">
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded bg-blue-100 text-[#0F4C81] text-xs font-bold mb-2">
            <FlaskConical className="w-3.5 h-3.5" />
            <span>BIS LIMS Laboratory Directory</span>
          </div>
          <h2 className="text-2xl font-black text-[#0A2540]">
            BIS Recognized Laboratories
          </h2>
          <p className="text-xs text-slate-600">
            Locate accredited testing facilities for electrical appliances, IT equipment, solar modules, rebar steel and hallmarking assays.
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Lab Name, IS Standard (e.g. IS 302), or Product..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 text-slate-900 text-xs rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
            />
          </div>

          <div className="w-full md:w-48">
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 text-xs px-3 py-2 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F4C81] font-medium"
            >
              <option value="">All States / UTs</option>
              <option value="Delhi">Delhi NCR</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLabs.map((lab) => (
            <div key={lab.id} className="bg-white rounded-lg p-5 border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{lab.name}</h3>
                    <span className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-rose-600 shrink-0" />
                      <span>{lab.city}, {lab.state}</span>
                    </span>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {lab.recognitionStatus}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded text-xs space-y-0.5 border border-slate-200">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Product Scope</span>
                  <p className="font-semibold text-slate-800">{lab.productCategory}</p>
                </div>

                <div className="flex flex-wrap gap-1">
                  {lab.supportedStandards.map((std, idx) => (
                    <span key={idx} className="bg-blue-50 text-[#0F4C81] text-[10px] font-mono px-2 py-0.5 rounded border border-blue-200">
                      {std}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => onSendToChat(`How do I generate a test request for ${lab.name} on BIS LIMS?`)}
                  className="font-bold text-[#0F4C81] hover:underline"
                >
                  Generate Test Request →
                </button>
                <a
                  href={lab.limsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 bg-[#0A2540] text-white rounded text-xs font-bold hover:bg-slate-800 flex items-center space-x-1"
                >
                  <span>View on BIS LIMS</span>
                  <ExternalLink className="w-3 h-3 text-amber-400" />
                </a>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
