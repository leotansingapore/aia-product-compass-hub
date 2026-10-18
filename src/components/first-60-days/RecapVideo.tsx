import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type RecapChapter = [label: string, at: number];

const mmss = (t: number) => `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(Math.floor(t % 60)).padStart(2, "0")}`;

/**
 * A day's recap video: picks up where this viewer left off, lists its chapters (the one playing is marked),
 * reports start / 25 / 50 / 75 / 100% to PostHog, and hands over to the page when it ends.
 */
export function RecapVideo({
  src,
  poster,
  vtt,
  videoKey,
  day,
  chapters = [],
  onEnded,
}: {
  src: string;
  poster: string;
  vtt: string;
  videoKey: string;
  day: number;
  chapters?: RecapChapter[];
  onEnded?: () => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [now, setNow] = useState(0);
  const sent = useRef(new Set<string>());
  const ended = useRef(onEnded);
  ended.current = onEnded;
  const posKey = `recap-pos:${videoKey}`;

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const capture = (event: string, props: Record<string, unknown> = {}) => {
      void import("posthog-js")
        .then(({ default: posthog }) => posthog.capture(event, { video: videoKey, day, ...props }))
        .catch(() => undefined);
    };
    let lastSave = 0;
    const onMeta = () => {
      try {
        const t = Number(localStorage.getItem(posKey));
        if (t > 10 && t < v.duration - 15) v.currentTime = t;
      } catch {
        /* storage blocked: start from the top */
      }
    };
    const onTime = () => {
      setNow(v.currentTime);
      const pct = v.duration ? (v.currentTime / v.duration) * 100 : 0;
      for (const m of [25, 50, 75]) {
        if (pct >= m && !sent.current.has(`p${m}`)) {
          sent.current.add(`p${m}`);
          capture("recap_video_progress", { percent: m });
        }
      }
      if (Math.abs(v.currentTime - lastSave) >= 5) {
        lastSave = v.currentTime;
        try {
          localStorage.setItem(posKey, String(Math.floor(v.currentTime)));
        } catch {
          /* storage blocked */
        }
      }
    };
    const onPlay = () => {
      if (!sent.current.has("start")) {
        sent.current.add("start");
        capture("recap_video_started", { from: Math.floor(v.currentTime) });
      }
    };
    const onEnd = () => {
      try {
        localStorage.removeItem(posKey);
      } catch {
        /* storage blocked */
      }
      if (!sent.current.has("p100")) {
        sent.current.add("p100");
        capture("recap_video_progress", { percent: 100 });
      }
      ended.current?.();
    };
    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("play", onPlay);
    v.addEventListener("ended", onEnd);
    return () => {
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("ended", onEnd);
    };
  }, [posKey, videoKey, day]);

  const jump = (at: number) => {
    const v = ref.current;
    if (!v) return;
    v.currentTime = at;
    void v.play().catch(() => undefined);
  };

  return (
    <div>
      <video
        ref={ref}
        src={src}
        poster={poster}
        controls
        playsInline
        preload="metadata"
        crossOrigin="anonymous"
        className="block aspect-video w-full bg-black"
      >
        <track kind="subtitles" srcLang="en" label="English" default src={vtt} />
      </video>
      {chapters.length > 0 && (
        <ol className="divide-y divide-border/60 border-t border-border/60">
          {chapters.map(([label, at], i) => {
            const active = now >= at && (i === chapters.length - 1 || now < chapters[i + 1][1]);
            return (
              <li key={`${at}-${label}`}>
                <button
                  type="button"
                  onClick={() => jump(at)}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "flex min-h-11 w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-muted/60",
                    active && "bg-primary/5 font-semibold text-primary",
                  )}
                >
                  <span className="w-12 shrink-0 font-mono text-xs tabular-nums text-muted-foreground">{mmss(at)}</span>
                  <span>{label}</span>
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
