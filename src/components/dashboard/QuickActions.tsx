import { useNavigate } from "react-router-dom";
import { BookOpen, Users, MessageSquare, FileText, HelpCircle, GraduationCap } from "lucide-react";

export function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      title: "CMFAS Training",
      description: "Study for your certification exams",
      icon: GraduationCap,
      href: "/cmfas-exams",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      lightBg: "bg-emerald-50 dark:bg-emerald-950/30",
    },
    {
      title: "Search by Client",
      description: "Find products that match a client's profile",
      icon: Users,
      href: "/search-by-profile",
      iconColor: "text-violet-600 dark:text-violet-400",
      lightBg: "bg-violet-50 dark:bg-violet-950/30",
    },
    {
      title: "Roleplay Practice",
      description: "Rehearse sales conversations with AI",
      icon: MessageSquare,
      href: "/roleplay",
      iconColor: "text-orange-600 dark:text-orange-400",
      lightBg: "bg-orange-50 dark:bg-orange-950/30",
    },
    {
      title: "My Bookmarks",
      description: "Revisit your saved products and resources",
      icon: FileText,
      href: "/bookmarks",
      iconColor: "text-rose-600 dark:text-rose-400",
      lightBg: "bg-rose-50 dark:bg-rose-950/30",
    },
    {
      title: "Scripts & Objections",
      description: "Access curated sales scripts and rebuttals",
      icon: BookOpen,
      href: "/scripts",
      iconColor: "text-blue-600 dark:text-blue-400",
      lightBg: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      title: "How to Use",
      description: "Learn how to navigate this portal",
      icon: HelpCircle,
      href: "/how-to-use",
      iconColor: "text-teal-600 dark:text-teal-400",
      lightBg: "bg-teal-50 dark:bg-teal-950/30",
    },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-foreground">Quick Actions</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {actions.map((action) => (
          <button
            key={action.title}
            onClick={() => navigate(action.href)}
            className="group flex flex-col items-center text-center gap-2.5 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all duration-200 p-4"
          >
            <div className={`h-10 w-10 rounded-xl ${action.lightBg} flex items-center justify-center group-hover:scale-105 transition-transform duration-200`}>
              <action.icon className={`h-5 w-5 ${action.iconColor}`} />
            </div>
            <div>
              <div className="font-semibold text-xs text-foreground leading-tight">{action.title}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug hidden sm:block">{action.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
