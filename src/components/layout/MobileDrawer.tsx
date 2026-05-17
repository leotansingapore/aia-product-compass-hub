import { useState } from "react";
import { Menu, X, LogOut, Bookmark, GraduationCap, MessageCircle, HelpCircle, Users, TrendingUp, Archive, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { NavLink, useNavigate } from "react-router-dom";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useViewMode } from "@/components/admin/AdminViewSwitcher";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { FEATURES } from "@/lib/tiers";
import { useCategories } from "@/hooks/useProducts";
import { getCategoryConfig } from "@/utils/categoryConfig";
import { cn } from "@/lib/utils";

export function MobileDrawer() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { signOut } = useSimplifiedAuth();
  const { isAdmin } = useAdmin();
  const { isViewingAsUser } = useViewMode();
  const { can } = useFeatureAccess();
  const { categories, loading: categoriesLoading } = useCategories();

  const mainNavItems = [
    { name: "Bookmarks", href: "/bookmarks", icon: Bookmark, feature: FEATURES.BOOKMARKS },
    { name: "CMFAS Exams", href: "/cmfas-exams", icon: GraduationCap, feature: FEATURES.CMFAS },
    { name: "Roleplay Training", href: "/roleplay", icon: MessageCircle, feature: FEATURES.ROLEPLAY },
  ].filter((item) => can(item.feature));

  // Sales Playbooks lands on the hub at /sales-playbooks (available to both
  // pre-RNF papers_taker and post-RNF tiers — drilling scripts/objections is
  // part of pre-RNF prep, not gated behind licensure).
  // Admins bypass via useFeatureAccess.can() so they always see these entries.
  const canSalesPlaybooks =
    can(FEATURES.SALES_PLAYBOOKS) || can(FEATURES.PLAYBOOKS) || can(FEATURES.SCRIPTS);
  const resourceItems = [
    canSalesPlaybooks && { name: "Sales Playbooks", href: "/sales-playbooks", icon: TrendingUp },
    can(FEATURES.CONCEPT_CARDS) && { name: "Concept Cards", href: "/concept-cards", icon: Pencil, indent: true },
    can(FEATURES.CASE_VAULT) && { name: "Case Vault", href: "/case-vault", icon: Archive, indent: true },
  ].filter(Boolean) as { name: string; href: string; icon: any; indent?: boolean }[];

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
          <SheetTitle className="text-left">
            <NavLink to="/" onClick={handleLinkClick} className="hover:opacity-80 transition-opacity">
              FINternship Learning Platform
            </NavLink>
          </SheetTitle>
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

            <Separator className="mb-6" />

            {/* Product Categories — single link */}
            <div className="mb-6">
              <div className="space-y-1">
                <NavLink
                  to="/categories"
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
                  <Archive className="h-4 w-4 shrink-0" />
                  <span>Product Categories</span>
                </NavLink>
              </div>
            </div>

            <Separator className="mb-6" />

            {/* Resources */}
            {resourceItems.length > 0 && (
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
                          item.indent && "ml-4",
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
            )}

            {isAdmin && !isViewingAsUser && (
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