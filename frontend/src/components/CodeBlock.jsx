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
    <div className="flex-1 min-w-0 bg-[#0B0F15] rounded-xl overflow-hidden border border-slate-200 dark:border-[#202938] flex flex-col shadow-sm">
      <div className="bg-slate-100 dark:bg-[#0D121B] px-3.5 py-2 flex justify-between items-center border-b border-slate-200 dark:border-[#202938]">
        <span className="text-xs font-mono text-slate-700 dark:text-[#F1F5F9] font-medium uppercase">{title}</span>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-slate-200 dark:bg-[#111722] hover:bg-slate-300 dark:hover:bg-[#0D121B] text-slate-700 dark:text-[#94A3B8] border border-transparent dark:border-[#202938] transition-colors text-xs font-mono"
          title="Copy code"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-[#22C55E]" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <div className="flex-1 overflow-auto bg-[#0B0F15] text-xs relative h-[420px] code-block-scrollbar">
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
