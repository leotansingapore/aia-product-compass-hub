import { memo, useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BrandedPageHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  variant?: "default" | "compact";
  className?: string;
}

/**
 * Unified branded page header component with consistent styling and accessibility
 * Features:
 * - Two-color gradient background for brand consistency
 * - WCAG-compliant focus indicators
 * - Responsive typography and spacing
 * - Optional breadcrumb navigation
 * - Optional custom actions
 * - Mobile-optimized layout
 * - Performance optimized with memoization
 */
export const BrandedPageHeader = memo(function BrandedPageHeader({
  title,
  subtitle,
  showBackButton,
  onBack,
  breadcrumbs,
  actions,
  variant = "default",
  className
}: BrandedPageHeaderProps) {

  // Memoize breadcrumb rendering to avoid unnecessary re-renders
  const breadcrumbElements = useMemo(() => {
    if (!breadcrumbs || breadcrumbs.length === 0) return null;

    return breadcrumbs.map((item, index) => [
      <BreadcrumbItem key={`item-${index}`}>
        {item.href ? (
          <BreadcrumbLink asChild>
            <Link
              to={item.href}
              className="text-white/70 hover:text-white transition-colors focus-visible:text-white focus-visible:underline"
            >
              {item.label}
            </Link>
          </BreadcrumbLink>
        ) : (
          <BreadcrumbPage className="text-white font-medium">{item.label}</BreadcrumbPage>
        )}
      </BreadcrumbItem>,
      index < breadcrumbs.length - 1 && (
        <BreadcrumbSeparator key={`sep-${index}`} className="text-white/50" />
      )
    ]).flat().filter(Boolean);
  }, [breadcrumbs]);

  return (
    <div className={cn(
      "bg-gradient-hero text-white",
      variant === "compact" ? "py-2 sm:py-3 px-2 sm:px-3" : "py-2 sm:py-3 md:py-6 px-2 sm:px-3 md:px-4",
      className
    )}>
      <div className="w-full">

        {/* Breadcrumbs - Hidden on mobile */}
        {breadcrumbElements && (
          <div className="mb-2 md:mb-3 hidden sm:block">
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbElements}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        )}

        {/* Header Content */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2 sm:space-x-3">
            {showBackButton && (
              <Button
                variant="ghost"
                onClick={onBack}
                className="text-white hover:bg-white/20 mobile-touch-target transition-colors"
                aria-label="Go back to previous page"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline ml-2">Back</span>
              </Button>
            )}
            <div className="min-w-0 flex-1">
              <h1 className={cn(
                "font-bold break-words",
                variant === "compact" ? "text-base sm:text-lg" : "text-base sm:text-lg md:text-2xl"
              )}>
                {title}
              </h1>
              {subtitle && (
                <p className={cn(
                  "hidden sm:block text-white/90 mt-1 break-words",
                  variant === "compact" ? "text-micro md:text-sm" : "text-sm md:text-base"
                )}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
