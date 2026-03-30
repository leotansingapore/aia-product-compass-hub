import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAllProducts } from './useProducts';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { getCMFASModuleName } from '@/data/cmfasModuleData';

export type SearchResultType = 'product' | 'cmfas' | 'script' | 'kb';

export interface UnifiedSearchResult {
  id: string;
  title: string;
  description?: string;
  type: SearchResultType;
  categoryName: string;
  categoryId?: string;
  tags?: string[];
  highlights?: string[];
  relevanceScore: number;
  route: string; // Navigation route
  typeLabel: string; // Human-readable type
  icon?: string; // Lucide icon name
}

export interface UnifiedSearchFilters {
  category?: string;
  tags?: string[];
  types?: SearchResultType[];
  hasVideos?: boolean;
  hasLinks?: boolean;
}

// Fuzzy matching: Levenshtein distance
function levenshtein(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] = b[i - 1] === a[j - 1]
        ? matrix[i - 1][j - 1]
        : Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
    }
  }
  return matrix[b.length][a.length];
}

// Fuzzy score: higher = better match (0 to 1)
function fuzzyScore(query: string, target: string): number {
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  if (t.includes(q)) return 1;
  if (q.length <= 2) return 0;
  
  // Check each word in target
  const words = t.split(/\s+/);
  let bestScore = 0;
  for (const word of words) {
    if (word.startsWith(q.slice(0, 2))) {
      const dist = levenshtein(q, word);
      const maxLen = Math.max(q.length, word.length);
      const score = 1 - dist / maxLen;
      if (score > bestScore) bestScore = score;
    }
  }
  
  // Also check trigram overlap for longer queries
  if (q.length >= 3) {
    const qTrigrams = new Set<string>();
    for (let i = 0; i <= q.length - 3; i++) qTrigrams.add(q.slice(i, i + 3));
    let matches = 0;
    for (let i = 0; i <= t.length - 3; i++) {
      if (qTrigrams.has(t.slice(i, i + 3))) matches++;
    }
    const trigramScore = matches / qTrigrams.size;
    if (trigramScore > bestScore) bestScore = trigramScore;
  }
  
  return bestScore > 0.6 ? bestScore : 0;
}

// Score a single item against query
function scoreItem(query: string, fields: { text: string; weight: number }[]): number {
  const queryLower = query.toLowerCase();
  const terms = queryLower.split(/\s+/).filter(t => t.length > 1);
  let totalScore = 0;

  for (const { text, weight } of fields) {
    if (!text) continue;
    const textLower = text.toLowerCase();

    // Exact phrase match
    if (textLower.includes(queryLower)) {
      totalScore += weight * 100;
    }

    // Individual term matches
    for (const term of terms) {
      if (textLower.includes(term)) {
        totalScore += weight * 40;
        if (textLower.startsWith(term)) totalScore += weight * 15;
      } else {
        // Fuzzy matching
        const fScore = fuzzyScore(term, text);
        if (fScore > 0) {
          totalScore += weight * 25 * fScore;
        }
      }
    }
  }

  // Semantic boost
  totalScore += getSemanticBoost(queryLower, fields.map(f => f.text).join(' '));

  return totalScore;
}

function getSemanticBoost(query: string, content: string): number {
  const contentLower = content.toLowerCase();
  let boost = 0;
  const associations: Record<string, string[]> = {
    'retirement': ['pension', 'savings', 'endowment', 'saver', 'wealth', 'future'],
    'protection': ['life', 'term', 'critical', 'cover', 'secure', 'shield'],
    'investment': ['wealth', 'growth', 'returns', 'portfolio', 'achiever', 'venture', 'ilp'],
    'health': ['medical', 'critical', 'healthcare', 'insurance', 'healthshield'],
    'insurance': ['protect', 'cover', 'policy', 'premium', 'benefit'],
    'savings': ['wealth', 'builder', 'saver', 'accumulation', 'growth'],
    'exam': ['cmfas', 'module', 'm9', 'hi', 'res5', 'certification', 'study'],
    'script': ['sales', 'pitch', 'objection', 'prospecting', 'closing'],
  };

  for (const [concept, related] of Object.entries(associations)) {
    if (query.includes(concept)) {
      for (const term of related) {
        if (contentLower.includes(term)) boost += 12;
      }
    }
  }
  return boost;
}

