import { useEffect, useRef } from "react";

/**
 * Enables auto-scrolling when the user is dragging near the top/bottom edges
 * of the viewport. Call `start()` when a drag begins, `stop()` when it ends.
 */
export function useDragAutoScroll() {
  const rafRef = useRef<number | null>(null);
  const mouseYRef = useRef<number>(0);
  const activeRef = useRef(false);

  const EDGE_ZONE = 120;   // px from top/bottom edge that triggers scroll
  const MAX_SPEED = 18;    // max px per frame

  const scroll = () => {
    if (!activeRef.current) return;

    const y = mouseYRef.current;
    const vh = window.innerHeight;

    let speed = 0;
    if (y < EDGE_ZONE) {
      speed = -MAX_SPEED * (1 - y / EDGE_ZONE);
    } else if (y > vh - EDGE_ZONE) {
      speed = MAX_SPEED * (1 - (vh - y) / EDGE_ZONE);
    }

    if (speed !== 0) {
      window.scrollBy({ top: speed, behavior: "instant" as ScrollBehavior });
    }

    rafRef.current = requestAnimationFrame(scroll);
  };

  const onMouseMove = (e: MouseEvent) => {
    mouseYRef.current = e.clientY;
  };

  const start = () => {
    activeRef.current = true;
    window.addEventListener("mousemove", onMouseMove);
    rafRef.current = requestAnimationFrame(scroll);
  };

  const stop = () => {
    activeRef.current = false;
    window.removeEventListener("mousemove", onMouseMove);
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  // Clean up on unmount
  useEffect(() => () => stop(), []);

  return { start, stop };
}
