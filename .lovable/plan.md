

## Add Ellipsis Menu to Sidebar Category Items

Add a three-dot dropdown menu to each category item in the sidebar's "Product Categories" section. The menu will include an option to rename the category. This feature will be admin-only.

---

### What You'll See

- A small three-dot icon (ellipsis) appears on hover (or always visible) next to each category name in the sidebar
- Clicking it opens a dropdown with an "Edit Name" option
- Selecting "Edit Name" opens a small inline dialog or popover where you can type the new name and save it
- The change persists to the database immediately

---

### Technical Details

**1. Update `src/components/layout/AppSidebar.tsx`**

- Import `MoreHorizontal`, `Pencil` icons from lucide-react
- Import `DropdownMenu`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuTrigger` from the UI components
- Import `SidebarMenuAction` from sidebar components (designed for action buttons on menu items)
- Add state for tracking which category is being edited and the new name
- For each category `SidebarMenuItem`, add a `SidebarMenuAction` containing a `DropdownMenu` with:
  - Trigger: `MoreHorizontal` icon button
  - Menu item: "Edit Name" with `Pencil` icon
- Only render the ellipsis menu when the user is an admin (`isAdmin()`)
- On "Edit Name" click, open a small dialog (`Dialog` component) with an input field pre-filled with the current name, and Save/Cancel buttons

**2. Add category update logic**

- Add a `renameCategory` function directly in `AppSidebar.tsx` (or extend `useCategories` hook) that:
  - Calls `supabase.from('categories').update({ name: newName }).eq('id', categoryId)`
  - Invalidates the categories cache (`categoriesCache = null`)
  - Shows a success toast
  - Updates local state to reflect the change immediately

**3. Files to modify**
- `src/components/layout/AppSidebar.tsx` -- add ellipsis menu and rename dialog
- `src/hooks/useProducts.tsx` -- export cache-clearing function for categories so the sidebar can invalidate it after rename

