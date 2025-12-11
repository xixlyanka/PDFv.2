

import React, { useState } from 'react';
import { UploadedFile, ProcessingResult, JobStatus } from '@/types';
import FileDropzone from '@/FileDropzone';
import { Layers, ArrowDown, ArrowUp, X, Loader2, FileText, ShieldCheck, HelpCircle, GripVertical, FileImage } from 'lucide-react';
import { docService } from '@/docService';
import RewardedDownload from '@/RewardedDownload';
import SEO from '@/SEO';
import GoogleAd from '@/GoogleAd';
import { AD_SLOTS } from '@/constants';
import { useStats } from '@/StatsContext';
import { useLanguage } from '@/LanguageContext';
import { useAdSettings } from '@/AdSettingsContext';

const Merge: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [status, setStatus] = useState<JobStatus>('idle');
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const [normalizeToA4, setNormalizeToA4] = useState(false);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  
  const { incrementStats } = useStats();
  const { t } = useLanguage();
  const { showAds } = useAdSettings();

  const handleFiles = async (newFiles: UploadedFile[]) => {
    // Check for allowed types (PDF, JPG, PNG)
    const validFiles = newFiles.filter(f => f.type === 'PDF' || f.type === 'JPG' || f.type === 'PNG');
    if (validFiles.length !== newFiles.length) alert("Some invalid files were ignored. Only PDF, JPG, and PNG allowed.");
    
    setFiles(prev => [...prev, ...validFiles]);

    // Generate thumbnails async
    for (const file of validFiles) {
        if (file.type === 'PDF') {
            const thumb = await docService.generateThumbnail(file.file);
            if (thumb) {
                setThumbnails(prev => ({ ...prev, [file.id]: thumb }));
            }
        } else {
            // For images, use the previewUrl already generated in dropzone or create one
            const thumb = file.previewUrl || URL.createObjectURL(file.file);
            setThumbnails(prev => ({ ...prev, [file.id]: thumb }));
        }
    }
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    const newFiles = [...files];
    if (direction === 'up' && index > 0) {
        [newFiles[index], newFiles[index - 1]] = [newFiles[index - 1], newFiles[index]];
    } else if (direction === 'down' && index < newFiles.length - 1) {
        [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]];
    }
    setFiles(newFiles);
  };

  const onDragStart = (e: React.DragEvent, index: number) => {
      setDraggedItem(index);
      e.dataTransfer.effectAllowed = "move";
      // Firefox requires data to be set
      e.dataTransfer.setData("text/html", "");
  };

  const onDragOver = (e: React.DragEvent, index: number) => {
      e.preventDefault();
      // Optional: Add visual indicator line logic here if needed
  };

  const onDrop = (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();
      if (draggedItem === null) return;
      
      const newFiles = [...files];
      const itemToMove = newFiles[draggedItem];
      newFiles.splice(draggedItem, 1);
      newFiles.splice(dropIndex, 0, itemToMove);
      
      setFiles(newFiles);
      setDraggedItem(null);
  };

  const removeFile = (id: string) => {
    setFiles(files.filter(f => f.id !== id));
  };

  const handleMerge = async () => {
    if (files.length < 2) {
        alert("Please select at least 2 files.");
        return;
    }
    setStatus('processing');
    try {
        const res = await docService.merge(files, normalizeToA4);
        setResult(res);
        setStatus('completed');
        incrementStats('merge', files.reduce((acc, f) => acc + f.size, 0));
    } catch (e) {
        setStatus('error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <SEO 
        title="Merge PDF" 
        description="Combine multiple PDF files and Images into one document online. Secure, fast, and free."
      />
      
      <div className={showAds ? "grid grid-cols-1 lg:grid-cols-3 gap-8" : "w-full max-w-4xl mx-auto"}>
        <div className={showAds ? "lg:col-span-2" : "col-span-1"}>
            <div className="text-center lg:text-left mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">Merge PDF & Images</h1>
                <p className="mt-3 text-lg text-gray-500 dark:text-gray-400">Combine PDF files and images into one document.</p>
            </div>

            <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-green-700 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                <h4 className="text-sm font-bold text-green-800 dark:text-green-400">100% Client-Side Merging</h4>
                <p className="text-sm text-green-700 dark:text-green-300">Your documents are combined in your browser. We never see your files.</p>
                </div>
            </div>

            <div className="glass-panel rounded-2xl shadow-sm p-6">
                    {status === 'idle' && (
                        <div className="mb-6">
                            <FileDropzone onFilesSelected={handleFiles} multiple={true} maxSizeMB={10} accept={['.pdf', '.jpg', '.jpeg', '.png']} />
                        </div>
                    )}

                    {files.length > 0 && status === 'idle' && (
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Files ({files.length}):</h3>
                                <span className="text-xs text-indigo-600 dark:text-indigo-400">Drag to reorder</span>
                            </div>
                            
                            {files.map((file, idx) => (
                                <div 
                                    key={file.id} 
                                    draggable
                                    onDragStart={(e) => onDragStart(e, idx)}
                                    onDragOver={(e) => onDragOver(e, idx)}
                                    onDrop={(e) => onDrop(e, idx)}
                                    className={`flex items-center justify-between bg-white/50 dark:bg-slate-800/50 p-3 rounded-md border border-gray-100 dark:border-slate-700 transition-all cursor-move ${draggedItem === idx ? 'opacity-50 border-indigo-300 bg-indigo-50' : 'hover:border-indigo-200'}`}
                                >
                                    <div className="flex items-center space-x-4 overflow-hidden">
                                        <div className="cursor-grab text-gray-400 hover:text-indigo-500">
                                            <GripVertical className="w-5 h-5" />
                                        </div>
                                        
                                        <div className="bg-white dark:bg-slate-700 p-1 rounded border border-gray-200 dark:border-slate-600 text-xs font-bold w-6 h-6 flex items-center justify-center text-gray-400 dark:text-gray-300">
                                            {idx + 1}
                                        </div>
                                        
                                        {/* Thumbnail Preview */}
                                        <div className="w-10 h-14 bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                                            {thumbnails[file.id] ? (
                                                <img src={thumbnails[file.id]} alt="thumb" className="w-full h-full object-cover" />
                                            ) : (
                                                file.type === 'PDF' ? <Loader2 className="w-4 h-4 text-gray-300 animate-spin" /> : <FileImage className="w-5 h-5 text-gray-400" />
                                            )}
                                        </div>

                                        <div className="overflow-hidden">
                                            <div className="flex items-center gap-2">
                                                {file.type === 'PDF' ? <FileText className="w-3 h-3 text-red-500" /> : <FileImage className="w-3 h-3 text-blue-500" />}
                                                <span className="block text-sm font-medium text-gray-800 dark:text-gray-200 truncate max-w-[100px] sm:max-w-[180px]">{file.file.name}</span>
                                            </div>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">{(file.size/1024/1024).toFixed(2)} MB</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <button onClick={() => removeFile(file.id)} className="p-2 bg-white dark:bg-slate-700 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"><X className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ))}
                            
                            <div className="pt-4 border-t border-gray-100 dark:border-slate-700">
                                <label className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                                    <input 
                                        type="checkbox" 
                                        checked={normalizeToA4}
                                        onChange={(e) => setNormalizeToA4(e.target.checked)}
                                        className="rounded text-indigo-600 focus:ring-indigo-500 bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600"
                                    />
                                    <span>Normalize all to <strong>A4</strong></span>
                                    <div className="group relative">
                                        <HelpCircle className="w-4 h-4 text-gray-400" />
                                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs p-2 rounded w-48 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                            Useful if merging images or different paper sizes. Everything will be scaled to fit A4 pages.
                                        </span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    )}

                    {status === 'idle' && files.length >= 2 && (
                        <button 
                            onClick={handleMerge}
                            className="w-full py-3 bg-gradient-to-r from-indigo-600/70 to-purple-600/70 hover:from-indigo-600 hover:to-purple-600 text-white backdrop-blur-md border border-white/20 shadow-lg shadow-indigo-500/30 rounded-lg font-bold transition-all flex justify-center items-center"
                        >
                            Merge Files <Layers className="ml-2 w-5 h-5" />
                        </button>
                    )}

                    {status === 'processing' && (
                        <div className="text-center py-10">
                            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
                            <p className="text-gray-600 dark:text-gray-300">{docService.getRandomLoadingMessage()}</p>
                        </div>
                    )}

                    {status === 'completed' && result && (
                        <RewardedDownload downloadUrl={result.downloadUrl} fileName={result.fileName} toolId="merge" />
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

export default Merge;
