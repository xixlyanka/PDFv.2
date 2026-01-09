import React from 'react';
import { useParams, Link } from 'react-router-dom';
import SEO from '@/SEO';
import { guides } from '@/guides';
import NotFound from './NotFound';
import { ChevronLeft, Calendar } from 'lucide-react';
import { useLanguage } from '@/LanguageContext';

const GuidePost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const guide = guides.find(g => g.slug === slug);

  if (!guide) return <NotFound />;

  const content = guide.translations[language] || guide.translations['en'];
  if (!content) return <NotFound />;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-24">
      <SEO 
        title={content.title} 
        description={content.excerpt} 
      />
      
      <Link to="/guides" className="inline-flex items-center text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-8 transition-colors">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Guides
      </Link>
      
      <article>
        <header className="mb-10 text-center">
            <span className="inline-block px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                {guide.category}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
                {content.title}
            </h1>
            <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
                <span className="flex items-center"><Calendar className="w-4 h-4 mr-2" /> {guide.date}</span>
                <span>•</span>
                <span>{content.readTime}</span>
            </div>
        </header>
        
        <div 
            className="prose prose-lg prose-indigo dark:prose-invert mx-auto text-gray-600 dark:text-gray-300"
            dangerouslySetInnerHTML={{ __html: content.content }}
        />
      </article>
      
      <div className="mt-16 pt-8 border-t border-gray-200 dark:border-slate-800">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">More Guides</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {guides.filter(g => g.id !== guide.id).slice(0, 2).map(g => {
                const c = g.translations[language] || g.translations['en'];
                if (!c) return null;
                return (
                    <Link key={g.id} to={`/guides/${g.slug}`} className="block p-4 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-indigo-300 hover:shadow-md transition-all">
                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">{c.title}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{c.excerpt}</p>
                    </Link>
                )
            })}
        </div>
      </div>
    </div>
  );
};

export default GuidePost;