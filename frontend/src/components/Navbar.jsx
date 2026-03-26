import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, Home, MessageSquare, Code2, Clock, Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NavItem = ({ to, icon: Icon, label, isActive }) => (
  <Link 
    to={to} 
    className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 relative group overflow-hidden border ${
      isActive 
        ? 'text-white border-transparent shadow-md shadow-indigo-500/20' 
        : 'text-gray-600 dark:text-gray-300 border-transparent hover:bg-gray-100 dark:hover:bg-white/5'
    }`}
  >
    {isActive && (
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-100 transition-opacity duration-300"></div>
    )}
    <Icon className={`w-[18px] h-[18px] relative z-10 ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:scale-110 transition-transform duration-300 group-hover:text-indigo-500'}`} />
    <span className="relative z-10">{label}</span>
  </Link>
);

const Navbar = ({ darkMode, toggleDarkMode }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const isActive = (path) => location.pathname === path;

  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length >= 2) return (names[0][0] + names[1][0]).toUpperCase();
    return names[0][0].toUpperCase();
  };

  return (
    <>
      <nav className="sticky top-0 z-50 backdrop-blur-2xl bg-white/80 dark:bg-[#121212]/80 border-b border-gray-200 dark:border-white/10 shadow-sm transition-colors duration-300">
        <div className="container mx-auto px-4 lg:px-8 h-[76px] flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group mr-auto">
            <img 
              src="/logo.png" 
              alt="ReviewAI Logo" 
              className="w-11 h-11 rounded-2xl shadow-[0_0_20px_rgba(79,70,229,0.4)] border border-white/20 object-cover group-hover:scale-105 transition-all duration-300"
            />
            <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 tracking-tight">
              ReviewAI
            </span>
          </Link>
          
          {/* Navigation Links - Desktop Only */}
          <div className="hidden lg:flex items-center space-x-2 bg-gray-50 dark:bg-[#1e1e1e] p-1.5 rounded-full border border-gray-200 dark:border-white/5 shadow-inner mx-4">
            <NavItem to="/" icon={Home} label="Home" isActive={isActive('/')} />
            <NavItem to="/ask" icon={MessageSquare} label="Ask AI" isActive={isActive('/ask')} />
            <NavItem to="/convert" icon={Code2} label="Converter" isActive={isActive('/convert')} />
            <NavItem to="/history" icon={Clock} label="History" isActive={isActive('/history')} />
          </div>

          {/* User & Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-5 ml-auto">
            
            {user && (
              <div className="hidden sm:flex items-center space-x-3 bg-white dark:bg-[#1e1e1e] px-3 py-1.5 rounded-full border border-gray-200 dark:border-white/10 shadow-sm transition-colors duration-300">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-[11px] font-black shadow-inner border-2 border-white/20 pointer-events-none">
                  {getInitials(user.name)}
                </div>
                <div className="flex flex-col pr-2 justify-center">
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-100 leading-none mb-1">{user.name}</span>
                  <span className="text-[9px] text-gray-500 dark:text-gray-500 uppercase tracking-widest font-black leading-none">Workspace</span>
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-2 sm:border-l border-transparent sm:border-gray-200 dark:sm:border-white/10 sm:pl-3 lg:pl-5">
              <button 
                onClick={toggleDarkMode}
                className="w-10 h-10 flex items-center justify-center rounded-2xl bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#3a3a3a] hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                title="Toggle theme"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <button 
                onClick={logout}
                className="w-10 h-10 flex items-center justify-center rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                title="Sign Out"
              >
                <LogOut className="w-[18px] h-[18px]" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Floating Bottom Navigation Tab Bar - Mobile/Tablet Only */}
      <div className="lg:hidden fixed bottom-3 sm:bottom-6 left-4 right-4 z-50 flex justify-center pointer-events-none">
        <div className="flex items-center justify-between w-full max-w-sm px-2 py-2 bg-white/90 dark:bg-[#1e1e1e]/90 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)] pointer-events-auto overflow-x-auto hide-scrollbar">
          <NavItem to="/" icon={Home} label="Home" isActive={isActive('/')} />
          <NavItem to="/ask" icon={MessageSquare} label="Ask" isActive={isActive('/ask')} />
          <NavItem to="/convert" icon={Code2} label="Code" isActive={isActive('/convert')} />
          <NavItem to="/history" icon={Clock} label="Logs" isActive={isActive('/history')} />
        </div>
      </div>
    </>
  );
};

export default Navbar;
