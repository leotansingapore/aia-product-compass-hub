# CLAUDE.md

---

## COMMIT RULES - READ THIS FIRST

**ONE change = ONE commit = ONE push. IMMEDIATELY.**

Do NOT batch multiple changes. After completing ANY single feature or fix:

1. `git add -A` (TASKS.md and BUGS.md are in .gitignore)
2. `git commit -m "Your descriptive message"`
3. `git push origin main`
4. THEN move to next task

**Commit Message Format:** Write like an EOD report — what now works, not what you touched.

```
Quiz results now persist across browser sessions
CMFAS video progress tracker now resumes from last watched position
Roleplay feedback scores now display with radar chart breakdown
```

- Present tense, outcome-focused. Think "what can users do now?"
- NO `Co-Authored-By` trailers
- NO generic "Added X", "Fixed Y", "Updated Z"

**Never commit:** TASKS.md, BUGS.md (gitignored).
**Doc-only changes:** Commit but don't push individually — batch with next code push.
**Task tracking:** Use TASKS.md directly. Do NOT use Claude Code TaskCreate/TaskList tools.

---

## TASK TAGS

Tags in TASKS.md control how tasks are executed. Multiple tags can combine (e.g. `[PLAN] [TEST]`).

### `[AUTO]` — Autonomous execution
Run without asking. Implement → build check → commit → push → next task.
- **Stop if:** build error (fix then continue), uncertain (ask user), needs DB changes (skip + notify)
- **Skip:** auth/payment/security logic changes, new dependencies without asking

### `[PLAN]` — Research before coding (fully automated)
**Do NOT write code immediately.** Use a 3-agent pipeline — no user approval needed:
1. **Research phase:** Launch 2-3 **Explore agents** in parallel to investigate relevant code paths (e.g. one for hooks, one for components, one for pages/config). Each agent reports findings.
2. **Plan phase:** Synthesize findings into a plan — root causes, files to modify, approach, risks.
3. **Review phase:** Spawn a **Plan agent** as reviewer. Pass it the plan + research findings. The reviewer must:
   - Verify the plan addresses the root cause (not just symptoms)
   - Check for missing edge cases or side effects
   - Confirm the file list is complete (no forgotten imports, types, tests)
   - Approve or send back with specific feedback
4. **If reviewer rejects:** Revise the plan based on feedback and re-submit. Max 2 revision rounds.
5. **If reviewer approves:** Proceed to implementation immediately. No user approval needed.
6. **Log the plan** as a comment in the TASKS.md task (indented under the task line) so there's a record.

### `[TEST]` — Verify with Playwright before marking done (fully automated)
After implementation, run a **3-step verification pipeline** — no user needed:
1. **Build gate:** `npm run build` must pass (no type errors). If it fails, fix and rebuild. Do not proceed until clean.
2. **Playwright browser verification:** Open the relevant page(s) using Playwright MCP.
   **Login:** Use demo accounts from `src/config/authConfig.ts` — master_admin, admin, or user @demo.com emails. Sign in at `/auth` before navigating to protected pages.
   **Base URL:** `http://localhost:8080`
   - Navigate to the page → interact with the changed element/feature → verify it renders and behaves correctly
   - If the task involves admin features: sign in as admin, navigate to `/admin`
   - If the task involves mobile: also test at mobile viewport (`--viewport-size=375x812`)
   - If Playwright finds a problem → fix it → re-verify. Do not proceed until clean.
3. **QA review agent:** After Playwright passes, spawn a **general-purpose agent** as QA reviewer. Pass it:
   - The task description
   - The git diff of all changes
   - The Playwright verification results
   - The QA agent checks: no regressions introduced, code follows project patterns, no leftover debug code, no hardcoded values, accessibility not broken (WCAG 2.1 AA for chat components)
   - If QA rejects → fix issues → re-run from step 1. Max 2 revision rounds.
4. **Only mark task done** after all 3 gates pass (build + Playwright + QA agent).

### `[AUTO-DB]` — Needs database migration
Skip in autonomous mode. Describe the needed DB changes and notify user for Lovable handoff.

## AUTONOMOUS MODE

When user says **"run batch tasks"** or **"autonomous mode"**:

1. Read the Batch section in TASKS.md
2. Execute `[AUTO]` tasks one by one
3. Each task: implement → build check → `git add -A && git commit && git push` → next
4. ONE task = ONE commit = ONE push (even in auto mode)
5. Follow tag rules above — `[TEST]` tasks need Playwright verification, `[PLAN]` tasks need research first
6. **Stop if:** build error (fix then continue), uncertain (ask user), needs DB changes (skip + notify)
7. **Skip:** auth/payment/security logic changes, new dependencies without asking

---

## SUPABASE SYNC

See `SUPABASE.md` for pending database changes. When user says "check supabase" → scan `supabase/migrations/` against pending items in SUPABASE.md, move completed items with date.

---

## Project Overview

