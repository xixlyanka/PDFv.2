

import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Minimize2, Layers, ArrowRight, ShieldCheck, Scissors, RotateCw, Stamp, Maximize, LayoutGrid, Lock, Unlock, Hash, Wrench, PenTool, Monitor, ScanText, Image as ImageIcon, Tags, Code, Archive, FileText, Clock } from 'lucide-react';
import { ROUTES, AD_SLOTS } from '../constants';
import SEO from '../components/SEO';
import TiltCard from '../components/TiltCard';
import GoogleAd from '../components/GoogleAd';
import { useLanguage } from '../contexts/LanguageContext';
import { useAdSettings } from '../contexts/AdSettingsContext';
import { translations } from '../translations';
import { useStats } from '../contexts/StatsContext';

const Home: React.FC = () => {
  const { t } = useLanguage();
  const { showAds } = useAdSettings();
  const { recentTools } = useStats();

  const tools = [
      { id: 'convert', path: ROUTES.CONVERT, icon: Zap, color: 'indigo' },
      { id: 'compress', path: ROUTES.COMPRESS, icon: Minimize2, color: 'blue' },
      { id: 'merge', path: ROUTES.MERGE, icon: Layers, color: 'purple' },
      { id: 'invoicegenerator', path: ROUTES.INVOICE_GENERATOR, icon: FileText, color: 'emerald' },
      { id: 'sign', path: ROUTES.SIGN, icon: PenTool, color: 'cyan' },
      { id: 'ocr', path: ROUTES.OCR, icon: ScanText, color: 'emerald' },
      { id: 'extractimages', path: ROUTES.EXTRACT_IMAGES, icon: ImageIcon, color: 'rose' },
      { id: 'htmltopdf', path: ROUTES.HTML_TO_PDF || '/html-to-pdf', icon: Code, color: 'orange' },
      { id: 'pdftopdfa', path: ROUTES.PDF_TO_PDFA || '/pdf-to-pdfa', icon: Archive, color: 'sky' },
      { id: 'editmetadata', path: ROUTES.EDIT_METADATA, icon: Tags, color: 'slate' },
      { id: 'organize', path: ROUTES.ORGANIZE, icon: LayoutGrid, color: 'yellow' },
      { id: 'split', path: ROUTES.SPLIT, icon: Scissors, color: 'pink' },
      { id: 'rotate', path: ROUTES.ROTATE, icon: RotateCw, color: 'orange' },
      { id: 'resize', path: ROUTES.RESIZE, icon: Maximize, color: 'teal' },
      { id: 'crop', path: ROUTES.CROP, icon: Scissors, color: 'emerald' },
      { id: 'watermark', path: ROUTES.WATERMARK, icon: Stamp, color: 'red' },
      { id: 'grayscale', path: ROUTES.GRAYSCALE, icon: Monitor, color: 'stone' },
      { id: 'flatten', path: ROUTES.FLATTEN, icon: Layers, color: 'slate' },
      { id: 'protect', path: ROUTES.PROTECT, icon: Lock, color: 'cyan' },
      { id: 'unlock', path: ROUTES.UNLOCK, icon: Unlock, color: 'emerald' },
      { id: 'pagenumbers', path: ROUTES.PAGE_NUMBERS, icon: Hash, color: 'slate' },
      { id: 'repair', path: ROUTES.REPAIR, icon: Wrench, color: 'gray' },
  ];

  return (
    <div className="space-y-16 pb-32">
      <SEO title="Home" />
      
      {/* Hero Section */}
      <section className="relative z-10 flex flex-col justify-center items-center min-h-[75vh] px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-6 inline-flex items-center px-4 py-1.5 rounded-full border border-green-200 bg-green-50 dark:bg-green-900/30 dark:border-green-800 text-green-700 dark:text-green-400 text-sm font-medium shadow-sm animate-fade-in">
          <ShieldCheck className="w-4 h-4 mr-2" />
          {t('hero.badge')}
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6 max-w-4xl leading-tight">
          {t('hero.title')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">{t('hero.documents')}</span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300 mb-8">
          {t('hero.subtitle')}
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 relative">
          <Link
            to={ROUTES.CONVERT}
            className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-indigo-600/70 to-purple-600/70 hover:from-indigo-600 hover:to-purple-600 text-white backdrop-blur-md border border-white/20 shadow-lg shadow-indigo-500/30 rounded-full text-base font-medium md:text-lg transition-all hover:shadow-indigo-500/50"
          >
            {t('hero.btn_start')}
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
          <Link
            to={ROUTES.ABOUT}
            className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 dark:border-slate-700 text-base font-medium rounded-full text-gray-700 dark:text-gray-200 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 backdrop-blur-sm md:text-lg transition-all hover:shadow-md"
          >
            {t('hero.btn_learn')}
          </Link>

          {/* Animated Arrow */}
          <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center opacity-60 pointer-events-none">
              <span className="text-lg font-['Patrick_Hand'] text-indigo-500 dark:text-indigo-400 -rotate-12 mb-1">Try it out!</span>
              <svg width="20" height="30" viewBox="0 0 40 60" fill="none" className="text-indigo-500 dark:text-indigo-400">
                  <path d="M10 10 Q 20 50 30 50" stroke="currentColor" strokeWidth="3" fill="none" className="animate-draw-arrow" />
                  <path d="M25 45 L 30 50 L 35 40" stroke="currentColor" strokeWidth="3" fill="none" className="animate-draw-arrow" style={{ animationDelay: '0.5s' }} />
              </svg>
          </div>
        </div>
      </section>

      {/* Aesthetic Ad Banner - Only if ads enabled */}
      {showAds && (
        <section className="max-w-4xl mx-auto px-4">
            <div className="glass-panel p-4 rounded-xl flex justify-center items-center min-h-[120px]">
                <GoogleAd slot={AD_SLOTS.HOME_MID} format="rectangle" className="w-full max-w-[728px]" />
            </div>
        </section>
      )}

      {/* Recent Tools Section */}
      {recentTools.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-indigo-500" />
                  {t('home.recent_tools')}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {recentTools.map(toolId => {
                      const tool = tools.find(t => t.id === toolId);
                      if (!tool) return null;
                      return (
                          <Link key={tool.id} to={tool.path} className="flex items-center p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition-all">
                              <div className={`p-2 rounded-lg bg-${tool.color}-100 dark:bg-${tool.color}-900/30 text-${tool.color}-600 dark:text-${tool.color}-400 mr-3`}>
                                  <tool.icon className="w-5 h-5" />
                              </div>
                              <span className="font-medium text-gray-900 dark:text-white text-sm">{t(`tools.${tool.id}.title` as keyof typeof translations['en'])}</span>
                          </Link>
                      );
                  })}
              </div>
          </section>
      )}

      {/* Tools Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tools.map((tool) => (
                <TiltCard key={tool.id}>
                    <Link to={tool.path} className={`glass-panel group relative rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 block border border-white/50 dark:border-white/10 hover:border-${tool.color}-200 dark:hover:border-${tool.color}-700 h-full`}>
                        <div className="relative">
                        <div className={`w-12 h-12 bg-${tool.color}-100 dark:bg-${tool.color}-900/30 rounded-xl flex items-center justify-center text-${tool.color}-600 dark:text-${tool.color}-400 mb-4 group-hover:bg-${tool.color}-600 group-hover:text-white transition-colors shadow-inner`}>
                            <tool.icon className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t(`tools.${tool.id}.title` as keyof typeof translations['en'])}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                            {t(`tools.${tool.id}.desc` as keyof typeof translations['en'])}
                        </p>
                        </div>
                    </Link>
                </TiltCard>
            ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('how.title')}</h2>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">{t('how.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { title: t('how.step1'), desc: t('how.step1_desc') },
              { title: t('how.step2'), desc: t('how.step2_desc') },
              { title: t('how.step3'), desc: t('how.step3_desc') },
            ].map((step, idx) => (
              <div key={idx} className="relative glass-panel p-8 rounded-2xl">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full font-bold text-xl mb-4 shadow-lg shadow-indigo-500/20">
                  {idx + 1}
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-gray-500 dark:text-gray-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEO / FAQ Section */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">{t('faq.title')}</h2>
        <div className="space-y-6">
            {[
                { q: t('faq.q1'), a: t('faq.a1') },
                { q: t('faq.q2'), a: t('faq.a2') },
                { q: t('faq.q3'), a: t('faq.a3') }
            ].map((item, i) => (
                <div key={i} className="glass-panel rounded-xl shadow-sm p-6 hover:bg-white/40 dark:hover:bg-slate-800/50 transition-colors">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{item.q}</h3>
                    <p className="text-gray-500 dark:text-gray-400">{item.a}</p>
                </div>
            ))}
        </div>
      </section>
    </div>
  );
};

export default Home;