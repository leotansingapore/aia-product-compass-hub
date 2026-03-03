

## Plan: Hide Empty Video Card When No Content

**Problem**: When a video entry has `rich_content` but no valid video URL, the top `Card` component (lines 252-309) renders empty — no header (hidden by the condition) and no video player (returns null). This leaves a visible empty card.

**Fix**: Wrap the entire Card in a condition so it only renders when there's actually something to display.

### Change in `VideoLearningInterface.tsx`

**Lines 252-309** — Wrap the Card:

```tsx
{/* Only render the video card if there's a video to show OR no rich content (fallback message) */}
{(videoInfo || !currentVideo?.rich_content) && (
  <Card>
    {/* ...existing CardHeader and CardContent... */}
  </Card>
)}
```

This means:
- **Has video URL** → show the card with embedded player (with or without rich_content below)
- **No video URL + no rich_content** → show the "Invalid video URL" fallback card
- **No video URL + has rich_content** → skip the card entirely, only show the markdown content card below

**Single file edit**: `src/components/video-learning/VideoLearningInterface.tsx`

