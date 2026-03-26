import React from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import CodeBlock from '../components/CodeBlock';
import SuggestionCard from '../components/SuggestionCard';

const MetricCard = ({ label, value, subtext, color }) => {
  const colorMap = {
    emerald: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400',
    purple: 'bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20 text-purple-700 dark:text-purple-400',
    blue: 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400',
    amber: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400',
    rose: 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400'
  };

  return (
    <div className={`p-5 rounded-2xl border ${colorMap[color]} shadow-sm flex flex-col justify-center transition-transform hover:scale-105 duration-300`}>
      <span className="text-sm font-bold opacity-80 mb-1">{label}</span>
      <span className="text-3xl font-black mb-1">{value}</span>
      <span className="text-xs font-semibold opacity-70 uppercase tracking-widest">{subtext}</span>
    </div>
  );
};

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  if (!location.state || !location.state.result) {
    return <Navigate to="/" replace />;
  }

  const { result, originalCode, language, model } = location.state;

  const cleanOriginal = originalCode ? originalCode.replace(/\r\n/g, '\n') : '';
  let cleanImproved = result?.improved_code ? result.improved_code.replace(/\r\n/g, '\n') : '';
  cleanImproved = cleanImproved.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim();

  const getMaintainabilityText = (score) => {
    if (score >= 8) return 'High';
    if (score >= 5) return 'Medium';
    return 'Low';
  };

  const getComplexityText = (score) => {
    if (score <= 5) return 'Low (Good)';
    if (score <= 10) return 'Moderate';
    return 'High (Refactor)';
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col h-full relative">
      {/* Decorative background blobs */}
      <div className="fixed top-0 left-0 w-96 h-96 rounded-full bg-blue-500/10 blur-[100px] pointer-events-none z-[-1]"></div>
      <div className="fixed bottom-0 right-0 w-96 h-96 rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none z-[-1]"></div>

      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-gray-200/50 dark:border-white/10 pb-6 mt-4">
        <div className="mb-6 md:mb-0">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 mb-3 tracking-tight">Review Results</h1>
          <div className="flex gap-3 text-sm">
            <span className="px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-gray-200/50 dark:border-white/5 text-gray-700 dark:text-gray-300 font-semibold flex items-center">
              <span className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></span>
              {language}
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-gray-200/50 dark:border-white/5 text-gray-700 dark:text-gray-300 font-semibold flex items-center">
              <span className="w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
              {model}
            </span>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={() => navigate('/')}
            className="flex-1 md:flex-none px-5 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all font-semibold shadow-sm hover:shadow active:scale-[0.98]"
          >
            Review Another
          </button>
          <button
            onClick={() => navigate('/history')}
            className="flex-1 md:flex-none px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all font-semibold shadow-lg shadow-indigo-500/20 active:scale-[0.98]"
          >
            View History
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-10 pb-10">
        
        {result.metrics && (
          <section className="animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
            <div className="flex items-center mb-5">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center mr-3 border border-blue-200/50 dark:border-blue-500/20">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Complexity Metrics
              </h2>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard 
                label="Maintainability" 
                value={`${result.metrics.maintainability_score}/10`} 
                subtext={getMaintainabilityText(result.metrics.maintainability_score)} 
                color={result.metrics.maintainability_score >= 8 ? 'emerald' : result.metrics.maintainability_score >= 5 ? 'amber' : 'rose'} 
              />
              <MetricCard 
                label="Cyclomatic Complexity" 
                value={result.metrics.cyclomatic_complexity} 
                subtext={getComplexityText(result.metrics.cyclomatic_complexity)} 
                color={result.metrics.cyclomatic_complexity <= 5 ? 'emerald' : result.metrics.cyclomatic_complexity <= 10 ? 'amber' : 'rose'} 
              />
              <MetricCard 
                label="Functions" 
                value={result.metrics.number_of_functions} 
                subtext="Total logical blocks" 
                color="blue" 
              />
              <MetricCard 
                label="Lines of Code" 
                value={result.metrics.lines_of_code} 
                subtext="Analyzed total" 
                color="purple" 
              />
            </div>
          </section>
        )}

        <section className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center mb-5">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-500/10 flex items-center justify-center mr-3 border border-rose-200/50 dark:border-rose-500/20">
              <svg className="w-5 h-5 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Suggestions <span className="text-gray-400 dark:text-gray-500 font-medium ml-1">({result.suggestions?.length || 0})</span>
            </h2>
          </div>
          
          {result.suggestions && result.suggestions.length > 0 ? (
            <div className="grid gap-4">
              {result.suggestions.map((suggestion, idx) => (
                <SuggestionCard key={idx} suggestion={suggestion} />
              ))}
            </div>
          ) : (
             <div className="p-8 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 text-emerald-800 dark:text-emerald-300 rounded-3xl border border-emerald-100 dark:border-emerald-800/20 flex flex-col items-center text-center shadow-sm">
              <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-sm flex items-center justify-center mb-4 border border-emerald-100 dark:border-emerald-800/30">
                <span className="text-4xl">🎉</span>
              </div>
              <h3 className="font-bold text-xl mb-2 text-emerald-900 dark:text-emerald-400">Perfect Execution!</h3>
              <p className="max-w-md">Our AI analysis didn't find any vulnerabilities, bugs, or style issues with your code. Great job!</p>
            </div>
          )}
        </section>

        <section className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center mb-5">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center mr-3 border border-indigo-200/50 dark:border-indigo-500/20">
              <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Code Review
            </h2>
          </div>
          
          <div className="flex flex-col xl:flex-row gap-6">
            <CodeBlock code={cleanOriginal} language={language} title="Original Code" />
            <CodeBlock code={cleanImproved} language={language} title="Optimized Code" />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Results;
