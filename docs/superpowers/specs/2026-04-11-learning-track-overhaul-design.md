# Learning Track Overhaul — Design

**Date:** 2026-04-11
**Status:** Approved for planning
**Project:** aia-product-compass-hub

## Goal

Make the `/learning-track` feature the primary onboarding surface for new recruits. Today it is a mid-tier sidebar item with two divergent tabs ("Training Track" and "Assignment Checklist") that store everything in localStorage. After this overhaul:

1. Both tracks share one homogenized layout based on the pre-RNF phase structure.
2. Both tracks group items into named phases.
3. Every item on both tracks can accept submissions.
4. All progress and submissions persist to Supabase, enabling admin monitoring.
5. Admins get a dedicated dashboard to monitor recruit progress (roster + heatmap + submissions queue).
6. The learning track becomes prominently visible to new recruits across three surfaces.
7. Existing in-app resources (Products, KB, Scripts, Concept Cards, Videos) plus selected Obsidian vault content (Sales Bible, Advisor Training Guides) are auto-suggested per learning item.
8. Each subtab has its own URL.

## Non-goals

- Editing the rich content model beyond what existing components already support (text / link / video / resource_ref).
- Notifications to recruits when admin reviews a submission (flagged as a follow-up).
- Vector-embedding semantic search for resource matching (TF-IDF is enough for v1).
- Automating Obsidian vault sync via cron or git hooks (manual script for v1).
- Migrating the existing `/admin` dashboard or reworking general user/system admin.

## 1. Information architecture and routing

### Route tree

```
/learning-track                       → smart redirect
/learning-track/pre-rnf               → pre-RNF phased track
/learning-track/pre-rnf/:itemId       → deep link to a specific item (auto-expanded)
/learning-track/post-rnf              → post-RNF phased track
/learning-track/post-rnf/:itemId      → deep link to a specific item
/learning-track/resources             → recruit resource hub
/learning-track/admin                 → redirects to /learning-track/admin/roster
/learning-track/admin/roster          → recruit roster table
/learning-track/admin/heatmap         → phase-by-recruit heatmap
/learning-track/admin/submissions     → submissions review queue
/learning-track/admin/recruit/:userId → drill-down into one recruit's full progress
```

### Smart redirect logic for `/learning-track`

**App home (`/`):** Zero-progress recruits are **not** auto-redirected from `Index.tsx`. Onboarding is driven by the **dashboard Learning Track hero card** (“Start Learning” → `/learning-track/...`). The former `lt-redirect-dismissed` / Index redirect flow is **superseded** (removed for UX: nav “Home” must match a stable landing).

```
if user is admin:
    navigate to /learning-track/admin/roster
elif pathname is exactly /learning-track (index route):
    navigate to /learning-track/pre-rnf  (React Router <Navigate to="pre-rnf" replace />)
elif localStorage['lt-last-tab'] is set:
    navigate to localStorage['lt-last-tab']
else:
    navigate to /learning-track/pre-rnf
```

### Routing implementation

- React Router v6 nested routes via `<Outlet />` inside a refactored `LearningTrack.tsx`.
- The current shadcn `Tabs` is replaced with a `NavLink`-driven tab strip so URL is the source of truth (browser back/forward and bookmarks work).
- Admin routes guarded by the existing `ProtectedAdminPage` wrapper.
- Item-level deep links (`/learning-track/pre-rnf/:itemId`) auto-expand the matching `<LearningItemRow />` and scroll it into view.

## 2. Data model — Supabase tables

All new tables prefixed `learning_track_*` to avoid collision with the existing `learning_progress` (gamification XP) table. All foreign keys point to `profiles`, never `auth.users`. RLS enabled on every table.

### `learning_track_phases`

Phase definitions for both tracks.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | default `gen_random_uuid()` |
| `track` | text | check in `('pre_rnf','post_rnf')` |
| `order_index` | int | unique per track |
| `title` | text | |
| `description` | text | nullable |
| `created_at`, `updated_at` | timestamptz | default `now()` |

