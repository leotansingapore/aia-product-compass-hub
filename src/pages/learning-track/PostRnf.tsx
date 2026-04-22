import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import First30Days from "./First30Days";
import First60DaysAssignments from "./First60DaysAssignments";

type PostRnfView = "first30" | "assignments";

export default function PostRnfTrack() {
  const { pathname } = useLocation();
  const view: PostRnfView = pathname.includes("/assignments") ? "assignments" : "first30";

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
            to="/learning-track/post-rnf/first-30-days"
            aria-selected={view === "first30"}
            className={tabClass(view === "first30")}
          >
            First 30 Days
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

      {view === "first30" ? <First30Days /> : <First60DaysAssignments />}
    </div>
  );
}
