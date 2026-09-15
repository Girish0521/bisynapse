'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, Send, RotateCcw, Camera, BookOpen, ExternalLink, CheckCircle2, User, Info, Lightbulb, Shield } from 'lucide-react';
import { ChatMessage, Language } from '@/lib/types';
import { generateAssistantResponse } from '@/lib/mockAiLogic';
import { translations } from '@/lib/translations';
import { fetchChatResponse } from '@/lib/apiClient';

interface AiAssistantProps {
  currentLang: Language;
  onOpenScanner?: () => void;
  externalQuery?: string;
  externalVisualContext?: any;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({
  currentLang,
  onOpenScanner,
  externalQuery,
  externalVisualContext
}) => {
  const t = translations[currentLang];

  const initialMessages: ChatMessage[] = [
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: 'Namaste! Welcome to **BISynapse Assistant**, your official conversational guide for Indian Standards, BIS certification schemes, laboratory testing facilities, gold hallmarking, and consumer protection. Ask any technical compliance question in plain language.',
      timestamp: 'BIS Portal',
      confidence: 0.99,
      isPrototypeNotice: true,
      followUps: [
        'What BIS standard applies to my product?',
        'How can I verify a BIS licence?',
        'What are the certification requirements?',
        'How do I check a hallmark?'
      ]
    }
  ];

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    'What BIS standard applies to my product?',
    'How can I verify a BIS licence?',
    'What are the certification requirements?',
    'How do I check a hallmark?'
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (externalQuery) {
      handleSendQuery(externalQuery);
    } else if (externalVisualContext) {
      handleSendQuery(`I scanned product: ${externalVisualContext.productName || 'Device'}. Standard: ${externalVisualContext.standardNumber || 'IS 302-2-3'}. Licence: ${externalVisualContext.licenceNumber || externalVisualContext.huid || 'CM/L-8400012395'}. Explain compliance and next steps.`, externalVisualContext);
    }
  }, [externalQuery, externalVisualContext]);

  const handleSendQuery = async (textToSend?: string, visualCtx?: any) => {
    const queryText = textToSend || inputText;
    if (!queryText.trim() && !visualCtx) return;

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsLoading(true);

    try {
      const response = await fetchChatResponse(queryText, visualCtx, { language: currentLang });
      setMessages((prev) => [...prev, response]);
    } catch (err) {
      console.warn('Backend chat API fallback to local engine:', err);
      const fallback = generateAssistantResponse(queryText, visualCtx);
      setMessages((prev) => [...prev, fallback]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages(initialMessages);
    setInputText('');
  };

  return (
    <section id="assistant" className="py-12 bg-white border-t border-slate-200 scroll-mt-20 font-sans text-left">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded bg-blue-100 border border-blue-200 text-[#0F4C81] text-xs font-bold mb-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>Official Conversational Gateway</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0A2540] tracking-tight">
              BISynapse Assistant
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Conversational intelligence for standards, QCOs, licensing pathways & laboratory verification
            </p>
          </div>

          <button
            onClick={handleResetChat}
            className="px-3 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center space-x-1.5 transition-colors shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.newChat}</span>
          </button>
        </div>

        {/* Chat Window */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px] max-h-[80vh]">
          
          {/* Top Bar */}
          <div className="bg-[#0A2540] text-white px-5 py-3 flex items-center justify-between border-b border-slate-800 text-xs">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded bg-[#0F4C81] text-amber-400 flex items-center justify-center font-bold border border-blue-900">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-white">BISynapse Conversational Engine</span>
                <span className="text-[10px] text-slate-300 block">Source-Backed Knowledge Pipeline • Multilingual</span>
              </div>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
              Official Reference Verified
            </span>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-8 h-8 rounded bg-[#0F4C81] text-amber-400 flex items-center justify-center shrink-0 border border-blue-900 shadow-2xs mt-0.5">
                    <Shield className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[92%] sm:max-w-[82%] space-y-3 ${msg.sender === 'user' ? 'bg-[#0F4C81] text-white rounded-lg px-4 py-3 text-xs sm:text-sm shadow-2xs' : 'bg-white border border-slate-200 text-slate-900 rounded-lg p-4 sm:p-5 shadow-2xs'}`}>
                  
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pb-1 border-b border-slate-100">
                    <span className="font-bold text-slate-500">{msg.sender === 'user' ? 'You' : 'BISynapse Assistant'} • {msg.timestamp}</span>
                    {msg.confidence && (
                      <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold border border-emerald-200">
                        Confidence: {Math.round(msg.confidence * 100)}%
                      </span>
                    )}
                  </div>

                  <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-line font-medium text-slate-800">
                    {msg.text}
                  </div>

                  {/* Standards Card */}
                  {msg.applicableStandards && msg.applicableStandards.length > 0 && (
                    <div className="bg-slate-50 rounded p-3 border border-slate-200 space-y-2 text-xs">
                      <span className="font-bold text-[#0A2540] uppercase tracking-wider block flex items-center space-x-1">
                        <BookOpen className="w-3.5 h-3.5 text-[#0F4C81]" />
                        <span>Recommended Indian Standards</span>
                      </span>

                      <div className="space-y-2">
                        {msg.applicableStandards.map((st, idx) => (
                          <div key={idx} className="bg-white p-3 rounded border border-slate-200 text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#0F4C81] font-mono text-xs">
                                {st.number}
                              </span>
                              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-100 text-amber-900 border border-amber-300">
                                {st.status}
                              </span>
                            </div>
                            <p className="font-bold text-slate-900">{st.title}</p>
                            <p className="text-[11px] text-slate-600">{st.whyApplies}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Next Steps */}
                  {msg.nextSteps && msg.nextSteps.length > 0 && (
                    <div className="bg-blue-50/70 rounded p-3 border border-blue-200 space-y-2 text-xs">
                      <span className="font-bold text-[#0F4C81] uppercase block">Recommended Next Steps:</span>
                      <ul className="space-y-1 pt-0.5">
                        {msg.nextSteps.map((step, idx) => (
                          <li key={idx} className="flex items-start space-x-2 text-slate-800 text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#0F4C81] shrink-0 mt-0.5" />
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Sources */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Official BIS Sources:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {msg.sources.map((src, idx) => (
                          <a
                            key={idx}
                            href={src.url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 bg-slate-50 rounded border border-slate-200 hover:border-[#0F4C81] text-left transition-colors block text-xs"
                          >
                            <div className="flex items-center justify-between text-[#0F4C81] font-bold text-[11px]">
                              <span className="truncate">{src.title}</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </div>
                            {src.clause && <span className="text-[10px] text-slate-500 block">{src.clause}</span>}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Follow ups */}
                  {msg.followUps && msg.followUps.length > 0 && (
                    <div className="pt-1 flex flex-wrap gap-1.5">
                      {msg.followUps.map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendQuery(prompt)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-[#0F4C81] text-[11px] font-semibold rounded border border-slate-200 transition-colors text-left flex items-center space-x-1"
                        >
                          <Lightbulb className="w-3 h-3 text-amber-500 shrink-0" />
                          <span>{prompt}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {msg.isPrototypeNotice && (
                    <div className="text-[10px] text-slate-500 pt-1 flex items-center space-x-1">
                      <Info className="w-3 h-3 text-amber-600 shrink-0" />
                      <span>{t.prototypeGuidance}</span>
                    </div>
                  )}

                </div>

                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded bg-[#0A2540] text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                    <User className="w-4 h-4 text-amber-400" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded bg-[#0F4C81] text-amber-400 flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4 animate-pulse" />
                </div>
                <div className="bg-white border border-slate-200 rounded p-3 text-xs text-slate-600 flex items-center space-x-2">
                  <div className="w-3.5 h-3.5 border-2 border-[#0F4C81] border-t-transparent rounded-full animate-spin"></div>
                  <span>Retrieving official BIS standards & QCO references...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Prompts quick row */}
          <div className="bg-slate-100 px-4 py-2 border-t border-slate-200 flex items-center space-x-2 overflow-x-auto">
            <span className="text-[10px] font-bold text-slate-500 uppercase shrink-0">Suggested:</span>
            {suggestedPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendQuery(prompt)}
                className="px-2.5 py-1 bg-white hover:bg-slate-200 text-slate-800 text-[11px] font-semibold rounded border border-slate-300 shrink-0 shadow-2xs"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Form Bar */}
          <div className="p-3 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendQuery();
              }}
              className="flex items-center space-x-2"
            >
              {onOpenScanner && (
                <button
                  type="button"
                  onClick={onOpenScanner}
                  className="p-2.5 rounded bg-slate-100 text-amber-600 hover:bg-amber-50 border border-slate-200 transition-colors shrink-0"
                  title="Open Scanner"
                >
                  <Camera className="w-4 h-4" />
                </button>
              )}

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask how BISynapse can help you..."
                className="flex-1 bg-slate-50 text-slate-900 px-3.5 py-2 rounded text-xs sm:text-sm border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F4C81] font-medium"
              />

              <button
                type="submit"
                disabled={!inputText.trim()}
                className="px-4 py-2 bg-[#0F4C81] hover:bg-[#0A2540] text-white font-bold text-xs rounded shadow-2xs disabled:opacity-40 flex items-center space-x-1 shrink-0"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>

      </div>
    </section>
  );
};
