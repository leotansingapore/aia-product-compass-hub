import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, ChevronLeft } from "lucide-react";
import { PlaybookItem } from "@/hooks/usePlaybooks";
import type { ObjectionEntry } from "@/hooks/useObjections";
import type { ScriptVersion } from "@/hooks/useScripts";

interface ScriptEntry {
  id: string;
  stage: string;
  category: string;
  target_audience: string;
  script_role?: string;
  tags?: string[];
  versions: ScriptVersion[];
}

interface AddToPlaybookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scripts: ScriptEntry[];
  objections: ObjectionEntry[];
  items: PlaybookItem[];
  onAddScript: (scriptId: string, versionIndex?: number) => void;
  onAddObjection: (objectionId: string) => void;
}

function FilterRow({
  scriptCategories,
  scriptAudiences,
  scriptRoles,
  categoryFilter,
  audienceFilter,
  roleFilter,
  setCategoryFilter,
  setAudienceFilter,
  setRoleFilter,
}: {
  scriptCategories: string[];
  scriptAudiences: string[];
  scriptRoles: string[];
  categoryFilter: string | null;
  audienceFilter: string | null;
  roleFilter: string | null;
  setCategoryFilter: (v: string | null) => void;
  setAudienceFilter: (v: string | null) => void;
  setRoleFilter: (v: string | null) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="space-y-1">
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Category</label>
        <Select value={categoryFilter ?? "all"} onValueChange={v => setCategoryFilter(v === "all" ? null : v)}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {scriptCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Audience</label>
        <Select value={audienceFilter ?? "all"} onValueChange={v => setAudienceFilter(v === "all" ? null : v)}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {scriptAudiences.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Role</label>
        <Select value={roleFilter ?? "all"} onValueChange={v => setRoleFilter(v === "all" ? null : v)}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {scriptRoles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

/** Version preview panel: shows all versions, lets user pick one to add */
function VersionPreviewPanel({
  script,
  onAdd,
  onBack,
}: {
  script: ScriptEntry;
  onAdd: (scriptId: string, versionIndex?: number) => void;
  onBack: () => void;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const version = script.versions[selectedIndex];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="h-3.5 w-3.5" /> Back
        </button>
        <span className="text-sm font-medium truncate flex-1">{script.stage}</span>
      </div>

      {/* Version tabs */}
      <div className="flex gap-1.5 flex-wrap">
        <button
          className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${selectedIndex === -1 ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground'}`}
          onClick={() => setSelectedIndex(-1 as any)}
        >
          All versions
        </button>
        {script.versions.map((v, i) => (
          <button
            key={i}
            className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${selectedIndex === i ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground'}`}
            onClick={() => setSelectedIndex(i)}
          >
            {v.author || `Version ${i + 1}`}
          </button>
        ))}
      </div>

      {/* Preview content */}
      {(selectedIndex as any) !== -1 && version && (
        <div className="rounded-lg border bg-muted/30 p-3 max-h-52 overflow-y-auto">
          <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">{version.content}</p>
        </div>
      )}
      {(selectedIndex as any) === -1 && (
        <div className="rounded-lg border bg-muted/30 p-3 max-h-52 overflow-y-auto space-y-3">
          {script.versions.map((v, i) => (
            <div key={i}>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">{v.author || `Version ${i + 1}`}</p>
              <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">{v.content}</p>
            </div>
          ))}
        </div>
      )}

      <button
        className="self-end flex items-center gap-1 px-3 py-1.5 text-xs text-muted-foreground border border-dashed border-border rounded-md hover:border-muted-foreground/50 hover:text-foreground transition-colors"
        onClick={() => {
          if ((selectedIndex as any) === -1) {
            onAdd(script.id);
          } else {
            onAdd(script.id, selectedIndex);
          }
          onBack();
        }}
      >
        <Plus className="h-3 w-3" />
        {(selectedIndex as any) === -1 ? "Add all versions" : `Add "${version?.author || `Version ${selectedIndex + 1}`}"`}
      </button>
    </div>
  );
}

export function AddToPlaybookDialog({
  open,
  onOpenChange,
  scripts,
  objections,
  items,
  onAddScript,
  onAddObjection,
}: AddToPlaybookDialogProps) {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"scripts" | "objections">("scripts");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [audienceFilter, setAudienceFilter] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [objCategoryFilter, setObjCategoryFilter] = useState<string | null>(null);
  const [previewScript, setPreviewScript] = useState<ScriptEntry | null>(null);

  const usedScriptIds = useMemo(() => new Set(items.filter(i => i.item_type === 'script').map(i => i.script_id)), [items]);
  const usedObjectionIds = useMemo(() => new Set(items.filter(i => i.item_type === 'objection').map(i => i.objection_id)), [items]);

  const scriptCategories = useMemo(() => [...new Set(scripts.map(s => s.category))].sort(), [scripts]);
  const scriptAudiences = useMemo(() => [...new Set(scripts.map(s => s.target_audience).filter(Boolean) as string[])].sort(), [scripts]);
  const scriptRoles = useMemo(() => [...new Set(scripts.map(s => s.script_role).filter(Boolean) as string[])].sort(), [scripts]);
  const objCategories = useMemo(() => [...new Set(objections.map(o => o.category))].sort(), [objections]);

  const filteredScripts = useMemo(() => {
    let filtered = scripts.filter(s => !usedScriptIds.has(s.id));
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(s => s.stage.toLowerCase().includes(q) || s.category.toLowerCase().includes(q));
    }
    if (categoryFilter) filtered = filtered.filter(s => s.category === categoryFilter);
    if (audienceFilter) filtered = filtered.filter(s => s.target_audience === audienceFilter);
    if (roleFilter) filtered = filtered.filter(s => s.script_role === roleFilter);
    return filtered;
  }, [scripts, usedScriptIds, search, categoryFilter, audienceFilter, roleFilter]);

  const filteredObjections = useMemo(() => {
    let filtered = objections.filter(o => !usedObjectionIds.has(o.id));
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(o => o.title.toLowerCase().includes(q) || o.category.toLowerCase().includes(q));
    }
    if (objCategoryFilter) filtered = filtered.filter(o => o.category === objCategoryFilter);
    return filtered;
  }, [objections, usedObjectionIds, search, objCategoryFilter]);

  const hasActiveFilters = categoryFilter || audienceFilter || roleFilter || objCategoryFilter;

  const clearFilters = () => {
    setCategoryFilter(null);
    setAudienceFilter(null);
    setRoleFilter(null);
    setObjCategoryFilter(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-[95vw] max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Add to Playbook</DialogTitle>
        </DialogHeader>

        {previewScript ? (
          <VersionPreviewPanel
            script={previewScript}
            onAdd={onAddScript}
            onBack={() => setPreviewScript(null)}
          />
        ) : (
          <>
            <div className="flex items-center gap-2">
              <Input
                placeholder={tab === "scripts" ? "Search scripts..." : "Search objections..."}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 h-9"
              />
              {hasActiveFilters && (
                <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0">
                  <X className="h-3.5 w-3.5" /> Clear
                </button>
              )}
            </div>

            <Tabs value={tab} onValueChange={(v) => { setTab(v as any); setSearch(""); clearFilters(); }}>
              <TabsList className="w-full">
                <TabsTrigger value="scripts" className="flex-1">
                  Scripts ({filteredScripts.length})
                </TabsTrigger>
                <TabsTrigger value="objections" className="flex-1">
                  Objections ({filteredObjections.length})
                </TabsTrigger>
              </TabsList>

              {/* Filters always visible below tabs */}
              <div className="mt-2">
                {tab === "scripts" ? (
                  <FilterRow
                    scriptCategories={scriptCategories}
                    scriptAudiences={scriptAudiences}
                    scriptRoles={scriptRoles}
                    categoryFilter={categoryFilter}
                    audienceFilter={audienceFilter}
                    roleFilter={roleFilter}
                    setCategoryFilter={setCategoryFilter}
                    setAudienceFilter={setAudienceFilter}
                    setRoleFilter={setRoleFilter}
                  />
                ) : (
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Category</label>
                    <Select value={objCategoryFilter ?? "all"} onValueChange={v => setObjCategoryFilter(v === "all" ? null : v)}>
                      <SelectTrigger className="h-8 text-xs w-48">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        {objCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <TabsContent value="scripts" className="mt-2">
                <div className="overflow-y-auto max-h-[42vh] space-y-1.5">
                  {filteredScripts.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {search || hasActiveFilters ? "No matching scripts found" : "All scripts are already in this playbook"}
                    </p>
                  ) : (
                    filteredScripts.map(script => (
                      <div key={script.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{script.stage}</p>
                          <div className="flex gap-1 mt-1 flex-wrap">
                            <Badge variant="secondary" className="text-[10px]">{script.category}</Badge>
                            {script.target_audience && script.target_audience !== 'general' && (
                              <Badge variant="outline" className="text-[10px]">{script.target_audience}</Badge>
                            )}
                            {script.script_role && script.script_role !== 'consultant' && (
                              <Badge variant="outline" className="text-[10px]">{script.script_role}</Badge>
                            )}
                            {script.versions.length > 1 && (
                              <Badge variant="outline" className="text-[10px] text-muted-foreground">
                                {script.versions.length} versions
                              </Badge>
                            )}
                          </div>
                        </div>
                        {script.versions && script.versions.length > 1 ? (
                          <button
                            className="shrink-0 flex items-center gap-1 px-2.5 py-1 text-xs text-muted-foreground border border-dashed border-border rounded-md hover:border-muted-foreground/50 hover:text-foreground transition-colors"
                            onClick={() => setPreviewScript(script)}
                          >
                            Preview & add
                          </button>
                        ) : (
                          <button
                            className="shrink-0 flex items-center gap-1 px-2.5 py-1 text-xs text-muted-foreground border border-dashed border-border rounded-md hover:border-muted-foreground/50 hover:text-foreground transition-colors"
                            onClick={() => onAddScript(script.id)}
                          >
                            <Plus className="h-3 w-3" /> Add
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="objections" className="mt-2">
                <div className="overflow-y-auto max-h-[42vh] space-y-1.5">
                  {filteredObjections.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {search || hasActiveFilters ? "No matching objections found" : "All objections are already in this playbook"}
                    </p>
                  ) : (
                    filteredObjections.map(objection => (
                      <div key={objection.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{objection.title}</p>
                          <div className="flex gap-1 mt-1 flex-wrap">
                            <Badge variant="secondary" className="text-[10px]">{objection.category}</Badge>
                            {objection.tags?.map(tag => (
                              <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
                            ))}
                          </div>
                          {objection.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{objection.description}</p>
                          )}
                        </div>
                        <button className="shrink-0 flex items-center gap-1 px-2.5 py-1 text-xs text-muted-foreground border border-dashed border-border rounded-md hover:border-muted-foreground/50 hover:text-foreground transition-colors" onClick={() => onAddObjection(objection.id)}>
                          <Plus className="h-3 w-3" /> Add
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
