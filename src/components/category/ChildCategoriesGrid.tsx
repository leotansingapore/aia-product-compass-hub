import { useNavigate } from "react-router-dom";
import { ArrowRight, FolderOpen, type LucideIcon } from "lucide-react";
import {
  TrendingUp,
  Shield,
  Heart,
  Clock,
  Stethoscope,
  Star,
  BookOpen,
  Package,
  Layers,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getCategorySlug } from "@/utils/slugUtils";
import type { Category } from "@/hooks/useProducts";
import { cn } from "@/lib/utils";

type CategoryVisual = { icon: LucideIcon; gradient: string };

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

function getVisual(name: string): CategoryVisual {
  return VISUAL_BY_NAME[name.trim().toLowerCase()] ?? DEFAULT_VISUAL;
}

interface ChildCategoriesGridProps {
  parentName: string;
  subCategories: Category[];
  productCounts: Record<string, number>;
}

export function ChildCategoriesGrid({
  parentName,
  subCategories,
  productCounts,
}: ChildCategoriesGridProps) {
  const navigate = useNavigate();

  if (subCategories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FolderOpen className="h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">
          No sub-categories yet under {parentName}.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 items-stretch animate-fade-in">
      {subCategories.map((child) => {
        const visual = getVisual(child.name);
        const Icon = visual.icon;
        const count = productCounts[child.id] || 0;

        return (
          <button
            key={child.id}
            type="button"
            onClick={() => navigate(`/category/${getCategorySlug(child.name)}`)}
            aria-label={`Open ${child.name}`}
            className={cn(
              "group text-left rounded-xl border border-border bg-card",
              "hover:border-primary/30 hover:shadow-md transition-all duration-200",
              "p-4 sm:p-5",
              "h-full min-h-[15rem] sm:min-h-[16rem] flex flex-col",
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
                  title={child.name}
                  className="font-semibold text-foreground line-clamp-2 leading-snug [overflow-wrap:anywhere]"
                >
                  {child.name}
                </span>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {count === 0 ? (
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
                {child.description && (
                  <p
                    title={child.description}
                    className="mt-2 min-h-[4rem] flex-1 line-clamp-4 text-sm leading-relaxed text-muted-foreground [overflow-wrap:anywhere]"
                  >
                    {child.description}
                  </p>
                )}
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
                Browse category
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
  );
}
