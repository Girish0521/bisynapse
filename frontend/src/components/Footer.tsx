'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, ExternalLink } from 'lucide-react';
import { Language } from '@/lib/types';

interface FooterProps {
  currentLang: Language;
  onNavigate?: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = () => {

  return (
    <footer className="bg-[#0A2540] text-slate-300 pt-16 pb-8 border-t border-slate-800 text-left font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded bg-[#0F4C81] text-amber-400 flex items-center justify-center border border-blue-900">
                <Shield className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <span className="brand-wordmark font-bold text-xl text-white tracking-tight">
                  BISynapse
                </span>
                <p className="text-xs text-slate-400 font-medium">Standards, made clearer</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
              Independent guidance for Indian Standards, certification pathways, quality marks, and consumer information.
            </p>

            <div className="p-2.5 bg-slate-900 rounded border border-slate-800 text-[11px] text-amber-400 font-medium">
              An independent SIH prototype. Not an official BIS portal.
            </div>
          </div>

          {/* User Role Portals */}
          <div className="md:col-span-3 space-y-2 text-xs">
            <h4 className="font-bold text-white tracking-wider text-[11px] border-b border-slate-800 pb-1">
              Role Portals
            </h4>
            <ul className="space-y-1.5 text-slate-300 pt-1">
              <li>
                <Link href="/login?role=consumer" className="hover:text-amber-400 transition-colors">
                  Consumer Portal
                </Link>
              </li>
              <li>
                <Link href="/login?role=retailer" className="hover:text-amber-400 transition-colors">
                  Retailer Portal
                </Link>
              </li>
              <li>
                <Link href="/login?role=industry" className="hover:text-amber-400 transition-colors">
                  Industry / MSME Portal
                </Link>
              </li>
              <li>
                <Link href="/login?role=officer" className="hover:text-amber-400 transition-colors">
                  Government Officer Portal
                </Link>
              </li>
              <li>
                <Link href="/scan" className="hover:text-amber-400 transition-colors">
                  Scan & Verify Scanner
                </Link>
              </li>
            </ul>
          </div>

          {/* Official Government Links */}
          <div className="md:col-span-4 space-y-2 text-xs">
            <h4 className="font-bold text-white tracking-wider text-[11px] border-b border-slate-800 pb-1">
              Official BIS Portals
            </h4>
            <ul className="space-y-1.5 text-slate-300 pt-1">
              <li>
                <a href="https://www.bis.gov.in" target="_blank" rel="noreferrer" className="hover:text-amber-400 transition-colors flex items-center justify-between">
                  <span>BIS Official Portal (bis.gov.in)</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a href="https://www.manakonline.in" target="_blank" rel="noreferrer" className="hover:text-amber-400 transition-colors flex items-center justify-between">
                  <span>ManakOnline e-BIS Portal</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a href="https://www.limsbis.in" target="_blank" rel="noreferrer" className="hover:text-amber-400 transition-colors flex items-center justify-between">
                  <span>BIS LIMS Laboratory Directory</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a href="https://www.crsbis.in/BIS/" target="_blank" rel="noreferrer" className="hover:text-amber-400 transition-colors flex items-center justify-between">
                  <span>Compulsory Registration Scheme (CRS)</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a href="https://www.bis.gov.in/hallmarking-2/" target="_blank" rel="noreferrer" className="hover:text-amber-400 transition-colors flex items-center justify-between">
                  <span>BIS Hallmarking Portal</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <p>© 2026 BISynapse • Bureau of Indian Standards Digital Service Portal</p>
          <div className="flex items-center space-x-2">
            <span>Official Government Service Architecture</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
