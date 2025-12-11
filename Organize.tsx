

import React, { useState, useEffect } from 'react';
import { UploadedFile, ProcessingResult, JobStatus } from '../types';
import FileDropzone from '../components/FileDropzone';
import { LayoutGrid, Loader2, AlertCircle, FileText, ShieldCheck, Trash2, RotateCw, ArrowLeft, ArrowRight } from 'lucide-react';
import { docService } from '../services/docService';
import RewardedDownload from '../components/RewardedDownload';
import SEO from '../components/SEO';
import GoogleAd from '../components/GoogleAd';
import { AD_SLOTS } from '../constants';

interface PageItem {
    id: number; // Unique ID for key
    originalIndex: number;
    rotation: number;
    thumbnail: string | null;
}

const Organize: React.FC = () => {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [status, setStatus] = useState<JobStatus>('idle');
  const [loadingMsg, setLoadingMsg] = useState('');
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (files: UploadedFile[]) => {
    if (files[0].type !== 'PDF') {
        alert("Please upload a PDF file.");
        return;
    }
    const f = files[0];
    setFile(f);
    setStatus('processing'); // Temporarily processing to load pages
    setLoadingMsg('Reading pages...');
    
    try {
        const count = await docService.getPDFPageCount(f.file);
        const newPages: PageItem[] = [];
        
        for (let i = 0; i < count; i++) {
            setLoadingMsg(`Generating thumbnail ${i+1}/${count}...`);
            const thumb = await docService.getPageThumbnail(f.file, i);
            newPages.push({
                id: Math.random(),
                originalIndex: i,
                rotation: 0,
                thumbnail: thumb
            });
        }
        setPages(newPages);
        setStatus('idle');
    } catch (e: any) {
        setError("Failed to load PDF pages.");
        setStatus('error');
    }
  };

  const handleRotate = (index: number) => {
      const newPages = [...pages];
      newPages[index].rotation = (newPages[index].rotation + 90) % 360;
      setPages(newPages);
  };

  const handleDelete = (index: number) => {
      const newPages = [...pages];
      newPages.splice(index, 1);
      setPages(newPages);
  };

  const handleMove = (index: number, direction: 'left' | 'right') => {
      if (direction === 'left' && index > 0) {
          const newPages = [...pages];
          [newPages[index], newPages[index-1]] = [newPages[index-1], newPages[index]];
          setPages(newPages);
      } else if (direction === 'right' && index < pages.length - 1) {
          const newPages = [...pages];
          [newPages[index], newPages[index+1]] = [newPages[index+1], newPages[index]];
          setPages(newPages);
      }
  };

  const handleProcess = async () => {
    if (!file || pages.length === 0) return;
    setStatus('processing');
    setLoadingMsg("Rebuilding PDF...");
    
    try {
        const res = await docService.organize(
            file, 
            pages.map(p => ({ originalIndex: p.originalIndex, rotation: p.rotation })),
            (msg) => setLoadingMsg(msg)
        );
        setResult(res);
        setStatus('completed');
    } catch (e: any) {
        setError(e.message);
        setStatus('error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <SEO 
        title="Organize PDF" 
        description="Rearrange, rotate, and delete PDF pages online. Visual PDF organizer."
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <div className="text-center lg:text-left mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">Organize PDF</h1>
                <p className="mt-3 text-lg text-gray-500 dark:text-gray-400">Rearrange, rotate, or delete pages visually.</p>
            </div>

            <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-green-700 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                <h4 className="text-sm font-bold text-green-800 dark:text-green-400">Visual Client-Side Organization</h4>
                <p className="text-sm text-green-700 dark:text-green-300">We render thumbnails locally. Your document structure is modified in your browser.</p>
                </div>
            </div>

            <div className="glass-panel rounded-2xl shadow-sm p-6 md:p-8">
                {!file ? (
                <div className="max-w-2xl mx-auto">
                    <FileDropzone onFilesSelected={handleFiles} maxSizeMB={50} accept={['.pdf']} />
                </div>
                ) : (
                <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center justify-between bg-white/50 dark:bg-slate-800/50 p-4 rounded-lg border border-gray-200 dark:border-slate-700 max-w-3xl mx-auto">
                        <div className="flex items-center space-x-4">
                            <FileText className="text-red-500 w-8 h-8" />
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">{file.file.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{pages.length} Pages</p>
                            </div>
                        </div>
                        {status === 'idle' && (
                            <button onClick={() => { setFile(null); setPages([]); }} className="text-sm text-red-500 font-medium">Change File</button>
                        )}
                    </div>

                    {status === 'idle' && (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4">
                                {pages.map((page, idx) => (
                                    <div key={page.id} className="group relative bg-white dark:bg-slate-800 border-2 border-transparent hover:border-indigo-400 rounded-lg shadow-sm p-2 transition-all">
                                        <div className="absolute top-2 left-2 bg-gray-800 text-white text-xs px-1.5 rounded opacity-70">{idx + 1}</div>
                                        
                                        <div className="aspect-[3/4] bg-gray-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden mb-2 rounded border border-gray-200 dark:border-slate-600">
                                            {page.thumbnail ? (
                                                <img 
                                                    src={page.thumbnail} 
                                                    alt={`Page ${idx}`} 
                                                    className="w-full h-full object-contain transition-transform duration-300" 
                                                    style={{ transform: `rotate(${page.rotation}deg)` }}
                                                />
                                            ) : (
                                                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                                            )}
                                        </div>

                                        <div className="flex justify-between items-center bg-gray-50 dark:bg-slate-700 rounded px-1 py-1">
                                            <button onClick={() => handleRotate(idx)} className="p-1 hover:bg-white dark:hover:bg-slate-600 hover:text-indigo-600 rounded text-gray-500 dark:text-gray-400" title="Rotate">
                                                <RotateCw className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(idx)} className="p-1 hover:bg-white dark:hover:bg-slate-600 hover:text-red-600 rounded text-gray-500 dark:text-gray-400" title="Delete">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                            <button 
                                                onClick={() => handleMove(idx, 'left')} 
                                                disabled={idx === 0}
                                                className="pointer-events-auto p-1.5 bg-white dark:bg-slate-700 shadow-md rounded-full text-indigo-600 dark:text-indigo-400 disabled:opacity-0 hover:scale-110"
                                            >
                                                <ArrowLeft className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleMove(idx, 'right')} 
                                                disabled={idx === pages.length - 1}
                                                className="pointer-events-auto p-1.5 bg-white dark:bg-slate-700 shadow-md rounded-full text-indigo-600 dark:text-indigo-400 disabled:opacity-0 hover:scale-110"
                                            >
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="max-w-md mx-auto mt-8">
                                <button 
                                    onClick={handleProcess}
                                    className="w-full py-3 bg-gradient-to-r from-indigo-600/70 to-purple-600/70 hover:from-indigo-600 hover:to-purple-600 text-white backdrop-blur-md border border-white/20 shadow-lg shadow-indigo-500/30 rounded-lg font-bold transition-all flex justify-center items-center"
                                >
                                    Save Organized PDF <LayoutGrid className="ml-2 w-5 h-5" />
                                </button>
                            </div>
                        </>
                    )}

                    {status === 'processing' && (
                        <div className="text-center py-10">
                            <Loader2 className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin mx-auto mb-4" />
                            <p className="text-gray-600 dark:text-gray-300 font-medium">Processing...</p>
                            <p className="text-sm text-indigo-500 dark:text-indigo-400 mt-2">{loadingMsg}</p>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="max-w-xl mx-auto bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
                            <p className="text-red-700 dark:text-red-300">{error}</p>
                            <button onClick={() => { setFile(null); setStatus('idle'); }} className="mt-2 text-sm font-bold text-red-800 hover:underline">Try Again</button>
                        </div>
                    )}

                    {status === 'completed' && result && (
                        <div className="max-w-xl mx-auto space-y-4">
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

export default Organize;