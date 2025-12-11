import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AdSettingsProvider } from './contexts/AdSettingsContext';
import { ToastProvider } from './contexts/ToastContext';
import { StatsProvider } from './contexts/StatsContext';
import { FileHandlerProvider } from './contexts/FileHandlerContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <AdSettingsProvider>
          <ToastProvider>
            <StatsProvider>
              <FileHandlerProvider>
                <App />
              </FileHandlerProvider>
            </StatsProvider>
          </ToastProvider>
        </AdSettingsProvider>
      </LanguageProvider>
    </ThemeProvider>
  </React.StrictMode>
);