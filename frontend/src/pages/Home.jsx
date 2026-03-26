import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Loader2, Sparkles, FileCode2, Cpu } from 'lucide-react';
import CodeEditor from '../components/CodeEditor';
import { submitCodeReview } from '../api/reviewApi';

const LANGUAGES = ['JavaScript', 'Python', 'Java', 'C++', 'TypeScript', 'Go', 'Rust'];
const MODELS = ['Gemini', 'OpenAI'];

const ANALYSIS_MODES = [
  { id: 'quality', label: 'Code Quality' },
  { id: 'bugs', label: 'Bug Detection' },
  { id: 'security', label: 'Security Scan' }
];

const TechSticker = ({ src, sizeClass, animationClass, positionClasses, delay }) => (
  <div className={`absolute ${positionClasses} ${animationClass} pointer-events-none z-0`} style={{ animationDelay: delay }}>
    <div className="bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-2xl shadow-xl border-[4px] sm:border-[6px] border-white dark:border-slate-700/80 transform hover:scale-110 transition-transform duration-300 filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)]">
      <img src={src} className={`${sizeClass} object-contain`} alt="tech sticker" />
    </div>
  </div>
);

const Home = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState('// Paste your code here\n');
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [model, setModel] = useState(MODELS[0]);
  const [selectedModes, setSelectedModes] = useState(['quality', 'bugs']); // default on
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleMode = (modeId) => {
    setSelectedModes(prev => 
      prev.includes(modeId) 
        ? prev.filter(id => id !== modeId) 
        : [...prev, modeId]
    );
  };

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(document.documentElement.classList.contains('dark'));
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
    setIsDarkMode(document.documentElement.classList.contains('dark'));
    return () => observer.disconnect();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim() || code.trim() === '// Paste your code here') {
      toast.error('Please enter some code to review!', { icon: '⌨️' });
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading('Analyzing code with AI...');

    try {
      const modeLabels = selectedModes.map(id => ANALYSIS_MODES.find(m => m.id === id)?.label);
      const result = await submitCodeReview(code, language, model, modeLabels);
      toast.success('Review complete!', { id: loadingToast });
      navigate('/results', { state: { result, originalCode: code, language, model } });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to submit code for review.', { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col h-full min-h-[calc(100vh-8rem)] relative">

      {/* Floating Tech Stickers Background */}
      <div className="absolute inset-0 overflow-visible pointer-events-none z-10 w-full h-full hidden lg:block">
         <TechSticker 
            src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg"
            sizeClass="w-12 h-12"
            animationClass="animate-float"
            positionClasses="top-[5%] left-[2%] -rotate-12"
            delay="0s"
         />
         <TechSticker 
            src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg"
            sizeClass="w-14 h-14"
            animationClass="animate-float-slow"
            positionClasses="bottom-[25%] left-[-4%] rotate-12"
            delay="1s"
         />
         <TechSticker 
            src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg"
            sizeClass="w-16 h-16"
            animationClass="animate-float-delayed"
            positionClasses="top-[10%] right-[0%] rotate-6"
            delay="0.5s"
         />
         <TechSticker 
            src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg"
            sizeClass="w-12 h-12 dark:invert"
            animationClass="animate-float"
            positionClasses="bottom-[35%] right-[-3%] -rotate-6"
            delay="2s"
         />
         <TechSticker 
            src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg"
            sizeClass="w-10 h-10"
            animationClass="animate-float-slow"
            positionClasses="top-[45%] left-[-6%] rotate-[-20deg]"
            delay="1.5s"
         />
      </div>

      <div className="mb-10 text-center mt-6 animate-fade-in-up z-20 relative">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-5 text-gray-900 dark:text-white tracking-tight leading-tight">
          Ship better code, <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">faster.</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium">
          Get instant, AI-driven code reviews. Catch bugs, fix vulnerabilities, and refactor using industry best practices in seconds.
        </p>
      </div>

      <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-white/10 p-6 sm:p-8 flex flex-col flex-grow relative overflow-hidden ring-1 ring-black/5 dark:ring-white/5">
        
        {/* Decorative background blobs */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-purple-500/10 dark:bg-purple-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-indigo-500/10 dark:bg-indigo-500/10 blur-3xl pointer-events-none"></div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-grow z-10">
          <div className="flex flex-wrap gap-5 mb-6">
            <div className="flex-1 min-w-[200px] group">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1 flex items-center">
                <FileCode2 className="w-4 h-4 mr-1.5 opacity-70" /> Language
              </label>
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-white/10 text-gray-900 dark:text-gray-100 text-sm font-medium rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block p-3.5 shadow-sm transition-all group-hover:shadow-md cursor-pointer outline-none"
                disabled={loading}
              >
                {LANGUAGES.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[200px] group">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1 flex items-center">
                <Cpu className="w-4 h-4 mr-1.5 opacity-70" /> AI Model
              </label>
              <select 
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-white/10 text-gray-900 dark:text-gray-100 text-sm font-medium rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block p-3.5 shadow-sm transition-all group-hover:shadow-md cursor-pointer outline-none"
                disabled={loading}
              >
                {MODELS.map(m => (
                  <option key={m} value={m}>{m} {m === 'Gemini' ? '(Primary)' : '(Fallback)'}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap gap-3">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 w-full mb-1 ml-1">Analysis Focus</span>
            {ANALYSIS_MODES.map((mode) => {
              const isActive = selectedModes.includes(mode.id);
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => toggleMode(mode.id)}
                  disabled={loading}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 flex flex-1 sm:flex-none justify-center items-center border ${
                    isActive
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-500/20 dark:border-indigo-500/30 dark:text-indigo-300 shadow-sm'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-slate-800 dark:border-white/10 dark:text-gray-400 dark:hover:bg-white/5 shadow-sm'
                  }`}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center mr-2 transition-colors duration-200 ${
                    isActive 
                      ? 'bg-indigo-600 border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500 text-white' 
                      : 'border-gray-300 dark:border-gray-600 bg-transparent'
                  }`}>
                    {isActive && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  {mode.label}
                </button>
              );
            })}
          </div>

          <div className="flex-grow flex flex-col mb-8 bg-white dark:bg-[#1e1e1e] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 ring-1 ring-black/5 dark:ring-white/5 transition-shadow hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            <div className="bg-gray-100 dark:bg-[#252526] px-5 py-3 border-b border-gray-200 dark:border-black/50 flex items-center justify-between pointer-events-none">
              <div className="flex space-x-2">
                <div className="w-3.5 h-3.5 rounded-full bg-red-400 dark:bg-red-500/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-amber-400 dark:bg-amber-500/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-green-400 dark:bg-green-500/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"></div>
              </div>
              <span className="text-xs font-mono font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{language} Snippet</span>
            </div>
            <div className="w-full h-full min-h-[400px]">
              <CodeEditor 
                code={code} 
                setCode={setCode} 
                language={language} 
                darkMode={isDarkMode} 
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !code.trim() || code.trim() === '// Paste your code here'}
              className="relative overflow-hidden group bg-gray-900 dark:bg-indigo-600 hover:bg-black dark:hover:bg-indigo-500 text-white font-bold py-3.5 px-8 rounded-2xl shadow-lg shadow-indigo-500/20 dark:shadow-indigo-600/30 transition-all focus:ring-4 focus:ring-offset-2 focus:ring-indigo-500/30 dark:focus:ring-indigo-500/50 dark:focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg active:scale-[0.98] w-full sm:w-auto min-w-[200px]"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full duration-700 ease-in-out transition-transform"></div>
              
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-3 w-5 h-5" />
                  Analyzing Code...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Review My Code
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Home;
