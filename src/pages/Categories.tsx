import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { getCategorySlugFromId } from "@/utils/slugUtils";
import { useAllProducts } from "@/hooks/useProducts";
import { useMemo } from "react";
import {
  TrendingUp,
  Shield,
  Heart,
  Clock,
  Stethoscope,
  ArrowRight,
  BookOpen,
  Star,
} from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { BrandedPageHeader } from "@/components/layout/BrandedPageHeader";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  {
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    name: "Core Products",
    description:
      "A curated collection of our most commonly sold products — the essentials every advisor should know.",
    icon: Star,
    gradient: "from-yellow-500 to-amber-600",
    startHere: true,
  },
  {
    id: "c7cde8f4-12d4-4ddc-9150-7b32008a4e19",
    name: "Investment Products",
    description:
      "Build wealth and achieve long-term financial goals through investment-linked plans and unit trusts.",
    icon: TrendingUp,
    gradient: "from-emerald-500 to-green-600",
  },
  {
    id: "3adb6155-c158-408d-b910-9b3db532d435",
    name: "Endowment Products",
    description:
      "Disciplined savings plans with built-in insurance protection for medium to long-term goals.",
    icon: Shield,
    gradient: "from-blue-500 to-blue-600",
  },
  {
    id: "19b8c528-f36e-4731-827c-0cdb1de25059",
    name: "Whole Life Products",
    description:
      "Lifetime coverage with cash value accumulation — protection that grows with you.",
    icon: Heart,
    gradient: "from-rose-500 to-red-600",
  },
  {
    id: "291cf475-d918-40c0-b37d-33794534d469",
    name: "Term Products",
    description:
      "Affordable, no-frills protection for a fixed period — maximum coverage at minimum cost.",
    icon: Clock,
    gradient: "from-orange-500 to-amber-600",
  },
  {
    id: "b1024527-481f-4d85-9192-b43633e9be4a",
    name: "Medical Insurance",
    description:
      "Comprehensive healthcare coverage for hospitalisation, surgery, and critical illness.",
    icon: Stethoscope,
    gradient: "from-violet-500 to-purple-600",
  },
  {
    id: "5ef0b17f-a19f-4859-8349-3e4959620e94",
    name: "Supplementary Training",
    description:
      "Additional training resources, guides, and materials to support your learning journey.",
    icon: BookOpen,
    gradient: "from-teal-500 to-cyan-600",
  },
] as const;

export default function Categories() {
  const navigate = useNavigate();
  const { allProducts, loading } = useAllProducts();

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allProducts.forEach((product) => {
      counts[product.category_id] = (counts[product.category_id] || 0) + 1;
    });
    return counts;
  }, [allProducts]);

  const totalProducts = allProducts.length;

  return (
    <PageLayout
      title="Product Categories - FINternship"
      description="Browse all product categories and training modules."
    >
      <BrandedPageHeader
        title="Product Categories"
        titlePrefix="📂 "
        subtitle="Browse all product categories to find training materials, product knowledge, and sales resources"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Product Categories" },
        ]}
      />

      <div className="mx-auto max-w-7xl px-2 sm:px-4 md:px-6 py-4 sm:py-8 pb-20 sm:pb-8 animate-fade-in">
        <p className="text-sm text-muted-foreground mb-4 sm:mb-6 max-w-3xl">
          <span className="font-medium text-foreground">{CATEGORIES.length} categories</span>
          {!loading && totalProducts > 0 ? (
            <>
              {" "}
              · {totalProducts} product{totalProducts !== 1 ? "s" : ""} in the catalog
            </>
          ) : loading ? (
            <> · loading catalog…</>
          ) : null}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 items-stretch">
          {CATEGORIES.map((category) => {
            const count = categoryCounts[category.id] || 0;
            const isStartHere = "startHere" in category && category.startHere;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => navigate(`/category/${getCategorySlugFromId(category.id)}`)}
                aria-label={`Open ${category.name}`}
                className={cn(
                  "group text-left rounded-xl border border-border bg-card",
                  "hover:border-primary/30 hover:shadow-md transition-all duration-200",
                  "p-4 sm:p-5",
                  "h-full min-h-[17.5rem] sm:min-h-[18.5rem] flex flex-col",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                )}
              >
                <div className="flex flex-1 min-h-0 items-start gap-4">
                  <div
                    className={cn(
                      "shrink-0 h-12 w-12 rounded-xl flex items-center justify-center",
                      "bg-gradient-to-br shadow-md border border-white/10",
                      category.gradient,
                      "group-hover:scale-105 transition-transform duration-200"
                    )}
                  >
                    <category.icon className="h-6 w-6 text-white" aria-hidden />
                  </div>
                  <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                    <span
                      title={category.name}
                      className="font-semibold text-foreground line-clamp-2 leading-snug [overflow-wrap:anywhere]"
                    >
                      {category.name}
                    </span>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {isStartHere && (
                        <Badge
                          variant="default"
                          className="h-5 shrink-0 px-1.5 text-[10px] font-medium"
                        >
                          Start here
                        </Badge>
                      )}
                      {loading ? (
                        <Badge variant="secondary" className="h-5 shrink-0 px-1.5 text-[10px]">
                          …
                        </Badge>
                      ) : count === 0 ? (
                        <Badge
                          variant="outline"
                          className="h-5 shrink-0 px-1.5 text-[10px] font-normal text-muted-foreground"
                        >
                          Coming soon
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="h-5 shrink-0 px-1.5 text-[10px]">
                          {count} product{count !== 1 ? "s" : ""}
                        </Badge>
                      )}
                    </div>
                    <p
                      title={category.description}
                      className="mt-2 min-h-[5rem] flex-1 line-clamp-4 text-sm leading-relaxed text-muted-foreground [overflow-wrap:anywhere] sm:min-h-[5.25rem]"
                    >
                      {category.description}
                    </p>
                  </div>
                </div>

                <div
                  className={cn(
                    "mt-auto pt-3 border-t border-border/60",
                    "flex items-center justify-between gap-2",
                    "text-xs font-medium text-primary"
                  )}
                >
                  <span className="group-hover:underline underline-offset-2">Browse category</span>
                  <ArrowRight
                    className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </PageLayout>
  );
}
