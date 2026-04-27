import { Link, NavLink, useLocation } from "react-router-dom";
import { ChevronRight, ClipboardList, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import Next60Days from "./Next60Days";
import Next60DaysAssignments from "./Next60DaysAssignments";

type PostRnfView = "next60" | "assignments";

export default function PostRnfTrack() {
  const { pathname } = useLocation();
  const view: PostRnfView = pathname.includes("/assignments") ? "assignments" : "next60";

  const tabClass = (isActive: boolean) =>
    cn(
      "rounded-full px-4 py-1.5 transition-colors",
      isActive ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
    );

  return (
    <div className="space-y-4" data-testid="post-rnf-page">
      <div className="max-w-3xl mx-auto space-y-2.5">
        <Link
          to="/learning-track/post-rnf/assignments"
          className="group relative flex items-center gap-4 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 sm:p-5 transition-all hover:border-primary/40 hover:shadow-md"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <ClipboardList className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">Required</p>
            <h3 className="text-base font-bold font-serif leading-snug">Assignments</h3>
            <p className="text-xs text-muted-foreground line-clamp-1">Weekly deliverables that turn the lessons into real reps with real prospects.</p>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
        </Link>

        <Link
          to="/learning-track/product-mastery"
          className="group relative flex items-center gap-4 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 sm:p-5 transition-all hover:border-primary/40 hover:shadow-md"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">Required</p>
            <h3 className="text-base font-bold font-serif leading-snug">Product Mastery Track</h3>
            <p className="text-xs text-muted-foreground line-clamp-1">7 weeks, one core product per week. Five days per product, 10-question quiz per day.</p>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
        </Link>
      </div>

      <div className="max-w-3xl mx-auto">
        <div
          role="tablist"
          aria-label="Post-RNF training sections"
          className="inline-flex rounded-full border bg-muted/50 p-1 text-xs font-semibold"
        >
          <NavLink
            role="tab"
            to="/learning-track/post-rnf/next-60-days"
            aria-selected={view === "next60"}
            className={tabClass(view === "next60")}
          >
            Next 60 Days
          </NavLink>
          <NavLink
            role="tab"
            to="/learning-track/post-rnf/assignments"
            aria-selected={view === "assignments"}
            className={tabClass(view === "assignments")}
          >
            Assignments
          </NavLink>
        </div>
      </div>

      {view === "next60" ? <Next60Days /> : <Next60DaysAssignments />}
    </div>
  );
}
