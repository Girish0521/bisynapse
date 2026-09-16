'use client';

import React, { useState } from 'react';
import { Award, CheckCircle2, FileText, FlaskConical, Building, ShieldCheck, ArrowRight, Layers } from 'lucide-react';
import { Language } from '@/lib/types';

interface CertificationGuideProps {
  currentLang: Language;
  onSendToChat: (query: string) => void;
}

export const CertificationGuide: React.FC<CertificationGuideProps> = ({
  onSendToChat
}) => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    { number: '01', title: 'Identify Indian Standard', desc: 'Locate exact IS number for product category.', detail: 'Use BISynapse Standards Search to identify relevant specifications (e.g. IS 302 Part 2 for kettles).', docs: ['Technical datasheet', 'Raw material specs'] },
    { number: '02', title: 'Check Mandatory QCO Status', desc: 'Verify Quality Control Orders.', detail: 'Mandatory QCO items require a valid BIS licence before manufacturing or selling under BIS Act 2016.', docs: ['Gazette notification', 'Ministry circular'] },
    { number: '03', title: 'Select Certification Scheme', desc: 'ISI Mark (Scheme I) or CRS (Scheme II).', detail: 'Scheme I (ISI) requires factory inspection + lab testing. Scheme II (CRS) relies on type test reports.', docs: ['Scheme guidelines', 'Fee schedule'] },
    { number: '04', title: 'Prepare Factory Documents', desc: 'Quality control manual & calibration records.', detail: 'MSMEs and Startups receive 50% concession on fees when providing valid Udyam registration.', docs: ['Udyam MSME Certificate', 'Test equipment calibration'] },
    { number: '05', title: 'Product Sample Testing', desc: 'Submit samples to BIS recognized lab.', detail: 'Samples undergo electrical safety, mechanical endurance, and chemical purity assays.', docs: ['Test Request (TR) form', 'LIMS tracking ID'] },
    { number: '06', title: 'Submit e-BIS Application', desc: 'File application on ManakOnline portal.', detail: 'File online on manakonline.in. Application is assigned to designated BIS Branch Office.', docs: ['ManakOnline application ref', 'Fee payment receipt'] },
    { number: '07', title: 'Factory Inspection Audit', desc: 'BIS Inspecting Officer visits premises.', detail: 'Officer inspects raw material storage, line quality checks, and draws independent samples.', docs: ['Inspection report', 'Sample sealing slip'] },
    { number: '08', title: 'Licence Grant Decision', desc: 'Grant of CM/L licence number.', detail: 'You are authorized to apply the BIS Standard Mark (ISI / CRS mark with CM/L number) on packaging.', docs: ['Official BIS Licence Document', 'Stamping approval'] },
    { number: '09', title: 'Surveillance & Renewal', desc: 'Periodic factory audits & sample testing.', detail: 'BIS conducts periodic audits and market sample surveillance. Annual licence renewal is required.', docs: ['Quality logbooks', 'Annual renewal receipts'] }
  ];

  return (
    <section id="certification" className="py-12 bg-white border-t border-slate-200 scroll-mt-20 font-sans text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="border-b border-slate-200 pb-4 mb-8">
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded bg-blue-100 text-[#0F4C81] text-xs font-bold mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>Visual Certification Stepper Workflow</span>
          </div>
          <h2 className="text-2xl font-black text-[#0A2540]">
            BIS Certification Journey
          </h2>
          <p className="text-xs text-slate-600">
            End-to-end 9-stage compliance roadmap for Indian manufacturers, MSMEs, startups and foreign exporters.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-2 max-h-[500px] overflow-y-auto pr-2">
            {steps.map((step, idx) => {
              const isActive = activeStep === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`p-3.5 rounded border transition-colors cursor-pointer flex items-center space-x-3 ${isActive ? 'bg-[#0A2540] text-white border-[#0A2540] shadow-2xs' : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'}`}
                >
                  <span className={`w-7 h-7 rounded flex items-center justify-center font-bold text-xs shrink-0 ${isActive ? 'bg-amber-400 text-[#0A2540]' : 'bg-slate-200 text-slate-700'}`}>
                    {step.number}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs truncate">{step.title}</h4>
                    <p className={`text-[11px] truncate ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-7">
            <div className="bg-slate-50 rounded-lg p-6 border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between h-full">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <span className="text-xs font-bold text-[#0F4C81] uppercase">Stage {steps[activeStep].number} of 09</span>
                  <h3 className="text-lg font-bold text-[#0A2540]">{steps[activeStep].title}</h3>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">{steps[activeStep].detail}</p>

                <div className="bg-white p-3.5 rounded border border-slate-200 space-y-1.5 text-xs">
                  <span className="font-bold text-[#0A2540] uppercase block text-[10px]">Required Checklist & Documents:</span>
                  <ul className="space-y-1">
                    {steps[activeStep].docs.map((doc, idx) => (
                      <li key={idx} className="flex items-center space-x-2 text-slate-700 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-xs">
                <button
                  disabled={activeStep === 0}
                  onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded font-bold text-slate-700 disabled:opacity-40"
                >
                  ← Previous
                </button>
                <button
                  disabled={activeStep === steps.length - 1}
                  onClick={() => setActiveStep(prev => Math.min(steps.length - 1, prev + 1))}
                  className="px-3 py-1.5 bg-[#0F4C81] text-white rounded font-bold disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
