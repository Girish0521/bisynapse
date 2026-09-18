'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FlaskConical, MapPin, Search, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react';
import { Language } from '@/lib/types';
import { fetchLabs, LimsSearchResponse } from '@/lib/apiClient';
import { BisLimsFallbackCard } from '@/components/BisLimsFallbackCard';

interface LabFinderProps {
  currentLang?: Language;
  onSendToChat?: (query: string) => void;
}

export const LabFinder: React.FC<LabFinderProps> = ({ onSendToChat }) => {
  const [selectedState, setSelectedState] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const [limsResponse, setLimsResponse] = useState<LimsSearchResponse | null>(null);

  const loadLabsData = useCallback(async (isRetryAction = false) => {
    if (isRetryAction) {
      setIsRetrying(true);
    } else {
      setIsLoading(true);
    }

    try {
      const res = await fetchLabs({
        state: selectedState,
        query: searchQuery,
        simulateFailure,
        demo: isDemoMode,
      });

      setLimsResponse(res);
    } catch (err) {
      console.warn('BIS LIMS client fetch error:', err);
      setLimsResponse({
        success: false,
        source: 'Official BIS LIMS',
        status: 'SOURCE_UNAVAILABLE',
        message: 'BIS LIMS is temporarily unavailable.',
        officialUrl: 'https://lims.bis.gov.in/',
        searchUrl: 'https://lims.bis.gov.in/home/search_labs/',
      });
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  }, [selectedState, searchQuery, simulateFailure, isDemoMode]);

  useEffect(() => {
    let active = true;
    void fetchLabs({ state: selectedState, query: searchQuery, simulateFailure, demo: isDemoMode })
      .then((response) => { if (active) setLimsResponse(response); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [selectedState, searchQuery, simulateFailure, isDemoMode]);

  const handleRetry = () => {
    loadLabsData(true);
  };

  const isUnavailable = limsResponse && (!limsResponse.success || limsResponse.status === 'SOURCE_UNAVAILABLE');
  const labsList = limsResponse?.results || [];

  return (
    <section id="labs" className="py-12 bg-slate-50 border-t border-slate-200 scroll-mt-20 font-sans text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Section Header */}
        <div className="border-b border-slate-200 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded bg-blue-100 text-[#0F4C81] text-xs font-bold">
              <FlaskConical className="w-3.5 h-3.5" />
              <span>BIS LIMS Laboratory Directory</span>
            </div>

            {/* Test Simulation Controls */}
            <div className="flex items-center space-x-3 text-xs bg-white px-3 py-1 rounded border border-slate-200">
              <label className="flex items-center space-x-1.5 cursor-pointer font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={simulateFailure}
                  onChange={(e) => setSimulateFailure(e.target.checked)}
                  className="rounded text-[#0F4C81] focus:ring-[#0F4C81]"
                />
                <span className="text-amber-800">Simulate LIMS Outage (Test Fallback)</span>
              </label>

              <span className="text-slate-300">|</span>

              <label className="flex items-center space-x-1.5 cursor-pointer font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={isDemoMode}
                  onChange={(e) => setIsDemoMode(e.target.checked)}
                  className="rounded text-[#0F4C81] focus:ring-[#0F4C81]"
                />
                <span>Demo Mode</span>
              </label>
            </div>
          </div>

          <h2 className="text-2xl font-black text-[#0A2540]">
            BIS Recognized Laboratories
          </h2>
          <p className="text-xs text-slate-600">
            Open the official BIS laboratory directory for recognition and scope checks. Demo examples are available separately.
          </p>
        </div>

        {/* Search Controls */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              aria-label="Search demo laboratories"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Lab Name, IS Standard (e.g. IS 302), or Product..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 text-slate-900 text-xs rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
            />
          </div>

          <div className="w-full md:w-48">
            <select
              aria-label="Laboratory state"
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

        {/* Status Indicator Bar */}
        <div className="flex items-center justify-between text-xs px-1">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-700">Source:</span>
            <span className="text-[#0F4C81] font-bold">{limsResponse?.source || 'Laboratory retrieval unavailable'}</span>
            {limsResponse?.retrievedAt && !isUnavailable && (
              <span className="text-slate-400 text-[10px]">
                • Retrieved: {new Date(limsResponse.retrievedAt).toLocaleTimeString()}
              </span>
            )}
          </div>

          {isDemoMode && (
            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-extrabold text-[10px] border border-amber-300">
              DEMO DATA — NOT OFFICIAL BIS VERIFICATION
            </span>
          )}
        </div>

        {/* LOADING STATE */}
        {isLoading && (
          <div className="p-12 text-center bg-white rounded-lg border border-slate-200 space-y-3">
            <div className="w-6 h-6 border-2 border-[#0F4C81] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="font-bold text-xs text-[#0A2540]">Searching official BIS LIMS...</p>
          </div>
        )}

        {/* UNAVAILABLE STATE */}
        {!isLoading && isUnavailable && (
          <BisLimsFallbackCard onRetry={handleRetry} isRetrying={isRetrying} />
        )}

        {/* NO RESULTS STATE */}
        {!isLoading && !isUnavailable && labsList.length === 0 && (
          <div className="p-8 text-center bg-white rounded-lg border border-slate-200 space-y-3">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="font-bold text-sm text-[#0A2540]">No matching demo laboratory records.</h3>
            <p className="text-xs text-slate-500">Try adjusting your search query or state filter, or visit the official portal.</p>
            <a
              href="https://lims.bis.gov.in/home/search_labs/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1 px-3 py-1.5 bg-[#0F4C81] text-white text-xs font-bold rounded shadow-2xs"
            >
              <span>Search Official BIS LIMS Portal</span>
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            </a>
          </div>
        )}

        {/* SUCCESS RESULTS GRID */}
        {!isLoading && !isUnavailable && labsList.length > 0 && (
          <div className="space-y-4">
            <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-900 font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Unverified demo examples ({labsList.length} records). Recognition and scope must be checked with the official directory.</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {labsList.map((lab) => (
                <div key={lab.id} className="bg-white rounded-lg p-5 border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between text-left">
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
                        {lab.recognitionStatus || 'BIS Recognized'}
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded text-xs space-y-0.5 border border-slate-200">
                      <span className="text-[9px] font-bold text-slate-500 block">Product Scope</span>
                      <p className="font-semibold text-slate-800">{lab.productCategory}</p>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {(lab.supportedStandards || []).map((std: string, idx: number) => (
                        <span key={idx} className="bg-blue-50 text-[#0F4C81] text-[10px] font-mono px-2 py-0.5 rounded border border-blue-200">
                          {std}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    {onSendToChat && (
                      <button
                        onClick={() => onSendToChat(`How do I generate a test request for ${lab.name} on BIS LIMS?`)}
                        className="font-bold text-[#0F4C81] hover:underline"
                      >
                        Generate Test Request →
                      </button>
                    )}
                    <a
                      href={lab.limsUrl || 'https://lims.bis.gov.in/'}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1 bg-[#0A2540] text-white rounded text-xs font-bold hover:bg-slate-800 flex items-center space-x-1 ml-auto"
                    >
                      <span>View on BIS LIMS</span>
                      <ExternalLink className="w-3 h-3 text-amber-400" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
