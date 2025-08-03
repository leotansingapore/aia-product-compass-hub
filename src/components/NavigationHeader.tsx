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
import { useAdmin } from "@/hooks/useAdmin";
import { Settings } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface NavigationHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

export function NavigationHeader({ title, subtitle, showBackButton, onBack, breadcrumbs, actions }: NavigationHeaderProps) {
  const { isAdminMode, toggleAdminMode, isAdmin } = useAdmin();
  return (
    <div className="bg-gradient-hero text-white py-2 sm:py-3 md:py-6 px-2 sm:px-3 md:px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Breadcrumbs - Hidden on mobile */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="mb-2 md:mb-3 hidden sm:block">
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((item, index) => [
                  <BreadcrumbItem key={`item-${index}`}>
                    {item.href ? (
                      <BreadcrumbLink asChild>
                        <Link to={item.href} className="text-white/70 hover:text-white">
                          {item.label}
                        </Link>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage className="text-white">{item.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>,
                  index < breadcrumbs.length - 1 && (
                    <BreadcrumbSeparator key={`sep-${index}`} className="text-white/50" />
                  )
                ]).flat().filter(Boolean)}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        )}

        {/* Header Content */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2 sm:space-x-3">
            {showBackButton && (
              <Button variant="ghost" onClick={onBack} className="text-white hover:bg-white/20 mobile-touch-target">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Back</span>
              </Button>
            )}
            <div>
              <h1 className="text-base sm:text-lg md:text-2xl font-bold">{title}</h1>
              {subtitle && (
                <p className="hidden sm:block text-white/90 mt-1 text-sm md:text-base">{subtitle}</p>
              )}
            </div>
          </div>
          {(actions || isAdmin) && (
            <div className="flex items-center space-x-2">
              {isAdmin && (
                <Button
                  variant={isAdminMode ? "default" : "ghost"}
                  size="sm"
                  onClick={toggleAdminMode}
                  className={`mobile-touch-target ${isAdminMode 
                    ? "bg-orange-600 hover:bg-orange-700 shadow-lg animate-pulse" 
                    : "text-white hover:bg-white/20 border border-white/30"
                  }`}
                >
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">{isAdminMode ? "🔧 Exit Admin" : "⚡ Admin"}</span>
                  <span className="sm:hidden">{isAdminMode ? "🔧" : "⚡"}</span>
                </Button>
              )}
              <div className="hidden sm:flex items-center space-x-2">
                {actions}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}