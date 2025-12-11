

import React, { useState } from 'react';
import { UploadedFile, ProcessingResult, JobStatus } from '@/types';
import FileDropzone from '@/FileDropzone';
import { Stamp, Loader2, Image as ImageIcon, Type, FileText, ShieldCheck } from 'lucide-react';
import { docService } from '@/docService';
import RewardedDownload from '@/RewardedDownload';
import SEO from '@/SEO';
import GoogleAd from '@/GoogleAd';
import { AD_SLOTS } from '@/constants';

const Watermark: React.FC = () => {
  const [file, setFile] = useState<UploadedFile | null>(null);
  
  // Settings
  const [mode, setMode] = useState<'text' | 'image'>('text');
  const [text, setText] = useState('CONFIDENTIAL');
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const [opacity, setOpacity] = useState(0.5);
  const [scale, setScale] = useState(0.5);
  const [position, setPosition] = useState<'center' | 'bottom'>('center');
  
  const [status, setStatus] = useState<JobStatus>('idle');
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

  const handleImageSelect = (files: UploadedFile[]) => {
      setImageFile(files[0].file);
  };

  const handleProcess = async () => {
    if (!file) return;
    if (mode === 'text' && !text) return;
    if (mode === 'image' && !imageFile) return;

    setStatus('processing');
    try {
        const res = await docService.addWatermark(file, text, {
            type: mode,
            opacity,
            color: 'red',
            position,
            imageFile: imageFile || undefined,
            scale
        });
        setResult(res);
        setStatus('completed');
    } catch (e) {
        setStatus('error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <SEO 
        title="Watermark PDF" 
        description="Add text or image watermarks (logos) to your PDF documents. Secure local processing."
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <div className="text-center lg:text-left mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">Watermark PDF</h1>
                <p className="mt-3 text-lg text-gray-500 dark:text-gray-400">Add secure text stamps or logos to your documents.</p>
            </div>

            <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-green-700 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                <h4 className="text-sm font-bold text-green-800 dark:text-green-400">Local Processing</h4>
                <p className="text-sm text-green-700 dark:text-green-300">Watermarks are applied directly in your browser.</p>
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
                            {/* Tabs */}
                            <div className="flex p-1 space-x-1 bg-gray-100/50 dark:bg-slate-700/50 rounded-xl">
                                <button
                                onClick={() => setMode('text')}
                                className={`w-full py-2.5 text-sm font-medium leading-5 text-indigo-700 dark:text-indigo-400 rounded-lg focus:outline-none transition-all ${
                                    mode === 'text' ? 'bg-white dark:bg-slate-800 shadow' : 'text-gray-500 dark:text-gray-400 hover:text-indigo-600'
                                }`}
                                >
                                    <div className="flex items-center justify-center">
                                        <Type className="w-4 h-4 mr-2" /> Text Watermark
                                    </div>
                                </button>
                                <button
                                onClick={() => setMode('image')}
                                className={`w-full py-2.5 text-sm font-medium leading-5 text-indigo-700 dark:text-indigo-400 rounded-lg focus:outline-none transition-all ${
                                    mode === 'image' ? 'bg-white dark:bg-slate-800 shadow' : 'text-gray-500 dark:text-gray-400 hover:text-indigo-600'
                                }`}
                                >
                                    <div className="flex items-center justify-center">
                                        <ImageIcon className="w-4 h-4 mr-2" /> Image / Logo
                                    </div>
                                </button>
                            </div>

                            {/* Mode Specific Inputs */}
                            {mode === 'text' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Watermark Text</label>
                                    <input 
                                        type="text" 
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700 dark:text-white"
                                    />
                                </div>
                            )}

                            {mode === 'image' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload Logo</label>
                                    {imageFile ? (
                                        <div className="flex items-center justify-between p-3 border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                                            <span className="text-sm text-indigo-700 dark:text-indigo-400 truncate">{imageFile.name}</span>
                                            <button onClick={() => setImageFile(null)} className="text-xs text-red-600 font-bold hover:underline">Remove</button>
                                        </div>
                                    ) : (
                                        <FileDropzone onFilesSelected={handleImageSelect} maxSizeMB={5} accept={['.jpg', '.png']} />
                                    )}
                                </div>
                            )}
                            
                            {/* Common Controls */}
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Position</label>
                                    <select 
                                        value={position}
                                        onChange={(e) => setPosition(e.target.value as any)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 dark:text-white"
                                    >
                                        <option value="center">Center</option>
                                        <option value="bottom">Bottom Right</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Opacity ({opacity})</label>
                                    <input 
                                        type="range" 
                                        min="0.1" 
                                        max="1" 
                                        step="0.1" 
                                        value={opacity}
                                        onChange={(e) => setOpacity(parseFloat(e.target.value))}
                                        className="w-full range-slider"
                                    />
                                </div>
                                
                                {mode === 'image' && (
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image Scale ({scale})</label>
                                        <input 
                                            type="range" 
                                            min="0.1" 
                                            max="1.5" 
                                            step="0.1" 
                                            value={scale}
                                            onChange={(e) => setScale(parseFloat(e.target.value))}
                                            className="w-full range-slider"
                                        />
                                    </div>
                                )}
                            </div>

                            <button 
                                onClick={handleProcess}
                                disabled={mode === 'image' && !imageFile}
                                className="w-full py-3 bg-gradient-to-r from-indigo-600/70 to-purple-600/70 hover:from-indigo-600 hover:to-purple-600 text-white backdrop-blur-md border border-white/20 shadow-lg shadow-indigo-500/30 rounded-lg font-bold transition-all flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Apply Watermark <Stamp className="ml-2 w-5 h-5" />
                            </button>
                        </div>
                    )}

                    {status === 'processing' && (
                        <div className="text-center py-10">
                            <Loader2 className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin mx-auto mb-4" />
                            <p className="text-gray-600 dark:text-gray-300">Applying watermark...</p>
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

export default Watermark;