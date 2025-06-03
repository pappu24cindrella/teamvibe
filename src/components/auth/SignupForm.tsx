import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Building, UserPlus } from 'lucide-react';
import { toast } from 'react-toastify';
import useAuthStore from '../../store/useAuthStore';
import Button from '../ui/Button';
import Input from '../ui/Input';

const SignupForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    role: 'Employee' as 'HR Admin' | 'Employee',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { signUp, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
    
    // Clear auth store error when form is changed
    if (error) {
      clearError();
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*\d)(?=.*[a-zA-Z])/.test(formData.password)) {
      newErrors.password = 'Password must contain at least 1 letter and 1 number';
    }
    
    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Company validation
    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await signUp(
        formData.email, 
        formData.password, 
        formData.name, 
        formData.company, 
        formData.role
      );
      
      // If no error, navigate to dashboard
      if (!error) {
        toast.success('Account created successfully!');
        navigate('/dashboard');
      }
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
          Join TeamVibe
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Create an account to get started
        </p>
      </div>
      
      {error && (
        <div className="bg-error-50 dark:bg-error-900 text-error-500 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <Input
          label="Full Name"
          type="text"
          id="name"
          name="name"
          placeholder="John Doe"
          value={formData.name}
          onChange={handleChange}
          icon={<User className="w-5 h-5 text-gray-400" />}
          error={errors.name}
          required
        />
        
        <Input
          label="Email"
          type="email"
          id="email"
          name="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          icon={<Mail className="w-5 h-5 text-gray-400" />}
          error={errors.email}
          required
        />
        
        <Input
          label="Password"
          type="password"
          id="password"
          name="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          icon={<Lock className="w-5 h-5 text-gray-400" />}
          error={errors.password}
          required
        />
        
        <Input
          label="Confirm Password"
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={handleChange}
          icon={<Lock className="w-5 h-5 text-gray-400" />}
          error={errors.confirmPassword}
          required
        />
        
        <Input
          label="Company Name"
          type="text"
          id="company"
          name="company"
          placeholder="Acme Inc."
          value={formData.company}
          onChange={handleChange}
          icon={<Building className="w-5 h-5 text-gray-400" />}
          error={errors.company}
          required
        />
        
        <div className="mb-6">
          <label 
            htmlFor="role" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Role
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200"
          >
            <option value="Employee">Employee</option>
            <option value="HR Admin">HR Admin</option>
          </select>
        </div>
        
        <Button
          type="submit"
          className="w-full"
          isLoading={loading}
          leftIcon={<UserPlus size={18} />}
        >
          Sign Up
        </Button>
      </form>
      
      <div className="text-center mt-6">
        <p className="text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-primary-500 hover:text-primary-600"
          >
            Log in
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default SignupForm;