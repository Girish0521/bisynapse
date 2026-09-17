'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import type { Language, StandardResult } from '@/lib/types';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { AiAssistant } from './AiAssistant';
import { StandardsFinder } from './StandardsFinder';
import { CertificationGuide } from './CertificationGuide';
import { LabFinder } from './LabFinder';
import { HallmarkingSection } from './HallmarkingSection';
import { ConsumerSupport } from './ConsumerSupport';
import { MultilingualFeature } from './MultilingualFeature';
import { RagArchitecture } from './RagArchitecture';
import { SourceBackedSection } from './SourceBackedSection';
import { ImpactMetrics } from './ImpactMetrics';
import { QuickActions } from './QuickActions';
import { StandardDetailModal } from './StandardDetailModal';
import { CameraScannerModal } from './CameraScannerModal';

const titles = { standards: 'Standards', assistant: 'Assistant', certification: 'Certification', labs: 'Laboratories', hallmarking: 'Hallmarking', support: 'Consumer support', about: 'About BISynapse', services: 'All services' };
export type ToolKind = keyof typeof titles;

export function ToolWorkspace({ kind }: { kind: ToolKind }) {
  const [language, setLanguage] = useState<Language>('en');
  const [standard, setStandard] = useState<StandardResult | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [visualContext, setVisualContext] = useState<Record<string, unknown>>();
  const router = useRouter();
  const search = useSearchParams();
  const { role, logout } = useAuth();
  const ask = (query: string) => router.push('/assistant?q=' + encodeURIComponent(query));
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <Navbar currentLang={language} onLanguageChange={setLanguage} activeRole={role} onLogout={logout} />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-6 pt-8">
          <nav aria-label="Breadcrumb" className="text-sm text-slate-500 flex gap-3"><Link href="/">Home</Link><span>/</span><span aria-current="page">{titles[kind]}</span></nav>
          <h1 className="text-3xl font-semibold mt-5">{titles[kind]}</h1>
          <nav aria-label="Service navigation" className="flex flex-wrap gap-x-5 gap-y-3 py-5 text-sm">
            {Object.entries(titles).filter(([key]) => key !== 'about').map(([key, title]) => <Link key={key} href={'/' + key} aria-current={kind === key ? 'page' : undefined} className={kind === key ? 'font-bold text-[#237c7c]' : 'text-slate-600 hover:underline'}>{title}</Link>)}
          </nav>
        </div>
        {kind === 'standards' && <StandardsFinder currentLang={language} onSelectStandard={setStandard} onSendToChat={ask} />}
        {kind === 'assistant' && <AiAssistant currentLang={language} externalQuery={visualContext ? undefined : search.get('q') || undefined} externalVisualContext={visualContext} onOpenScanner={() => setScannerOpen(true)} />}
        {kind === 'certification' && <CertificationGuide currentLang={language} onSendToChat={ask} />}
        {kind === 'labs' && <LabFinder currentLang={language} onSendToChat={ask} />}
        {kind === 'hallmarking' && <HallmarkingSection currentLang={language} onOpenScanner={() => router.push('/scan')} onSendToChat={ask} />}
        {kind === 'support' && <ConsumerSupport currentLang={language} onSendToChat={ask} />}
        {kind === 'services' && <QuickActions currentLang={language} />}
        {kind === 'about' && <>
          <p className="max-w-7xl mx-auto px-6 pb-8 text-sm text-slate-600">Project vision and planned capabilities. The architecture, dataset integrations, verification workflows, and impact targets below describe our roadmap, not completed integrations or measured outcomes.</p>
          <MultilingualFeature currentLang={language} onLanguageChange={setLanguage} />
          <SourceBackedSection />
          <RagArchitecture />
          <ImpactMetrics />
        </>}
      </main>
      <Footer currentLang={language} />
      <StandardDetailModal standard={standard} onClose={() => setStandard(null)} onSendToChat={ask} />
      <CameraScannerModal isOpen={scannerOpen} onClose={() => setScannerOpen(false)} onSendToChat={context => { setVisualContext(context); setScannerOpen(false); }} />
    </div>
  );
}
