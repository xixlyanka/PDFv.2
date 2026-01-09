
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES, APP_NAME } from '@/constants';

const Footer: React.FC = () => {
  const [clickCount, setClickCount] = useState(0);
  const navigate = useNavigate();

  const handleSecretClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount >= 5) {
      navigate('/admin');
      setClickCount(0);
    }
  };

  return (
    <footer className="glass-panel border-t border-gray-200/50 dark:border-slate-800 mt-auto backdrop-blur-md bg-white/60 dark:bg-slate-900/60">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center space-x-8 md:order-2">
          <Link to={ROUTES.PRIVACY} className="text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Privacy Policy
          </Link>
          <Link to={ROUTES.TERMS} className="text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Terms of Service
          </Link>
          <Link to={ROUTES.ABOUT} className="text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            About
          </Link>
        </div>
        <div className="mt-8 md:mt-0 md:order-1">
          <p 
            onClick={handleSecretClick}
            className="text-center text-sm text-gray-500 dark:text-gray-400 cursor-default select-none hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            title="Double click 5 times for admin"
          >
            &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
