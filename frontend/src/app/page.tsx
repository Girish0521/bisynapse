'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { QuickActions } from '@/components/QuickActions';
import { Footer } from '@/components/Footer';
import type { Language } from '@/lib/types';

const oldSections: Record<string, string> = {
  standards: '/standards', assistant: '/assistant', certification: '/certification',
  labs: '/labs', hallmarking: '/hallmarking', consumer: '/support', help: '/support',
  architecture: '/about', metrics: '/about', about: '/about', search: '/standards',
};

export default function Home() {
  const [language, setLanguage] = useState<Language>('en');
  const { role, logout } = useAuth();
  const router = useRouter();
  useEffect(() => {
    const redirect = () => {
      const destination = oldSections[window.location.hash.slice(1)];
      if (destination) router.replace(destination);
    };
    redirect();
    // The prototype banner lives outside this page. Include it when returning
    // home instead of letting route scroll restoration stop below the banner.
    if (!window.location.hash) window.scrollTo({ top: 0, behavior: 'instant' });
    window.addEventListener('hashchange', redirect);
    return () => window.removeEventListener('hashchange', redirect);
  }, [router]);
  return (
    <div className="landing-page min-h-screen bg-white text-slate-900">
      <Navbar currentLang={language} onLanguageChange={setLanguage} activeRole={role} onLogout={logout} />
      <main>
        <Hero currentLang={language} />
        <QuickActions currentLang={language} />
        <section className="bg-[#eef3f3]">
          <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-start gap-6">
            <div><h2 className="text-2xl font-semibold">Have a question about standards?</h2><p className="text-slate-600 mt-3">Open the assistant for guidance, or explore the project and its planned capabilities.</p></div>
            <div className="flex flex-wrap gap-3"><Link className="design-button design-button-primary" href="/assistant">Ask BISynapse</Link><Link className="design-button design-button-secondary" href="/about">About the project</Link></div>
          </div>
        </section>
      </main>
      <Footer currentLang={language} />
    </div>
  );
}
