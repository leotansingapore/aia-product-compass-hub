import { describe, it, expect } from "vitest";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import { markdownSanitizeSchema, isTrustedEmbedHost } from "./markdown-sanitize";

/**
 * These tests prove that the markdown pipeline we use across ScriptsDatabase,
 * ObjectionHandlingDatabase, PlaybookDetail (and the other markdown render
 * paths) strips the classic XSS attack vectors before React commits the DOM.
 *
 * The order matters: rehype-raw parses raw HTML strings inside markdown into
 * real hast nodes, then rehype-sanitize walks the tree and strips anything
 * not in the allow-list. This mirrors the runtime config in those files.
 */
async function renderToSafeHtml(markdown: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSanitize, markdownSanitizeSchema)
    .use(rehypeStringify, { allowDangerousHtml: false })
    .process(markdown);
  return String(file);
}

describe("markdownSanitizeSchema", () => {
  it("strips <script> tags entirely", async () => {
    const html = await renderToSafeHtml(
      'Before <script>window.__XSS_FIRED=true</script> after'
    );
    expect(html).not.toMatch(/<script/i);
    expect(html).toContain("Before");
    expect(html).toContain("after");
  });

  it("strips inline event handlers like onerror=", async () => {
    const html = await renderToSafeHtml(
      '<img src="x" onerror="window.__XSS_FIRED=true" />'
    );
    expect(html).not.toMatch(/onerror=/i);
  });

  it("strips javascript: protocol from anchor href", async () => {
    const html = await renderToSafeHtml(
      '<a href="javascript:window.__XSS_FIRED=true">click</a>'
    );
    expect(html).not.toMatch(/href="javascript:/i);
  });

  it("strips javascript: protocol from iframe src", async () => {
    const html = await renderToSafeHtml(
      '<iframe src="javascript:window.__XSS_FIRED=true"></iframe>'
    );
    expect(html).not.toMatch(/src="javascript:/i);
  });

  it("strips data: URLs with embedded HTML on iframe src", async () => {
    const html = await renderToSafeHtml(
      '<iframe src="data:text/html,<script>alert(1)</script>"></iframe>'
    );
    expect(html).not.toMatch(/src="data:/i);
  });

  it("strips <object> and <embed> entirely", async () => {
    const html = await renderToSafeHtml(
      '<object data="evil.swf"></object><embed src="evil.swf" />'
    );
    expect(html).not.toMatch(/<object/i);
    expect(html).not.toMatch(/<embed/i);
  });

  it("preserves <mark> tags used by highlightText()", async () => {
    const html = await renderToSafeHtml('Match <mark>here</mark> in text');
    expect(html).toMatch(/<mark[^>]*>here<\/mark>/);
  });

  it("preserves https iframes (Loom, YouTube, Vimeo) — we render embeds via raw HTML in some places", async () => {
    const html = await renderToSafeHtml(
      '<iframe src="https://www.loom.com/embed/abc123" allowfullscreen></iframe>'
    );
    expect(html).toMatch(/<iframe[^>]*src="https:\/\/www\.loom\.com\/embed\/abc123"/);
  });

  it("preserves normal markdown link", async () => {
    const html = await renderToSafeHtml("[Click me](https://example.com)");
    expect(html).toMatch(/<a[^>]*href="https:\/\/example\.com"/);
    expect(html).toContain("Click me");
  });

  it("preserves bold, italic, code", async () => {
    const html = await renderToSafeHtml(
      "This is **bold**, *italic*, and `code`."
    );
    expect(html).toMatch(/<strong>bold<\/strong>/);
    expect(html).toMatch(/<em>italic<\/em>/);
    expect(html).toMatch(/<code>code<\/code>/);
  });

  it("preserves <details>/<summary> for collapsible sections", async () => {
    const html = await renderToSafeHtml(
      "<details><summary>Title</summary>Body</details>"
    );
    expect(html).toMatch(/<details>/);
    expect(html).toMatch(/<summary>/);
  });

  it("strips style attributes (CSS-based XSS like expression())", async () => {
    const html = await renderToSafeHtml(
      '<p style="background:url(javascript:alert(1))">Hello</p>'
    );
    expect(html).not.toMatch(/style=/i);
    expect(html).toContain("Hello");
  });
});

describe("isTrustedEmbedHost", () => {
  it("accepts Loom hosts", () => {
    expect(isTrustedEmbedHost("https://www.loom.com/embed/abc")).toBe(true);
    expect(isTrustedEmbedHost("https://loom.com/v/xyz")).toBe(true);
  });

  it("accepts YouTube hosts", () => {
    expect(isTrustedEmbedHost("https://www.youtube.com/embed/abc")).toBe(true);
    expect(isTrustedEmbedHost("https://youtu.be/abc")).toBe(true);
    expect(isTrustedEmbedHost("https://www.youtube-nocookie.com/embed/abc")).toBe(true);
  });

  it("accepts Vimeo player host", () => {
    expect(isTrustedEmbedHost("https://player.vimeo.com/video/12345")).toBe(true);
  });

  it("rejects unknown hosts", () => {
    expect(isTrustedEmbedHost("https://evil.example.com/embed")).toBe(false);
    expect(isTrustedEmbedHost("https://attacker.com")).toBe(false);
  });

  it("rejects garbage input safely", () => {
    expect(isTrustedEmbedHost(undefined)).toBe(false);
    expect(isTrustedEmbedHost(null)).toBe(false);
    expect(isTrustedEmbedHost("")).toBe(false);
    expect(isTrustedEmbedHost("not a url at all")).toBe(false);
  });
});
