'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { QuickActions } from '@/components/QuickActions';
import { AiAssistant } from '@/components/AiAssistant';
import { StandardsFinder } from '@/components/StandardsFinder';
import { CertificationGuide } from '@/components/CertificationGuide';
import { LabFinder } from '@/components/LabFinder';
import { HallmarkingSection } from '@/components/HallmarkingSection';
import { ConsumerSupport } from '@/components/ConsumerSupport';
import { MultilingualFeature } from '@/components/MultilingualFeature';
import { RagArchitecture } from '@/components/RagArchitecture';
import { SourceBackedSection } from '@/components/SourceBackedSection';
import { ImpactMetrics } from '@/components/ImpactMetrics';
import { Footer } from '@/components/Footer';
import { CameraScannerModal } from '@/components/CameraScannerModal';
import { StandardDetailModal } from '@/components/StandardDetailModal';
import { Language, StandardResult } from '@/lib/types';
import { translations } from '@/lib/translations';

export default function Home() {
  const [currentLang, setCurrentLang] = useState<Language>('en');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [selectedStandard, setSelectedStandard] = useState<StandardResult | null>(null);
  const { role: activeRole, logout: handleLogout } = useAuth();

  const [activeQuery, setActiveQuery] = useState<string | undefined>(undefined);
  const [activeVisualContext, setActiveVisualContext] = useState<any | undefined>(undefined);

  const handleNavigate = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSendPresetQuery = (query: string) => {
    setActiveQuery(query);
    handleNavigate('assistant');
  };

  const handleSendVisualToChat = (visualContext: any) => {
    setActiveVisualContext(visualContext);
    handleNavigate('assistant');
  };

  return (
    <div className="landing-page min-h-screen font-sans bg-white text-slate-900 selection:bg-[#0F4C81] selection:text-white">
      
      {/* 1. Government Header Bar */}
      <Navbar
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        onNavigate={handleNavigate}
        onOpenScanner={() => setIsScannerOpen(true)}
        activeRole={activeRole}
        onLogout={handleLogout}
      />

      <main>
        {/* 2. Hero Section with 4 User Categories */}
        <Hero
          currentLang={currentLang}
          onNavigate={handleNavigate}
          onOpenScanner={() => setIsScannerOpen(true)}
        />

        {/* 3. BISynapse Assistant Section */}
        <AiAssistant
          currentLang={currentLang}
          onOpenScanner={() => setIsScannerOpen(true)}
          externalQuery={activeQuery}
          externalVisualContext={activeVisualContext}
        />

        {/* 4. Quick Services Hub */}
        <QuickActions
          currentLang={currentLang}
          onNavigate={handleNavigate}
          onOpenScanner={() => setIsScannerOpen(true)}
        />

        {/* 5. Standards Search Engine */}
        <StandardsFinder
          currentLang={currentLang}
          onSelectStandard={setSelectedStandard}
          onSendToChat={handleSendPresetQuery}
        />

        {/* 6. Visual Certification Journey Stepper */}
        <CertificationGuide
          currentLang={currentLang}
          onSendToChat={handleSendPresetQuery}
        />

        {/* 7. Laboratory Directory */}
        <LabFinder
          currentLang={currentLang}
          onSendToChat={handleSendPresetQuery}
        />

        {/* 8. Gold Hallmarking & HUID Verification */}
        <HallmarkingSection
          currentLang={currentLang}
          onOpenScanner={() => setIsScannerOpen(true)}
          onSendToChat={handleSendPresetQuery}
        />

        {/* 9. Consumer Support & Grievance Guidance */}
        <ConsumerSupport
          currentLang={currentLang}
          onSendToChat={handleSendPresetQuery}
        />

        {/* 10. Multilingual Accessibility */}
        <MultilingualFeature
          currentLang={currentLang}
          onLanguageChange={setCurrentLang}
        />

        {/* 11. Traceable Citations */}
        <SourceBackedSection />

        {/* 12. System Architecture */}
        <RagArchitecture />

        {/* 13. Impact Metrics */}
        <ImpactMetrics />
      </main>

      {/* 14. Footer */}
      <Footer currentLang={currentLang} onNavigate={handleNavigate} />

      {/* Camera Scanner Modal */}
      <CameraScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSendToChat={handleSendVisualToChat}
      />

      {/* Standard Detail Modal */}
      <StandardDetailModal
        standard={selectedStandard}
        onClose={() => setSelectedStandard(null)}
        onSendToChat={handleSendPresetQuery}
      />

    </div>
  );
}
