import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Send, Loader2, ChevronDown, ChevronUp, X, Undo2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

import type { FlowNode, FlowEdge } from '@/hooks/useScriptFlows';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIFlowChatProps {
  nodes: FlowNode[];
  edges: FlowEdge[];
  flowTitle: string;
  onFlowUpdated: (nodes: FlowNode[], edges: FlowEdge[]) => void;
}

const QUICK_PROMPTS = [
  'Add objection handling after the pitch',
  'Add a follow-up path if prospect goes silent',
  'Insert a needs analysis step before recommending',
  'Add a referral ask after closing',
  'Simplify — fewer steps, same outcome',
];

export function AIFlowChat({ nodes, edges, flowTitle, onFlowUpdated }: AIFlowChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [undoStack, setUndoStack] = useState<Array<{ nodes: FlowNode[]; edges: FlowEdge[] }>>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (instruction?: string) => {
    const text = instruction ?? input.trim();
    if (!text || isLoading) return;

    setInput('');
    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('improve-flow', {
        body: {
          instruction: text,
          currentNodes: nodes,
          currentEdges: edges,
          flowTitle,
        },
      });

      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        setMessages(prev => [...prev, { role: 'assistant', content: `❌ ${data.error}` }]);
        return;
      }

      // Save undo state before applying (deep clone to avoid shared references)
      setUndoStack(prev => [...prev.slice(-9), { nodes: structuredClone(nodes), edges: structuredClone(edges) }]);

      onFlowUpdated(data.nodes, data.edges);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `✅ ${data.summary}` },
      ]);
    } catch (err: any) {
      const msg = err.message || 'Something went wrong. Please try again.';
      toast.error(msg);
      setMessages(prev => [...prev, { role: 'assistant', content: `❌ ${msg}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUndo = () => {
    const last = undoStack[undoStack.length - 1];
    if (!last) return;
    setUndoStack(prev => prev.slice(0, -1));
    onFlowUpdated(last.nodes, last.edges);
    toast.success('Reverted to previous flow state');
    setMessages(prev => [...prev, { role: 'assistant', content: '↩️ Reverted to previous version.' }]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="absolute bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {/* Expanded chat panel */}
      {isOpen && (
        <div className="w-80 bg-background border rounded-xl shadow-xl flex flex-col overflow-hidden"
          style={{ maxHeight: '420px' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">AI Flow Assistant</span>
            </div>
            <div className="flex items-center gap-1">
              {undoStack.length > 0 && (
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleUndo}
                  title="Undo last AI change">
                  <Undo2 className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(false)}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 px-3 py-2">
            {messages.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground text-xs space-y-2">
                <Sparkles className="h-8 w-8 mx-auto opacity-30" />
                <p className="font-medium text-foreground text-sm">Ask AI to improve your flow</p>
                <p>Tell me what to add, remove, or change in plain English.</p>
                <div className="flex flex-wrap gap-1 justify-center mt-3">
                  {QUICK_PROMPTS.map(p => (
                    <button key={p}
                      onClick={() => handleSend(p)}
                      className="text-[10px] px-2 py-1 rounded-full bg-muted hover:bg-primary/10 hover:text-primary border border-border transition-colors text-left">
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2 py-1">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`rounded-xl px-3 py-2 text-xs max-w-[85%] leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="rounded-xl px-3 py-2 bg-muted flex items-center gap-1.5">
                      <Loader2 className="h-3 w-3 animate-spin text-primary" />
                      <span className="text-xs text-muted-foreground">Updating flow...</span>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div ref={bottomRef} />
          </ScrollArea>

          {/* Input */}
          <div className="border-t px-2 py-2 flex gap-1.5">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. Add a step after the cold call..."
              rows={2}
              className="text-xs resize-none flex-1 min-h-0"
              disabled={isLoading}
            />
            <Button
              size="icon"
              className="h-[52px] w-8 shrink-0"
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
            >
              {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <Button
        onClick={() => setIsOpen(o => !o)}
        className="rounded-full shadow-lg gap-2 h-10 px-4"
        variant={isOpen ? 'outline' : 'default'}
      >
        <Sparkles className="h-4 w-4" />
        <span className="text-sm">{isOpen ? 'AI' : 'AI Improve'}</span>
        {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
        {undoStack.length > 0 && !isOpen && (
          <Badge variant="secondary" className="text-[9px] h-4 px-1">{undoStack.length}</Badge>
        )}
      </Button>
    </div>
  );
}
