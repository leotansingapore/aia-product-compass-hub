

# Add "Sync to AI" Button on Product Detail Page (Admin Only)

## What This Does
Adds a small "Sync to AI" button directly on each product's detail page (e.g., Pro Achiever). Only admins will see it. Clicking it triggers the `process-knowledge` edge function with `sync_training_videos` for that specific product, so training content gets embedded into the vector store without navigating to the admin panel.

## Where It Goes
The button will be placed in the **top actions bar** (next to the Bookmark button) on the `ProductDetail` page, visible only when `isAdmin` is true.

## Technical Details

### New Component: `src/components/product-detail/ProductSyncButton.tsx`
- A small button with a "Sync to AI" label and a Database/RefreshCw icon
- Calls `supabase.functions.invoke("process-knowledge", { body: { action: "sync_training_videos", product_id: productId } })` on click
- Shows loading spinner while syncing
- Displays a toast with the result (chunks created/embedded count)
- Only renders when the user is an admin (checked via `useAdmin()`)

### Modified File: `src/pages/ProductDetail.tsx`
- Import `ProductSyncButton`
- Add it to the top actions bar (line 143-145), next to `BookmarkButton`, wrapped in an `isAdmin` check:
  ```
  {isAdmin && <ProductSyncButton productId={product.id} productName={product.title} />}
  ```

### Edge Function: No changes needed
The existing `process-knowledge` function already supports `sync_training_videos` with an optional `product_id` parameter to scope to a single product.

