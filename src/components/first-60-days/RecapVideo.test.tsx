import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { RecapVideo } from "./RecapVideo";

const capture = vi.fn();
vi.mock("posthog-js", () => ({ default: { capture: (...args: unknown[]) => capture(...args) } }));

const at = (v: HTMLVideoElement, t: number, duration = 600) => {
  Object.defineProperty(v, "duration", { configurable: true, value: duration });
  Object.defineProperty(v, "currentTime", { configurable: true, writable: true, value: t });
};

const mount = (onEnded = vi.fn()) => {
  const r = render(
    <RecapVideo
      src="https://x.supabase.co/functions/v1/recap-video-proxy?key=recap-w1-d2"
      poster="/first-60-days/recap/recap-w1-d2.jpg"
      vtt="https://x.supabase.co/functions/v1/recap-video-proxy?key=recap-w1-d2.vtt"
      videoKey="recap-w1-d2"
      day={2}
      chapters={[["The one-third rule", 0], ["Three ways to manage risk", 120], ["When to buy", 300]]}
      onEnded={onEnded}
    />,
  );
  return { video: r.container.querySelector("video") as HTMLVideoElement, onEnded };
};

describe("RecapVideo", () => {
  beforeEach(() => {
    capture.mockClear();
    localStorage.clear();
  });

  it("resumes where this viewer left off, but not from the first seconds or the last ones", () => {
    localStorage.setItem("recap-pos:recap-w1-d2", "250");
    const { video } = mount();
    at(video, 0);
    fireEvent(video, new Event("loadedmetadata"));
    expect(video.currentTime).toBe(250);

    localStorage.setItem("recap-pos:recap-w1-d2", "595");
    const b = mount().video;
    at(b, 0);
    fireEvent(b, new Event("loadedmetadata"));
    expect(b.currentTime).toBe(0);
  });

  it("reports each milestone once and keeps the position", async () => {
    const { video } = mount();
    at(video, 160);
    fireEvent(video, new Event("timeupdate"));
    fireEvent(video, new Event("timeupdate"));
    await waitFor(() => expect(capture).toHaveBeenCalledWith("recap_video_progress", { video: "recap-w1-d2", day: 2, percent: 25 }));
    expect(capture.mock.calls.filter((c) => c[1]?.percent === 25)).toHaveLength(1);
    expect(localStorage.getItem("recap-pos:recap-w1-d2")).toBe("160");
  });

  it("marks the chapter playing and jumps when one is picked", () => {
    const { video } = mount();
    video.play = vi.fn(() => Promise.resolve());
    at(video, 130);
    fireEvent(video, new Event("timeupdate"));
    expect(screen.getByRole("button", { name: /Three ways to manage risk/ }).getAttribute("aria-current")).toBe("true");
    expect(screen.getByRole("button", { name: /When to buy/ }).getAttribute("aria-current")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /When to buy/ }));
    expect(video.currentTime).toBe(300);
  });

  it("at the end: forgets the position, reports 100% and hands over", async () => {
    localStorage.setItem("recap-pos:recap-w1-d2", "580");
    const { video, onEnded } = mount();
    at(video, 600);
    fireEvent(video, new Event("ended"));
    expect(onEnded).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem("recap-pos:recap-w1-d2")).toBeNull();
    await waitFor(() => expect(capture).toHaveBeenCalledWith("recap_video_progress", { video: "recap-w1-d2", day: 2, percent: 100 }));
  });
});
