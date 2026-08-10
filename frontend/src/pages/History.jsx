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
    <div className="max-w-6xl mx-auto px-4 py-6 min-h-[calc(100vh-4rem)]">
      
      <div className="mb-6 pb-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Session History</h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">Browse past code reviews, AI chats, and conversions.</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-xs font-medium transition-colors shadow-sm flex items-center justify-center space-x-1.5 w-full sm:w-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Review</span>
        </button>
      </div>

      {error ? (
        <div className="p-4 bg-rose-950/30 text-rose-300 rounded-md border border-rose-800/40 text-xs flex items-center shadow-sm">
          <AlertCircle className="w-4 h-4 mr-2" />
          <span>{error}</span>
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#161b22] rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col items-center">
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800/60 rounded-md flex items-center justify-center mb-3 text-slate-400">
            <Inbox className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">No session history</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm text-xs mb-5">Your past code reviews, AI chats, and conversions will appear here.</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center"
          >
            <span>Start your first session</span>
            <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#161b22] rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#0d1117] font-semibold text-slate-500 dark:text-slate-400">
                <tr>
                  <th scope="col" className="px-4 py-3">Date</th>
                  <th scope="col" className="px-4 py-3">Type & Language</th>
                  <th scope="col" className="px-4 py-3">Model</th>
                  <th scope="col" className="px-4 py-3">Preview</th>
                  <th scope="col" className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {history.map((item) => (
                  <tr 
                    key={`${item.type}-${item.id}`} 
                    onClick={() => handleRowClick(item)}
                    className={`hover:bg-slate-50 dark:hover:bg-[#1f242d] cursor-pointer transition-colors ${fetchingId === item.id ? 'opacity-50' : ''}`}
                  >
                    <td className="px-4 py-3 whitespace-nowrap font-mono text-slate-700 dark:text-slate-300">
                      {new Date(item.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 text-[11px] font-semibold rounded ${
                        item.type === 'review' ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40' :
                        item.type === 'qna' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40' :
                        'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40'
                      }`}>
                        {item.type === 'review' ? 'Code Review' : item.type === 'qna' ? 'Ask AI' : 'Convert'}
                      </span>
                      <span className="ml-2 font-mono text-slate-500 dark:text-slate-400">
                        {item.displayLanguage}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-mono text-slate-600 dark:text-slate-400">
                      {item.model_used}
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 max-w-xs font-mono">
                      <div className="truncate bg-slate-100 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 px-2 py-1 rounded text-[11px]">
                         {item.original_code_preview.replace(/\n/g, ' ')}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      {fetchingId === item.id ? (
                         <Loader2 className="w-4 h-4 text-indigo-400 animate-spin ml-auto" />
                      ) : (
                         <ChevronRight className="w-4 h-4 text-slate-400 ml-auto" />
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
