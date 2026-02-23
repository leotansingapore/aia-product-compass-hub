

## Fix: Entire Page Becomes Unclickable After Closing Folder Dialog

### Root Cause

This is a well-documented Radix UI bug. When a `Dialog` closes, Radix sets `pointer-events: none` on the `<body>` element during the close animation. In production builds, the cleanup callback that removes this style sometimes fails to fire, leaving the entire page permanently unclickable.

This is NOT a drag-and-drop issue -- it's a Dialog lifecycle issue.

### Fix

**File: `src/components/video-editing/FolderManagementDialog.tsx`**

Add an `onCloseAutoFocus` handler to the `DialogContent` that forces `pointer-events` back to normal when the dialog finishes closing:

```
onCloseAutoFocus={() => {
  document.body.style.pointerEvents = '';
}}
```

**File: `src/components/ui/dialog.tsx`**

Apply the same fix globally to the shared `DialogContent` component so this bug can never happen with any dialog in the app:

```
onCloseAutoFocus={(e) => {
  document.body.style.pointerEvents = '';
}}
```

### Why This Works

- When the dialog closes, Radix calls `onCloseAutoFocus` after the animation completes
- By explicitly resetting `pointer-events` on the body, we guarantee the stuck state is cleared
- This is a safe no-op if the cleanup already happened naturally

### Scope

Two small changes (one line each) in two files. No side effects.

