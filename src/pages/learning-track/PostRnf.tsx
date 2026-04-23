import { NavLink, useLocation } from "react-router-dom";
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
