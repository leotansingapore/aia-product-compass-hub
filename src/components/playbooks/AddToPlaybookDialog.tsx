import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Filter, X, ChevronDown, ChevronRight } from "lucide-react";
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

function FilterChips({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: string[];
  selected: string | null;
  onToggle: (val: string | null) => void;
}) {
  if (options.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide shrink-0">{label}</span>
      {options.map(opt => (
        <Badge
          key={opt}
          variant={selected === opt ? "default" : "outline"}
          className="text-[10px] cursor-pointer hover:bg-primary/10 transition-colors"
          onClick={() => onToggle(selected === opt ? null : opt)}
        >
          {opt}
        </Badge>
      ))}
      {selected && (
        <button onClick={() => onToggle(null)} className="text-muted-foreground hover:text-foreground">
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

function ScriptVersionPicker({ script, onAdd }: { script: ScriptEntry; onAdd: (scriptId: string, versionIndex?: number) => void }) {
  const [expanded, setExpanded] = useState(false);
  const hasMultipleVersions = script.versions && script.versions.length > 1;

  if (!hasMultipleVersions) {
    return (
      <Button size="sm" variant="outline" className="ml-2 shrink-0" onClick={() => onAdd(script.id)}>
        <Plus className="h-3.5 w-3.5 mr-1" /> Add
      </Button>
    );
  }

  return (
    <div className="ml-2 shrink-0 flex flex-col items-end gap-1">
      <Button size="sm" variant="outline" className="gap-1" onClick={() => setExpanded(!expanded)}>
        {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        Add Version
      </Button>
      {expanded && (
        <div className="flex flex-col gap-1 mt-1 w-full">
          <Button size="sm" variant="ghost" className="h-7 text-xs justify-start" onClick={() => { onAdd(script.id); setExpanded(false); }}>
            <Plus className="h-3 w-3 mr-1" /> All versions
          </Button>
          {script.versions.map((v, i) => (
            <Button
              key={i}
              size="sm"
              variant="ghost"
              className="h-7 text-xs justify-start truncate"
              onClick={() => { onAdd(script.id, i); setExpanded(false); }}
            >
              <Plus className="h-3 w-3 mr-1 shrink-0" />
              <span className="truncate">{v.author || `Version ${i + 1}`}</span>
            </Button>
          ))}
        </div>
      )}
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
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [audienceFilter, setAudienceFilter] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [objCategoryFilter, setObjCategoryFilter] = useState<string | null>(null);

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

        <div className="flex items-center gap-2 mb-2">
          <Input
            placeholder={tab === "scripts" ? "Search scripts..." : "Search objections..."}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1"
          />
          <Button
            variant={showFilters || hasActiveFilters ? "default" : "outline"}
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
          </Button>
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

          {showFilters && (
            <div className="mt-2 p-2.5 rounded-lg border bg-muted/30 space-y-2">
              {tab === "scripts" ? (
                <>
                  <FilterChips label="Category" options={scriptCategories} selected={categoryFilter} onToggle={setCategoryFilter} />
                  <FilterChips label="Audience" options={scriptAudiences} selected={audienceFilter} onToggle={setAudienceFilter} />
                  <FilterChips label="Role" options={scriptRoles} selected={roleFilter} onToggle={setRoleFilter} />
                </>
              ) : (
                <FilterChips label="Category" options={objCategories} selected={objCategoryFilter} onToggle={setObjCategoryFilter} />
              )}
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1" onClick={clearFilters}>
                  <X className="h-3 w-3" /> Clear filters
                </Button>
              )}
            </div>
          )}

          <TabsContent value="scripts" className="mt-2">
            <div className="overflow-y-auto max-h-[50vh] space-y-2">
              {filteredScripts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {search || hasActiveFilters ? "No matching scripts found" : "All scripts are already in this playbook"}
                </p>
              ) : (
                filteredScripts.map(script => (
                  <div key={script.id} className="flex items-start justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors gap-2">
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
                    <ScriptVersionPicker script={script} onAdd={onAddScript} />
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="objections" className="mt-2">
            <div className="overflow-y-auto max-h-[50vh] space-y-2">
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
                    <Button size="sm" variant="outline" className="ml-2 shrink-0" onClick={() => onAddObjection(objection.id)}>
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add
                    </Button>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
