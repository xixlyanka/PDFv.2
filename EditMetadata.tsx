

import React, { useState, useEffect } from 'react';
import { UploadedFile, ProcessingResult, JobStatus } from '@/types';
import FileDropzone from '@/FileDropzone';
import { Tags, Loader2, AlertCircle, FileText, ShieldCheck } from 'lucide-react';
import { docService } from '@/docService';
import RewardedDownload from '@/RewardedDownload';
import SEO from '@/SEO';
import GoogleAd from '@/GoogleAd';
import { AD_SLOTS } from '@/constants';
import { useToast } from '@/ToastContext';

const EditMetadata: React.FC = () => {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [status, setStatus] = useState<JobStatus>('idle');
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const { addToast } = useToast();

  const [metadata, setMetadata] = useState({
      title: '',
      author: '',
      subject: '',
      keywords: '',
      creator: '',
      producer: ''
  });

  const handleFiles = async (files: UploadedFile[]) => {
    if (files[0].type !== 'PDF') {
        addToast("Please upload a PDF file.", 'error');
        return;
    }
    setFile(files[0]);
    setStatus('processing');
    try {
        const meta = await docService.getMetadata(files[0].file);
        setMetadata(meta);
        setStatus('idle');
    } catch (e: any) {
        addToast("Failed to read metadata.", 'error');
        setStatus('idle');
    }
    setResult(null);
  };

  const handleProcess = async () => {
    if (!file) return;
    setStatus('processing');
    try {
      const res = await docService.setMetadata(file.file, metadata);
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
        title="Edit PDF Metadata" 
        description="Change PDF title, author, subject, keywords and creator fields online."
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <div className="text-center lg:text-left mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">Edit PDF Metadata</h1>
                <p className="mt-3 text-lg text-gray-500 dark:text-gray-400">View and modify PDF properties like Author and Title.</p>
            </div>

            <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-green-700 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                <h4 className="text-sm font-bold text-green-800 dark:text-green-400">Private Editing</h4>
                <p className="text-sm text-green-700 dark:text-green-300">Your PDF metadata is read and updated locally in your browser.</p>
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
                        {status !== 'processing' && (
                            <button onClick={() => setFile(null)} className="text-sm text-red-500 font-medium">Change</button>
                        )}
                    </div>

                    {status === 'processing' && !result && (
                        <div className="text-center py-10">
                            <Loader2 className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin mx-auto mb-4" />
                            <p className="text-gray-600 dark:text-gray-300">Loading Metadata...</p>
                        </div>
                    )}

                    {status === 'idle' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                                <input 
                                    type="text" 
                                    value={metadata.title}
                                    onChange={(e) => setMetadata({...metadata, title: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 dark:text-white"
                                />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Author</label>
                                <input 
                                    type="text" 
                                    value={metadata.author}
                                    onChange={(e) => setMetadata({...metadata, author: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 dark:text-white"
                                />
                            </div>
                             <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                                <input 
                                    type="text" 
                                    value={metadata.subject}
                                    onChange={(e) => setMetadata({...metadata, subject: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 dark:text-white"
                                />
                            </div>
                             <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Keywords</label>
                                <input 
                                    type="text" 
                                    value={metadata.keywords}
                                    onChange={(e) => setMetadata({...metadata, keywords: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 dark:text-white"
                                />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Creator (App)</label>
                                <input 
                                    type="text" 
                                    value={metadata.creator}
                                    onChange={(e) => setMetadata({...metadata, creator: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 dark:text-white"
                                />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Producer</label>
                                <input 
                                    type="text" 
                                    value={metadata.producer}
                                    onChange={(e) => setMetadata({...metadata, producer: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 dark:text-white"
                                />
                            </div>

                            <div className="md:col-span-2 mt-4">
                                <button 
                                    onClick={handleProcess}
                                    className="w-full py-3 bg-gradient-to-r from-indigo-600/70 to-purple-600/70 hover:from-indigo-600 hover:to-purple-600 text-white backdrop-blur-md border border-white/20 shadow-lg shadow-indigo-500/30 rounded-lg font-bold transition-all flex justify-center items-center"
                                >
                                    Save Metadata <Tags className="ml-2 w-5 h-5" />
                                </button>
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

export default EditMetadata;