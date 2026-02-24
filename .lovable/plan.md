
# Fix: Sidebar Navigation Shows Stale Product Content

## Problem
When navigating between products via sidebar links, the training videos (Course Structure) from the **previous** product persist and display on the **new** product page. This happens because the video management hook only syncs videos on initial mount (when `editVideos` is empty), not when switching products.

**Root Cause**: In `useVideoManagement.ts`, the sync condition checks `editVideos.length === 0`, which is false after the first product loads -- so when you click a different product in the sidebar, the old videos stay.

**Why cards work but sidebar doesn't**: Clicking a card from the category page causes a fresh mount of ProductDetail. Sidebar navigation only changes the URL param, so the component **re-renders** without unmounting, and the stale guard prevents video refresh.

## Solution

### 1. Reset video state when product changes (`useVideoManagement.ts`)
- Accept a `productId` (or key) prop so the hook can detect when the product changes
- When the key changes, reset `editVideos` to the new `initialVideos`
- Reset `editingIndex`, `emptyFolders`, and `initialVideosRef` accordingly

### 2. Pass product ID into useVideoManagement (`ProductDetail.tsx`)
- Pass `product.id` as a dependency key to the video management hook

### 3. Reset local UI state on product change (`ProductDetail.tsx`)
- Reset `editingIndexFromUrl` to `null` when `productSlugOrId` changes so the auto-select logic re-runs for the new product

## Technical Details

**File: `src/hooks/useVideoManagement.ts`**
- Add a `key` or `productId` field to the props interface
- Replace the mount-only sync `useEffect` with one that also triggers when `key` changes:
  ```
  useEffect(() => {
    setEditVideos(initialVideos || []);
    initialVideosRef.current = JSON.stringify(initialVideos || []);
    setEditingIndex(null);
    setEmptyFolders([]);
  }, [key]); // re-sync whenever the product changes
  ```

**File: `src/pages/ProductDetail.tsx`**
- Pass `product?.id` as a key/identifier to `useVideoManagement`
- Add a `useEffect` keyed on `productSlugOrId` to reset `editingIndexFromUrl` to `null`

This is a minimal, targeted fix that preserves the existing "don't overwrite local edits" behavior while correctly resetting state on product switches.
