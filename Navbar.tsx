
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FileText, Menu, X, Zap, Layers, Minimize2, Scissors, RotateCw, Stamp, Maximize, LayoutGrid, Lock, Unlock, ChevronDown, Hash, BookOpen, Globe, Wrench, PenTool, Monitor, Sun, Moon, ScanText, Image as ImageIcon, Tags, Code, Archive, Search, Shield } from 'lucide-react';
import { ROUTES, APP_NAME } from '@/constants';
import { useLanguage } from '@/LanguageContext';
import { useTheme } from '@/ThemeContext';
import { Language, translations } from '@/translations';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Defined Tool Categories for Mega Menu
  const toolCategories = [
    {
      name: "Convert",
      tools: [
        { id: 'convert', name: t('nav.convert'), path: ROUTES.CONVERT, icon: Zap },
        { id: 'ocr', name: t('tools.ocr.title'), path: ROUTES.OCR, icon: ScanText },
        { id: 'htmltopdf', name: t('tools.htmltopdf.title'), path: ROUTES.HTML_TO_PDF || '/html-to-pdf', icon: Code },
        { id: 'pdftopdfa', name: t('tools.pdftopdfa.title'), path: ROUTES.PDF_TO_PDFA || '/pdf-to-pdfa', icon: Archive },
        { id: 'extractimages', name: t('tools.extractimages.title'), path: ROUTES.EXTRACT_IMAGES, icon: ImageIcon },
      ]
    },
    {
      name: "Optimize",
      tools: [
        { id: 'compress', name: t('nav.compress'), path: ROUTES.COMPRESS, icon: Minimize2 },
        { id: 'merge', name: t('nav.merge'), path: ROUTES.MERGE, icon: Layers },
        { id: 'split', name: t('tools.split.title'), path: ROUTES.SPLIT, icon: Scissors },
        { id: 'resize', name: t('tools.resize.title'), path: ROUTES.RESIZE, icon: Maximize },
        { id: 'crop', name: t('tools.crop.title'), path: ROUTES.CROP, icon: Scissors },
        { id: 'grayscale', name: t('tools.grayscale.title'), path: ROUTES.GRAYSCALE, icon: Monitor },
        { id: 'repair', name: t('tools.repair.title'), path: ROUTES.REPAIR, icon: Wrench },
      ]
    },
    {
      name: "Edit",
      tools: [
        { id: 'invoicegenerator', name: t('tools.invoicegenerator.title'), path: ROUTES.INVOICE_GENERATOR, icon: FileText },
        { id: 'editmetadata', name: t('tools.editmetadata.title'), path: ROUTES.EDIT_METADATA, icon: Tags },
        { id: 'organize', name: t('tools.organize.title'), path: ROUTES.ORGANIZE, icon: LayoutGrid },
        { id: 'rotate', name: t('tools.rotate.title'), path: ROUTES.ROTATE, icon: RotateCw },
        { id: 'watermark', name: t('tools.watermark.title'), path: ROUTES.WATERMARK, icon: Stamp },
        { id: 'pagenumbers', name: t('tools.pagenumbers.title'), path: ROUTES.PAGE_NUMBERS, icon: Hash },
        { id: 'flatten', name: t('tools.flatten.title'), path: ROUTES.FLATTEN, icon: Layers },
      ]
    },
    {
      name: "Security",
      tools: [
        { id: 'protect', name: t('tools.protect.title'), path: ROUTES.PROTECT, icon: Lock },
        { id: 'unlock', name: t('tools.unlock.title'), path: ROUTES.UNLOCK, icon: Unlock },
        { id: 'sign', name: t('tools.sign.title'), path: ROUTES.SIGN, icon: PenTool },
        { id: 'redact', name: t('tools.redact.title'), path: ROUTES.REDACT, icon: Shield },
      ]
    }
  ];

  // Flattened list for search
  const allTools = toolCategories.flatMap(c => c.tools);

  const isActive = (path: string) => location.pathname === path;

  const languages: { code: Language; label: string; flag: string }[] = [
      { code: 'en', label: 'English', flag: '🇺🇸' },
      { code: 'es', label: 'Español', flag: '🇪🇸' },
      { code: 'fr', label: 'Français', flag: '🇫🇷' },
      { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
      { code: 'ru', label: 'Русский', flag: '🇷🇺' },
      { code: 'uk', label: 'Українська', flag: '🇺🇦' },
  ];

  // Search Logic
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value.toLowerCase();
      setSearchQuery(query);
      if (query.length > 0) {
          setSearchOpen(true);
          const results = allTools.filter(tool => {
              const translatedName = tool.name.toLowerCase();
              return translatedName.includes(query);
          });
          setSearchResults(results);
      } else {
          setSearchOpen(false);
      }
  };

  const executeSearch = (tool: any) => {
      navigate(tool.path);
      setSearchQuery('');
      setSearchOpen(false);
  };

  return (
    <nav className="glass-nav sticky top-0 z-50 transition-all duration-300 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to={ROUTES.HOME} className="flex-shrink-0 flex items-center group mr-4">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 group-hover:scale-105 transition-transform shadow-lg shadow-indigo-500/30">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <span className="ml-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 group-hover:from-indigo-600 group-hover:to-purple-600 transition-all hidden sm:block">{APP_NAME}</span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex md:items-center md:space-x-1">
                {/* Mega Menu Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button 
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                            dropdownOpen 
                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' 
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400'
                        }`}
                    >
                        {t('nav.tools')} <ChevronDown className={`ml-1.5 w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {dropdownOpen && (
                        <div className="absolute left-0 mt-2 w-[600px] rounded-xl shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 focus:outline-none animate-fade-in origin-top-left p-6 border border-gray-100 dark:border-slate-700 z-50">
                            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                                {toolCategories.map((category) => (
                                    <div key={category.name}>
                                        <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-2">
                                            {category.name}
                                        </h3>
                                        <div className="space-y-1">
                                            {category.tools.map((link) => (
                                                <Link
                                                    key={link.path}
                                                    to={link.path}
                                                    onClick={() => setDropdownOpen(false)}
                                                    className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                                                        isActive(link.path) 
                                                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' 
                                                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400'
                                                    }`}
                                                >
                                                    <link.icon className="w-4 h-4 mr-3 text-gray-400 dark:text-gray-500" />
                                                    {link.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <Link
                    to={ROUTES.CONVERT}
                    className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                    {t('nav.convert')}
                </Link>
                <Link
                    to={ROUTES.COMPRESS}
                    className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                    {t('nav.compress')}
                </Link>
                <Link
                    to={ROUTES.MERGE}
                    className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                    {t('nav.merge')}
                </Link>
            </div>
          </div>
          
          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
             
             {/* Search Bar (Desktop) */}
             <div className="hidden md:block relative mr-2" ref={searchRef}>
                 <div className="relative">
                     <input
                        type="text"
                        placeholder={t('nav.search_placeholder')}
                        value={searchQuery}
                        onChange={handleSearch}
                        className="w-48 lg:w-64 pl-9 pr-4 py-1.5 text-sm rounded-full bg-gray-100 dark:bg-slate-800 dark:text-white border-none focus:ring-2 focus:ring-indigo-500 transition-all"
                     />
                     <Search className="absolute left-3 top-2 w-4 h-4 text-gray-400" />
                 </div>
                 
                 {/* Search Results Dropdown */}
                 {searchOpen && (
                     <div className="absolute right-0 mt-2 w-64 rounded-xl shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 overflow-hidden z-50 animate-fade-in border border-gray-100 dark:border-slate-700">
                         {searchResults.length > 0 ? (
                             searchResults.map((tool) => (
                                 <button
                                     key={tool.id}
                                     onClick={() => executeSearch(tool)}
                                     className="flex items-center w-full px-4 py-3 text-sm text-left hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors dark:text-gray-200"
                                 >
                                     <tool.icon className="w-4 h-4 mr-3 text-indigo-500" />
                                     {tool.name}
                                 </button>
                             ))
                         ) : (
                             <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                                 {t('nav.no_results')}
                             </div>
                         )}
                     </div>
                 )}
             </div>

             <Link
                to={ROUTES.GUIDES}
                className={`hidden md:inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive(ROUTES.GUIDES)
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
              >
                <BookOpen className="w-4 h-4 mr-1.5" />
                <span className="hidden lg:inline">{t('nav.guides')}</span>
              </Link>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-indigo-600 transition-colors"
                title="Toggle Theme"
              >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>

              {/* Language Selector */}
              <div className="relative" ref={langRef}>
                  <button 
                      onClick={() => setLangOpen(!langOpen)}
                      className="inline-flex items-center px-2 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-indigo-600 transition-colors"
                      title="Select Language"
                  >
                      <Globe className="w-4 h-4" />
                      <span className="ml-1 uppercase text-xs">{language}</span>
                  </button>
                  {langOpen && (
                      <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 focus:outline-none animate-fade-in origin-top-right p-1 border border-gray-100 dark:border-slate-700 z-50">
                          {languages.map((l) => (
                              <button
                                  key={l.code}
                                  onClick={() => { setLanguage(l.code); setLangOpen(false); }}
                                  className={`flex items-center w-full px-4 py-2 text-sm rounded-lg transition-colors ${
                                      language === l.code 
                                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 font-bold' 
                                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700'
                                  }`}
                              >
                                  <span className="mr-2 text-lg">{l.flag}</span> {l.label}
                              </button>
                          ))}
                      </div>
                  )}
              </div>
              
              {/* Mobile hamburger */}
              <div className="lg:hidden">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                >
                  <span className="sr-only">Open main menu</span>
                  {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                </button>
              </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="lg:hidden glass-panel border-t border-gray-100 dark:border-slate-700 max-h-[85vh] overflow-y-auto shadow-xl">
          <div className="pt-2 pb-3 px-2">
            
            <div className="mb-4 px-3">
                 <div className="relative">
                     <input
                        type="text"
                        placeholder={t('nav.search_placeholder')}
                        value={searchQuery}
                        onChange={handleSearch}
                        className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-gray-100 dark:bg-slate-800 dark:text-white border-none focus:ring-2 focus:ring-indigo-500 transition-all"
                     />
                     <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                 </div>
                 {searchOpen && searchResults.length > 0 && (
                     <div className="mt-2 bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-100 dark:border-slate-700 overflow-hidden">
                         {searchResults.map((tool) => (
                             <button
                                 key={tool.id}
                                 onClick={() => { executeSearch(tool); setIsOpen(false); }}
                                 className="flex items-center w-full px-4 py-3 text-sm text-left hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors dark:text-gray-200"
                             >
                                 <tool.icon className="w-4 h-4 mr-3 text-indigo-500" />
                                 {tool.name}
                             </button>
                         ))}
                     </div>
                 )}
            </div>

            {toolCategories.map((category) => (
                <div key={category.name} className="mb-4">
                    <h3 className="px-3 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                        {category.name}
                    </h3>
                    <div className="space-y-1">
                        {category.tools.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsOpen(false)}
                                className={`block pl-3 pr-4 py-2 rounded-md text-base font-medium ${
                                isActive(link.path)
                                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-indigo-600'
                                }`}
                            >
                                <div className="flex items-center">
                                    <link.icon className="w-5 h-5 mr-3" />
                                    {link.name}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            ))}

             <div className="my-2 border-t border-gray-100 dark:border-slate-700"></div>
             <Link
                to={ROUTES.GUIDES}
                onClick={() => setIsOpen(false)}
                className="block pl-3 pr-4 py-2.5 rounded-md text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-indigo-600"
              >
                <div className="flex items-center">
                  <BookOpen className="w-5 h-5 mr-3" />
                  {t('nav.guides')}
                </div>
              </Link>
             
             {/* Mobile Controls */}
             <div className="flex items-center justify-between px-3 py-4 border-t border-gray-100 dark:border-slate-700">
                <button
                    onClick={toggleTheme}
                    className="flex items-center text-gray-600 dark:text-gray-300"
                >
                    {theme === 'light' ? <Moon className="w-5 h-5 mr-2" /> : <Sun className="w-5 h-5 mr-2" />}
                    {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                </button>
             </div>

             <div className="grid grid-cols-4 gap-1 p-2">
                {languages.map((l) => (
                    <button
                        key={l.code}
                        onClick={() => { setLanguage(l.code); setIsOpen(false); }}
                        className={`flex flex-col items-center justify-center p-2 rounded-lg ${language === l.code ? 'bg-indigo-50 border border-indigo-200 dark:bg-indigo-900/30 dark:border-indigo-800' : 'bg-gray-50 dark:bg-slate-800'}`}
                    >
                        <span className="text-xl">{l.flag}</span>
                        <span className="text-[10px] uppercase font-bold mt-1 dark:text-gray-300">{l.code}</span>
                    </button>
                ))}
             </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
