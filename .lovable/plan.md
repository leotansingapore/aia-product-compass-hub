

## Plan: Move Transcript & Resources Under Course Structure in Left Sidebar

**Goal**: In the admin video editor, move the Transcript accordion and Resources card from the preview content area into the left sidebar, below the Course Structure panel. Wrap the Course Structure in a card to match the visual style.

### Current State
- `VideoEditingLayout.tsx`: Left sidebar contains only Course Structure
- `VideoEditorPanel.tsx`: Preview mode has its own left sidebar with Transcript & Resources (duplicating sidebar space)

### Changes

**1. `VideoEditorPanel.tsx` — Remove the left sidebar from preview mode**
- Remove the `w-72` transcript/resources sidebar (lines 66-128)
- Remove the `flex gap-6` wrapper — preview becomes single-column
- Keep mobile fallback as-is (it shows below content on small screens)

**2. `VideoEditingLayout.tsx` — Add Transcript & Resources below Course Structure**
- Derive `currentVideo` from `editVideos[editingIndex]`
- Wrap the Course Structure section in a `border rounded-lg bg-card` card
- Below it, render the Transcript accordion and Resources card (same markup currently in VideoEditorPanel)
- Import `FileText`, `Link2`, `ChevronDown` icons

### Layout Result (Desktop)

```text
┌──────────────────┬─────────────────────────────┐
│  LEFT SIDEBAR    │  MAIN CONTENT               │
│  ┌────────────┐  │                              │
│  │ Course     │  │  Title + Edit Button         │
│  │ Structure  │  │  Video Player                │
│  │ (card)     │  │  Rich Content                │
│  └────────────┘  │                              │
│  ┌────────────┐  │                              │
│  │ Transcript │  │                              │
│  │ (card)     │  │                              │
│  └────────────┘  │                              │
│  ┌────────────┐  │                              │
│  │ Resources  │  │                              │
│  │ (card)     │  │                              │
│  └────────────┘  │                              │
└──────────────────┴─────────────────────────────┘
```

**Files to edit**: `VideoEditingLayout.tsx`, `VideoEditorPanel.tsx`

