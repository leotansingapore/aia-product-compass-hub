import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { kbCategories } from "@/utils/kbConfig";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function KnowledgeBase() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-10">
      <Helmet>
        <title>Knowledge Base - FINternship</title>
        <meta name="description" content="Structured knowledge base for investment, endowment, whole life, term, and medical insurance products." />
        <link rel="canonical" href={`${window.location.origin}${window.location.pathname}`} />
      </Helmet>

      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Knowledge Base</h1>
        <p className="text-muted-foreground max-w-2xl">
          Learn and reference AIA products with concise summaries, highlights, explainer videos, documents, and custom GPT links.
        </p>
      </header>

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
            <Link key={cat.slug} to={`/kb/${cat.slug}`} aria-label={`Open ${cat.name}`}>
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
  );
}
