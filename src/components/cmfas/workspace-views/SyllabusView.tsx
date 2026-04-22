import { BookOpen, ChevronDown, Clock, FileText, Target, UsersRound } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { cmfasRoom } from '../cmfasTheme';

interface PaperSyllabus {
  code: 'M9' | 'M9A' | 'HI' | 'RES5';
  name: string;
  forWhom: string;
  objective: string;
  chapters: string[];
  questionCount: number;
  durationMinutes: number;
  passingGrade: string;
  notes?: string;
}

const PAPERS: PaperSyllabus[] = [
  {
    code: 'M9',
    name: 'Life Insurance and Investment-Linked Policies',
    forWhom:
      'Those looking to provide advice on and/or arrange life insurance policies (whether or not including investment-linked policies).',
    objective:
      'Tests knowledge of life insurance concepts (premium-setting, product classification), traditional and investment-linked products, riders, annuities, underwriting and claims practice, and contractual provisions (agency law, tax, nomination, wills, trusts).',
    chapters: [
      'Risk And Life Insurance',
      'Setting Life Insurance Premium',
      'Classification Of Life Insurance Products',
      'Traditional Life Insurance Products',
      'Riders (Or Supplementary Benefits)',
      'Participating Life Insurance Policies',
      'Investment-linked Life Insurance Policies (ILPs): Types, Features, Benefits, And Risks',
      'Investment-linked Sub-Funds',
      'Investment-linked Life Insurance Products: Computational Aspects',
      'Annuities',
      'Application And Underwriting',
      'Policy Services',
      'Life Insurance Claims',
      'The Insurance Contract',
      'Law Of Agency',
      'Income Tax And Life Insurance',
      'Insurance Nomination, Wills And Trusts',
    ],
    questionCount: 100,
    durationMinutes: 120,
    passingGrade: '70%',
  },
  {
    code: 'M9A',
    name: 'Life Insurance and Investment-Linked Policies II',
    forWhom:
      'Representatives who need to advise on or arrange Investment-linked Life Insurance Policies (ILPs), per MAS requirements.',
    objective:
      'Covers structured products and derivatives, governance of Structured ILPs, inherent risks, market-condition performance, and case-based product suitability.',
    chapters: [
      'Introduction To Structured Products',
      'Risk Considerations Of Structured Products',
      'Understanding Derivatives',
      'Introduction To Structured ILPs',
      'Portfolio Of Investments With An Insurance',
      'Case Studies',
    ],
    questionCount: 50,
    durationMinutes: 60,
    passingGrade: '70%',
  },
  {
    code: 'HI',
    name: 'Health Insurance',
    forWhom:
      'All life and general insurance intermediaries and staff involved in advising on or selling Health Insurance products — Medical Expense, Disability Income, Long-Term Care, Critical Illness, and Managed Healthcare.',
    objective:
      'Ensures requisite knowledge of Singapore healthcare, the range of Health Insurance products, pricing, underwriting, MAS Notice 120 disclosure, and needs analysis.',
    chapters: [
      'Overview Of Healthcare Environment In Singapore',
      'Medical Expense Insurance',
      'Group Medical Expense Insurance',
      'Disability Income Insurance',
      'Long-Term Care Insurance',
      'Critical Illness Insurance',
      'Other Types of Health Insurance',
      'Managed Healthcare',
      'Healthcare Financing',
      'Common Policy Provisions',
      'Health Insurance Pricing',
      'Health Insurance Underwriting',
      'Notice No: MAS 120 – Disclosure And Advisory Process Requirements',
      'Financial Needs Analysis',
      'Case Studies',
    ],
    questionCount: 50,
    durationMinutes: 75,
    passingGrade: '70%',
  },
  {
    code: 'RES5',
    name: 'Rules, Ethics and Skills for Financial Advisory Services',
    forWhom:
      'Those advising on securities, collective investment schemes, exchange-traded or OTC derivatives, leveraged FX, or life insurance policies. Required per MAS Notice FAA-N26.',
    objective:
      'Part I: Financial Advisers Act, MAS Notices and Guidelines, AML/CFT, CPF, Code on CIS, market conduct. Part II: professional ethics, client relationships, fact-finding, analysis, strategy, review.',
    chapters: [
      'Part I — Financial Advisers Act & Regulations: Advisers and Representatives',
      'Part I — FAA & Regulations: Conduct, Authority, Offences',
      'Part I — MAS Notices (FAA-N16, FAA-N03, FAA-N11)',
      'Part I — MAS Notices (FAA-N02, N10, N12, N14, N20, N26)',
      'Part I — FAA-N06: AML/CFT for Financial Advisers',
      'Part I — MAS Notices (FAA-N17, N18, N19, N21)',
      'Part I — Notice MAS 307: Investment-linked Policies',
      'Part I — Guidelines Part I (FAA-G01, FSG-G01, FAA-G04, G05) + CMI 01/2011',
      'Part I — Guidelines Part II (FAA-G09, G10, G11, G14)',
      'Part I — Guidelines Part III (FAA-G13, G15, G16, CMG-G02, FSG-G02)',
      'Part I — Revised Code On Collective Investment Schemes',
      'Part I — Securities Dealing: Market Conduct',
      'Part I — Central Provident Fund',
      'Part II — Why Professional Ethics Matter',
      'Part II — Professionalism · Ethical Behaviour · Unethical Behaviour',
      'Part II — Conflict Of Interest · Fair Dealing',
      'Part II — Ethical Marketing & Sale Of Financial Products',
      'Part II — Developing Client–Representative Relationships',
      'Part II — Fact Finding, Needs Analysis, Analysing Client Status',
      'Part II — Developing Strategies, Presenting Solutions, Reviewing Portfolios',
      'Part II — Basic Financial Planning Guide',
    ],
    questionCount: 150,
    durationMinutes: 180,
    passingGrade: 'Part I ≥ 75% AND Part II ≥ 80%',
    notes: '110 Questions for Part I, 40 Questions for Part II.',
  },
];

