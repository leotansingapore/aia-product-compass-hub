

## Add Image Upload Support to Insert Image Dialog

Currently, the "Insert Image" dialog in the markdown editor only accepts a URL. This plan adds a file upload option (drag-and-drop, browse, paste) alongside the existing URL input, reusing the existing `MediaUploadZone` component and Supabase storage infrastructure.

### What Changes

**File: `src/components/markdown/CodeMirrorMarkdownEditor.tsx`**

1. **Add upload tab to the Image Dialog** -- Replace the current single URL input with a tabbed interface:
   - **Tab 1: Upload** -- Embeds a simplified upload zone (drag-and-drop, browse, paste) that uploads to Supabase storage (`knowledge-files` bucket) and auto-fills the Image URL field on success.
   - **Tab 2: URL** -- Keeps the existing URL input as-is.

2. **New state variables**:
   - `imageTab` (`'upload' | 'url'`) to track which tab is active
   - `isUploadingImage` (boolean) for loading state during upload

3. **Upload handler**: Reuse the same Supabase storage upload logic from `MediaUploadZone` -- upload to `knowledge-files/editor-images/`, generate public URL, and set it into `imageUrl` state automatically.

4. **Flow**: After upload completes, the URL field auto-populates and the user can adjust alt text, then click "Insert Image" as before. The markdown `![alt](url)` is inserted into the editor.

### Technical Details

- Import `supabase` client, `Tabs`/`TabsList`/`TabsTrigger`/`TabsContent` from UI, and `Upload`/`Loader2` icons
- Upload path: `knowledge-files` bucket, `editor-images/{timestamp}.{ext}` 
- File validation: images only, max 10MB (same as `MediaUploadZone`)
- The "Insert Image" button remains disabled until a URL is present (either typed or from upload)
- No new components needed -- all changes are within the existing dialog in `CodeMirrorMarkdownEditor.tsx`

