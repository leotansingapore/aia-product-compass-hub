import { describe, expect, it } from "vitest";
import { mdToHtml } from "./MinimalRichEditor";

const RECAP =
  "https://hgdbflprrficdoyxmdxe.supabase.co/functions/v1/recap-video-proxy/team-training-2026-09-23.mp4?key=team-training-2026-09-23";

describe("mdToHtml video embeds", () => {
  it("shows a bare video URL on its own line as the player", () => {
    const html = mdToHtml(`${RECAP}\n\n# Team training notes`);
    expect(html).toContain('data-type="video-embed"');
    expect(html).toContain(`data-src="${RECAP}"`);
  });

  it("keeps a saved [mp4 video](url) link as the player", () => {
    expect(mdToHtml(`[mp4 video](${RECAP})`)).toContain('data-type="video-embed"');
  });

  it("leaves a labelled link or a non-video URL alone", () => {
    expect(mdToHtml(`[watch here](${RECAP})`)).not.toContain("video-embed");
    expect(mdToHtml("https://example.com/page")).not.toContain("video-embed");
  });
});
