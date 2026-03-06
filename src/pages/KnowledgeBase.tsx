import { Link } from "react-router-dom";
import { kbCategories } from "@/utils/kbConfig";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BrandedPageHeader } from "@/components/layout/BrandedPageHeader";
import { PageLayout, StructuredData } from "@/components/layout/PageLayout";
import { getCategoryIdFromName } from "@/hooks/useProducts";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, BookOpen, TrendingUp, Shield, Heart, FileText, Clock } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

// Helper function to get category icons
const getCategoryIcon = (categoryName: string) => {
  const iconMap: Record<string, any> = {
    "Investment Products": TrendingUp,
    "Endowment Products": Clock,
    "Whole Life Products": Shield,
    "Term Products": Heart,
    "Medical Insurance Products": Heart,
    "Appointment Flows": FileText,
  };
  const IconComponent = iconMap[categoryName] || BookOpen;
  return <IconComponent className="h-5 w-5" />;
};

export default function KnowledgeBase() {
  const [isHowToOpen, setIsHowToOpen] = useState(false);
  const structuredData: StructuredData = {
    "@context": "https://schema.org" as const,
    "@type": "CollectionPage",
    "name": "Knowledge Base - FINternship",
    "description": "Comprehensive knowledge base for financial advisor product training",
    "url": `${window.location.origin}${window.location.pathname}`,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": kbCategories.length,
      "itemListElement": kbCategories.map((category, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Course",
          "name": category.name,
          "description": category.description,
          "url": `${window.location.origin}/category/${getCategoryIdFromName(category.name)}`,
          "courseMode": "online",
          "educationalLevel": "professional"
        }
      }))
    }
  };

  return (
    <PageLayout
      title="Knowledge Base - Product Training Hub | FINternship"
      description="Access structured knowledge base for AIA investment, endowment, whole life, term, and medical insurance products. Comprehensive guides with videos, documents, AI assistance, and expert training materials."
      keywords="knowledge base, product training, AIA products, financial advisor resources, insurance guides, investment training"
      structuredData={structuredData}
      openGraph={{
        title: "Knowledge Base - Product Training Hub | FINternship",
        description: "Master AIA products with our comprehensive knowledge base featuring training videos, expert guides, and AI assistance for financial advisors.",
        type: "website"
      }}
    >
      <BrandedPageHeader
        title="📚 Knowledge Base"
        subtitle="Learn and reference AIA products with concise summaries, highlights, explainer videos, documents, and custom GPT links."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Knowledge Base" }]}
        showBackButton={true}
        onBack={() => window.history.back()}
      />

      <div className="mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-10">
      <section aria-labelledby="kb-how-to" className="mb-6 sm:mb-10">
        {/* Mobile: Collapsible, Desktop: Full Card */}
        <div className="md:hidden">
          <Collapsible open={isHowToOpen} onOpenChange={setIsHowToOpen}>
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <span className="font-semibold">How to Use This Portal</span>
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${isHowToOpen ? "rotate-180" : ""}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <Card>
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Start here to understand navigation, sections, and best practices.
                  </p>
                  <Link to="/how-to-use">
                    <Button variant="default" size="sm" className="w-full">Read the Welcome Guide</Button>
                  </Link>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Desktop: Full Card */}
        <Card className="hidden md:block">
          <CardHeader>
            <CardTitle id="kb-how-to" className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              How to Use This Portal
            </CardTitle>
            <CardDescription>
              Start here to understand navigation, sections, and best practices.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/how-to-use">
              <Button variant="default">Read the Welcome Guide</Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      <main>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {kbCategories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/kb/${cat.slug}`}
              aria-label={`Open ${cat.name}`}
              className="group"
            >
              <Card className="h-full hover:shadow-elegant transition-all duration-300 hover:scale-[1.01] active:scale-[0.98] border-2 hover:border-primary/20">
                <CardHeader className="space-y-3 pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        {getCategoryIcon(cat.name)}
                      </div>
                      <CardTitle className="text-base sm:text-lg truncate">{cat.name}</CardTitle>
                    </div>
                    <Badge variant="secondary" className="flex-shrink-0 font-semibold">
                      {cat.products.length}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm leading-relaxed line-clamp-2">
                    {cat.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {cat.products.length} product{cat.products.length !== 1 ? "s" : ""}
                    </span>
                    <span className="text-primary group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
      </div>
    </PageLayout>
  );
}
