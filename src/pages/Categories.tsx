import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { getCategorySlugFromId } from "@/utils/slugUtils";
import { useAllProducts } from "@/hooks/useProducts";
import { useMemo } from "react";
import { TrendingUp, Shield, Heart, Clock, Stethoscope, ArrowRight, BookOpen, Star } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { BrandedPageHeader } from "@/components/layout/BrandedPageHeader";

const CATEGORIES = [
  {
    id: "c7cde8f4-12d4-4ddc-9150-7b32008a4e19",
    name: "Investment Products",
    description: "Build wealth and achieve long-term financial goals through investment-linked plans and unit trusts.",
    icon: TrendingUp,
    gradient: "from-emerald-500 to-green-600",
    lightBg: "bg-emerald-50 dark:bg-emerald-950/30",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "3adb6155-c158-408d-b910-9b3db532d435",
    name: "Endowment Products",
    description: "Disciplined savings plans with built-in insurance protection for medium to long-term goals.",
    icon: Shield,
    gradient: "from-blue-500 to-blue-600",
    lightBg: "bg-blue-50 dark:bg-blue-950/30",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    id: "19b8c528-f36e-4731-827c-0cdb1de25059",
    name: "Whole Life Products",
    description: "Lifetime coverage with cash value accumulation — protection that grows with you.",
    icon: Heart,
    gradient: "from-rose-500 to-red-600",
    lightBg: "bg-rose-50 dark:bg-rose-950/30",
    iconColor: "text-rose-600 dark:text-rose-400",
  },
  {
    id: "291cf475-d918-40c0-b37d-33794534d469",
    name: "Term Products",
    description: "Affordable, no-frills protection for a fixed period — maximum coverage at minimum cost.",
    icon: Clock,
    gradient: "from-orange-500 to-amber-600",
    lightBg: "bg-orange-50 dark:bg-orange-950/30",
    iconColor: "text-orange-600 dark:text-orange-400",
  },
  {
    id: "b1024527-481f-4d85-9192-b43633e9be4a",
    name: "Medical Insurance",
    description: "Comprehensive healthcare coverage for hospitalisation, surgery, and critical illness.",
    icon: Stethoscope,
    gradient: "from-violet-500 to-purple-600",
    lightBg: "bg-violet-50 dark:bg-violet-950/30",
    iconColor: "text-violet-600 dark:text-violet-400",
  },
  {
    id: "5ef0b17f-a19f-4859-8349-3e4959620e94",
    name: "Supplementary Training",
    description: "Additional training resources, guides, and materials to support your learning journey.",
    icon: BookOpen,
    gradient: "from-teal-500 to-cyan-600",
    lightBg: "bg-teal-50 dark:bg-teal-950/30",
    iconColor: "text-teal-600 dark:text-teal-400",
  },
  {
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    name: "Core Products",
    description: "A curated collection of our most commonly sold products — the essentials every advisor should know.",
    icon: Star,
    gradient: "from-yellow-500 to-amber-600",
    lightBg: "bg-yellow-50 dark:bg-yellow-950/30",
    iconColor: "text-yellow-600 dark:text-yellow-400",
  },
];

export default function Categories() {
  const navigate = useNavigate();
  const { allProducts, loading } = useAllProducts();

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allProducts.forEach(product => {
      counts[product.category_id] = (counts[product.category_id] || 0) + 1;
    });
    return counts;
  }, [allProducts]);

  return (
    <PageLayout
      title="Product Categories - FINternship"
      description="Browse all product categories and training modules."
    >
      <BrandedPageHeader
        title="📂 Product Categories"
        subtitle="Browse all product categories to find training materials, product knowledge, and sales resources"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Product Categories" },
        ]}
      />

      <div className="mx-auto px-3 sm:px-6 py-4 sm:py-8 pb-20 sm:pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {CATEGORIES.map((category) => {
            const count = categoryCounts[category.id] || 0;
            return (
              <button
                key={category.id}
                onClick={() => navigate(`/category/${getCategorySlugFromId(category.id)}`)}
                className="group text-left rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all duration-200 p-4 sm:p-5"
              >
                <div className="flex items-start gap-4">
                  <div className={`shrink-0 h-12 w-12 rounded-xl ${category.lightBg} flex items-center justify-center group-hover:scale-105 transition-transform duration-200`}>
                    <category.icon className={`h-6 w-6 ${category.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-foreground">{category.name}</span>
                      <Badge variant="secondary" className="text-[10px] h-5 px-1.5 shrink-0">
                        {loading ? "…" : `${count} module${count !== 1 ? "s" : ""}`}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{category.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-3 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  Browse category <ArrowRight className="h-3 w-3" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </PageLayout>
  );
}
