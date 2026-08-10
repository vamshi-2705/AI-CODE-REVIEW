import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, Home, MessageSquare, Code2, Clock, Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NavItem = ({ to, icon: Icon, label, isActive }) => (
  <Link 
    to={to} 
    className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
      isActive 
        ? 'bg-slate-200 dark:bg-[#21262d] text-slate-900 dark:text-white font-semibold' 
        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#161b22]'
    }`}
  >
    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'opacity-70'}`} />
    <span>{label}</span>
  </Link>
);

const Navbar = ({ darkMode, toggleDarkMode }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white dark:bg-[#0d1117] border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <img 
                src="/logo.png" 
                alt="ReviewAI Logo" 
                className="w-7 h-7 rounded-md object-cover border border-slate-200 dark:border-slate-700"
              />
              <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                ReviewAI
              </span>
            </Link>

            {/* Navigation Links - Desktop */}
            <div className="hidden md:flex items-center space-x-1">
              <NavItem to="/" icon={Home} label="Home" isActive={isActive('/')} />
              <NavItem to="/ask" icon={MessageSquare} label="Ask AI" isActive={isActive('/ask')} />
              <NavItem to="/convert" icon={Code2} label="Converter" isActive={isActive('/convert')} />
              <NavItem to="/history" icon={Clock} label="History" isActive={isActive('/history')} />
            </div>
          </div>

          {/* User Profile & Action Controls */}
          <div className="flex items-center space-x-3">
            {user && (
              <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-md">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="font-medium text-slate-900 dark:text-slate-200">{user.name || user.email}</span>
              </div>
            )}
            
            <div className="flex items-center space-x-1 pl-2 border-l border-slate-200 dark:border-slate-800">
              <button 
                onClick={toggleDarkMode}
                className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#21262d] transition-colors"
                title="Toggle Theme"
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              
              <button 
                onClick={logout}
                className="p-1.5 rounded-md text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-[#21262d] transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Compact Mobile Tab Bar */}
      <div className="md:hidden fixed bottom-3 left-3 right-3 z-50">
        <div className="flex items-center justify-around bg-slate-900/95 dark:bg-[#161b22]/95 backdrop-blur border border-slate-800 px-2 py-1.5 rounded-lg shadow-lg">
          <NavItem to="/" icon={Home} label="Home" isActive={isActive('/')} />
          <NavItem to="/ask" icon={MessageSquare} label="Ask AI" isActive={isActive('/ask')} />
          <NavItem to="/convert" icon={Code2} label="Converter" isActive={isActive('/convert')} />
          <NavItem to="/history" icon={Clock} label="History" isActive={isActive('/history')} />
        </div>
      </div>
    </>
  );
};

export default Navbar;
