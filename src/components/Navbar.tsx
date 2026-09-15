'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Shield, Globe, ChevronDown, User, Scan, Search, HelpCircle, Menu, X, ArrowRight, Lock } from 'lucide-react';
import { Language, UserRole } from '@/lib/types';
import { translations } from '@/lib/translations';

interface NavbarProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  onNavigate?: (sectionId: string) => void;
  onOpenScanner?: () => void;
  activeRole?: UserRole | null;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLang,
  onLanguageChange,
  onNavigate,
  onOpenScanner,
  activeRole,
  onLogout
}) => {
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = translations[currentLang];

  const navLinks = [
    { id: 'hero', label: 'Home', href: '/' },
    { id: 'services', label: 'Services', href: '/#services' },
    { id: 'standards', label: 'Standards', href: '/#standards' },
    { id: 'search', label: 'Search', href: '/#search' },
    { id: 'scan', label: 'Scan', href: '/scan' },
    { id: 'about', label: 'About', href: '/#about' }
  ];

  const handleNavClick = (link: { id: string; href: string }) => {
    setMobileMenuOpen(false);
    if (onNavigate && link.href.startsWith('/#')) {
      onNavigate(link.id);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-2xs font-sans">
      
      {/* Top Official Government Banner Strip */}
      <div className="bg-[#0A2540] text-slate-200 text-[11px] py-1 px-4 flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center space-x-2 font-medium">
          {/* Ashoka Chakra / Flag Emblem Reference */}
          <div className="flex items-center space-x-1.5 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span className="font-semibold text-slate-100">भारत सरकार | Government of India</span>
          </div>
          <span className="hidden md:inline text-slate-400">•</span>
          <span className="hidden md:inline text-slate-300 font-medium">
            Bureau of Indian Standards Digital Services Portal
          </span>
        </div>

        <div className="flex items-center space-x-4 text-slate-300">
          <a
            href="https://www.bis.gov.in"
            target="_blank"
            rel="noreferrer"
            className="hover:text-amber-400 transition-colors font-medium flex items-center space-x-1"
          >
            <span>bis.gov.in</span>
          </a>
          <span>|</span>
          <a
            href="https://www.manakonline.in"
            target="_blank"
            rel="noreferrer"
            className="hover:text-amber-400 transition-colors font-medium hidden sm:inline"
          >
            ManakOnline
          </a>
        </div>
      </div>

      {/* Main Left-Aligned Compact Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* LEFT SIDE: Brand Emblem & Main Navigation Links */}
          <div className="flex items-center space-x-8">
            
            {/* BISynapse Brand Identification */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-lg bg-[#0F4C81] text-white flex items-center justify-center font-bold shadow-xs border border-blue-900 group-hover:bg-[#0A2540] transition-colors">
                <Shield className="w-6 h-6 stroke-[2.2] text-amber-400" />
              </div>
              <div className="text-left">
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-xl text-[#0A2540] tracking-tight">
                    BISynapse
                  </span>
                  <span className="px-1.5 py-0.2 text-[9px] font-bold bg-blue-100 text-[#0F4C81] rounded border border-blue-200">
                    GOVT PORTAL
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium tracking-tight">
                  Bureau of Indian Standards Gateway
                </p>
              </div>
            </Link>

            {/* Left-Aligned Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.id}
                  href={link.href}
                  onClick={() => handleNavClick(link)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-[#0F4C81] hover:bg-slate-100 rounded-md transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

          </div>

          {/* RIGHT SIDE: Language, Help, Login / Profile */}
          <div className="hidden md:flex items-center space-x-3">
            
            {/* Language Dropdown Selector */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md border border-slate-200 transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-[#0F4C81]" />
                <span>{currentLang === 'en' ? 'English' : currentLang === 'hi' ? 'हिन्दी' : 'తెలుగు'}</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 text-left">
                  <button
                    onClick={() => { onLanguageChange('en'); setLangDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-slate-50 flex items-center justify-between ${currentLang === 'en' ? 'text-[#0F4C81] font-bold bg-slate-50' : 'text-slate-700'}`}
                  >
                    <span>English</span>
                    {currentLang === 'en' && <span className="w-1.5 h-1.5 rounded-full bg-[#0F4C81]"></span>}
                  </button>
                  <button
                    onClick={() => { onLanguageChange('hi'); setLangDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-slate-50 flex items-center justify-between ${currentLang === 'hi' ? 'text-[#0F4C81] font-bold bg-slate-50' : 'text-slate-700'}`}
                  >
                    <span>हिन्दी</span>
                    {currentLang === 'hi' && <span className="w-1.5 h-1.5 rounded-full bg-[#0F4C81]"></span>}
                  </button>
                  <button
                    onClick={() => { onLanguageChange('te'); setLangDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-slate-50 flex items-center justify-between ${currentLang === 'te' ? 'text-[#0F4C81] font-bold bg-slate-50' : 'text-slate-700'}`}
                  >
                    <span>తెలుగు</span>
                    {currentLang === 'te' && <span className="w-1.5 h-1.5 rounded-full bg-[#0F4C81]"></span>}
                  </button>
                </div>
              )}
            </div>

            {/* Help Button */}
            <Link
              href="/#help"
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-[#0F4C81] flex items-center space-x-1"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
              <span>Help</span>
            </Link>

            {/* Login / Profile Button */}
            {activeRole ? (
              <div className="flex items-center space-x-2">
                <Link
                  href={`/${activeRole}`}
                  className="px-3.5 py-1.5 bg-[#0F4C81] hover:bg-[#0A2540] text-white font-semibold text-xs rounded-md shadow-2xs flex items-center space-x-1.5 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span className="capitalize">{activeRole} Portal</span>
                </Link>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="text-[11px] font-semibold text-rose-600 hover:underline px-2 py-1"
                  >
                    Logout
                  </button>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-1.5 bg-[#0F4C81] hover:bg-[#0A2540] text-white font-semibold text-xs rounded-md shadow-2xs flex items-center space-x-1.5 transition-colors"
              >
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>Login / Role Selection</span>
              </Link>
            )}

          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-md"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-2 text-left animate-in fade-in">
          {navLinks.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              onClick={() => handleNavClick(link)}
              className="block px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-md"
            >
              {link.label}
            </Link>
          ))}

          <div className="pt-2 border-t border-slate-200 flex flex-col space-y-2">
            <div className="flex justify-between items-center px-3 py-1">
              <span className="text-xs font-semibold text-slate-600">Language:</span>
              <div className="flex space-x-1">
                <button onClick={() => onLanguageChange('en')} className={`px-2 py-0.5 text-xs font-bold rounded ${currentLang === 'en' ? 'bg-[#0F4C81] text-white' : 'bg-slate-100'}`}>EN</button>
                <button onClick={() => onLanguageChange('hi')} className={`px-2 py-0.5 text-xs font-bold rounded ${currentLang === 'hi' ? 'bg-[#0F4C81] text-white' : 'bg-slate-100'}`}>HI</button>
                <button onClick={() => onLanguageChange('te')} className={`px-2 py-0.5 text-xs font-bold rounded ${currentLang === 'te' ? 'bg-[#0F4C81] text-white' : 'bg-slate-100'}`}>TE</button>
              </div>
            </div>

            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center px-4 py-2 bg-[#0F4C81] text-white font-bold text-xs rounded-md"
            >
              Login / Select Role
            </Link>
          </div>
        </div>
      )}

    </header>
  );
};
