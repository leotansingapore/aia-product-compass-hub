import { Helmet } from "react-helmet-async";
import { SEOData, StructuredData } from "@/utils/seoUtils";

interface SEOHeadProps {
  seo: SEOData;
  structuredData?: StructuredData[];
  noIndex?: boolean;
}

export function SEOHead({ seo, structuredData = [], noIndex = false }: SEOHeadProps) {
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      {seo.keywords && <meta name="keywords" content={seo.keywords.join(", ")} />}
      <link rel="canonical" href={seo.url} />
      
      {/* Robots */}
      <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow"} />
      
      {/* Author */}
      {seo.author && <meta name="author" content={seo.author} />}
      
      {/* Open Graph */}
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:type" content={seo.type || "website"} />
      <meta property="og:url" content={seo.url} />
      <meta property="og:site_name" content="FINternship Learning Platform" />
      {seo.image && <meta property="og:image" content={seo.image} />}
      {seo.image && <meta property="og:image:alt" content={`${seo.title} - Visual Guide`} />}
      {seo.section && <meta property="article:section" content={seo.section} />}
      {seo.tags && seo.tags.map(tag => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}
      {seo.publishedTime && <meta property="article:published_time" content={seo.publishedTime} />}
      {seo.modifiedTime && <meta property="article:modified_time" content={seo.modifiedTime} />}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@finternship" />
      <meta name="twitter:creator" content="@finternship" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      {seo.image && <meta name="twitter:image" content={seo.image} />}
      {seo.image && <meta name="twitter:image:alt" content={`${seo.title} - Visual Guide`} />}
      
      {/* Mobile Optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#2563eb" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      
      {/* Performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* Structured Data */}
      {structuredData.map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}
    </Helmet>
  );
}