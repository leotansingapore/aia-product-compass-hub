import { useNavigate, useLocation } from "react-router-dom";

const tabs = [
  { key: "sales-tools",   label: "Sales Tools",      emoji: "📊", path: "/product/sales-tools-objections" },
  { key: "scripts",       label: "Sales Scripts",    emoji: "📝", path: "/scripts" },
  { key: "servicing",     label: "Servicing",        emoji: "🛎️", path: "/servicing" },
  { key: "objections",    label: "Objections",       emoji: "🛡️", path: "/objections" },
  { key: "playbooks",     label: "Playbooks",        emoji: "📚", path: "/playbooks" },
  { key: "flows",         label: "Flows",            emoji: "🔀", path: "/flows" },
  { key: "concept-cards", label: "Concept Cards",   emoji: "🃏", path: "/concept-cards" },
];

export function ScriptsTabBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const currentKey = tabs.find(t => location.pathname.startsWith(t.path))?.key ?? "scripts";

  return (
    <div className="lg:mb-5 lg:mx-0">
      <div className="flex overflow-x-auto scrollbar-hide border-b border-border bg-background/95 backdrop-blur-sm shadow-sm lg:shadow-none lg:border-0 lg:overflow-visible lg:flex-wrap lg:gap-1 lg:p-1 lg:bg-background/95 lg:rounded-lg lg:w-fit sticky top-0 z-40 lg:static lg:z-30 lg:border lg:border-border">
        {tabs.map(tab => {
          const isActive = currentKey === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => navigate(tab.path)}
              className={[
                "flex-1 lg:flex-none shrink-0 flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-0.5 lg:gap-1.5",
                "px-3 lg:px-3 py-2.5 lg:py-1.5 text-[10px] lg:text-sm font-medium transition-all",
                "border-b-2 lg:border-0 lg:rounded-md",
                isActive
                  ? "border-primary text-primary lg:bg-primary lg:text-primary-foreground lg:border-transparent"
                  : "border-transparent text-muted-foreground hover:text-foreground lg:hover:bg-accent",
              ].join(" ")}
            >
              <span className="text-base lg:text-sm leading-none">{tab.emoji}</span>
              <span className="leading-none mt-0.5 lg:mt-0 whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
