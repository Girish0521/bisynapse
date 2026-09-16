'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Search, Scan, ArrowRight, UserCheck, Store, Building2, Shield, CheckCircle2, FileText, Lock } from 'lucide-react';
import { Language } from '@/lib/types';
import { translations } from '@/lib/translations';

interface HeroProps {
  currentLang: Language;
  onNavigate?: (sectionId: string) => void;
  onOpenScanner?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ currentLang, onNavigate }) => {
  const t = translations[currentLang];

  const userCategories = [
    {
      id: 'consumer',
      title: 'Consumer',
      subtitle: 'Product verification & quality protection',
      icon: UserCheck,
      badge: 'Public Service',
      href: '/login?role=consumer',
      items: [
        'Verify product authenticity & ISI marks',
        'Check BIS certification licence validity',
        'Understand Indian Standards in simple terms',
        'Lodge quality complaints & report concerns'
      ]
    },
    {
      id: 'retailer',
      title: 'Retailer',
      subtitle: 'Compliance & inventory verification',
      icon: Store,
      badge: 'Merchant Hub',
      href: '/login?role=retailer',
      items: [
        'Verify supplier products & hallmarking',
        'Check mandatory QCO compliance requirements',
        'Understand retail sales compliance standards',
        'Access official BIS verification records'
      ]
    },
    {
      id: 'industry',
      title: 'Industry / MSME',
      subtitle: 'Standards search & licensing assistance',
      icon: Building2,
      badge: 'Enterprise Gateway',
      href: '/login?role=industry',
      items: [
        'Find applicable Indian Standards (IS numbers)',
        'Step-by-step certification guidance & stepper',
        'MSME & Startup fee concession information',
        'Locate BIS recognized testing laboratories'
      ]
    },
    {
      id: 'officer',
      title: 'Government Officer',
      subtitle: 'Regulatory oversight & compliance verification',
      icon: Shield,
      badge: 'Official Oversight',
      href: '/login?role=officer',
      items: [
        'High-density standards & gazette search',
        'Market surveillance compliance verification',
        'Regulatory reporting & analytical oversight',
        'Official BIS service reference tools'
      ]
    }
  ];

  return (
    <section className="bg-white border-b border-slate-200 pt-8 pb-16 font-sans text-left">
      
      {/* Main Hero Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Hero Banner Card */}
        <div className="bg-[#0A2540] rounded-xl p-8 sm:p-12 text-white shadow-sm border border-slate-800 relative overflow-hidden mb-12">
          
          <div className="max-w-3xl space-y-5 relative z-10">
            {/* Government Portal Badge */}
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded bg-[#0F4C81] text-amber-400 text-xs font-bold border border-blue-800">
              <ShieldCheck className="w-4 h-4" />
              <span>Official Digital Services Gateway • Bureau of Indian Standards</span>
            </div>

            {/* Main Brand Title */}
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              BISynapse
            </h1>

            <p className="text-lg sm:text-xl text-slate-200 font-semibold leading-snug">
              “Your Digital Gateway to BIS Standards, Certification & Compliance”
            </p>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed max-w-2xl">
              BISynapse provides a unified official portal for consumers, retailers, industries, MSMEs, and government officers to access Indian Standards, verify ISI marks and hallmarking, locate recognized labs, and navigate certification pathways.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <Link
                href="/login"
                className="px-6 py-3 bg-[#0F4C81] hover:bg-[#08345c] text-white font-bold text-xs rounded-md shadow-sm transition-colors flex items-center space-x-2 border border-blue-700"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </Link>

              <a
                href="#services"
                className="px-6 py-3 bg-white hover:bg-slate-100 text-[#0A2540] font-bold text-xs rounded-md border border-slate-300 shadow-2xs transition-colors"
              >
                Explore BIS Services
              </a>

              <Link
                href="/scan"
                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs rounded-md border border-slate-700 flex items-center space-x-1.5 transition-colors"
              >
                <Scan className="w-4 h-4" />
                <span>Scan & Verify Product</span>
              </Link>
            </div>
          </div>

        </div>

        {/* 4 User Categories Grid */}
        <div id="user-categories" className="space-y-6">
          
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-xl font-bold text-[#0A2540] tracking-tight">
              Select Your User Category
            </h2>
            <p className="text-xs text-slate-600">
              Access customized BIS information, product verification tools and compliance guidance tailored for your role.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {userCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.id}
                  className="bg-slate-50 hover:bg-white rounded-lg p-6 border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-md bg-[#0F4C81] text-white flex items-center justify-center font-bold">
                        <Icon className="w-5 h-5 text-amber-400" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded">
                        {cat.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-[#0A2540]">
                        {cat.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {cat.subtitle}
                      </p>
                    </div>

                    <ul className="space-y-2 text-xs text-slate-700 pt-1 border-t border-slate-200">
                      {cat.items.map((item, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#0F4C81] shrink-0 mt-0.5" />
                          <span className="leading-tight text-[11px]">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-5 mt-4 border-t border-slate-200">
                    <Link
                      href={cat.href}
                      className="w-full py-2 bg-[#0F4C81] hover:bg-[#0A2540] text-white font-bold text-xs rounded text-center block transition-colors shadow-2xs"
                    >
                      Access {cat.title} Portal →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
};
