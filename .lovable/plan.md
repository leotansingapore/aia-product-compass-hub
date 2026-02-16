

## Add Inline Editable Product Title in Header

Make the product title in the branded page header clickable for admins, with a hover effect and inline editing that auto-saves.

---

### What Changes

1. **ProductHeader** (`src/components/product-detail/ProductHeader.tsx`) -- Pass edit callback and admin state; render an editable title instead of plain text when admin
2. **BrandedPageHeader** (`src/components/layout/BrandedPageHeader.tsx`) -- Accept an optional `onTitleEdit` callback; when provided, render the title with a hover underline/highlight effect and switch to an inline input on click, auto-saving on blur or Enter
3. **Auto-save behavior** -- On blur or pressing Enter, save the new title via the existing `handleUpdate('title', newValue)` flow from `useProductDetail`

---

### Technical Details

**File: `src/components/layout/BrandedPageHeader.tsx`**
- Add optional prop `onTitleEdit?: (newTitle: string) => Promise<void>`
- When `onTitleEdit` is provided, wrap the `<h1>` title in a clickable container with:
  - `cursor-pointer` and a subtle `hover:bg-white/10 rounded px-1 -mx-1` effect (light highlight on dark header)
  - A small edit icon (Pencil) that appears on hover (opacity transition)
- On click, replace the title text with an `<input>` styled to match the header (white text, transparent background, same font size)
  - Auto-focus, select all text
  - On blur or Enter: call `onTitleEdit(newValue)` then exit edit mode
  - On Escape: cancel and revert
  - Max 100 characters

**File: `src/components/product-detail/ProductHeader.tsx`**
- Accept optional `onTitleEdit` prop and pass it through to `BrandedPageHeader`

**File: `src/pages/ProductDetail.tsx`**
- Pass `onTitleEdit` to `ProductHeader`:
  ```
  onTitleEdit={isAdminMode ? (newTitle) => handleUpdate('title', newTitle) : undefined}
  ```

This applies to all product detail pages across every category since they all use the same `ProductHeader` component.

