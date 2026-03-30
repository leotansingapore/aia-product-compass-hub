import { useNavigate } from "react-router-dom";
import { Library, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

const shortcuts = [
  { title: "Products", icon: Library, href: "/consultant-landing", bg: "bg-blue-100 dark:bg-blue-950/40", color: "text-blue-600 dark:text-blue-400" },
  { title: "CMFAS", icon: GraduationCap, href: "/cmfas-exams", bg: "bg-emerald-100 dark:bg-emerald-950/40", color: "text-emerald-600 dark:text-emerald-400" },
];

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">Quick Access</h3>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-3">
        {shortcuts.map((item) => (
          <button
            key={item.title}
            onClick={() => navigate(item.href)}
            className="flex flex-col items-center gap-1.5 group"
          >
            <div className={cn("h-12 w-12 sm:h-14 sm:w-14 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-sm", item.bg)}>
              <item.icon className={cn("h-5 w-5 sm:h-6 sm:w-6", item.color)} />
            </div>
            <span className="text-[11px] sm:text-xs font-medium text-foreground text-center leading-tight">{item.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
