import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { getCategorySlug } from "@/utils/slugUtils";
import { useAllProducts, useCategories, getCategoryChildren } from "@/hooks/useProducts";
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
  Package,
  Layers,
  type LucideIcon,
} from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { BrandedPageHeader } from "@/components/layout/BrandedPageHeader";
import { cn } from "@/lib/utils";

type CategoryVisual = {
  icon: LucideIcon;
  gradient: string;
};

// Visual metadata keyed by normalized category name. Admins can add new DB
// rows; unknown names fall back to a neutral default so the grid still renders.
const VISUAL_BY_NAME: Record<string, CategoryVisual> = {
  "core products": { icon: Star, gradient: "from-yellow-500 to-amber-600" },
  "investment products": { icon: TrendingUp, gradient: "from-emerald-500 to-green-600" },
  "endowment products": { icon: Shield, gradient: "from-blue-500 to-blue-600" },
  "whole life products": { icon: Heart, gradient: "from-rose-500 to-red-600" },
  "term products": { icon: Clock, gradient: "from-orange-500 to-amber-600" },
  "medical insurance": { icon: Stethoscope, gradient: "from-violet-500 to-purple-600" },
  "medical insurance products": { icon: Stethoscope, gradient: "from-violet-500 to-purple-600" },
  "supplementary products": { icon: Layers, gradient: "from-sky-500 to-indigo-600" },
  "supplementary training": { icon: BookOpen, gradient: "from-teal-500 to-cyan-600" },
};

const DEFAULT_VISUAL: CategoryVisual = {
  icon: Package,
  gradient: "from-slate-500 to-slate-700",
};

// IDs of categories that should get the "Start here" badge. Kept as data
// rather than a DB column since it's a curation choice, not per-row state.
const START_HERE_IDS = new Set<string>([
  "f47ac10b-58cc-4372-a567-0e02b2c3d479", // Core Products
]);

// IDs of categories that have their own dedicated page and should not appear
// in the generic /categories grid.
const HIDDEN_FROM_GRID_IDS = new Set<string>([
  "be7504d3-e88b-4107-aae2-f8027fd884e0", // CMFAS → /cmfas-exams
]);

function getVisual(name: string): CategoryVisual {
  return VISUAL_BY_NAME[name.trim().toLowerCase()] ?? DEFAULT_VISUAL;
}

export default function Categories() {
  const navigate = useNavigate();
  const { categories, loading: categoriesLoading } = useCategories();
  const { allProducts, loading: productsLoading } = useAllProducts();

  const productCountByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    allProducts.forEach((product) => {
      counts[product.category_id] = (counts[product.category_id] || 0) + 1;
    });
    return counts;
  }, [allProducts]);

  const topLevel = useMemo(
    () =>
      categories
        .filter((c) => c.parent_id === null && !HIDDEN_FROM_GRID_IDS.has(c.id))
        .sort(
          (a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name),
        ),
    [categories],
  );

  const getRolledUpCount = (categoryId: string): number => {
    const direct = productCountByCategory[categoryId] || 0;
    const childSum = getCategoryChildren(categoryId, categories).reduce(
      (sum, child) => sum + (productCountByCategory[child.id] || 0),
      0,
    );
    return direct + childSum;
  };

  const totalProducts = allProducts.length;
  const loading = categoriesLoading || productsLoading;

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
          <span className="font-medium text-foreground">
            {topLevel.length} categor{topLevel.length !== 1 ? "ies" : "y"}
          </span>
          {!loading && totalProducts > 0 ? (
            <>
              {" "}
              · {totalProducts} product{totalProducts !== 1 ? "s" : ""} in the catalog
            </>
          ) : loading ? (
            <> · loading catalog…</>
          ) : null}
        </p>

        {loading && topLevel.length === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-44 rounded-xl border bg-muted/30 animate-pulse" />
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 items-stretch">
          {topLevel.map((category) => {
            const visual = getVisual(category.name);
            const Icon = visual.icon;
            const count = getRolledUpCount(category.id);
            const children = getCategoryChildren(category.id, categories);
            const isParent = children.length > 0;
            const isStartHere = START_HERE_IDS.has(category.id);

            return (
              <button
                key={category.id}
                type="button"
                onClick={() =>
                  navigate(`/category/${getCategorySlug(category.name)}`)
                }
                aria-label={`Open ${category.name}`}
                className={cn(
                  "group text-left rounded-xl border border-border bg-card",
                  "hover:border-primary/30 hover:shadow-md transition-all duration-200",
                  "p-4 sm:p-5",
                  "h-full min-h-[17.5rem] sm:min-h-[18.5rem] flex flex-col",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                )}
              >
                <div className="flex flex-1 min-h-0 items-start gap-4">
                  <div
                    className={cn(
                      "shrink-0 h-12 w-12 rounded-xl flex items-center justify-center",
                      "bg-gradient-to-br shadow-md border border-white/10",
                      visual.gradient,
                      "group-hover:scale-105 transition-transform duration-200",
                    )}
                  >
                    <Icon className="h-6 w-6 text-white" aria-hidden />
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
                      {isParent && (
                        <Badge
                          variant="outline"
                          className="h-5 shrink-0 px-1.5 text-[10px] font-normal"
                        >
                          {children.length} sub-categor
                          {children.length !== 1 ? "ies" : "y"}
                        </Badge>
                      )}
                      {loading ? (
                        <Badge
                          variant="secondary"
                          className="h-5 shrink-0 px-1.5 text-[10px]"
                        >
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
                        <Badge
                          variant="secondary"
                          className="h-5 shrink-0 px-1.5 text-[10px]"
                        >
                          {count} product{count !== 1 ? "s" : ""}
                        </Badge>
                      )}
                    </div>
                    <p
                      title={category.description}
                      className="mt-2 flex-1 line-clamp-4 text-sm leading-relaxed text-muted-foreground [overflow-wrap:anywhere] sm:min-h-[5.25rem]"
                    >
                      {category.description}
                    </p>
                  </div>
                </div>

                <div
                  className={cn(
                    "mt-auto pt-3 border-t border-border/60",
                    "flex items-center justify-between gap-2",
                    "text-xs font-medium text-primary",
                  )}
                >
                  <span className="group-hover:underline underline-offset-2">
                    {isParent ? "Browse sub-categories" : "Browse category"}
                  </span>
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