**AIA Product Compass Hub** — A financial advisory training and education platform (FINternship). Advisors learn about insurance/investment products, train with AI roleplay scenarios, study for CMFAS exams, track learning progress with gamification, and get AI-powered product guidance.

**Built with:** React 18 + TypeScript, Vite, Tailwind CSS, shadcn/ui, TanStack Query, Supabase, React Hook Form, Zod, Recharts, CodeMirror, DnD Kit
**AI services:** OpenAI Assistants API (product chat), Tavus API (roleplay video avatars)
**AI builder:** Lovable (lovable.dev) handles database migrations and config files

**Commands:** `npm run dev` | `npm run build` | `npm run lint`

**User Roles:** `user` (default) · `admin` · `master_admin` (superuser)

---

## Architecture

### Key Directories

```
src/
├── components/
│   ├── ui/              # shadcn/ui (DO NOT MODIFY)
│   ├── admin/           # Admin user directory, bulk actions, provisioning
│   ├── account/         # User profile & settings
│   ├── auth/            # SimplifiedAuthForm, login/signup
│   ├── chat/            # Accessible AI chat (WCAG 2.1 AA)
│   ├── cmfas/           # CMFAS exam modules & chatbot tutor
│   ├── dashboard/       # SearchHero, ProductCategories, QuickActions
│   ├── product-detail/  # Product pages, EnhancedAIChat, training videos
│   ├── category/        # Category browsing & filtering
│   ├── video-learning/  # Video player with progress tracking
│   ├── video-editing/   # Admin video management (rich content editor)
│   ├── roleplay/        # TavusVideoChat, scenarios, diagnostics
│   ├── quiz/            # Quiz engine with gamification
│   ├── onboarding/      # WelcomeModal, OnboardingTutorial
│   ├── layout/          # AppLayout, AppSidebar, MobileBottomNav
│   └── markdown/        # Markdown rendering utilities
├── hooks/               # 40+ custom hooks
│   ├── useSimplifiedAuth.tsx  # Auth provider (Supabase + edge functions)
│   ├── usePermissions.tsx     # Role checks (user/admin/master_admin)
│   ├── useProducts.tsx        # Product data fetching
│   ├── useBookmarks.tsx       # Bookmarks with optimistic updates
│   ├── useGamification.tsx    # XP, achievements, streaks
│   ├── useRoleplay.ts         # Roleplay session management
│   ├── useVideoProgress.tsx   # Video completion tracking
│   ├── useLearningAnalytics.tsx # Learning progress data
│   ├── useSearch.tsx          # Full-text product search
│   ├── useSemanticSearch.tsx  # AI-powered semantic search
│   └── chat/                  # Chat-specific hooks (accessibility)
├── integrations/supabase/     # Auto-generated (DO NOT MODIFY)
├── types/               # TypeScript type definitions
├── pages/               # Route page components
├── config/
│   └── authConfig.ts    # Demo accounts, redirect URLs, validation rules
├── data/
│   └── cmfasModuleData.ts # CMFAS module definitions & video metadata
├── lib/
│   └── accessibility/   # ARIA utilities for chat components
└── kb/                  # Knowledge base content
    ├── products/        # Per-product markdown (endowment, investment, medical, term, whole-life)
    ├── context-schema.yaml    # Roleplay data schema
    ├── coaching-style.md      # AI coaching guidelines
    ├── rubrics.md             # Evaluation rubrics
    └── output-schemas.json    # AI output schemas
```

### Routing (App.tsx)

**Dashboard:** `/` (Index)
**Auth:** `/auth` (SimplifiedAuth) · `/force-password` · `/reset-password` · `/awaiting-approval`
**Products:** `/category/:categorySlugOrId` · `/product/:productSlugOrId` · `/product/:productSlugOrId/:pageId` · `/product/:productSlugOrId/video/:videoId` · `/product/:productSlugOrId/manage-videos`
**AI:** `/product/:productId/ai-assistant` (lazy-loaded)
**CMFAS:** `/cmfas-exams` · `/cmfas/module/:moduleId` · `/cmfas/module/:moduleId/video/:videoSlugOrId` · `/cmfas/chat/:moduleId?`
**Roleplay:** `/roleplay` · `/roleplay/feedback/:sessionId`
**Knowledge Base:** `/kb` · `/kb/:categorySlug` · `/kb/:categorySlug/:productSlug`
**User:** `/my-account` · `/bookmarks` · `/how-to-use` · `/search-by-profile` · `/consultant-landing`
**Admin:** `/admin` (ProtectedAdminPage → AdminDashboard)

### Auth Flow

1. Login at `/auth` → `useSimplifiedAuth` checks user via `check-academy-user-exists` edge function
2. If exists → `signInWithPassword` (Supabase Auth)
3. If not → checks `check-financial-eligibility` edge function → auto-provisions via `provision-financial-user`
4. Sign up → `create-pending-user` edge function → awaits admin approval at `/awaiting-approval`
5. Roles: `user` | `admin` | `master_admin` (checked via `usePermissions`)
6. Admin protected by `ProtectedAdminPage` component (checks `isMasterAdmin()` or `hasRole('admin')`)

