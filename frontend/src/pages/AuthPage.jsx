import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Code2, Loader2, Mail, Lock, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4 selection:bg-indigo-500/30">
      <div className="w-full max-w-[1000px] bg-[#1a1a1a] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white/5">
        
        {/* Left Side - Visual/Marketing */}
        <div className="md:w-5/12 bg-gradient-to-br from-indigo-600 to-purple-700 p-10 flex flex-col justify-between relative overflow-hidden hidden md:flex">
          {/* Abstract background shapes */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white/10 blur-3xl mix-blend-overlay pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 rounded-full bg-purple-500/30 blur-3xl mix-blend-overlay pointer-events-none"></div>
          
          <div className="relative z-10 flex items-center space-x-3">
             <img 
               src="/logo.png" 
               alt="AI Code Review Logo" 
               className="w-10 h-10 rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.5)] border border-white/20 object-cover" 
             />
             <span className="text-white text-xl font-bold tracking-tight">AI Code Review</span>
          </div>

          <div className="relative z-10 space-y-6 mt-12 mb-auto">
             <h2 className="text-4xl font-extrabold text-white leading-tight">
               Build, Review, and <br/> Compile <span className="text-indigo-200">Faster.</span>
             </h2>
             <p className="text-indigo-100 text-sm leading-relaxed max-w-sm">
               Join our secure platform to get instant AI-powered code reviews, multi-language conversational debugging, and seamless translation.
             </p>
          </div>

          <div className="relative z-10 flex items-center space-x-4">
             <div className="flex -space-x-3">
               {[1,2,3,4].map(i => (
                 <div key={i} className={`w-8 h-8 rounded-full border-2 border-indigo-600 flex items-center justify-center text-[10px] font-bold text-white bg-slate-800`}>
                   +
                 </div>
               ))}
             </div>
             <span className="text-indigo-200 text-xs font-medium">Join 10k+ developers</span>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-7/12 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-[#1e1e1e]">
           
           <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                {isLogin ? 'Welcome back' : 'Create an account'}
              </h2>
              <p className="text-gray-400 text-sm">
                {isLogin ? 'Enter your details to sign in to your workspace' : 'Sign up to get started with AI Code Reviews'}
              </p>
           </div>
           
           <div className="flex justify-center mb-6 overflow-hidden rounded-xl">
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

           <div className="flex items-center mb-6">
             <div className="flex-1 border-t border-white/10"></div>
             <span className="px-4 text-xs tracking-wider text-gray-500 font-medium uppercase">Or continue with email</span>
             <div className="flex-1 border-t border-white/10"></div>
           </div>

           <form onSubmit={handleSubmit} className="space-y-4">
              
              {!isLogin && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 ml-1">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-gray-500" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      required={!isLogin}
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 bg-[#121212] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-sm"
                      placeholder="Your Name"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 ml-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-500" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-[#121212] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-sm"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-xs font-semibold text-gray-400">Password</label>
                  {isLogin && (
                     <button type="button" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300">
                        Forgot password?
                     </button>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-500" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-[#121212] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-xl transition duration-200 flex items-center justify-center mt-6 focus:ring-4 focus:ring-indigo-500/50 shadow-lg shadow-indigo-500/20"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
           </form>

           <div className="mt-6 text-center">
              <p className="text-sm text-gray-400 font-medium">
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
