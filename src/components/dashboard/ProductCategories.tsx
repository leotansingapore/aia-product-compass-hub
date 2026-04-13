import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { getCategorySlugFromId } from "@/utils/slugUtils";
import { useAllProducts } from "@/hooks/useProducts";
import { useMemo } from "react";
import { ArrowRight, BookOpen, Star, Brain } from "lucide-react";

interface QuickLink {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  lightBg: string;
  iconColor: string;
  route: string;
  count?: number;
}

export function ProductCategories() {
  const navigate = useNavigate();
  const { allProducts, loading } = useAllProducts();

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allProducts.forEach(product => {
      counts[product.category_id] = (counts[product.category_id] || 0) + 1;
    });
    return counts;
  }, [allProducts]);

  const quickLinks: QuickLink[] = [
    {
      id: "core-products",
      name: "Core Products",
      description: "Most commonly sold products across all categories",
      icon: Star,
      lightBg: "bg-yellow-50 dark:bg-yellow-950/30",
      iconColor: "text-yellow-600 dark:text-yellow-400",
      route: `/category/${getCategorySlugFromId("f47ac10b-58cc-4372-a567-0e02b2c3d479")}`,
      count: categoryCounts["f47ac10b-58cc-4372-a567-0e02b2c3d479"] || 0,
    },
    {
      id: "supplementary-training",
      name: "Supplementary Training",
      description: "Additional training resources and materials",
      icon: BookOpen,
      lightBg: "bg-teal-50 dark:bg-teal-950/30",
      iconColor: "text-teal-600 dark:text-teal-400",
      route: `/category/${getCategorySlugFromId("5ef0b17f-a19f-4859-8349-3e4959620e94")}`,
      count: categoryCounts["5ef0b17f-a19f-4859-8349-3e4959620e94"] || 0,
    },
    {
      id: "question-banks",
      name: "Question Banks",
      description: "Practice quizzes for product knowledge",
      icon: Brain,
      lightBg: "bg-indigo-50 dark:bg-indigo-950/30",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      route: "/question-banks",
    },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-foreground">Browse Quick Links</h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
        {quickLinks.map((link) => (
          <button
            key={link.id}
            onClick={() => navigate(link.route)}
            className="group text-left flex items-center gap-3 sm:gap-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all duration-200 p-3 sm:p-4"
          >
            <div className={`shrink-0 h-9 w-9 sm:h-11 sm:w-11 rounded-lg sm:rounded-xl ${link.lightBg} flex items-center justify-center group-hover:scale-105 transition-transform duration-200`}>
              <link.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${link.iconColor}`} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-foreground">{link.name}</span>
                {link.count !== undefined && (
                  <Badge variant="secondary" className="text-[10px] h-4 px-1.5 shrink-0">
                    {loading ? "…" : link.count}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{link.description}</p>
            </div>

            <ArrowRight className="shrink-0 h-4 w-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200" />
          </button>
        ))}
      </div>
    </div>
  );
}
