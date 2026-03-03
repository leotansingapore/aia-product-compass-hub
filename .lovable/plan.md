

## Plan: Fix DragOverlay Position During Drag

**Problem**: When dragging items in the Course Structure sidebar (FolderTreeView), the drag overlay renders at the top of the page instead of following the cursor. This is a known dnd-kit issue when the `DragOverlay` is rendered inside a scrollable or transformed container — it uses `position: fixed` but the coordinate system gets offset by ancestor CSS transforms.

**Fix**: Both `FolderTreeView.tsx` and `AdminVideosByCategory.tsx` need their `DragOverlay` to render via a portal to `document.body`, escaping any transformed ancestor containers.

### Changes

**1. `FolderTreeView.tsx`**
- Import `createPortal` from `react-dom`
- Wrap the `<DragOverlay>` component in `createPortal(..., document.body)` so it renders outside the sidebar's scroll/transform context
- Add `dropAnimation` config with shorter duration for snappier feel

**2. `AdminVideosByCategory.tsx`**
- Same portal fix for its `<DragOverlay>`

Both are small, surgical edits — just wrapping the existing `DragOverlay` JSX in `createPortal()`.

