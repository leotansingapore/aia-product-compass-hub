
## Add Ellipsis Menu to Product Cards (Edit & Delete)

### Overview
Add a three-dot (ellipsis) menu to each product card on category pages, visible only to admins. The menu will allow editing product fields (title, description, tags, highlights) and deleting products -- matching the fields used during module creation.

### Changes

**File: `src/components/ProductCard.tsx`**
- Add an ellipsis (`MoreVertical`) icon button in the top-right area of each card (next to the bookmark icon)
- Show the ellipsis only for admin users (using `usePermissions`)
- Attach a `DropdownMenu` with two options: "Edit" and "Delete"
- Use `focus:bg-muted` for gray hover (consistent with sidebar dropdown fix)
- "Edit" opens an inline edit dialog/modal with fields: Title, Description, Tags (comma-separated), Highlights (comma-separated) -- mirroring `CreateModuleForm`
- "Delete" shows a confirmation dialog (`AlertDialog`) before deleting
- Add `onEdit` and `onDelete` optional callback props

**File: `src/components/category/ProductsGrid.tsx`**
- Pass `onEdit` and `onDelete` callbacks to each `ProductCard`
- Accept these callbacks from the parent

**File: `src/pages/ProductCategory.tsx`**
- Implement `handleDeleteProduct` -- calls `supabase.from('products').delete().eq('id', productId)` then refetches
- Implement `handleEditProduct` -- calls `supabase.from('products').update({...}).eq('id', productId)` then refetches
- Pass these handlers to `ProductsGrid`

### Technical Details

**Edit Dialog fields** (matching CreateModuleForm):
- Title (Input, required)
- Description (Textarea)
- Tags (Input, comma-separated)
- Highlights (Input, comma-separated)

**Delete flow:**
- Confirmation via `AlertDialog` ("Are you sure? This action cannot be undone.")
- Calls `supabase.from('products').delete().eq('id', productId)`
- Refetches product list on success

**Ellipsis positioning:**
- Placed in the card header, in the `flex justify-between items-start` row alongside the bookmark button
- Only rendered when `isAdmin()` returns true

**Hover styling:**
- Menu items use `focus:bg-muted focus:text-foreground` for simple gray hover
- Delete item uses `text-destructive` color