export function useUnifiedSearch() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<UnifiedSearchFilters>({});
  const { allProducts, loading: productsLoading } = useAllProducts();

  // Fetch scripts for search
  const { data: scripts } = useQuery({
    queryKey: ['search-scripts'],
    queryFn: async () => {
      const { data } = await supabase
        .from('scripts')
        .select('id, category, stage, tags, target_audience, versions')
        .limit(200);
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // CMFAS modules as static data
  const cmfasModules = useMemo(() => [
    { id: 'onboarding', title: 'CMFAS Onboarding', description: 'Getting started with CMFAS exams, account setup, and study strategies' },
    { id: 'm9', title: 'M9 - Life Insurance', description: 'Life insurance fundamentals, risk concepts, premium calculation, ILPs' },
    { id: 'm9a', title: 'M9A - Life Insurance (Comprehensive)', description: 'Comprehensive life insurance module with advanced topics' },
    { id: 'hi', title: 'HI - Health Insurance', description: 'Health insurance products, MediShield Life, Integrated Shield Plans' },
    { id: 'res5', title: 'RES5 - Regulatory Framework', description: 'Financial advisory regulatory framework and compliance' },
  ], []);


  const performSearch = useCallback((searchQuery: string): UnifiedSearchResult[] => {
    if (!searchQuery.trim()) return [];
    const results: UnifiedSearchResult[] = [];
    const allowedTypes = filters.types;

    // 1. Products
    if (!allowedTypes || allowedTypes.includes('product')) {
      for (const product of allProducts) {
        const score = scoreItem(searchQuery, [
          { text: product.title, weight: 3 },
          { text: product.description || '', weight: 1.5 },
          { text: (product as any).categories?.name || '', weight: 2 },
          { text: (product.tags || []).join(' '), weight: 2 },
          { text: (product.highlights || []).join(' '), weight: 1 },
        ]);
        if (score > 0) {
          results.push({
            id: product.id,
            title: product.title,
            description: product.description,
            type: 'product',
            categoryName: (product as any).categories?.name || '',
            categoryId: product.category_id,
            tags: product.tags,
            highlights: product.highlights,
            relevanceScore: score,
            route: `/product/${product.id}`,
            typeLabel: 'Product',
            icon: 'Package',
          });
        }
      }
    }

    // 2. CMFAS Modules
    if (!allowedTypes || allowedTypes.includes('cmfas')) {
      for (const mod of cmfasModules) {
        const score = scoreItem(searchQuery, [
          { text: mod.title, weight: 3 },
          { text: mod.description, weight: 2 },
          { text: 'cmfas exam certification study', weight: 1 },
        ]);
        if (score > 0) {
          results.push({
            id: mod.id,
            title: mod.title,
            description: mod.description,
            type: 'cmfas',
            categoryName: 'CMFAS Exams',
            relevanceScore: score,
            route: `/cmfas/module/${mod.id}`,
            typeLabel: 'CMFAS Module',
            icon: 'GraduationCap',
          });
        }
      }
    }

    // 3. Scripts
    if (!allowedTypes || allowedTypes.includes('script')) {
      for (const script of (scripts || [])) {
        const versions = script.versions as any[];
        const firstVersion = versions?.[0];
        const title = firstVersion?.title || firstVersion?.label || `${script.category} - ${script.stage}`;
        const content = firstVersion?.content || '';
        
        const score = scoreItem(searchQuery, [
          { text: title, weight: 3 },
          { text: content.slice(0, 500), weight: 1 },
          { text: script.category, weight: 2 },
          { text: script.stage, weight: 1.5 },
          { text: (script.tags || []).join(' '), weight: 2 },
        ]);
        if (score > 0) {
          results.push({
            id: script.id,
            title,
            description: `${script.category} • ${script.stage}`,
            type: 'script',
            categoryName: script.category,
            tags: script.tags,
            relevanceScore: score,
            route: `/scripts`,
            typeLabel: 'Sales Script',
            icon: 'FileText',
          });
        }
      }
    }


    // Apply additional filters
    let filtered = results;
    if (filters.category) {
      filtered = filtered.filter(r => r.categoryId === filters.category);
    }
    if (filters.tags?.length) {
      filtered = filtered.filter(r => r.tags?.some(t => filters.tags!.includes(t)));
    }

    // Sort by relevance
    filtered.sort((a, b) => b.relevanceScore - a.relevanceScore);
    return filtered.slice(0, 30);
  }, [allProducts, scripts, cmfasModules, filters]);

  const [results, setResults] = useState<UnifiedSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    // Debounce for live suggestions
    const timer = setTimeout(() => {
      setResults(performSearch(query));
      setIsSearching(false);
    }, 150);
    return () => clearTimeout(timer);
  }, [query, performSearch]);

  // Suggestions: quick results for dropdown
  const getSuggestions = useCallback((q: string): UnifiedSearchResult[] => {
    if (!q.trim() || q.length < 2) return [];
    return performSearch(q).slice(0, 8);
  }, [performSearch]);

  // Get unique categories from products
  const getAvailableCategories = useCallback(() => {
    const map = new Map<string, { id: string; name: string }>();
    allProducts.forEach(p => {
      if (p.category_id && !map.has(p.category_id)) {
        map.set(p.category_id, { id: p.category_id, name: (p as any).categories?.name || '' });
      }
    });
    return Array.from(map.values());
  }, [allProducts]);

  const getAvailableTags = useCallback(() => {
    const tags = new Set(allProducts.flatMap(p => p.tags || []));
    return Array.from(tags);
  }, [allProducts]);

  // Group results by type
  const groupedResults = useMemo(() => {
    const groups: Record<SearchResultType, UnifiedSearchResult[]> = {
      product: [],
      cmfas: [],
      script: [],
      kb: [],
    };
    for (const r of results) {
      groups[r.type].push(r);
    }
    return groups;
  }, [results]);

  const resultCounts = useMemo(() => ({
    total: results.length,
    product: groupedResults.product.length,
    cmfas: groupedResults.cmfas.length,
    script: groupedResults.script.length,
    kb: groupedResults.kb.length,
  }), [results, groupedResults]);

  return {
    query,
    setQuery,
    filters,
    setFilters,
    results,
    groupedResults,
    resultCounts,
    isSearching,
    hasQuery: query.trim().length > 0,
    hasActiveFilters: Boolean(filters.category || filters.tags?.length || filters.types?.length),
    getSuggestions,
    getAvailableCategories,
    getAvailableTags,
  };
}
