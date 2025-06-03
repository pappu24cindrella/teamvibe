import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  LineChart, 
  Award, 
  Gift, 
  User, 
  Settings, 
  Menu, 
  X,
  LogOut
} from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import ThemeToggle from '../ui/ThemeToggle';

interface SidebarProps {
  isMobile: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuthStore();
  
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  
  const closeSidebar = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };
  
  const sidebarVariants = {
    open: { 
      x: 0,
      transition: { 
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    closed: { 
      x: '-100%',
      transition: { 
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    }
  };
  
  const navItems = [
    { path: '/dashboard', icon: <Home size={20} />, label: 'Dashboard' },
    { path: '/habits', icon: <LineChart size={20} />, label: 'Habit Tracker' },
    { path: '/leaderboard', icon: <Award size={20} />, label: 'Leaderboard' },
    { path: '/rewards', icon: <Gift size={20} />, label: 'Rewards' },
    { path: '/profile', icon: <User size={20} />, label: 'Profile' },
  ];
  
  // Only show company settings for HR Admin
  if (user?.role === 'HR Admin') {
    navItems.push({ 
      path: '/settings', 
      icon: <Settings size={20} />, 
      label: 'Company Settings' 
    });
  }
  
  return (
    <>
      {/* Mobile menu button */}
      {isMobile && (
        <button 
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2 rounded-full bg-white dark:bg-gray-800 shadow-md"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}
      
      {/* Sidebar */}
      <AnimatePresence>
        {(!isMobile || isOpen) && (
          <>
            {/* Overlay for mobile */}
            {isMobile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={closeSidebar}
                className="fixed inset-0 bg-black z-40"
              />
            )}
            
            {/* Sidebar content */}
            <motion.div
              className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 shadow-lg z-50 flex flex-col ${isMobile ? '' : 'relative'}`}
              variants={sidebarVariants}
              initial={isMobile ? 'closed' : 'open'}
              animate="open"
              exit="closed"
            >
              {/* Logo */}
              <div className="p-4 flex items-center justify-center">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-secondary-500 text-transparent bg-clip-text">
                  TeamVibe
                </h1>
              </div>
              
              {/* Navigation */}
              <nav className="flex-1 px-4 py-6">
                <ul className="space-y-2">
                  {navItems.map((item) => (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        onClick={closeSidebar}
                        className={({ isActive }) => 
                          `flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                            isActive 
                              ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400' 
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`
                        }
                      >
                        <span className="mr-3">{item.icon}</span>
                        <span>{item.label}</span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </nav>
              
              {/* Bottom section */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Theme
                  </span>
                  <ThemeToggle />
                </div>
                
                <button
                  onClick={() => signOut()}
                  className="w-full flex items-center px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                >
                  <LogOut size={20} className="mr-3" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;