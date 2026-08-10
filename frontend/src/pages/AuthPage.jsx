import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Code2, Loader2, Mail, Lock, User, Play } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('expired') === 'true') {
      toast.error('Your session expired or is invalid. Please sign in again.');
    }
  }, [location.search]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${baseUrl}/auth/demo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Demo login failed');

      login(data.user, data.token);
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Failed to login with Demo Account');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${baseUrl}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Google auth failed');

      login(data.user, data.token);
      navigate('/');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      
      const res = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isLogin ? { email: formData.email, password: formData.password } : formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      login(data.user, data.token);
      navigate('/');
      
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-200 flex items-center justify-center p-4">
      <div className="w-full max-w-[900px] bg-[#161b22] rounded-lg border border-slate-800 shadow-xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side - Practical Product Summary */}
        <div className="md:w-5/12 bg-[#0d1117] p-8 sm:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800">
          <div>
            <div className="flex items-center space-x-2.5 mb-8">
              <img 
                src="/logo.png" 
                alt="ReviewAI Logo" 
                className="w-8 h-8 rounded-md border border-slate-700 object-cover" 
              />
              <span className="text-white text-lg font-bold tracking-tight">ReviewAI</span>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white leading-tight">
                AI-assisted code review for developers.
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Review code, find bugs, scan security vulnerabilities, and improve your implementation before merging.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 text-xs text-slate-500 font-mono">
            v1.0.0 &bull; Fast AI Review Utility
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-7/12 p-8 sm:p-10 flex flex-col justify-center bg-[#161b22]">
           
           <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-1">
                {isLogin ? 'Sign in to ReviewAI' : 'Create an account'}
              </h2>
              <p className="text-slate-400 text-xs">
                {isLogin ? 'Enter your credentials to access your workspace' : 'Sign up to start reviewing your codebase'}
              </p>
           </div>
           
           <div className="space-y-2.5 mb-5">
             <button
                type="button"
                onClick={handleDemoLogin}
                disabled={loading}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs py-2.5 px-4 rounded-md border border-slate-700 transition duration-150 flex items-center justify-center"
             >
                <Play className="w-3.5 h-3.5 mr-2 text-emerald-400 fill-current" />
                <span>Try Demo Account (Instant Access)</span>
             </button>

             <div className="flex justify-center overflow-hidden rounded-md">
               <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error('Google Sign-In failed.')}
                  useOneTap
                  theme="filled_black"
                  shape="rectangular"
                  text="continue_with"
                  size="large"
                  width="100%"
               />
             </div>
           </div>

           <div className="flex items-center mb-5">
             <div className="flex-1 border-t border-slate-800"></div>
             <span className="px-3 text-[11px] tracking-wider text-slate-500 font-semibold uppercase">Or email</span>
             <div className="flex-1 border-t border-slate-800"></div>
           </div>

           <form onSubmit={handleSubmit} className="space-y-3.5">
              
              {!isLogin && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-3.5 w-3.5 text-slate-500" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      required={!isLogin}
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2 bg-[#0d1117] border border-slate-800 rounded-md text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors font-medium text-xs"
                      placeholder="Your Name"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-3.5 w-3.5 text-slate-500" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2 bg-[#0d1117] border border-slate-800 rounded-md text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors font-medium text-xs"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-400">Password</label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-3.5 w-3.5 text-slate-500" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2 bg-[#0d1117] border border-slate-800 rounded-md text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors font-medium text-xs"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs py-2.5 px-4 rounded-md transition duration-150 flex items-center justify-center mt-5 shadow-sm"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <>
                    <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </>
                )}
              </button>
           </form>

           <div className="mt-5 text-center">
              <p className="text-xs text-slate-400 font-medium">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setFormData({ name: '', email: '', password: '' });
                  }}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold focus:outline-none transition-colors"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
           </div>

        </div>
      </div>
    </div>
  );
};

export default AuthPage;
