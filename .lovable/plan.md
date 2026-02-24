

# Drag Pages into Folders

## What Changes
When you drag a root-level page over a closed folder, the folder will automatically open after a short delay. A visual highlight will indicate which folder you're about to drop into. Dropping the page assigns it to that folder.

## How It Will Work
1. **Drag a root page over a folder** -- the folder row lights up with a blue/primary border highlight
2. **Hover for ~500ms on a closed folder** -- it auto-expands so you can see what's inside
3. **Drop the page** -- it gets reassigned to that folder's category and reordered accordingly
4. **Smooth transitions** -- highlight fades in/out, folder expand animates naturally

---

## Technical Details

### File: `src/components/video-editing/FolderTreeView.tsx`

**1. Add droppable folder detection**
- In `SortableFolderItem`, accept new props: `isDropTarget` (boolean) to indicate when a video is being dragged over this folder
- Apply conditional styling: `ring-2 ring-primary/50 bg-primary/5` when `isDropTarget` is true, with a `transition-all duration-200` for smooth effect

**2. Update `handleDragOver` to track folder hover**
- When `activeType === 'video'` and the `overId` starts with `folder-`, set state to mark that folder as the current drop target
- Add a timer ref (`useRef`) for auto-expand: after 500ms of hovering over a closed folder, call `toggleFolder` to expand it
- Clear the timer when the drag moves away from the folder

**3. Update `handleDragEnd` to handle video-to-folder drops**
- Add a new branch: when dragging a video (`activeType === 'video'`) and dropping on a folder (`overIdStr.startsWith('folder-')`):
  - Extract the target folder name from the ID
  - Find the dragged video, update its `category` to the target folder name
  - Reorder all videos (root videos first, then folder videos in order)
  - Call `onReorderVideos` with the updated array

**4. Add `dropTargetFolder` state**
- New state: `const [dropTargetFolder, setDropTargetFolder] = useState<string | null>(null)`
- New ref: `const autoExpandTimerRef = useRef<NodeJS.Timeout | null>(null)`
- In `handleDragOver`: when a video hovers over a folder, set `dropTargetFolder` and start the auto-expand timer
- In `handleDragEnd` / `handleDragCancel`: clear `dropTargetFolder` and the timer

**5. Pass `isDropTarget` to `SortableFolderItem`**
- `isDropTarget={dropTargetFolder === folderName && activeType === 'video'}`

**6. Visual styling for drop target folder**
- When `isDropTarget` is true on a folder row:
  - Border: `ring-2 ring-primary/60`
  - Background: `bg-primary/5`
  - Folder icon color intensifies
  - Transition: `transition-all duration-200 ease-in-out`

### No other files need changes
The `onReorderVideos` callback already handles category reassignment and persistence upstream in `VideoEditingInterface.tsx`.

