import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface RoleplayDiagnosticsProps {
  scenario: {
    replicaId?: string;
    personaId?: string;
    title: string;
  };
}

export function RoleplayDiagnostics({ scenario }: RoleplayDiagnosticsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);
  const [conversationId, setConversationId] = useState('');

  const handleListReplicas = async () => {
    setLoading('replicas');
    try {
      const { data, error } = await supabase.functions.invoke('tavus-session', {
        body: { action: 'list_replicas' }
      });
      
      if (error) throw error;
      setResults({ type: 'replicas', data });
    } catch (error: any) {
      setResults({ type: 'error', data: error.message });
    } finally {
      setLoading(null);
    }
  };

  const handleTestConversation = async () => {
    if (!scenario.replicaId) {
      setResults({ type: 'error', data: 'No replica ID configured for this scenario' });
      return;
    }
    
    setLoading('conversation');
    try {
      const { data, error } = await supabase.functions.invoke('tavus-session', {
        body: {
          action: 'create_conversation',
          replica_id: scenario.replicaId,
          persona_id: scenario.personaId,
          conversation_name: `TEST - ${scenario.title}`,
          enable_recording: false
        }
      });
      
      if (error) throw error;
      setResults({ type: 'conversation', data });
      setConversationId(data.conversation_id);
    } catch (error: any) {
      setResults({ type: 'error', data: error.message });
    } finally {
      setLoading(null);
    }
  };

  const handleGetConversation = async () => {
    if (!conversationId) return;
    
    setLoading('get_conversation');
    try {
      const { data, error } = await supabase.functions.invoke('tavus-session', {
        body: {
          action: 'get_conversation',
          conversation_id: conversationId
        }
      });
      
      if (error) throw error;
      setResults({ type: 'get_conversation', data });
    } catch (error: any) {
      setResults({ type: 'error', data: error.message });
    } finally {
      setLoading(null);
    }
  };

  if (!isOpen) {
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => setIsOpen(true)}
        className="text-muted-foreground"
      >
        Show Diagnostics <ChevronDown className="ml-1 h-4 w-4" />
      </Button>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Tavus Diagnostics</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsOpen(false)}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <Button
            onClick={handleListReplicas}
            disabled={loading === 'replicas'}
            size="sm"
          >
            {loading === 'replicas' ? 'Loading...' : 'List Replicas'}
          </Button>
          
          <Button
            onClick={handleTestConversation}
            disabled={loading === 'conversation' || !scenario.replicaId}
            size="sm"
          >
            {loading === 'conversation' ? 'Creating...' : 'Test Conversation'}
          </Button>
          
          <div className="flex gap-2">
            <Input
              placeholder="Conversation ID"
              value={conversationId}
              onChange={(e) => setConversationId(e.target.value)}
              className="text-xs"
            />
            <Button
              onClick={handleGetConversation}
              disabled={loading === 'get_conversation' || !conversationId}
              size="sm"
            >
              Get
            </Button>
          </div>
        </div>

        <div className="text-sm space-y-2">
          <div><strong>Replica ID:</strong> {scenario.replicaId || 'Not configured'}</div>
          {scenario.personaId && (
            <div><strong>Persona ID:</strong> {scenario.personaId}</div>
          )}
        </div>

        {results && (
          <Card className="mt-4">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Badge variant={results.type === 'error' ? 'destructive' : 'default'}>
                  {results.type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-60">
                {JSON.stringify(results.data, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}