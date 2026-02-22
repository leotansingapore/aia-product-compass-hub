import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import type { ScriptEntry, ScriptVersion } from "@/hooks/useScripts";

const CATEGORIES = [
  { value: "cold-calling", label: "Cold Calling" },
  { value: "follow-up", label: "Follow-Up Messages" },
  { value: "ad-campaign", label: "Ad Campaign / Lead Gen" },
  { value: "referral", label: "Referral Scripts" },
  { value: "confirmation", label: "Appointment Confirmation" },
  { value: "post-meeting", label: "Post-Meeting" },
  { value: "faq", label: "FAQ / Objections" },
  { value: "tips", label: "Tips & Best Practices" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: { stage: string; category: string; versions: ScriptVersion[]; sort_order: number }) => Promise<void>;
  script?: ScriptEntry | null;
}

export function ScriptEditorDialog({ open, onClose, onSave, script }: Props) {
  const [stage, setStage] = useState("");
  const [category, setCategory] = useState("cold-calling");
  const [versions, setVersions] = useState<ScriptVersion[]>([{ author: "", content: "" }]);
  const [sortOrder, setSortOrder] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (script) {
      setStage(script.stage);
      setCategory(script.category);
      setVersions(script.versions.length > 0 ? script.versions : [{ author: "", content: "" }]);
      setSortOrder(script.sort_order);
    } else {
      setStage("");
      setCategory("cold-calling");
      setVersions([{ author: "", content: "" }]);
      setSortOrder(0);
    }
  }, [script, open]);

  const handleSubmit = async () => {
    if (!stage.trim()) return;
    const validVersions = versions.filter(v => v.content.trim());
    if (validVersions.length === 0) return;
    setSaving(true);
    await onSave({ stage, category, versions: validVersions, sort_order: sortOrder });
    setSaving(false);
    onClose();
  };

  const updateVersion = (index: number, field: keyof ScriptVersion, value: string) => {
    setVersions(prev => prev.map((v, i) => i === index ? { ...v, [field]: value } : v));
  };

  const addVersion = () => setVersions(prev => [...prev, { author: "", content: "" }]);
  const removeVersion = (index: number) => setVersions(prev => prev.filter((_, i) => i !== index));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{script ? "Edit Script" : "Add New Script"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Script Title / Stage</Label>
            <Input value={stage} onChange={e => setStage(e.target.value)} placeholder="e.g. Cold Calling — Original Script" />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-24">
              <Label>Order</Label>
              <Input type="number" value={sortOrder} onChange={e => setSortOrder(Number(e.target.value))} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Script Versions</Label>
              <Button variant="outline" size="sm" onClick={addVersion} className="gap-1">
                <Plus className="h-3 w-3" /> Add Version
              </Button>
            </div>
            <div className="space-y-4">
              {versions.map((v, i) => (
                <div key={i} className="border rounded-lg p-3 space-y-2 bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Input
                      value={v.author}
                      onChange={e => updateVersion(i, "author", e.target.value)}
                      placeholder="Author / Version name"
                      className="flex-1"
                    />
                    {versions.length > 1 && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeVersion(i)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <Textarea
                    value={v.content}
                    onChange={e => updateVersion(i, "content", e.target.value)}
                    placeholder="Script content... (supports markdown)"
                    rows={8}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving || !stage.trim()}>
            {saving ? "Saving..." : script ? "Save Changes" : "Create Script"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
