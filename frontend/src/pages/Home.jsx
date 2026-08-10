import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Loader2, Code2, Play } from 'lucide-react';
import CodeEditor from '../components/CodeEditor';
import { submitCodeReview } from '../api/reviewApi';

const LANGUAGES = ['JavaScript', 'Python', 'Java', 'C++', 'TypeScript', 'Go', 'Rust'];
const MODELS = ['Groq', 'Gemini', 'OpenAI'];

const ANALYSIS_MODES = [
  { id: 'quality', label: 'Code Quality' },
  { id: 'bugs', label: 'Bug Detection' },
  { id: 'security', label: 'Security Scan' }
];

const Home = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState('// Paste your code here\n');
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [model, setModel] = useState(MODELS[0]);
  const [selectedModes, setSelectedModes] = useState(['quality', 'bugs']);
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
      toast.error('Please enter some code to review!');
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading('Analyzing code...');

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
    <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col min-h-[calc(100vh-4rem)]">
      
      {/* Clean Developer Hero Section */}
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Review your code before you ship.
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1 max-w-2xl font-normal">
          Find bugs, security issues, and code-quality problems with AI-assisted reviews.
        </p>
      </div>

      {/* Main Workspace Container */}
      <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-lg p-5 sm:p-6 flex flex-col flex-grow shadow-sm">
        <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
          
          {/* Controls Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 pb-5 border-b border-slate-200 dark:border-slate-800">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Language
              </label>
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#0d1117] border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium rounded-md p-2.5 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors"
                disabled={loading}
              >
                {LANGUAGES.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                AI Model
              </label>
              <select 
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#0d1117] border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium rounded-md p-2.5 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors"
                disabled={loading}
              >
                {MODELS.map(m => (
                  <option key={m} value={m}>
                    {m} {m === 'Groq' ? '(Fast)' : m === 'Gemini' ? '(Primary)' : '(Fallback)'}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Analysis Focus
              </label>
              <div className="flex flex-wrap gap-2">
                {ANALYSIS_MODES.map((mode) => {
                  const isActive = selectedModes.includes(mode.id);
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => toggleMode(mode.id)}
                      disabled={loading}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center border ${
                        isActive
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
                          : 'bg-slate-50 dark:bg-[#0d1117] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        checked={isActive} 
                        readOnly 
                        className="mr-1.5 h-3 w-3 accent-indigo-600 rounded" 
                      />
                      {mode.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Monaco Code Editor Workspace */}
          <div className="flex-grow flex flex-col mb-6 bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden min-h-[420px]">
            <div className="bg-slate-100 dark:bg-[#0d1117] px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-600 dark:text-slate-400 flex items-center">
                <Code2 className="w-3.5 h-3.5 mr-1.5 opacity-70" /> {language} Editor
              </span>
            </div>
            <div className="w-full h-full min-h-[380px] flex-grow">
              <CodeEditor 
                code={code} 
                setCode={setCode} 
                language={language} 
                darkMode={isDarkMode} 
              />
            </div>
          </div>

          {/* Review Submission Action */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !code.trim() || code.trim() === '// Paste your code here'}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs sm:text-sm py-2.5 px-6 rounded-md shadow-sm transition-colors focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[160px]"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 w-4 h-4" />
                  Analyzing Code...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 mr-2 fill-current" />
                  Review Code
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
