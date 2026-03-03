

## Plan: Open Transcript Accordion by Default

Single change in `VideoEditingLayout.tsx`: Add the `open` attribute to the `<details>` element for the Transcript accordion so it's expanded by default when a video is selected.

Currently at ~line 220, the `<details>` element only has `open={isEditorEditing}`. Change this to always be open: `open` (or `open={true}`).

