import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { getCategorySlugFromId } from "@/utils/slugUtils";
import { useAllProducts } from "@/hooks/useProducts";
import { useMemo } from "react";
import { TrendingUp, Shield, Heart, Clock, Stethoscope, ArrowRight } from "lucide-react";

export function ProductCategories() {
  const navigate = useNavigate();
  const { allProducts, loading } = useAllProducts();

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allProducts.forEach(product => {
      const categoryId = product.category_id;
      counts[categoryId] = (counts[categoryId] || 0) + 1;
    });
    return counts;
  }, [allProducts]);

  const categories = [
    {
      id: "c7cde8f4-12d4-4ddc-9150-7b32008a4e19",
      name: "Investment Products",
      description: "Build wealth and achieve long-term financial goals",
      icon: TrendingUp,
      gradient: "from-emerald-500 to-green-600",
      lightBg: "bg-emerald-50 dark:bg-emerald-950/30",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      count: categoryCounts["c7cde8f4-12d4-4ddc-9150-7b32008a4e19"] || 0,
    },
    {
      id: "3adb6155-c158-408d-b910-9b3db532d435",
      name: "Endowment Products",
      description: "Savings plans with built-in insurance protection",
      icon: Shield,
      gradient: "from-blue-500 to-blue-600",
      lightBg: "bg-blue-50 dark:bg-blue-950/30",
      iconColor: "text-blue-600 dark:text-blue-400",
      count: categoryCounts["3adb6155-c158-408d-b910-9b3db532d435"] || 0,
    },
    {
      id: "19b8c528-f36e-4731-827c-0cdb1de25059",
      name: "Whole Life Products",
      description: "Lifetime coverage with a cash value component",
      icon: Heart,
      gradient: "from-rose-500 to-red-600",
      lightBg: "bg-rose-50 dark:bg-rose-950/30",
      iconColor: "text-rose-600 dark:text-rose-400",
      count: categoryCounts["19b8c528-f36e-4731-827c-0cdb1de25059"] || 0,
    },
    {
      id: "291cf475-d918-40c0-b37d-33794534d469",
      name: "Term Products",
      description: "Affordable, no-frills protection for a fixed period",
      icon: Clock,
      gradient: "from-orange-500 to-amber-600",
      lightBg: "bg-orange-50 dark:bg-orange-950/30",
      iconColor: "text-orange-600 dark:text-orange-400",
      count: categoryCounts["291cf475-d918-40c0-b37d-33794534d469"] || 0,
    },
    {
      id: "b1024527-481f-4d85-9192-b43633e9be4a",
      name: "Medical Insurance",
      description: "Healthcare cover for hospitalisation and illness",
      icon: Stethoscope,
      gradient: "from-violet-500 to-purple-600",
      lightBg: "bg-violet-50 dark:bg-violet-950/30",
      iconColor: "text-violet-600 dark:text-violet-400",
      count: categoryCounts["b1024527-481f-4d85-9192-b43633e9be4a"] || 0,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">Browse by Product Category</h3>
        <span className="text-xs text-muted-foreground">{categories.length} categories</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => navigate(`/category/${getCategorySlugFromId(category.id)}`)}
            className="group text-left flex items-center gap-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all duration-200 p-4"
          >
            {/* Icon */}
            <div className={`shrink-0 h-11 w-11 rounded-xl ${category.lightBg} flex items-center justify-center group-hover:scale-105 transition-transform duration-200`}>
              <category.icon className={`h-5 w-5 ${category.iconColor}`} />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-foreground">{category.name}</span>
                <Badge variant="secondary" className="text-[10px] h-4 px-1.5 shrink-0">
                  {loading ? "…" : category.count}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{category.description}</p>
            </div>

            {/* Arrow */}
            <ArrowRight className="shrink-0 h-4 w-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200" />
          </button>
        ))}
      </div>
    </div>
  );
}
