import { Helmet } from "react-helmet-async";
import { Link, useParams, useNavigate } from "react-router-dom";
import { findCategory } from "@/utils/kbConfig";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { NavigationHeader } from "@/components/NavigationHeader";
import { useEffect } from "react";
import { getCategoryIdFromName } from "@/hooks/useProducts";

export default function KBCategory() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const category = categorySlug ? findCategory(categorySlug) : undefined;
  const navigate = useNavigate();

  useEffect(() => {
    if (category) {
      const categoryId = getCategoryIdFromName(category.name);
      navigate(`/category/${categoryId}`, { replace: true });
    }
  }, [category?.name]);

  if (!category) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <p className="text-muted-foreground">Category not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-1 sm:px-4 py-4 sm:py-6 md:py-10">
      <Helmet>
        <title>{category.name} - Product Training Hub | FINternship</title>
        <meta name="description" content={`Master ${category.name.toLowerCase()} with structured product training pages and comprehensive resources. ${category.description} Access expert guides, training videos, and AI assistance.`} />
        <meta name="keywords" content={`${category.name.toLowerCase()}, product training, financial advisor education, AIA products, training resources`} />
        <link rel="canonical" href={`${window.location.origin}${window.location.pathname}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={`${category.name} - Product Training Hub | FINternship`} />
        <meta property="og:description" content={`Master ${category.name.toLowerCase()} with structured training resources and expert guidance.`} />
        <meta property="og:type" content="section" />
        <meta property="og:url" content={`${window.location.origin}${window.location.pathname}`} />
        <meta property="og:image" content={`${window.location.origin}/og-default.jpg`} />
        <meta property="og:section" content={category.name} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${category.name} - Product Training Hub | FINternship`} />
        <meta name="twitter:description" content={`Master ${category.name.toLowerCase()} with structured training resources.`} />
        <meta name="twitter:image" content={`${window.location.origin}/og-default.jpg`} />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": `${category.name} Training Hub`,
            "description": category.description,
            "url": `${window.location.origin}${window.location.pathname}`,
            "isPartOf": {
              "@type": "WebSite",
              "name": "FINternship Learning Platform",
              "url": window.location.origin
            },
            "mainEntity": {
              "@type": "ItemList",
              "numberOfItems": category.products.length,
              "itemListElement": category.products.map((product, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                  "@type": "Course",
                  "name": product.name,
                  "description": `Learn about ${product.name} - ${product.tags.join(', ')}`,
                  "url": `${window.location.origin}/kb/${category.slug}/${product.slug}`,
                  "courseMode": "online",
                  "educationalLevel": "professional"
                }
              }))
            }
          })}
        </script>
      </Helmet>

      <NavigationHeader
        title={category.name}
        subtitle={category.description}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Knowledge Base", href: "/kb" },
          { label: category.name }
        ]}
      />

      <main>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {category.products.map((p) => (
            <Link key={p.slug} to={`/kb/${category.slug}/${p.slug}`} aria-label={`Open ${p.name}`}>
              <Card className="h-full hover:shadow-elegant transition-all duration-300 hover:scale-[1.01]">
                <CardHeader>
                  <CardTitle>{p.name}</CardTitle>
                  <CardDescription>Tags: {p.tags.join(", ")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Open product page</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
