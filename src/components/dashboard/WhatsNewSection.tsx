import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Sparkles, Package, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface RecentProduct {
  id: string;
  title: string;
  description: string | null;
  category_name: string;
  created_at: string;
  updated_at: string;
}

export function WhatsNewSection() {
  const navigate = useNavigate();

  const { data: recentProducts, isLoading } = useQuery({
    queryKey: ["whats-new-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, title, description, updated_at, created_at, category_id, categories(name)")
        .eq("published", true)
        .order("updated_at", { ascending: false })
        .limit(5);

      if (error) throw error;

      return (data || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        category_name: p.categories?.name || "General",
        created_at: p.created_at,
        updated_at: p.updated_at,
      })) as RecentProduct[];
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <h3 className="text-base font-semibold text-foreground">Recently Updated</h3>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!recentProducts?.length) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <h3 className="text-base font-semibold text-foreground">Recently Updated</h3>
        </div>
        <span className="text-xs text-muted-foreground">Latest product updates</span>
      </div>

      <Card className="divide-y divide-border overflow-hidden">
        {recentProducts.map((product) => {
          const timeAgo = formatDistanceToNow(new Date(product.updated_at), { addSuffix: true });
          const isNew = Date.now() - new Date(product.created_at).getTime() < 7 * 24 * 60 * 60 * 1000;

          return (
            <button
              key={product.id}
              onClick={() => navigate(`/product/${product.id}`)}
              className="w-full flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-4 text-left hover:bg-muted/50 transition-colors group"
            >
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Package className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm truncate text-foreground">{product.title}</p>
                  {isNew && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 shrink-0">
                      New
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {product.category_name} · Updated {timeAgo}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground shrink-0 transition-colors" />
            </button>
          );
        })}
      </Card>
    </div>
  );
}