### `learning_track_items`

Items within a phase.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `phase_id` | uuid FK | → `learning_track_phases` cascade |
| `order_index` | int | unique per phase |
| `title` | text | |
| `description` | text | nullable |
| `objectives` | text[] | nullable; pre-RNF rich data |
| `action_items` | text[] | nullable |
| `requires_submission` | bool | default `true` (Q2 — both tracks accept submissions) |
| `hidden_resources` | text[] | default `'{}'`; admin-suppressed auto-suggestions |
| `legacy_id` | text | nullable; original string id from `learningTrackData.ts` for one-time migration |

### `learning_track_content_blocks`

Rich content per item (text / link / video / resource reference).

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `item_id` | uuid FK | → `learning_track_items` cascade |
| `order_index` | int | |
| `block_type` | text | check in `('text','link','video','resource_ref')` |
| `title` | text | nullable |
| `body` | text | nullable; markdown for text blocks |
| `url` | text | nullable; for link/video |
| `resource_type` | text | for resource_ref: `'product'`, `'kb'`, `'script'`, `'concept_card'`, `'video'`, `'obsidian_doc'`, `'notebooklm'` |
| `resource_id` | text | for resource_ref: FK id or external identifier |

### `learning_track_progress`

One row per (user, item).

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid FK | → `profiles` cascade |
| `item_id` | uuid FK | → `learning_track_items` cascade |
| `status` | text | check in `('not_started','in_progress','completed')`, default `'not_started'` |
| `completed_at` | timestamptz | nullable |
| `updated_at` | timestamptz | default `now()` |

Unique constraint on `(user_id, item_id)`. Index on `user_id`.

### `learning_track_submissions`

A recruit's submission for an item.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid FK | → `profiles` cascade |
| `item_id` | uuid FK | → `learning_track_items` cascade |
| `remarks` | text | nullable |
| `submitted_at` | timestamptz | default `now()` |
| `review_status` | text | check in `('pending','approved','changes_requested')`, default `'pending'` |
| `reviewed_at` | timestamptz | nullable |
| `reviewed_by` | uuid FK | → `profiles` set null |
| `review_feedback` | text | nullable |

Indexes on `(user_id, item_id)` and `review_status`.

### `learning_track_submission_files`

Attachments for a submission.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `submission_id` | uuid FK | → `learning_track_submissions` cascade |
| `file_type` | text | check in `('pdf','image','url','loom','text')` |
| `label` | text | nullable |
| `storage_path` | text | nullable; bucket path for uploads |
| `external_url` | text | nullable; for url/loom/text link types |
| `content_text` | text | nullable; for inline text snippets |

### `obsidian_resources`

Hybrid Obsidian vault ingest.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `source_path` | text | unique; e.g. `'References/Pre-Retiree Sales Bible.md'` |
| `category` | text | check in `('reference','training_guide','product_moc','learning_moc','other')` |
| `title` | text | |
| `body_md` | text | |
| `frontmatter` | jsonb | nullable |
| `shareable` | bool | default `false`; non-admins can only see rows where this is `true` |
| `synced_at` | timestamptz | default `now()` |

### Storage bucket

`learning-track-submissions` — private bucket.
- Path convention: `{user_id}/{item_id}/{submission_id}/{filename}`.
- RLS: user can `INSERT/SELECT` objects where `(storage.foldername(name))[1] = auth.uid()::text`. Admins can `SELECT` all. No public read.

### RLS summary

Content tables (`learning_track_phases`, `learning_track_items`, `learning_track_content_blocks`, `obsidian_resources`):
- `SELECT` for any authenticated user. (`obsidian_resources` non-admin select restricted to `shareable = true`.)
- `INSERT/UPDATE/DELETE` restricted to admin or master_admin via the `user_admin_roles` table.

`learning_track_progress`:
- Owner can `SELECT/INSERT/UPDATE` their own rows.
- Admins can `SELECT` all rows.

