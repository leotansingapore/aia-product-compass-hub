import { memo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

/** Underline tabs on brand gradient / dark header — same pattern as Learning Track. */
export const SCRIPTS_HUB_TAB_NAV_CLASS =
  "flex w-full flex-nowrap justify-start gap-0 overflow-x-auto sm:gap-6 md:gap-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
export const SCRIPTS_HUB_TAB_LINK_CLASS =
  "shrink-0 rounded-none border-0 border-b-2 border-transparent bg-transparent px-3 py-2.5 text-sm font-medium text-white/75 shadow-none transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent min-h-[44px] sm:min-h-0 sm:px-2 sm:py-3";
export const SCRIPTS_HUB_TAB_ACTIVE_CLASS = "border-white text-white";

export const SCRIPTS_HUB_TABS = [
  { key: "scripts", label: "Sales Scripts", path: "/scripts" },
  { key: "servicing", label: "Servicing", path: "/servicing" },
  { key: "objections", label: "Objections", path: "/objections" },
  { key: "playbooks", label: "Playbooks", path: "/playbooks" },
  { key: "flows", label: "Flows", path: "/flows" },
  { key: "concept-cards", label: "Concept Cards", path: "/concept-cards" },
] as const;

function useScriptsHubCurrentKey() {
  const location = useLocation();
  return SCRIPTS_HUB_TABS.find((t) => location.pathname.startsWith(t.path))?.key ?? "scripts";
}

/** Tabs rendered inside `BrandedPageHeader` `headerTabs` (dark header, bottom underline). */
export const ScriptsHubHeaderTabs = memo(function ScriptsHubHeaderTabs() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentKey = useScriptsHubCurrentKey();

  const matchedTab = SCRIPTS_HUB_TABS.find((t) => location.pathname.startsWith(t.path));
  if (matchedTab) {
    try {
      localStorage.setItem("sales-playbooks-last-route", matchedTab.path);
    } catch {
      /* ignore */
    }
  }

  return (
    <nav className={SCRIPTS_HUB_TAB_NAV_CLASS} aria-label="Sales playbooks sections">
      {SCRIPTS_HUB_TABS.map((tab) => {
        const isActive = currentKey === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => navigate(tab.path)}
            className={cn(SCRIPTS_HUB_TAB_LINK_CLASS, isActive && SCRIPTS_HUB_TAB_ACTIVE_CLASS)}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
});

/**
 * Legacy compact bar (light surface) — only if a page still needs in-content tabs.
 * Prefer `ScriptsHubHeaderTabs` in `BrandedPageHeader.headerTabs`.
 */
export const ScriptsTabBar = memo(function ScriptsTabBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentKey = useScriptsHubCurrentKey();

  const matchedTab = SCRIPTS_HUB_TABS.find((t) => location.pathname.startsWith(t.path));
  if (matchedTab) {
    try {
      localStorage.setItem("sales-playbooks-last-route", matchedTab.path);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="lg:mb-5 lg:mx-0">
      <div className="sticky top-0 z-40 flex overflow-x-auto scrollbar-hide border-b border-border bg-background/95 backdrop-blur-sm shadow-sm lg:static lg:z-30 lg:flex-wrap lg:gap-1 lg:overflow-visible lg:border lg:border-border lg:shadow-none">
        {SCRIPTS_HUB_TABS.map((tab) => {
          const isActive = currentKey === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => navigate(tab.path)}
              className={cn(
                "flex shrink-0 flex-1 flex-col items-center justify-center gap-0.5 px-3 py-2.5 text-[10px] font-medium transition-all lg:flex-none lg:flex-row lg:justify-start lg:gap-1.5 lg:px-3 lg:py-1.5 lg:text-sm",
                "border-b-2 lg:rounded-md lg:border-0",
                isActive
                  ? "border-primary text-primary lg:border-transparent lg:bg-primary lg:text-primary-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground lg:hover:bg-accent"
              )}
            >
              <span className="whitespace-nowrap leading-none">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
});
