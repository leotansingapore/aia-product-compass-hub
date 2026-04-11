# Learning Track Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Homogenize the pre-RNF and post-RNF learning tracks under one phase-based layout, persist all progress and submissions to Supabase, ship an admin monitoring dashboard, surface the learning track prominently for new recruits, auto-suggest related resources, and ingest selected Obsidian vault content.

**Architecture:** React Router v6 nested routes under `/learning-track`. Six legacy components collapse to four shared components (`PhaseSection`, `LearningItemRow`, `ItemContentBlocks`, `SubmissionPanel`) plus one new (`RelatedResources`). All state moves from localStorage to Supabase via TanStack Query hooks. Admin views consume two SECURITY DEFINER RPCs. A Python script syncs the Obsidian vault into a new `obsidian_resources` table for in-app reference. Spec: `docs/superpowers/specs/2026-04-11-learning-track-overhaul-design.md`.

**Tech Stack:** React 18 + TypeScript, Vite, Tailwind, shadcn/ui, React Router v6, TanStack Query, Supabase JS client, React Hook Form, Zod, DnD Kit. Python 3 + supabase-py for the Obsidian sync.

**Project rules to follow:**
- ONE change = ONE commit = ONE push (per CLAUDE.md). Each task ends in a commit + push.
- Never modify `src/components/ui/*` or `src/integrations/supabase/types.ts` (Lovable-managed).
- Run `npm run build` before commit on any task that touches TypeScript.
- For tasks that change UI, verify with Playwright at `http://localhost:8080` using a demo account from `src/config/authConfig.ts`.

---

## Phase 0 — Prerequisites

✅ **DONE.** The Lovable migration shipped (`supabase/migrations/20260411140049_*.sql`) and the RLS patch was applied on 2026-04-11. Recruits can now edit submissions while `review_status IN ('pending','changes_requested')` and rows lock once `'approved'`. All phases below are unblocked.

### Task 0.1: Verify migration is in place

**Files:**
- Read: `supabase/migrations/20260411140049_d59d3696-61cc-40e4-81a3-8fbda0afbbd0.sql`
- Read: `src/integrations/supabase/types.ts`

- [ ] **Step 1: Confirm migration file exists and contains all 7 tables**

```bash
grep -c "CREATE TABLE IF NOT EXISTS public.learning_track" supabase/migrations/20260411140049_*.sql
# Expected: 6 (the 7th is obsidian_resources without the learning_track_ prefix)
grep -c "CREATE TABLE IF NOT EXISTS public.obsidian_resources" supabase/migrations/20260411140049_*.sql
# Expected: 1
```

- [ ] **Step 2: Confirm Lovable regenerated `types.ts` with the new tables**

```bash
grep -E "learning_track_phases|learning_track_items|obsidian_resources" src/integrations/supabase/types.ts | head
```

If the grep returns nothing, ask Lovable to regenerate `types.ts`. Do not edit it manually — it is auto-generated.

- [ ] **Step 3: Confirm RPCs exist**

```bash
grep -E "get_learning_track_roster|get_learning_track_heatmap" src/integrations/supabase/types.ts
```

Both function names should appear. If missing, Lovable needs to regenerate.

### Task 0.2: Send RLS patch handoff to Lovable (parallel — non-blocking for Phases 1–6)

**Files:**
- Modify: `SUPABASE.md`

- [ ] **Step 1: Append the RLS patch to the Pending section**

```markdown
### Learning Track RLS Patch — 2026-04-11

**What:** Widen owner-update RLS on submissions/files to support the "request changes → recruit edits → resubmit" loop. Currently the policy only allows updates while `review_status = 'pending'`, which blocks recruits from re-editing after admin rejects.

**RLS Policies:**
- `lt_submissions_user_update_own_unreviewed` on `learning_track_submissions`:
  - DROP and recreate with: `USING (auth.uid() = user_id AND review_status IN ('pending','changes_requested'))`
- `lt_files_user_insert_own` on `learning_track_submission_files`:
  - DROP and recreate with the EXISTS subquery joining `learning_track_submissions` adding `s.review_status IN ('pending','changes_requested')` instead of `s.review_status = 'pending'`
- `lt_files_user_delete_own` on `learning_track_submission_files`:
  - Same change as above
```

- [ ] **Step 2: Commit and push**

```bash
git add SUPABASE.md
git commit -m "Pending RLS patch for learning track resubmission loop"
git push origin main
```

- [ ] **Step 3: Notify the user to relay to Lovable**

User-facing message: "RLS patch added to SUPABASE.md and pushed. Tell Lovable to apply the new pending section."

---

## Phase 1 — Routing skeleton

This phase replaces the single-route shadcn `Tabs` with a React Router v6 nested route tree. After this phase, all five subtabs have unique URLs and the page renders empty placeholders. No business logic yet.

### Task 1.1: Add nested routes to `App.tsx`

**Files:**
- Modify: `src/App.tsx` (find the existing `/learning-track` route, around line 132 per the spec)

- [ ] **Step 1: Replace the single `/learning-track` route with a nested route tree**

```tsx
// Lazy imports at the top of App.tsx
const LearningTrack = lazy(() => import("./pages/LearningTrack"));
const LearningTrackPreRnf = lazy(() => import("./pages/learning-track/PreRnf"));
const LearningTrackPostRnf = lazy(() => import("./pages/learning-track/PostRnf"));
const LearningTrackResources = lazy(() => import("./pages/learning-track/Resources"));
const LearningTrackAdmin = lazy(() => import("./pages/learning-track/admin/AdminLayout"));
const LearningTrackAdminRoster = lazy(() => import("./pages/learning-track/admin/Roster"));
const LearningTrackAdminHeatmap = lazy(() => import("./pages/learning-track/admin/Heatmap"));
const LearningTrackAdminSubmissions = lazy(() => import("./pages/learning-track/admin/Submissions"));
const LearningTrackAdminRecruit = lazy(() => import("./pages/learning-track/admin/RecruitDetail"));
```

```tsx
// Replace the existing single route
<Route path="/learning-track" element={<RequireAuth><LearningTrack /></RequireAuth>}>
  <Route index element={<LearningTrackRedirect />} />
  <Route path="pre-rnf" element={<LearningTrackPreRnf />} />
  <Route path="pre-rnf/:itemId" element={<LearningTrackPreRnf />} />
  <Route path="post-rnf" element={<LearningTrackPostRnf />} />
  <Route path="post-rnf/:itemId" element={<LearningTrackPostRnf />} />
  <Route path="resources" element={<LearningTrackResources />} />
  <Route path="admin" element={<ProtectedAdminPage><LearningTrackAdmin /></ProtectedAdminPage>}>
    <Route index element={<Navigate to="roster" replace />} />
    <Route path="roster" element={<LearningTrackAdminRoster />} />
    <Route path="heatmap" element={<LearningTrackAdminHeatmap />} />
    <Route path="submissions" element={<LearningTrackAdminSubmissions />} />
    <Route path="recruit/:userId" element={<LearningTrackAdminRecruit />} />
  </Route>
</Route>
```

`LearningTrackRedirect` is a small inline component defined inside `App.tsx` (or as a sibling import). It implements the smart redirect logic from §1 of the spec.

- [ ] **Step 2: Add the `LearningTrackRedirect` helper**

```tsx
// In src/components/learning-track/LearningTrackRedirect.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { useLearningTrackOverallProgress } from "@/hooks/learning-track/useLearningTrackOverallProgress";

export function LearningTrackRedirect() {
  const navigate = useNavigate();
  const { user } = useSimplifiedAuth();
  const { isAdmin, isMasterAdmin } = usePermissions();
  const { data, isLoading } = useLearningTrackOverallProgress(user?.id);

  useEffect(() => {
    if (isLoading || !user) return;

    if (isAdmin() || isMasterAdmin()) {
      navigate("/learning-track/admin/roster", { replace: true });
      return;
    }

    const dismissed = localStorage.getItem("lt-redirect-dismissed") === "1";
    const hasZeroProgress = (data?.totalCompleted ?? 0) === 0;

    if (hasZeroProgress && !dismissed) {
      navigate("/learning-track/pre-rnf", { replace: true });
      return;
    }

    const lastTab = localStorage.getItem("lt-last-tab");
    navigate(lastTab && lastTab.startsWith("/learning-track/") ? lastTab : "/learning-track/pre-rnf", { replace: true });
  }, [navigate, user, isAdmin, isMasterAdmin, data, isLoading]);

  return null;
}
```

`useLearningTrackOverallProgress` is created in Task 2.4. For Step 2 the file can compile referencing a stub: `useLearningTrackOverallProgress` returns `{ data: { totalCompleted: 0 }, isLoading: false }` until Task 2.4 lands.

- [ ] **Step 3: Build and verify**

```bash
npm run build
```

Expected: clean build. Routes resolve, page stubs (Task 1.2) render empty.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx src/components/learning-track/LearningTrackRedirect.tsx
git commit -m "Learning track now has nested routes for pre-RNF, post-RNF, resources, and admin subtabs"
git push origin main
```

### Task 1.2: Create page stubs for each subroute

**Files:**
- Create: `src/pages/learning-track/PreRnf.tsx`
- Create: `src/pages/learning-track/PostRnf.tsx`
- Create: `src/pages/learning-track/Resources.tsx`
- Create: `src/pages/learning-track/admin/AdminLayout.tsx`
- Create: `src/pages/learning-track/admin/Roster.tsx`
- Create: `src/pages/learning-track/admin/Heatmap.tsx`
- Create: `src/pages/learning-track/admin/Submissions.tsx`
- Create: `src/pages/learning-track/admin/RecruitDetail.tsx`

- [ ] **Step 1: Write each stub as a default export returning a placeholder div**

Example:

```tsx
// src/pages/learning-track/PreRnf.tsx
export default function PreRnfTrack() {
  return <div data-testid="pre-rnf-page">Pre-RNF Track (stub)</div>;
}
```

Repeat for the other 7 files with corresponding test IDs (`post-rnf-page`, `resources-page`, `admin-layout-page`, `admin-roster-page`, `admin-heatmap-page`, `admin-submissions-page`, `admin-recruit-page`).

`AdminLayout.tsx` includes an `<Outlet />` since it has nested children:

```tsx
import { Outlet } from "react-router-dom";
export default function AdminLayout() {
  return (
    <div data-testid="admin-layout-page">
      <Outlet />
    </div>
  );
}
```

- [ ] **Step 2: Build, smoke test each route**

```bash
npm run build
npm run dev
```

Manually visit each URL in the browser. Each should render its placeholder text.

- [ ] **Step 3: Commit**

```bash
git add src/pages/learning-track/
git commit -m "Each learning track subroute now renders a placeholder page"
git push origin main
```

### Task 1.3: Refactor `src/pages/LearningTrack.tsx` into a route container

**Files:**
- Modify: `src/pages/LearningTrack.tsx`

- [ ] **Step 1: Replace the existing shadcn `Tabs` body with a `NavLink` strip + `<Outlet />`**

```tsx
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/usePermissions";

const baseTabClass =
  "px-4 py-2 text-sm font-medium border-b-2 border-transparent text-muted-foreground hover:text-foreground transition";
const activeTabClass = "border-primary text-foreground";

