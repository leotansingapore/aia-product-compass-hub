import { Link } from "react-router-dom";
import { kbCategories } from "@/utils/kbConfig";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NavigationHeader } from "@/components/NavigationHeader";
import { PageLayout, StructuredData } from "@/components/layout/PageLayout";
import { getCategoryIdFromName } from "@/hooks/useProducts";

export default function KnowledgeBase() {
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
      <div className="max-w-6xl mx-auto px-1 sm:px-4 py-4 sm:py-6 md:py-10">

      <NavigationHeader
        title="Knowledge Base"
        subtitle="Learn and reference AIA products with concise summaries, highlights, explainer videos, documents, and custom GPT links."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Knowledge Base" }]}
      />

      <section aria-labelledby="kb-how-to" className="mb-10">
        <Card>
          <CardHeader>
            <CardTitle id="kb-how-to">How to Use This Portal</CardTitle>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {kbCategories.map((cat) => (
            <Link key={cat.slug} to={`/category/${getCategoryIdFromName(cat.name)}`} aria-label={`Open ${cat.name}`}>
              <Card className="h-full hover:shadow-elegant transition-all duration-300 hover:scale-[1.01]">
                <CardHeader>
                  <CardTitle>{cat.name}</CardTitle>
                  <CardDescription>{cat.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {cat.products.length} product{cat.products.length !== 1 ? "s" : ""}
                  </p>
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
