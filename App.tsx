
import React, { useEffect, Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CookieBanner from './components/CookieBanner';
import ToastContainer from './components/ToastContainer';
import { ROUTES } from './constants';
import { useToast } from './contexts/ToastContext';
import { Loader2 } from 'lucide-react';

// Lazy load pages to improve initial load performance
const Home = lazy(() => import('./pages/Home'));
const Convert = lazy(() => import('./pages/Convert'));
const Compress = lazy(() => import('./pages/Compress'));
const Merge = lazy(() => import('./pages/Merge'));
const Split = lazy(() => import('./pages/Split'));
const Rotate = lazy(() => import('./pages/Rotate'));
const Watermark = lazy(() => import('./pages/Watermark'));
const Resize = lazy(() => import('./pages/Resize'));
const Crop = lazy(() => import('./pages/Crop'));
const Organize = lazy(() => import('./pages/Organize'));
const Protect = lazy(() => import('./pages/Protect'));
const Unlock = lazy(() => import('./pages/Unlock'));
const Flatten = lazy(() => import('./pages/Flatten'));
const PageNumbers = lazy(() => import('./pages/PageNumbers'));
const Repair = lazy(() => import('./pages/Repair'));
const Sign = lazy(() => import('./pages/Sign'));
const Grayscale = lazy(() => import('./pages/Grayscale'));
const OCR = lazy(() => import('./pages/OCR'));
const ExtractImages = lazy(() => import('./pages/ExtractImages'));
const EditMetadata = lazy(() => import('./pages/EditMetadata'));
const HtmlToPdf = lazy(() => import('./pages/HtmlToPdf'));
const PdfToPdfA = lazy(() => import('./pages/PdfToPdfA'));
const InvoiceGenerator = lazy(() => import('./pages/InvoiceGenerator'));
const Redact = lazy(() => import('./pages/Redact'));
const Guides = lazy(() => import('./pages/Guides'));
const GuidePost = lazy(() => import('./pages/GuidePost'));
const Admin = lazy(() => import('./pages/Admin'));
const NotFound = lazy(() => import('./pages/NotFound'));
const PrivacyPolicy = lazy(() => import('./pages/StaticPages').then(module => ({ default: module.PrivacyPolicy })));
const Terms = lazy(() => import('./pages/StaticPages').then(module => ({ default: module.Terms })));
const About = lazy(() => import('./pages/StaticPages').then(module => ({ default: module.About })));

// Loading Fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
    <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
  </div>
);

function App() {
  const { addToast } = useToast();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault();
        addToast("Open File Shortcut (Demo): In a real app, this would open the file picker.", 'info');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [addToast]);

  return (
    <Router>
      <div className="flex flex-col min-h-screen relative bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors duration-300">
        {/* Ambient Background Animation */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-300 dark:bg-indigo-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-300 dark:bg-pink-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <ToastContainer />
          
          <main className="flex-grow">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path={ROUTES.HOME} element={<Home />} />
                <Route path={ROUTES.CONVERT} element={<Convert />} />
                <Route path={ROUTES.COMPRESS} element={<Compress />} />
                <Route path={ROUTES.MERGE} element={<Merge />} />
                <Route path={ROUTES.SPLIT} element={<Split />} />
                <Route path={ROUTES.ROTATE} element={<Rotate />} />
                <Route path={ROUTES.RESIZE} element={<Resize />} />
                <Route path={ROUTES.CROP} element={<Crop />} />
                <Route path={ROUTES.ORGANIZE} element={<Organize />} />
                <Route path={ROUTES.WATERMARK} element={<Watermark />} />
                <Route path={ROUTES.PROTECT} element={<Protect />} />
                <Route path={ROUTES.UNLOCK} element={<Unlock />} />
                <Route path={ROUTES.FLATTEN} element={<Flatten />} />
                <Route path={ROUTES.PAGE_NUMBERS} element={<PageNumbers />} />
                <Route path={ROUTES.REPAIR} element={<Repair />} />
                <Route path={ROUTES.SIGN} element={<Sign />} />
                <Route path={ROUTES.GRAYSCALE} element={<Grayscale />} />
                <Route path={ROUTES.OCR} element={<OCR />} />
                <Route path={ROUTES.EXTRACT_IMAGES} element={<ExtractImages />} />
                <Route path={ROUTES.EDIT_METADATA} element={<EditMetadata />} />
                <Route path={ROUTES.HTML_TO_PDF} element={<HtmlToPdf />} />
                <Route path={ROUTES.PDF_TO_PDFA} element={<PdfToPdfA />} />
                <Route path={ROUTES.INVOICE_GENERATOR} element={<InvoiceGenerator />} />
                <Route path={ROUTES.REDACT} element={<Redact />} />
                <Route path={ROUTES.GUIDES} element={<Guides />} />
                <Route path={`${ROUTES.GUIDES}/:slug`} element={<GuidePost />} />
                <Route path="/admin" element={<Admin />} />
                <Route path={ROUTES.PRIVACY} element={<PrivacyPolicy />} />
                <Route path={ROUTES.TERMS} element={<Terms />} />
                <Route path={ROUTES.ABOUT} element={<About />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>

          <CookieBanner />
          <Footer />
        </div>
      </div>
    </Router>
  );
}

export default App;
