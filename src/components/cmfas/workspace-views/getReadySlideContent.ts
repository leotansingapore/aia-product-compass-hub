import type { ReadyStepId } from './getReadyData';

/** Optional links in the study-desk aside (internal routes or `https://` URLs). Omitted or empty = hide the block. */
export type GetReadyLinkResource = { label: string; href: string };

/** Optional “path” tiers on a slide (e.g. Finternship™ stages) with clear titles and bullets. */
export type GetReadyPathStage = {
  title: string;
  tagline: string;
  bullets: readonly string[];
};

/**
 * Richer content block for slides that need real heading/body hierarchy
 * (steps, tables, bullet lists). Slides that don't need structure keep using
 * the `paragraphs` array for back-compat.
 */
export type SlideContentBlock =
  | { kind: 'intro'; text: string }
  | { kind: 'heading'; text: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'list'; items: readonly string[] }
  | { kind: 'table'; headers: readonly string[]; rows: readonly (readonly string[])[] };

type ReadySlide = {
  section: string;
  slideHeading: string;
  paragraphs: readonly string[];
  /** If present, renders instead of `paragraphs`. Use for slides with step/list/table hierarchy. */
  blocks?: readonly SlideContentBlock[];
  linkResources?: readonly GetReadyLinkResource[];
  pathStages?: readonly GetReadyPathStage[];
  /** Shown after `pathStages` when present (e.g. “Next steps”). */
  closingParagraphs?: readonly string[];
};

/**
 * In-slide reading copy for each Get Ready step (same order as the onboarding checklist).
 * Titles align with the curriculum outline: Rules of the Game, Register, Resources, etc.
 */