`learning_track_submissions`:
- Owner can `SELECT` and `INSERT` own rows.
- Owner can `UPDATE` own rows while `review_status IN ('pending','changes_requested')` (locked once admin approves). See RLS follow-up note in §4c — the shipped Lovable migration currently restricts this to `'pending'` only and needs widening.
- Admins can `SELECT` all and `UPDATE` only the review fields (`review_status`, `reviewed_at`, `reviewed_by`, `review_feedback`).

`learning_track_submission_files`:
- Owner can `SELECT/INSERT/DELETE` via join on parent submission ownership; `INSERT/DELETE` only while parent's `review_status IN ('pending','changes_requested')` (see RLS follow-up note in §4c).
- Admins can `SELECT` all.

### RPCs (SECURITY DEFINER, admin-guarded)

**`get_learning_track_roster()`** → table of `(user_id, display_name, pre_rnf_progress_pct, post_rnf_progress_pct, pending_submissions, last_activity)`

Joins `profiles` with `learning_track_progress` aggregated by track, counts pending submissions per user, returns latest `updated_at` as `last_activity`. Powers the admin roster view.

**`get_learning_track_heatmap()`** → table of `(user_id, display_name, phase_id, phase_title, track, completed_count, total_count)`

Cross joins all recruits with all phases, left joins progress + items to compute completion per cell. One row per recruit × phase. Powers the heatmap view.

Both functions check the caller is in `user_admin_roles` with role `'admin'` or `'master_admin'` and `RAISE EXCEPTION` otherwise.

### Lovable handoff

The migration is described in `SUPABASE.md` under "Pending → Learning Track Overhaul — 2026-04-11" and pushed to `origin/main`. Lovable runs the migration; this design assumes the schema is in place before frontend implementation begins.

### One-time client migration

On first authenticated load after the new schema deploys, the app checks for legacy localStorage keys and migrates them:

1. Read `learning-track-progress` and `learning-track-assignments` → upsert into `learning_track_progress` by joining on `learning_track_items.legacy_id`.
2. Read `learning-track-assignment-submissions` → upsert into `learning_track_submissions` and `learning_track_submission_files` (only `url`, `loom`, `text` types, since file uploads were never actually stored).
3. On success, delete the legacy keys and set `localStorage['lt-migration-complete'] = '1'`.
4. The migration is idempotent and safe to re-run if it fails partway.

## 3. Layout homogenization

Both tracks render through the same component stack. Each item has the same anatomy regardless of track.

```
PhaseSection (collapsible)
├── PhaseHeader (title, description, X/Y complete badge)
└── LearningItemRow[] (expandable)
    ├── ItemHeader (checkbox/status, title, status dropdown)
    ├── ItemDescription
    ├── ItemBody (when expanded)
    │   ├── Objectives (bulleted, optional)
    │   ├── ActionItems (bulleted, optional)
    │   ├── ItemContentBlocks
    │   │   ├── TextBlock (markdown)
    │   │   ├── LinkBlock
    │   │   ├── VideoBlock
    │   │   └── ResourceRefBlock (deep-links into app)
    │   ├── RelatedResources (auto-suggested + admin-curated)
    │   └── SubmissionPanel (when requires_submission)
    │       ├── RemarksTextarea
    │       ├── AttachmentsList (pdf/image/url/loom/text, max 5)
    │       ├── SubmitButton
    │       ├── ReviewStatusBadge
    │       └── ReviewFeedback (when present)
```

### Component refactor

Six legacy components collapse to four shared ones:

| Replaces | New shared component |
|---|---|
| `TrackPhaseSection`, `AssignmentSectionCard` | `<PhaseSection />` |
| `TrackItemRow`, `AssignmentRow` | `<LearningItemRow />` |
| `(content blocks scattered in TrackItemRow)` | `<ItemContentBlocks />` |
| `AssignmentSubmissionPanel` | `<SubmissionPanel />` (conditional on `requires_submission`) |

New: `<RelatedResources />` for the auto-suggested and curated resource cards.

### Track-specific differences after homogenization

