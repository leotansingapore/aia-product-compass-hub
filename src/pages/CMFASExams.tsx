import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { EyeOff, MoreVertical, Plus } from "lucide-react";
import { toast } from "sonner";

import { PageLayout, StructuredData } from "@/components/layout/PageLayout";
import { ProtectedPage } from "@/components/ProtectedPage";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { CMFASWorkspaceBackdrop } from "@/components/cmfas/CMFASWorkspaceBackdrop";
import {
  CMFASWorkspaceFloatingNav,
  CMFASWorkspaceMobileMenu,
  buildNavSpec,
  type WorkspaceMode,
} from "@/components/cmfas/CMFASWorkspaceNav";
import { CMFASHubChatFAB } from "@/components/cmfas/CMFASHubChatFAB";
import { StudyDeskView } from "@/components/cmfas/workspace-views/StudyDeskView";
import { READY_STEP_IDS } from "@/components/cmfas/workspace-views/getReadyData";
import { PapersView } from "@/components/cmfas/workspace-views/PapersView";
import { PracticeView } from "@/components/cmfas/workspace-views/PracticeView";
import { RewardsView } from "@/components/cmfas/workspace-views/RewardsView";
import { SyllabusView } from "@/components/cmfas/workspace-views/SyllabusView";
import { cmfasRoom } from "@/components/cmfas/cmfasTheme";
import { CreateModuleForm } from "@/components/admin/CreateModuleForm";

import { useChecklistProgress } from "@/hooks/useChecklistProgress";
import { useCategories, invalidateCategoriesCache } from "@/hooks/useProducts";
import { usePermissions } from "@/hooks/usePermissions";
import { useViewMode } from "@/components/admin/AdminViewSwitcher";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const WORKSPACE_MODES: WorkspaceMode[] = ["today", "papers", "practice", "rewards", "syllabus"];

function isWorkspaceMode(value: string | null): value is WorkspaceMode {
  return value != null && (WORKSPACE_MODES as string[]).includes(value);
}

