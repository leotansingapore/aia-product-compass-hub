import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import { findProduct, findCategory } from "@/utils/kbConfig";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import NotFound from "@/pages/NotFound";
import { BrandedPageHeader } from "@/components/layout/BrandedPageHeader";
import { Badge } from "@/components/ui/badge";
import { Tag } from "lucide-react";

const files = import.meta.glob("../../kb/products/**/*.md", { as: "raw", eager: true });

export default function KBProduct() {
  const { categorySlug, productSlug } = useParams<{ categorySlug: string; productSlug: string }>();
  const product = categorySlug && productSlug ? findProduct(categorySlug, productSlug) : undefined;
  const category = categorySlug ? findCategory(categorySlug) : undefined;

  if (!product) return <NotFound />;

  const fileKey = Object.keys(files).find((k) => k.endsWith(product.mdPath));
  const markdown = fileKey ? (files as Record<string, string>)[fileKey] : `# ${product.name}\n\nContent coming soon.`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${product.name} – Product Knowledge`,
    about: product.tags,
    articleSection: product.categorySlug,
  };

  return (
    <>
      <Helmet>
        <title>{product.name} – Knowledge Base</title>
        <meta name="description" content={`Overview, highlights, documents, AI, and video for ${product.name}.`} />
        <link rel="canonical" href={`${window.location.origin}${window.location.pathname}`} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <BrandedPageHeader
        title={product.name}
        subtitle={category?.name}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Knowledge Base", href: "/kb" },
          { label: category?.name || (categorySlug || "Category"), href: `/kb/${categorySlug}` },
          { label: product.name }
        ]}
        showBackButton={true}
        onBack={() => window.history.back()}
      />

      <div className="mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-10">
      {/* Product Tags */}
      {product.tags && product.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {product.tags.map((tag, idx) => (
            <Badge key={idx} variant="secondary" className="text-sm">
              <Tag className="h-3.5 w-3.5 mr-1.5" />
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <article className="prose prose-neutral dark:prose-invert max-w-none prose-headings:scroll-mt-20 prose-img:rounded-lg prose-a:text-primary hover:prose-a:text-primary/80 prose-code:text-sm prose-pre:bg-muted">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            img: (props) => <img loading="lazy" className="w-full h-auto" {...props} />,
            a: (props) => <a {...props} target={props.href?.startsWith("http") ? "_blank" : undefined} rel={props.href?.startsWith("http") ? "noopener noreferrer" : undefined} />,
          }}
        >
          {markdown}
        </ReactMarkdown>
      </article>
      </div>
    </>
  );
}