export default function LearningTrack() {
  const { isAdmin, isMasterAdmin } = usePermissions();
  const showAdminTab = isAdmin() || isMasterAdmin();
  const location = useLocation();

  // Persist last visited subtab for the smart redirect
  useEffect(() => {
    if (location.pathname !== "/learning-track") {
      localStorage.setItem("lt-last-tab", location.pathname);
    }
  }, [location.pathname]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Learning Track</h1>
        <p className="text-sm text-muted-foreground">
          Your phased onboarding programme. Complete each phase in order.
        </p>
      </header>

      <nav className="flex gap-1 border-b">
        <NavLink to="/learning-track/pre-rnf" className={({ isActive }) => cn(baseTabClass, isActive && activeTabClass)}>
          Pre-RNF Training
        </NavLink>
        <NavLink to="/learning-track/post-rnf" className={({ isActive }) => cn(baseTabClass, isActive && activeTabClass)}>
          Post-RNF Training
        </NavLink>
        <NavLink to="/learning-track/resources" className={({ isActive }) => cn(baseTabClass, isActive && activeTabClass)}>
          Resources
        </NavLink>
        {showAdminTab && (
          <NavLink to="/learning-track/admin" className={({ isActive }) => cn(baseTabClass, isActive && activeTabClass)}>
            Admin
          </NavLink>
        )}
      </nav>

      <Outlet />
    </div>
  );
}
```

- [ ] **Step 2: Build, navigate between tabs, verify URL changes**

```bash
npm run build && npm run dev
```

Click each tab; URL must update; back/forward must work.

- [ ] **Step 3: Commit**

```bash
git add src/pages/LearningTrack.tsx
git commit -m "Learning track now uses URL-driven nav tabs instead of client-state tabs"
git push origin main
```

---

## Phase 2 — Data layer (Supabase hooks)

Replace the four legacy localStorage hooks with TanStack Query hooks backed by the new Supabase tables.

### Task 2.1: Create `useLearningTrackPhases` query hook

**Files:**
- Create: `src/hooks/learning-track/useLearningTrackPhases.ts`
- Create: `src/types/learning-track.ts`

- [ ] **Step 1: Define shared types**

```ts
// src/types/learning-track.ts
export type Track = "pre_rnf" | "post_rnf";
export type ItemStatus = "not_started" | "in_progress" | "completed";
export type ReviewStatus = "pending" | "approved" | "changes_requested";
export type BlockType = "text" | "link" | "video" | "resource_ref";
export type ResourceType = "product" | "kb" | "script" | "concept_card" | "video" | "obsidian_doc" | "notebooklm";
export type FileType = "pdf" | "image" | "url" | "loom" | "text";

export interface LearningTrackPhase {
  id: string;
  track: Track;
  order_index: number;
  title: string;
  description: string | null;
  items: LearningTrackItem[];
}

export interface LearningTrackItem {
  id: string;
  phase_id: string;
  order_index: number;
  title: string;
  description: string | null;
  objectives: string[] | null;
  action_items: string[] | null;
  requires_submission: boolean;
  hidden_resources: string[];
  legacy_id: string | null;
  content_blocks: LearningTrackContentBlock[];
}

export interface LearningTrackContentBlock {
  id: string;
  item_id: string;
  order_index: number;
  block_type: BlockType;
  title: string | null;
  body: string | null;
  url: string | null;
  resource_type: ResourceType | null;
  resource_id: string | null;
}
```

- [ ] **Step 2: Write the query hook**

```ts
// src/hooks/learning-track/useLearningTrackPhases.ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { LearningTrackPhase, Track } from "@/types/learning-track";

export function useLearningTrackPhases(track: Track) {
  return useQuery<LearningTrackPhase[]>({
    queryKey: ["learning-track-phases", track],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learning_track_phases")
        .select(`
          id, track, order_index, title, description,
          learning_track_items (
            id, phase_id, order_index, title, description,
            objectives, action_items, requires_submission, hidden_resources, legacy_id,
            learning_track_content_blocks (
              id, item_id, order_index, block_type, title, body, url, resource_type, resource_id
            )
          )
        `)
        .eq("track", track)
        .order("order_index", { ascending: true });

      if (error) throw error;

      return (data ?? []).map((p) => ({
        id: p.id,
        track: p.track as Track,
        order_index: p.order_index,
        title: p.title,
        description: p.description,
        items: (p.learning_track_items ?? [])
          .sort((a, b) => a.order_index - b.order_index)
          .map((i) => ({
            ...i,
            hidden_resources: i.hidden_resources ?? [],
            content_blocks: (i.learning_track_content_blocks ?? []).sort(
              (a, b) => a.order_index - b.order_index
            ),
          })),
      }));
    },
  });
}
```

- [ ] **Step 3: Build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/hooks/learning-track/useLearningTrackPhases.ts src/types/learning-track.ts
git commit -m "Phases, items, and content blocks now load from Supabase via TanStack Query"
git push origin main
```

### Task 2.2: Create `useLearningTrackProgress` mutation hook (Supabase-backed)

**Files:**
- Create: `src/hooks/learning-track/useLearningTrackProgress.ts`

This replaces the legacy `src/hooks/useLearningTrackProgress.ts` (note: same filename, new directory). The legacy hook stays in place until Phase 5/6 components are migrated.

- [ ] **Step 1: Write the hook**

```ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ItemStatus } from "@/types/learning-track";

interface ProgressRow {
  item_id: string;
  status: ItemStatus;
  completed_at: string | null;
}

export function useLearningTrackProgress(userId: string | undefined) {
  const qc = useQueryClient();

  const query = useQuery<Record<string, ProgressRow>>({
    queryKey: ["learning-track-progress", userId],
    enabled: !!userId,
    staleTime: 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learning_track_progress")
        .select("item_id, status, completed_at")
        .eq("user_id", userId!);
      if (error) throw error;
      const map: Record<string, ProgressRow> = {};
      (data ?? []).forEach((row) => {
        map[row.item_id] = row as ProgressRow;
      });
      return map;
    },
  });

  const setStatus = useMutation({
    mutationFn: async (params: { itemId: string; status: ItemStatus }) => {
      const completedAt = params.status === "completed" ? new Date().toISOString() : null;
      const { error } = await supabase
        .from("learning_track_progress")
        .upsert(
          {
            user_id: userId!,
            item_id: params.itemId,
            status: params.status,
            completed_at: completedAt,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,item_id" }
        );
      if (error) throw error;
    },
    onMutate: async (params) => {
      await qc.cancelQueries({ queryKey: ["learning-track-progress", userId] });
      const previous = qc.getQueryData<Record<string, ProgressRow>>(["learning-track-progress", userId]);
      qc.setQueryData<Record<string, ProgressRow>>(["learning-track-progress", userId], (old) => ({
        ...(old ?? {}),
        [params.itemId]: {
          item_id: params.itemId,
          status: params.status,
          completed_at: params.status === "completed" ? new Date().toISOString() : null,
        },
      }));
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(["learning-track-progress", userId], ctx.previous);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["learning-track-progress", userId] });
      qc.invalidateQueries({ queryKey: ["learning-track-overall-progress", userId] });
    },
  });

  const isCompleted = (itemId: string) => query.data?.[itemId]?.status === "completed";
  const getStatus = (itemId: string): ItemStatus =>
    query.data?.[itemId]?.status ?? "not_started";

  return {
    progress: query.data ?? {},
    isLoading: query.isLoading,
    setStatus,
    isCompleted,
    getStatus,
  };
}
```

- [ ] **Step 2: Build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/learning-track/useLearningTrackProgress.ts
git commit -m "Item completion now persists to Supabase with optimistic updates"
git push origin main
```

### Task 2.3: Create `useLearningTrackSubmissions` mutation hook

**Files:**
- Create: `src/hooks/learning-track/useLearningTrackSubmissions.ts`

- [ ] **Step 1: Write the hook**

```ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ReviewStatus, FileType } from "@/types/learning-track";

export interface SubmissionFile {
  id: string;
  submission_id: string;
  file_type: FileType;
  label: string | null;
  storage_path: string | null;
  external_url: string | null;
  content_text: string | null;
}

export interface Submission {
  id: string;
  user_id: string;
  item_id: string;
  remarks: string | null;
  submitted_at: string;
  review_status: ReviewStatus;
  reviewed_at: string | null;
  reviewed_by: string | null;
  review_feedback: string | null;
  files: SubmissionFile[];
}

export function useUserSubmissionForItem(userId: string | undefined, itemId: string | undefined) {
  return useQuery<Submission | null>({
    queryKey: ["learning-track-submission", userId, itemId],
    enabled: !!userId && !!itemId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learning_track_submissions")
        .select("*, files:learning_track_submission_files(*)")
        .eq("user_id", userId!)
        .eq("item_id", itemId!)
        .maybeSingle();
      if (error) throw error;
      return data as Submission | null;
    },
  });
}

export function useUpsertSubmission(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { itemId: string; remarks: string }) => {
      const { data, error } = await supabase
        .from("learning_track_submissions")
        .upsert(
          {
            user_id: userId!,
            item_id: params.itemId,
            remarks: params.remarks,
            review_status: "pending",
            reviewed_at: null,
            reviewed_by: null,
            submitted_at: new Date().toISOString(),
          },
          { onConflict: "user_id,item_id" }
        )
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSettled: (_data, _err, vars) => {
      qc.invalidateQueries({ queryKey: ["learning-track-submission", userId, vars.itemId] });
      qc.invalidateQueries({ queryKey: ["learning-track-progress", userId] });
    },
  });
}

