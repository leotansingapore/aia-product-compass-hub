

## Fix Inline Edit Input Sizing

### Problem
The subtitle (and title) inline edit inputs shrink to a small size instead of matching the text width. The `<input>` fields don't auto-expand to fit their content.

### Solution
Use a CSS technique where a hidden `<span>` measures the text content and the input stretches to match. This is done by wrapping the input in a relative container with a hidden sibling that holds the same value, pushing the width naturally.

### Changes

**File: `src/components/layout/BrandedPageHeader.tsx`**

1. **Title input (lines 153-167)**: Replace the plain `<input>` with an auto-sizing wrapper:
   - Wrap in a `<div className="relative inline-grid">`  
   - Add a hidden `<span>` with the same text styling and `visibility: hidden` that sets the grid column width
   - Both the `<span>` and `<input>` sit in `grid-area: 1/1` so the input stretches to match the span's width
   - Add `min-w-[120px]` so empty fields aren't too tiny
   - Use `max-w-full` to prevent overflow

2. **Subtitle input (lines 198-212)**: Same auto-sizing pattern:
   - Same grid-based auto-sizing wrapper
   - `min-w-[200px]` since descriptions tend to be longer
   - `max-w-full` to prevent overflow

This is a well-known CSS pattern (used by libraries like `react-textarea-autosize`) that keeps the input feeling natural -- it grows and shrinks with the text content, no JavaScript measurement needed.

### Technical Detail

```text
Before:  [input w-full]  -- always full width, or shrinks oddly

After:   [inline-grid container]
           [hidden span with same text styling] -- sets natural width
           [input overlaid on span]             -- matches span width
         min-w-[120px] max-w-full
```

Both editors independently auto-size. No layout shift, no shrinking.

