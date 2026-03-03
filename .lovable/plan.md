

## Plan: Transcript Edit Mode Sync + Horizontal Overflow Fix

**Problem**: 
1. When clicking "Edit" in the main panel, the sidebar transcript stays read-only — it should become an editable textarea
2. When in edit mode, the transcript field inside `RichContentEditor` is redundant (it's already in the sidebar) — hide it
3. Transcript text overflows horizontally in the sidebar

### Changes

**1. `VideoEditorPanel.tsx`** — Expose `isEditing` state upward
- Add a new callback prop `onEditingStateChange?: (isEditing: boolean) => void`
- Call it whenever `isEditing` changes (in the `setIsEditing` calls and effects)

**2. `VideoEditingLayout.tsx`** — Accept `isEditing` and make transcript editable
- Add `isEditing` and `onUpdateVideo` awareness to the sidebar transcript section
- When `isEditing` is true: render a `<textarea>` instead of the read-only `<p>` for the transcript
- Fix horizontal overflow: add `overflow-x-hidden` and `break-words` to the transcript container
- Wire transcript changes back through `onUpdateVideo`

**3. `VideoEditForm.tsx` / `RichContentEditor`** — Hide transcript in edit mode
- When rendered from the sidebar-aware layout, skip passing `onTranscriptChange` to `RichContentEditor` so the transcript section inside it doesn't render (since it's already editable in the sidebar)

**4. `VideoEditingInterface.tsx`** — Thread the `isEditing` state through
- Add state to track editing mode, pass it down to `VideoEditingLayout`

### Horizontal overflow fix (quick)
- In `VideoEditingLayout.tsx` line 249: add `break-words overflow-x-hidden` to the transcript text element

