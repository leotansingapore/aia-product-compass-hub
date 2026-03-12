import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Crop, X, Check } from 'lucide-react';
import { toast } from 'sonner';

export function ImageCropper({
  imageUrl,
  onCrop,
  onCancel,
  maxImgClass = 'max-w-full max-h-[60vh]',
}: {
  imageUrl: string;
  onCrop: (croppedUrl: string) => void;
  onCancel: () => void;
  maxImgClass?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [cropRect, setCropRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  const getRelPos = (e: React.MouseEvent | React.TouchEvent) => {
    const img = imgRef.current;
    if (!img) return { x: 0, y: 0 };
    const rect = img.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (clientY - rect.top) / rect.height)),
    };
  };

  const onMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const pos = getRelPos(e);
    setDragStart(pos);
    setCropRect(null);
    setIsDragging(true);
  };

  const onMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !dragStart) return;
    e.preventDefault();
    const pos = getRelPos(e);
    setCropRect({
      x: Math.min(dragStart.x, pos.x),
      y: Math.min(dragStart.y, pos.y),
      w: Math.abs(pos.x - dragStart.x),
      h: Math.abs(pos.y - dragStart.y),
    });
  };

  const onMouseUp = () => setIsDragging(false);

  const applyCrop = () => {
    if (!cropRect || cropRect.w < 0.02 || cropRect.h < 0.02) {
      toast.error('Select a larger area to crop');
      return;
    }
    const img = imgRef.current;
    if (!img) return;
    const canvas = document.createElement('canvas');
    const naturalW = img.naturalWidth;
    const naturalH = img.naturalHeight;
    const sx = cropRect.x * naturalW;
    const sy = cropRect.y * naturalH;
    const sw = cropRect.w * naturalW;
    const sh = cropRect.h * naturalH;
    canvas.width = sw;
    canvas.height = sh;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
    onCrop(canvas.toDataURL('image/png'));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/30 shrink-0">
        <Crop className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-medium flex-1">Drag to select crop area</span>
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={onCancel}>
          <X className="h-3 w-3" /> Cancel
        </Button>
        <Button size="sm" className="h-7 text-xs gap-1" onClick={applyCrop} disabled={!cropRect}>
          <Check className="h-3 w-3" /> Apply Crop
        </Button>
      </div>
      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-muted/20 flex items-center justify-center p-4 select-none"
      >
        <div
          className="relative inline-block cursor-crosshair"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchStart={onMouseDown}
          onTouchMove={onMouseMove}
          onTouchEnd={onMouseUp}
        >
          <img
            ref={imgRef}
            src={imageUrl}
            alt="Crop"
            draggable={false}
            className={`${maxImgClass} rounded-lg shadow-sm block`}
          />
          {cropRect && (
            <>
              <div className="absolute inset-x-0 top-0 bg-black/40 pointer-events-none" style={{ height: `${cropRect.y * 100}%` }} />
              <div className="absolute inset-x-0 bottom-0 bg-black/40 pointer-events-none" style={{ height: `${(1 - cropRect.y - cropRect.h) * 100}%` }} />
              <div className="absolute bg-black/40 pointer-events-none" style={{ top: `${cropRect.y * 100}%`, left: 0, width: `${cropRect.x * 100}%`, height: `${cropRect.h * 100}%` }} />
              <div className="absolute bg-black/40 pointer-events-none" style={{ top: `${cropRect.y * 100}%`, right: 0, width: `${(1 - cropRect.x - cropRect.w) * 100}%`, height: `${cropRect.h * 100}%` }} />
              <div
                className="absolute border-2 border-primary pointer-events-none"
                style={{
                  left: `${cropRect.x * 100}%`,
                  top: `${cropRect.y * 100}%`,
                  width: `${cropRect.w * 100}%`,
                  height: `${cropRect.h * 100}%`,
                  boxShadow: '0 0 0 1px rgba(255,255,255,0.4)',
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
