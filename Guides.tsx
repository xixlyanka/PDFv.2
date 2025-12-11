import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { guides } from '../data/guides';
import { ArrowRight, BookOpen } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Guides: React.FC = () => {
  const { language } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <SEO 
        title="PDF Guides & Tutorials" 
        description="Learn how to manage your documents effectively. Tips on compressing, converting, and securing PDFs."
      />
      
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-100 dark:bg-indigo-900 rounded-xl text-indigo-600 dark:text-indigo-400 mb-4">
            <BookOpen className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Guides & Tutorials</h1>
        <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          Tips, tricks, and how-tos to help you get the most out of your documents.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {guides.map((guide) => {
            // Fallback to English if translation missing
            const content = guide.translations[language] || guide.translations['en'];
            if (!content) return null;

            return (
              <article key={guide.id} className="glass-panel rounded-2xl overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider rounded-full">
                      {guide.category}
                    </span>
                    <span className="text-sm text-gray-400">{content.readTime}</span>
                  </div>
                  
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 leading-tight">
                    <Link to={`/guides/${guide.slug}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                      {content.title}
                    </Link>
                  </h2>
                  
                  <p className="text-gray-500 dark:text-gray-400 mb-6 flex-1 line-clamp-3">
                    {content.excerpt}
                  </p>
                  
                  <Link 
                    to={`/guides/${guide.slug}`}
                    className="inline-flex items-center font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 mt-auto"
                  >
                    Read Article <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </div>
              </article>
            );
        })}
      </div>
    </div>
  );
};

export default Guides;