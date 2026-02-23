import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MinimalRichEditor } from '@/components/MinimalRichEditor';
import type { FlowNode } from '@/hooks/useScriptFlows';
import type { ScriptEntry } from '@/hooks/useScripts';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (node: Partial<FlowNode>) => void;
  node: FlowNode | null;
  scripts: ScriptEntry[];
}

export function NodeEditorDialog({ open, onClose, onSave, node, scripts }: Props) {
  const [label, setLabel] = useState(node?.label || '');
  const [type, setType] = useState<FlowNode['type']>(node?.type || 'script');
  const [scriptId, setScriptId] = useState(node?.scriptId || '');
  const [customText, setCustomText] = useState(node?.customText || '');

  // Reset when node changes
  const [prevNode, setPrevNode] = useState(node);
  if (node !== prevNode) {
    setPrevNode(node);
    setLabel(node?.label || '');
    setType(node?.type || 'script');
    setScriptId(node?.scriptId || '');
    setCustomText(node?.customText || '');
  }

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{node ? 'Edit Node' : 'Add Node'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Label</Label>
            <Input value={label} onChange={e => setLabel(e.target.value)} placeholder="Node label" />
          </div>
          <div>
            <Label>Type</Label>
            <Select value={type} onValueChange={v => setType(v as FlowNode['type'])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="start">🟢 Start</SelectItem>
                <SelectItem value="script">📄 Script</SelectItem>
                <SelectItem value="decision">🔀 Decision</SelectItem>
                <SelectItem value="action">⏳ Action / Wait</SelectItem>
                <SelectItem value="end">🔴 End</SelectItem>
                <SelectItem value="hexagon">⬡ Hexagon</SelectItem>
                <SelectItem value="parallelogram">▱ Input/Output</SelectItem>
                <SelectItem value="cylinder">🛢 Storage</SelectItem>
                <SelectItem value="document">📋 Document</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Link to Script (optional)</Label>
            <Select value={scriptId || '_none'} onValueChange={v => setScriptId(v === '_none' ? '' : v)}>
              <SelectTrigger><SelectValue placeholder="Select a script..." /></SelectTrigger>
              <SelectContent className="max-h-60">
                <SelectItem value="_none">— No linked script —</SelectItem>
                {scripts.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.stage}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Notes / Custom Text</Label>
            <div className="border rounded-md overflow-hidden">
              <MinimalRichEditor
                value={customText}
                onChange={setCustomText}
                placeholder="Add formatted notes, tips, or talking points..."
                showToolbar={true}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { onSave({ label, type, scriptId: scriptId || null, customText }); onClose(); }} disabled={!label.trim()}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
