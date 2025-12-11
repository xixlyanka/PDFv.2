

import React, { useState, useEffect } from 'react';
import { Download, Lock, CheckCircle, Loader2, ArrowRight, Star, Share2 } from 'lucide-react';
import GoogleAd from '@/GoogleAd';
import { AD_SLOTS, ROUTES } from '@/constants';
import { useLanguage } from '@/LanguageContext';
import { Link, useNavigate } from 'react-router-dom';
import { useFileHandler } from '@/FileHandlerContext';
import { UploadedFile } from '@/types';
import { useToast } from '@/ToastContext';

interface RewardedDownloadProps {
  downloadUrl: string;
  fileName: string;
  toolId?: string; // e.g. 'merge', 'compress' to suggest next steps
}

const RewardedDownload: React.FC<RewardedDownloadProps> = ({ downloadUrl, fileName, toolId }) => {
  const { t } = useLanguage();
  // States: 'locked' | 'ad-view' | 'unlocked'
  const [status, setStatus] = useState<'locked' | 'ad-view' | 'unlocked'>('locked');
  const [timeLeft, setTimeLeft] = useState(10);
  const [rating, setRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const { setPipelineFile, setSourceTool } = useFileHandler();
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    let timer: any;
    if (status === 'ad-view' && timeLeft > 0) {
        timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);
    }
    return () => clearInterval(timer);
  }, [status, timeLeft]);

  useEffect(() => {
      // Check if user already rated this specific tool in local storage
      if (toolId) {
          const rated = localStorage.getItem(`rated-${toolId}`);
          if (rated) {
              setRating(parseInt(rated));
              setHasRated(true);
          }
      }
  }, [toolId]);

  const handleStartUnlock = () => {
    setStatus('ad-view');
    setTimeLeft(10); // Reset timer
  };

  const handleConfirmAdView = () => {
    if (timeLeft > 0) return;
    setStatus('unlocked');
    triggerConfetti();
  };

  const handleRate = (stars: number) => {
      setRating(stars);
      setHasRated(true);
      if (toolId) {
          localStorage.setItem(`rated-${toolId}`, stars.toString());
      }
  };

  const triggerConfetti = () => {
    if (window.confetti) {
        window.confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#4f46e5', '#9333ea', '#22c55e', '#fbbf24']
        });
    }
  };

  const handleDownload = () => {
    // Create a fake click to trigger download
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShare = async () => {
      if (navigator.share) {
          try {
              const response = await fetch(downloadUrl);
              const blob = await response.blob();
              const file = new File([blob], fileName, { type: blob.type });
              await navigator.share({
                  files: [file],
                  title: fileName,
                  text: 'Processed with FreePDFtools'
              });
          } catch (error) {
              console.error('Error sharing:', error);
          }
      } else {
          // Fallback: Copy link or notify
          // Since downloadUrl is blob: it's not sharable as link globally.
          addToast(t('download.share_error'), 'info');
      }
  };

  const handleContinueWith = async (path: string) => {
      // Fetch Blob from the download URL
      try {
          const response = await fetch(downloadUrl);
          const blob = await response.blob();
          const file = new File([blob], fileName, { type: blob.type });
          
          const uploadedFile: UploadedFile = {
              id: Math.random().toString(36).substring(7),
              file: file,
              type: 'PDF', // Assuming PDF workflow usually
              size: file.size,
              previewUrl: undefined
          };

          setPipelineFile(uploadedFile);
          setSourceTool(toolId || 'unknown');
          navigate(path);
      } catch (error) {
          console.error("Failed to pass file to pipeline", error);
          // Fallback just navigate
          navigate(path);
      }
  };

  // Define Next Steps Workflows
  const getNextSteps = (currentTool?: string) => {
      const suggestions = [];
      if (currentTool === 'merge') {
          suggestions.push({ name: 'Compress PDF', path: ROUTES.COMPRESS });
          suggestions.push({ name: 'Protect PDF', path: ROUTES.PROTECT });
      } else if (currentTool === 'convert') {
          suggestions.push({ name: 'Merge PDF', path: ROUTES.MERGE });
          suggestions.push({ name: 'Sign PDF', path: ROUTES.SIGN });
      } else if (currentTool === 'compress') {
          suggestions.push({ name: 'Protect PDF', path: ROUTES.PROTECT });
          suggestions.push({ name: 'Sign PDF', path: ROUTES.SIGN });
      } else {
          // Default fallbacks
          suggestions.push({ name: 'Compress PDF', path: ROUTES.COMPRESS });
          suggestions.push({ name: 'Organize PDF', path: ROUTES.ORGANIZE });
      }
      return suggestions;
  };

  if (status === 'locked') {
    return (
      <div className="mt-6 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm text-center">
        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('download.ready')}</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
          {t('download.support')}
        </p>
        <button
          onClick={handleStartUnlock}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600/70 to-purple-600/70 hover:from-indigo-600 hover:to-purple-600 text-white backdrop-blur-md border border-white/20 shadow-lg shadow-indigo-500/30 text-base font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
        >
          {t('download.btn_request')}
        </button>
      </div>
    );
  }

  if (status === 'ad-view') {
    return (
      <div className="mt-6 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-lg animate-fade-in">
        <div className="bg-gray-50 dark:bg-slate-700 p-4 border-b border-gray-200 dark:border-slate-600 flex justify-between items-center">
            <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-spin" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('download.preparing')}</span>
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-slate-600 px-1.5 py-0.5 rounded">{t('download.ad_label')}</span>
        </div>
        
        <div className="p-4 bg-gray-100 dark:bg-slate-900 flex justify-center min-h-[250px] items-center">
          <GoogleAd slot={AD_SLOTS.REWARDED} format="rectangle" />
        </div>

        <div className="p-6 text-center border-t border-gray-200 dark:border-slate-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {t('download.thank_you')}
            </p>
            <button
                onClick={handleConfirmAdView}
                disabled={timeLeft > 0}
                className={`w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all ${
                    timeLeft > 0 
                    ? 'bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
                    : 'text-indigo-700 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-300'
                }`}
            >
                {timeLeft > 0 
                    ? t('download.wait_seconds').replace('{0}', timeLeft.toString()) 
                    : t('download.btn_confirm')
                }
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 animate-fade-in space-y-6">
        {/* Success Card */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('download.success')}</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm truncate max-w-md mx-auto">
                {fileName}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
                <button
                    onClick={handleDownload}
                    className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-md shadow-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transform transition hover:-translate-y-0.5"
                >
                    <Download className="w-6 h-6 mr-2" />
                    {t('download.btn_save')}
                </button>
                
                {/* Share Button (Mobile/Supported Browsers) */}
                <button
                    onClick={handleShare}
                    className="inline-flex items-center justify-center px-4 py-4 border border-green-200 dark:border-green-800 text-lg font-bold rounded-md text-green-700 dark:text-green-400 bg-white dark:bg-slate-800 hover:bg-green-50 dark:hover:bg-green-900/30 focus:outline-none transition-all"
                    title={t('download.share')}
                >
                    <Share2 className="w-6 h-6" />
                </button>
            </div>
        </div>

        {/* Rating Widget */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-100 dark:border-slate-700 text-center">
            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">{hasRated ? t('download.thank_you_rating') : t('download.rate_tool')}</h4>
            <div className="flex justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        onClick={() => handleRate(star)}
                        disabled={hasRated}
                        className={`transition-transform hover:scale-110 focus:outline-none ${hasRated ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                        <Star 
                            className={`w-8 h-8 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`} 
                        />
                    </button>
                ))}
            </div>
        </div>

        {/* Next Steps / Workflows */}
        <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-xl p-6 border border-indigo-100 dark:border-indigo-900/50">
            <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 mb-4 uppercase tracking-wider">{t('download.whats_next')}</h4>
            <div className="space-y-3">
                {getNextSteps(toolId).map((step, idx) => (
                    <button 
                        key={idx} 
                        onClick={() => handleContinueWith(step.path)}
                        className="w-full flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-indigo-100 dark:border-slate-700 hover:shadow-md hover:border-indigo-300 transition-all group"
                    >
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            <span className="text-gray-400 font-normal mr-2">{t('download.continue_with')}</span> 
                            {step.name}
                        </span>
                        <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                    </button>
                ))}
            </div>
        </div>
    </div>
  );
};

export default RewardedDownload;