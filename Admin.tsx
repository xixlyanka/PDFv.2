
import React, { useState } from 'react';
import { useAdSettings } from '../contexts/AdSettingsContext';
import { useStats } from '../contexts/StatsContext';
import { useLanguage } from '../contexts/LanguageContext';
import SEO from '../components/SEO';
import { Lock, BarChart2, DollarSign, FileText, Globe, Download, Save, AlertCircle, ExternalLink } from 'lucide-react';
import { ROUTES } from '../constants';

const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { showAds, setShowAds } = useAdSettings();
  const { stats, gaId, setGaId } = useStats();
  const { t } = useLanguage();
  const [newGaId, setNewGaId] = useState(gaId);

  const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      // Simple client-side check. 
      if (password === 'admin') {
          setIsAuthenticated(true);
      } else {
          setError('Invalid password');
      }
  };

  const handleSaveGaId = () => {
      setGaId(newGaId);
      alert('Google Analytics ID Saved!');
  };

  const generateSitemap = () => {
      const baseUrl = 'https://freepdftools.com'; // Replace with real domain
      const urls = Object.values(ROUTES).map(route => `
  <url>
    <loc>${baseUrl}${route}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${route === '/' ? '1.0' : '0.8'}</priority>
  </url>`).join('');

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;

      const blob = new Blob([xml], { type: 'text/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sitemap.xml';
      a.click();
  };

  if (!isAuthenticated) {
      return (
          <div className="min-h-[70vh] flex items-center justify-center px-4">
              <SEO title="Admin Login" />
              <div className="glass-panel p-8 rounded-2xl shadow-xl w-full max-w-md">
                  <div className="text-center mb-6">
                      <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-3 text-indigo-600 dark:text-indigo-400">
                          <Lock className="w-6 h-6" />
                      </div>
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Login</h1>
                  </div>
                  <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                          <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password (try 'admin')"
                            className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 dark:text-white"
                          />
                      </div>
                      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                      <button 
                        type="submit"
                        className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors"
                      >
                          Access Dashboard
                      </button>
                  </form>
              </div>
          </div>
      );
  }

  // Calculate estimated revenue (Mock calculation: $0.005 per file processed)
  const estRevenue = (stats.totalFiles * 0.005).toFixed(2);
  const dataSavedMB = (stats.totalSizeSaved / (1024 * 1024)).toFixed(2);

  // Find most popular tool
  const sortedTools = Object.entries(stats.toolsUsage).sort((a, b) => b[1] - a[1]);
  const maxUsage = sortedTools.length > 0 ? sortedTools[0][1] : 1;

  return (
      <div className="max-w-7xl mx-auto px-4 py-12">
          <SEO title="Admin Dashboard" />
          
          <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('admin.dashboard')}</h1>
              <button 
                onClick={() => setIsAuthenticated(false)}
                className="text-sm text-red-500 hover:text-red-600 font-medium"
              >
                  Logout
              </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="glass-panel p-6 rounded-xl flex items-center justify-between">
                  <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('admin.visitors')}</p>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalFiles}</h3>
                  </div>
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center text-purple-600 dark:text-purple-400">
                      <FileText className="w-6 h-6" />
                  </div>
              </div>
              <div className="glass-panel p-6 rounded-xl flex items-center justify-between">
                  <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('admin.saved')}</p>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{dataSavedMB} MB</h3>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <Save className="w-6 h-6" />
                  </div>
              </div>
              <div className="glass-panel p-6 rounded-xl flex items-center justify-between">
                  <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('admin.revenue')}</p>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">${estRevenue}</h3>
                  </div>
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center text-green-600 dark:text-green-400">
                      <DollarSign className="w-6 h-6" />
                  </div>
              </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Tool Usage Chart */}
              <div className="glass-panel p-6 rounded-xl">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                      <BarChart2 className="w-5 h-5 mr-2" /> Tool Popularity
                  </h3>
                  <div className="space-y-4">
                      {sortedTools.length === 0 ? (
                          <p className="text-gray-500 text-sm">No data yet.</p>
                      ) : (
                          sortedTools.slice(0, 5).map(([tool, count]) => (
                              <div key={tool}>
                                  <div className="flex justify-between text-xs mb-1">
                                      <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">{tool}</span>
                                      <span className="text-gray-500">{count}</span>
                                  </div>
                                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5">
                                      <div 
                                          className="bg-indigo-600 h-2.5 rounded-full" 
                                          style={{ width: `${(count / maxUsage) * 100}%` }}
                                      ></div>
                                  </div>
                              </div>
                          ))
                      )}
                  </div>
              </div>

              {/* SEO & Config */}
              <div className="space-y-6">
                  <div className="glass-panel p-6 rounded-xl">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                          <Globe className="w-5 h-5 mr-2" /> {t('admin.analytics')}
                      </h3>
                      <div className="space-y-4">
                          <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('admin.ga_id')}</label>
                              <div className="flex gap-2">
                                  <input 
                                      type="text" 
                                      value={newGaId}
                                      onChange={(e) => setNewGaId(e.target.value)}
                                      placeholder="G-XXXXXXXXXX"
                                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-white text-sm"
                                  />
                                  <button onClick={handleSaveGaId} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700">
                                      Save
                                  </button>
                              </div>
                          </div>
                          
                          <div className="pt-4 border-t border-gray-100 dark:border-slate-700 flex flex-col gap-3">
                              <a 
                                  href="https://analytics.google.com/analytics/web/"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-full py-2 border border-indigo-200 bg-indigo-50 dark:bg-indigo-900/30 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 flex items-center justify-center transition-colors"
                              >
                                  <ExternalLink className="w-4 h-4 mr-2" /> Open Google Analytics Dashboard
                              </a>

                              <button 
                                  onClick={generateSitemap}
                                  className="w-full py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-bold hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center justify-center"
                              >
                                  <Download className="w-4 h-4 mr-2" /> {t('admin.sitemap')}
                              </button>
                          </div>
                      </div>
                  </div>

                  <div className="glass-panel p-6 rounded-xl">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                          <DollarSign className="w-5 h-5 mr-2" /> {t('admin.monetization')}
                      </h3>
                      <div className="flex items-center justify-between">
                          <div>
                              <p className="font-medium text-gray-900 dark:text-white">Show Ads</p>
                              <p className="text-xs text-gray-500">Toggle Google AdSense visibility.</p>
                          </div>
                          <button 
                            onClick={() => setShowAds(!showAds)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showAds ? 'bg-green-500' : 'bg-gray-300 dark:bg-slate-600'}`}
                          >
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showAds ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  );
};

export default Admin;
