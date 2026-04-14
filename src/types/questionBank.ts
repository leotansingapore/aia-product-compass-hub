export type QuestionCategory = 'product-facts' | 'sales-angles' | 'objection-handling' | 'roleplay';
export type BankType = 'study' | 'exam';

export interface QuestionBankQuestion {
  id: string;
  product_slug: string;
  bank_type: BankType;
  category: QuestionCategory;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// Shape used by existing quiz/study components
export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  category: QuestionCategory;
}

export const PRODUCT_SLUGS = [
  'pro-achiever',
  'platinum-wealth-venture',
  'healthshield-gold-max',
  'pro-lifetime-protector',
  'solitaire-pa',
  'ultimate-critical-cover',
] as const;

export const PRODUCT_LABELS: Record<string, string> = {
  'pro-achiever': 'Pro Achiever',
  'platinum-wealth-venture': 'Platinum Wealth Venture',
  'healthshield-gold-max': 'HealthShield Gold Max',
  'pro-lifetime-protector': 'Pro Lifetime Protector',
  'solitaire-pa': 'Solitaire PA',
  'ultimate-critical-cover': 'Ultimate Critical Cover',
};

export const CATEGORY_LABELS: Record<QuestionCategory, string> = {
  'product-facts': 'Product Facts',
  'sales-angles': 'Sales Angles',
  'objection-handling': 'Objection Handling',
  roleplay: 'Roleplay',
};

export function dbRowToQuizQuestion(row: QuestionBankQuestion): QuizQuestion {
  return {
    question: row.question,
    options: row.options,
    correct: row.correct_answer,
    explanation: row.explanation,
    category: row.category,
  };
}
