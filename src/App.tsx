import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import AppLayout from './components/layout/AppLayout';
import useThemeStore from './store/useThemeStore';

// Import Dashboard and other pages here
// These will be created in separate files

function App() {
  const { theme } = useThemeStore();
  
  useEffect(() => {
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/signup" element={<AuthPage />} />
          
          {/* Protected routes */}
          <Route path="/" element={<AppLayout />}>
            <Route path="/dashboard" element={<div className="p-6">Dashboard Coming Soon</div>} />
            <Route path="/habits" element={<div className="p-6">Habit Tracker Coming Soon</div>} />
            <Route path="/leaderboard" element={<div className="p-6">Leaderboard Coming Soon</div>} />
            <Route path="/rewards" element={<div className="p-6">Rewards Coming Soon</div>} />
            <Route path="/profile" element={<div className="p-6">Profile Coming Soon</div>} />
            <Route path="/settings" element={<div className="p-6">Company Settings Coming Soon</div>} />
          </Route>
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/\" replace />} />
        </Routes>
      </Router>
      
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        theme={theme}
      />
    </>
  );
}

export default App;