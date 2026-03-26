import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Loader2, Sparkles, Send, Cpu, User, Edit, Search, Image as ImageIcon, LayoutGrid, Cloud, Folder, ChevronRight, Menu } from 'lucide-react';
import { submitQuestion, getQnaHistory, getQnaById } from '../api/reviewApi';
import { useAuth } from '../context/AuthContext';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const MODELS = ['Gemini', 'OpenAI'];

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

  const renderMarkdown = (content) => (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({node, inline, className, children, ...props}) {
          const match = /language-(\w+)/.exec(className || '')
          return !inline && match ? (
            <div className="rounded-lg overflow-hidden my-4 border border-white/5 shadow-sm w-full mx-auto max-w-full">
              <SyntaxHighlighter
                {...props}
                children={String(children).replace(/\n$/, '')}
                style={vscDarkPlus}
                language={match[1]}
                PreTag="div"
                customStyle={{ margin: 0, padding: '1.25rem', background: '#0d0d0d', fontSize: '13px' }}
              />
            </div>
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
    <div className="fixed top-[73px] bottom-0 left-0 right-0 flex bg-[#212121] overflow-hidden z-40">
      
      {/* Sidebar - ChatGPT Style */}
      <div className={`${sidebarOpen ? 'w-[260px]' : 'w-0'} transition-all duration-300 bg-[#171717] flex-shrink-0 flex flex-col h-full text-[#ECECEC] font-sans border-r border-white/5 overflow-hidden`}>
        <div className="p-3 w-[260px]">
          <button onClick={handleNewChat} className="flex items-center w-full px-3 py-2.5 rounded-lg hover:bg-[#212121] transition-colors text-sm mb-4">
            <Edit className="w-4 h-4 mr-3" /> 
            <span className="font-medium">New chat</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2 mt-2 w-[260px] custom-scrollbar">
          <h3 className="text-xs font-semibold text-gray-400 mb-3 px-3">Your chats</h3>
          <div className="space-y-0.5">
            {history.map(item => (
              <button key={item.id} onClick={() => loadChat(item.id)} className="w-full text-left truncate text-sm px-3 py-2 rounded-lg hover:bg-[#212121] text-gray-300 transition-colors">
                {item.question_preview}
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 mx-2 mb-2 w-[244px] rounded-xl hover:bg-[#212121] transition-colors cursor-pointer flex items-center mt-auto border border-white/5 bg-[#212121]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0 shadow-sm border border-white/10">
            {getInitials(user?.name)}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold truncate text-[#ececec]">{user?.name || 'User'}</span>
            <span className="text-xs text-gray-400 truncate">{user?.email || 'Logged in'}</span>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative h-full bg-[#212121]">
        
        {/* Mobile Sidebar Toggle */}
        <div className="absolute top-4 left-4 z-50">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {!isChatStarted ? (
          <div className="flex-1 flex flex-col items-center justify-center -translate-y-10 px-4">
             <div className="w-16 h-16 bg-white rounded-full mb-6 flex items-center justify-center shadow-lg pointer-events-none">
               <Sparkles className="w-8 h-8 text-black" />
             </div>
             <h1 className="text-3xl font-bold mb-10 text-white tracking-tight">
               How can I help you today?
             </h1>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pb-6 pt-16 px-4 md:px-0 scroll-smooth custom-scrollbar">
            <div className="max-w-3xl mx-auto space-y-6 flex flex-col">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex max-w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'ai' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white flex items-center justify-center mr-4 mt-1 border border-white/10">
                      <Sparkles className="w-5 h-5 text-black" />
                    </div>
                  )}
                  <div 
                    className={`
                      ${msg.role === 'user' 
                        ? 'bg-[#2f2f2f] text-white px-5 py-3 rounded-3xl rounded-tr-sm ' 
                        : 'text-gray-200 font-sans min-w-0 w-full'}
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
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white flex items-center justify-center mr-4 mt-1 border border-white/10">
                    <Sparkles className="w-5 h-5 text-black" />
                  </div>
                  <div className="flex items-center text-gray-400 h-10">
                    <Loader2 className="w-5 h-5 animate-spin mr-3 text-white" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="w-full pb-6 pt-2 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="relative group bg-[#2f2f2f] rounded-2xl border border-white/10 focus-within:ring-1 focus-within:ring-white/30 overflow-hidden flex flex-col shadow-lg">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder={isChatStarted ? "Reply to AI..." : "Message AI Coding Assistant..."}
                className="w-full bg-transparent text-white p-4 pb-12 outline-none resize-none font-sans min-h-[56px] max-h-[200px]"
                rows={1}
                disabled={loading}
              />
              
              <div className="absolute bottom-2 left-3 right-3 flex justify-between items-center">
                <select 
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-gray-400 cursor-pointer outline-none hover:text-white transition-colors py-1 px-1 rounded-md"
                  disabled={loading}
                >
                  {MODELS.map(m => (
                    <option className="bg-[#2f2f2f] text-white" key={m} value={m}>
                      {m} {m === 'Gemini' ? '(Fast)' : '(Precise)'}
                    </option>
                  ))}
                </select>
                
                <button
                  onClick={handleSubmit}
                  disabled={loading || !input.trim()}
                  className="bg-white hover:bg-gray-200 text-black p-1.5 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </div>
            </div>
            <p className="text-center text-xs text-gray-500 font-medium mt-3">
              AI can make mistakes. Verify critical code before implementing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AskAI;
