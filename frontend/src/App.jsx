import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import AskAI from './pages/AskAI';
import CodeConverter from './pages/CodeConverter';
import Results from './pages/Results';
import History from './pages/History';
import AuthPage from './pages/AuthPage';

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 dark:bg-slate-950 dark:text-gray-100 transition-colors duration-200">
        <Toaster position="bottom-right" toastOptions={{ className: 'dark:bg-slate-800 dark:text-white' }} />
        {token && <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}
        
        <main className="flex-grow w-full">
          <Routes>
            <Route path="/login" element={<AuthPage />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Home />} />
              <Route path="/ask" element={<AskAI />} />
              <Route path="/convert" element={<CodeConverter />} />
              <Route path="/results" element={<Results />} />
              <Route path="/history" element={<History />} />
            </Route>
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
