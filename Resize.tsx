

import React, { useState } from 'react';
import { UploadedFile, ProcessingResult, JobStatus } from '../types';
import FileDropzone from '../components/FileDropzone';
import { Maximize, Loader2, AlertCircle, FileText, ShieldCheck } from 'lucide-react';
import { docService } from '../services/docService';
import RewardedDownload from '../components/RewardedDownload';
import SEO from '../components/SEO';
import { PAPER_SIZES } from '../constants';
import GoogleAd from '../components/GoogleAd';
import { AD_SLOTS } from '../constants';

const Resize: React.FC = () => {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [targetSize, setTargetSize] = useState<keyof typeof PAPER_SIZES | 'Custom'>('A4');
  const [customWidth, setCustomWidth] = useState<string>('210'); // mm
  const [customHeight, setCustomHeight] = useState<string>('297'); // mm
  const [fitContent, setFitContent] = useState(true);
  const [status, setStatus] = useState<JobStatus>('idle');
  const [progressMsg, setProgressMsg] = useState('');
  const [result, setResult] = useState<ProcessingResult | null>(null);

  const handleFiles = (files: UploadedFile[]) => {
    if (files[0].type !== 'PDF') {
        alert("Please upload a PDF file.");
        return;
    }
    setFile(files[0]);
    setStatus('idle');
    setResult(null);
  };

  const handleProcess = async () => {
    if (!file) return;
    setStatus('processing');
    try {
        const res = await docService.resize(file, {
            targetSize,
            width: targetSize === 'Custom' ? parseFloat(customWidth) : undefined,
            height: targetSize === 'Custom' ? parseFloat(customHeight) : undefined,
            fitContent
        }, (msg) => setProgressMsg(msg));
        
        setResult(res);
        setStatus('completed');
    } catch (e: any) {
        setStatus('error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <SEO 
        title="Resize PDF" 
        description="Change PDF page size to A4, Letter, or custom dimensions online."
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <div className="text-center lg:text-left mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">Resize PDF Pages</h1>
                <p className="mt-3 text-lg text-gray-500 dark:text-gray-400">Change document dimensions and scale content.</p>
            </div>

            <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-green-700 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                <h4 className="text-sm font-bold text-green-800 dark:text-green-400">Secure Client-Side Resizing</h4>
                <p className="text-sm text-green-700 dark:text-green-300">All logic runs locally. Your file is never uploaded.</p>
                </div>
            </div>

            <div className="glass-panel rounded-2xl shadow-sm p-6 md:p-8">
                {!file ? (
                <FileDropzone onFilesSelected={handleFiles} maxSizeMB={50} accept={['.pdf']} />
                ) : (
                <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center justify-between bg-white/50 dark:bg-slate-800/50 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
                        <div className="flex items-center space-x-4">
                            <FileText className="text-red-500 w-8 h-8" />
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">{file.file.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                        </div>
                        {status === 'idle' && (
                            <button onClick={() => setFile(null)} className="text-sm text-red-500 font-medium">Change</button>
                        )}
                    </div>

                    {status === 'idle' && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Page Size</label>
                                <select 
                                    value={targetSize}
                                    onChange={(e) => setTargetSize(e.target.value as any)}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700 dark:text-white"
                                >
                                    {Object.keys(PAPER_SIZES).map((size) => (
                                        <option key={size} value={size}>{size}</option>
                                    ))}
                                    <option value="Custom">Custom Size</option>
                                </select>
                            </div>

                            {targetSize === 'Custom' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Width (mm)</label>
                                        <input 
                                            type="number" 
                                            value={customWidth}
                                            onChange={(e) => setCustomWidth(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Height (mm)</label>
                                        <input 
                                            type="number" 
                                            value={customHeight}
                                            onChange={(e) => setCustomHeight(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 dark:text-white"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center">
                                <input
                                    id="fit-content"
                                    type="checkbox"
                                    checked={fitContent}
                                    onChange={(e) => setFitContent(e.target.checked)}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                                />
                                <label htmlFor="fit-content" className="ml-2 block text-sm text-gray-900 dark:text-white">
                                    Scale content to fit new page size
                                </label>
                            </div>

                            <button 
                                onClick={handleProcess}
                                className="w-full py-3 bg-gradient-to-r from-indigo-600/70 to-purple-600/70 hover:from-indigo-600 hover:to-purple-600 text-white backdrop-blur-md border border-white/20 shadow-lg shadow-indigo-500/30 rounded-lg font-bold transition-all flex justify-center items-center"
                            >
                                Resize PDF <Maximize className="ml-2 w-5 h-5" />
                            </button>
                        </div>
                    )}

                    {status === 'processing' && (
                        <div className="text-center py-10">
                            <Loader2 className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin mx-auto mb-4" />
                            <p className="text-gray-600 dark:text-gray-300 font-medium">Resizing...</p>
                            <p className="text-sm text-indigo-500 dark:text-indigo-400 mt-2">{progressMsg || docService.getRandomLoadingMessage()}</p>
                        </div>
                    )}

                    {status === 'completed' && result && (
                        <div className="space-y-4">
                            <RewardedDownload downloadUrl={result.downloadUrl} fileName={result.fileName} />
                        </div>
                    )}
                </div>
                )}
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

export default Resize;