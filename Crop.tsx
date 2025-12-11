
import React, { useState } from 'react';
import { UploadedFile, ProcessingResult, JobStatus } from '../types';
import FileDropzone from '../components/FileDropzone';
import { Scissors, Loader2, AlertCircle, FileText, ShieldCheck } from 'lucide-react';
import { docService } from '../services/docService';
import RewardedDownload from '../components/RewardedDownload';
import SEO from '../components/SEO';
import GoogleAd from '../components/GoogleAd';
import { AD_SLOTS } from '../constants';
import { useToast } from '../contexts/ToastContext';
import { useAdSettings } from '../contexts/AdSettingsContext';
import { useStats } from '../contexts/StatsContext';

const Crop: React.FC = () => {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [margins, setMargins] = useState({ top: 0, bottom: 0, left: 0, right: 0 });
  const [status, setStatus] = useState<JobStatus>('idle');
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const { addToast } = useToast();
  const { showAds } = useAdSettings();
  const { incrementStats } = useStats();

  const handleFiles = (files: UploadedFile[]) => {
    if (files[0].type !== 'PDF') {
        addToast("Please upload a PDF file.", 'error');
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
      const res = await docService.crop(file, margins);
      setResult(res);
      setStatus('completed');
      incrementStats('crop', file.size);
      addToast("Cropped successfully!", 'success');
    } catch (e: any) {
      setStatus('error');
      addToast(e.message, 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <SEO 
        title="Crop PDF" 
        description="Crop PDF pages by setting margins online. Remove white borders."
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className={showAds ? "lg:col-span-2" : "lg:col-span-3"}>
            <div className="text-center lg:text-left mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">Crop PDF</h1>
                <p className="mt-3 text-lg text-gray-500 dark:text-gray-400">Trim white margins or change page area.</p>
            </div>

            <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-green-700 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                <h4 className="text-sm font-bold text-green-800 dark:text-green-400">Local Processing</h4>
                <p className="text-sm text-green-700 dark:text-green-300">Cropping coordinates are applied directly in your browser.</p>
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
                        <div className="space-y-6 max-w-sm mx-auto">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">Set Crop Margins (Millimeters)</p>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Top (mm)</label>
                                    <input 
                                        type="number" 
                                        value={margins.top}
                                        onChange={(e) => setMargins({...margins, top: parseFloat(e.target.value) || 0})}
                                        className="w-full px-3 py-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Bottom (mm)</label>
                                    <input 
                                        type="number" 
                                        value={margins.bottom}
                                        onChange={(e) => setMargins({...margins, bottom: parseFloat(e.target.value) || 0})}
                                        className="w-full px-3 py-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Left (mm)</label>
                                    <input 
                                        type="number" 
                                        value={margins.left}
                                        onChange={(e) => setMargins({...margins, left: parseFloat(e.target.value) || 0})}
                                        className="w-full px-3 py-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Right (mm)</label>
                                    <input 
                                        type="number" 
                                        value={margins.right}
                                        onChange={(e) => setMargins({...margins, right: parseFloat(e.target.value) || 0})}
                                        className="w-full px-3 py-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    />
                                </div>
                            </div>

                            <button 
                                onClick={handleProcess}
                                className="w-full py-3 bg-gradient-to-r from-indigo-600/70 to-purple-600/70 hover:from-indigo-600 hover:to-purple-600 text-white backdrop-blur-md border border-white/20 shadow-lg shadow-indigo-500/30 rounded-lg font-bold transition-all flex justify-center items-center"
                            >
                                Crop PDF <Scissors className="ml-2 w-5 h-5" />
                            </button>
                        </div>
                    )}

                    {status === 'processing' && (
                        <div className="text-center py-10">
                            <Loader2 className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin mx-auto mb-4" />
                            <p className="text-gray-600 dark:text-gray-300">Cropping...</p>
                        </div>
                    )}

                    {status === 'completed' && result && (
                        <RewardedDownload downloadUrl={result.downloadUrl} fileName={result.fileName} toolId="crop" />
                    )}
                </div>
                )}
            </div>

            {/* Bottom Ad Banner */}
            {showAds && (
                <div className="mt-12 glass-panel p-4 rounded-xl flex justify-center">
                    <GoogleAd slot={AD_SLOTS.TOOL_BOTTOM} format="rectangle" className="w-full max-w-[728px]" />
                </div>
            )}
        </div>

        {/* Sidebar Ad Column */}
        {showAds && (
            <div className="hidden lg:block lg:col-span-1 space-y-6">
                <div className="glass-panel p-4 rounded-xl sticky top-24">
                    <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 text-center">Sponsored</div>
                    <GoogleAd slot={AD_SLOTS.SIDEBAR} format="rectangle" className="min-h-[600px] w-full" />
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Crop;