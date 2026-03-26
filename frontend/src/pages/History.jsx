import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Clock, Code2, Cpu, ChevronRight, Inbox, Plus, Loader2, AlertCircle } from 'lucide-react';
import { getHistory, getQnaHistory, getConvertHistory, getReviewById } from '../api/reviewApi';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fetchingId, setFetchingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const [reviews, qnas, converts] = await Promise.all([
        getHistory().catch(() => []),
        getQnaHistory().catch(() => []),
        getConvertHistory().catch(() => [])
      ]);

      const unifiedReviews = reviews.map(r => ({ ...r, type: 'review', displayLanguage: r.language }));
      const unifiedQnas = qnas.map(q => ({ ...q, type: 'qna', original_code_preview: q.question_preview, displayLanguage: 'Chat' }));
      const unifiedConverts = converts.map(c => ({ ...c, type: 'convert', displayLanguage: c.target_language }));

      const allHistory = [...unifiedReviews, ...unifiedQnas, ...unifiedConverts].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      setHistory(allHistory);
    } catch (err) {
      console.error(err);
      setError('Failed to load history');
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = async (item) => {
    setFetchingId(item.id);
    const ts = toast.loading('Loading session...');
    try {
      if (item.type === 'review') {
        const fullReview = await getReviewById(item.id);
        const parsedSuggestions = typeof fullReview.suggestions === 'string' 
          ? JSON.parse(fullReview.suggestions) : fullReview.suggestions;
        toast.success('Review loaded', { id: ts });
        navigate('/results', {
          state: {
            result: { suggestions: parsedSuggestions, improved_code: fullReview.improved_code },
            originalCode: fullReview.original_code, language: fullReview.language, model: fullReview.model_used
          }
        });
      } else if (item.type === 'qna') {
        toast.success('Redirecting to Chat...', { id: ts });
        navigate('/ask');
      } else if (item.type === 'convert') {
        toast.success('Redirecting to Converter...', { id: ts });
        navigate('/convert');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to parse details', { id: ts });
    } finally {
      setFetchingId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto h-full flex flex-col pt-4">
        <div className="mb-8 border-b border-gray-200/50 dark:border-white/10 pb-6 flex justify-between items-center animate-pulse">
           <div className="h-10 bg-gray-200 dark:bg-slate-800 rounded-xl w-48"></div>
           <div className="h-12 bg-gray-200 dark:bg-slate-800 rounded-2xl w-36"></div>
        </div>
        <div className="bg-white/60 dark:bg-slate-900/60 shadow-xl rounded-3xl overflow-hidden border border-gray-200/50 dark:border-white/5">
          <div className="animate-pulse flex flex-col space-y-0 divide-y divide-gray-100 dark:divide-slate-800/50">
             {[1, 2, 3, 4, 5, 6].map(i => (
               <div key={i} className="flex gap-6 px-6 py-6 items-center">
                 <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded-md w-1/5"></div>
                 <div className="h-6 bg-gray-200 dark:bg-slate-800 rounded-full w-24"></div>
                 <div className="h-5 bg-gray-200 dark:bg-slate-800 rounded-md w-20"></div>
                 <div className="h-4 bg-slate-100 dark:bg-slate-800/50 rounded-md w-1/3 ml-auto"></div>
               </div>
             ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto min-h-[calc(100vh-8rem)] relative">
      <div className="fixed top-20 right-0 w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none z-[-1]"></div>
      
      <div className="mb-8 border-b border-gray-200/50 dark:border-white/10 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex items-center space-x-4">
          <img src="/logo.png" alt="ReviewAI Logo" className="w-14 h-14 rounded-2xl shadow-[0_0_20px_rgba(79,70,229,0.3)] border border-white/20 object-cover" />
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 tracking-tight">Review History</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Browse and revisit your past AI sessions.</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all font-semibold shadow-lg shadow-indigo-500/20 active:scale-[0.98] flex items-center justify-center space-x-2 w-full sm:w-auto"
        >
          <Plus className="w-5 h-5" />
          <span>New Review</span>
        </button>
      </div>

      {error ? (
        <div className="p-6 bg-red-50/80 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-2xl border border-red-200 dark:border-red-800/30 backdrop-blur-sm flex items-center justify-center shadow-sm">
          <AlertCircle className="w-6 h-6 mr-3" />
          <span className="font-semibold text-lg">{error}</span>
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-24 bg-white/60 dark:bg-slate-900/60 rounded-3xl border border-gray-200/50 dark:border-white/10 shadow-xl backdrop-blur-xl flex flex-col items-center">
          <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-indigo-100 dark:ring-indigo-500/20 shadow-inner">
            <Inbox className="h-10 w-10 text-indigo-400 dark:text-indigo-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No history yet</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto text-lg mb-8">You haven't run any AI chats, conversions, or reviews yet. Your past sessions will appear here.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all font-semibold shadow-sm hover:shadow active:scale-[0.98] flex items-center"
          >
            <span>Start your first AI session</span>
            <ChevronRight className="w-4 h-4 ml-2 opacity-70" />
          </button>
        </div>
      ) : (
        <div className="bg-white/80 dark:bg-slate-900/80 shadow-2xl rounded-3xl overflow-hidden border border-gray-200/50 dark:border-white/10 backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200/50 dark:divide-white/5">
              <thead className="bg-gray-50/50 dark:bg-slate-800/50">
                <tr>
                  <th scope="col" className="px-6 py-5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center"><Clock className="w-4 h-4 mr-2 opacity-70" /> Date</div>
                  </th>
                  <th scope="col" className="px-6 py-5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center"><Code2 className="w-4 h-4 mr-2 opacity-70" /> Language</div>
                  </th>
                  <th scope="col" className="px-6 py-5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center"><Cpu className="w-4 h-4 mr-2 opacity-70" /> Model</div>
                  </th>
                  <th scope="col" className="px-6 py-5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Code Preview</th>
                  <th scope="col" className="px-6 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {history.map((item) => (
                  <tr 
                    key={`${item.type}-${item.id}`} 
                    onClick={() => handleRowClick(item)}
                    className={`hover:bg-indigo-50/30 dark:hover:bg-slate-800/50 cursor-pointer transition-all duration-200 ${fetchingId === item.id ? 'opacity-50' : ''}`}
                  >
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">
                      {new Date(item.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-lg ${
                        item.type === 'review' ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 ring-indigo-500/30' :
                        item.type === 'qna' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 ring-emerald-500/30' :
                        'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 ring-amber-500/30'
                      } ring-1 ring-inset`}>
                        {item.type === 'review' ? 'Code Review' : item.type === 'qna' ? 'Ask AI' : 'Convert'}
                      </span>
                      <span className="ml-3 font-medium text-xs text-gray-500 dark:text-gray-400">
                        {item.displayLanguage}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-600 dark:text-gray-400">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-500/30">
                        {item.model_used}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-500 dark:text-gray-400 w-full max-w-xs font-mono">
                      <div className="truncate bg-gray-50 dark:bg-[#1e1e1e] border border-gray-200/50 dark:border-white/5 px-2.5 py-1.5 rounded-md text-[13px]">
                         {item.original_code_preview.replace(/\n/g, ' ')}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                      {fetchingId === item.id ? (
                         <Loader2 className="w-5 h-5 text-indigo-500 animate-spin ml-auto" />
                      ) : (
                         <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 ml-auto transition-colors" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
