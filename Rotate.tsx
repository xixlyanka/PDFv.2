

import React, { useState } from 'react';
import { UploadedFile, ProcessingResult, JobStatus } from '@/types';
import FileDropzone from '@/FileDropzone';
import { RotateCw, RotateCcw, Loader2, AlertCircle, FileText, ShieldCheck } from 'lucide-react';
import { docService } from '@/docService';
import RewardedDownload from '@/RewardedDownload';
import SEO from '@/SEO';
import GoogleAd from '@/GoogleAd';
import { AD_SLOTS } from '@/constants';

const Rotate: React.FC = () => {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [rotation, setRotation] = useState<number>(0);
  const [status, setStatus] = useState<JobStatus>('idle');
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = (files: UploadedFile[]) => {
    if (files[0].type !== 'PDF') {
        alert("Please upload a PDF file.");
        return;
    }
    setFile(files[0]);
    setStatus('idle');
    setResult(null);
    setRotation(0);
  };

  const handleRotateLeft = () => setRotation((prev) => (prev - 90));
  const handleRotateRight = () => setRotation((prev) => (prev + 90));

  const handleProcess = async () => {
    if (!file) return;
    setStatus('processing');
    try {
        // We pass the net rotation
        const res = await docService.rotate(file, rotation);
        setResult(res);
        setStatus('completed');
    } catch (e: any) {
        setError(e.message);
        setStatus('error');
    }
  };

  // Visual helper for preview
  const getPreviewRotation = () => {
      // Normalize to 0-360 for CSS
      return ((rotation % 360) + 360) % 360;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <SEO 
        title="Rotate PDF" 
        description="Rotate PDF pages permanently. Free, secure, client-side tool."
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <div className="text-center lg:text-left mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">Rotate PDF</h1>
                <p className="mt-3 text-lg text-gray-500 dark:text-gray-400">Rotate your PDF files permanently.</p>
            </div>

            <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-green-700 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                <h4 className="text-sm font-bold text-green-800 dark:text-green-400">Secure Client-Side Rotation</h4>
                <p className="text-sm text-green-700 dark:text-green-300">Your PDF is processed right here in your browser.</p>
                </div>
            </div>

            <div className="glass-panel rounded-2xl shadow-sm p-6 md:p-8">
                {!file ? (
                <FileDropzone onFilesSelected={handleFiles} maxSizeMB={50} accept={['.pdf']} />
                ) : (
                <div className="space-y-8 animate-fade-in">
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
                        <div className="flex flex-col items-center space-y-8 py-4">
                            {/* Visual Preview */}
                            <div className="relative w-48 h-64 bg-gray-200 dark:bg-slate-700 border-2 border-dashed border-gray-400 dark:border-slate-500 rounded-lg flex items-center justify-center transition-transform duration-500" 
                                style={{ transform: `rotate(${getPreviewRotation()}deg)` }}
                            >
                                <FileText className="w-16 h-16 text-gray-400 dark:text-gray-500" />
                                <span className="absolute bottom-2 text-xs text-gray-500 font-bold">PAGE 1</span>
                            </div>

                            <div className="flex space-x-6">
                                <button 
                                    onClick={handleRotateLeft}
                                    className="flex flex-col items-center p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-indigo-300 transition-all"
                                >
                                    <RotateCcw className="w-8 h-8 text-gray-700 dark:text-gray-300 mb-2" />
                                    <span className="text-sm font-medium dark:text-gray-200">Left 90°</span>
                                </button>
                                <button 
                                    onClick={handleRotateRight}
                                    className="flex flex-col items-center p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-indigo-300 transition-all"
                                >
                                    <RotateCw className="w-8 h-8 text-gray-700 dark:text-gray-300 mb-2" />
                                    <span className="text-sm font-medium dark:text-gray-200">Right 90°</span>
                                </button>
                            </div>

                            <button 
                                onClick={handleProcess}
                                className="w-full max-w-md py-3 bg-gradient-to-r from-indigo-600/70 to-purple-600/70 hover:from-indigo-600 hover:to-purple-600 text-white backdrop-blur-md border border-white/20 shadow-lg shadow-indigo-500/30 rounded-lg font-bold transition-all flex justify-center items-center"
                            >
                                Apply Rotation
                            </button>
                        </div>
                    )}

                    {status === 'processing' && (
                        <div className="text-center py-10">
                            <Loader2 className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin mx-auto mb-4" />
                            <p className="text-gray-600 dark:text-gray-300">Rotating PDF locally...</p>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start space-x-3">
                            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-medium text-red-800 dark:text-red-400">Rotation Failed</h4>
                                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                                <button onClick={() => setStatus('idle')} className="mt-2 text-xs font-bold text-red-800 hover:underline">Try again</button>
                            </div>
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

export default Rotate;