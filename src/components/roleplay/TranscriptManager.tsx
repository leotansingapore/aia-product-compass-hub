import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  History, 
  Search, 
  Filter,
  Calendar,
  Clock,
  Download,
  Eye,
  Trash2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { TranscriptDisplay } from './TranscriptDisplay';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface RoleplaySession {
  id: string;
  scenario_title: string;
  scenario_category: string;
  scenario_difficulty: string;
  started_at: string;
  ended_at?: string;
  duration_seconds?: number;
  transcript?: any;
}

export const TranscriptManager: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<RoleplaySession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<RoleplaySession[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<RoleplaySession | null>(null);

  useEffect(() => {
    if (user) {
      loadSessions();
    }
  }, [user]);

  useEffect(() => {
    filterSessions();
  }, [sessions, searchTerm, selectedCategory, selectedDifficulty]);

  const loadSessions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('roleplay_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSessions = () => {
    let filtered = sessions.filter(session => {
      const matchesSearch = session.scenario_title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || session.scenario_category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'all' || session.scenario_difficulty === selectedDifficulty;
      
      return matchesSearch && matchesCategory && matchesDifficulty;
    });

    setFilteredSessions(filtered);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const exportAllTranscripts = async () => {
    try {
      const transcriptData = await Promise.all(
        filteredSessions.map(async (session) => {
          const { data } = await supabase
            .from('conversation_transcripts')
            .select('*')
            .eq('session_id', session.id)
            .order('timestamp_offset', { ascending: true });

          return {
            session: session.scenario_title,
            date: formatDate(session.started_at),
            transcripts: data || []
          };
        })
      );

      const exportText = transcriptData.map(item => {
        const sessionHeader = `\n=== ${item.session} (${item.date}) ===\n`;
        const transcriptText = item.transcripts.map(t => 
          `[${Math.floor(t.timestamp_offset / 1000)}s] ${t.speaker}: ${t.text}`
        ).join('\n');
        
        return sessionHeader + transcriptText;
      }).join('\n\n');

      const blob = new Blob([exportText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `all-transcripts-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export transcripts:', error);
    }
  };

  const categories = [...new Set(sessions.map(s => s.scenario_category))];
  const difficulties = [...new Set(sessions.map(s => s.scenario_difficulty))];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Sessions...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Transcript History
            </CardTitle>
            
            <Button
              variant="outline"
              onClick={exportAllTranscripts}
              disabled={filteredSessions.length === 0}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export All
            </Button>
          </div>
          
          <div className="flex gap-2 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-input rounded-md text-sm min-w-32"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 border border-input rounded-md text-sm min-w-32"
            >
              <option value="all">All Difficulties</option>
              {difficulties.map(difficulty => (
                <option key={difficulty} value={difficulty}>{difficulty}</option>
              ))}
            </select>
          </div>
        </CardHeader>
        
        <CardContent>
          {filteredSessions.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              {sessions.length === 0 ? 'No roleplay sessions found' : 'No sessions match your filters'}
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {filteredSessions.map((session) => (
                  <Card key={session.id} className="border-2 hover:border-primary/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{session.scenario_title}</h3>
                            <Badge variant="outline">{session.scenario_category}</Badge>
                            <Badge className={getDifficultyColor(session.scenario_difficulty)}>
                              {session.scenario_difficulty}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(session.started_at)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatDuration(session.duration_seconds)}
                            </div>
                          </div>
                        </div>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2"
                              onClick={() => setSelectedSession(session)}
                            >
                              <Eye className="w-4 h-4" />
                              View Transcript
                            </Button>
                          </DialogTrigger>
                          
                          <DialogContent className="max-w-4xl max-h-[80vh]">
                            <DialogHeader>
                              <DialogTitle>
                                {session.scenario_title} - Transcript
                              </DialogTitle>
                            </DialogHeader>
                            
                            <TranscriptDisplay
                              sessionId={session.id}
                              isLive={false}
                              showControls={true}
                              height="h-[60vh]"
                            />
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};