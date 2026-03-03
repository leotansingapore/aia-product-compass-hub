

# Fix Vimeo URL Support for Management/Private Links

## Problem
The Vimeo URL format `https://vimeo.com/manage/videos/1169804577/930c086c69` (management URLs) and private video URLs with hash keys are not recognized by any of the video detection functions. The current regex (`vimeo\.com\/(\d+)`) only matches simple `vimeo.com/123456` URLs.

## Solution
Update all Vimeo regex patterns across the codebase to support additional URL formats:
- `vimeo.com/manage/videos/ID/HASH` (management URLs)
- `vimeo.com/ID/HASH` (private/unlisted videos)
- `vimeo.com/video/ID` (existing)
- `vimeo.com/ID` (existing)

## Files to Update (4 files)

### 1. `src/components/markdown/RichContentEditor.tsx` (line 113)
Update the Vimeo regex in `detectVideoUrl()` from:
```
/vimeo\.com\/(\d+)/
```
to:
```
/vimeo\.com\/(?:manage\/videos\/|video\/)?(\d+)/
```

### 2. `src/lib/video-embed-utils.tsx` (line 33)
Update `detectVideoEmbed()` Vimeo regex from:
```
/vimeo\.com\/(?:video\/)?(\d+)/
```
to:
```
/vimeo\.com\/(?:manage\/videos\/|video\/)?(\d+)/
```

### 3. `src/components/video-editing/videoUtils.ts` (line 22)
Update `getVideoEmbedInfo()` Vimeo regex to also include the `manage/videos/` path segment.

### 4. `src/components/video-learning/VideoLearningInterface.tsx` (line 51)
Same regex update for the video learning player.

## Technical Detail
All four regexes will use the same updated pattern that optionally matches `manage/videos/` or `video/` before capturing the numeric video ID. The hash portion after the ID is ignored since the embed URL only needs the numeric ID (`https://player.vimeo.com/video/1169804577`).

