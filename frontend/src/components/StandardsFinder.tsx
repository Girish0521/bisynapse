'use client';

import React, { useState } from 'react';
import { Search, BookOpen, ArrowRight } from 'lucide-react';
import { StandardResult, Language } from '@/lib/types';

import { fetchStandardsSearch } from '@/lib/apiClient';

interface StandardsFinderProps {
  currentLang: Language;
  onSelectStandard: (standard: StandardResult) => void;
  onSendToChat: (query: string) => void;
}

export const StandardsFinder: React.FC<StandardsFinderProps> = ({
  onSelectStandard,
  onSendToChat
}) => {
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [material, setMaterial] = useState('');
  const [industry, setIndustry] = useState('');
  const [filteredResults, setFilteredResults] = useState<StandardResult[]>([]);
  const [searchNotice, setSearchNotice] = useState('Enter product details to search. Results require verification against current BIS publications.');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setFilteredResults([]);
    setSearchNotice('');

    try {
      const res = await fetchStandardsSearch({ productName, category, material, industry });
      if (res && Array.isArray(res.standards) && res.standards.length > 0) {
        setFilteredResults(res.standards);
        setSearchNotice('Candidate records from the prototype backend. Applicability and mandatory certification require official verification.');
      } else {
        setSearchNotice('No candidate records found. Add more product details or consult the official BIS catalogue.');
      }
    } catch (err) {
      console.warn('Standards search API unavailable:', err);
      setSearchNotice('Search is unavailable or the backend is not configured. No recommendations were produced.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <section id="standards" className="py-12 bg-slate-50 border-t border-slate-200 scroll-mt-20 text-left font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="border-b border-slate-200 pb-4 mb-8">
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded bg-blue-100 text-[#0F4C81] text-xs font-bold mb-2">
            <Search className="w-3.5 h-3.5" />
            <span>Search BIS Standards, Products & Services</span>
          </div>
          <h2 className="text-2xl font-black text-[#0A2540]">
            Indian Standards Search Engine
          </h2>
          <p className="text-xs text-slate-600">
            Specify technical product specifications, material composition and industry parameters to search matching Indian Standards (IS).
          </p>
        </div>

        {/* Search Panel */}
        <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-2xs mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="standard-product" className="block text-xs font-bold text-slate-700 mb-1">
                  Product Name / Keyword
                </label>
                <input
                  type="text"
                  id="standard-product"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. Electric Kettle, Solar PV"
                  className="w-full bg-slate-50 text-slate-900 px-3 py-2 rounded border border-slate-300 text-xs focus:ring-2 focus:ring-[#0F4C81] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="standard-category" className="block text-xs font-bold text-slate-700 mb-1">
                  Product Category
                </label>
                <select
                  id="standard-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 px-3 py-2 rounded border border-slate-300 text-xs focus:ring-2 focus:ring-[#0F4C81] focus:outline-none"
                >
                  <option value="">All Categories</option>
                  <option value="Electrical">Electrical & Electronics</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Jewellery">Jewellery & Precious Metals</option>
                  <option value="Solar">Solar & Renewable Energy</option>
                  <option value="Food">Food & Agriculture</option>
                  <option value="Civil">Civil & Steel</option>
                </select>
              </div>

              <div>
                <label htmlFor="standard-material" className="block text-xs font-bold text-slate-700 mb-1">
                  Material Composition
                </label>
                <input
                  type="text"
                  id="standard-material"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  placeholder="e.g. Stainless Steel, Silicon, 22K Gold"
                  className="w-full bg-slate-50 text-slate-900 px-3 py-2 rounded border border-slate-300 text-xs focus:ring-2 focus:ring-[#0F4C81] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="standard-industry" className="block text-xs font-bold text-slate-700 mb-1">
                  Industry / Sector
                </label>
                <input
                  type="text"
                  id="standard-industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. MSME, Electronics"
                  className="w-full bg-slate-50 text-slate-900 px-3 py-2 rounded border border-slate-300 text-xs focus:ring-2 focus:ring-[#0F4C81] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSearching}
                className="px-5 py-2.5 bg-[#0F4C81] hover:bg-[#0A2540] text-white font-bold text-xs rounded shadow-2xs flex items-center space-x-2"
              >
                <Search className="w-4 h-4 text-amber-400" />
                <span>{isSearching ? 'Searching...' : 'Search BIS Standards'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="font-bold text-sm text-[#0A2540]">
              Search Results ({filteredResults.length} Standards Found)
            </h3>
            <span className="text-xs text-slate-500">Prototype search</span>
          </div>

          {searchNotice && <p role="status" className="text-sm text-slate-600">{searchNotice}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredResults.map((std, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg p-5 border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#0F4C81] font-mono text-xs bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {std.number}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-100 text-amber-900 border border-amber-300">
                      {std.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm">{std.title}</h4>
                  <p className="text-xs font-semibold text-slate-500">{std.isDemo ? 'Unverified prototype example' : 'Captured BIS manual metadata'}</p>
                  <p className="text-xs text-slate-600"><strong>Scope:</strong> {std.whyApplies}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => onSelectStandard(std)}
                    className="font-semibold text-[#0F4C81] hover:underline flex items-center space-x-1"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>View Standard Details</span>
                  </button>

                  <button
                    onClick={() => onSendToChat(`Explain certification requirements for ${std.number}: ${std.title}`)}
                    className="px-3 py-1.5 bg-[#0A2540] hover:bg-slate-800 text-white rounded text-xs font-bold flex items-center space-x-1"
                  >
                    <span>Ask BISynapse</span>
                    <ArrowRight className="w-3 h-3 text-amber-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
