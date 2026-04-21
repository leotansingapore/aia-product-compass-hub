import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, Pencil, Trash2, CheckCircle2, Search, Loader2, Copy, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { useQuestionBankRows } from '@/hooks/useQuestionBank';
import { useQuestionBankAdmin } from '@/hooks/useQuestionBankAdmin';
import { QuestionFormDialog } from './QuestionFormDialog';
import {
  PRODUCT_SLUGS,
  PRODUCT_LABELS,
  CATEGORY_LABELS,
  type BankType,
  type QuestionBankQuestion,
  type QuestionCategory,
} from '@/types/questionBank';

export function QuestionBankManager() {
  const [searchParams] = useSearchParams();
  const initialProduct = searchParams.get('product');
  const initialBank = searchParams.get('bank');
  const [productSlug, setProductSlug] = useState<string>(
    initialProduct && (PRODUCT_SLUGS as readonly string[]).includes(initialProduct) ? initialProduct : 'pro-achiever'
  );
  const [bankType, setBankType] = useState<BankType>(
    initialBank === 'study' || initialBank === 'exam' ? (initialBank as BankType) : 'exam'
  );
  const [categoryFilter, setCategoryFilter] = useState<QuestionCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'duplicate'>('create');
  const [editingQuestion, setEditingQuestion] = useState<QuestionBankQuestion | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const searchRef = useRef<HTMLInputElement>(null);

  const { data: rows = [], isLoading } = useQuestionBankRows({ productSlug, bankType });
  const { deleteQuestion, bulkDelete, updateQuestion } = useQuestionBankAdmin();

  // --- Improvement 5: Clear selection on filter change ---
  useEffect(() => {
    setSelectedIds(new Set());
  }, [productSlug, bankType, categoryFilter]);

  // --- Improvement 4: Cmd+K to focus search ---
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: rows.length };
    for (const r of rows) {
      counts[r.category] = (counts[r.category] || 0) + 1;
    }
    return counts;
  }, [rows]);

  const filtered = useMemo(() => {
    let out = rows;
    if (categoryFilter !== 'all') out = out.filter((r) => r.category === categoryFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter(
        (r) =>
          r.question.toLowerCase().includes(q) ||
          r.options.some((o) => o.toLowerCase().includes(q))
      );
    }
    return out;
  }, [rows, categoryFilter, search]);

  const allSelected = filtered.length > 0 && filtered.every((r) => selectedIds.has(r.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((r) => r.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  // --- Improvement 1: Collapse/expand explanations ---
  const toggleExpand = (id: string) => {
    const next = new Set(expandedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedIds(next);
  };

  const handleDelete = async (id: string, questionText: string) => {
    if (!confirm(`Delete this question?\n\n"${questionText.slice(0, 80)}..."`)) return;
    await deleteQuestion.mutateAsync(id);
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.size} selected question(s)?`)) return;
    await bulkDelete.mutateAsync(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  const openCreate = () => {
    setEditingQuestion(null);
    setDialogMode('create');
    setDialogOpen(true);
  };

  const openEdit = (q: QuestionBankQuestion) => {
    setEditingQuestion(q);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  // --- Improvement 2: Duplicate question ---
  const openDuplicate = (q: QuestionBankQuestion) => {
    setEditingQuestion(q);
    setDialogMode('duplicate');
    setDialogOpen(true);
  };

  // --- Improvement 8: Undo toast on edit ---
  const handleEditWithUndo = useCallback(
    (prev: QuestionBankQuestion) => {
      const undoId = toast.success('Question updated', {
        action: {
          label: 'Undo',
          onClick: () => {
            updateQuestion.mutate({
              id: prev.id,
              updates: {
                question: prev.question,
                options: prev.options,
                correct_answer: prev.correct_answer,
                explanation: prev.explanation,
                category: prev.category,
                sort_order: prev.sort_order,
              },
            });
          },
        },
        duration: 5000,
      });
    },
    [updateQuestion]
  );

  const maxSortOrder = rows.reduce((max, r) => Math.max(max, r.sort_order), 0);

  return (
    <div className="space-y-4">
      {/* Header with filters */}
      <Card>
        <CardHeader>
          <CardTitle>Question Bank Manager</CardTitle>
          <CardDescription>
            View, add, edit, and delete questions for each product's study bank and exam.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Product</label>
              <Select value={productSlug} onValueChange={setProductSlug}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRODUCT_SLUGS.map((slug) => (
                    <SelectItem key={slug} value={slug}>{PRODUCT_LABELS[slug]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Bank Type</label>
              <Tabs value={bankType} onValueChange={(v) => setBankType(v as BankType)}>
                <TabsList className="w-full">
                  <TabsTrigger value="exam" className="flex-1">Exam</TabsTrigger>
                  <TabsTrigger value="study" className="flex-1">Study</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="lg:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Search <kbd className="ml-1 text-[10px] bg-muted px-1 py-0.5 rounded border font-mono">/</kbd>
              </label>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={searchRef}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search questions or options..."
                  className="pl-8"
                />
              </div>
            </div>
          </div>

          {/* Category filter pills */}
          <div className="flex flex-wrap gap-2">
            {(['all', ...(Object.keys(CATEGORY_LABELS) as QuestionCategory[])] as const).map((cat) => {
              const count = categoryCounts[cat] || 0;
              const label = cat === 'all' ? 'All' : CATEGORY_LABELS[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat as QuestionCategory | 'all')}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                    categoryFilter === cat ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-accent'
                  }`}
                >
                  {label} <span className="opacity-70">({count})</span>
                </button>
              );
            })}
          </div>

          {/* --- Improvement 6: Sticky action bar --- */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t sticky top-0 z-10 bg-card -mx-6 px-6 pb-2">
            <div className="text-sm text-muted-foreground">
              Showing <strong>{filtered.length}</strong> of <strong>{rows.length}</strong> questions
              {selectedIds.size > 0 && <span className="ml-2">· <strong>{selectedIds.size}</strong> selected</span>}
            </div>
            <div className="flex gap-2">
              {selectedIds.size > 0 && (
                <Button variant="destructive" size="sm" onClick={handleBulkDelete} disabled={bulkDelete.isPending}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete {selectedIds.size}
                </Button>
              )}
              <Button size="sm" onClick={openCreate}>
                <Plus className="h-4 w-4 mr-1" />
                Add Question
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No questions found. {rows.length === 0 ? 'Click "Add Question" to create the first one.' : 'Try adjusting filters.'}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            {/* Select all header */}
            <div className="flex items-center gap-2 px-4 py-2 border-b bg-muted/30">
              <Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} />
              <span className="text-xs text-muted-foreground">Select all visible</span>
            </div>

            <div className="divide-y">
              {filtered.map((q, idx) => {
                const isExpanded = expandedIds.has(q.id);
                return (
                  <div key={q.id} className="p-4 hover:bg-muted/20 transition-colors">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedIds.has(q.id)}
                        onCheckedChange={() => toggleSelect(q.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="text-xs text-muted-foreground tabular-nums">#{idx + 1}</span>
                          <Badge variant="secondary" className="text-xs">{CATEGORY_LABELS[q.category]}</Badge>
                        </div>
                        <p className="font-medium text-sm mb-2">{q.question}</p>
                        <ul className="space-y-1 mb-2">
                          {q.options.map((opt, i) => (
                            <li
                              key={i}
                              className={`text-xs flex items-start gap-1.5 ${
                                i === q.correct_answer ? 'text-green-700 dark:text-green-400 font-medium' : 'text-muted-foreground'
                              }`}
                            >
                              {i === q.correct_answer ? (
                                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                              ) : (
                                <span className="w-3.5 shrink-0" />
                              )}
                              <span>{String.fromCharCode(65 + i)}. {opt}</span>
                            </li>
                          ))}
                        </ul>

                        {/* --- Improvement 1: Collapsible explanation --- */}
                        <Collapsible open={isExpanded} onOpenChange={() => toggleExpand(q.id)}>
                          <CollapsibleTrigger asChild>
                            <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                              <ChevronDown className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                              {isExpanded ? 'Hide explanation' : 'Show explanation'}
                            </button>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <p className="text-xs text-muted-foreground italic border-l-2 border-muted pl-2 mt-2">
                              {q.explanation}
                            </p>
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {/* --- Improvement 2: Duplicate button --- */}
                        <Button size="icon" variant="ghost" onClick={() => openDuplicate(q)} title="Duplicate">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => openEdit(q)} title="Edit">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(q.id, q.question)}
                          disabled={deleteQuestion.isPending}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <QuestionFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        productSlug={productSlug}
        bankType={bankType}
        question={editingQuestion}
        mode={dialogMode}
        defaultSortOrder={maxSortOrder + 10}
        onEditComplete={handleEditWithUndo}
      />
    </div>
  );
}
