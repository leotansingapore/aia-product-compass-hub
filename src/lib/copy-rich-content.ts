import { marked } from 'marked';

/**
 * Strip markdown to plain text (for fallback / WhatsApp)
 */
export function markdownToPlainText(md: string): string {
  return md
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/gs, '$1')
    .replace(/\*(.+?)\*/gs, '$1')
    .replace(/__(.+?)__/gs, '$1')
    .replace(/_(.+?)_/gs, '$1')
    .replace(/~~(.+?)~~/gs, '$1')
    .replace(/`{1,3}[^`\n]*`{1,3}/g, (m) => m.replace(/`/g, ''))
    .replace(/^\s*[-*+]\s+/gm, '• ')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/\[(.+?)\]\(.*?\)/g, '$1')
    .replace(/!\[.*?\]\(.*?\)/g, '') // images become empty in plain text
    .replace(/^>\s*/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Copy script content as both rich HTML (with images) and plain text fallback.
 * When pasted into rich-text apps (Slack, Lark, email), images will appear inline.
 * When pasted into plain-text fields (WhatsApp), clean text is used.
 */
export async function copyRichContent(md: string): Promise<void> {
  const plainText = markdownToPlainText(md);

  // Convert markdown to HTML for rich paste
  let html = '';
  try {
    const result = marked.parse(md, { async: false, gfm: true, breaks: true });
    html = typeof result === 'string' ? result : '';
  } catch {
    html = md.replace(/\n/g, '<br>');
  }

  // Try using ClipboardItem API for rich copy (works in modern browsers)
  if (typeof ClipboardItem !== 'undefined') {
    try {
      const item = new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([plainText], { type: 'text/plain' }),
      });
      await navigator.clipboard.write([item]);
      return;
    } catch {
      // Fall through to plain text
    }
  }

  // Fallback: plain text only
  await navigator.clipboard.writeText(plainText);
}
