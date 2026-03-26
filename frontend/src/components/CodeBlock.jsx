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
    <div className="flex-1 min-w-0 bg-[#1e1e1e] rounded-xl overflow-hidden border border-gray-200/50 dark:border-white/10 flex flex-col shadow-xl">
      <div className="bg-[#2d2d2d] px-4 py-3 flex justify-between items-center border-b border-black/50">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5 mr-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
          </div>
          <span className="text-xs font-mono text-gray-300 font-bold uppercase tracking-wider">{title}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-black/20 hover:bg-black/40 text-gray-400 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50 active:scale-95"
          title="Copy to clipboard"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          <span className="text-xs font-mono font-medium">{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <div className="flex-1 overflow-auto bg-[#1e1e1e] text-[13px] relative h-[450px] code-block-scrollbar">
        <SyntaxHighlighter
          language={getLanguage(language)}
          style={vscDarkPlus}
          customStyle={{ margin: 0, padding: '1.25rem', background: 'transparent' }}
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
