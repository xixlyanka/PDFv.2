
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppStats } from '@/types';

interface StatsContextType {
  stats: AppStats;
  recentTools: string[];
  incrementStats: (toolId: string, sizeBytes: number) => void;
  gaId: string;
  setGaId: (id: string) => void;
}

const StatsContext = createContext<StatsContextType | undefined>(undefined);

const INITIAL_STATS: AppStats = {
  totalFiles: 0,
  totalSizeSaved: 0,
  toolsUsage: {},
};

export const StatsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stats, setStats] = useState<AppStats>(INITIAL_STATS);
  const [gaId, setGaIdState] = useState('');
  const [recentTools, setRecentTools] = useState<string[]>([]);

  useEffect(() => {
    // Load from local storage
    const savedStats = localStorage.getItem('app-stats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
    const savedGaId = localStorage.getItem('ga-id');
    if (savedGaId) setGaIdState(savedGaId);

    const savedRecents = localStorage.getItem('recent-tools');
    if (savedRecents) {
        setRecentTools(JSON.parse(savedRecents));
    }
  }, []);

  const setGaId = (id: string) => {
      setGaIdState(id);
      localStorage.setItem('ga-id', id);
  };

  const incrementStats = (toolId: string, sizeBytes: number) => {
    // Update Stats
    setStats((prev) => {
      const newStats = {
        totalFiles: prev.totalFiles + 1,
        totalSizeSaved: prev.totalSizeSaved + sizeBytes,
        toolsUsage: {
          ...prev.toolsUsage,
          [toolId]: (prev.toolsUsage[toolId] || 0) + 1,
        },
      };
      localStorage.setItem('app-stats', JSON.stringify(newStats));
      return newStats;
    });

    // Update Recent Tools
    setRecentTools((prev) => {
        const filtered = prev.filter(id => id !== toolId);
        const newRecents = [toolId, ...filtered].slice(0, 4); // Keep last 4
        localStorage.setItem('recent-tools', JSON.stringify(newRecents));
        return newRecents;
    });
  };

  return (
    <StatsContext.Provider value={{ stats, incrementStats, gaId, setGaId, recentTools }}>
      {children}
    </StatsContext.Provider>
  );
};

export const useStats = () => {
  const context = useContext(StatsContext);
  if (!context) {
    throw new Error('useStats must be used within a StatsProvider');
  }
  return context;
};