import React from 'react';
import ReactDOM from 'react-dom/client';
import './libInit';
import App from './App';
import { LanguageProvider } from './LanguageContext';
import { ThemeProvider } from './ThemeContext';
import { AdSettingsProvider } from './AdSettingsContext';
import { ToastProvider } from './ToastContext';
import { StatsProvider } from './StatsContext';
import { FileHandlerProvider } from './FileHandlerContext';

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
