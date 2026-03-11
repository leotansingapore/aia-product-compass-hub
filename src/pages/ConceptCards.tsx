import { useState, useMemo } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { BrandedPageHeader } from '@/components/layout/BrandedPageHeader';
import { ScriptsTabBar } from '@/components/scripts/ScriptsTabBar';
import { useConceptCards, ConceptCard } from '@/hooks/useConceptCards';
import { useConceptCardsMutations } from '@/hooks/useConceptCards';
import { usePermissions } from '@/hooks/usePermissions';
import { ConceptCardUploadDialog } from '@/components/concept-cards/ConceptCardUploadDialog';
import { ConceptCardViewDialog } from '@/components/concept-cards/ConceptCardViewDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, ImageIcon, Trash2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const AUDIENCE_OPTIONS = ['All', 'NSF / NS', 'Young Adults', 'Working Adults', 'Pre-Retirees (50-65)', 'Parents', 'General'];
const PRODUCT_OPTIONS = ['All', 'Investment', 'Endowment', 'Whole Life', 'Term', 'Medical', 'General'];

function FlashCard({ card, onOpen, onDelete, isAdmin }: {
  card: ConceptCard;
  onOpen: (card: ConceptCard) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="group relative cursor-pointer"
      style={{ perspective: '1000px' }}
      onClick={() => card.image_url ? onOpen(card) : undefined}
    >
      <div
        className={cn(
          "relative w-full transition-all duration-500 rounded-2xl",
          "border bg-card shadow-sm hover:shadow-md hover:-translate-y-0.5",
          "min-h-[200px] sm:min-h-[220px]",
          !card.image_url && "cursor-default"
        )}
      >
        {/* Card content */}
        <div className="p-4 sm:p-5 flex flex-col h-full min-h-[200px]">
          {/* Question */}
          <div className="flex-1">
            <p className="text-xs font-semibold text-primary/70 uppercase tracking-wide mb-2">Question</p>
            <h3 className="font-semibold text-sm sm:text-base leading-snug line-clamp-4">{card.title}</h3>
            {card.description && (
              <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{card.description}</p>
            )}
          </div>

          {/* Image preview thumbnail */}
          {card.image_url && (
            <div className="mt-3 rounded-lg overflow-hidden bg-muted/30 border border-border/50 h-20 flex items-center justify-center">
              <img
                src={card.image_url}
                alt={card.title}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          )}

          {!card.image_url && (
            <div className="mt-3 rounded-lg bg-muted/30 border border-dashed border-border/50 h-16 flex items-center justify-center">
              <ImageIcon className="h-5 w-5 text-muted-foreground/40" />
            </div>
          )}

          {/* Tags */}
          <div className="mt-3 flex flex-wrap gap-1">
            {card.audience.slice(0, 2).map(a => (
              <Badge key={a} variant="outline" className="text-[10px] px-1.5 py-0">{a}</Badge>
            ))}
            {card.product_type.slice(0, 2).map(p => (
              <Badge key={p} className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-primary/20">{p}</Badge>
            ))}
          </div>

          {/* Hint click to expand */}
          {card.image_url && (
            <p className="text-[10px] text-muted-foreground/60 mt-2 flex items-center gap-1">
              <ChevronDown className="h-3 w-3" /> Click to see full drawing
            </p>
          )}
        </div>

        {/* Admin delete */}
        {isAdmin && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(card.id); }}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default function ConceptCardsPage() {
  const { cards, loading, refetch } = useConceptCards();
  const { deleteCard } = useConceptCardsMutations();
  const { isAdmin } = usePermissions();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewCard, setViewCard] = useState<ConceptCard | null>(null);
  const [search, setSearch] = useState('');
  const [filterAudience, setFilterAudience] = useState('All');
  const [filterProduct, setFilterProduct] = useState('All');

  const filtered = useMemo(() => {
    return cards.filter(c => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        c.title.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.tags.some(t => t.includes(q));
      const matchAudience = filterAudience === 'All' || c.audience.includes(filterAudience);
      const matchProduct = filterProduct === 'All' || c.product_type.includes(filterProduct);
      return matchSearch && matchAudience && matchProduct;
    });
  }, [cards, search, filterAudience, filterProduct]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this concept card?')) return;
    const ok = await deleteCard(id);
    if (ok) refetch();
  };

  return (
    <PageLayout title="Concept Cards — FINternship" description="Visual concept flashcards for financial advisors">
      <BrandedPageHeader
        title="Concept Cards"
        titlePrefix="🃏 "
        subtitle="Visual concept drawings as flashcards — click a card to reveal the drawing"
        showBackButton={false}
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Concept Cards' }]}
      />

      <div className="mx-auto px-3 md:px-6 py-3 md:py-8 max-w-5xl">
        <ScriptsTabBar />

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search concept cards..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterAudience} onValueChange={setFilterAudience}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Audience" />
            </SelectTrigger>
            <SelectContent>
              {AUDIENCE_OPTIONS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterProduct} onValueChange={setFilterProduct}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Product" />
            </SelectTrigger>
            <SelectContent>
              {PRODUCT_OPTIONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
          {isAdmin() && (
            <Button onClick={() => setUploadOpen(true)} className="shrink-0">
              <Plus className="h-4 w-4 mr-1.5" />
              Add Card
            </Button>
          )}
        </div>

        {/* Count */}
        <p className="text-sm text-muted-foreground mb-4">
          {loading ? 'Loading...' : `${filtered.length} card${filtered.length !== 1 ? 's' : ''}`}
        </p>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl border bg-card min-h-[200px] animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="text-4xl">🃏</div>
            <p className="text-muted-foreground font-medium">
              {cards.length === 0 ? 'No concept cards yet' : 'No cards match your filters'}
            </p>
            {isAdmin() && cards.length === 0 && (
              <Button onClick={() => setUploadOpen(true)} variant="outline">
                <Plus className="h-4 w-4 mr-1.5" /> Add the first card
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(card => (
              <FlashCard
                key={card.id}
                card={card}
                onOpen={setViewCard}
                onDelete={handleDelete}
                isAdmin={isAdmin()}
              />
            ))}
          </div>
        )}
      </div>

      <ConceptCardUploadDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onCreated={refetch}
      />
      <ConceptCardViewDialog
        card={viewCard}
        onClose={() => setViewCard(null)}
      />
    </PageLayout>
  );
}
