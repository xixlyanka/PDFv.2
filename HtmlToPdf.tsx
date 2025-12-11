import React, { useState } from 'react';
import { ProcessingResult, JobStatus } from '../types';
import { Code, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { docService } from '../services/docService';
import RewardedDownload from '../components/RewardedDownload';
import SEO from '../components/SEO';
import GoogleAd from '../components/GoogleAd';
import { AD_SLOTS } from '../constants';
import { useToast } from '../contexts/ToastContext';

const HtmlToPdf: React.FC = () => {
  const [inputMode, setInputMode] = useState<'html' | 'url'>('html');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<JobStatus>('idle');
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const { addToast } = useToast();

  const handleProcess = async () => {
    if (!content) {
        addToast("Please enter HTML content", 'error');
        return;
    }

    setStatus('processing');
    try {
      const res = await docService.htmlToPdf(content, inputMode === 'url');
      setResult(res);
      setStatus('completed');
    } catch (e: any) {
      addToast(e.message, 'error');
      setStatus('error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <SEO 
        title="HTML to PDF" 
        description="Convert HTML code or Strings to PDF documents online."
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <div className="text-center lg:text-left mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">HTML to PDF</h1>
                <p className="mt-3 text-lg text-gray-500 dark:text-gray-400">Render raw HTML code into a document.</p>
            </div>

            <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-green-700 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                <h4 className="text-sm font-bold text-green-800 dark:text-green-400">Local Rendering</h4>
                <p className="text-sm text-green-700 dark:text-green-300">We render the HTML using an invisible canvas in your browser.</p>
                </div>
            </div>

            <div className="glass-panel rounded-2xl shadow-sm p-6 md:p-8">
                <div className="space-y-6 animate-fade-in">
                    
                    {status === 'idle' && (
                        <div className="space-y-4">
                            <div className="flex space-x-4 mb-4">
                                <button 
                                    onClick={() => setInputMode('html')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium ${inputMode === 'html' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-400' : 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-400'}`}
                                >
                                    Raw HTML
                                </button>
                                <button 
                                    onClick={() => setInputMode('url')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-slate-800`}
                                    title="Disabled due to CORS restrictions in browser-only mode"
                                >
                                    URL (Server required)
                                </button>
                            </div>

                            <textarea 
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="<h1>Hello World</h1><p>Paste your HTML code here...</p>"
                                className="w-full h-64 p-4 border border-gray-300 dark:border-slate-600 rounded-lg font-mono text-sm bg-white dark:bg-slate-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500"
                            />

                            <button 
                                onClick={handleProcess}
                                className="w-full py-3 bg-gradient-to-r from-indigo-600/70 to-purple-600/70 hover:from-indigo-600 hover:to-purple-600 text-white backdrop-blur-md border border-white/20 shadow-lg shadow-indigo-500/30 rounded-lg font-bold transition-all flex justify-center items-center"
                            >
                                Convert to PDF <Code className="ml-2 w-5 h-5" />
                            </button>
                        </div>
                    )}

                    {status === 'processing' && (
                        <div className="text-center py-10">
                            <Loader2 className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin mx-auto mb-4" />
                            <p className="text-gray-600 dark:text-gray-300">Rendering HTML...</p>
                        </div>
                    )}

                    {status === 'completed' && result && (
                        <RewardedDownload downloadUrl={result.downloadUrl} fileName={result.fileName} />
                    )}
                </div>
            </div>

            {/* Bottom Ad Banner */}
            <div className="mt-12 glass-panel p-4 rounded-xl flex justify-center">
                 <GoogleAd slot={AD_SLOTS.TOOL_BOTTOM} format="rectangle" className="w-full max-w-[728px]" />
            </div>
        </div>

        {/* Sidebar Ad Column */}
        <div className="hidden lg:block lg:col-span-1 space-y-6">
            <div className="glass-panel p-4 rounded-xl sticky top-24">
                <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 text-center">Sponsored</div>
                <GoogleAd slot={AD_SLOTS.SIDEBAR} format="rectangle" className="min-h-[600px] w-full" />
            </div>
        </div>

      </div>
    </div>
  );
};

export default HtmlToPdf;