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
    <div className="bg-gradient-hero text-white py-8 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="mb-4">
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <BreadcrumbItem>
                      {item.href ? (
                        <BreadcrumbLink asChild>
                          <Link to={item.href} className="text-white/70 hover:text-white">
                            {item.label}
                          </Link>
                        </BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage className="text-white">{item.label}</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                    {index < breadcrumbs.length - 1 && <BreadcrumbSeparator className="text-white/50" />}
                  </div>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        )}

        {/* Header Content */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <Button variant="ghost" onClick={onBack} className="text-white hover:bg-white/20">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            <div>
              <h1 className="text-3xl font-bold">{title}</h1>
              {subtitle && (
                <p className="text-white/90 mt-2 text-lg">{subtitle}</p>
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
                  className={isAdminMode ? "bg-orange-600 hover:bg-orange-700" : "text-white hover:bg-white/20"}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  {isAdminMode ? "Exit Admin" : "Admin Mode"}
                </Button>
              )}
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}