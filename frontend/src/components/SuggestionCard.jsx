import React from 'react';

const SuggestionCard = ({ suggestion }) => {
  return (
    <div className="bg-white dark:bg-[#252526] p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-200/50 dark:border-white/5 mb-4 transition-all hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-500/30 group">
      <div className="flex flex-col sm:flex-row items-start relative">
        <div className="absolute top-0 right-0 p-2 sm:hidden text-xs font-bold text-gray-400">
          Line {suggestion.line || '?'}
        </div>
        
        <div className="flex-shrink-0 flex flex-col items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-rose-100 to-rose-200 dark:from-rose-500/10 dark:to-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-sm shadow-inner dark:shadow-rose-500/10 mb-4 sm:mb-0 hidden sm:flex border border-rose-200/50 dark:border-rose-500/20">
          <span className="text-[10px] uppercase font-bold tracking-widest opacity-70 mb-0.5">Line</span>
          <span className="text-lg leading-none">{suggestion.line || '?'}</span>
        </div>

        <div className="sm:ml-5 flex-grow w-full">
          <div className="mb-4">
            <h4 className="text-sm font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-2 flex items-center">
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Issue Detected
            </h4>
            <p className="text-gray-800 dark:text-gray-200 text-base mb-1 leading-relaxed">
              {suggestion.issue}
            </p>
          </div>
          
          <div className="bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl p-4 border border-emerald-100 dark:border-emerald-500/20 transition-colors group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20">
            <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2 flex items-center">
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Suggested Fix
            </h4>
            <p className="text-gray-900 dark:text-gray-100 text-sm font-mono whitespace-pre-wrap overflow-x-auto leading-relaxed">
              {suggestion.fix}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuggestionCard;
