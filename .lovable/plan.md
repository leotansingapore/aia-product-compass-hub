

## Plan: Add Admin Edit Button & Remove Bottom Transcript from Student View

**Goal**: On the student video page (`VideoLearningInterface.tsx`), add an admin-only "Edit" button and remove the legacy bottom transcript/notes section (since transcript and resources are already in the left sidebar).

### Changes

**1. `VideoLearningInterface.tsx` — Remove legacy bottom Notes & Transcript section**
- Remove lines 316-359 (the `Collapsible` with `Tabs` for "Notes & Transcript" that appears below the video content in the main column)
- The transcript is already in the sidebar (lines 385-417), so this is a duplicate

**2. `VideoLearningInterface.tsx` — Add admin "Edit" button in the header**
- Import `usePermissions` hook
- Accept `productSlugOrId` or derive it from `useParams` (already available at line 80)
- Add an "Edit" button next to the navigation buttons in the sticky header, visible only for admins
- Button navigates to `/product/${productSlugOrId}/manage-videos` (the admin editor page)
- Use `SquarePen` icon to match the admin editor's edit button style

### Layout After Change

```text
Header: [← Back] [Title + Progress] [Edit ✏️] [◀ ▶ Next]

┌────────────────┬──────────────────────────┐
│  SIDEBAR       │  MAIN CONTENT            │
│  Course Videos │  Video Player Card       │
│  Transcript ▼  │  Rich Content Card       │
│  Resources     │  (no more bottom tabs)   │
└────────────────┴──────────────────────────┘

[Mark Complete button - sticky bottom]
```

**Files to edit**: `src/components/video-learning/VideoLearningInterface.tsx`