- **Pre-RNF:** Keeps existing 6-phase structure. Gains submission panel on every item, related resources panel, persistence in Supabase, deep-link URLs.
- **Post-RNF:** Tab renamed from "Assignment Checklist" to **"Post-RNF Training"**. Items get the same rich fields as pre-RNF (description, objectives, action items, content blocks). Existing submission UI carries over. The legacy "Training Components" section dissolves into the new phase grouping.

### Post-RNF phase grouping (locked)

26 items mapped from `learningTrackData.ts:561-602` into 5 phases.

#### Phase 1 — Foundation & Certification (5 items)

| Legacy ID | Title |
|---|---|
| `asgn-1` | Completion of Remaining CMFAS Module(s) |
| `asgn-13` | Passed all 4 CMFAS Modules |
| `tc-7` | 2.5 Days of Foundation to Success |
| `tc-1` | Financial Health Check Process |
| `tc-2` | Introduction to Goal Setting and 20 Point Card |

#### Phase 2 — Business Planning & Marketing Setup (4 items)

| Legacy ID | Title |
|---|---|
| `asgn-4` | FC Business Plan |
| `asgn-5` | FC Marketing Kit |
| `asgn-6` | Pledge Sheet |
| `tc-8` | Business Leadership Program |

#### Phase 3 — Prospecting & Pipeline Building (5 items)

| Legacy ID | Title |
|---|---|
| `asgn-2` | Project 100 |
| `asgn-3` | 30 Market Surveys |
| `tc-3` | Pre Approach Tools (Project 100, Market Surveys) |
| `tc-5` | Telethon Session 1: 15 Market Surveys |
| `tc-6` | Telethon Session 2: 15 Market Surveys |

#### Phase 4 — Sales Process & Field Observation (7 items)

| Legacy ID | Title |
|---|---|
| `asgn-7` | Concept of Financial Planning Presentation (CST, SOL, etc) |
| `asgn-8` | Joint Field Observation — Opening Interview of a Senior FC/Leader |
| `asgn-9` | Joint Field Observation — Closing Interview of a Senior FC/Leader |
| `asgn-10` | Joint Field Observation — Servicing Appointment of a Senior FC/Leader |
| `asgn-11` | Policy Summary of Family Member / Relative / Close Friend |
| `asgn-14` | Submit 1 Roleplay of AIA Pro Achiever (APA) Pitch |
| `tc-4` | Introduction to Canned Sales Track |

#### Phase 5 — Learning, Reflection & Team Contribution (5 items)

| Legacy ID | Title |
|---|---|
| `asgn-12` | Book Review on 1 Industry-Related Book |
| `asgn-15` | Co-organise one Team Monthly Webinar with the Direct Leader |
| `asgn-16` | Co-organise one Team Social Night with the Welfare IC |
| `asgn-17` | TMB 5th Financial Planning Book — conceptualisation & research |
| `asgn-18` | Present an Article or MDRT Journal sharing at a Team Monthly Meeting |

Total: **26 items**. Each `legacy_id` maps cleanly to a new `learning_track_items` row, enabling the localStorage backfill.

## 4. Admin monitoring dashboard

Three sub-views under `/learning-track/admin/*`. All guarded by `ProtectedAdminPage`. Sidebar gets a "Learning Track Admin" entry visible only to admins.

### 4a. Roster — `/learning-track/admin/roster`

Sortable, filterable table of every recruit.

Columns: Name | Pre-RNF % | Post-RNF % | Pending submissions | Last active.
- Each row clickable → drills to `/learning-track/admin/recruit/:userId`.
- Progress bars colored red <33%, amber 33-66%, green >66%.
- Hover row → tooltip with current phase + next incomplete item title.
- Filters: track, activity status (active <7d / stale 7-14d / inactive >14d), has-pending-submissions toggle.
- Sort: any column, default `Last Active DESC`.
- Export CSV button for offline review.

Data source: `get_learning_track_roster()` RPC. TanStack Query cached with 60s stale time.

### 4b. Heatmap — `/learning-track/admin/heatmap`

