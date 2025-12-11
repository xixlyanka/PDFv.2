import React, { useEffect } from 'react';
import { APP_NAME } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title: string;
  description?: string;
  keywords?: string;
}

const SEO: React.FC<SEOProps> = ({ title, description, keywords }) => {
  const { language } = useLanguage();
  const location = useLocation();
  const fullTitle = `${title} | ${APP_NAME}`;
  const defaultDesc = "Free online document tools. Convert, compress, merge, and split PDF files locally in your browser.";
  const canonicalUrl = `https://freepdftools.com${location.pathname}`; // Replace domain in prod
  
  useEffect(() => {
    // 1. Update Title
    document.title = fullTitle;

    // 2. Update Description Meta Tag
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description || defaultDesc);

    // 3. Update Keywords Meta Tag
    if (keywords) {
        let metaKeywords = document.querySelector('meta[name="keywords"]');
        if (!metaKeywords) {
            metaKeywords = document.createElement('meta');
            metaKeywords.setAttribute('name', 'keywords');
            document.head.appendChild(metaKeywords);
        }
        metaKeywords.setAttribute('content', keywords);
    }
    
    // 4. Update Lang Attribute
    document.documentElement.lang = language;

    // 5. Canonical Tag
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
        linkCanonical = document.createElement('link');
        linkCanonical.setAttribute('rel', 'canonical');
        document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', canonicalUrl);

    // 6. Inject JSON-LD (Schema.org)
    const scriptId = 'json-ld-schema';
    let scriptTag = document.getElementById(scriptId);
    if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = scriptId;
        scriptTag.setAttribute('type', 'application/ld+json');
        document.head.appendChild(scriptTag);
    }
    
    const schema = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": APP_NAME,
      "url": canonicalUrl,
      "description": description || defaultDesc,
      "applicationCategory": "UtilitiesApplication",
      "operatingSystem": "Any",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://freepdftools.com/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": title,
            "item": canonicalUrl
          }
        ]
      }
    };
    
    scriptTag.textContent = JSON.stringify(schema);

  }, [fullTitle, description, keywords, defaultDesc, language, canonicalUrl, title]);

  return null;
};

export default SEO;