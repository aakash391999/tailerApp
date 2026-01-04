import React, { useState } from 'react';
import { getStyleAdvice } from '../services/geminiService';
import { Sparkles, Send } from 'lucide-react';

const StyleAdvisor: React.FC = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResponse('');
    const advice = await getStyleAdvice(query);
    setResponse(advice);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
        <div className="p-8 border-b border-slate-700 bg-slate-900">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Sparkles className="h-8 w-8 text-gold-500" />
            <h1 className="text-3xl font-serif font-bold text-white">Elite Style Advisor</h1>
          </div>
          <p className="text-gray-400 text-center">
            Not sure what color suits you? Ask our AI expert for advice on fabrics, combinations, and trends.
          </p>
        </div>

        <div className="p-8">
          <div className="space-y-4 min-h-[200px] mb-6">
            {!response && !loading && (
              <div className="text-center text-gray-500 mt-10">
                <p>Try asking: "What tie goes with a navy blue suit?"</p>
                <p className="mt-2">or "Trending kurta styles for weddings?"</p>
              </div>
            )}
            
            {loading && (
               <div className="flex flex-col items-center justify-center space-y-4 py-8">
                 <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
                 <p className="text-gold-500 font-medium animate-pulse">Consulting the fashion archives...</p>
               </div>
            )}

            {response && (
              <div className="bg-slate-700 p-6 rounded-xl border-l-4 border-gold-500 text-gray-200 leading-relaxed shadow-inner">
                {response}
              </div>
            )}
          </div>

          <form onSubmit={handleAsk} className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about your next outfit..."
              className="w-full bg-slate-900 text-white border border-slate-600 rounded-full py-4 pl-6 pr-14 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 top-2 bg-gold-500 hover:bg-gold-600 text-slate-900 p-2 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StyleAdvisor;