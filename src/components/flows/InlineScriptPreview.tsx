import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, ChevronDown, ChevronUp, FileText, User, Tag } from 'lucide-react';
import type { ScriptEntry } from '@/hooks/useScripts';

interface InlineScriptPreviewProps {
  script: ScriptEntry;
  onClose: () => void;
}

export function InlineScriptPreview({ script, onClose }: InlineScriptPreviewProps) {
  const [expandedVersion, setExpandedVersion] = useState(0);

  return (
    <Card className="border-primary/30 bg-card shadow-lg">
      <CardHeader className="pb-2 flex flex-row items-start justify-between gap-2">
        <div className="space-y-1 min-w-0">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary shrink-0" />
            <span className="truncate">{script.stage}</span>
          </CardTitle>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary" className="text-[10px]">{script.category}</Badge>
            {script.target_audience && script.target_audience !== 'general' && (
              <Badge variant="outline" className="text-[10px] gap-1">
                <User className="h-2.5 w-2.5" />{script.target_audience}
              </Badge>
            )}
            {script.tags?.map(tag => (
              <Badge key={tag} variant="outline" className="text-[10px] gap-1">
                <Tag className="h-2.5 w-2.5" />{tag}
              </Badge>
            ))}
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        {script.versions.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No script content available.</p>
        ) : (
          <div className="space-y-2">
            {script.versions.map((version, i) => (
              <div key={i} className="border rounded-md">
                <button
                  onClick={() => setExpandedVersion(expandedVersion === i ? -1 : i)}
                  className="flex items-center justify-between w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors rounded-t-md"
                >
                  <span className="font-medium text-xs">
                    {version.author || `Version ${i + 1}`}
                  </span>
                  {expandedVersion === i ? (
                    <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </button>
                {expandedVersion === i && (
                  <ScrollArea className="max-h-[300px]">
                    <div className="px-3 pb-3 text-sm whitespace-pre-wrap leading-relaxed text-muted-foreground">
                      {version.content}
                    </div>
                  </ScrollArea>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
