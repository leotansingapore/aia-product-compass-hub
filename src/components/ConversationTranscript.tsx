import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, User, Bot } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TranscriptEntry {
  id: string;
  speaker: 'user' | 'ai_trainer';
  text: string;
  timestamp_offset: number;
  confidence: number;
  filler_words: string[] | null;
}

interface ConversationTranscriptProps {
  sessionId: string;
}

export const ConversationTranscript = ({ sessionId }: ConversationTranscriptProps) => {
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTranscript = async () => {
      try {
        const { data, error } = await supabase
          .from('conversation_transcripts')
          .select('*')
          .eq('session_id', sessionId)
          .order('timestamp_offset', { ascending: true });

        if (error) {
          console.error('Error fetching transcript:', error);
          return;
        }

        setTranscript(data as TranscriptEntry[] || []);
      } catch (error) {
        console.error('Error fetching transcript:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTranscript();
  }, [sessionId]);

  const formatTimestamp = (offsetMs: number) => {
    const seconds = Math.floor(offsetMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getSpeakerInfo = (speaker: string) => {
    if (speaker === 'user') {
      return {
        name: 'You',
        icon: User,
        variant: 'default' as const,
        bgClass: 'bg-primary/5',
        borderClass: 'border-l-primary'
      };
    }
    return {
      name: 'AI Trainer',
      icon: Bot,
      variant: 'secondary' as const,
      bgClass: 'bg-secondary/5',
      borderClass: 'border-l-secondary'
    };
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Conversation Transcript
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading transcript...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (transcript.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Conversation Transcript
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">No transcript available</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Conversation Transcript
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Complete conversation flow with timestamps
        </p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full">
          <div className="space-y-4">
            {transcript.map((entry) => {
              const speakerInfo = getSpeakerInfo(entry.speaker);
              const IconComponent = speakerInfo.icon;
              
              return (
                <div
                  key={entry.id}
                  className={`p-4 rounded-lg border-l-4 ${speakerInfo.bgClass} ${speakerInfo.borderClass}`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback className="text-xs">
                        <IconComponent className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={speakerInfo.variant} className="text-xs">
                          {speakerInfo.name}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(entry.timestamp_offset)}
                        </span>
                        {entry.confidence < 0.8 && (
                          <Badge variant="outline" className="text-xs">
                            Low confidence
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm leading-relaxed">{entry.text}</p>
                      
                      {entry.filler_words && entry.filler_words.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <span>Filler words:</span>
                          {entry.filler_words.map((word, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {word}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};