import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  Search, 
  Clock, 
  User, 
  Bot,
  Copy,
  Filter,
  Play,
  Pause
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TranscriptSegment {
  id: string;
  session_id: string;
  timestamp_offset: number;
  text: string;
  speaker: string;
  confidence?: number;
  filler_words?: string[];
  created_at: string;
}

interface TranscriptDisplayProps {
  sessionId: string;
  isLive?: boolean;
  showControls?: boolean;
  height?: string;
}

export const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({
  sessionId,
  isLive = false,
  showControls = true,
  height = "h-96"
}) => {
  const [transcripts, setTranscripts] = useState<TranscriptSegment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>('all');
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [loading, setLoading] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadTranscripts();
    
    if (isLive) {
      // Set up real-time subscription for live transcripts
      const channel = supabase
        .channel('transcript-updates')
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
            setTranscripts(prev => [...prev, newTranscript]);
            
            // Auto-scroll to bottom if enabled
            if (isAutoScroll && scrollAreaRef.current) {
              setTimeout(() => {
                scrollAreaRef.current?.scrollTo({
                  top: scrollAreaRef.current.scrollHeight,
                  behavior: 'smooth'
                });
              }, 100);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [sessionId, isLive, isAutoScroll]);

  const loadTranscripts = async () => {
    try {
      const { data, error } = await supabase
        .from('conversation_transcripts')
        .select('*')
        .eq('session_id', sessionId)
        .order('timestamp_offset', { ascending: true });

      if (error) throw error;
      setTranscripts(data || []);
    } catch (error) {
      console.error('Failed to load transcripts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTranscripts = transcripts.filter(transcript => {
    const matchesSearch = transcript.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpeaker = selectedSpeaker === 'all' || transcript.speaker === selectedSpeaker;
    return matchesSearch && matchesSpeaker;
  });

  const formatTimestamp = (offsetMs: number) => {
    const seconds = Math.floor(offsetMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const exportTranscript = () => {
    const transcriptText = transcripts.map(t => 
      `[${formatTimestamp(t.timestamp_offset)}] ${t.speaker}: ${t.text}`
    ).join('\n');
    
    const blob = new Blob([transcriptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${sessionId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    const transcriptText = transcripts.map(t => 
      `[${formatTimestamp(t.timestamp_offset)}] ${t.speaker}: ${t.text}`
    ).join('\n');
    
    navigator.clipboard.writeText(transcriptText);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Transcript...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Conversation Transcript
            {isLive && (
              <Badge variant="destructive" className="animate-pulse">
                LIVE
              </Badge>
            )}
          </CardTitle>
          
          {showControls && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportTranscript}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          )}
        </div>
        
        {showControls && (
          <div className="flex gap-2 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transcript..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={selectedSpeaker}
              onChange={(e) => setSelectedSpeaker(e.target.value)}
              className="px-3 py-2 border border-input rounded-md text-sm"
            >
              <option value="all">All Speakers</option>
              <option value="user">You</option>
              <option value="ai">AI</option>
            </select>
            
            {isLive && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAutoScroll(!isAutoScroll)}
                className={`flex items-center gap-2 ${isAutoScroll ? 'bg-primary text-primary-foreground' : ''}`}
              >
                {isAutoScroll ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                Auto-scroll
              </Button>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <ScrollArea className={height} ref={scrollAreaRef}>
          <div className="space-y-4">
            {filteredTranscripts.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                {transcripts.length === 0 ? 'No transcript available yet' : 'No results found'}
              </div>
            ) : (
              filteredTranscripts.map((transcript, index) => (
                <div key={transcript.id || index}>
                  <div className={`p-4 rounded-lg border transition-colors ${
                    transcript.speaker === 'user' 
                      ? 'bg-primary/5 border-primary/20 ml-8' 
                      : 'bg-muted/50 border-muted mr-8'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {transcript.speaker === 'user' ? (
                          <User className="w-4 h-4 text-primary" />
                        ) : (
                          <Bot className="w-4 h-4 text-muted-foreground" />
                        )}
                        <Badge variant={transcript.speaker === 'user' ? 'default' : 'secondary'}>
                          {transcript.speaker === 'user' ? 'You' : 'AI'}
                        </Badge>
                        {transcript.confidence && (
                          <Badge variant="outline" className="text-xs">
                            {Math.round(transcript.confidence * 100)}% confidence
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">
                        {formatTimestamp(transcript.timestamp_offset)}
                      </span>
                    </div>
                    
                    <p className="text-sm leading-relaxed">{transcript.text}</p>
                    
                    {transcript.filler_words && transcript.filler_words.length > 0 && (
                      <div className="mt-3 flex gap-1 flex-wrap">
                        <span className="text-xs text-muted-foreground mr-2">Filler words:</span>
                        {transcript.filler_words.map((word: string, i: number) => (
                          <Badge key={i} variant="destructive" className="text-xs">
                            {word}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {index < filteredTranscripts.length - 1 && (
                    <Separator className="my-2" />
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};