Two side-by-side grids (one per track). Recruits as rows, phases as columns.

- Cells colored by phase completion: dark green = 100%, light green ≥66%, amber 33-66%, red >0%, gray = 0%.
- Hover cell → popover with "X of Y items complete".
- Click cell → navigates to recruit drill-down scrolled to that phase.

Data source: `get_learning_track_heatmap()` RPC.

### 4c. Submissions queue — `/learning-track/admin/submissions`

Two-pane email-client layout.

Left pane: filterable list of submissions. Filters: status (default `Pending`), track, phase, recruit. Sorted oldest-first. Badge dot indicates pending vs reviewed.

Right pane: submission detail.
- Recruit name, item, submitted-at.
- Remarks rendered as markdown.
- Attachments: images inline, PDFs in iframe, URLs as cards.
- Review form: feedback textarea, `Approve` and `Request Changes` buttons.
- `Approve`: sets `review_status='approved'`, `reviewed_at=now()`, `reviewed_by=auth.uid()`. Optimistic UI.
- `Request Changes`: requires non-empty feedback; sets `review_status='changes_requested'`, `reviewed_at=now()`, `reviewed_by=auth.uid()`, `review_feedback=<text>`. Recruit can edit and resubmit because of the RLS rule on owner update.

**RLS follow-up needed (known gap in shipped migration):** The shipped Lovable migration restricts owner updates to `review_status = 'pending'` only. To support the "request changes → recruit edits → resubmit" loop, this policy must be widened to `review_status IN ('pending','changes_requested')`. The same fix applies to the parent file insert/delete policies on `learning_track_submission_files` (which currently also gate on `s.review_status = 'pending'`). When the recruit resubmits, the client sets `review_status` back to `'pending'` and clears `reviewed_at`/`reviewed_by` so the submission re-enters the queue. **Action:** add this RLS patch as a follow-up Lovable handoff before frontend implementation of the review loop begins.

Data source: direct query on `learning_track_submissions` + `learning_track_submission_files` (admin RLS allows SELECT all).

### 4d. Recruit drill-down — `/learning-track/admin/recruit/:userId`

Read-only mirror of one recruit's full learning track.

- Reuses `<PhaseSection />` and `<LearningItemRow />` in a `viewAsUserId={userId}` mode that overrides the data source from "current user" to the target user.
- Admin can still review submissions inline (same Approve / Request Changes actions).
- Header: name, joined date, current phase, overall %, contact link.
- Tabbed: Pre-RNF | Post-RNF.
- Reachable from roster row, heatmap cell, or submissions queue recruit name.

### 4e. Admin landing — `/learning-track/admin`

Redirects to `/learning-track/admin/roster`. Top tab strip switches between Roster / Heatmap / Submissions.

## 5. Prominence, resource linking, Obsidian ingest

### 5a. Prominence — three reinforcing surfaces

**1. Dashboard hero card** in `Index.tsx`, above existing dashboard content. Shows current phase, progress bar, next incomplete item title, "Continue" / "Start Learning" CTA that deep-links to that item. Pins until both tracks hit 100%, then collapses to a small badge. **This is the primary path for zero-progress recruits** (no automatic redirect off `/`).

**2. Sidebar promotion + progress badge** in `AppSidebar.tsx`. **Home** (`/`) is first in main nav, then **Learning Track** with a progress badge. Tooltip on hover. Same spirit for the mobile bottom nav "Learn" entry.

**3. ~~Zero-progress redirect~~ (superseded).** Previously: `Index.tsx` sent non-admins with zero completed items to `/learning-track/pre-rnf` unless `lt-redirect-dismissed` was set. **Removed:** users stay on home; hero CTA and sidebar carry prominence without surprise navigation.

### 5b. Resource linking — auto-suggest + manual override

`<RelatedResources />` panel renders inside every `<LearningItemRow />`.

