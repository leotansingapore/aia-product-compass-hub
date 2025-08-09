import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import { findProduct, findCategory } from "@/utils/kbConfig";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import NotFound from "@/pages/NotFound";
import { NavigationHeader } from "@/components/NavigationHeader";

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
    <div className="max-w-3xl mx-auto px-1 sm:px-4 py-4 sm:py-6 md:py-10">
      <Helmet>
        <title>{product.name} – Knowledge Base</title>
        <meta name="description" content={`Overview, highlights, documents, AI, and video for ${product.name}.`} />
        <link rel="canonical" href={`${window.location.origin}${window.location.pathname}`} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <NavigationHeader
        title={product.name}
        subtitle={product.tags?.length ? `Tags: ${product.tags.join(", ")}` : undefined}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Knowledge Base", href: "/kb" },
          { label: category?.name || (categorySlug || "Category"), href: `/kb/${categorySlug}` },
          { label: product.name }
        ]}
      />

      <article className="prose prose-neutral dark:prose-invert max-w-none">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]} 
          rehypePlugins={[rehypeRaw]} 
          components={{
            img: (props) => <img loading="lazy" {...props} />,
            a: (props) => <a {...props} target={props.href?.startsWith("http") ? "_blank" : undefined} rel={props.href?.startsWith("http") ? "noopener noreferrer" : undefined} />,
          }}
        >
          {markdown}
        </ReactMarkdown>
      </article>
    </div>
  );
}
