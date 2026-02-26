import { useNavigate, useLocation } from "react-router-dom";

const tabs = [
  { key: "scripts",    label: "Sales Scripts", emoji: "📝", path: "/scripts" },
  { key: "servicing",  label: "Servicing",  emoji: "🛎️", path: "/servicing" },
  { key: "objections", label: "Objections", emoji: "🛡️", path: "/objections" },
  { key: "playbooks",  label: "Playbooks",  emoji: "📚", path: "/playbooks" },
  { key: "flows",      label: "Flows",      emoji: "🔀", path: "/flows" },
];

export function ScriptsTabBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const currentKey = tabs.find(t => location.pathname.startsWith(t.path))?.key ?? "scripts";

  return (
    <div className="sm:mb-5 sm:mx-0">
      <div className="flex overflow-x-auto scrollbar-hide border-b border-border bg-background/95 backdrop-blur-sm shadow-sm sm:shadow-none sm:border-0 sm:overflow-visible sm:flex-wrap sm:gap-1 sm:p-1 sm:bg-background/95 sm:rounded-lg sm:w-fit sticky top-0 z-40 sm:static sm:z-30 sm:border sm:border-border">
        {tabs.map(tab => {
          const isActive = currentKey === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => navigate(tab.path)}
              className={[
                "flex-1 sm:flex-none shrink-0 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-0.5 sm:gap-1.5",
                "px-3 sm:px-3 py-2.5 sm:py-1.5 text-[10px] sm:text-sm font-medium transition-all",
                "border-b-2 sm:border-0 sm:rounded-md",
                isActive
                  ? "border-primary text-primary sm:bg-primary sm:text-primary-foreground sm:border-transparent"
                  : "border-transparent text-muted-foreground hover:text-foreground sm:hover:bg-accent",
              ].join(" ")}
            >
              <span className="text-base sm:text-sm leading-none">{tab.emoji}</span>
              <span className="leading-none mt-0.5 sm:mt-0 whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
