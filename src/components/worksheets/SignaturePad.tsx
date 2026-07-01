import { useEffect, useRef, useState } from "react";
import { Eraser } from "lucide-react";

// A draw-your-own signature field. The drawn ink is stored as a PNG data URL in
// the worksheet value so it persists, reloads onto the canvas, and rasterises
// straight into the exported PDF as an image.
const W = 560;
const H = 150;

export default function SignaturePad({
  value,
  onChange,
  readOnly = false,
}: {
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [hasInk, setHasInk] = useState(false);

  // (Re)paint the stored signature whenever it changes (e.g. after a reload).
  useEffect(() => {
    const c = canvasRef.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
    if (value?.startsWith("data:image")) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, c.width, c.height);
      img.src = value;
      setHasInk(true);
    } else {
      setHasInk(false);
    }
  }, [value]);

  const pointFromEvent = (e: React.PointerEvent) => {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * (c.width / r.width),
      y: (e.clientY - r.top) * (c.height / r.height),
    };
  };

  const start = (e: React.PointerEvent) => {
    if (readOnly) return;
    drawing.current = true;
    last.current = pointFromEvent(e);
    canvasRef.current?.setPointerCapture?.(e.pointerId);
  };

  const move = (e: React.PointerEvent) => {
    if (!drawing.current || readOnly) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !last.current) return;
    const p = pointFromEvent(e);
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
    setHasInk(true);
  };

  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    last.current = null;
    const c = canvasRef.current;
    if (c) onChange?.(c.toDataURL("image/png"));
  };

  const clear = () => {
    const c = canvasRef.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
    setHasInk(false);
    onChange?.("");
  };

  return (
    <div>
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
          className={
            "h-[110px] w-full rounded-md border bg-white " +
            (readOnly ? "" : "cursor-crosshair touch-none")
          }
          style={{ touchAction: "none" }}
        />
        {!hasInk && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-muted-foreground/50">
            {readOnly ? "Not signed" : "Sign here — draw with your mouse or finger"}
          </span>
        )}
      </div>
      {!readOnly && (
        <button
          type="button"
          onClick={clear}
          className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <Eraser className="h-3.5 w-3.5" />
          Clear signature
        </button>
      )}
    </div>
  );
}
