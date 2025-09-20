import { ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';

interface OpenGraphData {
  title: string;
  description: string;
  type?: string;
  url?: string;
  image?: string;
}

export interface StructuredData {
  "@context": "https://schema.org";
  "@type": string;
  [key: string]: any;
}

interface PageLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  openGraph?: OpenGraphData;
  structuredData?: StructuredData;
  noIndex?: boolean;
  className?: string;
}

export function PageLayout({ 
  children, 
  title, 
  description, 
  keywords,
  canonical,
  openGraph,
  structuredData,
  noIndex = false,
  className = "min-h-screen bg-background"
}: PageLayoutProps) {
  const currentUrl = `${window.location.origin}${window.location.pathname}`;
  
  return (
    <div className={className}>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        {keywords && <meta name="keywords" content={keywords} />}
        <link rel="canonical" href={canonical || currentUrl} />
        {noIndex && <meta name="robots" content="noindex, nofollow" />}
        
        {/* Open Graph */}
        <meta property="og:title" content={openGraph?.title || title} />
        <meta property="og:description" content={openGraph?.description || description} />
        <meta property="og:type" content={openGraph?.type || "website"} />
        <meta property="og:url" content={openGraph?.url || currentUrl} />
        <meta property="og:image" content={openGraph?.image || `${window.location.origin}/og-default.jpg`} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={openGraph?.title || title} />
        <meta name="twitter:description" content={openGraph?.description || description} />
        <meta name="twitter:image" content={openGraph?.image || `${window.location.origin}/og-default.jpg`} />
        
        {/* Structured Data */}
        {structuredData && (
          <script type="application/ld+json">
            {JSON.stringify(structuredData)}
          </script>
        )}
      </Helmet>
      
      {children}
    </div>
  );
}