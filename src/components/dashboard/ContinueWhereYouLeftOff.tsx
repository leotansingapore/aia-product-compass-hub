import { useNavigate } from "react-router-dom";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { ArrowRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export function ContinueWhereYouLeftOff() {
  const navigate = useNavigate();
  const { getRecentProducts } = useRecentlyViewed();
  const recentProducts = getRecentProducts().slice(0, 3);

  if (recentProducts.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Continue where you left off
        </h3>
      </div>
      <div className="space-y-2">
        {recentProducts.map((product) => (
          <button
            key={product.id}
            onClick={() => navigate(`/product/${product.id}`)}
            className={cn(
              "w-full flex items-center justify-between gap-3 rounded-lg border bg-card p-3 text-left",
              "hover:bg-muted/50 active:scale-[0.99] transition-all"
            )}
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{product.title}</p>
              {product.categoryName && (
                <p className="text-xs text-muted-foreground truncate">{product.categoryName}</p>
              )}
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}
