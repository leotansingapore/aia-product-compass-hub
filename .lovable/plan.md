

## Plan: Add Saving State Effects to Save Bar

**Problem**: The save bar shows no visual feedback when saving is in progress — the buttons just become disabled.

**Fix**: Enhance `VideoEditingActions.tsx` with clear saving indicators:

1. **Save button**: Show a spinning `Loader2` icon replacing the checkmark, change text to "Saving...", add a subtle pulse animation
2. **Overlay bar**: Add a thin animated progress bar (indeterminate) across the top of the save bar container when saving
3. **Backdrop**: Slight opacity shift on the entire bar to reinforce the "busy" state

### Changes in `VideoEditingActions.tsx`

- Import `Loader2` from lucide-react
- When `saving=true`:
  - Replace `Check` icon with spinning `Loader2`
  - Button text becomes "Saving..."
  - Add an indeterminate progress stripe at the top of the container
  - Container gets a subtle `opacity-80` + `pointer-events-none` feel
- When `saving=false`: current UI unchanged

**Single file**: `src/components/video-editing/VideoEditingActions.tsx`

