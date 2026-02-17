

## Fix: Remove Full-Page Reload on Category Delete and Rename

### Problem
Two issues causing full-page refreshes:

1. **Rename handler** (line 126) explicitly calls `window.location.reload()` — this is a leftover from before the cache invalidation was properly set up.
2. **Delete handler** calls `invalidateCategoriesCache()` which only clears a module-level variable but does NOT trigger a re-render in components using `useCategories`. The `useCategories` hook uses a custom in-memory cache (`categoriesCache`) that is separate from React Query, so `queryClient.invalidateQueries` alone doesn't update the sidebar.

### Solution

**File: `src/components/layout/AppSidebar.tsx`**

1. **Rename handler**: Remove `window.location.reload()`. Instead, `await` the query invalidation and call `refetch` from `useCategories` to update the sidebar in-place.
2. **Delete handler**: Already correct (no reload), but ensure the categories list updates by calling `refetch` after invalidation.

To make `refetch` available, destructure it from `useCategories`:
```
const { categories, refetch: refetchCategories } = useCategories();
```

**Updated rename handler:**
- Remove `window.location.reload()`
- Add `await queryClient.invalidateQueries({ queryKey: ['categories'] })`
- The sidebar will update reactively without a page refresh

**Updated delete handler:**
- Keep existing logic (already no reload)
- Ensure sidebar updates by also awaiting the invalidation

### Technical Details

Both handlers will follow the same pattern already used in `handleCreateCategory`:
```
invalidateCategoriesCache();
await queryClient.invalidateQueries({ queryKey: ['categories'] });
toast({ ... });
navigate("/");
```

This is a minimal two-line change in the rename handler (remove `window.location.reload()`, add `await queryClient.invalidateQueries`).

