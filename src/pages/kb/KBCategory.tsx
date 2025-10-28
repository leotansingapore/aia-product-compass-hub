import { Helmet } from "react-helmet-async";
import { Link, useParams, useNavigate } from "react-router-dom";
import { findCategory } from "@/utils/kbConfig";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BrandedPageHeader } from "@/components/layout/BrandedPageHeader";
import { useEffect } from "react";
import { getCategoryIdFromName } from "@/hooks/useProducts";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Tag } from "lucide-react";

export default function KBCategory() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const category = categorySlug ? findCategory(categorySlug) : undefined;
  const navigate = useNavigate();

  // Note: We no longer redirect to /category since KB has its own routes

  if (!category) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <p className="text-muted-foreground">Category not found.</p>
      </div>
    );
  }

  return (
    <>
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

      <BrandedPageHeader
        title={category.name}
        subtitle={category.description}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Knowledge Base", href: "/kb" },
          { label: category.name }
        ]}
        showBackButton={true}
        onBack={() => window.history.back()}
      />

      <div className="mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-10">
      <main>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {category.products.map((p) => (
            <Link
              key={p.slug}
              to={`/kb/${category.slug}/${p.slug}`}
              aria-label={`Open ${p.name}`}
              className="group"
            >
              <Card className="h-full hover:shadow-elegant transition-all duration-300 hover:scale-[1.01] active:scale-[0.98] border-2 hover:border-primary/20">
                <CardHeader className="space-y-3 pb-4">
                  <CardTitle className="text-base sm:text-lg leading-tight group-hover:text-primary transition-colors">
                    {p.name}
                  </CardTitle>

                  {/* Tags as badges */}
                  {p.tags && p.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {p.tags.map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs font-normal">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">View details</span>
                    <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
      </div>
    </>
  );
}
