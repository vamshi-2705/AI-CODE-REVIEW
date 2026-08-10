import React from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import CodeBlock from '../components/CodeBlock';
import SuggestionCard from '../components/SuggestionCard';

const MetricCard = ({ label, value, subtext, color }) => {
  const colorMap = {
    emerald: 'bg-emerald-950/20 border-emerald-800/40 text-emerald-400',
    purple: 'bg-indigo-950/20 border-indigo-800/40 text-indigo-400',
    blue: 'bg-sky-950/20 border-sky-800/40 text-sky-400',
    amber: 'bg-amber-950/20 border-amber-800/40 text-amber-400',
    rose: 'bg-rose-950/20 border-rose-800/40 text-rose-400'
  };

  return (
    <div className={`p-4 rounded-md border ${colorMap[color]} shadow-sm flex flex-col justify-center`}>
      <span className="text-xs font-medium opacity-80 mb-1">{label}</span>
      <span className="text-2xl font-bold mb-0.5">{value}</span>
      <span className="text-[10px] font-mono opacity-70 uppercase">{subtext}</span>
    </div>
  );
};

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
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
    <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col h-full">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 dark:border-slate-800 pb-4 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Review Results</h1>
          <div className="flex gap-2 text-xs mt-1.5">
            <span className="px-2.5 py-0.5 rounded bg-slate-100 dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-mono flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-1.5"></span>
              {language}
            </span>
            <span className="px-2.5 py-0.5 rounded bg-slate-100 dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-mono flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
              {model}
            </span>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={() => navigate('/')}
            className="flex-1 md:flex-none px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-xs font-medium"
          >
            Review Another
          </button>
          <button
            onClick={() => navigate('/history')}
            className="flex-1 md:flex-none px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-colors text-xs font-medium shadow-sm"
          >
            View History
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-8 pb-8">
        
        {result.metrics && (
          <section>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Complexity Metrics
            </h2>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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

        <section>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
            Suggestions ({result.suggestions?.length || 0})
          </h2>
          
          {result.suggestions && result.suggestions.length > 0 ? (
            <div className="grid gap-3">
              {result.suggestions.map((suggestion, idx) => (
                <SuggestionCard key={idx} suggestion={suggestion} />
              ))}
            </div>
          ) : (
             <div className="p-6 bg-emerald-950/20 text-emerald-300 rounded-md border border-emerald-800/30 flex flex-col items-center text-center">
              <h3 className="font-semibold text-sm mb-1 text-emerald-400">Clean Code Execution</h3>
              <p className="max-w-md text-xs text-slate-400">No major vulnerabilities, bugs, or style issues were detected during this review.</p>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
            Code Comparison
          </h2>
          
          <div className="flex flex-col xl:flex-row gap-4">
            <CodeBlock code={cleanOriginal} language={language} title="Original Code" />
            <CodeBlock code={cleanImproved} language={language} title="Optimized Code" />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Results;