export function useUploadSubmissionFile(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      submissionId: string;
      itemId: string;
      file: File;
      fileType: FileType;
      label?: string;
    }) => {
      const ext = params.file.name.split(".").pop() ?? "bin";
      const path = `${userId}/${params.itemId}/${params.submissionId}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("learning-track-submissions")
        .upload(path, params.file, { upsert: false });
      if (uploadErr) throw uploadErr;

      const { error: rowErr } = await supabase.from("learning_track_submission_files").insert({
        submission_id: params.submissionId,
        file_type: params.fileType,
        label: params.label ?? params.file.name,
        storage_path: path,
      });
      if (rowErr) throw rowErr;
    },
    onSettled: (_d, _e, vars) => {
      qc.invalidateQueries({ queryKey: ["learning-track-submission", userId, vars.itemId] });
    },
  });
}

export function useAddSubmissionLink(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      submissionId: string;
      itemId: string;
      fileType: Extract<FileType, "url" | "loom" | "text">;
      url?: string;
      text?: string;
      label?: string;
    }) => {
      const { error } = await supabase.from("learning_track_submission_files").insert({
        submission_id: params.submissionId,
        file_type: params.fileType,
        label: params.label ?? null,
        external_url: params.url ?? null,
        content_text: params.text ?? null,
      });
      if (error) throw error;
    },
    onSettled: (_d, _e, vars) => {
      qc.invalidateQueries({ queryKey: ["learning-track-submission", userId, vars.itemId] });
    },
  });
}

export function useDeleteSubmissionFile(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { fileId: string; storagePath: string | null; itemId: string }) => {
      if (params.storagePath) {
        await supabase.storage.from("learning-track-submissions").remove([params.storagePath]);
      }
      const { error } = await supabase
        .from("learning_track_submission_files")
        .delete()
        .eq("id", params.fileId);
      if (error) throw error;
    },
    onSettled: (_d, _e, vars) => {
      qc.invalidateQueries({ queryKey: ["learning-track-submission", userId, vars.itemId] });
    },
  });
}
```

- [ ] **Step 2: Build, commit**

```bash
npm run build
git add src/hooks/learning-track/useLearningTrackSubmissions.ts
git commit -m "Submissions and file attachments now persist to Supabase storage and tables"
git push origin main
```

### Task 2.4: Create `useLearningTrackOverallProgress` aggregated hook

**Files:**
- Create: `src/hooks/learning-track/useLearningTrackOverallProgress.ts`

This hook is consumed by the dashboard hero card, the sidebar progress badge, and `LearningTrackRedirect` from Task 1.1.

- [ ] **Step 1: Write the hook**

```ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface OverallProgress {
  totalCompleted: number;
  totalItems: number;
  preRnfPct: number;
  postRnfPct: number;
  combinedPct: number;
  nextItem: { id: string; title: string; track: "pre_rnf" | "post_rnf" } | null;
}

export function useLearningTrackOverallProgress(userId: string | undefined) {
  return useQuery<OverallProgress>({
    queryKey: ["learning-track-overall-progress", userId],
    enabled: !!userId,
    staleTime: 60 * 1000,
    queryFn: async () => {
      const { data: phases, error: phasesErr } = await supabase
        .from("learning_track_phases")
        .select("id, track, order_index, learning_track_items(id, order_index, title)")
        .order("order_index", { ascending: true });
      if (phasesErr) throw phasesErr;

      const { data: progress, error: progressErr } = await supabase
        .from("learning_track_progress")
        .select("item_id, status")
        .eq("user_id", userId!);
      if (progressErr) throw progressErr;

      const completedSet = new Set(
        (progress ?? []).filter((p) => p.status === "completed").map((p) => p.item_id)
      );

      const allItems: { id: string; title: string; track: "pre_rnf" | "post_rnf"; phaseOrder: number; itemOrder: number }[] = [];
      (phases ?? []).forEach((p) => {
        (p.learning_track_items ?? []).forEach((i) => {
          allItems.push({
            id: i.id,
            title: i.title,
            track: p.track as "pre_rnf" | "post_rnf",
            phaseOrder: p.order_index,
            itemOrder: i.order_index,
          });
        });
      });
      allItems.sort((a, b) => (a.track !== b.track ? (a.track === "pre_rnf" ? -1 : 1) : a.phaseOrder - b.phaseOrder || a.itemOrder - b.itemOrder));

      const preItems = allItems.filter((i) => i.track === "pre_rnf");
      const postItems = allItems.filter((i) => i.track === "post_rnf");
      const preCompleted = preItems.filter((i) => completedSet.has(i.id)).length;
      const postCompleted = postItems.filter((i) => completedSet.has(i.id)).length;
      const totalCompleted = preCompleted + postCompleted;
      const totalItems = allItems.length;
      const nextItem = allItems.find((i) => !completedSet.has(i.id)) ?? null;

      return {
        totalCompleted,
        totalItems,
        preRnfPct: preItems.length ? Math.round((preCompleted / preItems.length) * 100) : 0,
        postRnfPct: postItems.length ? Math.round((postCompleted / postItems.length) * 100) : 0,
        combinedPct: totalItems ? Math.round((totalCompleted / totalItems) * 100) : 0,
        nextItem: nextItem ? { id: nextItem.id, title: nextItem.title, track: nextItem.track } : null,
      };
    },
  });
}
```

- [ ] **Step 2: Build, commit**

```bash
npm run build
git add src/hooks/learning-track/useLearningTrackOverallProgress.ts
git commit -m "Overall progress aggregation hook now powers dashboard hero, sidebar badge, and redirect logic"
git push origin main
```

---

## Phase 3 — Seed data

### Task 3.1: Write a TS-Node seed script that converts `learningTrackData.ts` into Supabase rows

**Files:**
- Create: `scripts/seed-learning-track.ts`
- Read: `src/data/learningTrackData.ts`

The seed inserts: pre-RNF phases (from existing data), post-RNF phases (new mapping), all items, all content blocks. Every item carries its `legacy_id` so the localStorage migration in Phase 7 can map old IDs to new UUIDs.

- [ ] **Step 1: Define the post-RNF phase mapping inline in the script**

The mapping is locked in the spec §3 — copy it verbatim:

```ts
// scripts/seed-learning-track.ts
import { createClient } from "@supabase/supabase-js";
import { learningTrackData, assignmentChecklist } from "../src/data/learningTrackData";
import "dotenv/config";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const POST_RNF_PHASES: Array<{
  title: string;
  description: string;
  legacyIds: string[];
}> = [
  {
    title: "Foundation & Certification",
    description: "Regulatory baseline and foundational training before working at scale.",
    legacyIds: ["asgn-1", "asgn-13", "tc-7", "tc-1", "tc-2"],
  },
  {
    title: "Business Planning & Marketing Setup",
    description: "Build your personal infrastructure: business plan, marketing kit, leadership orientation.",
    legacyIds: ["asgn-4", "asgn-5", "asgn-6", "tc-8"],
  },
  {
    title: "Prospecting & Pipeline Building",
    description: "All prospecting activities: contact lists, market surveys, telethons.",
    legacyIds: ["asgn-2", "asgn-3", "tc-3", "tc-5", "tc-6"],
  },
  {
    title: "Sales Process & Field Observation",
    description: "Live sales-skill development: shadowing seniors, presentations, roleplays, first real cases.",
    legacyIds: ["asgn-7", "asgn-8", "asgn-9", "asgn-10", "asgn-11", "asgn-14", "tc-4"],
  },
  {
    title: "Learning, Reflection & Team Contribution",
    description: "Continuous learning and giving back to the team.",
    legacyIds: ["asgn-12", "asgn-15", "asgn-16", "asgn-17", "asgn-18"],
  },
];

async function clearExisting() {
  // Delete in FK-safe order. Cascades handle items + blocks.
  const { error } = await supabase.from("learning_track_phases").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (error) throw error;
}

async function seedPreRnf() {
  for (let pIdx = 0; pIdx < learningTrackData.length; pIdx++) {
    const phase = learningTrackData[pIdx];
    const { data: phaseRow, error: phaseErr } = await supabase
      .from("learning_track_phases")
      .insert({
        track: "pre_rnf",
        order_index: pIdx + 1,
        title: phase.title,
        description: phase.description ?? null,
      })
      .select("id")
      .single();
    if (phaseErr) throw phaseErr;

    for (let iIdx = 0; iIdx < phase.items.length; iIdx++) {
      const item = phase.items[iIdx];
      const { data: itemRow, error: itemErr } = await supabase
        .from("learning_track_items")
        .insert({
          phase_id: phaseRow.id,
          order_index: iIdx + 1,
          title: item.title,
          description: item.description ?? null,
          objectives: item.objectives ?? null,
          action_items: item.actionItems ?? null,
          requires_submission: true,
          legacy_id: item.id,
        })
        .select("id")
        .single();
      if (itemErr) throw itemErr;

      const blocks = (item.defaultContent ?? []).map((b: any, bIdx: number) => ({
        item_id: itemRow.id,
        order_index: bIdx + 1,
        block_type: b.type,
        title: b.title ?? null,
        body: b.body ?? null,
        url: b.url ?? null,
      }));
      if (blocks.length) {
        const { error: blockErr } = await supabase.from("learning_track_content_blocks").insert(blocks);
        if (blockErr) throw blockErr;
      }
    }
  }
}

async function seedPostRnf() {
  // Build a lookup of legacy id → assignment object for title resolution
  const legacyMap = new Map<string, { id: string; title: string }>();
  assignmentChecklist.forEach((section) => {
    section.items.forEach((item) => legacyMap.set(item.id, item));
  });

  for (let pIdx = 0; pIdx < POST_RNF_PHASES.length; pIdx++) {
    const phase = POST_RNF_PHASES[pIdx];
    const { data: phaseRow, error: phaseErr } = await supabase
      .from("learning_track_phases")
      .insert({
        track: "post_rnf",
        order_index: pIdx + 1,
        title: phase.title,
        description: phase.description,
      })
      .select("id")
      .single();
    if (phaseErr) throw phaseErr;

    for (let iIdx = 0; iIdx < phase.legacyIds.length; iIdx++) {
      const legacyId = phase.legacyIds[iIdx];
      const legacyItem = legacyMap.get(legacyId);
      if (!legacyItem) {
        throw new Error(`Legacy id not found in assignmentChecklist: ${legacyId}`);
      }
      const { error: itemErr } = await supabase.from("learning_track_items").insert({
        phase_id: phaseRow.id,
        order_index: iIdx + 1,
        title: legacyItem.title,
        description: null,
        requires_submission: true,
        legacy_id: legacyId,
      });
      if (itemErr) throw itemErr;
    }
  }
}

async function main() {
  console.log("Clearing existing learning track data...");
  await clearExisting();
  console.log("Seeding pre-RNF...");
  await seedPreRnf();
  console.log("Seeding post-RNF...");
  await seedPostRnf();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 2: Add npm script**

```json
// package.json — under "scripts"
"seed:learning-track": "tsx scripts/seed-learning-track.ts"
```

If `tsx` is not installed, use `npx tsx scripts/seed-learning-track.ts` instead. Do not add `tsx` as a new dependency without user approval.

- [ ] **Step 3: Run the seed**

```bash
SUPABASE_SERVICE_ROLE_KEY=<from .env> npx tsx scripts/seed-learning-track.ts
```

Expected output:
```
Clearing existing learning track data...
Seeding pre-RNF...
Seeding post-RNF...
Done.
```

- [ ] **Step 4: Verify in Supabase**

Run a quick verification query via the Supabase dashboard SQL editor:

```sql
SELECT track, COUNT(*) AS phases FROM learning_track_phases GROUP BY track;
-- Expected: pre_rnf 6, post_rnf 5

SELECT track, COUNT(*) AS items
FROM learning_track_items i
JOIN learning_track_phases p ON p.id = i.phase_id
GROUP BY track;
-- Expected: pre_rnf 21 (sum across 6 phases), post_rnf 26
```

- [ ] **Step 5: Commit**

```bash
git add scripts/seed-learning-track.ts package.json
git commit -m "Seed script populates Supabase with all pre-RNF phases and the new post-RNF phase grouping"
git push origin main
```

---

## Phase 4 — Shared component refactor

Replace 6 legacy components with 4 shared ones.

### Task 4.1: Build `<PhaseSection />`

**Files:**
- Create: `src/components/learning-track/PhaseSection.tsx`

- [ ] **Step 1: Implement the component**

```tsx
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LearningTrackPhase } from "@/types/learning-track";
import { LearningItemRow } from "./LearningItemRow";

interface PhaseSectionProps {
  phase: LearningTrackPhase;
  isCompleted: (itemId: string) => boolean;
  defaultOpen?: boolean;
  expandedItemId?: string;
  readOnly?: boolean;
  viewAsUserId?: string;
}

