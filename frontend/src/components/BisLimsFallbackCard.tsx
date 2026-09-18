'use client';

import React from 'react';
import { AlertCircle, RefreshCw, ExternalLink, ShieldAlert } from 'lucide-react';

interface BisLimsFallbackCardProps {
  onRetry: () => void;
  isRetrying?: boolean;
  compact?: boolean;
}

export const BisLimsFallbackCard: React.FC<BisLimsFallbackCardProps> = ({
  onRetry,
  isRetrying = false,
  compact = false,
}) => {
  return (
    <div className={`bg-white rounded-lg border border-slate-300 p-5 shadow-2xs space-y-4 text-left font-sans ${compact ? 'max-w-xl' : 'w-full'}`}>
      
      {/* Header Metadata Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded bg-slate-100 text-[#0F4C81] flex items-center justify-center border border-slate-200">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 tracking-wider block">Source</span>
            <span className="font-bold text-xs text-[#0A2540]">Official BIS LIMS (lims.bis.gov.in)</span>
          </div>
        </div>

        <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
          <span>Retrieval Unavailable</span>
        </div>
      </div>

      {/* Main Alert Message */}
      <div className="p-3.5 bg-slate-50 rounded-md border border-slate-200 space-y-1.5">
        <div className="flex items-center space-x-2 text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <h3 className="font-bold text-sm text-[#0A2540]">
            Live laboratory retrieval is unavailable in this prototype.
          </h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed pl-6">
          The prototype cannot establish current laboratory recognition or scope. Open the official directory to check, or explicitly enable demo examples.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <button
          type="button"
          onClick={onRetry}
          disabled={isRetrying}
          className="px-4 py-2 bg-[#0F4C81] hover:bg-[#0A2540] text-white font-bold text-xs rounded shadow-2xs transition-colors flex items-center space-x-1.5 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
          <span>{isRetrying ? 'Retrying BIS LIMS connection...' : 'Retry'}</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href="https://lims.bis.gov.in/"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 bg-white hover:bg-slate-100 text-[#0A2540] font-bold text-xs rounded border border-slate-300 shadow-2xs transition-colors flex items-center space-x-1.5"
          >
            <span>Open Official BIS LIMS</span>
            <ExternalLink className="w-3.5 h-3.5 text-amber-500" />
          </a>

          <a
            href="https://lims.bis.gov.in/home/search_labs/"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded border border-slate-300 transition-colors flex items-center space-x-1"
          >
            <span>Search Official BIS LIMS</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>
      </div>

      <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-2 flex items-center justify-between">
        <span>Official Portal: https://lims.bis.gov.in/</span>
        <span>Status: SOURCE_UNAVAILABLE</span>
      </div>

    </div>
  );
};
