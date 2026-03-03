

# Add Resources Feature to Module Editor Pages

## Overview
Add an "ADD" dropdown button and a "Resources" display section to each module/lecture editor page. This lets admins attach resource links, upload resource files, and add transcripts to individual lectures. Students see the same resources as clickable links/downloads.

## Key Insight: Data Model Already Exists
The `TrainingVideo` interface already has the needed fields:
- `useful_links` (array of `{name, url, icon}`)
- `attachments` (array of `{id, name, url, file_size, file_type}` via `VideoAttachment`)
- `transcript` (string)

No database migration is needed -- resources are stored in the `training_videos` JSONB column on the `products` table.

## Implementation Plan

### 1. Create `ModuleResourcesSection` Component
**File:** `src/components/video-editing/ModuleResourcesSection.tsx`

Displays the combined list of resources (links + files) with appropriate icons:
- Link icon for URL resources
- Red PDF icon for PDFs
- Document icon for other files
- Each item is clickable (opens in new tab)
- Admin view: shows edit/delete buttons per resource
- Student view: read-only clickable list

### 2. Create `AddResourceDropdown` Component
**File:** `src/components/video-editing/AddResourceDropdown.tsx`

An "ADD" dropdown button (styled per the reference screenshots) with options:
- **Add resource link** -- opens a dialog with Label (max 34 chars with counter) and URL fields, Cancel and Add (gold/yellow) buttons
- **Add resource file** -- triggers file upload (PDF, images, DOCX, etc.) to the `knowledge-files` storage bucket, then adds to `attachments`
- **Add transcript** -- scrolls to / reveals the transcript textarea

### 3. Create `AddLinkDialog` Component
**File:** `src/components/video-editing/AddLinkDialog.tsx`

Modal dialog matching the reference screenshot:
- Label field with 34-character max and live character count
- URL field
- Cancel button and gold/yellow "ADD" button
- Validation: both fields required, URL format check

### 4. Update `RichContentEditor` to Accept Resources Props
**File:** `src/components/markdown/RichContentEditor.tsx`

Add new props:
- `resources` (combined links + attachments)
- `onAddLink`, `onAddFile`, `onDeleteResource`
- Render `ModuleResourcesSection` between content and transcript
- Render `AddResourceDropdown` at the bottom

### 5. Update `VideoEditForm` to Pass Resources Data
**File:** `src/components/video-editing/VideoEditForm.tsx`

Wire up the resources props from the `TrainingVideo` to the `RichContentEditor`:
- Pass `useful_links` and `attachments` as resources
- Handle add/delete callbacks that update the video via `handleChange`
- Handle file upload to Supabase storage

### 6. Update Student View (Non-Admin)
**File:** `src/components/video-learning/VideoLearningInterface.tsx` (or relevant student-facing component)

Display the Resources section read-only:
- Show "Resources" heading with the icon list
- Links open in new tab, files download/open in new tab
- Show transcript content below resources if present

## Technical Details

- File uploads use the existing `knowledge-files` Supabase storage bucket (already public)
- Resources are persisted as part of the `training_videos` JSONB -- no new tables needed
- The ADD dropdown uses Radix `DropdownMenu` for proper z-index and non-transparent background
- Character count on the label field uses controlled input with `maxLength={34}`
- Gold/yellow button uses a custom class or inline style matching the reference

## Files to Create
1. `src/components/video-editing/ModuleResourcesSection.tsx`
2. `src/components/video-editing/AddResourceDropdown.tsx`
3. `src/components/video-editing/AddLinkDialog.tsx`

## Files to Modify
1. `src/components/markdown/RichContentEditor.tsx` -- add resources section
2. `src/components/video-editing/VideoEditForm.tsx` -- wire resources props
3. `src/hooks/useProducts.tsx` -- no changes needed (interfaces already exist)

