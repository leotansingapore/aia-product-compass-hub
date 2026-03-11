import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, ZoomIn, ZoomOut } from 'lucide-react';
import { ConceptCard } from '@/hooks/useConceptCards';
import { cn } from '@/lib/utils';

interface Props {
  card: ConceptCard | null;
  onClose: () => void;
}

export function ConceptCardViewDialog({ card, onClose }: Props) {
  const [zoom, setZoom] = useState(1);

  if (!card) return null;

  return (
    <Dialog open={!!card} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[92vh] p-0 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b bg-card flex items-start justify-between gap-3">
          <div className="space-y-1 flex-1 min-w-0">
            <h2 className="font-bold text-base sm:text-lg leading-snug">{card.title}</h2>
            {card.description && (
              <p className="text-sm text-muted-foreground">{card.description}</p>
            )}
            <div className="flex flex-wrap gap-1 pt-1">
              {card.audience.map(a => (
                <Badge key={a} variant="outline" className="text-xs">{a}</Badge>
              ))}
              {card.product_type.map(p => (
                <Badge key={p} className="text-xs bg-primary/10 text-primary border-primary/20">{p}</Badge>
              ))}
              {card.tags.map(t => (
                <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground shrink-0 mt-0.5">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Image area */}
        <div className="flex-1 overflow-auto bg-muted/30 relative">
          {card.image_url ? (
            <div className="p-4 flex items-center justify-center min-h-[300px]">
              <img
                src={card.image_url}
                alt={card.title}
                style={{ transform: `scale(${zoom})`, transformOrigin: 'center', transition: 'transform 0.2s' }}
                className="max-w-full rounded-lg shadow-sm"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
              No drawing attached yet
            </div>
          )}
        </div>

        {/* Zoom controls */}
        {card.image_url && (
          <div className="flex items-center justify-center gap-2 py-3 border-t bg-card">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground w-12 text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setZoom(z => Math.min(3, z + 0.25))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground ml-2" onClick={() => setZoom(1)}>Reset</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
