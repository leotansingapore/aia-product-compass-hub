
## Fix: Gray Hover on Category Dropdown Menu Items

The yellow hover color comes from the default `focus:bg-accent` style in the DropdownMenuItem component, where "accent" maps to the app's gold/yellow theme color. The fix is to override this on the two menu items in the sidebar category dropdown.

### Changes

**File: `src/components/layout/AppSidebar.tsx`**

- On the "Edit Name" `DropdownMenuItem` (line 236): change className to include `focus:bg-muted focus:text-foreground` to override the accent color
- On the "Delete" `DropdownMenuItem` (line 246): change className to include `focus:bg-muted` (keep the destructive text color override already there)

This ensures both menu items show a simple gray background on hover/focus instead of the yellow accent color.