export const GET_READY_SLIDE: Record<ReadyStepId, ReadySlide> = {
  welcome: {
    section: 'Section 1',
    slideHeading: 'Rules of the Game',
    paragraphs: [
      "It is puzzling to me how people spend years on a degree just to earn $3-4k/mth but don't have the patience to spend a few months clearing some certifications to have the chance to earn a 5 figure income within a few months.",
      'In the next few months, you will be spending the majority of the time studying financial certifications, called the CMFAS exams.',
      'I would suggest that you spend at least 1 hour a day studying for the exams.',
      'There are 4 exams, and it should take at most 1 month to study for each exam.',
      'Treat these as "obstacles" or "tests" of your conviction and commitment.',
      'The more you pass these exams, the more content I will "unlock" for you.',
      'Just as how anyone and everyone can enter into BMT, not everyone can go into OCS, or make it to becoming a commando.',
      'So treat this as a two way test. For yourself, to learn more about the business before placing your bets, and for myself, to check for your convictions and commitment to us.',
      'The more you study and pass the exams, the more courses you will unlock, and you will progress to the next level. Think of it this way: Anyone can join BMT, but not everyone will enter OCS Foundation Term and OCS Pro Term, and eventually commission as an Officer.',
    ],
    pathStages: [
      {
        title: 'Finternship™ Bootcamp',
        tagline: 'Everyone starts here.',
        bullets: [
          'Focus on the exams: plan for about two hours of study per day.',
          'Unlock basic financial planning modules.',
        ],
      },
      {
        title: 'Finternship™ Fastrack',
        tagline: 'Progress here after you pass 1 exam.',
        bullets: [
          'Unlock more financial planning modules.',
          'Start shadowing me on appointments to learn on the job.',
        ],
      },
      {
        title: 'Finternship™ Accelerator',
        tagline: 'Progress here after you pass 4 exams.',
        bullets: [
          'Start learning how to do cold prospecting.',
          'Unlock my scripts and presentation templates.',
        ],
      },
    ],
    closingParagraphs: [
      'NEXT STEPS:',
      'To go to the next step, just click Mark as done — next slide in the right column.',
    ],
  },
  'create-student-account': {
    section: 'Section 2',
    slideHeading: 'How to Register & Book the Exams — Student account',
    paragraphs: [],
    blocks: [
      {
        kind: 'intro',
        text: 'You need an SCI College student account before you can book any CMFAS paper. This takes about 5 minutes.',
      },
      { kind: 'heading', text: 'Step 1 · Register at SCI College' },
      {
        kind: 'paragraph',
        text: 'Go to scicollege.org.sg/Account/Register (link in the right column). When the form asks, fill in:',
      },
      {
        kind: 'list',
        items: [
          'Training Co-ordinator: NA',
          'Email: NA',
          'Agency: NA',
          'Company: AIA Financial Advisers Pte Ltd',
        ],
      },
      { kind: 'heading', text: 'Step 2 · Send the confirmation screenshot' },
      {
        kind: 'paragraph',
        text: 'Once SCI emails you the account-creation confirmation, send a screenshot to your FINternship support chat so we can verify it.',
      },
      { kind: 'heading', text: 'Step 3 · Unlock the exam resources' },
      {
        kind: 'paragraph',
        text: 'After your account is active, open the Skool exam-resources classroom (link on the right) to get into the question bank and study materials.',
      },
      { kind: 'heading', text: "Step 4 · Book when you're semi-confident" },
      {
        kind: 'paragraph',
        text: "You don't need to book an exam yet — but once you feel roughly ready, register at the CMFAS exam registration link (also on the right). A real exam date is the best study motivator.",
      },
    ],
    closingParagraphs: [
      'NEXT STEPS:',
      'When you are done, hit Mark as done — next slide on the right to move on.',
    ],
    linkResources: [
      { label: 'Create student account (SCI College)', href: 'https://www.scicollege.org.sg/Account/Register' },
      { label: 'Open exam resources (Skool classroom)', href: 'https://www.skool.com/finternship/classroom/e49e2efc?md=d36f1dca8ade4d22aef3f433b7caf7e4' },
      { label: 'Register for CMFAS exams', href: 'https://tinyurl.com/CMFASregistration2025' },
    ],
  },
  'access-question-bank': {
    section: 'Section 2 · Resources',
    slideHeading: 'Unlock the question bank (iRecruit / SCI)',
    paragraphs: [
      "The question bank is where you practise real multiple-choice under time pressure. Access is not automatic — the hub expects you to complete the host’s access flow (often via iRecruit or the college portal) so that your login can reach the right bank.",
      'Work through the provider’s steps until you can open a practice session for at least one paper. If access fails, you should still not advance this checklist until the issue is fixed or you have a written way forward from support.',
      'When you can genuinely launch practice questions, mark this step as done. The slide path is about proof of access, not “I’ll do it later.”',
    ],
  },
  'understand-costs-timeline': {
    section: 'Section 2 · Resources',
    slideHeading: 'Know the costs & timeline',
    paragraphs: [
      'Each paper has a fee, and exam windows and booking deadlines are fixed. You need a rough budget (for all relevant papers) and a realistic month-by-month plan: when you will sit, when you will study, and when fees are due.',
      'List the key dates that matter for your situation: first registration, exam month, and any retake you allow for. A simple table is enough — the point is that you are not surprised later on.',
      "Once you have written down your costs and your calendar assumptions, you can mark this step. You will refine the details as you go, but you should not skip the thinking.",
    ],
  },
  'register-m9-exam': {
    section: 'Section 2',
    slideHeading: 'Register & book the M9 exam',
    paragraphs: [],
    blocks: [
      {
        kind: 'intro',
        text: 'Book your first paper. A real exam date is the single biggest thing that pulls you through 20-30 hours of study.',
      },
      { kind: 'heading', text: 'How to register' },
      {
        kind: 'paragraph',
        text: 'Use the CMFAS registration link on the right, or message @cmfas_bot on Telegram. Either path works — pick one and do it.',
      },
      { kind: 'heading', text: 'When to book' },
      {
        kind: 'list',
        items: [
          'Each paper is about 20-30 hours of study.',
          'Aim for 1-2 papers per month, starting with M9.',
          "Book before you start studying so you have a real deadline, or — if you'd rather warm up first — book once you've done 500 questions on iRecruit. Either way, lock in a date.",
        ],
      },
      { kind: 'heading', text: 'Exam costs (first attempt — we cover it)' },
      {
        kind: 'table',
        headers: ['Paper', 'Cost'],
        rows: [
          ['M9', 'S$109.00'],
          ['M9A', 'S$109.00'],
          ['HI', 'S$76.30'],
          ['RES5', 'S$185.30'],
        ],
      },
      {
        kind: 'paragraph',
        text: 'Retakes are on you. That is the whole reason we push you to pass on the first attempt.',
      },
      { kind: 'heading', text: 'Our support' },
      {
        kind: 'paragraph',
        text: 'With everything we give you — Flashcards, Personal Tutoring, Question Bank, Chatbot, Key Concepts, Study Tips — passing first time is very doable.',
      },
    ],
    closingParagraphs: [
      'NEXT STEPS:',
      'Once you have booked your M9 exam, hit Mark as done — next slide on the right to move on.',
    ],
    linkResources: [
      { label: 'Register for CMFAS exams', href: 'https://tinyurl.com/CMFASregistration2025' },
      { label: 'Ask @cmfas_bot on Telegram', href: 'https://t.me/cmfas_bot' },
    ],
  },
  'first-practice': {
    section: 'Section 2 · Resources',
    slideHeading: 'First practice set',
    paragraphs: [
      "Do a short block of real practice questions in the bank — for example, ten items — in one sitting. The goal is to break the ice: timer on, work like it's exam day, then review what you got wrong and why.",
      'This is the transition from “I’ve set everything up” to “I’m actually learning the exam style.” You do not need a perfect score; you need evidence you started.',
      "When you have completed a first practice set and you have reviewed the answers, mark this step. After this, the hub unlocks the next phase of your exam prep (tutorials, papers, and practice) as configured for your path.",
    ],
    linkResources: [
      { label: 'Open Practice in this hub', href: '/cmfas-exams?mode=practice' },
    ],
  },
};

export function getReadySlideContent(id: ReadyStepId) {
  return GET_READY_SLIDE[id];
}
