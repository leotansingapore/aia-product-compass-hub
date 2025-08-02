import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Minimize2, 
  Maximize2,
  Volume2,
  VolumeX,
  Eye,
  EyeOff
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TranscriptSegment {
  id: string;
  timestamp_offset: number;
  text: string;
  speaker: string;
  confidence?: number;
}

interface LiveTranscriptOverlayProps {
  sessionId: string;
  isActive: boolean;
  onToggle?: () => void;
}

export const LiveTranscriptOverlay: React.FC<LiveTranscriptOverlayProps> = ({
  sessionId,
  isActive,
  onToggle
}) => {
  const [transcripts, setTranscripts] = useState<TranscriptSegment[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  useEffect(() => {
    if (!isActive || !sessionId) return;

    // Set up real-time subscription for live transcripts
    const channel = supabase
      .channel('live-transcript')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversation_transcripts',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          const newTranscript = payload.new as TranscriptSegment;
          
          setTranscripts(prev => {
            // Keep only the last 10 messages for performance
            const updated = [...prev, newTranscript].slice(-10);
            return updated;
          });
          
          // Show notification if minimized
          if (isMinimized) {
            setHasNewMessage(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, isActive, isMinimized]);

  useEffect(() => {
    // Clear new message indicator when expanded
    if (!isMinimized) {
      setHasNewMessage(false);
    }
  }, [isMinimized]);

  if (!isActive || !isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)]">
      <Card className="bg-background/95 backdrop-blur-sm border-2 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Live Transcript</span>
            <Badge variant="destructive" className="animate-pulse text-xs">
              LIVE
            </Badge>
            {hasNewMessage && isMinimized && (
              <Badge variant="secondary" className="text-xs">
                New
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-6 w-6 p-0"
            >
              <EyeOff className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-6 w-6 p-0"
            >
              {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
            </Button>
          </div>
        </div>

        {/* Content */}
        {!isMinimized && (
          <CardContent className="p-3 max-h-64 overflow-y-auto">
            <div className="space-y-2">
              {transcripts.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm py-4">
                  Waiting for conversation to start...
                </div>
              ) : (
                transcripts.map((transcript, index) => (
                  <div
                    key={transcript.id || index}
                    className={`p-2 rounded text-xs transition-all duration-300 ${
                      transcript.speaker === 'user'
                        ? 'bg-primary/10 text-primary-foreground ml-4'
                        : 'bg-muted mr-4'
                    }`}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <Badge 
                        variant={transcript.speaker === 'user' ? 'default' : 'secondary'}
                        className="text-xs px-1 py-0"
                      >
                        {transcript.speaker === 'user' ? 'You' : 'AI'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {Math.floor(transcript.timestamp_offset / 1000)}s
                      </span>
                      {transcript.confidence && (
                        <span className="text-xs text-muted-foreground">
                          ({Math.round(transcript.confidence * 100)}%)
                        </span>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed">{transcript.text}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Toggle visibility button when hidden */}
      {!isVisible && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsVisible(true)}
          className="mt-2 w-full flex items-center gap-2 bg-background/95 backdrop-blur-sm"
        >
          <Eye className="w-4 h-4" />
          Show Transcript
        </Button>
      )}
    </div>
  );
};
