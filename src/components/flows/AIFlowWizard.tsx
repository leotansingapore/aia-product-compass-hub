import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { FlowNode, FlowEdge } from '@/hooks/useScriptFlows';

interface AIFlowWizardProps {
  open: boolean;
  onClose: () => void;
  onFlowGenerated: (data: { title: string; description: string; nodes: FlowNode[]; edges: FlowEdge[] }) => void;
}

const AUDIENCE_OPTIONS = [
  { value: 'young-adult', label: 'Young Adults (18–25)', emoji: '🎓' },
  { value: 'nsf', label: 'NSFs / National Servicemen', emoji: '🎖️' },
  { value: 'working-adult', label: 'Working Adults (25–45)', emoji: '💼' },
  { value: 'pre-retiree', label: 'Pre-Retirees (45–60)', emoji: '🏖️' },
  { value: 'parent', label: 'Parents / Families', emoji: '👨‍👩‍👧' },
  { value: 'cold-lead', label: 'Cold Leads (Unknown)', emoji: '❄️' },
  { value: 'referral', label: 'Warm Referrals', emoji: '🤝' },
];

const GOAL_OPTIONS = [
  { value: 'book-meeting', label: 'Book a first meeting' },
  { value: 'close-sale', label: 'Close a sale / policy' },
  { value: 'nurture-lead', label: 'Nurture & warm up a lead' },
  { value: 'get-referral', label: 'Ask for referrals' },
  { value: 'reactivate', label: 'Re-engage dormant contacts' },
  { value: 'event-invite', label: 'Invite to seminar / event' },
  { value: 'custom', label: 'Custom goal...' },
];

export function AIFlowWizard({ open, onClose, onFlowGenerated }: AIFlowWizardProps) {
  const [step, setStep] = useState(0);
  const [audience, setAudience] = useState('');
  const [goal, setGoal] = useState('');
  const [customGoal, setCustomGoal] = useState('');
  const [context, setContext] = useState('');
  const [numSteps, setNumSteps] = useState([8]);
  const [isGenerating, setIsGenerating] = useState(false);

  const effectiveGoal = goal === 'custom' ? customGoal : GOAL_OPTIONS.find(g => g.value === goal)?.label || goal;

  const handleGenerate = async () => {
    if (!audience || !effectiveGoal) {
      toast.error('Please select an audience and goal');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-flow', {
        body: {
          targetAudience: AUDIENCE_OPTIONS.find(a => a.value === audience)?.label || audience,
          goal: effectiveGoal,
          context,
          numSteps: numSteps[0],
        },
      });

      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }

      onFlowGenerated(data);
      toast.success('Flow generated! You can now edit and customise it.');
      resetAndClose();
    } catch (err: any) {
      console.error('AI flow generation error:', err);
      toast.error(err.message || 'Failed to generate flow. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const resetAndClose = () => {
    setStep(0);
    setAudience('');
    setGoal('');
    setCustomGoal('');
    setContext('');
    setNumSteps([8]);
    onClose();
  };

  const canProceed = step === 0 ? !!audience : step === 1 ? !!(goal && (goal !== 'custom' || customGoal.trim())) : true;

  return (
    <Dialog open={open} onOpenChange={o => !o && resetAndClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Flow Builder
          </DialogTitle>
          <DialogDescription>
            Answer a few questions and AI will generate a complete sales flow for you.
          </DialogDescription>
        </DialogHeader>

        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-2">
          {[0, 1, 2].map(i => (
            <div key={i} className="flex items-center gap-2">
              <div className={`h-2 flex-1 rounded-full transition-colors ${i <= step ? 'bg-primary' : 'bg-muted'}`}
                style={{ width: '80px' }} />
            </div>
          ))}
          <span className="text-xs text-muted-foreground ml-1">Step {step + 1}/3</span>
        </div>

        {/* Step 0: Audience */}
        {step === 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Who are you targeting?</Label>
            <div className="grid grid-cols-2 gap-2">
              {AUDIENCE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setAudience(opt.value)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm text-left transition-all ${
                    audience === opt.value
                      ? 'border-primary bg-primary/10 font-medium'
                      : 'border-border hover:border-primary/40 hover:bg-muted/50'
                  }`}
                >
                  <span>{opt.emoji}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Goal */}
        {step === 1 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">What's the goal of this flow?</Label>
            <div className="grid grid-cols-2 gap-2">
              {GOAL_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setGoal(opt.value)}
                  className={`px-3 py-2.5 rounded-lg border text-sm text-left transition-all ${
                    goal === opt.value
                      ? 'border-primary bg-primary/10 font-medium'
                      : 'border-border hover:border-primary/40 hover:bg-muted/50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {goal === 'custom' && (
              <Input
                value={customGoal}
                onChange={e => setCustomGoal(e.target.value)}
                placeholder="Describe your goal..."
                autoFocus
              />
            )}
          </div>
        )}

        {/* Step 2: Fine-tune */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Any additional context? (optional)</Label>
              <Textarea
                value={context}
                onChange={e => setContext(e.target.value)}
                placeholder="e.g. I'm using WhatsApp mainly, the prospect was referred by a friend, they're interested in investment products..."
                rows={3}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Number of steps: {numSteps[0]}</Label>
              <Slider
                value={numSteps}
                onValueChange={setNumSteps}
                min={4}
                max={15}
                step={1}
                className="mt-2"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>Simple (4)</span>
                <span>Detailed (15)</span>
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 space-y-1.5">
              <p className="text-xs font-medium">Summary</p>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="secondary" className="text-[10px]">
                  {AUDIENCE_OPTIONS.find(a => a.value === audience)?.emoji} {AUDIENCE_OPTIONS.find(a => a.value === audience)?.label}
                </Badge>
                <Badge variant="secondary" className="text-[10px]">
                  🎯 {effectiveGoal}
                </Badge>
                <Badge variant="secondary" className="text-[10px]">
                  📊 ~{numSteps[0]} steps
                </Badge>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex-row justify-between sm:justify-between">
          <div>
            {step > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setStep(s => s - 1)} disabled={isGenerating}>
                <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={resetAndClose} disabled={isGenerating}>Cancel</Button>
            {step < 2 ? (
              <Button onClick={() => setStep(s => s + 1)} disabled={!canProceed}>
                Next <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleGenerate} disabled={isGenerating} className="gap-1.5">
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" /> Generate Flow
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
