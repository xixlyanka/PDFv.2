import React, { useEffect, useRef } from 'react';
import { AdProps } from '../types';
import { useAdSettings } from '../contexts/AdSettingsContext';
import { useLanguage } from '../contexts/LanguageContext';

const GoogleAd: React.FC<AdProps> = ({ slot, format = 'auto', responsive = true, className = '' }) => {
  const { showAds } = useAdSettings();
  const { t } = useLanguage();
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  // If Ads are disabled in Admin panel, render nothing
  if (!showAds) return null;

  useEffect(() => {
    if (!isLocalhost) {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error('AdSense error:', err);
      }
    }
  }, [isLocalhost]);

  if (isLocalhost) {
    return (
      <div 
        className={`flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 font-medium rounded-md overflow-hidden relative w-full ${className}`} 
        style={{ 
          minHeight: format === 'rectangle' ? '250px' : '100px', 
          background: 'repeating-linear-gradient(45deg, rgba(229, 231, 235, 0.5), rgba(229, 231, 235, 0.5) 10px, rgba(243, 244, 246, 0.5) 10px, rgba(243, 244, 246, 0.5) 20px)'
        }}
      >
        <div className="z-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm text-xs uppercase tracking-widest">
            {t('ad.space')} ({format})
        </div>
      </div>
    );
  }

  return (
    <div className={`ad-container w-full overflow-hidden ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Replace with real ID in prod
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
};

export default GoogleAd;