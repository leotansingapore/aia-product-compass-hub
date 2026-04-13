import { useNavigate } from "react-router-dom";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { ArrowRight, Clock, Compass, GraduationCap, BookOpen, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function ContinueWhereYouLeftOff() {
  const navigate = useNavigate();
  const { getRecentProducts } = useRecentlyViewed();
  const recentProducts = getRecentProducts().slice(0, 3);

  // New learners: show getting started suggestions
  if (recentProducts.length === 0) {
    const suggestions = [
      { label: "Browse Products", desc: "Explore insurance and investment products", href: "/categories", icon: Compass },
      { label: "CMFAS Exam Prep", desc: "Start preparing for your certification", href: "/cmfas-exams", icon: GraduationCap },
      { label: "Sales Playbooks", desc: "Scripts and objection handling guides", href: "/scripts", icon: BookOpen },
    ];
    return (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Compass className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Get Started
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {suggestions.map((s) => (
            <button
              key={s.href}
              onClick={() => navigate(s.href)}
              className="flex items-center gap-3 rounded-lg border bg-card p-3 text-left hover:bg-muted/50 active:scale-[0.99] transition-all"
            >
              <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                <s.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{s.label}</p>
                <p className="text-xs text-muted-foreground truncate">{s.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

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