export function SyllabusView() {
  return (
    <div className="space-y-6">
      <header>
        <p className={cn('text-[11px] font-semibold uppercase tracking-[0.2em]', cmfasRoom.brassText)}>
          Syllabus
        </p>
        <h1 className={cn('mt-2 font-serif text-3xl font-bold sm:text-4xl', cmfasRoom.text)}>
          Know what you're being tested on.
        </h1>
        <p className={cn('mt-2 max-w-xl text-sm', cmfasRoom.textMuted)}>
          Four CMFAS papers administered by Singapore College of Insurance under MAS oversight.
          Closed-book, computer-screen examination. 70% pass (80% for RES5 Part II).
        </p>
      </header>

      {/* CMFAS framing */}
      <section className={cn('rounded-2xl border p-5 sm:p-6', cmfasRoom.surface)}>
        <div className="flex items-start gap-4">
          <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2', cmfasRoom.brassBorder)}>
            <FileText className={cn('h-5 w-5', cmfasRoom.brassText)} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className={cn('text-lg font-bold', cmfasRoom.text)}>What CMFAS is</h2>
            <p className={cn('mt-2 text-sm leading-relaxed', cmfasRoom.textMuted)}>
              To become a certified financial advisor in Singapore you must clear four CMFAS papers
              conducted by the Singapore College of Insurance (SCI). The exams are administered under
              MAS — the Monetary Authority of Singapore — which regulates and licenses every financial
              advisor in the country. Without these certifications you aren't eligible to sell or
              advise on financial products.
            </p>
            <p className={cn('mt-3 text-sm leading-relaxed', cmfasRoom.textMuted)}>
              Expect regulatory + industry standards (RES5), life insurance and ILPs (M9, M9A), and
              health insurance (HI). Stressful yes, but it's one step — and we provide the coaching,
              question bank, AI tutor and flashcards so you pass on the first try.
            </p>
          </div>
        </div>
      </section>

      {/* Per-paper cards */}
      <div className="space-y-3">
        {PAPERS.map((paper) => (
          <Collapsible key={paper.code}>
            <div className={cn('overflow-hidden rounded-2xl border', cmfasRoom.surface)}>
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    'group flex w-full items-center gap-4 px-5 py-4 text-left transition-colors',
                    cmfasRoom.surfaceHover,
                  )}
                >
                  <div
                    className={cn(
                      'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2',
                      cmfasRoom.brassBorder,
                    )}
                  >
                    <span className={cn('font-serif text-lg font-bold', cmfasRoom.brassText)}>
                      {paper.code}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className={cn('truncate text-base font-semibold', cmfasRoom.text)}>{paper.name}</h3>
                    <div className={cn('mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]', cmfasRoom.textFaint)}>
                      <span className="inline-flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {paper.questionCount} MCQ
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {paper.durationMinutes} min
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {paper.passingGrade}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className={cn('h-4 w-4 shrink-0 transition-transform group-data-[state=open]:rotate-180', cmfasRoom.textFaint)} />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className={cn('border-t px-5 py-5', cmfasRoom.brassBorderSoft)}>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-[auto_1fr] md:gap-6">
                    <div className="space-y-4 md:max-w-xs">
                      <div>
                        <p className={cn('flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider', cmfasRoom.brassText)}>
                          <UsersRound className="h-3 w-3" />
                          For whom
                        </p>
                        <p className={cn('mt-1 text-sm leading-relaxed', cmfasRoom.text)}>
                          {paper.forWhom}
                        </p>
                      </div>
                      <div>
                        <p className={cn('text-[10px] font-semibold uppercase tracking-wider', cmfasRoom.brassText)}>
                          Objective
                        </p>
                        <p className={cn('mt-1 text-sm leading-relaxed', cmfasRoom.textMuted)}>
                          {paper.objective}
                        </p>
                      </div>
                      {paper.notes && (
                        <p className={cn('text-[11px] italic', cmfasRoom.textFaint)}>{paper.notes}</p>
                      )}
                    </div>
                    <div>
                      <p className={cn('text-[10px] font-semibold uppercase tracking-wider', cmfasRoom.brassText)}>
                        Chapters
                      </p>
                      <ol className="mt-2 space-y-1.5">
                        {paper.chapters.map((chapter, idx) => (
                          <li
                            key={idx}
                            className={cn('flex items-start gap-2 text-sm', cmfasRoom.text)}
                          >
                            <span className={cn('shrink-0 tabular-nums', cmfasRoom.textFaint)}>
                              {String(idx + 1).padStart(2, '0')}
                            </span>
                            <span className="min-w-0 flex-1">{chapter}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        ))}
      </div>
    </div>
  );
}
