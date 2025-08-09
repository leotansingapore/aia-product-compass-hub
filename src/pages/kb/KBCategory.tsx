import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { findCategory } from "@/utils/kbConfig";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { NavigationHeader } from "@/components/NavigationHeader";

export default function KBCategory() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const category = categorySlug ? findCategory(categorySlug) : undefined;

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
        <title>{category.name} - Knowledge Base</title>
        <meta name="description" content={`Learn about ${category.name} with structured product pages and training resources.`} />
        <link rel="canonical" href={`${window.location.origin}${window.location.pathname}`} />
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
