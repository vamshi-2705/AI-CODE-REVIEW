import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2, Sparkles, Code2, ArrowRightLeft, Copy, Check } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const MODELS = ['Groq', 'Gemini', 'OpenAI'];
const LANGUAGES = [
  'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 
  'C#', 'Go', 'Rust', 'Swift', 'Kotlin', 'PHP', 'Ruby', 'Dart'
];

const CodeConverter = () => {
  const [sourceCode, setSourceCode] = useState('');
  const [convertedCode, setConvertedCode] = useState('');
  const [targetLanguage, setTargetLanguage] = useState(LANGUAGES[0]);
  const [model, setModel] = useState(MODELS[0]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!convertedCode.trim()) return;
    navigator.clipboard.writeText(convertedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const syncTextareaScroll = (e) => {
    // Optional: sync scrolling between source and output if needed
  };

  const handleConvert = async () => {
    if (!sourceCode.trim()) {
      toast.error('Please enter the code you want to convert!');
      return;
    }

    setLoading(true);
    setConvertedCode('');

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${baseUrl}/convert/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ code: sourceCode, targetLanguage, model })
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          toast.error('Session expired or invalid. Please log in again.');
          window.location.href = '/login?expired=true';
          return;
        }
        throw new Error('Conversion failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let fullText = '';
      let buffer = '';

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; 

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.replace('data: ', '').trim();
              if (dataStr === '[DONE]') {
                done = true;
                break;
              }
              try {
                const dataJSON = JSON.parse(dataStr);
                if (dataJSON.error) {
                  toast.error(dataJSON.error);
                  fullText += `\n/* Error: ${dataJSON.error} */`;
                } else if (dataJSON.text) {
                  fullText += dataJSON.text;
                }
                
                // Real-time update
                // Strip markdown wrappers if they exist
                let cleanText = fullText;
                if (cleanText.startsWith('\`\`\`')) {
                   const split = cleanText.split('\n');
                   split.shift();
                   // If the stream is still going, don't chop the end yet safely unless it's done
                   cleanText = split.join('\n');
                }
                
                setConvertedCode(cleanText);
              } catch (e) {}
            }
          }
        }
      }
      
      // Final pass cleanup of markdown
      let finalCode = fullText;
      if (finalCode.startsWith('\`\`\`')) {
        const split = finalCode.split('\n');
        split.shift();
        if (split[split.length - 1].startsWith('\`\`\`')) {
          split.pop();
        }
        finalCode = split.join('\n');
      }
      setConvertedCode(finalCode);
      toast.success(`Code converted to ${targetLanguage}!`);

    } catch (err) {
      console.error(err);
      toast.error('Failed to convert code.');
      setConvertedCode('/* Error: Failed to process your request. Please try again. */');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#F1F5F9] tracking-tight flex items-center">
          <ArrowRightLeft className="w-5 h-5 mr-2.5 text-[#3B82F6]" />
          Code Converter
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-[#94A3B8] mt-1">
          Translate source code from any language into another target programming language.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-grow">
        
        {/* Left Pane - Source Code */}
        <div className="flex-1 flex flex-col bg-white dark:bg-[#111722] rounded-xl border border-slate-200 dark:border-[#202938] overflow-hidden min-h-[420px]">
          <div className="bg-slate-100 dark:bg-[#0D121B] px-3.5 py-2.5 border-b border-slate-200 dark:border-[#202938] flex items-center justify-between">
             <div className="flex items-center text-xs font-semibold text-slate-700 dark:text-[#F1F5F9]">
                <Code2 className="w-3.5 h-3.5 mr-1.5 opacity-70" /> Source Code
             </div>
             
             <div className="flex items-center space-x-2">
               <span className="text-[11px] text-slate-500 dark:text-[#64748B] font-mono">Auto-Detect</span>
             </div>
          </div>
          
          <div className="flex-1 relative w-full h-full p-0 m-0 bg-slate-950 dark:bg-[#0B0F15]">
             <textarea
               value={sourceCode}
               onChange={(e) => setSourceCode(e.target.value)}
               onScroll={syncTextareaScroll}
               placeholder="// Paste your original code here..."
               spellCheck="false"
               className="absolute inset-0 w-full h-full bg-transparent text-[#F1F5F9] font-mono text-xs p-3.5 outline-none resize-none placeholder-[#64748B]"
             />
          </div>
        </div>

        {/* Control Button Center Bar */}
        <div className="flex lg:flex-col items-center justify-center py-1 lg:py-0">
           <button 
             onClick={handleConvert}
             disabled={loading || !sourceCode.trim()}
             className={`p-3 rounded-lg flex items-center justify-center transition-colors border ${
               loading || !sourceCode.trim() 
                 ? 'bg-slate-100 dark:bg-[#0D121B] text-slate-400 dark:text-[#64748B] border-slate-300 dark:border-[#202938] cursor-not-allowed' 
                 : 'bg-[#3B82F6] hover:bg-[#2563EB] text-[#F1F5F9] border-[#3B82F6]/50 shadow-sm'
             }`}
             title="Convert Code"
           >
             {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRightLeft className="w-4 h-4" />}
           </button>
        </div>

        {/* Right Pane - Target Code */}
        <div className="flex-1 flex flex-col bg-white dark:bg-[#111722] rounded-xl border border-slate-200 dark:border-[#202938] overflow-hidden min-h-[420px]">
          <div className="bg-slate-100 dark:bg-[#0D121B] px-3.5 py-2 border-b border-slate-200 dark:border-[#202938] flex flex-wrap justify-between items-center gap-2">
             <div className="flex items-center">
                <span className="text-xs font-semibold text-slate-700 dark:text-[#94A3B8] mr-2">Target:</span>
                <select 
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="bg-slate-50 dark:bg-[#0B0F15] border border-slate-300 dark:border-[#202938] text-slate-900 dark:text-[#F1F5F9] text-xs font-medium rounded p-1 outline-none"
                  disabled={loading}
                >
                  {LANGUAGES.map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
             </div>
             
             <div className="flex items-center space-x-2">
                <select 
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="bg-slate-50 dark:bg-[#0B0F15] border border-slate-300 dark:border-[#202938] text-slate-700 dark:text-[#94A3B8] text-[11px] font-medium rounded p-1 outline-none"
                  disabled={loading}
                >
                  {MODELS.map(m => (
                    <option key={m} value={m}>
                      {m} {m === 'Groq' ? '(Fast)' : m === 'Gemini' ? '(Primary)' : '(Fallback)'}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleCopy}
                  disabled={!convertedCode.trim()}
                  className="flex items-center space-x-1 p-1 rounded bg-slate-200 dark:bg-[#0B0F15] hover:bg-slate-300 dark:hover:bg-[#111722] text-slate-700 dark:text-[#94A3B8] border border-transparent dark:border-[#202938] transition-colors disabled:opacity-40"
                  title="Copy code"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#22C55E]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
             </div>
          </div>
          
          <div className="flex-1 w-full h-full relative p-0 m-0 overflow-y-auto custom-scrollbar bg-slate-950 dark:bg-[#0B0F15]">
            {!convertedCode && !loading ? (
               <div className="absolute inset-0 flex items-center justify-center text-[#64748B] text-xs font-mono">
                  // Converted code output will appear here
               </div>
            ) : (
               <SyntaxHighlighter
                 language={targetLanguage.toLowerCase()}
                 style={vscDarkPlus}
                 customStyle={{ margin: 0, padding: '0.875rem', background: 'transparent', minHeight: '100%', fontSize: '12px' }}
                 wrapLines={true}
                 showLineNumbers={true}
               >
                 {convertedCode}
               </SyntaxHighlighter>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeConverter;
