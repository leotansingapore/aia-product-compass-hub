import { useMemo } from "react";
import { Navigate, NavLink, Outlet, useLocation, useMatch } from "react-router-dom";
import { BookOpen, Brain, FileText, TrendingUp, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { BrandedPageHeader } from "@/components/layout/BrandedPageHeader";
import { cn } from "@/lib/utils";

type LibraryTab = {
  slug: "products" | "question-banks" | "cheat-sheets" | "playbooks" | "tools";
  label: string;
  icon: LucideIcon;
  path: string;
};

export const LIBRARY_TABS: ReadonlyArray<LibraryTab> = [
  { slug: "products", label: "Products", icon: BookOpen, path: "/library/products" },
  { slug: "question-banks", label: "Question Banks", icon: Brain, path: "/library/question-banks" },
  { slug: "cheat-sheets", label: "Cheat Sheets", icon: FileText, path: "/library/cheat-sheets" },
  { slug: "playbooks", label: "Sales Playbooks", icon: TrendingUp, path: "/library/playbooks" },
  { slug: "tools", label: "Tools", icon: Wrench, path: "/library/tools" },
] as const;

// Legacy query-param URLs that the rest of the app may still link to.
// Map them to the new path-based URLs so we keep one canonical location per
// surface but don't break any saved bookmarks or stale nav entries.
const LEGACY_QUERY_TAB_TO_SLUG: Record<string, LibraryTab["slug"]> = {
  products: "products",
  banks: "question-banks",
  "question-banks": "question-banks",
  "cheat-sheets": "cheat-sheets",
  playbooks: "playbooks",
  tools: "tools",
};

export default function Library() {
  const location = useLocation();
  const indexMatch = useMatch("/library");

  // If somebody hits /library?tab=banks (the old URL shape), bounce them to
  // the canonical /library/<slug> URL so the address bar matches the tab.
  const legacyQueryRedirect = useMemo(() => {
    if (!indexMatch) return null;
    const params = new URLSearchParams(location.search);
    const queryTab = params.get("tab");
    if (!queryTab) return null;
    const slug = LEGACY_QUERY_TAB_TO_SLUG[queryTab];
    return slug ? `/library/${slug}` : null;
  }, [indexMatch, location.search]);

  if (legacyQueryRedirect) {
    return <Navigate to={legacyQueryRedirect} replace />;
  }

  // Bare /library lands on the Products tab so the page never renders empty.
  if (indexMatch) {
    return <Navigate to="/library/products" replace />;
  }

  return (
    <PageLayout
      title="Library | FINternship"
      description="Product categories, question banks, cheat sheets, and the sales playbooks hub — all in one place."
    >
      <BrandedPageHeader
        title="Library"
        titlePrefix="📚 "
        subtitle="Product categories, question banks, cheat sheets, sales playbooks, and the tools hub — all in one place."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Library" },
        ]}
      />

      <div className="mx-auto max-w-7xl px-2 sm:px-4 md:px-6 py-4 sm:py-8 pb-20 sm:pb-8">
        <LibraryTabBar />
        <div className="mt-4 sm:mt-6">
          <Outlet />
        </div>
      </div>
    </PageLayout>
  );
}

function LibraryTabBar() {
  // Underline-style horizontal tab bar that scrolls sideways when the
  // viewport is narrower than the row of tabs — avoids the uneven 3+2
  // wrap that a grid produced at ~640-1024px with 5 tabs.
  return (
    <nav
      aria-label="Library sections"
      className="-mx-2 sm:mx-0 border-b"
    >
      <div className="flex w-full flex-nowrap items-center gap-1 overflow-x-auto px-2 sm:gap-2 sm:px-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {LIBRARY_TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.slug}
              to={tab.path}
              className={({ isActive }) =>
                cn(
                  "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 border-transparent px-3 py-2.5 text-sm font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  isActive
                    ? "border-primary text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )
              }
            >
              <Icon className="h-4 w-4" aria-hidden />
              <span>{tab.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

