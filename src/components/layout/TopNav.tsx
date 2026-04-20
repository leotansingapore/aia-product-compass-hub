import { memo, useMemo } from "react";
import { NavLink } from "react-router-dom";
import {
  BookOpen,
  GraduationCap,
  Brain,
  MessageCircle,
  Bookmark,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { useAdmin } from "@/hooks/useAdmin";
import { FEATURES } from "@/lib/tiers";

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
  features?: readonly string[];
  adminOnly?: boolean;
}

const ALL_NAV_ITEMS: NavItem[] = [
  {
    title: "My Learning",
    url: "/learning-track",
    icon: GraduationCap,
    features: [FEATURES.EXPLORER_TRACK, FEATURES.PRE_RNF_TRACK, FEATURES.POST_RNF_TRACK],
  },
  { title: "Practice", url: "/question-banks", icon: Brain, features: [FEATURES.QUESTION_BANKS] },
  { title: "Roleplay", url: "/roleplay", icon: MessageCircle, features: [FEATURES.ROLEPLAY] },
  { title: "Exams", url: "/cmfas-exams", icon: GraduationCap, features: [FEATURES.CMFAS] },
  { title: "Library", url: "/categories", icon: BookOpen, features: [FEATURES.PRODUCTS] },
  { title: "Bookmarks", url: "/bookmarks", icon: Bookmark, features: [FEATURES.BOOKMARKS] },
  { title: "Admin", url: "/admin", icon: Shield, adminOnly: true },
];

const LINK_BASE =
  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground";
const LINK_ACTIVE = "bg-primary/10 text-primary font-semibold";

export const TopNav = memo(function TopNav({
  onProfileClick,
}: {
  onProfileClick?: () => void;
}) {
  const { user } = useSimplifiedAuth();
  const { canAny, isAdminBypass } = useFeatureAccess();
  const { isAdmin: isAdminUser } = useAdmin();

  const visibleItems = useMemo(() => {
    return ALL_NAV_ITEMS.filter((item) => {
      if (item.adminOnly) return isAdminUser;
      if (!item.features) return true;
      if (isAdminBypass) return true;
      return canAny(item.features as any);
    });
  }, [isAdminUser, isAdminBypass, canAny]);

  return (
    <nav className="sticky top-0 z-40 hidden md:flex h-14 items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 gap-1">
      {/* Logo */}
      <NavLink
        to="/"
        className="flex items-center gap-2 shrink-0 mr-4 hover:opacity-80 transition-opacity"
      >
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <BookOpen className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-semibold text-sm">FINternship</span>
      </NavLink>

      {/* Nav links */}
      <div className="flex items-center gap-0.5">
        {visibleItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            end={item.url === "/"}
            className={({ isActive }) =>
              cn(LINK_BASE, isActive && LINK_ACTIVE)
            }
          >
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
          </NavLink>
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right side */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <button
          type="button"
          onClick={() => onProfileClick?.()}
          className="rounded-full ring-offset-background transition-all hover:ring-2 hover:ring-primary hover:ring-offset-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="Open profile"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </button>
      </div>
    </nav>
  );
});
