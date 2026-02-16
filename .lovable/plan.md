

## Fix: Title and Description on Separate Rows

**Problem**: The title ("Appointment Flow") and description are appearing on the same line instead of two separate rows. This is because the `h1` element uses `inline-flex`, making it an inline element that doesn't force a line break before the subtitle.

**Solution**: Change the `h1` from `inline-flex` to `flex` so it takes the full width of its container, naturally pushing the subtitle to the next row.

---

### Technical Details

**File**: `src/components/layout/BrandedPageHeader.tsx` (line 184)

Change the editable title's class from `inline-flex` to `flex`:

```tsx
// Before
onTitleEdit && "cursor-pointer hover:bg-white/10 rounded px-1 -mx-1 transition-colors group/title inline-flex items-center gap-1.5"

// After
onTitleEdit && "cursor-pointer hover:bg-white/10 rounded px-1 -mx-1 transition-colors group/title flex items-center gap-1.5"
```

This single change ensures:
- Row 1: Title with edit icon
- Row 2: Description with edit icon

