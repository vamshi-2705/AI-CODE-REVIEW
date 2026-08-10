import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Loader2, Sparkles, Send, Cpu, User, Edit, Search, Image as ImageIcon, LayoutGrid, Cloud, Folder, ChevronRight, Menu, MessageSquare } from 'lucide-react';
import { submitQuestion, getQnaHistory, getQnaById } from '../api/reviewApi';
import { useAuth } from '../context/AuthContext';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const MODELS = ['Groq', 'Gemini', 'OpenAI'];

const AskAI = () => {
  const { user } = useAuth();
  
  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length >= 2) return (names[0][0] + names[1][0]).toUpperCase();
    return names[0][0].toUpperCase();
  };

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [model, setModel] = useState(MODELS[0]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const isChatStarted = messages.length > 0;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchHistory();
  }, []); // Load history on mount

  const fetchHistory = async () => {
    try {
      const data = await getQnaHistory();
      setHistory(data || []);
    } catch(e) {
      console.error("Failed to fetch history", e);
    }
  };

  const loadChat = async (id) => {
    try {
      const data = await getQnaById(id);
      if (data) {
        setMessages([
          { role: 'user', content: data.question },
          { role: 'ai', content: data.answer }
        ]);
        setInput('');
      }
    } catch(e) {
      toast.error("Failed to load conversation");
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput('');
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userQuestion = input.trim();
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    
    const newMessages = [...messages, { role: 'user', content: userQuestion }, { role: 'ai', content: '' }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${baseUrl}/ask/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ question: userQuestion, model })
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          toast.error('Session expired or invalid. Please log in again.');
          window.location.href = '/login?expired=true';
          return;
        }
        throw new Error('Failed to get answer');
      }

      setLoading(false); 

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
                  fullText += `\n*Error: ${dataJSON.error}*`;
                } else if (dataJSON.text) {
                  fullText += dataJSON.text;
                }
                
                setMessages(prev => {
                  const updated = [...prev];
                  const lastMsg = updated[updated.length - 1];
                  if (lastMsg.role === 'ai') {
                    lastMsg.content = fullText;
                  }
                  return updated;
                });
              } catch (e) { }
            }
          }
        }
      }
      
      // Refresh history after generation
      fetchHistory();
      
    } catch (err) {
      console.error(err);
      toast.error('Failed to get answer.');
      setMessages(prev => {
        const updated = [...prev];
        const lastMsg = updated[updated.length - 1];
        if (lastMsg.role === 'ai') {
          lastMsg.content += '\n\n*Error: Connection lost. Failed to process your request.*';
        }
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  const CodeBlock = ({ children, language, ...props }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
      navigator.clipboard.writeText(children);
      setCopied(true);
      toast.success('Code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div className="rounded-lg overflow-hidden my-4 border border-white/5 shadow-sm w-full mx-auto max-w-full group">
        <div className="bg-[#1a1a1a] px-4 py-2 flex justify-between items-center border-b border-white/5">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{language}</span>
          <button 
            onClick={handleCopy}
            className="flex items-center space-x-1.5 text-gray-400 hover:text-white transition-colors"
          >
            {copied ? (
              <>
                <div className="w-3.5 h-3.5 rounded-full bg-green-500/20 flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider">Copied!</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                <span className="text-[10px] font-bold uppercase tracking-wider">Copy</span>
              </>
            )}
          </button>
        </div>
        <SyntaxHighlighter
          {...props}
          children={String(children).replace(/\n$/, '')}
          style={vscDarkPlus}
          language={language}
          PreTag="div"
          customStyle={{ margin: 0, padding: '1.25rem', background: '#0d0d0d', fontSize: '13px' }}
        />
      </div>
    );
  };

  const renderMarkdown = (content) => (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({node, inline, className, children, ...props}) {
          const match = /language-(\w+)/.exec(className || '')
          return !inline && match ? (
            <CodeBlock 
              language={match[1]} 
              children={children} 
              {...props} 
            />
          ) : (
            <code {...props} className="bg-[#2f2f2f] px-1.5 py-0.5 rounded-md text-gray-200 font-mono text-[13px] border border-white/10">
              {children}
            </code>
          )
        },
        p: ({node, ...props}) => <p className="mb-4 leading-relaxed" {...props} />,
        ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-1" {...props} />,
        ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 space-y-1" {...props} />,
        h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-6 mb-4 text-white" {...props} />,
        h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-5 mb-3 text-white" {...props} />,
        h3: ({node, ...props}) => <h3 className="text-lg font-bold mt-4 mb-2 text-white" {...props} />,
        a: ({node, ...props}) => <a className="text-blue-400 hover:underline" {...props} />,
        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-gray-500 pl-4 py-1 my-4 bg-[#2f2f2f] text-gray-300 italic rounded-r-lg" {...props} />
      }}
    >
      {content}
    </ReactMarkdown>
  );

  return (
    <div className="fixed top-[56px] bottom-0 left-0 right-0 flex bg-[#080B12] overflow-hidden z-40">
      
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-[260px]' : 'w-0'} transition-all duration-200 bg-[#0D121B] flex-shrink-0 flex flex-col h-full text-[#F1F5F9] font-sans border-r border-[#202938] overflow-hidden`}>
        <div className="p-3 w-[260px]">
          <button onClick={handleNewChat} className="flex items-center w-full px-3 py-2 rounded-lg bg-[#111722] hover:bg-[#080B12] border border-[#202938] transition-colors text-xs font-medium text-[#F1F5F9] mb-2">
            <Edit className="w-3.5 h-3.5 mr-2 text-[#3B82F6]" /> 
            <span>New chat</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-1 w-[260px] custom-scrollbar">
          <h3 className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-2 px-2">History</h3>
          <div className="space-y-0.5">
            {history.map(item => (
              <button key={item.id} onClick={() => loadChat(item.id)} className="w-full text-left truncate text-xs px-2.5 py-1.5 rounded-md hover:bg-[#111722] text-[#94A3B8] hover:text-[#F1F5F9] transition-colors">
                {item.question_preview}
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 mx-2 mb-2 w-[244px] rounded-lg flex items-center mt-auto border border-[#202938] bg-[#111722]">
          <div className="w-7 h-7 rounded-md bg-[#0D121B] text-[#F1F5F9] flex items-center justify-center text-xs font-bold mr-2.5 border border-[#202938]">
            {getInitials(user?.name)}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-medium truncate text-[#F1F5F9]">{user?.name || 'Developer'}</span>
            <span className="text-[10px] text-[#64748B] truncate">{user?.email || 'Logged in'}</span>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative h-full bg-[#080B12]">
        
        {/* Mobile Sidebar Toggle */}
        <div className="absolute top-3 left-3 z-50">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-md text-[#94A3B8] hover:text-white hover:bg-[#111722] transition-colors"
            title="Toggle Sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>

        {!isChatStarted ? (
          <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
             <div className="w-12 h-12 bg-[#111722] border border-[#202938] rounded-xl mb-4 flex items-center justify-center text-[#3B82F6]">
               <MessageSquare className="w-6 h-6" />
             </div>
             <h1 className="text-xl font-bold text-[#F1F5F9] tracking-tight mb-2">
               Ask about your code...
             </h1>
             <p className="text-xs text-[#94A3B8] max-w-sm">
               Get help refactoring logic, diagnosing stack traces, or exploring best practices.
             </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pb-6 pt-12 px-4 md:px-0 scroll-smooth custom-scrollbar">
            <div className="max-w-3xl mx-auto space-y-5 flex flex-col">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex max-w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'ai' && (
                    <div className="flex-shrink-0 w-7 h-7 rounded-md bg-[#0D121B] border border-[#202938] text-[#3B82F6] flex items-center justify-center mr-3 mt-1 text-xs font-bold">
                      AI
                    </div>
                  )}
                  <div 
                    className={`
                      ${msg.role === 'user' 
                        ? 'bg-[#111722] text-[#F1F5F9] px-4 py-2.5 rounded-xl border border-[#202938] text-xs sm:text-sm' 
                        : 'text-[#F1F5F9] font-sans text-xs sm:text-sm min-w-0 w-full'}
                    `}
                  >
                    {msg.role === 'user' ? (
                       <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    ) : (
                       <div className="prose prose-invert max-w-none break-words">
                         {renderMarkdown(msg.content)}
                       </div>
                    )}
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex max-w-full justify-start animate-fade-in-up">
                  <div className="flex-shrink-0 w-7 h-7 rounded-md bg-[#0D121B] border border-[#202938] text-[#3B82F6] flex items-center justify-center mr-3 mt-1 text-xs font-bold">
                    AI
                  </div>
                  <div className="flex items-center text-[#94A3B8] h-8 text-xs font-mono">
                    <Loader2 className="w-4 h-4 animate-spin mr-2 text-[#3B82F6]" />
                    Thinking...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="w-full pb-5 pt-2 px-4 bg-[#080B12] border-t border-[#202938]">
          <div className="max-w-3xl mx-auto">
            <div className="relative group bg-[#111722] rounded-xl border border-[#202938] focus-within:border-[#3B82F6] overflow-hidden flex flex-col shadow-sm">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your code..."
                className="w-full bg-transparent text-[#F1F5F9] p-3 pb-10 outline-none resize-none font-sans text-xs sm:text-sm min-h-[48px] max-h-[180px] placeholder-[#64748B]"
                rows={1}
                disabled={loading}
              />
              
              <div className="absolute bottom-2 left-3 right-3 flex justify-between items-center">
                <select 
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="bg-[#0B0F15] border border-[#202938] text-[11px] font-medium text-[#94A3B8] cursor-pointer outline-none hover:text-[#F1F5F9] transition-colors py-0.5 px-2 rounded-md"
                  disabled={loading}
                >
                  {MODELS.map(m => (
                    <option className="bg-[#111722] text-[#F1F5F9]" key={m} value={m}>
                      {m} {m === 'Groq' ? '(Fast)' : m === 'Gemini' ? '(Primary)' : '(Fallback)'}
                    </option>
                  ))}
                </select>
                
                <button
                  onClick={handleSubmit}
                  disabled={loading || !input.trim()}
                  className="bg-[#3B82F6] hover:bg-[#2563EB] text-[#F1F5F9] p-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <p className="text-center text-[10px] text-[#64748B] font-mono mt-2">
              Verify code suggestions before using in production environments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AskAI;
