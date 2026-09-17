'use client';

import React from 'react';
import { X, ExternalLink, CheckCircle2, ShieldCheck, AlertCircle, FlaskConical, ArrowRight } from 'lucide-react';
import { StandardResult } from '@/lib/types';

interface StandardDetailModalProps {
  standard: StandardResult | null;
  onClose: () => void;
  onSendToChat: (query: string) => void;
}

export const StandardDetailModal: React.FC<StandardDetailModalProps> = ({
  standard,
  onClose,
  onSendToChat
}) => {
  if (!standard) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 font-sans">
      <div className="bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden text-left flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#0A2540] text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-bold text-amber-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              {standard.number}
            </span>
            <span className="text-xs text-slate-300">Indian Standard Technical Dossier</span>
          </div>

          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          
          <div>
            <h3 className="text-base font-black text-[#0A2540] leading-snug">
              {standard.title}
            </h3>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-0.5 rounded bg-blue-50 text-[#0F4C81] font-semibold border border-blue-200">
                Scheme: {standard.scheme}
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold border border-amber-300">
                {standard.status}
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs text-slate-700 space-y-1">
            <span className="font-bold text-[#0A2540] block text-[10px]">Scope & Application</span>
            <p className="leading-relaxed">{standard.description || standard.whyApplies}</p>
          </div>

          {standard.keyRequirements && standard.keyRequirements.length > 0 && (
            <div className="space-y-1.5 text-xs">
              <span className="font-bold text-[#0A2540] tracking-wider block flex items-center space-x-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Key Safety Requirements:</span>
              </span>
              <ul className="space-y-1 pl-1">
                {standard.keyRequirements.map((req, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {standard.testingRequired && standard.testingRequired.length > 0 && (
            <div className="space-y-1.5 text-xs">
              <span className="font-bold text-[#0A2540] tracking-wider block flex items-center space-x-1">
                <FlaskConical className="w-4 h-4 text-[#0F4C81]" />
                <span>Mandatory Lab Testing Parameters:</span>
              </span>
              <div className="flex flex-wrap gap-1">
                {standard.testingRequired.map((t, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-medium text-[11px] border border-slate-200">
                    • {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="p-2.5 bg-amber-50 rounded border border-amber-200 text-[11px] text-amber-900 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>Always verify standard numbers against latest Quality Control Orders published on bis.gov.in.</span>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-between items-center text-xs">
          <a
            href={standard.bisPortalUrl || 'https://www.bis.gov.in'}
            target="_blank"
            rel="noreferrer"
            className="font-bold text-[#0F4C81] hover:underline flex items-center space-x-1"
          >
            <span>Search on BIS Portal</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <button
            onClick={() => {
              onSendToChat(`Explain certification scheme and lab requirements for ${standard.number}`);
              onClose();
            }}
            className="px-4 py-1.5 bg-[#0F4C81] text-white font-bold text-xs rounded shadow-2xs flex items-center space-x-1"
          >
            <span>Ask BISynapse</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
          </button>
        </div>

      </div>
    </div>
  );
};
