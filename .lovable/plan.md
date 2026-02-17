

## Fix: Instant Sidebar Update When Creating a Category

### Problem
When you create a new category, the sidebar doesn't update immediately. The new category only appears after a page refresh. This happens because:

1. `handleCreateCategory` clears a module-level cache and calls `queryClient.invalidateQueries`, but `useCategories` **doesn't use React Query** — it uses its own custom state management.
2. The critical `await refetchCategories()` call is **missing** from the create handler (it was added to rename and delete handlers in a previous fix, but not to create).

### Solution
Add `await refetchCategories()` to the `handleCreateCategory` function, matching the pattern already used in the rename and delete handlers. This forces the sidebar's `useCategories` instance to re-query Supabase and update immediately.

### Changes

**File: `src/components/layout/AppSidebar.tsx`**

In `handleCreateCategory`, after the successful insert, add `await refetchCategories()` before navigating:

```
invalidateCategoriesCache();
await queryClient.invalidateQueries({ queryKey: ['categories'] });
await refetchCategories();  // <-- ADD THIS LINE
toast({ title: "Success", description: "Category created successfully" });
navigate(`/category/${data.id}`);
```

This is a **one-line addition** that aligns the create flow with the already-fixed rename and delete flows.

