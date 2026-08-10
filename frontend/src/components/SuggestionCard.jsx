import React from 'react';

const SuggestionCard = ({ suggestion }) => {
  return (
    <div className="bg-white dark:bg-[#111722] p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-[#202938] mb-3 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start relative">
        <div className="flex-shrink-0 flex items-center justify-center px-2.5 py-1 rounded-md bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] font-mono text-xs font-semibold mb-3 sm:mb-0 sm:mr-4">
          Line {suggestion.line || '?'}
        </div>

        <div className="flex-grow w-full">
          <div className="mb-3">
            <h4 className="text-xs font-bold text-[#EF4444] uppercase tracking-wider mb-1 flex items-center">
              <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Issue
            </h4>
            <p className="text-slate-800 dark:text-[#F1F5F9] text-xs sm:text-sm leading-relaxed font-normal">
              {suggestion.issue}
            </p>
          </div>
          
          <div className="bg-[#22C55E]/10 rounded-lg p-3 border border-[#22C55E]/30">
            <h4 className="text-xs font-bold text-[#22C55E] uppercase tracking-wider mb-1 flex items-center">
              <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Fix
            </h4>
            <p className="text-slate-200 text-xs font-mono whitespace-pre-wrap overflow-x-auto leading-relaxed">
              {suggestion.fix}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuggestionCard;
