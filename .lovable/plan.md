

## Smarter Delete Category Dialog with Product Count Warning

### Problem
The current delete confirmation is a generic "this will delete everything" message. It doesn't tell the admin **how many products** are inside the category, which is critical information before a destructive action.

### Solution

When the admin clicks "Delete" on a category, fetch the product count for that category and display a context-aware warning in the confirmation dialog:

- **0 products**: "This category is empty. It will be permanently removed."
- **1+ products**: "This category contains **X product(s)** that will be permanently deleted along with all associated files. This action cannot be undone." with a warning icon/alert styling to make the impact clear.

Additionally, add a **loading state** on the Delete button while the deletion is in progress, and **disable** it to prevent double-clicks.

### Changes

**File: `src/components/layout/AppSidebar.tsx`**

1. **Add state**: `deletingInProgress` (boolean) for button loading state and `deleteCategoryProductCount` (number) to store the count.

2. **Fetch product count on delete trigger**: When `setDeletingCategory` is called (from the dropdown menu), immediately query `supabase.from('products').select('id', { count: 'exact' }).eq('category_id', id)` to get the count, and store it in state.

3. **Update AlertDialog content**:
   - Show the product count in the warning message.
   - Use a warning icon (`AlertTriangle` from lucide) when products exist.
   - Conditionally style the description with amber/yellow warning color when products > 0.

4. **Delete button loading state**: Show a spinner and "Deleting..." text while `deletingInProgress` is true. Disable the button during deletion.

5. **Reset states on dialog close**: Clear `deleteCategoryProductCount` and `deletingInProgress`.

### UI Layout

```text
+------------------------------------------+
| Delete "Investment Products"?            |
|                                          |
| /!\ Warning: This category contains     |
| 5 product(s) that will be permanently    |
| deleted along with all associated files. |
| This action cannot be undone.            |
|                                          |
|              [Cancel]  [Deleting...]     |
+------------------------------------------+
```

For empty categories:
```text
+------------------------------------------+
| Delete "Empty Category"?                 |
|                                          |
| This category is empty. It will be       |
| permanently removed.                     |
|                                          |
|              [Cancel]  [Delete]          |
+------------------------------------------+
```

### Technical Details

- Product count query uses `{ count: 'exact', head: true }` for efficiency (no row data returned).
- The count fetch happens when the user opens the delete dialog, not on every render.
- `deletingInProgress` prevents double-submission and provides visual feedback.
- All new state resets when the dialog closes.

