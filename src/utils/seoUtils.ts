export interface SEOData {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
}

export interface StructuredData {
  "@context": string;
  "@type": string;
  [key: string]: any;
}

// Generate canonical URL with clean slug-based URLs
export const getCanonicalUrl = (path?: string): string => {
  const baseUrl = window.location.origin;
  if (path) {
    return `${baseUrl}${path}`;
  }
  
  // For current URL, ensure we use slug-based canonical
  const currentPath = window.location.pathname;
  return `${baseUrl}${currentPath}`;
};

// Default SEO values
export const defaultSEO: SEOData = {
  title: "FINternship Learning Platform - Financial Advisory Training",
  description: "Comprehensive learning platform for financial advisors featuring investment products, endowments, whole life, term insurance, and medical coverage with AI assistance and training videos.",
  keywords: ["financial advisor training", "insurance products", "investment learning", "AIA products", "financial education"],
  image: `${window.location.origin}/og-default.jpg`,
  type: "website",
  author: "FINternship Learning Platform"
};

// Generate page-specific SEO data
export const generateSEO = (data: Partial<SEOData>): SEOData => {
  return {
    ...defaultSEO,
    ...data,
    title: data.title ? `${data.title} - FINternship` : defaultSEO.title,
    url: data.url || getCanonicalUrl(),
  };
};

// Category-specific SEO
export const getCategorySEO = (categoryName: string, description: string, productCount: number): SEOData => {
  return generateSEO({
    title: `${categoryName} - Product Knowledge & Training`,
    description: `Master ${categoryName.toLowerCase()} with ${productCount} comprehensive products. ${description} Access training videos, documents, and AI assistance.`,
    keywords: [categoryName.toLowerCase(), "financial products", "training", "education", "AIA"],
    type: "section",
    section: categoryName
  });
};

// Product-specific SEO
export const getProductSEO = (productName: string, categoryName: string, tags: string[]): SEOData => {
  return generateSEO({
    title: `${productName} - ${categoryName} Product Guide`,
    description: `Complete guide to ${productName}. Learn key features, benefits, objections handling, and selling strategies. Includes training videos, documents, and AI assistance.`,
    keywords: [productName.toLowerCase(), categoryName.toLowerCase(), "product guide", "training", ...tags.map(t => t.toLowerCase())],
    type: "article",
    section: categoryName,
    tags: tags
  });
};

// Auth page SEO
export const getAuthSEO = (): SEOData => {
  return generateSEO({
    title: "Sign In - Access Your Learning Platform",
    description: "Sign in to FINternship Learning Platform. Track progress, earn achievements, access comprehensive financial product training, and enhance your advisory skills.",
    keywords: ["sign in", "login", "financial advisor platform", "learning platform", "training portal"],
    type: "website"
  });
};

// Dashboard SEO
export const getDashboardSEO = (): SEOData => {
  return generateSEO({
    title: "Dashboard - Your Learning Hub",
    description: "Access your personalized learning dashboard. Browse product categories, track progress, discover recommendations, and continue your financial advisory education.",
    keywords: ["dashboard", "learning hub", "financial products", "training progress", "product categories"],
    type: "webapp"
  });
};

// Generate structured data for organization
export const getOrganizationStructuredData = (): StructuredData => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "FINternship Learning Platform",
    "description": "Comprehensive learning platform for financial advisors",
    "url": window.location.origin,
    "logo": `${window.location.origin}/logo.png`,
    "sameAs": [
      "https://www.aia.com"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "support@finternship.com"
    }
  };
};

// Generate structured data for courses
export const getCourseStructuredData = (name: string, description: string, provider: string = "FINternship"): StructuredData => {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": name,
    "description": description,
    "provider": {
      "@type": "Organization",
      "name": provider
    },
    "courseMode": "online",
    "educationalLevel": "professional",
    "teaches": name
  };
};

// Generate structured data for products
export const getProductStructuredData = (name: string, description: string, category: string): StructuredData => {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": name,
    "description": description,
    "category": category,
    "brand": {
      "@type": "Brand",
      "name": "AIA"
    },
    "offers": {
      "@type": "Offer",
      "availability": "https://schema.org/InStock"
    }
  };
};

// Generate structured data for articles
export const getArticleStructuredData = (title: string, description: string, author: string = "FINternship"): StructuredData => {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "author": {
      "@type": "Organization",
      "name": author
    },
    "publisher": {
      "@type": "Organization",
      "name": "FINternship Learning Platform",
      "logo": {
        "@type": "ImageObject",
        "url": `${window.location.origin}/logo.png`
      }
    },
    "datePublished": new Date().toISOString(),
    "dateModified": new Date().toISOString()
  };
};

// Generate breadcrumb structured data
export const getBreadcrumbStructuredData = (items: { name: string; url: string }[]): StructuredData => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
};