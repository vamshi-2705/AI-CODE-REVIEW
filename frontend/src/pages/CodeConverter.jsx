import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2, Sparkles, Code2, ArrowRightLeft, Copy, Check } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const MODELS = ['Gemini', 'OpenAI'];
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
    <div className="flex flex-col min-h-[calc(100vh-8rem)] relative mx-auto w-full px-4 lg:px-8 py-6 max-w-[1600px]">
      
      {/* Header */}
      <div className="mb-8 text-center animate-fade-in-up z-20 relative">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900 dark:text-white tracking-tight flex items-center justify-center">
          <ArrowRightLeft className="w-10 h-10 mr-4 text-indigo-500 hidden sm:block" />
          Code <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 mx-2">Converter</span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium">
          Instantly translate your source code from any language into a different programming language.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-full flex-grow relative z-10 animate-fade-in-up transition-all delay-100">
        
        {/* Left Pane - Source Code */}
        <div className="flex-1 flex flex-col bg-white dark:bg-[#1e1e1e] rounded-3xl border border-gray-200 dark:border-white/10 shadow-xl overflow-hidden min-h-[500px] group">
          <div className="bg-gray-50 dark:bg-black/20 px-4 py-3 border-b border-gray-200 dark:border-white/5 flex items-center justify-between">
             <div className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                <Code2 className="w-4 h-4 mr-2" /> Original Code
             </div>
             
             <div className="flex items-center space-x-3">
               <span className="text-xs text-gray-500 font-medium">Auto-Detect</span>
             </div>
          </div>
          
          <div className="flex-1 relative w-full h-full p-0 m-0">
             <textarea
               value={sourceCode}
               onChange={(e) => setSourceCode(e.target.value)}
               onScroll={syncTextareaScroll}
               placeholder="// Paste your original code here..."
               spellCheck="false"
               className="absolute inset-0 w-full h-full bg-transparent text-gray-800 dark:text-gray-200 font-mono text-sm p-4 outline-none resize-none"
             />
          </div>
        </div>

        {/* Translation Controls Overlay */}
        <div className="lg:w-16 flex lg:flex-col items-center justify-center gap-4 py-2 lg:py-0 relative z-20">
           
           <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-gray-200 dark:border-white/10 flex items-center justify-center -my-3 lg:my-0 lg:-mx-8 z-30">
               <button 
                 onClick={handleConvert}
                 disabled={loading || !sourceCode.trim()}
                 className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                   loading || !sourceCode.trim() 
                     ? 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                     : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md hover:shadow-indigo-500/30'
                 }`}
                 title="Convert Code"
               >
                 {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRightLeft className="w-5 h-5" />}
               </button>
           </div>
        </div>

        {/* Right Pane - Target Code */}
        <div className="flex-1 flex flex-col bg-[#1e1e1e] rounded-3xl border border-gray-200 dark:border-white/10 shadow-xl overflow-hidden min-h-[500px]">
          <div className="bg-[#2d2d2d] px-4 py-3 border-b border-black/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
             <div className="flex items-center w-full sm:w-auto">
                <span className="text-sm font-semibold text-gray-300 mr-3">Target:</span>
                <select 
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="bg-black/30 border border-white/10 text-white text-sm font-medium rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-1.5 shadow-sm transition-all outline-none"
                  disabled={loading}
                >
                  {LANGUAGES.map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
             </div>
             
             <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                <select 
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="bg-black/30 border border-white/10 text-gray-300 text-xs font-medium rounded-md p-1.5 focus:ring-1 focus:ring-indigo-500 outline-none"
                  disabled={loading}
                >
                  {MODELS.map(m => (
                    <option key={m} value={m}>{m} {m === 'Gemini' ? '(Fast)' : '(Precise)'}</option>
                  ))}
                </select>

                <button
                  onClick={handleCopy}
                  disabled={!convertedCode.trim()}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-black/30 hover:bg-black/50 text-gray-300 hover:text-white transition-all focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
             </div>
          </div>
          
          <div className="flex-1 w-full h-full relative p-0 m-0 overflow-y-auto custom-scrollbar bg-[#1e1e1e]">
            {!convertedCode && !loading ? (
               <div className="absolute inset-0 flex items-center justify-center text-gray-600 font-medium">
                  Converted code will appear here.
               </div>
            ) : (
               <SyntaxHighlighter
                 language={targetLanguage.toLowerCase()}
                 style={vscDarkPlus}
                 customStyle={{ margin: 0, padding: '1rem', background: 'transparent', minHeight: '100%' }}
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
