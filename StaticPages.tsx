
import React from 'react';
import SEO from '@/SEO';
import { APP_NAME, CONTACT_EMAIL } from '@/constants';

const PageLayout: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="max-w-3xl mx-auto px-4 py-16">
    <SEO title={title} />
    <h1 className="text-3xl font-bold text-gray-900 mb-8">{title}</h1>
    <div className="prose prose-indigo text-gray-600">
      {children}
    </div>
  </div>
);

export const PrivacyPolicy: React.FC = () => (
  <PageLayout title="Privacy Policy">
    <p className="text-sm text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
    
    <div className="bg-green-50 border-l-4 border-green-500 p-4 my-6">
        <p className="font-bold text-green-800">Core Promise: Local Processing</p>
        <p className="text-green-700">
            Unlike other services, {APP_NAME} operates entirely in your browser (Client-Side). 
            Your files <strong>never</strong> leave your device. We do not have a server that stores or reads your documents.
        </p>
    </div>

    <h3>1. Information We Collect</h3>
    <p>We do not collect any personal information or file data. Since files are processed locally on your computer using WebAssembly/JavaScript technologies, we simply do not have access to them.</p>
    
    <h3>2. Cookies & Advertising</h3>
    <p>We work with privacy-conscious advertising partners to keep this service free. These cookies track anonymous browsing habits to show relevant ads. You can manage these in your browser settings.</p>
    
    <h3>3. Analytics</h3>
    <p>We use anonymous analytics to track page views and feature usage. No file content is ever tracked.</p>
  </PageLayout>
);

export const Terms: React.FC = () => (
  <PageLayout title="Terms of Service">
    <h3>1. Acceptance of Terms</h3>
    <p>By using {APP_NAME}, you agree to these terms.</p>
    
    <h3>2. Service Nature</h3>
    <p>This is a client-side tool. The quality of conversion and processing depends on your device's browser capabilities.</p>
    
    <h3>3. Disclaimer</h3>
    <p>The service is provided "as is". Since we do not process files on our servers, we are not liable for any data loss, corruption, or failed conversions that occur on your device.</p>
  </PageLayout>
);

export const About: React.FC = () => (
  <PageLayout title="About Us">
    <p className="text-lg leading-relaxed mb-6">{APP_NAME} is a privacy-focused document utility built for the modern web.</p>
    
    <h3 className="text-xl font-bold text-gray-800 mt-8 mb-4">Why Client-Side?</h3>
    <p>Traditional converter sites require you to upload your sensitive contracts, resumes, or financial documents to their servers. You have to trust them not to leak your data.</p>
    <p>We took a different approach. By using advanced browser technologies (WebAssembly, PDF-Lib), we bring the processing engine <strong>to you</strong>.</p>
    
    <div className="mt-8 p-6 bg-indigo-50 rounded-xl border border-indigo-100">
        <h4 className="font-bold text-indigo-900 mb-2">Our Mission</h4>
        <p>To provide free, fast, and completely private document tools for everyone, without compromising on security.</p>
    </div>
    
    <div className="mt-8">
        <h4 className="font-bold text-gray-900 mb-2">Contact</h4>
        <p>If you have questions or feedback, please reach out to us at <a href={`mailto:${CONTACT_EMAIL}`} className="text-indigo-600 hover:underline">{CONTACT_EMAIL}</a></p>
    </div>
  </PageLayout>
);
