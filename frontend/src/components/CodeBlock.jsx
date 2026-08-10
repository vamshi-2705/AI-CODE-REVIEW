import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy } from 'lucide-react';

const CodeBlock = ({ code, language, title }) => {
  const [copied, setCopied] = useState(false);

  const getLanguage = (lang) => {
    if (!lang) return 'javascript';
    const map = {
      'c++': 'cpp',
      'c#': 'csharp',
      'typescript': 'typescript',
      'javascript': 'javascript',
      'python': 'python',
      'java': 'java',
      'go': 'go',
      'rust': 'rust'
    };
    return map[lang.toLowerCase()] || lang.toLowerCase();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 min-w-0 bg-slate-950 rounded-md overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col shadow-sm">
      <div className="bg-slate-100 dark:bg-[#0d1117] px-3.5 py-2 flex justify-between items-center border-b border-slate-200 dark:border-slate-800">
        <span className="text-xs font-mono text-slate-700 dark:text-slate-300 font-medium uppercase">{title}</span>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors text-xs font-mono"
          title="Copy code"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <div className="flex-1 overflow-auto bg-slate-950 text-xs relative h-[420px] code-block-scrollbar">
        <SyntaxHighlighter
          language={getLanguage(language)}
          style={vscDarkPlus}
          customStyle={{ margin: 0, padding: '1rem', background: 'transparent' }}
          showLineNumbers={true}
          wrapLines={true}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default CodeBlock;
