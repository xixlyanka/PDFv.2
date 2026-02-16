
import React, { useState } from 'react';
import { UploadedFile, ProcessingResult, JobStatus } from '@/types';
import FileDropzone from '@/FileDropzone';
import { FileText, ArrowRight, Loader2, AlertCircle, ShieldCheck, Info, Settings2 } from 'lucide-react';
import { docService } from '@/docService';
import RewardedDownload from '@/RewardedDownload';
import SEO from '@/SEO';
import GoogleAd from '@/GoogleAd';
import { AD_SLOTS } from '@/constants';
import { useStats } from '@/StatsContext';
import { useLanguage } from '@/LanguageContext';
import { useAdSettings } from '@/AdSettingsContext';

const Convert: React.FC = () => {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [targetFormat, setTargetFormat] = useState<string>('PDF');
  const [status, setStatus] = useState<JobStatus>('idle');
  const [progressMsg, setProgressMsg] = useState<string>('Starting...');
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { incrementStats } = useStats();
  const { t } = useLanguage();
  const { showAds } = useAdSettings();

  // Advanced Settings for Image->PDF
  const [pageSize, setPageSize] = useState('Fit');
  const [orientation, setOrientation] = useState('Auto');
  const [margin, setMargin] = useState<'none' | 'small' | 'large'>('none');

  const handleFiles = (files: UploadedFile[]) => {
    setFile(files[0]);
    setStatus('idle');
    setResult(null);
    setError(null);
    
    // Auto-suggest target
    if (files[0].type === 'DOCX') setTargetFormat('PDF');
    if (files[0].type === 'XLSX') setTargetFormat('PDF');
    if (files[0].type === 'PDF') setTargetFormat('JPG');
    if (files[0].type === 'JPG' || files[0].type === 'PNG') setTargetFormat('PDF');
  };

  const handleConvert = async () => {
    if (!file) return;
    setStatus('processing');
    setError(null);
    setProgressMsg("Preparing file...");
    
    try {
      const res = await docService.convert(file, targetFormat, (msg) => {
          setProgressMsg(msg);
      }, {
          pageSize,
          orientation,
          margin
      });
      setResult(res);
      setStatus('completed');
      incrementStats('convert', file.size);
    } catch (e: any) {
      setError(e.message || "An error occurred");
      setStatus('error');
    }
  };

  const isImageToPdf = file && (file.type === 'JPG' || file.type === 'PNG') && targetFormat === 'PDF';

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <SEO 
        title="Convert Documents" 
        description="Convert PDF to Word, Images to PDF, Excel to PDF and more online for free. Secure client-side conversion."
      />
      
      <div className={showAds ? "grid grid-cols-1 lg:grid-cols-3 gap-8" : "w-full max-w-4xl mx-auto"}>
        
        {/* Main Tool Area */}
        <div className={showAds ? "lg:col-span-2" : "col-span-1"}>
            <div className="text-center lg:text-left mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">Convert Documents</h1>
                <p className="mt-3 text-lg text-gray-500 dark:text-gray-400">Convert PDF to JPG, Images to PDF, Excel to PDF, Word to PDF.</p>
            </div>

            <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-green-700 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                <h4 className="text-sm font-bold text-green-800 dark:text-green-400">Privacy First</h4>
                <p className="text-sm text-green-700 dark:text-green-300">Your files are processed locally in your browser. We never upload or store your documents.</p>
                </div>
            </div>

            <div className="glass-panel rounded-2xl shadow-sm p-6 md:p-8">
                {!file ? (
                    <FileDropzone onFilesSelected={handleFiles} maxSizeMB={20} accept={['.pdf', '.docx', '.pptx', '.jpg', '.png', '.xlsx', '.xls']} />
                ) : (
                    <div className="space-y-6 animate-fade-in">
                    {/* Selected File Card */}
                    <div className="flex items-center justify-between bg-white/50 dark:bg-slate-800/50 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
                        <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            <FileText className="h-6 w-6" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px]">{file.file.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        </div>
                        {status === 'idle' && (
                        <button onClick={() => setFile(null)} className="text-xs text-red-500 hover:text-red-700 font-medium">Remove</button>
                        )}
                    </div>

                    {/* Settings */}
                    {status === 'idle' && (
                        <div className="space-y-6">
                        <div className="flex items-center justify-between border-t border-gray-100 dark:border-slate-700 pt-6">
                            <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Convert to:</span>
                            <select 
                                value={targetFormat} 
                                onChange={(e) => setTargetFormat(e.target.value)}
                                className="block w-40 pl-3 pr-10 py-2 text-base border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white/50 dark:bg-slate-800 dark:text-white"
                            >
                                {file.type === 'DOCX' && <option value="PDF">PDF</option>}
                                {file.type === 'XLSX' && <option value="PDF">PDF</option>}
                                {file.type === 'PDF' && <option value="JPG">JPG (Images)</option>}
                                {(file.type === 'JPG' || file.type === 'PNG') && <option value="PDF">PDF</option>}
                            </select>
                            </div>
                            <button 
                            onClick={handleConvert}
                            className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-indigo-600/70 to-purple-600/70 hover:from-indigo-600 hover:to-purple-600 text-white backdrop-blur-md border border-white/20 shadow-lg shadow-indigo-500/30 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                            Convert Now <ArrowRight className="ml-2 w-4 h-4" />
                            </button>
                        </div>
                        
                        {/* Advanced Settings for Image to PDF */}
                        {isImageToPdf && (
                            <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
                                <div className="flex items-center gap-2 mb-3 text-indigo-700 dark:text-indigo-400">
                                    <Settings2 className="w-4 h-4" />
                                    <span className="text-sm font-bold">Layout Settings</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Page Size</label>
                                        <select 
                                            value={pageSize}
                                            onChange={(e) => setPageSize(e.target.value)}
                                            className="w-full text-sm rounded border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                                        >
                                            <option value="Fit">Fit to Image</option>
                                            <option value="A4">A4</option>
                                            <option value="Letter">Letter</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Orientation</label>
                                        <select 
                                            value={orientation}
                                            onChange={(e) => setOrientation(e.target.value)}
                                            className="w-full text-sm rounded border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                                        >
                                            <option value="Auto">Auto</option>
                                            <option value="Portrait">Portrait</option>
                                            <option value="Landscape">Landscape</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Margins</label>
                                        <select 
                                            value={margin}
                                            onChange={(e) => setMargin(e.target.value as any)}
                                            className="w-full text-sm rounded border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                                        >
                                            <option value="none">None</option>
                                            <option value="small">Small</option>
                                            <option value="large">Large</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Client-Side Limitations Warning */}
                        {(file.type === 'DOCX' || file.type === 'XLSX') && targetFormat === 'PDF' && (
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3 flex gap-3 text-sm">
                                <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
                                <span className="text-yellow-700 dark:text-yellow-400">
                                    <strong>Note:</strong> We use browser-based conversion. Complex formatting may be simplified.
                                </span>
                            </div>
                        )}
                        
                        {file.type === 'PDF' && targetFormat === 'JPG' && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3 flex gap-3 text-sm">
                                <Info className="w-5 h-5 text-blue-600 dark:text-blue-500 flex-shrink-0" />
                                <span className="text-blue-700 dark:text-blue-400">
                                    If the PDF has multiple pages, we will provide a ZIP file containing all images.
                                </span>
                            </div>
                        )}
                        </div>
                    )}

                    {status === 'processing' && (
                        <div className="text-center py-8">
                        <Loader2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin mx-auto mb-4" />
                        <p className="text-gray-900 dark:text-white font-medium">Processing locally...</p>
                        <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-2">{progressMsg}</p>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-medium text-red-800 dark:text-red-400">Conversion Failed</h4>
                            <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                            <button onClick={() => setStatus('idle')} className="mt-2 text-xs font-bold text-red-800 hover:underline">Try again</button>
                        </div>
                        </div>
                    )}

                    {status === 'completed' && result && (
                        <RewardedDownload downloadUrl={result.downloadUrl} fileName={result.fileName} toolId="convert" />
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

            <div className="mt-12">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">How it works</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                    <li>Upload your file. It stays on your computer.</li>
                    <li>We use advanced web technologies (WASM) to convert the file inside your browser.</li>
                    <li>Download the result instantly. Fast and Secure.</li>
                </ol>
            </div>
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

export default Convert;
