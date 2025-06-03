import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn } from 'lucide-react';
import { toast } from 'react-toastify';
import useAuthStore from '../../store/useAuthStore';
import Button from '../ui/Button';
import Input from '../ui/Input';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    try {
      await signIn(email, password);
      
      // If no error, navigate to dashboard
      if (!error) {
        toast.success('Login successful!');
        navigate('/dashboard');
      }
    } catch (err) {
      // Error is handled by the auth store
    }
  };
  
  // Demo login
  const handleDemoLogin = async () => {
    try {
      await signIn('demo@teamvibe.com', 'password123');
      toast.success('Demo login successful!');
      navigate('/dashboard');
    } catch (err) {
      // Error is handled by the auth store
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-xl shadow-card-3d"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-secondary-500 text-transparent bg-clip-text">
          Welcome Back
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Log in to continue your journey
        </p>
      </div>
      
      {error && (
        <div className="bg-error-50 dark:bg-error-900 text-error-500 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <Input
          label="Email"
          type="email"
          id="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail className="w-5 h-5 text-gray-400" />}
          required
        />
        
        <Input
          label="Password"
          type="password"
          id="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<Lock className="w-5 h-5 text-gray-400" />}
          required
        />
        
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <input
              id="remember"
              type="checkbox"
              className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label
              htmlFor="remember"
              className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
            >
              Remember me
            </label>
          </div>
          
          <a
            href="#"
            className="text-sm font-medium text-primary-500 hover:text-primary-600"
          >
            Forgot password?
          </a>
        </div>
        
        <Button
          type="submit"
          className="w-full"
          isLoading={loading}
          leftIcon={<LogIn size={18} />}
        >
          Log In
        </Button>
      </form>
      
      <div className="mt-6">
        <Button
          variant="secondary"
          className="w-full"
          onClick={handleDemoLogin}
        >
          Try Demo
        </Button>
      </div>
      
      <div className="text-center mt-6">
        <p className="text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="font-medium text-primary-500 hover:text-primary-600"
          >
            Sign up
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default LoginForm;