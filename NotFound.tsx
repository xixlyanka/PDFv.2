import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { ROUTES } from '../constants';
import SEO from '../components/SEO';

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <SEO title="Page Not Found" />
      
      <div className="glass-panel p-12 rounded-3xl shadow-xl max-w-lg mx-auto">
        <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h2>
        <p className="text-gray-500 mb-8 text-lg">
          The page you are looking for doesn't exist or has been moved.
        </p>
        
        <Link 
          to={ROUTES.HOME}
          className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-bold shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-1 transition-all"
        >
          <Home className="w-5 h-5 mr-2" />
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;