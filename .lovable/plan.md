

## Add Fullscreen Functionality to All Video Components

### Overview
Currently, the `VideoLearningInterface` already has a custom fullscreen button that appears on hover. However, other video display components (used in markdown content, video displays, and the markdown editor) only rely on the browser's built-in fullscreen controls (right-click or iframe button), which are not always visible or intuitive.

This plan adds a consistent, user-friendly fullscreen button to all video embed locations.

---

### Components to Update

| Component | Location | Current State |
|-----------|----------|---------------|
| `VideoEmbed` | `src/lib/video-embed-utils.tsx` | Has `allowFullScreen` but no visible button |
| `VideoDisplay` | `src/components/video-editing/VideoDisplay.tsx` | Has `allowFullScreen` but no visible button |
| `CodeMirrorMarkdownEditor` | `src/components/markdown/CodeMirrorMarkdownEditor.tsx` | Widget has `allowfullscreen` but no button |

---

### Implementation Plan

#### 1. Update VideoEmbed Component (`src/lib/video-embed-utils.tsx`)

Add a fullscreen button overlay that appears on hover:

- Add state management for fullscreen
- Add a container ref for the Fullscreen API
- Add event listeners for fullscreen changes
- Add a hover-triggered button with Maximize/Minimize icons
- Style the button to appear in the bottom-right corner

**Changes:**
- Import `useState`, `useRef`, `useEffect`, `useCallback` from React
- Import `Maximize`, `Minimize` icons from lucide-react
- Import `Button` from UI components
- Add `group` class to container for hover detection
- Add fullscreen toggle button with opacity transition

#### 2. Update VideoDisplay Component (`src/components/video-editing/VideoDisplay.tsx`)

Apply the same pattern to each video in the list:

- Wrap each video iframe in a container with fullscreen capability
- Add hover-triggered fullscreen button
- Use the same styling as VideoEmbed for consistency

#### 3. Update CodeMirrorMarkdownEditor Widget (`src/components/markdown/CodeMirrorMarkdownEditor.tsx`)

The VideoEmbedWidget class creates DOM elements directly, so:

- Add a fullscreen button element to the widget's `toDOM()` method
- Attach click handler using addEventListener
- Style with CSS for hover visibility

---

### Visual Design

All fullscreen buttons will follow this consistent pattern:

```
┌─────────────────────────────────────┐
│                                     │
│         Video Player Area           │
│                                     │
│                              ┌────┐ │
│                              │ ⛶ │ │ ← Fullscreen button (visible on hover)
└──────────────────────────────┴────┴─┘
```

- Button appears on hover with smooth opacity transition
- Dark semi-transparent background for visibility
- Maximize icon when not fullscreen, Minimize when fullscreen
- Positioned at bottom-right corner

---

### Technical Details

**Fullscreen API usage:**
```typescript
// Enter fullscreen
containerRef.current.requestFullscreen();

// Exit fullscreen
document.exitFullscreen();

// Detect fullscreen changes
document.addEventListener('fullscreenchange', handleChange);
```

**Button styling:**
```typescript
className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 
           transition-opacity duration-200 bg-black/70 hover:bg-black/90 
           text-white border-0 h-9 w-9"
```

---

### Files to Modify

| File | Changes |
|------|---------|
| `src/lib/video-embed-utils.tsx` | Convert to stateful component with fullscreen toggle |
| `src/components/video-editing/VideoDisplay.tsx` | Add fullscreen button to each video |
| `src/components/markdown/CodeMirrorMarkdownEditor.tsx` | Add fullscreen button to video widget DOM |

---

### Testing Checklist

After implementation:
- [ ] Hover over a video in the learning interface - fullscreen button appears
- [ ] Click fullscreen button - video enters fullscreen mode
- [ ] Press Escape or click minimize - exits fullscreen
- [ ] Test on videos embedded in markdown content
- [ ] Test in the CodeMirror editor preview
- [ ] Verify button visibility on both light and dark themes
- [ ] Test on mobile (touch to show button)