### Layout

- **Desktop authenticated:** `SidebarProvider` + `AppSidebar` (collapsible) + sticky header
- **Mobile authenticated:** `MobileHeader` + `MobileBottomNav`
- **Unauthenticated:** Simple header with "Sign In" button
- **Providers chain:** `SimplifiedAuthProvider` → `ViewModeProvider` → `AdminProvider` → `TooltipProvider` → `OnboardingProvider` → `ChecklistProvider` → `AppLayout`

---

## Key Features

### AI Chat (OpenAI Assistants API)
- `src/components/product-detail/EnhancedAIChat.tsx` — product-specific chat with thread persistence
- `src/components/chat/AccessibleAIChat.tsx` — WCAG 2.1 AA compliant version
- `src/components/cmfas/CMFASChatbot.tsx` — CMFAS exam tutor
- Backend: Supabase edge function `chat-with-assistant` → OpenAI Assistants API
- Uses `assistant_id` from product config, `threadId` for conversation continuity

### Roleplay (Tavus API)
- `src/components/roleplay/TavusVideoChat.tsx` — real-time video chat with AI avatar
- 4 built-in scenarios: Beginner → Advanced financial advisory roleplay
- Tavus Replica ID `r9d30b0e55ac`, Persona ID `p74cc7de032d`
- Session recording, transcripts, speech metrics, performance scoring
- Feedback page: `src/pages/RoleplayFeedback.tsx`

### CMFAS Exams
- 5 modules: Onboarding, M9, M9A, HI, RES5
- Module data: `src/data/cmfasModuleData.ts`
- Video learning with progress tracking
- Module-specific AI tutor chatbot

### Gamification
- `src/hooks/useGamification.tsx` — XP system (base 20 + bonus up to 50 per quiz)
- Daily limits prevent XP farming (one quiz completion per product per day)
- Achievement system with toast celebrations
- Learning progress + streaks tracking
- Tables: `quiz_attempts`, `learning_progress`, `achievements`, `user_achievements`

### Product Knowledge Base
- `src/kb/products/` — organized by category (endowment, investment, medical, term, whole-life)
- Products have: training videos, AI chatbot links, custom GPT links, useful links
- Video management with rich content editor (CodeMirror)

---

## Data Patterns

### State Management
- **TanStack Query** — server state caching (QueryClient at app root)
- **React Context** — auth, admin, onboarding, checklist, view mode
- **localStorage** — recently viewed, quiz progress, pending auth
- **No Zustand** — pure Context + TanStack Query approach

### Optimistic Updates
Used in `useBookmarks.tsx` — setState immediately before server confirmation, rollback on error.
Follow this pattern for any new bookmark-like CRUD operations.

### Supabase Edge Functions
- `check-academy-user-exists` — verify user in Academy DB
- `check-financial-eligibility` — cross-check Financial app
- `provision-financial-user` — auto-create accounts
- `create-pending-user` — sign-up queue
- `send-password-reset` — with rate limiting
- `chat-with-assistant` — OpenAI Assistants API proxy

---

## Database (Supabase)

### Migration Rules

**All database changes handled by Lovable.** Never manually edit the database or create SQL files. Describe needs → Lovable generates migration → user approves → `types.ts` auto-updates.

### Key Tables (39 total)

| Table | Purpose |
|-------|---------|
| `profiles` | User data (display name, XP, level, streaks) |
| `products` | Product/course content with AI chatbot config |
| `categories` | Product categories |
| `user_bookmarks` | Bookmarked products |
| `user_notes` | User notes per product |
| `learning_progress` | Learning events with XP |
| `quiz_attempts` | Quiz completions with scores |
| `video_progress` | Video watch progress |
| `achievements` / `user_achievements` | Gamification badges |
| `roleplay_sessions` | Roleplay recordings |
| `roleplay_feedback` | AI scoring & feedback |
| `conversation_transcripts` | Roleplay transcripts |
| `speech_metrics` | Speech analysis data |
| `user_admin_roles` | Admin role assignments |
| `user_approval_requests` | Registration approval queue |
| `tier_permissions` / `user_access_tiers` | Access control tiers |
| `file_embeddings` | Vector embeddings for semantic search |
| `app_pages` / `app_sections` / `app_tabs` | App structure metadata |

### RLS Patterns

| Access Type | SQL Pattern |
|-------------|-------------|
| Owner only | `auth.uid() = user_id` |
| Admin access | Check `user_admin_roles` table |
| Public read | `USING (true)` on SELECT |

---

## Lovable Integration

### Files NOT to Modify

- `src/components/ui/*` — create wrappers instead
- `src/integrations/supabase/*` — auto-generated
- `src/lib/utils.ts`
- Config files: `vite.config.ts`, `tailwind.config.ts`, `tsconfig*.json`, `eslint.config.js`, `components.json`

Always `git pull origin main` before editing — Lovable may have pushed changes. On merge conflicts with config files, prefer Lovable's version.
