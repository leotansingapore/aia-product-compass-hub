# Academy Implementation Plan

## Context
Retire Skool → make Academy the single home. Three personas (Explorer / Papers-taker / Post-RNF), linear journeys, upgrade requests, within-track gating, Skool content ported over.

## Decisions locked in
| # | Question | Decision |
|---|---|---|
| 1 | Explorer content storage | **Reuse `learning_track`** with new `track_key = 'explorer'` (consistent admin UX, no duplicate models) |
| 2 | Content porting approach | **Build admin tooling** — create/edit/import phases, items, content blocks in the app itself |
| 3 | Tier-change notifications | **Both** — in-app toast (Supabase realtime) + email (edge function) |

---

## Phased rollout

### Phase 1 — Tier Foundation (1–1.5 weeks)
**Goal**: every user has a tier; admin can read + change it.

**Lovable (DB) handoff**
- Extend `user_access_tiers.tier_level` to support enum: `'explorer' | 'papers_taker' | 'post_rnf'` (plus `admin` variants already there)
- Add trigger on new `profiles` row: auto-insert `user_access_tiers(user_id, tier_level='explorer')`
- RLS: user reads own tier; only admins write

**Code**
- `src/hooks/useUserTier.tsx` — returns `{tier, loading}`, React Query cached
- `src/components/admin/TierControl.tsx` — dropdown to change tier (uses `user_access_tiers` upsert)
- Add `TierBadge` component (Explorer blue / Papers yellow / Post-RNF green)
- Wire into `UnifiedUserDirectoryRow` → show tier badge + control

**Ship criterion**: admin can view + change any user's tier from the User Management tab.

---

### Phase 2 — Tier-Aware Routing & Nav (1 week)
**Goal**: users only see what their tier unlocks.

**Lovable (DB) handoff**
- Seed `tier_permissions` rows for the feature matrix below
- RLS: all authenticated users can read tier_permissions (no writes)

**Feature matrix (seed data)**
| Feature key | Explorer | Papers | Post-RNF |
|---|:-:|:-:|:-:|
| `home` | ✅ | ✅ | ✅ |
| `bookmarks`, `my-account` | ✅ | ✅ | ✅ |
| `explorer-track` | ✅ | ✅ | ✅ |
| `pre-rnf-track`, `cmfas`, `products`, `question-banks`, `roleplay` | ❌ | ✅ | ✅ |
| `post-rnf-track`, `playbooks`, `flows`, `scripts`, `servicing`, `concept-cards`, `consultant-landing` | ❌ | ❌ | ✅ |

**Code**
- `src/hooks/useFeatureAccess.tsx` — `can(featureKey)` reading tier_permissions
- `src/components/layout/AppSidebar.tsx` — filter nav items by `can()`
- `src/components/RequireTier.tsx` — HOC / component wrapper that redirects if below required tier
- `src/pages/Index.tsx` — tier-switch: render `ExplorerHome` / `PapersHome` / `PostRnfHome`
- **New**: `src/pages/ExplorerHome.tsx` — lists the Explorer learning track
- **New**: `src/pages/PapersHome.tsx` — current dashboard (SearchHero, ProductCategories, QuickActions)
- **New**: `src/pages/PostRnfHome.tsx` — same as Papers + consultant shortcuts

**Ship criterion**: Explorer sees minimal app; Post-RNF sees everything; unauthorized routes redirect.

---

### Phase 3 — Upgrade Request Flow + Notifications (1–1.5 weeks)
**Goal**: users request upgrade; admins approve; both parties notified.

**Lovable (DB) handoff**
- New table `tier_upgrade_requests`:
  ```
  id uuid pk, user_id uuid fk, from_tier text, to_tier text,
  status text check in ('pending','approved','rejected'),
  reason text, created_at, reviewed_at, reviewer_id uuid fk, admin_note text
  ```
- Edge function `notify-tier-change` — sends email on approval (reuse `send-password-reset` patterns)
- RLS: user can read own requests; admin can read/update all

