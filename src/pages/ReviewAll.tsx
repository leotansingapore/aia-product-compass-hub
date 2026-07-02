import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PageLayout } from '@/components/layout/PageLayout';
import { supabase } from '@/integrations/supabase/client';
import { fetchAllRows } from '@/lib/fetchAllRows';
import {
  PRODUCT_SLUGS,
  PRODUCT_LABELS,
  CATEGORY_LABELS,
  type QuestionBankQuestion,
  type QuestionCategory,
} from '@/types/questionBank';
import { ArrowLeft, Printer, Search, CheckCircle2, Loader2 } from 'lucide-react';

function useAllQuestions() {
  return useQuery({
    queryKey: ['all-question-bank-questions'],
    queryFn: async (): Promise<QuestionBankQuestion[]> => {
      const rows = await fetchAllRows<QuestionBankQuestion>((from, to) =>
        supabase
          .from('question_bank_questions' as never)
          .select('*')
          .order('product_slug', { ascending: true })
          .order('bank_type', { ascending: true })
          .order('category', { ascending: true })
          .order('sort_order', { ascending: true })
          .order('id', { ascending: true }) // unique tiebreaker so pages never overlap
          .range(from, to),
      );
      return rows;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export default function ReviewAll() {
  const navigate = useNavigate();
  const { data: all = [], isLoading } = useAllQuestions();
  const [productFilter, setProductFilter] = useState<string>('all');
  const [bankFilter, setBankFilter] = useState<'all' | 'study' | 'exam'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | QuestionCategory>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return all.filter(
      (row) =>
        (productFilter === 'all' || row.product_slug === productFilter) &&
        (bankFilter === 'all' || row.bank_type === bankFilter) &&
        (categoryFilter === 'all' || row.category === categoryFilter) &&
        (q === '' ||
          row.question.toLowerCase().includes(q) ||
          row.explanation.toLowerCase().includes(q) ||
          row.options.some((o) => o.toLowerCase().includes(q))),
    );
  }, [all, productFilter, bankFilter, categoryFilter, search]);

  // Group: product -> bank -> rows
  const grouped = useMemo(() => {
    const byProduct = new Map<string, Map<string, QuestionBankQuestion[]>>();
    for (const row of filtered) {
      if (!byProduct.has(row.product_slug)) byProduct.set(row.product_slug, new Map());
      const banks = byProduct.get(row.product_slug)!;
      if (!banks.has(row.bank_type)) banks.set(row.bank_type, []);
      banks.get(row.bank_type)!.push(row);
    }
    return byProduct;
  }, [filtered]);

  return (
    <PageLayout title="All Questions & Answers | FINternship" description="Every product-mastery question and answer in one place.">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-8 animate-fade-in">
        <div className="print:hidden">
          <Button variant="ghost" size="sm" onClick={() => navigate('/question-banks')} className="mb-3 -ml-2">
            <ArrowLeft className="h-4 w-4 mr-1" /> Question Banks
          </Button>

          <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">All Questions &amp; Answers</h1>
              <p className="text-muted-foreground text-sm max-w-2xl">
                The complete question bank across every product — for revision, printing, or a quick reference
                before a client meeting. {all.length} questions in total.
              </p>
            </div>
            <Button variant="outline" className="gap-1.5" onClick={() => window.print()} title="Opens the print dialog — choose 'Save as PDF' as the destination to download">
              <Printer className="h-4 w-4" /> Print / Save as PDF
            </Button>
          </div>

          {/* Filters */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
            <select value={productFilter} onChange={(e) => setProductFilter(e.target.value)} className="rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[44px]">
              <option value="all">All products</option>
              {PRODUCT_SLUGS.map((s) => (
                <option key={s} value={s}>{PRODUCT_LABELS[s]}</option>
              ))}
            </select>
            <select value={bankFilter} onChange={(e) => setBankFilter(e.target.value as typeof bankFilter)} className="rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[44px]">
              <option value="all">Study + Exam</option>
              <option value="study">Study only</option>
              <option value="exam">Exam only</option>
            </select>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as typeof categoryFilter)} className="rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[44px]">
              <option value="all">All categories</option>
              {(Object.keys(CATEGORY_LABELS) as QuestionCategory[]).map((c) => (
                <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
              ))}
            </select>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search questions..."
                className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm min-h-[44px]"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-4">Showing {filtered.length} of {all.length} questions</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="space-y-8">
            {Array.from(grouped.entries()).map(([slug, banks]) => (
              <section key={slug} className="break-inside-avoid">
                <h2 className="text-lg font-bold mb-3 pb-1 border-b">{PRODUCT_LABELS[slug] ?? slug}</h2>
                {Array.from(banks.entries()).map(([bank, rows]) => (
                  <div key={bank} className="mb-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={bank === 'exam' ? 'default' : 'secondary'} className="capitalize">{bank} bank</Badge>
                      <span className="text-xs text-muted-foreground">{rows.length} questions</span>
                    </div>
                    <div className="space-y-2">
                      {rows.map((row, i) => (
                        <Card key={row.id} className="break-inside-avoid">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-2 mb-2">
                              <span className="text-xs text-muted-foreground font-medium shrink-0">{i + 1}.</span>
                              <div className="min-w-0">
                                <p className="text-sm font-medium">{row.question}</p>
                                <Badge variant="outline" className="text-[10px] mt-1">
                                  {CATEGORY_LABELS[row.category] ?? row.category}
                                </Badge>
                              </div>
                            </div>
                            <div className="space-y-1 pl-5">
                              {row.options.map((opt, oi) => (
                                <div
                                  key={oi}
                                  className={`text-xs rounded px-2 py-1 flex items-start gap-1.5 ${
                                    oi === row.correct_answer
                                      ? 'bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-300 font-medium'
                                      : 'text-muted-foreground'
                                  }`}
                                >
                                  {oi === row.correct_answer ? (
                                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                                  ) : (
                                    <span className="h-3.5 w-3.5 shrink-0 mt-0.5 text-center">{String.fromCharCode(65 + oi)}</span>
                                  )}
                                  <span>{opt}</span>
                                </div>
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2 leading-relaxed pl-5 border-t pt-2">{row.explanation}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </section>
            ))}
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-12">No questions match your filters.</p>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
