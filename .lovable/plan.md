

## Improve Hover Effects and Add Tooltips to ProductCard

### Problem
- The bookmark button and ellipsis button have barely visible hover states (ghost variant blends in)
- No tooltips to indicate what the icons do
- Transitions are abrupt with no easing

### Changes

**File: `src/components/ProductCard.tsx`**

1. **Import Tooltip components** from `@/components/ui/tooltip` (Tooltip, TooltipTrigger, TooltipContent, TooltipProvider)

2. **Bookmark button** (lines 118-133):
   - Add `transition-all duration-300 ease-in-out` for smooth hover
   - Change hover to `hover:bg-gray-100 dark:hover:bg-gray-700` for clear visibility
   - Wrap in `Tooltip` with content "Bookmark" / "Remove Bookmark" based on state

3. **Ellipsis/MoreVertical button** (lines 137-140):
   - Add `transition-all duration-300 ease-in-out` for smooth hover
   - Change hover to `hover:bg-gray-100 dark:hover:bg-gray-700`
   - Wrap in `Tooltip` with content "More options"

4. **Learn More button** (line 181):
   - Add `transition-all duration-300 ease-in-out` for smooth hover effect

5. **Card itself** (line 110):
   - Update from `transition-shadow` to `transition-all duration-300 ease-in-out` for smoother card hover

6. **Wrap the card header icons area** in a `TooltipProvider` with `delayDuration={300}`

### Technical Details

```typescript
// Bookmark button with tooltip
<TooltipProvider delayDuration={300}>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleBookmarkClick}
        disabled={loading}
        className={cn(
          "h-8 w-8 p-0 transition-all duration-300 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-700",
          bookmarked && "text-primary"
        )}
      >
        {bookmarked ? <BookmarkCheck /> : <Bookmark />}
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>{bookmarked ? "Remove bookmark" : "Bookmark"}</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

Same pattern applied to the ellipsis button with tooltip text "More options".