export function PhaseSection({
  phase,
  isCompleted,
  defaultOpen = true,
  expandedItemId,
  readOnly = false,
  viewAsUserId,
}: PhaseSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const completedCount = phase.items.filter((i) => isCompleted(i.id)).length;

  return (
    <section className="rounded-lg border bg-card">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          <div>
            <h2 className="font-semibold">{phase.title}</h2>
            {phase.description && (
              <p className="text-sm text-muted-foreground">{phase.description}</p>
            )}
          </div>
        </div>
        <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium">
          {completedCount} / {phase.items.length}
        </span>
      </button>
      {open && (
        <div className={cn("border-t divide-y")}>
          {phase.items.map((item) => (
            <LearningItemRow
              key={item.id}
              item={item}
              isCompleted={isCompleted(item.id)}
              defaultExpanded={item.id === expandedItemId}
              readOnly={readOnly}
              viewAsUserId={viewAsUserId}
            />
          ))}
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 2: Build, commit**

```bash
npm run build
git add src/components/learning-track/PhaseSection.tsx
git commit -m "PhaseSection component now renders both tracks with consistent styling"
git push origin main
```

### Task 4.2: Build `<LearningItemRow />`

**Files:**
- Create: `src/components/learning-track/LearningItemRow.tsx`

This is the largest new component. It handles: status checkbox/dropdown, expand/collapse, content blocks, related resources, submission panel.

- [ ] **Step 1: Implement**

```tsx
import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, CheckCircle2, Circle, Clock } from "lucide-react";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { useLearningTrackProgress } from "@/hooks/learning-track/useLearningTrackProgress";
import type { LearningTrackItem, ItemStatus } from "@/types/learning-track";
import { ItemContentBlocks } from "./ItemContentBlocks";
import { RelatedResources } from "./RelatedResources";
import { SubmissionPanel } from "./SubmissionPanel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LearningItemRowProps {
  item: LearningTrackItem;
  isCompleted: boolean;
  defaultExpanded?: boolean;
  readOnly?: boolean;
  viewAsUserId?: string;
}

const STATUS_ICON: Record<ItemStatus, JSX.Element> = {
  not_started: <Circle className="h-5 w-5 text-muted-foreground" />,
  in_progress: <Clock className="h-5 w-5 text-amber-500" />,
  completed: <CheckCircle2 className="h-5 w-5 text-green-600" />,
};

export function LearningItemRow({
  item,
  isCompleted,
  defaultExpanded = false,
  readOnly = false,
  viewAsUserId,
}: LearningItemRowProps) {
  const { user } = useSimplifiedAuth();
  const targetUserId = viewAsUserId ?? user?.id;
  const { setStatus, getStatus } = useLearningTrackProgress(targetUserId);
  const [expanded, setExpanded] = useState(defaultExpanded);
  const status = getStatus(item.id);

  useEffect(() => {
    if (defaultExpanded) setExpanded(true);
  }, [defaultExpanded]);

  return (
    <div className="px-4 py-3" id={`item-${item.id}`}>
      <div className="flex items-start gap-3">
        <button
          type="button"
          disabled={readOnly}
          onClick={() => {
            const next: ItemStatus = isCompleted ? "not_started" : "completed";
            setStatus.mutate({ itemId: item.id, status: next });
          }}
          aria-label={isCompleted ? "Mark incomplete" : "Mark complete"}
          className="mt-1"
        >
          {STATUS_ICON[status]}
        </button>
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="flex-1 text-left"
          aria-expanded={expanded}
        >
          <div className="flex items-center gap-2">
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <h3 className={cn("font-medium", isCompleted && "line-through text-muted-foreground")}>
              {item.title}
            </h3>
          </div>
          {item.description && (
            <p className="ml-6 mt-1 text-sm text-muted-foreground">{item.description}</p>
          )}
        </button>
      </div>

      {expanded && (
        <div className="ml-8 mt-4 space-y-4">
          {item.objectives && item.objectives.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold">Objectives</h4>
              <ul className="ml-4 list-disc text-sm">
                {item.objectives.map((o, i) => (
                  <li key={i}>{o}</li>
                ))}
              </ul>
            </div>
          )}
          {item.action_items && item.action_items.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold">Action items</h4>
              <ul className="ml-4 list-disc text-sm">
                {item.action_items.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          )}
          <ItemContentBlocks blocks={item.content_blocks} />
          <RelatedResources item={item} />
          {item.requires_submission && (
            <SubmissionPanel
              itemId={item.id}
              userId={targetUserId}
              readOnly={readOnly}
            />
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Build, commit**

```bash
npm run build
git add src/components/learning-track/LearningItemRow.tsx
git commit -m "LearningItemRow component now handles status, expansion, and submission for both tracks"
git push origin main
```

### Task 4.3: Build `<ItemContentBlocks />`

**Files:**
- Create: `src/components/learning-track/ItemContentBlocks.tsx`

- [ ] **Step 1: Implement**

```tsx
import ReactMarkdown from "react-markdown";
import { ExternalLink, Video } from "lucide-react";
import type { LearningTrackContentBlock } from "@/types/learning-track";

interface Props {
  blocks: LearningTrackContentBlock[];
}

export function ItemContentBlocks({ blocks }: Props) {
  if (blocks.length === 0) return null;
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold">Content</h4>
      {blocks.map((b) => (
        <div key={b.id} className="rounded border bg-muted/30 p-3">
          {b.title && <div className="mb-1 text-sm font-medium">{b.title}</div>}
          {b.block_type === "text" && b.body && (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{b.body}</ReactMarkdown>
            </div>
          )}
          {b.block_type === "link" && b.url && (
            <a
              href={b.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              {b.title ?? b.url} <ExternalLink className="h-3 w-3" />
            </a>
          )}
          {b.block_type === "video" && b.url && (
            <a
              href={b.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <Video className="h-3 w-3" /> {b.title ?? "Watch video"}
            </a>
          )}
          {/* resource_ref blocks are rendered by RelatedResources */}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Build, commit**

```bash
npm run build
git add src/components/learning-track/ItemContentBlocks.tsx
git commit -m "Content blocks now render markdown text, external links, and video links uniformly"
git push origin main
```

### Task 4.4: Build `<SubmissionPanel />`

**Files:**
- Create: `src/components/learning-track/SubmissionPanel.tsx`

(RLS patch already applied — see Phase 0.)

- [ ] **Step 1: Implement**

```tsx
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Paperclip, Trash2 } from "lucide-react";
import {
  useUserSubmissionForItem,
  useUpsertSubmission,
  useUploadSubmissionFile,
  useAddSubmissionLink,
  useDeleteSubmissionFile,
} from "@/hooks/learning-track/useLearningTrackSubmissions";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  itemId: string;
  userId: string | undefined;
  readOnly?: boolean;
}

const STATUS_LABEL = {
  pending: { label: "Pending review", variant: "secondary" as const },
  approved: { label: "Approved", variant: "default" as const },
  changes_requested: { label: "Changes requested", variant: "destructive" as const },
};

export function SubmissionPanel({ itemId, userId, readOnly = false }: Props) {
  const { data: submission, isLoading } = useUserSubmissionForItem(userId, itemId);
  const upsert = useUpsertSubmission(userId);
  const upload = useUploadSubmissionFile(userId);
  const addLink = useAddSubmissionLink(userId);
  const deleteFile = useDeleteSubmissionFile(userId);

  const [remarks, setRemarks] = useState(submission?.remarks ?? "");
  const [linkUrl, setLinkUrl] = useState("");

  const locked = submission?.review_status === "approved";
  const canEdit = !readOnly && !locked;

  if (isLoading) return <Loader2 className="h-4 w-4 animate-spin" />;

  const handleSave = async () => {
    await upsert.mutateAsync({ itemId, remarks });
  };

  const handleFile = async (file: File) => {
    if (!submission) {
      const result = await upsert.mutateAsync({ itemId, remarks });
      const fileType = file.type.startsWith("image/") ? "image" : "pdf";
      await upload.mutateAsync({ submissionId: result.id, itemId, file, fileType });
    } else {
      const fileType = file.type.startsWith("image/") ? "image" : "pdf";
      await upload.mutateAsync({ submissionId: submission.id, itemId, file, fileType });
    }
  };

  const handleAddLink = async () => {
    if (!linkUrl || !submission) return;
    const fileType = linkUrl.includes("loom.com") ? "loom" : "url";
    await addLink.mutateAsync({ submissionId: submission.id, itemId, fileType, url: linkUrl });
    setLinkUrl("");
  };

  return (
    <div className="rounded border bg-muted/30 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">Submission</h4>
        {submission && (
          <Badge variant={STATUS_LABEL[submission.review_status].variant}>
            {STATUS_LABEL[submission.review_status].label}
          </Badge>
        )}
      </div>

      {submission?.review_status === "changes_requested" && submission.review_feedback && (
        <div className="rounded bg-destructive/10 border border-destructive/30 p-2 text-sm">
          <div className="font-medium text-destructive">Reviewer feedback:</div>
          <div>{submission.review_feedback}</div>
        </div>
      )}

      <div>
        <label className="text-xs text-muted-foreground">Remarks</label>
        <Textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          disabled={!canEdit}
          rows={3}
        />
      </div>

      {submission?.files && submission.files.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Attachments</div>
          {submission.files.map((f) => (
            <FilePreviewRow
              key={f.id}
              file={f}
              canEdit={canEdit}
              onDelete={() => deleteFile.mutate({ fileId: f.id, storagePath: f.storage_path, itemId })}
            />
          ))}
        </div>
      )}

      {canEdit && (
        <div className="space-y-2">
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
            <Paperclip className="h-4 w-4" />
            <input
              type="file"
              accept="application/pdf,image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <span>Attach file</span>
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="Or paste a link (Loom, Google Drive, etc)"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="flex-1 rounded border px-2 py-1 text-sm"
            />
            <Button size="sm" onClick={handleAddLink} disabled={!linkUrl || !submission}>
              Add link
            </Button>
          </div>
          <Button onClick={handleSave} size="sm" disabled={upsert.isPending}>
            {submission ? "Save / Resubmit" : "Submit for review"}
          </Button>
        </div>
      )}
    </div>
  );
}

function FilePreviewRow({
  file,
  canEdit,
  onDelete,
}: {
  file: { id: string; file_type: string; label: string | null; storage_path: string | null; external_url: string | null };
  canEdit: boolean;
  onDelete: () => void;
}) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  if (file.storage_path && !signedUrl) {
    supabase.storage
      .from("learning-track-submissions")
      .createSignedUrl(file.storage_path, 3600)
      .then(({ data }) => data && setSignedUrl(data.signedUrl));
  }
  const href = file.external_url ?? signedUrl ?? "#";
  return (
    <div className="flex items-center justify-between rounded bg-background px-2 py-1 text-xs">
      <a href={href} target="_blank" rel="noreferrer" className="text-primary hover:underline">
        {file.label ?? file.storage_path ?? file.external_url}
      </a>
      {canEdit && (
        <button onClick={onDelete} aria-label="Remove">
          <Trash2 className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Build, commit**

```bash
npm run build
git add src/components/learning-track/SubmissionPanel.tsx
git commit -m "Submission panel now uploads files to Supabase storage and tracks review status"
git push origin main
```

### Task 4.5: Delete legacy components

**Files:**
- Delete: `src/components/learning-track/AssignmentChecklist.tsx`
- Delete: `src/components/learning-track/AssignmentSubmissionPanel.tsx`
- Delete: `src/components/learning-track/TrackItemRow.tsx`
- Delete: `src/components/learning-track/TrackPhaseSection.tsx`
- Delete: `src/hooks/useAssignmentOverrides.ts`
- Delete: `src/hooks/useAssignmentProgress.ts`
- Delete: `src/hooks/useAssignmentSubmissions.ts`
- Delete: `src/hooks/useLearningTrackContent.ts`
- Delete: `src/hooks/useLearningTrackProgress.ts` (the legacy localStorage one — the Supabase version lives at `src/hooks/learning-track/useLearningTrackProgress.ts`)
- Modify: `src/pages/LearningTrack.tsx` (remove all imports of deleted files)

**Prerequisite:** Phases 5 and 6 must be complete (so nothing imports the legacy files). Run this AFTER `PreRnf.tsx` and `PostRnf.tsx` have replaced all references.

- [ ] **Step 1: Search for any remaining imports**

```bash
rg -l "AssignmentChecklist|AssignmentSubmissionPanel|TrackItemRow|TrackPhaseSection|useAssignmentOverrides|useAssignmentProgress|useAssignmentSubmissions|useLearningTrackContent" src/
# Expected: only the files about to be deleted, nothing else
```

If anything outside the delete list shows up, fix those imports first.

- [ ] **Step 2: Delete the files**

```bash
rm src/components/learning-track/AssignmentChecklist.tsx \
   src/components/learning-track/AssignmentSubmissionPanel.tsx \
   src/components/learning-track/TrackItemRow.tsx \
   src/components/learning-track/TrackPhaseSection.tsx \
   src/hooks/useAssignmentOverrides.ts \
   src/hooks/useAssignmentProgress.ts \
   src/hooks/useAssignmentSubmissions.ts \
   src/hooks/useLearningTrackContent.ts \
   src/hooks/useLearningTrackProgress.ts
```

- [ ] **Step 3: Build, commit**

```bash
npm run build
git add -A
git commit -m "Removed legacy localStorage-backed learning track components and hooks"
git push origin main
```

---

## Phase 5 — Pre-RNF page

### Task 5.1: Implement `PreRnf.tsx` using shared components

**Files:**
- Modify: `src/pages/learning-track/PreRnf.tsx`

- [ ] **Step 1: Replace the stub**

```tsx
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { useLearningTrackPhases } from "@/hooks/learning-track/useLearningTrackPhases";
import { useLearningTrackProgress } from "@/hooks/learning-track/useLearningTrackProgress";
import { PhaseSection } from "@/components/learning-track/PhaseSection";

export default function PreRnfTrack() {
  const { itemId } = useParams<{ itemId?: string }>();
  const { user } = useSimplifiedAuth();
  const phasesQuery = useLearningTrackPhases("pre_rnf");
  const { isCompleted } = useLearningTrackProgress(user?.id);

  if (phasesQuery.isLoading) {
    return <Loader2 className="h-6 w-6 animate-spin" />;
  }

  return (
    <div className="space-y-4">
      {(phasesQuery.data ?? []).map((phase) => (
        <PhaseSection
          key={phase.id}
          phase={phase}
          isCompleted={isCompleted}
          defaultOpen
          expandedItemId={itemId}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Test deep link**

```bash
npm run dev
```

- Visit `/learning-track/pre-rnf` — phases render with checkboxes
- Visit `/learning-track/pre-rnf/<actual-uuid>` — page scrolls to and expands that item
- Toggle a checkbox — refresh — state persists from Supabase

- [ ] **Step 3: Commit**

```bash
git add src/pages/learning-track/PreRnf.tsx
git commit -m "Pre-RNF training track now renders phases from Supabase with deep link support"
git push origin main
```

---

## Phase 6 — Post-RNF page

### Task 6.1: Implement `PostRnf.tsx` using shared components

**Files:**
- Modify: `src/pages/learning-track/PostRnf.tsx`

- [ ] **Step 1: Replace the stub** — identical to `PreRnf.tsx` except `useLearningTrackPhases("post_rnf")`

```tsx
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { useLearningTrackPhases } from "@/hooks/learning-track/useLearningTrackPhases";
import { useLearningTrackProgress } from "@/hooks/learning-track/useLearningTrackProgress";
import { PhaseSection } from "@/components/learning-track/PhaseSection";

export default function PostRnfTrack() {
  const { itemId } = useParams<{ itemId?: string }>();
  const { user } = useSimplifiedAuth();
  const phasesQuery = useLearningTrackPhases("post_rnf");
  const { isCompleted } = useLearningTrackProgress(user?.id);

  if (phasesQuery.isLoading) return <Loader2 className="h-6 w-6 animate-spin" />;

  return (
    <div className="space-y-4">
      {(phasesQuery.data ?? []).map((phase) => (
        <PhaseSection
          key={phase.id}
          phase={phase}
          isCompleted={isCompleted}
          defaultOpen
          expandedItemId={itemId}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Verify** — `/learning-track/post-rnf` renders the 5 new phases with 26 items grouped per the spec.

- [ ] **Step 3: Commit**

```bash
git add src/pages/learning-track/PostRnf.tsx
git commit -m "Post-RNF training track now renders 5 new phases grouping the 26 assignments"
git push origin main
```

---

## Phase 7 — One-time localStorage migration

### Task 7.1: Build the migration helper

**Files:**
- Create: `src/lib/learning-track/migrateLocalProgress.ts`
- Modify: `src/App.tsx` or a top-level provider to invoke it once after auth

- [ ] **Step 1: Write the migration function**

```ts
// src/lib/learning-track/migrateLocalProgress.ts
import { supabase } from "@/integrations/supabase/client";

const FLAG_KEY = "lt-migration-complete";
const PROGRESS_KEYS = ["learning-track-progress", "learning-track-assignments"];
const SUBMISSIONS_KEY = "learning-track-assignment-submissions";

export async function migrateLocalProgress(userId: string): Promise<void> {
  if (localStorage.getItem(FLAG_KEY) === "1") return;

  const localProgress: Record<string, { completed?: boolean; completedAt?: string }> = {};
  for (const key of PROGRESS_KEYS) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      Object.assign(localProgress, JSON.parse(raw));
    } catch {
      // ignore parse errors
    }
  }

  const completedLegacyIds = Object.entries(localProgress)
    .filter(([, v]) => v?.completed)
    .map(([id]) => id);

  if (completedLegacyIds.length > 0) {
    const { data: items, error } = await supabase
      .from("learning_track_items")
      .select("id, legacy_id")
      .in("legacy_id", completedLegacyIds);
    if (error) throw error;

    const rows = (items ?? []).map((row) => ({
      user_id: userId,
      item_id: row.id,
      status: "completed",
      completed_at: localProgress[row.legacy_id!]?.completedAt ?? new Date().toISOString(),
    }));
    if (rows.length > 0) {
      const { error: upsertErr } = await supabase
        .from("learning_track_progress")
        .upsert(rows, { onConflict: "user_id,item_id" });
      if (upsertErr) throw upsertErr;
    }
  }

  // Submissions: only url/loom/text types from local — files were never actually uploaded
  try {
    const raw = localStorage.getItem(SUBMISSIONS_KEY);
    if (raw) {
      const local: Record<string, { remarks?: string; files?: Array<{ type: string; url?: string; text?: string; label?: string }> }> = JSON.parse(raw);
      const legacyIds = Object.keys(local);
      if (legacyIds.length > 0) {
        const { data: items } = await supabase
          .from("learning_track_items")
          .select("id, legacy_id")
          .in("legacy_id", legacyIds);
        const idMap = new Map((items ?? []).map((i) => [i.legacy_id!, i.id]));
        for (const [legacyId, payload] of Object.entries(local)) {
          const itemId = idMap.get(legacyId);
          if (!itemId) continue;
          const { data: subRow, error: subErr } = await supabase
            .from("learning_track_submissions")
            .upsert(
              { user_id: userId, item_id: itemId, remarks: payload.remarks ?? null, review_status: "pending" },
              { onConflict: "user_id,item_id" }
            )
            .select("id")
            .single();
          if (subErr) continue;
          for (const f of payload.files ?? []) {
            if (f.type === "url" || f.type === "loom") {
              await supabase.from("learning_track_submission_files").insert({
                submission_id: subRow.id,
                file_type: f.type,
                external_url: f.url ?? null,
                label: f.label ?? null,
              });
            } else if (f.type === "text") {
              await supabase.from("learning_track_submission_files").insert({
                submission_id: subRow.id,
                file_type: "text",
                content_text: f.text ?? null,
                label: f.label ?? null,
              });
            }
          }
        }
      }
    }
  } catch {
    // ignore
  }

  localStorage.setItem(FLAG_KEY, "1");
  PROGRESS_KEYS.forEach((k) => localStorage.removeItem(k));
  localStorage.removeItem(SUBMISSIONS_KEY);
}
```

- [ ] **Step 2: Invoke once after auth resolves**

In `src/hooks/useSimplifiedAuth.tsx` (or a small `useEffect` in `App.tsx`):

```tsx
useEffect(() => {
  if (user?.id) {
    migrateLocalProgress(user.id).catch((err) =>
      console.error("Learning track migration failed:", err)
    );
  }
}, [user?.id]);
```

- [ ] **Step 3: Build, commit**

```bash
npm run build
git add src/lib/learning-track/migrateLocalProgress.ts src/hooks/useSimplifiedAuth.tsx
git commit -m "Existing localStorage progress now migrates to Supabase on first authenticated load"
git push origin main
```

---

## Phase 8 — Admin dashboard

### Task 8.1: Build `AdminLayout.tsx` with the admin tab strip

**Files:**
- Modify: `src/pages/learning-track/admin/AdminLayout.tsx`

- [ ] **Step 1: Implement**

```tsx
import { NavLink, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";

const tab = "px-4 py-2 text-sm font-medium border-b-2 border-transparent hover:text-foreground";
const active = "border-primary text-foreground";

export default function AdminLayout() {
  return (
    <div className="space-y-4">
      <nav className="flex gap-1 border-b">
        <NavLink to="roster" className={({ isActive }) => cn(tab, isActive && active)}>
          Roster
        </NavLink>
        <NavLink to="heatmap" className={({ isActive }) => cn(tab, isActive && active)}>
          Heatmap
        </NavLink>
        <NavLink to="submissions" className={({ isActive }) => cn(tab, isActive && active)}>
          Submissions
        </NavLink>
      </nav>
      <Outlet />
    </div>
  );
}
```

- [ ] **Step 2: Build, commit**

```bash
npm run build
git add src/pages/learning-track/admin/AdminLayout.tsx
git commit -m "Admin dashboard now has a tab strip linking roster, heatmap, and submissions"
git push origin main
```

### Task 8.2: Build the Roster view

**Files:**
- Modify: `src/pages/learning-track/admin/Roster.tsx`
- Create: `src/hooks/learning-track/useLearningTrackRoster.ts`

- [ ] **Step 1: Hook**

```ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RosterRow {
  user_id: string;
  display_name: string;
  pre_rnf_progress_pct: number;
  post_rnf_progress_pct: number;
  pending_submissions: number;
  last_activity: string | null;
}

export function useLearningTrackRoster() {
  return useQuery<RosterRow[]>({
    queryKey: ["learning-track-roster"],
    staleTime: 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_learning_track_roster");
      if (error) throw error;
      return data as RosterRow[];
    },
  });
}
```

- [ ] **Step 2: Page**

```tsx
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useLearningTrackRoster } from "@/hooks/learning-track/useLearningTrackRoster";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

export default function Roster() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useLearningTrackRoster();

  if (isLoading) return <Loader2 className="h-6 w-6 animate-spin" />;
  if (error) return <div className="text-destructive">Failed to load roster</div>;

  return (
    <div className="overflow-x-auto rounded border">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Pre-RNF</th>
            <th className="p-3 text-left">Post-RNF</th>
            <th className="p-3 text-left">Pending</th>
            <th className="p-3 text-left">Last active</th>
          </tr>
        </thead>
        <tbody>
          {(data ?? []).map((r) => (
            <tr
              key={r.user_id}
              className="cursor-pointer border-t hover:bg-muted/50"
              onClick={() => navigate(`/learning-track/admin/recruit/${r.user_id}`)}
            >
              <td className="p-3">{r.display_name}</td>
              <td className="p-3 w-40">
                <Progress value={r.pre_rnf_progress_pct} />
                <span className="text-xs text-muted-foreground">{r.pre_rnf_progress_pct}%</span>
              </td>
              <td className="p-3 w-40">
                <Progress value={r.post_rnf_progress_pct} />
                <span className="text-xs text-muted-foreground">{r.post_rnf_progress_pct}%</span>
              </td>
              <td className="p-3">{r.pending_submissions}</td>
              <td className="p-3">
                {r.last_activity ? formatDistanceToNow(new Date(r.last_activity), { addSuffix: true }) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 3: Build, commit**

```bash
npm run build
git add src/hooks/learning-track/useLearningTrackRoster.ts src/pages/learning-track/admin/Roster.tsx
git commit -m "Admin roster now shows every recruit with their progress and pending submissions"
git push origin main
```

### Task 8.3: Build the Heatmap view

**Files:**
- Modify: `src/pages/learning-track/admin/Heatmap.tsx`
- Create: `src/hooks/learning-track/useLearningTrackHeatmap.ts`

- [ ] **Step 1: Hook**

```ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface HeatmapCell {
  user_id: string;
  display_name: string;
  phase_id: string;
  phase_title: string;
  track: "pre_rnf" | "post_rnf";
  completed_count: number;
  total_count: number;
}

export function useLearningTrackHeatmap() {
  return useQuery<HeatmapCell[]>({
    queryKey: ["learning-track-heatmap"],
    staleTime: 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_learning_track_heatmap");
      if (error) throw error;
      return data as HeatmapCell[];
    },
  });
}
```

- [ ] **Step 2: Page — render two side-by-side grids**

```tsx
import { useMemo } from "react";
import { useLearningTrackHeatmap } from "@/hooks/learning-track/useLearningTrackHeatmap";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

function cellColor(pct: number) {
  if (pct === 0) return "bg-gray-200";
  if (pct < 33) return "bg-red-300";
  if (pct < 66) return "bg-amber-300";
  if (pct < 100) return "bg-green-300";
  return "bg-green-600";
}

export default function Heatmap() {
  const { data, isLoading } = useLearningTrackHeatmap();

  const grids = useMemo(() => {
    const make = (track: "pre_rnf" | "post_rnf") => {
      const cells = (data ?? []).filter((c) => c.track === track);
      const phases = Array.from(
        new Map(cells.map((c) => [c.phase_id, c.phase_title])).entries()
      );
      const recruits = Array.from(
        new Map(cells.map((c) => [c.user_id, c.display_name])).entries()
      );
      return { phases, recruits, cells };
    };
    return { pre: make("pre_rnf"), post: make("post_rnf") };
  }, [data]);

  if (isLoading) return <Loader2 className="h-6 w-6 animate-spin" />;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {(["pre", "post"] as const).map((key) => {
        const grid = grids[key];
        return (
          <div key={key}>
            <h3 className="mb-2 text-sm font-semibold uppercase">{key === "pre" ? "Pre-RNF" : "Post-RNF"}</h3>
            <table className="w-full border text-xs">
              <thead>
                <tr>
                  <th className="border px-2 py-1 text-left">Recruit</th>
                  {grid.phases.map(([id, title]) => (
                    <th key={id} className="border px-2 py-1" title={title}>
                      P{grid.phases.findIndex(([pid]) => pid === id) + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grid.recruits.map(([uid, name]) => (
                  <tr key={uid}>
                    <td className="border px-2 py-1">
                      <Link to={`/learning-track/admin/recruit/${uid}`} className="hover:underline">
                        {name}
                      </Link>
                    </td>
                    {grid.phases.map(([pid]) => {
                      const cell = grid.cells.find((c) => c.user_id === uid && c.phase_id === pid);
                      const pct = cell && cell.total_count > 0 ? Math.round((cell.completed_count / cell.total_count) * 100) : 0;
                      return (
                        <td
                          key={pid}
                          className={cn("border px-2 py-1 text-center", cellColor(pct))}
                          title={cell ? `${cell.completed_count}/${cell.total_count}` : ""}
                        >
                          {pct}%
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Build, commit**

```bash
npm run build
git add src/hooks/learning-track/useLearningTrackHeatmap.ts src/pages/learning-track/admin/Heatmap.tsx
git commit -m "Admin heatmap now shows recruit-by-phase completion across both tracks"
git push origin main
```

### Task 8.4: Build the Submissions queue

**Files:**
- Modify: `src/pages/learning-track/admin/Submissions.tsx`
- Create: `src/hooks/learning-track/useAdminSubmissions.ts`

- [ ] **Step 1: Hook for listing + reviewing**

```ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ReviewStatus } from "@/types/learning-track";

export function useAdminSubmissions(filterStatus: ReviewStatus | "all") {
  return useQuery({
    queryKey: ["admin-submissions", filterStatus],
    staleTime: 30 * 1000,
    queryFn: async () => {
      let query = supabase
        .from("learning_track_submissions")
        .select(`
          id, user_id, item_id, remarks, submitted_at, review_status, review_feedback,
          item:learning_track_items(id, title, phase:learning_track_phases(title, track)),
          user:profiles(id, display_name),
          files:learning_track_submission_files(*)
        `)
        .order("submitted_at", { ascending: true });
      if (filterStatus !== "all") query = query.eq("review_status", filterStatus);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useReviewSubmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      submissionId: string;
      action: "approve" | "request_changes";
      feedback?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("learning_track_submissions")
        .update({
          review_status: params.action === "approve" ? "approved" : "changes_requested",
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
          review_feedback: params.feedback ?? null,
        })
        .eq("id", params.submissionId);
      if (error) throw error;
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["admin-submissions"] });
      qc.invalidateQueries({ queryKey: ["learning-track-roster"] });
    },
  });
}
```

- [ ] **Step 2: Two-pane page**

```tsx
import { useState } from "react";
import { useAdminSubmissions, useReviewSubmission } from "@/hooks/learning-track/useAdminSubmissions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import type { ReviewStatus } from "@/types/learning-track";

export default function Submissions() {
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | "all">("pending");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const { data, isLoading } = useAdminSubmissions(statusFilter);
  const review = useReviewSubmission();

  const selected = data?.find((s: any) => s.id === selectedId);

  return (
    <div className="grid grid-cols-[300px_1fr] gap-4 h-[calc(100vh-200px)]">
      <aside className="overflow-y-auto rounded border">
        <div className="border-b p-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full rounded border p-1 text-sm"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="changes_requested">Changes requested</option>
            <option value="all">All</option>
          </select>
        </div>
        {isLoading ? (
          <Loader2 className="m-4 h-4 w-4 animate-spin" />
        ) : (
          (data ?? []).map((s: any) => (
            <button
              key={s.id}
              onClick={() => {
                setSelectedId(s.id);
                setFeedback(s.review_feedback ?? "");
              }}
              className={`w-full border-b p-2 text-left text-xs hover:bg-muted ${selectedId === s.id ? "bg-muted" : ""}`}
            >
              <div className="font-medium">{s.user?.display_name}</div>
              <div className="text-muted-foreground">{s.item?.title}</div>
              <div className="text-muted-foreground">{new Date(s.submitted_at).toLocaleString()}</div>
            </button>
          ))
        )}
      </aside>

      <section className="overflow-y-auto rounded border p-4">
        {!selected ? (
          <div className="text-sm text-muted-foreground">Select a submission</div>
        ) : (
          <div className="space-y-4">
            <header>
              <h2 className="text-lg font-semibold">{selected.item?.title}</h2>
              <div className="text-sm text-muted-foreground">
                {selected.user?.display_name} · {new Date(selected.submitted_at).toLocaleString()}
              </div>
            </header>
            {selected.remarks && (
              <div>
                <h3 className="text-sm font-semibold">Remarks</h3>
                <div className="whitespace-pre-wrap text-sm">{selected.remarks}</div>
              </div>
            )}
            {selected.files?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold">Attachments</h3>
                <ul className="text-sm">
                  {selected.files.map((f: any) => (
                    <li key={f.id}>
                      {f.external_url ? (
                        <a href={f.external_url} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                          {f.label ?? f.external_url}
                        </a>
                      ) : (
                        <span>{f.label ?? f.storage_path}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Reviewer feedback (markdown)</label>
              <Textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={4} />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => review.mutate({ submissionId: selected.id, action: "approve", feedback })}
                  disabled={review.isPending}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => review.mutate({ submissionId: selected.id, action: "request_changes", feedback })}
                  disabled={review.isPending || !feedback}
                >
                  Request changes
                </Button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
```

- [ ] **Step 3: Build, commit**

```bash
npm run build
git add src/hooks/learning-track/useAdminSubmissions.ts src/pages/learning-track/admin/Submissions.tsx
git commit -m "Admin submissions queue now lets reviewers approve or request changes inline"
git push origin main
```

### Task 8.5: Build the Recruit drill-down

**Files:**
- Modify: `src/pages/learning-track/admin/RecruitDetail.tsx`

- [ ] **Step 1: Implement using shared components in `viewAsUserId` mode**

```tsx
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLearningTrackPhases } from "@/hooks/learning-track/useLearningTrackPhases";
import { useLearningTrackProgress } from "@/hooks/learning-track/useLearningTrackProgress";
import { PhaseSection } from "@/components/learning-track/PhaseSection";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export default function RecruitDetail() {
  const { userId } = useParams<{ userId: string }>();
  const [track, setTrack] = useState<"pre_rnf" | "post_rnf">("pre_rnf");

  const profile = useQuery({
    queryKey: ["profile", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, created_at")
        .eq("id", userId!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const phasesQuery = useLearningTrackPhases(track);
  const { isCompleted } = useLearningTrackProgress(userId);

  if (profile.isLoading || phasesQuery.isLoading) return <Loader2 className="h-6 w-6 animate-spin" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/learning-track/admin/roster" className="text-sm text-muted-foreground hover:underline">
            ← Back to roster
          </Link>
          <h2 className="text-xl font-bold">{profile.data?.display_name}</h2>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setTrack("pre_rnf")}
          className={`rounded px-3 py-1 text-sm ${track === "pre_rnf" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
        >
          Pre-RNF
        </button>
        <button
          onClick={() => setTrack("post_rnf")}
          className={`rounded px-3 py-1 text-sm ${track === "post_rnf" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
        >
          Post-RNF
        </button>
      </div>
      <div className="space-y-3">
        {(phasesQuery.data ?? []).map((phase) => (
          <PhaseSection
            key={phase.id}
            phase={phase}
            isCompleted={isCompleted}
            readOnly
            viewAsUserId={userId}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build, commit**

```bash
npm run build
git add src/pages/learning-track/admin/RecruitDetail.tsx
git commit -m "Admin can now drill into a single recruit's full learning track in read-only mode"
git push origin main
```

---

## Phase 9 — Prominence

### Task 9.1: Dashboard hero card

**Files:**
- Create: `src/components/learning-track/LearningTrackHeroCard.tsx`
- Modify: `src/pages/Index.tsx` (mount the card at the top)

- [ ] **Step 1: Implement**

```tsx
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { useLearningTrackOverallProgress } from "@/hooks/learning-track/useLearningTrackOverallProgress";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

export function LearningTrackHeroCard() {
  const { user } = useSimplifiedAuth();
  const navigate = useNavigate();
  const { data, isLoading } = useLearningTrackOverallProgress(user?.id);

  if (!user || isLoading || !data) return null;

  if (data.combinedPct === 100) {
    return (
      <div className="rounded-lg border bg-green-50 dark:bg-green-950/20 p-3 flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <span className="text-sm">Learning track complete</span>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Your Learning Track</h2>
        <span className="text-sm text-muted-foreground">{data.combinedPct}%</span>
      </div>
      <Progress value={data.combinedPct} className="mb-4" />
      {data.nextItem && (
        <p className="mb-4 text-sm">
          <span className="text-muted-foreground">Next up: </span>
          <span className="font-medium">{data.nextItem.title}</span>
        </p>
      )}
      <Button
        onClick={() =>
          navigate(
            data.nextItem
              ? `/learning-track/${data.nextItem.track === "pre_rnf" ? "pre-rnf" : "post-rnf"}/${data.nextItem.id}`
              : "/learning-track/pre-rnf"
          )
        }
      >
        Continue <ArrowRight className="ml-1 h-4 w-4" />
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: Mount in `Index.tsx` above existing dashboard content**

- [ ] **Step 3: Build, commit**

```bash
npm run build
git add src/components/learning-track/LearningTrackHeroCard.tsx src/pages/Index.tsx
git commit -m "Dashboard now shows a learning track hero card with progress and next-item CTA"
git push origin main
```

### Task 9.2: Sidebar promotion + progress badge

**Files:**
- Modify: `src/components/layout/AppSidebar.tsx` (around line 141 per spec)
- Modify: `src/components/layout/MobileBottomNav.tsx`

- [ ] **Step 1: Move "Learning Track" to top of `allMainNavItems` array**

Find the existing entry in `AppSidebar.tsx:141` and move it to be the first item in the main nav array.

- [ ] **Step 2: Add a small progress ring next to the icon**

Use a tiny SVG progress ring (or recharts `RadialBarChart` if already imported elsewhere — check before adding new deps). Reuses `useLearningTrackOverallProgress`.

```tsx
// inline component within AppSidebar.tsx
function LtBadge() {
  const { user } = useSimplifiedAuth();
  const { data } = useLearningTrackOverallProgress(user?.id);
  const pct = data?.combinedPct ?? 0;
  if (pct === 100 || pct === 0) return null;
  return <span className="ml-auto text-xs text-muted-foreground">{pct}%</span>;
}
```

Render `<LtBadge />` inside the Learning Track nav row.

- [ ] **Step 3: Repeat for `MobileBottomNav.tsx`**

- [ ] **Step 4: Build, commit**

```bash
npm run build
git add src/components/layout/AppSidebar.tsx src/components/layout/MobileBottomNav.tsx
git commit -m "Learning Track now sits at the top of the sidebar with a progress badge"
git push origin main
```

### Task 9.3: Zero-progress redirect

Already handled by `LearningTrackRedirect` from Task 1.1, but the trigger needs to fire from `/` (Dashboard) not just `/learning-track`. Add a soft check to `Index.tsx`.

**Files:**
- Modify: `src/pages/Index.tsx`

- [ ] **Step 1: Add the redirect effect**

```tsx
// inside Index.tsx component body
const { user } = useSimplifiedAuth();
const { isAdmin, isMasterAdmin } = usePermissions();
const { data: overall } = useLearningTrackOverallProgress(user?.id);
const navigate = useNavigate();

useEffect(() => {
  if (!user || isAdmin() || isMasterAdmin() || !overall) return;
  const dismissed = localStorage.getItem("lt-redirect-dismissed") === "1";
  if (overall.totalCompleted === 0 && !dismissed) {
    navigate("/learning-track/pre-rnf", { replace: true });
  }
}, [user, overall, isAdmin, isMasterAdmin, navigate]);
```

- [ ] **Step 2: Add a "Go to dashboard instead" link in `LearningTrackHeroCard.tsx`** that calls `localStorage.setItem("lt-redirect-dismissed", "1")` so subsequent visits don't redirect.

- [ ] **Step 3: Build, commit**

```bash
npm run build
git add src/pages/Index.tsx src/components/learning-track/LearningTrackHeroCard.tsx
git commit -m "First-time recruits with zero progress now land directly on the learning track"
git push origin main
```

---

## Phase 10 — Resources hub

### Task 10.1: Build the TF-IDF resource index

**Files:**
- Create: `src/lib/learning-track/resourceIndex.ts`

This is a build-time index of all in-app resources (products, KB pages, scripts, concept cards) plus runtime fetch of `obsidian_resources`.

- [ ] **Step 1: Static index from in-app data**

```ts
// src/lib/learning-track/resourceIndex.ts
import { supabase } from "@/integrations/supabase/client";

export type ResourceKind = "product" | "kb" | "script" | "concept_card" | "video" | "obsidian_doc" | "notebooklm";
export interface IndexedResource {
  id: string;
  kind: ResourceKind;
  title: string;
  body: string;
  href: string;
}

const STOPWORDS = new Set(["the", "a", "an", "and", "or", "of", "to", "in", "for", "on", "with", "is", "are", "be"]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

let cachedIndex: IndexedResource[] | null = null;

export async function buildResourceIndex(): Promise<IndexedResource[]> {
  if (cachedIndex) return cachedIndex;

  const out: IndexedResource[] = [];

  // Products
  const { data: products } = await supabase.from("products").select("id, name, description, slug");
  (products ?? []).forEach((p) =>
    out.push({
      id: `product:${p.id}`,
      kind: "product",
      title: p.name,
      body: p.description ?? "",
      href: `/product/${p.slug ?? p.id}`,
    })
  );

  // Obsidian docs (only shareable visible to non-admins; the RLS handles it)
  const { data: obsidian } = await supabase.from("obsidian_resources").select("id, title, body_md, category");
  (obsidian ?? []).forEach((o) =>
    out.push({
      id: `obsidian:${o.id}`,
      kind: "obsidian_doc",
      title: o.title,
      body: o.body_md.slice(0, 5000),
      href: `/learning-track/resources?doc=${o.id}`,
    })
  );

  cachedIndex = out;
  return out;
}

export async function suggestResources(query: string, limit = 5): Promise<IndexedResource[]> {
  const index = await buildResourceIndex();
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  const scored = index
    .map((r) => {
      const tokens = tokenize(`${r.title} ${r.body}`);
      const tokenSet = new Set(tokens);
      const score = queryTokens.reduce((acc, q) => acc + (tokenSet.has(q) ? 1 : 0), 0);
      return { resource: r, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map((s) => s.resource);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/learning-track/resourceIndex.ts
git commit -m "Resource index now matches learning items to products, obsidian docs, and other in-app resources"
git push origin main
```

### Task 10.2: Build `<RelatedResources />`

**Files:**
- Create: `src/components/learning-track/RelatedResources.tsx`

- [ ] **Step 1: Implement**

```tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { suggestResources, type IndexedResource } from "@/lib/learning-track/resourceIndex";
import type { LearningTrackItem } from "@/types/learning-track";

interface Props {
  item: LearningTrackItem;
}

export function RelatedResources({ item }: Props) {
  const [suggestions, setSuggestions] = useState<IndexedResource[]>([]);

  useEffect(() => {
    const queryText = [item.title, item.description ?? "", ...(item.objectives ?? [])].join(" ");
    suggestResources(queryText)
      .then((results) => {
        const filtered = results.filter((r) => !item.hidden_resources.includes(r.id));
        setSuggestions(filtered);
      })
      .catch(() => setSuggestions([]));
  }, [item]);

  const curated = item.content_blocks.filter((b) => b.block_type === "resource_ref");

  if (suggestions.length === 0 && curated.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold">Related resources</h4>
      <div className="grid gap-2 sm:grid-cols-2">
        {curated.map((b) => (
          <a
            key={b.id}
            href={b.url ?? "#"}
            className="rounded border bg-background p-2 text-xs hover:bg-muted"
            target={b.url?.startsWith("http") ? "_blank" : undefined}
            rel="noreferrer"
          >
            <div className="font-medium">{b.title ?? "Curated resource"}</div>
          </a>
        ))}
        {suggestions.map((r) => (
          <Link
            key={r.id}
            to={r.href}
            className="rounded border bg-background p-2 text-xs hover:bg-muted"
          >
            <div className="text-muted-foreground">{r.kind}</div>
            <div className="font-medium">{r.title}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build, commit**

```bash
npm run build
git add src/components/learning-track/RelatedResources.tsx
git commit -m "Each learning item now shows auto-suggested related resources alongside curated ones"
git push origin main
```

### Task 10.3: Resources hub page

**Files:**
- Modify: `src/pages/learning-track/Resources.tsx`

- [ ] **Step 1: Build a tabbed browse view**

```tsx
import { useEffect, useState } from "react";
import { buildResourceIndex, type IndexedResource } from "@/lib/learning-track/resourceIndex";
import { Link } from "react-router-dom";

export default function Resources() {
  const [index, setIndex] = useState<IndexedResource[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    buildResourceIndex().then(setIndex);
  }, []);

  const filtered = index
    .filter((r) => filter === "all" || r.kind === filter)
    .filter((r) => !search || r.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search resources..."
          className="flex-1 rounded border p-2 text-sm"
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded border p-2 text-sm">
          <option value="all">All</option>
          <option value="product">Products</option>
          <option value="obsidian_doc">Reference docs</option>
          <option value="script">Scripts</option>
          <option value="concept_card">Concept cards</option>
        </select>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((r) => (
          <Link key={r.id} to={r.href} className="rounded border p-3 hover:bg-muted">
            <div className="text-xs uppercase text-muted-foreground">{r.kind.replace("_", " ")}</div>
            <div className="font-medium">{r.title}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build, commit**

```bash
npm run build
git add src/pages/learning-track/Resources.tsx
git commit -m "Resource hub page now lets recruits browse all in-app and Obsidian resources"
git push origin main
```

---

## Phase 11 — Obsidian sync

### Task 11.1: Write `tools/sync_obsidian_resources.py`

**Files:**
- Create: `tools/sync_obsidian_resources.py`
- Modify: `aia-product-compass-hub/.env` (add `OBSIDIAN_VAULT_PATH` if not already present)

- [ ] **Step 1: Implement**

```python
#!/usr/bin/env python3
"""Sync selected Obsidian vault folders into the obsidian_resources Supabase table.

Usage:
    OBSIDIAN_VAULT_PATH="/Users/leo/Documents/Obsidian Vault" \
    SUPABASE_URL="https://hgdbflprrficdoyxmdxe.supabase.co" \
    SUPABASE_SERVICE_ROLE_KEY="..." \
    python3 tools/sync_obsidian_resources.py

Reads frontmatter for `shareable: true` to mark a doc visible to non-admins.
"""

import os
import sys
import re
from pathlib import Path
import yaml
from supabase import create_client

VAULT_PATH = os.environ.get("OBSIDIAN_VAULT_PATH")
SUPABASE_URL = os.environ.get("SUPABASE_URL") or os.environ.get("VITE_SUPABASE_URL")
SERVICE_ROLE = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not (VAULT_PATH and SUPABASE_URL and SERVICE_ROLE):
    print("Missing OBSIDIAN_VAULT_PATH / SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY", file=sys.stderr)
    sys.exit(1)

FOLDERS = {
    "References": "reference",
    "Advisor Training Guides": "training_guide",
    "Products": "product_moc",
    "Learning": "learning_moc",
}

FRONTMATTER_RE = re.compile(r"^---\s*\n(.*?)\n---\s*\n(.*)$", re.DOTALL)

def parse(file_path: Path) -> tuple[dict, str]:
    text = file_path.read_text(encoding="utf-8")
    match = FRONTMATTER_RE.match(text)
    if match:
        try:
            fm = yaml.safe_load(match.group(1)) or {}
        except yaml.YAMLError:
            fm = {}
        body = match.group(2)
    else:
        fm = {}
        body = text
    return fm, body

def title_of(file_path: Path, body: str) -> str:
    h1 = re.search(r"^#\s+(.+)$", body, re.MULTILINE)
    if h1:
        return h1.group(1).strip()
    return file_path.stem

def main():
    sb = create_client(SUPABASE_URL, SERVICE_ROLE)
    vault = Path(VAULT_PATH)
    if not vault.exists():
        print(f"Vault not found: {vault}", file=sys.stderr)
        sys.exit(1)

    seen_paths: set[str] = set()
    added = updated = removed = 0

    for folder_name, category in FOLDERS.items():
        folder = vault / folder_name
        if not folder.exists():
            print(f"Skipping missing folder: {folder}")
            continue
        for md in folder.rglob("*.md"):
            rel = md.relative_to(vault).as_posix()
            seen_paths.add(rel)
            fm, body = parse(md)
            row = {
                "source_path": rel,
                "category": category,
                "title": fm.get("title") or title_of(md, body),
                "body_md": body,
                "frontmatter": fm,
                "shareable": bool(fm.get("shareable", False)),
            }
            existing = sb.table("obsidian_resources").select("id").eq("source_path", rel).execute()
            if existing.data:
                sb.table("obsidian_resources").update(row).eq("source_path", rel).execute()
                updated += 1
            else:
                sb.table("obsidian_resources").insert(row).execute()
                added += 1

    # Remove rows whose source files no longer exist
    all_rows = sb.table("obsidian_resources").select("id, source_path").execute()
    for r in all_rows.data or []:
        if r["source_path"] not in seen_paths:
            sb.table("obsidian_resources").delete().eq("id", r["id"]).execute()
            removed += 1

    print(f"Done. Added {added}, updated {updated}, removed {removed}, total seen {len(seen_paths)}")

if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Run the initial sync**

```bash
cd /Users/leo/Documents/New\ project
python3 -m pip install supabase pyyaml
OBSIDIAN_VAULT_PATH="/Users/leo/Documents/Obsidian Vault" \
SUPABASE_URL="https://hgdbflprrficdoyxmdxe.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="<from .env>" \
python3 aia-product-compass-hub/tools/sync_obsidian_resources.py
```

Note: the `tools/` folder lives at the workspace root in `New project/tools/`. Place the script there if you prefer cross-project visibility, or in `aia-product-compass-hub/tools/` if it should ship with the repo.

- [ ] **Step 3: Verify in Supabase**

```sql
SELECT category, COUNT(*) FROM obsidian_resources GROUP BY category;
-- Expected counts roughly: training_guide ~70, reference ~2, product_moc ~1, learning_moc ~1
```

- [ ] **Step 4: Commit**

```bash
git add tools/sync_obsidian_resources.py
git commit -m "Obsidian vault now syncs into Supabase obsidian_resources for in-app reference"
git push origin main
```

---

## Phase 12 — QA and verification

### Task 12.1: Build check

- [ ] **Step 1: Run build**

```bash
cd "/Users/leo/Documents/New project/aia-product-compass-hub"
npm run build
```

Expected: clean build, no type errors. Use the `build-check` skill if anything fails.

### Task 12.2: Playwright e2e — recruit flow

**Files:**
- Create: `e2e/learning-track-recruit.spec.ts`

- [ ] **Step 1: Test the recruit happy path**

```ts
import { test, expect } from "@playwright/test";

test("recruit can navigate, complete an item, and submit", async ({ page }) => {
  await page.goto("http://localhost:8080/auth");
  await page.fill('input[name="email"]', "user@demo.com");
  await page.fill('input[name="password"]', "password123");
  await page.click('button[type="submit"]');
  await page.waitForURL(/learning-track/);

  await page.goto("http://localhost:8080/learning-track/pre-rnf");
  await expect(page.locator("h1", { hasText: "Learning Track" })).toBeVisible();

  // Expand first phase, click first item
  const firstItem = page.locator('[id^="item-"]').first();
  await firstItem.locator("button").first().click(); // toggle complete
  await page.reload();
  // The item should still be checked
});
```

Use the actual demo credentials from `src/config/authConfig.ts`.

- [ ] **Step 2: Run**

```bash
npx playwright test e2e/learning-track-recruit.spec.ts
```

- [ ] **Step 3: Commit**

```bash
git add e2e/learning-track-recruit.spec.ts
git commit -m "Playwright covers recruit completion and persistence on the learning track"
git push origin main
```

### Task 12.3: Playwright e2e — admin flow

**Files:**
- Create: `e2e/learning-track-admin.spec.ts`

- [ ] **Step 1: Test admin sees roster, heatmap, submissions**

```ts
import { test, expect } from "@playwright/test";

test("admin can review submissions and drill into a recruit", async ({ page }) => {
  await page.goto("http://localhost:8080/auth");
  await page.fill('input[name="email"]', "admin@demo.com");
  await page.fill('input[name="password"]', "password123");
  await page.click('button[type="submit"]');

  await page.goto("http://localhost:8080/learning-track/admin/roster");
  await expect(page.locator("table")).toBeVisible();

  await page.goto("http://localhost:8080/learning-track/admin/heatmap");
  await expect(page.locator("h3", { hasText: "Pre-RNF" })).toBeVisible();

  await page.goto("http://localhost:8080/learning-track/admin/submissions");
  await expect(page.locator("aside select")).toBeVisible();
});
```

- [ ] **Step 2: Run, commit**

```bash
npx playwright test e2e/learning-track-admin.spec.ts
git add e2e/learning-track-admin.spec.ts
git commit -m "Playwright covers admin roster, heatmap, and submissions queue"
git push origin main
```

### Task 12.4: Mobile viewport check

- [ ] **Step 1: Run the recruit spec at mobile viewport**

```bash
npx playwright test e2e/learning-track-recruit.spec.ts --viewport-size=375x812
```

Verify no horizontal overflow, all components stack cleanly.

### Task 12.5: Final smoke

- [ ] **Step 1: Manual walkthrough**

1. Sign in as a fresh user with no progress → expect redirect to `/learning-track/pre-rnf`
2. Complete one item → reload → state persists
3. Submit a file → log out → log back in → submission still attached
4. Sign in as admin → roster shows the new user → click their row → see drill-down
5. Approve their submission → recruit's view shows green badge

- [ ] **Step 2: Mark plan complete**

The plan is done when all 12 phases are committed and all checkboxes ticked.

---

## Summary of files created or modified

**New components (8):**
- `src/components/learning-track/PhaseSection.tsx`
- `src/components/learning-track/LearningItemRow.tsx`
- `src/components/learning-track/ItemContentBlocks.tsx`
- `src/components/learning-track/SubmissionPanel.tsx`
- `src/components/learning-track/RelatedResources.tsx`
- `src/components/learning-track/LearningTrackHeroCard.tsx`
- `src/components/learning-track/LearningTrackRedirect.tsx`

**New pages (8):**
- `src/pages/learning-track/PreRnf.tsx`
- `src/pages/learning-track/PostRnf.tsx`
- `src/pages/learning-track/Resources.tsx`
- `src/pages/learning-track/admin/AdminLayout.tsx`
- `src/pages/learning-track/admin/Roster.tsx`
- `src/pages/learning-track/admin/Heatmap.tsx`
- `src/pages/learning-track/admin/Submissions.tsx`
- `src/pages/learning-track/admin/RecruitDetail.tsx`

**New hooks (7):**
- `src/hooks/learning-track/useLearningTrackPhases.ts`
- `src/hooks/learning-track/useLearningTrackProgress.ts`
- `src/hooks/learning-track/useLearningTrackSubmissions.ts`
- `src/hooks/learning-track/useLearningTrackOverallProgress.ts`
- `src/hooks/learning-track/useLearningTrackRoster.ts`
- `src/hooks/learning-track/useLearningTrackHeatmap.ts`
- `src/hooks/learning-track/useAdminSubmissions.ts`

**New libs / scripts (3):**
- `src/lib/learning-track/resourceIndex.ts`
- `src/lib/learning-track/migrateLocalProgress.ts`
- `scripts/seed-learning-track.ts`
- `tools/sync_obsidian_resources.py`

**New types (1):**
- `src/types/learning-track.ts`

**Modified:**
- `src/App.tsx` (nested routes)
- `src/pages/LearningTrack.tsx` (URL-driven tab strip)
- `src/pages/Index.tsx` (hero card + zero-progress redirect)
- `src/components/layout/AppSidebar.tsx` (promotion + badge)
- `src/components/layout/MobileBottomNav.tsx` (badge)
- `src/hooks/useSimplifiedAuth.tsx` (migration trigger)

**Deleted (legacy localStorage layer):**
- `src/components/learning-track/AssignmentChecklist.tsx`
- `src/components/learning-track/AssignmentSubmissionPanel.tsx`
- `src/components/learning-track/TrackItemRow.tsx`
- `src/components/learning-track/TrackPhaseSection.tsx`
- `src/hooks/useAssignmentOverrides.ts`
- `src/hooks/useAssignmentProgress.ts`
- `src/hooks/useAssignmentSubmissions.ts`
- `src/hooks/useLearningTrackContent.ts`
- `src/hooks/useLearningTrackProgress.ts`

**Lovable handoffs:**
- Initial migration (already shipped)
- RLS patch for resubmission loop (Task 0.2 — pending)
