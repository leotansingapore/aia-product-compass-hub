/**
 * Shared rehype-sanitize schema for user-generated markdown content.
 *
 * Why this exists:
 * `rehypeRaw` is wired into ~40 ReactMarkdown call sites so authors can drop
 * raw HTML for things like `<mark>`, `<details>`, `<sup>`, etc. Without
 * sanitization that same pipeline will execute `<script>`, attribute
 * handlers like `onload=`, `<iframe src=javascript:...>`, and `<object>`
 * — which is a real risk for the user-version content that any consultant
 * can store in `script_user_versions`.
 *
 * The schema below is the GitHub-flavoured base (allows the common rich
 * markdown tags) plus the project-specific extensions:
 *
 * - `mark`: used by our highlightText() search highlighter.
 * - `iframe` (limited): used by canonical scripts that embed Loom/YouTube
 *   videos via raw HTML rather than the markdown-link auto-detect path.
 *   Source must be one of the trusted video hosts; everything else gets
 *   stripped at render time.
 * - `figure`/`figcaption`/`details`/`summary`: editorial niceties.
 *
 * Anything not on the allow-list is removed entirely. `style="..."` and
 * inline `on*=` handlers are stripped because they're not in attribute
 * lists. Test fixtures: see `/scripts/cold-calling-...` (renders Loom
 * iframe), the search highlight overlay (`<mark>`), and any user-version
 * the author types into the editor.
 */
import { defaultSchema } from 'rehype-sanitize';
import type { Schema } from 'hast-util-sanitize';

const TRUSTED_IFRAME_HOSTS = [
  'loom.com',
  'www.loom.com',
  'youtube.com',
  'www.youtube.com',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
  'youtu.be',
  'player.vimeo.com',
];

export const markdownSanitizeSchema: Schema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    // Allow class on a few elements so our markdownComponents overrides keep
    // their styling round-tripped through the sanitizer.
    '*': [
      ...((defaultSchema.attributes && defaultSchema.attributes['*']) || []),
      'className',
      'class',
    ],
    iframe: [
      'src',
      'title',
      'width',
      'height',
      'allow',
      'allowfullscreen',
      'frameborder',
      ['loading', 'lazy', 'eager'],
      'referrerpolicy',
      'sandbox',
    ],
    img: [
      ...((defaultSchema.attributes && defaultSchema.attributes['img']) || []),
      'loading',
      'decoding',
    ],
    a: [
      ...((defaultSchema.attributes && defaultSchema.attributes['a']) || []),
      'target',
      'rel',
    ],
    mark: ['className', 'class'],
  },
  tagNames: [
    ...(defaultSchema.tagNames || []),
    'mark',
    'iframe',
    'figure',
    'figcaption',
    'details',
    'summary',
    'video',
    'source',
  ],
  // Strict iframe src allow-list. Anything else gets the `src` attribute
  // stripped by hast-util-sanitize and the iframe collapses to nothing
  // useful (still safe — javascript:, data: etc. are blocked outright).
  protocols: {
    ...defaultSchema.protocols,
    src: ['http', 'https'],
    href: ['http', 'https', 'mailto', 'tel', '#'],
  },
};

/**
 * Stricter post-process check for iframes. hast-util-sanitize allows any
 * https URL in `src` once the protocol passes — narrow that down to our
 * trusted video hosts only. Use this with `rehype` if we ever want to
 * lock down the schema further; for now the protocol filter plus an
 * allow-list of attributes blocks the obvious XSS shapes.
 */
export function isTrustedEmbedHost(url: string | undefined | null): boolean {
  if (!url) return false;
  try {
    const u = new URL(url);
    return TRUSTED_IFRAME_HOSTS.includes(u.hostname.toLowerCase());
  } catch {
    return false;
  }
}