**Code**
- `src/components/tier/RequestUpgradeButton.tsx` — appears on ExplorerHome + PapersHome; opens dialog with "why upgrade?" textbox
- `src/hooks/useTierRequests.tsx` — user-side (list their requests) + admin-side (list all pending)
- `src/components/admin/TierRequestsPanel.tsx` — new admin tab: pending queue + approve/reject + admin note
- On approve: update `user_access_tiers` + mark request approved + call edge function to email
- Supabase realtime subscription on `user_access_tiers` in `useUserTier` → when own tier row changes, show toast "You've been upgraded to Papers-taker! 🎉"

**Ship criterion**: Explorer clicks Request → admin approves → user gets email + toast → user's nav updates immediately.

---

### Phase 4 — Explorer Track (reusing learning_track) (1 week)
**Goal**: Explorer tier has a real learning track to work through.

**Lovable (DB) handoff**
- Extend `track` enum in `learning_track_phases` / `learning_track_items` / `learning_track_progress`: add `'explorer'` alongside `'pre_rnf'` / `'post_rnf'`
- Seed initial Explorer phases once content is ready (can be placeholder initially)

**Code**
- `src/types/learning-track.ts` — update `Track` type: `"pre_rnf" | "post_rnf" | "explorer"`
- New routes:
  - `/explorer` (redirect to learning-track/explorer or inline the home)
  - `/learning-track/explorer/:itemId?` — reuses existing track renderer
