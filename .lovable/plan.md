
## Make Category Header Title and Description Editable Inline

### Overview
Add inline editing for the category page header's **title** and **description** (separately), matching the existing inline edit pattern already used for product titles. Admin-only, with smooth transitions and pencil icon hints.

### Changes

**File: `src/components/layout/BrandedPageHeader.tsx`**
- Add a new prop `onSubtitleEdit?: (newSubtitle: string) => Promise<void>`
- Add subtitle editing state (`isEditingSubtitle`, `subtitleEditValue`, `subtitleInputRef`)
- When `onSubtitleEdit` is provided and subtitle is not being edited:
  - Show subtitle as clickable with `cursor-pointer hover:bg-white/10 rounded transition-all duration-300 ease-in-out` and a fading `Pencil` icon (same pattern as title)
- When editing subtitle:
  - Show an `<input>` (single line) styled to match the subtitle text size, with `ring-1 ring-white/30` focus ring
  - Save on Enter/blur, cancel on Escape
- Ensure title and subtitle are **separate** inline editors (independent state, independent save callbacks)
- Add `transition-all duration-300 ease-in-out` to the title's hover state as well for consistency

**File: `src/pages/ProductCategory.tsx`**
- Add `handleCategoryTitleEdit` -- updates `categories` table `name` field via Supabase, then refetches
- Add `handleCategoryDescriptionEdit` -- updates `categories` table `description` field via Supabase, then refetches
- Pass `onTitleEdit` and `onSubtitleEdit` to `BrandedPageHeader` (only when `isAdmin()` is true)
- Strip the emoji prefix from the title before passing to `onTitleEdit` so only the text name is saved

**File: `src/hooks/useProductCategory.ts`**
- Expose `refetchCategories` from `useCategories()` so the page can refresh category data after edits

**File: `src/hooks/useProducts.tsx`**
- Ensure `useCategories` returns a `refetch` function (check if it already does; if not, add it)

### Technical Details

```text
Category Header
+--------------------------------------------+
| [Back]  Title (click to edit)        [Pencil icon fades in on hover]
|         Description (click to edit)  [Pencil icon fades in on hover]
+--------------------------------------------+
```

- Title edit saves to `categories.name` where `id = categoryId`
- Description edit saves to `categories.description` where `id = categoryId`  
- Both use `supabase.from('categories').update({...}).eq('id', categoryId)`
- Toast feedback on success/error
- Transitions: `transition-all duration-300 ease-in-out` on hover states
- Only shown for admin users -- non-admins see static text as before
