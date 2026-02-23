

## Fix: Folder Ellipsis Menu Unresponsive After Creation (Live Only)

### Root Cause

The `SortableFolderItem` component wraps each folder in a `useSortable` hook from `@dnd-kit`. This hook attaches pointer event listeners to the drag handle. However, in production builds (optimized/minified), the event propagation between the `DropdownMenuTrigger` button and the sortable container behaves differently than in dev mode.

Specifically:
1. The `useSortable` hook's internal event listeners can capture pointer events before the dropdown trigger receives them.
2. The `PointerSensor` with `activationConstraint: { distance: 8 }` still registers the initial pointer-down, which in production can prevent the dropdown from opening.
3. Newly created empty folders (added to `emptyFolders` state) are immediately added to the `SortableContext` items list, but the DnD context may not fully recalculate its internal collision rects, causing pointer event interception.

### Fix Strategy

**File: `src/components/video-editing/FolderTreeView.tsx`**

1. **Isolate the dropdown trigger from DnD** - Move the `DropdownMenuTrigger` button outside the sortable's event capture zone by ensuring it has `data-no-dnd="true"` and adding a custom `PointerSensor` filter that ignores elements with this attribute.

2. **Update `PointerSensor` configuration** - Add a `shouldHandleEvent` filter to the sensor that skips elements marked as non-draggable (dropdown triggers, menu items).

3. **Add `modal` prop to `DropdownMenu`** - Ensure the dropdown renders in a proper portal with focus trapping, preventing DnD event leaking.

4. **Prevent pointer capture on menu buttons** - Add explicit `onPointerDown` handlers with `stopImmediatePropagation()` (stronger than `stopPropagation()`) on the folder's ellipsis button.

### Technical Changes

```text
FolderTreeView.tsx (SortableFolderItem)
- Line ~212: Add modal prop to DropdownMenu
- Line ~218: Strengthen onPointerDown to use stopImmediatePropagation
- Lines ~309-318: Update PointerSensor to filter out elements with data-no-dnd

FolderTreeView.tsx (SortableVideoItem) 
- Same pattern applied for consistency
```

### Why It Only Affects Live

React's development mode has additional checks and slower execution paths that give the browser's event system time to process click events before DnD sensors intercept them. In production, the optimized code runs synchronously fast enough that the PointerSensor captures the event before the DropdownMenu can process it -- especially for newly created items where the SortableContext hasn't fully stabilized.