- Update `LearningTrack.tsx` tabs to include Explorer (or keep Explorer separate from Pre/Post tab bar since it's the orientation tier)
- `ExplorerHome.tsx` — renders the Explorer learning track inline (no tab nav needed)

**Content (parallel work from week 1)**
- Port: Finternship Orientation, Financial Planning Basics, Advisory Fundamentals, orientation videos (modules 1–4)

**Ship criterion**: Explorer user has actual content to study inside Academy.

---

### Phase 5 — Content Port Admin Tooling (1.5–2 weeks)
**Goal**: admins create/edit/import learning track content without touching DB directly.

**Code**
- `src/components/admin/track-editor/PhaseEditor.tsx` — CRUD UI for phases (create/rename/reorder/delete)
- `src/components/admin/track-editor/ItemEditor.tsx` — CRUD for items; fields: title, objectives, action_items (array), submission flag, order
- `src/components/admin/track-editor/ContentBlockEditor.tsx` — CRUD for content_blocks under an item; supports block types: markdown (rich text), video (embed URL or upload), pdf, external link
- `src/components/admin/track-editor/MarkdownImport.tsx` — paste Skool classroom content in markdown → parser creates phases/items/blocks automatically
- Use existing `react-markdown` + CodeMirror for editing
- Route: `/admin/learning-track/edit/:trackKey` (admin-only)
- Add tab in AdminDashboard: "Track Editor"

**Existing assets to reuse**
- `learning_track_phases` / `items` / `content_blocks` tables already exist
- `useAdminLearningTrackMutations` hook exists — extend as needed
- Video upload already exists in `EditableVideos.tsx` pattern — adapt

**Ship criterion**: admin can create a whole new phase + items + content blocks end-to-end in the UI; markdown paste-import works for bulk content migration.

---

### Phase 6 — Within-Track Gating / Unlocks (1–1.5 weeks)
**Goal**: locked items stay locked until prerequisites complete.

**Lovable (DB) handoff**
- Add to `learning_track_items`:
  - `prerequisite_item_ids: uuid[]` (nullable — no prereqs = always unlocked)
- Add to `learning_track_phases`:
  - `prerequisite_phase_id: uuid` (nullable) — unlocks entire phase when prior phase fully complete

**Code**
- `src/hooks/useItemUnlocked.tsx` — given item + user progress, return `{locked, reason, unlockedBy}`
- `src/components/learning-track/LearningItemRow.tsx` — render locked state: lock icon, reduced opacity, tooltip "Complete X first"
- `src/components/learning-track/admin/PrerequisiteEditor.tsx` — multi-select dropdown to pick prereq items per item; wire into the Track Editor from Phase 5

**Ship criterion**: in Pre-RNF track, items within a phase unlock in order; Phase 2 is fully locked until Phase 1 is fully complete.

---

### Phase 7 — Content Port + Skool Retirement (2–4 weeks, ongoing)
**Goal**: all boss-approved content in Academy; Skool links removed.

**Content (using Phase 5 admin tooling)**
- Papers pending port: Financial Cert Sponsorship, Must Read Books, Soft Skills 1.0
- Post-RNF: Real Appointments — export Fireflies → MP4 → upload as content blocks in relevant Post-RNF phase
- Explicitly skip: Alex Hormozi, FlexiSkim, SOPs, anything boss said to ignore

**Code**
- Audit: `rg "skool"` — remove remaining links, icons, "go to Skool" buttons
- Update onboarding (`useOnboarding.tsx`, WelcomeModal) to point only to Academy
- Email nudge system (optional): "You have 3 unopened Explorer modules" via edge function + cron

**Ship criterion**: no Skool references in Academy; all pending-port items live in the track editor.

---

## Critical path + timeline

```
Week 1:  Phase 1 (Tier Foundation)     ─────┐
                                             │
Week 2:  Phase 2 (Routing & Nav)      ──────┤       Phase 4 content port (parallel)
                                             │       Phase 5 tooling starts
Week 3:  Phase 3 (Upgrade Requests)    ─────┤
                                             ▼
Week 4:  Phase 5 (Admin Tooling — finish)
Week 5:  Phase 6 (Within-Track Gating)
Week 6+: Phase 7 (Content Port + Skool Retirement)
```

**MVP ship (end of week 3)**: tier system + routing + upgrade requests + notifications. User-facing behavior changes immediately.

**Full ship (end of week 6)**: everything gated, admin can port content without dev help, Skool retired.

---

## Files to create (summary)

### Hooks
- `src/hooks/useUserTier.tsx`
- `src/hooks/useFeatureAccess.tsx`
- `src/hooks/useTierRequests.tsx`
- `src/hooks/useItemUnlocked.tsx`

### Components
- `src/components/admin/TierControl.tsx`
- `src/components/admin/TierRequestsPanel.tsx`
- `src/components/admin/track-editor/PhaseEditor.tsx`
- `src/components/admin/track-editor/ItemEditor.tsx`
- `src/components/admin/track-editor/ContentBlockEditor.tsx`
- `src/components/admin/track-editor/MarkdownImport.tsx`
- `src/components/admin/track-editor/PrerequisiteEditor.tsx`
- `src/components/tier/RequestUpgradeButton.tsx`
- `src/components/tier/TierBadge.tsx`
- `src/components/RequireTier.tsx`

### Pages
- `src/pages/ExplorerHome.tsx`
- `src/pages/PapersHome.tsx`
- `src/pages/PostRnfHome.tsx`
- Route: `/admin/learning-track/edit/:trackKey`

### Edge functions (Supabase)
- `notify-tier-change` (email on approval)

### DB changes (Lovable handoff)
- Enum extension on `user_access_tiers.tier_level`
- Trigger: auto-assign Explorer on signup
- Seed `tier_permissions` rows
- Enum extension on `learning_track.track` to include `'explorer'`
- New table: `tier_upgrade_requests`
- New columns: `learning_track_items.prerequisite_item_ids`, `learning_track_phases.prerequisite_phase_id`

---

## Risks / open questions
1. **Seed permissions carefully** — if we mis-wire, existing users might suddenly lose access. Plan: assign all existing active users to `post_rnf` by default during migration so nothing is hidden for current users; new signups start at `explorer`.
2. **Skool retirement timing** — don't retire until content is ported. Phase 7 gates this.
3. **CMFAS slotting** — boss mentioned CMFAS should be a phase *inside* Pre-RNF. Decide: move CMFAS module UI into track admin, or keep `/cmfas/*` as standalone but link from Pre-RNF items.
4. **Content editor richness** — if Skool content uses complex formatting, our markdown editor might need image upload, embed support. Plan: start minimal, iterate based on actual content.

---

## Verification (end-to-end smoke test)
1. Create new user → auto-assigned Explorer
2. Log in as that user → see only Explorer home + orientation content
3. Click "Request upgrade to Papers" → submit
4. Log in as admin → see pending request → approve
5. Original user: in-app toast appears, email received, nav updates to show Pre-RNF + products + Q-banks
6. User starts Pre-RNF Phase 1 → Phase 2 shows as locked until Phase 1 items complete
7. Admin opens Track Editor → creates a new phase with 2 items + content blocks → publishes → user sees it
8. No Skool links anywhere in the app
