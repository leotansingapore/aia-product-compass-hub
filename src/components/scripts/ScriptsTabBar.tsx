import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

const tabs = [
  { key: "scripts", label: "📝 Scripts", path: "/scripts" },
  { key: "objections", label: "🛡️ Objections", path: "/objections" },
  { key: "playbooks", label: "📚 Playbooks", path: "/playbooks" },
  { key: "flows", label: "🔀 Flows", path: "/flows" },
];

export function ScriptsTabBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const currentKey = tabs.find(t => location.pathname.startsWith(t.path))?.key ?? "scripts";

  return (
    <div className="flex gap-1 mb-5 p-1 bg-background/95 backdrop-blur-sm rounded-lg w-fit sticky top-0 z-30 sm:static sm:z-auto border sm:border-0 overflow-x-auto">
      {tabs.map(tab => (
        <Button
          key={tab.key}
          variant={currentKey === tab.key ? "default" : "ghost"}
          size="sm"
          className="gap-1.5 text-sm shrink-0"
          onClick={() => navigate(tab.path)}
        >
          {tab.label}
        </Button>
      ))}
    </div>
  );
}
