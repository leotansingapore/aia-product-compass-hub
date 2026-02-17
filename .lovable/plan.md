

## Enhance "Create Category" Dialog with Description and Clean URL Navigation

### Changes

**File: `src/components/layout/AppSidebar.tsx`**

1. **Add description state**: New `newCategoryCreateDescription` state variable for the description field.

2. **Update `handleCreateCategory`**:
   - Insert both `name` and `description` into the `categories` table.
   - After successful creation, generate a clean slug from the category name using `createSlug()` from `slugUtils.ts`.
   - Use the returned category `id` to navigate to `/category/<id>` (since the route uses `categorySlugOrId`).
   - Remove `window.location.reload()` -- navigate directly instead.

3. **Improve the Create Category Dialog UX**:
   - Add a `Textarea` for the description field (optional, with placeholder text).
   - Add a brief helper subtitle under the dialog title: "Add a new product category to organize your content."
   - Keep the 50-character limit on the name field.
   - Reset both name and description on close.
   - Enter key on name field moves focus to description; Enter on description does not submit (since it's a textarea).

4. **Clean up state on dialog close**: Reset `newCategoryCreateDescription` alongside `newCategoryCreateName`.

### Technical Details

```text
Dialog Layout:
+----------------------------------+
| Create New Category          [X] |
| Add a new product category to    |
| organize your content.           |
|                                  |
| Name                             |
| [________________________] 0/50  |
|                                  |
| Description (optional)           |
| [________________________]      |
| [________________________]      |
|                                  |
|            [Cancel]  [Create]    |
+----------------------------------+
```

- Uses existing `Textarea` component from `@/components/ui/textarea`
- After creation, navigates to `/category/<new-id>` using the ID returned from the Supabase insert (with `.select('id').single()`)
- Invalidates categories cache so sidebar updates without full reload
