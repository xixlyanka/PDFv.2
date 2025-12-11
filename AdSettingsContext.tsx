import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdSettingsContextType {
  showAds: boolean;
  setShowAds: (show: boolean) => void;
}

const AdSettingsContext = createContext<AdSettingsContextType | undefined>(undefined);

export const AdSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showAds, setShowAds] = useState(true);

  useEffect(() => {
    const savedSetting = localStorage.getItem('admin-show-ads');
    if (savedSetting !== null) {
      setShowAds(savedSetting === 'true');
    }
  }, []);

  const handleSetShowAds = (show: boolean) => {
    setShowAds(show);
    localStorage.setItem('admin-show-ads', show.toString());
  };

  return (
    <AdSettingsContext.Provider value={{ showAds, setShowAds: handleSetShowAds }}>
      {children}
    </AdSettingsContext.Provider>
  );
};

export const useAdSettings = () => {
  const context = useContext(AdSettingsContext);
  if (!context) {
    throw new Error('useAdSettings must be used within a AdSettingsProvider');
  }
  return context;
};