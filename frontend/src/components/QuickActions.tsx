'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Award, FlaskConical, Gem, HeartHandshake, Scan, ArrowRight } from 'lucide-react';
import { Language } from '@/lib/types';
import { translations } from '@/lib/translations';

interface QuickActionsProps {
  currentLang: Language;
  onNavigate?: (sectionId: string) => void;
  onOpenScanner?: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  currentLang
}) => {
  const t = translations[currentLang];

  const cards = [
    { id: 'standards', title: t.action1Title, description: t.action1Desc, buttonText: t.action1Btn, icon: Search, href: '/#standards' },
    { id: 'certification', title: t.action2Title, description: t.action2Desc, buttonText: t.action2Btn, icon: Award, href: '/#certification' },
    { id: 'labs', title: t.action3Title, description: t.action3Desc, buttonText: t.action3Btn, icon: FlaskConical, href: '/#labs' },
    { id: 'hallmarking', title: t.action4Title, description: t.action4Desc, buttonText: t.action4Btn, icon: Gem, href: '/#hallmarking' },
    { id: 'consumer', title: t.action5Title, description: t.action5Desc, buttonText: t.action5Btn, icon: HeartHandshake, href: '/#consumer' },
    { id: 'scanner', title: t.action6Title, description: t.action6Desc, buttonText: t.action6Btn, icon: Scan, href: '/scan' }
  ];

  return (
    <section id="services" className="py-12 bg-white border-t border-slate-200 font-sans text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="pb-4 mb-8 max-w-2xl">
          <p className="eyebrow text-[#237c7c] mb-3">Tools for your next step</p>
          <h2 className="text-3xl font-semibold text-[#0A2540] tracking-tight">
            {t.quickActionsTitle}
          </h2>
          <p className="text-sm text-slate-600 mt-3">
            {t.quickActionsDesc}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.id}
                href={card.href}
                className="group service-card flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-[#e7f0ef] text-[#237c7c] flex items-center justify-center">
                    <Icon className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-lg group-hover:text-[#0F4C81] transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed mt-3 font-normal">
                      {card.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-200 flex items-center justify-between text-xs font-semibold text-[#0F4C81]">
                  <span>{card.buttonText}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#0F4C81]" />
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
};
