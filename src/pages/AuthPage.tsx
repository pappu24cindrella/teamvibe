import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import LoginForm from '../components/auth/LoginForm';
import SignupForm from '../components/auth/SignupForm';
import ThemeToggle from '../components/ui/ThemeToggle';
import useAuthStore from '../store/useAuthStore';

const AuthPage: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  
  const isLogin = location.pathname === '/login';
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <motion.div
              whileHover={{ rotate: 10 }}
              className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center mr-2"
            >
              <Users className="h-6 w-6 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-secondary-500 text-transparent bg-clip-text">
              TeamVibe
            </h1>
          </div>
          <ThemeToggle />
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-screen-xl mx-auto">
          <div className="flex flex-col md:flex-row items-center">
            {/* Left Column: Illustration */}
            <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                  {isLogin ? 'Welcome Back!' : 'Join TeamVibe'}
                </h2>
                
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                  {isLogin 
                    ? 'Log in to continue your wellness journey with your team.' 
                    : 'Create an account to start building healthy habits and winning together.'}
                </p>
                
                <div className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/30 dark:to-secondary-900/30 rounded-2xl p-6 shadow-md">
                  <h3 className="font-bold text-lg mb-4">Why TeamVibe?</h3>
                  
                  <ul className="space-y-3">
                    {[
                      'Track healthy habits and measure progress',
                      'Compete with colleagues in friendly challenges',
                      'Earn rewards for your achievements',
                      'Build a stronger, healthier team culture',
                    ].map((item, index) => (
                      <li key={index} className="flex items-start">
                        <span className="bg-primary-500 text-white rounded-full p-1 flex items-center justify-center mr-3 mt-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                        <span className="text-gray-700 dark:text-gray-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </div>
            
            {/* Right Column: Form */}
            <div className="md:w-1/2">
              {isLogin ? <LoginForm /> : <SignupForm />}
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-6 text-center text-gray-500 dark:text-gray-400 text-sm">
        <div className="container mx-auto">
          <p>© 2025 TeamVibe. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default AuthPage;