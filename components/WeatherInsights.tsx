
import React from 'react';
import { Sparkles } from 'lucide-react';

interface WeatherInsightsProps {
  insights: string | null;
  loading: boolean;
  isDarkMode: boolean;
}

const WeatherInsights: React.FC<WeatherInsightsProps> = ({ insights, loading, isDarkMode }) => {
  return (
    <div className={`rounded-3xl border p-6 relative overflow-hidden transition-all duration-500 ${
      isDarkMode 
        ? 'bg-slate-900/50 border-slate-800 text-slate-300' 
        : 'bg-white border-slate-200 shadow-sm text-slate-600'
    }`}>
      <div className="flex items-center gap-2 mb-4">
        <div className={`${isDarkMode ? 'bg-amber-500/10' : 'bg-amber-500/20'} p-1.5 rounded-lg`}>
          <Sparkles className="w-4 h-4 text-amber-500" />
        </div>
        <h3 className={`text-[10px] font-black tracking-[0.2em] uppercase ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          WeatherCatch Intelligence
        </h3>
      </div>
      
      {loading ? (
        <div className="space-y-3">
          <div className={`h-4 rounded w-3/4 animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}></div>
          <div className={`h-4 rounded w-full animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}></div>
          <div className={`h-4 rounded w-5/6 animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}></div>
        </div>
      ) : insights ? (
        <div className={`text-sm leading-relaxed whitespace-pre-line font-medium italic`}>
          {insights}
        </div>
      ) : (
        <p className="text-sm text-slate-400 italic font-medium">Synthesizing local meteorological variables...</p>
      )}
      
      <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-3xl transition-opacity duration-700 ${
        isDarkMode ? 'bg-amber-500/5 opacity-100' : 'bg-amber-500/10 opacity-50'
      }`}></div>
    </div>
  );
};

export default WeatherInsights;
