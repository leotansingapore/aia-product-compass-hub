import { useState } from "react";
import { Menu, X, LogOut, Home, Bookmark, GraduationCap, MessageCircle, User, HelpCircle, Users, TrendingUp, FileText, BookOpen, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { NavLink, useNavigate } from "react-router-dom";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useCategories } from "@/hooks/useProducts";
import { getCategoryConfig } from "@/utils/categoryConfig";
import { cn } from "@/lib/utils";

export function MobileDrawer() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { signOut } = useSimplifiedAuth();
  const { isAdmin } = useAdmin();
  const { categories, loading: categoriesLoading } = useCategories();

  const mainNavItems = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Bookmarks", href: "/bookmarks", icon: Bookmark },
    { name: "CMFAS Exams", href: "/cmfas-exams", icon: GraduationCap },
    { name: "Roleplay Training", href: "/roleplay", icon: MessageCircle },
    { name: "My Account", href: "/my-account", icon: User },
  ];

  const resourceItems = [
    { name: "How to Use Portal", href: "/how-to-use", icon: HelpCircle },
    { name: "Search by Client Profile", href: "/search-by-profile", icon: Users },
    { name: "Sales Tools & Objection Handling", href: "/product/sales-tools-objections", icon: TrendingUp },
    { name: "Scripts Database", href: "/scripts", icon: FileText },
    { name: "Script Playbooks", href: "/playbooks", icon: BookOpen },
    { name: "Script Flows", href: "/flows", icon: GitBranch },
  ];

  const handleLinkClick = () => {
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle className="text-left">FINternship Learning Platform</SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col h-full">
          <div className="flex-1 px-6 pb-6 overflow-y-auto">
            {/* Main Navigation */}
            <div className="mb-6">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                Main
              </h3>
              <div className="space-y-1">
                {mainNavItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={(e) => {
                      if (item.href === "/") {
                        e.preventDefault();
                        navigate("/", { replace: true });
                      }
                      handleLinkClick();
                    }}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                        "hover:bg-muted",
                        isActive
                          ? "bg-muted text-primary font-medium"
                          : "text-muted-foreground"
                      )
                    }
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span>{item.name}</span>
                  </NavLink>
                ))}
              </div>
            </div>

            <Separator className="mb-6" />

            {/* Product Categories */}
            <div className="mb-6">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                Product Categories
              </h3>
              <div className="space-y-1">
                {!categoriesLoading && categories && categories.map((category) => {
                  const config = getCategoryConfig(category.name);
                  return (
                    <NavLink
                      key={category.id}
                      to={`/category/${category.id}`}
                      onClick={handleLinkClick}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                          "hover:bg-muted",
                          isActive
                            ? "bg-muted text-primary font-medium"
                            : "text-muted-foreground"
                        )
                      }
                    >
                      <span className="text-lg shrink-0">{config.icon}</span>
                      <span className="break-words leading-snug">{category.name}</span>
                      <span className="ml-auto shrink-0 text-micro bg-muted text-muted-foreground px-2 py-1 rounded-full">
                        {config.productCount}
                      </span>
                    </NavLink>
                  );
                })}
                {categoriesLoading && (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    Loading categories...
                  </div>
                )}
              </div>
            </div>

            <Separator className="mb-6" />

            {/* Resources */}
            <div className="mb-6">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                Resources
              </h3>
              <div className="space-y-1">
                {resourceItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                        "hover:bg-muted",
                        isActive
                          ? "bg-muted text-primary font-medium"
                          : "text-muted-foreground"
                      )
                    }
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span>{item.name}</span>
                  </NavLink>
                ))}
              </div>
            </div>

            {isAdmin && (
              <>
                <Separator className="mb-6" />
                <div>
                  <NavLink
                    to="/admin"
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                        "hover:bg-muted",
                        isActive
                          ? "bg-muted text-primary font-medium"
                          : "text-muted-foreground"
                      )
                    }
                  >
                    Admin Panel
                  </NavLink>
                </div>
              </>
            )}
          </div>

          {/* Sign Out Button */}
          <div className="p-6 pt-0 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="w-full justify-start gap-2 text-destructive hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}