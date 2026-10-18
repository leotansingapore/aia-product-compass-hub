import { describe, expect, it } from "vitest";
import { recapProxyVideo } from "./video-embed-utils";

const PROXY = "https://hgdbflprrficdoyxmdxe.supabase.co/functions/v1/recap-video-proxy";

describe("recapProxyVideo", () => {
  it("gives a recap proxy video its captions and poster", () => {
    expect(recapProxyVideo(`${PROXY}?key=recap-w1-d3`)).toEqual({
      key: "recap-w1-d3",
      src: `${PROXY}?key=recap-w1-d3`,
      vtt: `${PROXY}?key=recap-w1-d3.vtt`,
      poster: "/first-60-days/recap/recap-w1-d3.jpg",
    });
  });

  it("leaves every other URL to the embed detector", () => {
    expect(recapProxyVideo("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBeNull();
    expect(recapProxyVideo(`${PROXY}?key=recap-w1-d3&x=1`)).toBeNull();
    expect(recapProxyVideo(`https://evil.example/functions/v1/recap-video-proxy?key=recap-w1-d3`)).toBeNull();
    expect(recapProxyVideo(`${PROXY}?key=../../x`)).toBeNull();
  });
});