export default function CMFASExams() {
  const navigate = useNavigate();
  const { isAdmin } = usePermissions();
  const { isViewingAsUser } = useViewMode();
  const isAdminUser = isAdmin() && !isViewingAsUser;

  const [searchParams, setSearchParams] = useSearchParams();
  const urlMode = searchParams.get("mode");

  // Resolve CMFAS category (for admin publish/edit) ---------------------------
  const { categories, loading: categoriesLoading, refetch: refetchCategories } = useCategories();
  const cmfasCategory = useMemo(
    () => categories.find((c) => c.name.toLowerCase() === "cmfas"),
    [categories],
  );
  const categoryId = cmfasCategory?.id;

  // Ready-checklist progress --------------------------------------------------
  const { isItemCompleted } = useChecklistProgress();
  const readyProgress = useMemo(() => {
    const done = READY_STEP_IDS.filter((id) => isItemCompleted(id)).length;
    return { done, total: READY_STEP_IDS.length };
  }, [isItemCompleted]);
  const readyComplete = readyProgress.done >= readyProgress.total;

  /** Home with no `?mode=` is always the study desk (merged outline + get-ready). */
  const defaultWorkspaceMode: WorkspaceMode = "today";
  const activeMode: WorkspaceMode = isWorkspaceMode(urlMode) ? urlMode : defaultWorkspaceMode;

  // Legacy `?mode=ready` (removed as a product surface) — strip so bookmarks stay on the desk.
  useEffect(() => {
    if (searchParams.get("mode") === "ready") {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete("mode");
          return next;
        },
        { replace: true },
      );
    }
  }, [searchParams, setSearchParams]);

  const setMode = useCallback(
    (mode: WorkspaceMode) => {
      setSearchParams(
        mode === defaultWorkspaceMode ? {} : { mode: mode as string },
        { replace: true },
      );
    },
    [setSearchParams, defaultWorkspaceMode],
  );

  // Admin: publish-toggle on the CMFAS category ------------------------------
  const [createModuleOpen, setCreateModuleOpen] = useState(false);

  const handleTogglePublished = async () => {
    if (!categoryId || !cmfasCategory) return;
    const next = !cmfasCategory.published;
    const { error } = await supabase
      .from("categories")
      .update({ published: next })
      .eq("id", categoryId);
    if (error) {
      toast.error("Failed to update publish status");
      return;
    }
    toast.success(next ? "Category published" : "Category unpublished");
    invalidateCategoriesCache();
    refetchCategories();
  };

  // Nav spec + locked-click handler ------------------------------------------
  const navGroups = useMemo(
    () => buildNavSpec({ readyProgress, readyComplete }),
    [readyProgress, readyComplete],
  );
  const handleLockedClick = useCallback(() => {
    toast.info(
      `Finish Get Ready first — ${readyProgress.done} of ${readyProgress.total} done.`,
      { duration: 3000 },
    );
  }, [readyProgress.done, readyProgress.total]);

  // If the URL tries to land on a locked mode, bounce to the study desk.
  useEffect(() => {
    if (!readyComplete && (activeMode === "papers" || activeMode === "practice")) {
      setMode("today");
    }
  }, [readyComplete, activeMode, setMode]);

  // Loading / missing category ----------------------------------------------
  const structuredData: StructuredData = {
    "@context": "https://schema.org" as const,
    "@type": "Course",
    name: "CMFAS Exam Preparation",
    description:
      "Comprehensive CMFAS exam preparation materials including modules M9, M9A, HI, RES5, practice tests, and study materials.",
    url: `${window.location.origin}${window.location.pathname}`,
    courseMode: "online",
    educationalLevel: "professional",
  };

  if (categoriesLoading) {
    return (
      <PageLayout
        title="CMFAS Exam Preparation | FINternship"
        description="Prepare for your CMFAS exams with structured modules, videos, and AI tutoring."
        className={cn("min-h-screen min-h-dvh", cmfasRoom.canvas, cmfasRoom.text)}
      >
        <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 py-6">
          <SkeletonLoader type="category" />
        </div>
      </PageLayout>
    );
  }

  if (!cmfasCategory) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">CMFAS category not found</h1>
          <p className="text-muted-foreground mb-4">
            Expected a category named "CMFAS" in the database but none was found.
          </p>
          <button onClick={() => navigate("/")} className="text-primary hover:underline">
            Go back to home
          </button>
        </div>
      </div>
    );
  }

  // Active view — Study desk = linear slide path (get ready).
  const renderActiveView = () => {
    if (activeMode === "today") {
      return <StudyDeskView onSelectWorkspaceMode={setMode} />;
    }
    if (activeMode === "papers") return <PapersView />;
    if (activeMode === "practice") return <PracticeView />;
    if (activeMode === "rewards") return <RewardsView />;
    if (activeMode === "syllabus") return <SyllabusView />;
    return <StudyDeskView onSelectWorkspaceMode={setMode} />;
  };

  return (
    <ProtectedPage pageId="cmfas-exams">
      <PageLayout
        title="CMFAS Exam Preparation - FINternship"
        description="Prepare for CMFAS M9, M9A, HI, RES5 with modules, question bank, AI tutor, and focus tooling."
        keywords="CMFAS exam, capital markets, financial advisory, certification, exam preparation"
        structuredData={structuredData}
        className={cn(
          "flex min-h-dvh flex-col",
          "lg:h-[calc(100dvh-3.5rem)] lg:max-h-[calc(100dvh-3.5rem)] lg:min-h-0 lg:overflow-hidden",
          cmfasRoom.canvas,
          cmfasRoom.text,
        )}
      >
        <div
          className={cn(
            "relative flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden",
            cmfasRoom.canvas,
            cmfasRoom.text,
          )}
        >
          <CMFASWorkspaceBackdrop />

          {/* Admin draft banner — pinned above the workspace */}
          {isAdminUser && cmfasCategory.published === false && (
            <div
              className={cn(
                "relative z-20 flex items-center justify-between gap-3 border-b px-4 py-2",
                cmfasRoom.brassBorderSoft,
                "bg-[#0a1424]/80 backdrop-blur-sm",
              )}
            >
              <div className={cn("flex items-center gap-2 text-xs", cmfasRoom.textMuted)}>
                <EyeOff className="h-3.5 w-3.5" />
                <span>Draft — only visible to admins</span>
              </div>
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="cmfas-publish-toggle"
                  className={cn("hidden text-xs sm:inline", cmfasRoom.textMuted)}
                >
                  Published
                </Label>
                <Switch
                  id="cmfas-publish-toggle"
                  checked={cmfasCategory.published ?? false}
                  onCheckedChange={handleTogglePublished}
                />
              </div>
            </div>
          )}

          <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden">
            <CMFASWorkspaceFloatingNav
              groups={navGroups}
              activeMode={activeMode}
              onModeChange={setMode}
              onLockedClick={handleLockedClick}
            />
            <CMFASWorkspaceMobileMenu
              groups={navGroups}
              activeMode={activeMode}
              onModeChange={setMode}
              onLockedClick={handleLockedClick}
            />
            <main
              className={cn(
                "relative min-h-0 min-w-0 flex-1",
                activeMode === "today"
                  ? "overflow-y-auto lg:flex lg:min-h-0 lg:flex-col lg:overflow-hidden"
                  : "overflow-y-auto",
              )}
            >
              <div
                className={cn(
                  "relative mx-auto w-full max-w-[min(100%,80rem)]",
                  "px-4 pt-20 pb-5 sm:px-6 md:px-10 lg:py-8",
                  activeMode === "today"
                    ? "flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden pb-6"
                    : "pb-10",
                )}
              >
                {/* Admin quick actions */}
                {isAdminUser && categoryId && (
                  <div className="absolute right-4 top-4 z-10 sm:right-6 md:right-8">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn("h-8 gap-1.5", cmfasRoom.brassBorder, cmfasRoom.text)}
                        >
                          <MoreVertical className="h-3.5 w-3.5" />
                          Admin
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-background z-50">
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => setCreateModuleOpen(true)}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          New module
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={handleTogglePublished}
                        >
                          {cmfasCategory.published
                            ? "Unpublish category"
                            : "Publish category"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}

                {renderActiveView()}
              </div>
            </main>
          </div>
        </div>

        {isAdminUser && categoryId && (
          <Sheet open={createModuleOpen} onOpenChange={setCreateModuleOpen}>
            <SheetContent
              side="right"
              className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-md"
            >
              <SheetHeader className="text-left">
                <SheetTitle>Create new module</SheetTitle>
                <SheetDescription>
                  Add a CMFAS module. You can add videos, quizzes, and content on the next screen.
                </SheetDescription>
              </SheetHeader>
              <CreateModuleForm
                categoryId={categoryId}
                variant="embedded"
                onModuleCreated={refetchCategories}
                onEmbeddedClose={() => setCreateModuleOpen(false)}
                getModuleUrl={(slug) => `/cmfas/module/${slug.replace(/-module$/, "")}`}
              />
            </SheetContent>
          </Sheet>
        )}

        <CMFASHubChatFAB />
      </PageLayout>
    </ProtectedPage>
  );
}
