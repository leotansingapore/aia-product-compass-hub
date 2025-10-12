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
    <Card className="border-0 shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Conversation Transcript
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Complete conversation flow with timestamps
        </p>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <ScrollArea className="h-[500px] w-full pr-4">
          <div className="space-y-3 px-2">
            {transcript.map((entry) => {
              const speakerInfo = getSpeakerInfo(entry.speaker);
              const IconComponent = speakerInfo.icon;
              const isUser = entry.speaker === 'user';

              return (
                <div
                  key={entry.id}
                  className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Avatar - Left side for AI */}
                  {!isUser && (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        <IconComponent className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}

                  {/* Message Bubble */}
                  <div className={`flex flex-col max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`rounded-2xl px-4 py-2.5 ${
                        isUser
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {entry.text}
                      </p>

                      {/* Filler words indicator - subtle */}
                      {entry.filler_words && entry.filler_words.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-current/10">
                          {entry.filler_words.map((word, index) => (
                            <span key={index} className={`text-xs px-1.5 py-0.5 rounded ${
                              isUser ? 'bg-primary-foreground/20' : 'bg-background/50'
                            }`}>
                              {word}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Timestamp and metadata */}
                    <div className="flex items-center gap-2 mt-1 px-1">
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(entry.timestamp_offset)}
                      </span>
                      {entry.confidence < 0.8 && (
                        <span className="text-xs text-muted-foreground/70">
                          • Low confidence
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Avatar - Right side for User */}
                  {isUser && (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <IconComponent className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};