**Layer 1 — Auto-suggestions.** Client-side TF-IDF ranker over a build-time index of:
- `products` table → matched against `name`, `description`, `keywords`
- `src/kb/products/*.md` → grep across markdown headings
- Scripts Database → titles + tags
- Concept Cards → titles by product category
- `obsidian_resources` (where `shareable = true`) → Postgres `tsvector` on `title + body_md`
- NotebookLM URLs from the `Products MOC` ingest

Inputs: item title + description + objectives. Output: ranked cards by source type. No vector embeddings — corpus is small enough (~50 products + ~100 KB pages + ~26 Obsidian docs) that string-match-with-stemming is plenty.

**Layer 2 — Admin curation.** Admin (in inline-edit mode) sees auto-suggestions plus a typeahead picker scoped by source type. Adding a resource creates a `learning_track_content_blocks` row with `block_type='resource_ref'`. Admin can pin (promote auto → curated) or unpin (hide auto-suggestion) — unpinning appends to `learning_track_items.hidden_resources`.

### 5c. Obsidian ingest pipeline

New tool: `tools/sync_obsidian_resources.py`.

**Behavior:**
1. Walks `References/`, `Advisor Training Guides/`, `Products/`, `Learning/` in the Obsidian vault (path read from env var `OBSIDIAN_VAULT_PATH`).
2. For each `.md` file: parse frontmatter, derive `category` from folder, extract `title` from H1 or filename, read `body_md`, read `shareable` from frontmatter (default `false`).
3. Upserts into `obsidian_resources` keyed by `source_path`.
4. Removes DB rows whose `source_path` no longer exists locally.
5. Logs counts: added / updated / removed / total.

**Run mode:** Manual (`python3 tools/sync_obsidian_resources.py`). Future automation (launchd or vault git hook) is out of scope.

**Auth:** Uses Supabase service_role key from `.env`. Server-side script.

**Privacy:** Only `shareable = true` rows are visible to non-admins. The script imports everything but defaults `shareable` to `false` unless the markdown frontmatter has `shareable: true`. Admins can flip the flag in the database directly or by adding the frontmatter to the source file and re-syncing.

**Estimated v1 corpus:** ~75 documents, ~250 KB total. Comfortably fits in `obsidian_resources` and works with Postgres full-text search.

### 5d. New `/learning-track/resources` route

A simple browse hub indexing everything available to the recruit:
- All shareable `obsidian_resources` (grouped by category)
- All NotebookLM links from the Products MOC
- All product categories (deep-link to existing `/category/:slug` and `/product/:slug` routes)
- All scripts and concept cards

Implemented as a tabbed view (`Reference docs | Products | Scripts | Concept Cards | Videos`) with search across the lot. Reuses the same TF-IDF index as the auto-suggester.

## Migration plan summary

Order of operations during implementation:

1. **DB migration via Lovable** — create tables, RLS, RPCs, storage bucket from `SUPABASE.md`.
2. **Seed script** — Python or TS-Node script that reads `learningTrackData.ts` and inserts the pre-RNF phases (existing structure) plus the post-RNF phases (new mapping in §3) along with all items, content blocks, and `legacy_id` values.
3. **Refactor frontend components** — collapse 6 legacy components into 4 shared ones, build `<RelatedResources />`, build admin dashboard views. Replace localStorage hooks with Supabase-backed hooks (TanStack Query mutations).
4. **One-time client migration** — runs on first authenticated load post-deploy, backfills any local progress into Supabase.
5. **Obsidian sync script** — `tools/sync_obsidian_resources.py`. Run once after deploy to seed `obsidian_resources`.
6. **Prominence surfaces** — hero card, sidebar promotion (no Index zero-progress redirect; see §5a).
7. **QA + Playwright tests** for all new routes, deep links, admin flows, and submission upload/review cycle.

## Open questions deferred to follow-ups

- Email/in-app notifications when admin reviews a submission.
- Automated Obsidian sync schedule (launchd / git hook).
- Vector embedding semantic search for resource matching.
- Cohort-level analytics (multiple recruit cohorts compared on the same chart).
- Grading SLA tracking (how long submissions sit in pending).
