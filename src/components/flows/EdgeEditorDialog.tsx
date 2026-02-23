import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { FlowEdge } from '@/hooks/useScriptFlows';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (edge: Partial<FlowEdge>) => void;
  edge: FlowEdge | null;
}

export function EdgeEditorDialog({ open, onClose, onSave, edge }: Props) {
  const [label, setLabel] = useState(edge?.label || '');
  const [condition, setCondition] = useState<string>(edge?.condition || '_none');

  const [prevEdge, setPrevEdge] = useState(edge);
  if (edge !== prevEdge) {
    setPrevEdge(edge);
    setLabel(edge?.label || '');
    setCondition(edge?.condition || '_none');
  }

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit Connection</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Label</Label>
            <Input value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. Yes, No, Day 2" />
          </div>
          <div>
            <Label>Condition Type</Label>
            <Select value={condition} onValueChange={setCondition}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">None</SelectItem>
                <SelectItem value="yes">✅ Yes</SelectItem>
                <SelectItem value="no">❌ No</SelectItem>
                <SelectItem value="no-reply">⏳ No Reply</SelectItem>
                <SelectItem value="custom">🔗 Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { onSave({ label, condition: condition === '_none' ? undefined : condition as FlowEdge['condition'] }); onClose(); }}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
