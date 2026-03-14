
## Problem
The two filter dropdowns both show just "All" when at their default — no label indicates one is "Audience" and the other is "Product Type". The `SelectValue placeholder` text only shows when nothing is selected, but since the default value is `"All"`, the placeholder never appears.

## Fix
Add a visible label prefix inside each `SelectTrigger` so the dropdown always reads **"Audience: All"** / **"Product: All"** etc., even when the default is selected.

### Approach
Wrap the `SelectValue` in a small label span inside the trigger:

```tsx
<SelectTrigger className="w-full sm:w-48">
  <span className="text-muted-foreground text-xs mr-1 shrink-0">Audience:</span>
  <SelectValue />
</SelectTrigger>
```

Same for Product.

### File to edit
- `src/pages/ConceptCards.tsx` — lines 371–386, update both `SelectTrigger` blocks

No other files need changing.
