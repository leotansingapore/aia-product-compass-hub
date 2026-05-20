// `useful_links` on a Product can be one of three shapes — legacy flat array,
// `{type: 'with_files', links, files}`, or `{type: 'folder_structure', folders: [{links}]}`.
// Counting/filtering callers that only check `Array.isArray(...)` silently treat
// folder-structure products (e.g. UCC, Secure Flexi Term) as having zero links.
export function countUsefulLinks(raw: unknown): number {
  if (!raw) return 0;
  if (Array.isArray(raw)) return raw.length;
  const obj = raw as { type?: string; links?: unknown; files?: unknown; folders?: unknown };
  if (obj.type === "with_files") {
    return (Array.isArray(obj.links) ? obj.links.length : 0) +
      (Array.isArray(obj.files) ? obj.files.length : 0);
  }
  if (obj.type === "folder_structure" && Array.isArray(obj.folders)) {
    return obj.folders.reduce(
      (sum: number, f: { links?: unknown[] }) => sum + (Array.isArray(f?.links) ? f.links.length : 0),
      0,
    );
  }
  return 0;
}
