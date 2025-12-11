



import React, { useState, useEffect } from 'react';
import { UploadedFile, ProcessingResult, JobStatus } from '@/types';
import FileDropzone from '@/FileDropzone';
import { Minimize2, Loader2, FileText, ShieldCheck } from 'lucide-react';
import { docService } from '@/docService';
import RewardedDownload from '@/RewardedDownload';
import SEO from '@/SEO';
import GoogleAd from '@/GoogleAd';
import { AD_SLOTS } from '@/constants';
import { useStats } from '@/StatsContext';
import { useLanguage } from '@/LanguageContext';
import { useAdSettings } from '@/AdSettingsContext';
import { useFileHandler } from '@/FileHandlerContext';
import { useToast } from '@/ToastContext';

const Compress: React.FC = () => {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [level, setLevel] = useState<number>(50); // 0 to 100
  const [status, setStatus] = useState<JobStatus>('idle');
  const [result, setResult] = useState<ProcessingResult | null>(null);
  
  const { incrementStats } = useStats();
  const { t } = useLanguage();
  const { showAds } = useAdSettings();
  const { pipelineFile, clearPipeline } = useFileHandler();
  const { addToast } = useToast();

  useEffect(() => {
      if (pipelineFile) {
          setFile(pipelineFile);
          addToast("File loaded from previous step", 'info');
          clearPipeline();
      }
  }, [pipelineFile, clearPipeline, addToast]);

  const handleFiles = (files: UploadedFile[]) => {
    if (files[0].type !== 'PDF') {
        alert("Please upload a PDF file.");
        return;
    }
    setFile(files[0]);
    setStatus('idle');
    setResult(null);
  };

  const handleCompress = async () => {
    if (!file) return;
    setStatus('processing');
    try {
      const res = await docService.compress(file, level);
      setResult(res);
      setStatus('completed');
      incrementStats('compress', file.size);
    } catch (e) {
      setStatus('error');
      addToast("Не удалось сжать PDF. Попробуйте ещё раз или уменьшите уровень качества.", 'error');
    }
  };

  const getCompressionColor = (val: number) => {
      if (val < 33) return 'text-green-600 dark:text-green-400';
      if (val < 66) return 'text-yellow-600 dark:text-yellow-400';
      return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <SEO 
        title="Compress PDF" 
        description="Reduce PDF file size online. Granular control over compression level."
      />

      <div className={showAds ? "grid grid-cols-1 lg:grid-cols-3 gap-8" : "w-full max-w-4xl mx-auto"}>
         <div className={showAds ? "lg:col-span-2" : "col-span-1"}>
            <div className="text-center lg:text-left mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">Compress PDF</h1>
                <p className="mt-3 text-lg text-gray-500 dark:text-gray-400">Reduce PDF file size with granular control.</p>
            </div>

            <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-green-700 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                <h4 className="text-sm font-bold text-green-800 dark:text-green-400">Secure Client-Side Processing</h4>
                <p className="text-sm text-green-700 dark:text-green-300">Your PDF is compressed right here in your browser.</p>
                </div>
            </div>

            <div className="glass-panel rounded-2xl shadow-sm p-6 md:p-8">
                {!file ? (
                <FileDropzone onFilesSelected={handleFiles} maxSizeMB={50} accept={['.pdf']} />
                ) : (
                <div className="space-y-8">
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
                        <div className="bg-white/50 dark:bg-slate-800/50 p-6 rounded-xl border border-gray-100 dark:border-slate-700">
                            <div className="flex justify-between items-end mb-4">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Compression Level</label>
                                <span className={`text-xl font-black ${getCompressionColor(level)}`}>{level}%</span>
                            </div>
                            
                            <input 
                                type="range" 
                                min="0" 
                                max="100" 
                                value={level} 
                                onChange={(e) => setLevel(parseInt(e.target.value))}
                                className="w-full h-3 bg-gray-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer range-slider"
                            />
                            
                            <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                                <span>Low Compression<br/>(High Quality)</span>
                                <span className="text-right">Extreme Compression<br/>(Lower Quality)</span>
                            </div>

                            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                                Сжатие выполняется через повторный рендер страниц в JPEG. Чем выше ползунок, тем сильнее уменьшается разрешение и качество изображений.
                            </p>
                        </div>
                    )}

                    {status === 'idle' && (
                        <button 
                            onClick={handleCompress}
                            className="w-full py-3 bg-gradient-to-r from-indigo-600/70 to-purple-600/70 hover:from-indigo-600 hover:to-purple-600 text-white backdrop-blur-md border border-white/20 shadow-lg shadow-indigo-500/30 rounded-lg font-bold transition-all flex justify-center items-center"
                        >
                            Compress PDF <Minimize2 className="ml-2 w-5 h-5" />
                        </button>
                    )}

                    {status === 'processing' && (
                        <div className="text-center py-10">
                            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
                            <p className="text-gray-600 dark:text-gray-300">{docService.getRandomLoadingMessage()}</p>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="text-center py-6 text-red-600 dark:text-red-400 font-semibold">
                            Произошла ошибка при сжатии. Проверьте файл и попробуйте снова.
                        </div>
                    )}

                    {status === 'completed' && result && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
                                <span>New Size: {result.fileSize}</span>
                                <span>Saved: {((1 - (parseFloat(result.fileSize) / (file.size / 1024))) * 100).toFixed(0)}% (est)</span>
                            </div>
                            <RewardedDownload downloadUrl={result.downloadUrl} fileName={result.fileName} toolId="compress" />
                        </div>
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
                    <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 text-center">{t('ad.sponsored')}</div>
                    <GoogleAd slot={AD_SLOTS.SIDEBAR} format="rectangle" className="min-h-[600px] w-full" />
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default Compress;