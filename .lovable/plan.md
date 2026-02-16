
## Refine Sidebar Category Ellipsis Menu

Improve the existing category ellipsis dropdown menu in the sidebar with better styling and a delete option.

---

### What Changes

1. **Dropdown menu styling** -- reduce shadow, minimal/no animation, ensure solid background
2. **Add "Delete" option** with a confirmation alert dialog before deleting
3. **Edit dialog improvements** -- add 50-character max limit with counter (e.g. "22 / 50"), label the input "Name"
4. **Ellipsis button sizing** -- use `h-8 w-8` (32px, standard shadcn "sm") or `h-10 w-10` (40px) to keep it tappable but not oversized

---

### Technical Details

**File: `src/components/layout/AppSidebar.tsx`**

- Import `AlertDialog`, `AlertDialogAction`, `AlertDialogCancel`, `AlertDialogContent`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogHeader`, `AlertDialogTitle` from UI components
- Import `Trash2` icon from lucide-react
- Add `deletingCategory` state to track which category deletion needs confirmation

**Dropdown menu changes (lines 211-221):**
- Add `className="shadow-sm"` to `DropdownMenuContent` to reduce the heavy shadow
- Add a second `DropdownMenuItem` for "Delete" with `Trash2` icon and destructive styling
- Clicking Delete sets `deletingCategory` state which opens an `AlertDialog`

**Edit dialog changes (lines 277-294):**
- Add `maxLength={50}` to the `Input`
- Add a character counter below: `{newCategoryName.length} / 50`
- Add a "Name" label above the input

**Delete confirmation:**
- Add an `AlertDialog` that warns "This will permanently delete the category and move all products to uncategorized"
- On confirm, call `supabase.from('categories').delete().eq('id', categoryId)`, invalidate cache, reload

**File: `src/hooks/useProducts.tsx`** -- no changes needed (cache invalidation already exported)
