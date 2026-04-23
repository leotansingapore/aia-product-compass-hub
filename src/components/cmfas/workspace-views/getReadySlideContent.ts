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
  | { kind: 'table'; headers: readonly string[]; rows: readonly (readonly string[])[] }
  /** Strong visual break between sub-parts of a slide. Used as the Continue-button scroll anchor. */
  | { kind: 'partDivider'; partIndex: number; partTotal: number; title: string; eyebrow?: string }
  /** Inline screenshot / illustration. Renders as a responsive `<img>` inside a `<figure>`. */
  | { kind: 'image'; src: string; alt: string; caption?: string }
  /** Inline Loom video embed. `videoId` is the bit after `loom.com/share/` or `loom.com/embed/`. */
  | { kind: 'loom'; videoId: string; title?: string }
  /** Illustrated "prize" card used on the Rewards slide. Renders a big icon + headline amount + conditions + notes. */
  | {
      kind: 'rewardCard';
      icon: 'zap' | 'trophy' | 'users' | 'target' | 'award';
      eyebrow?: string;
      title: string;
      /** Big brass-coloured amount (e.g. "S$100", "Up to S$300"). */
      headlineAmount?: string;
      /** One-liner sitting under the amount. */
      tagline?: string;
      /** Bulleted conditions — rendered in the card body. */
      conditions?: readonly string[];
      /** Small grey caveats — rendered below conditions. */
      notes?: readonly string[];
    };

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
    section: 'Section 2 · Student account',
    slideHeading: 'Create your SCI College student account',
    paragraphs: [],
    blocks: [
      {
        kind: 'intro',
        text: 'You need an SCI College student account before you can book any CMFAS paper. This takes about 5 minutes.',
      },
      { kind: 'heading', text: 'Step 1 · Register at SCI College' },
      {
        kind: 'paragraph',
        text: 'Go to [scicollege.org.sg/Account/Register](https://www.scicollege.org.sg/Account/Register). When the form asks, fill in:',
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
        text: 'After your account is active, open the [Skool exam-resources classroom](https://www.skool.com/finternship/classroom/e49e2efc?md=d36f1dca8ade4d22aef3f433b7caf7e4) to get into the question bank and study materials.',
      },
    ],
    linkResources: [
      { label: 'Create student account (SCI College)', href: 'https://www.scicollege.org.sg/Account/Register' },
      { label: 'Open exam resources (Skool classroom)', href: 'https://www.skool.com/finternship/classroom/e49e2efc?md=d36f1dca8ade4d22aef3f433b7caf7e4' },
    ],
  },
  'access-question-bank': {
    section: 'Section 3 · Exam Resources',
    slideHeading: 'Exam resources — everything you need to study',
    paragraphs: [],
    blocks: [
      // ───── Part 1 / 4 — Get access to the exam question bank ─────
      {
        kind: 'partDivider',
        partIndex: 1,
        partTotal: 4,
        title: 'Get access to the exam question bank',
        eyebrow: 'Part 1 of 4',
      },
      {
        kind: 'intro',
        text: 'You need this to start studying and to eventually book the exams. It is a 5-minute task.',
      },
      { kind: 'heading', text: 'Step 1 · Ask Leo to create your account' },
      {
        kind: 'paragraph',
        text: 'On your FINternship support chat, send Leo your **name, email, and mobile number** so he can create your personal account. While you wait, start Step 2.',
      },
      { kind: 'heading', text: 'Step 2 · Log in to iRecruit' },
      {
        kind: 'paragraph',
        text: 'Log in to [iRecruit](https://joinus.aia.com.sg/app/login) using the shared credentials below. You need to log in to Google first so the iRecruit OTP can reach you.',
      },
      {
        kind: 'list',
        items: [
          'Google — email: `cmfasexamssg@gmail.com`, password: `cmfasexamssg!123`. Please [call Leo at 91395749](tel:+6591395749) for the OTP access.',
          'iRecruit — email: `cmfasexamssg@gmail.com`, password: `AIAirecruit!123`. The OTP will land in the Google inbox you just signed into.',
        ],
      },
      { kind: 'heading', text: 'Step 3 · Open the exam bank' },
      {
        kind: 'paragraph',
        text: 'Inside iRecruit, go to **iLearn → Pre-Contract → Pre-Contract (Online) → CMFAS M9 → Practice Questions (Chapter Revision and Premium Papers) → Launch**.',
      },
      {
        kind: 'image',
        src: 'https://assets.skool.com/f/8fc2f6045ea549398401f3cdbcc90878/7a51b6c60d594d16a68b94dbc88510c51aff1bcf47124f6eb7665a0947be0864',
        alt: 'iLearn navigation path to CMFAS M9 Practice Questions',
      },
      { kind: 'heading', text: 'Step 4 · Start a practice session' },
      {
        kind: 'paragraph',
        text: 'Use these settings: **Launch → Restart → OK → Select Module 9 → All Questions → 50 Questions → Redo Cleared Questions → Learning Mode → Start Session**.',
      },
      {
        kind: 'image',
        src: 'https://assets.skool.com/f/8fc2f6045ea549398401f3cdbcc90878/67573e3a83704af4bc7347053267f43bb88a20b2576d4a12b787727f1989ffa2',
        alt: 'Practice-session setup screen with the recommended settings',
      },
      { kind: 'heading', text: 'Step 5 · Learn by doing' },
      {
        kind: 'paragraph',
        text: 'Use the speed reference to answer questions as you go — learn by doing rather than reading the textbook cover to cover. Attempt a question, then flip to the matching textbook section to understand why.',
      },
      {
        kind: 'image',
        src: 'https://assets.skool.com/f/8fc2f6045ea549398401f3cdbcc90878/72f9183cb0fc4393ba053d915db4199ac8efcd10ab6c430699d7098a19800f28',
        alt: 'Speed-reference panel inside a practice session',
      },
      { kind: 'heading', text: 'Also: log in to iLearn on mobile' },
      {
        kind: 'paragraph',
        text: 'Strongly recommended. Follow the steps above on your phone and iLearn will prompt you to install its mobile app.',
      },
      {
        kind: 'image',
        src: 'https://assets.skool.com/f/8fc2f6045ea549398401f3cdbcc90878/bbd7b6da8be04f3d8c9be169b6d21595d789075e502b44df8916c8b029adf1a3-md.png',
        alt: 'iLearn mobile-app download prompt',
      },

      // ───── Part 2 / 4 — Exam study tips & resources ────────────────
      {
        kind: 'partDivider',
        partIndex: 2,
        partTotal: 4,
        title: 'Exam study tips & resources to save you time',
        eyebrow: 'Part 2 of 4',
      },
      {
        kind: 'intro',
        text: 'Short walkthrough, then the two resource hubs we have curated for you.',
      },
      { kind: 'loom', videoId: '98d2a1ad005149bebdf1beeb5f11b94b', title: 'Exam study tips walkthrough' },
      {
        kind: 'list',
        items: [
          '[Exam resources · Google Drive](https://drive.google.com/drive/folders/1zPgxvcCkB7WKaIhDYPi1PYKLamUca2CQ?usp=sharing)',
          '[Exam resources · Larksuite wiki](https://xsgmrpwnwfee.sg.larksuite.com/wiki/HXsywc2UFijeSaktJ8dlbIKNgXf)',
        ],
      },

      // ───── Part 3 / 4 — Chatbot access ─────────────────────────────
      {
        kind: 'partDivider',
        partIndex: 3,
        partTotal: 4,
        title: 'Chatbot access — your 24/7 CMFAS tutor',
        eyebrow: 'Part 3 of 4',
      },
      { kind: 'loom', videoId: '353d3c4931ad48669287fccdee69ab44', title: 'CMFAS chatbot walkthrough' },
      {
        kind: 'paragraph',
        text: 'Open [@cmfas_bot on Telegram](https://t.me/cmfas_bot) and start chatting. You can ask the bot literally anything about the CMFAS exams — it is your 24/7 personal tutor.',
      },

      // ───── Part 4 / 4 — Learn faster with flashcards ───────────────
      {
        kind: 'partDivider',
        partIndex: 4,
        partTotal: 4,
        title: 'Learn faster with flashcards',
        eyebrow: 'Part 4 of 4',
      },
      { kind: 'loom', videoId: '737f7da7b8204d928e4373bae84f4a61', title: 'Flashcards walkthrough' },
      { kind: 'heading', text: 'Decks' },
      {
        kind: 'list',
        items: [
          '[M9 flashcards](https://revisely.com/flashcards/decks/R9ikkh)',
          '[M9A flashcards](https://revisely.com/flashcards/decks/CVxXJ7)',
          '[HI flashcards](https://revisely.com/flashcards/decks/4Bz9fm)',
          '[RES5 flashcards](https://revisely.com/flashcards/decks/1KxDpT)',
        ],
      },
    ],
    linkResources: [
      { label: 'Log in to iRecruit', href: 'https://joinus.aia.com.sg/app/login' },
      { label: 'Exam resources (Google Drive)', href: 'https://drive.google.com/drive/folders/1zPgxvcCkB7WKaIhDYPi1PYKLamUca2CQ?usp=sharing' },
      { label: 'Exam resources (Lark wiki)', href: 'https://xsgmrpwnwfee.sg.larksuite.com/wiki/HXsywc2UFijeSaktJ8dlbIKNgXf' },
      { label: 'Chat with @cmfas_bot on Telegram', href: 'https://t.me/cmfas_bot' },
      { label: 'M9 flashcards', href: 'https://revisely.com/flashcards/decks/R9ikkh' },
      { label: 'M9A flashcards', href: 'https://revisely.com/flashcards/decks/CVxXJ7' },
      { label: 'HI flashcards', href: 'https://revisely.com/flashcards/decks/4Bz9fm' },
      { label: 'RES5 flashcards', href: 'https://revisely.com/flashcards/decks/1KxDpT' },
    ],
  },
  'understand-costs-timeline': {
    section: 'Section 4 · Rewards',
    slideHeading: 'Challenges & rewards — cash for passing well',
    paragraphs: [],
    blocks: [
      {
        kind: 'intro',
        text: 'Three ways to earn cash on top of your base commissions. Stack them if you move fast and bring a friend.',
      },
      {
        kind: 'rewardCard',
        icon: 'zap',
        eyebrow: 'Challenge 1 of 3',
        title: 'Quick Pass Challenge',
        headlineAmount: 'Up to S$300',
        tagline: 'Pass every paper in one attempt — with 2-week turnarounds between them.',
        conditions: [
          'Pass M9 in one attempt within 2 weeks — S$50.',
          'Pass M9A within 2 weeks of your first M9 attempt — another S$50.',
          'Pass HI within 2 weeks of your first M9A attempt — another S$50.',
          'Pass RES5 within 2 weeks of your first HI attempt — another S$50.',
          'Pass all 4 within 2 months of joining FINternship — bonus S$100.',
        ],
        notes: [
          'Your FINternship start date is the creation date of your Skool portal account.',
          'Quick Pass incentives are paid out only after you contract as a financial advisor.',
        ],
      },
      {
        kind: 'rewardCard',
        icon: 'trophy',
        eyebrow: 'Challenge 2 of 3',
        title: 'Pass First Time Challenge',
        headlineAmount: 'S$100',
        tagline: 'Pass all 4 exams on your very first attempt.',
        conditions: [
          'No retakes, any paper. One shot each.',
          'Stackable with the Quick Pass Challenge above.',
        ],
      },
      {
        kind: 'rewardCard',
        icon: 'users',
        eyebrow: 'Challenge 3 of 3',
        title: 'Refer Your Friend Challenge',
        headlineAmount: 'S$100 × 2',
        tagline: 'You and the friend you bring in both get paid.',
        conditions: [
          'Your referred friend passes M9 — both of you get S$100 cash.',
          'Bonus: your friend passes all 4 exams — both of you earn another S$100.',
        ],
      },
      {
        kind: 'paragraph',
        text: 'These aren’t abstract incentives — we cut the cheques. Study hard, move fast, bring someone along.',
      },
    ],
  },
  'register-m9-exam': {
    section: 'Section 5 · Register',
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
        text: 'Use the [CMFAS registration link](https://tinyurl.com/CMFASregistration2025), or message [@cmfas_bot](https://t.me/cmfas_bot) on Telegram. Either path works — pick one and do it.',
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
    linkResources: [
      { label: 'Register for CMFAS exams', href: 'https://tinyurl.com/CMFASregistration2025' },
      { label: 'Ask @cmfas_bot on Telegram', href: 'https://t.me/cmfas_bot' },
    ],
  },
  'first-practice': {
    section: 'Section 6 · Practice',
    slideHeading: 'First practice set',
    paragraphs: [
      "Do a short block of real practice questions in the bank — for example, ten items — in one sitting. The goal is to break the ice: timer on, work like it's exam day, then review what you got wrong and why.",
      'This is the transition from “I’ve set everything up” to “I’m actually learning the exam style.” You do not need a perfect score; you need evidence you started.',
      "When you have completed a first practice set and you have reviewed the answers, mark this step. After this, the hub unlocks the next phase of your exam prep (tutorials, papers, and practice) as configured for your path.",
    ],
    linkResources: [
      { label: 'Open the in-app question bank', href: '/library?tab=banks' },
    ],
  },
};

export function getReadySlideContent(id: ReadyStepId) {
  return GET_READY_SLIDE[id];
}

// ────────────────────────────────────────────────────────────────────────────
//                   Atomic-slide model (Phase 1)
// ────────────────────────────────────────────────────────────────────────────
// Sections 2 (Student account), 3 (Exam Resources), 5 (Register M9) are broken
// into one-instruction-per-slide entries so learners can't bulk-tick without
// engaging. Each slide has its own `verification` payload that the aside
// renders above Mark-as-done. A section row in `user_checklist_progress` flips
// to complete only after every sub-slide of that section has a submission.
//
// Sections 1, 4, 6 stay single-slide but still require one verification tick
// so nothing escapes the audit trail.
// ────────────────────────────────────────────────────────────────────────────

/** A single input the learner must submit on a slide before Mark-as-done unlocks. */
export type VerificationField =
  | {
      id: string;
      kind: 'checkbox';
      label: string;
      optional?: boolean;
    }
  | {
      id: string;
      kind: 'text';
      label: string;
      placeholder?: string;
      maxLength?: number;
      optional?: boolean;
    }
  | {
      id: string;
      kind: 'screenshot';
      label: string;
      hint?: string;
      optional?: boolean;
    };

export interface SlideEntry {
  /** Globally unique slug, used as the row key in `user_slide_submissions`. */
  slideId: string;
  /** Section this slide rolls up into for the section-level tick + nav tabs. */
  sectionId: ReadyStepId;
  /** 1-based position within the section; powers "Step X of Y" labels + nav dots. */
  indexWithinSection: number;
  totalInSection: number;
  section: string;
  slideHeading: string;
  eyebrow?: string;
  blocks?: readonly SlideContentBlock[];
  paragraphs?: readonly string[];
  linkResources?: readonly GetReadyLinkResource[];
  pathStages?: readonly GetReadyPathStage[];
  closingParagraphs?: readonly string[];
  /** Required fields for the aside verification form. Must have ≥ 1 entry. */
  verification: readonly VerificationField[];
}

/**
 * Flat list of 18 atomic slides. Keep in section order so array index doubles
 * as the linear-nav position. Authored once, read everywhere.
 */
export const GET_READY_SLIDES: readonly SlideEntry[] = [
  // ── Section 1 · Rules of the Game ────────────────────────────────────────
  {
    slideId: 'section-1.rules-of-the-game',
    sectionId: 'welcome',
    indexWithinSection: 1,
    totalInSection: 1,
    section: 'Section 1',
    slideHeading: 'Rules of the Game',
    paragraphs: GET_READY_SLIDE.welcome.paragraphs,
    pathStages: GET_READY_SLIDE.welcome.pathStages,
    closingParagraphs: GET_READY_SLIDE.welcome.closingParagraphs,
    verification: [],
  },

  // ── Section 2 · Student account ──────────────────────────────────────────
  {
    slideId: 'section-2.step-1-register-sci',
    sectionId: 'create-student-account',
    indexWithinSection: 1,
    totalInSection: 3,
    section: 'Section 2 · Student account',
    slideHeading: 'Register at SCI College',
    eyebrow: 'Step 1 of 3',
    blocks: [
      {
        kind: 'intro',
        text: 'You need an SCI College student account before you can book any CMFAS paper. This takes about 5 minutes.',
      },
      {
        kind: 'paragraph',
        text: 'Go to [scicollege.org.sg/Account/Register](https://www.scicollege.org.sg/Account/Register). When the form asks, fill in:',
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
    ],
    linkResources: [
      { label: 'Create student account (SCI College)', href: 'https://www.scicollege.org.sg/Account/Register' },
    ],
    verification: [],
  },
  {
    slideId: 'section-2.step-2-send-screenshot',
    sectionId: 'create-student-account',
    indexWithinSection: 2,
    totalInSection: 3,
    section: 'Section 2 · Student account',
    slideHeading: 'Send the confirmation screenshot',
    eyebrow: 'Step 2 of 3',
    blocks: [
      {
        kind: 'intro',
        text: 'Once SCI emails you the account-creation confirmation, screenshot it and send it on your FINternship support chat so we can verify it.',
      },
      {
        kind: 'paragraph',
        text: 'Upload the same screenshot below so it is attached to your study-desk record.',
      },
    ],
    verification: [
      {
        id: 'sci-confirmation',
        kind: 'screenshot',
        label: 'Upload the SCI confirmation email',
        hint: 'PNG, JPEG, or WebP · max 5 MB',
      },
    ],
  },
  {
    slideId: 'section-2.step-3-open-skool',
    sectionId: 'create-student-account',
    indexWithinSection: 3,
    totalInSection: 3,
    section: 'Section 2 · Student account',
    slideHeading: 'Open the Skool exam-resources classroom',
    eyebrow: 'Step 3 of 3',
    blocks: [
      {
        kind: 'paragraph',
        text: 'After your SCI account is active, open the [Skool exam-resources classroom](https://www.skool.com/finternship/classroom/e49e2efc?md=d36f1dca8ade4d22aef3f433b7caf7e4) to reach the question bank and study materials.',
      },
    ],
    linkResources: [
      { label: 'Open exam resources (Skool classroom)', href: 'https://www.skool.com/finternship/classroom/e49e2efc?md=d36f1dca8ade4d22aef3f433b7caf7e4' },
    ],
    verification: [],
  },

  // ── Section 3 · Exam Resources ───────────────────────────────────────────
  {
    slideId: 'section-3.step-1-ask-leo',
    sectionId: 'access-question-bank',
    indexWithinSection: 1,
    totalInSection: 8,
    section: 'Section 3 · Exam Resources',
    slideHeading: 'Ask Leo to create your iRecruit account',
    eyebrow: 'Part 1 · Step 1 of 5',
    blocks: [
      {
        kind: 'intro',
        text: 'You cannot reach the question bank without a personal iRecruit account. Getting one is a 5-minute task.',
      },
      {
        kind: 'paragraph',
        text: 'On your FINternship support chat, send Leo your **name, email, and mobile number** so he can create your account. While you wait, start Step 2.',
      },
    ],
    verification: [],
  },
  {
    slideId: 'section-3.step-2-login-irecruit',
    sectionId: 'access-question-bank',
    indexWithinSection: 2,
    totalInSection: 8,
    section: 'Section 3 · Exam Resources',
    slideHeading: 'Log in to iRecruit',
    eyebrow: 'Part 1 · Step 2 of 5',
    blocks: [
      {
        kind: 'paragraph',
        text: 'Log in to [iRecruit](https://joinus.aia.com.sg/app/login) using the shared credentials below. Sign into Google first so the iRecruit OTP can reach you.',
      },
      {
        kind: 'list',
        items: [
          'Google — email: `cmfasexamssg@gmail.com`, password: `cmfasexamssg!123`. [Call Leo at 91395749](tel:+6591395749) for the OTP.',
          'iRecruit — email: `cmfasexamssg@gmail.com`, password: `AIAirecruit!123`. The OTP lands in the Google inbox above.',
        ],
      },
    ],
    linkResources: [
      { label: 'Log in to iRecruit', href: 'https://joinus.aia.com.sg/app/login' },
    ],
    verification: [],
  },
  {
    slideId: 'section-3.step-3-navigate',
    sectionId: 'access-question-bank',
    indexWithinSection: 3,
    totalInSection: 8,
    section: 'Section 3 · Exam Resources',
    slideHeading: 'Navigate to the M9 exam bank',
    eyebrow: 'Part 1 · Step 3 of 5',
    blocks: [
      {
        kind: 'paragraph',
        text: 'Inside iRecruit, go to **iLearn → Pre-Contract → Pre-Contract (Online) → CMFAS M9 → Practice Questions (Chapter Revision and Premium Papers) → Launch**.',
      },
      {
        kind: 'image',
        src: 'https://assets.skool.com/f/8fc2f6045ea549398401f3cdbcc90878/7a51b6c60d594d16a68b94dbc88510c51aff1bcf47124f6eb7665a0947be0864',
        alt: 'iLearn navigation path to CMFAS M9 Practice Questions',
      },
    ],
    verification: [
      {
        id: 'screenshot',
        kind: 'screenshot',
        label: 'Upload a screenshot of the Practice Questions launch screen',
        hint: 'Prove you reached the launch button.',
      },
    ],
  },
  {
    slideId: 'section-3.step-4-start-session',
    sectionId: 'access-question-bank',
    indexWithinSection: 4,
    totalInSection: 8,
    section: 'Section 3 · Exam Resources',
    slideHeading: 'Start a practice session',
    eyebrow: 'Part 1 · Step 4 of 5',
    blocks: [
      {
        kind: 'paragraph',
        text: 'Use these settings: **Launch → Restart → OK → Select Module 9 → All Questions → 50 Questions → Redo Cleared Questions → Learning Mode → Start Session**.',
      },
      {
        kind: 'image',
        src: 'https://assets.skool.com/f/8fc2f6045ea549398401f3cdbcc90878/67573e3a83704af4bc7347053267f43bb88a20b2576d4a12b787727f1989ffa2',
        alt: 'Practice-session setup screen with the recommended settings',
      },
      {
        kind: 'paragraph',
        text: 'Use the speed reference to answer questions as you go — learn by doing rather than reading the textbook cover to cover.',
      },
      {
        kind: 'image',
        src: 'https://assets.skool.com/f/8fc2f6045ea549398401f3cdbcc90878/72f9183cb0fc4393ba053d915db4199ac8efcd10ab6c430699d7098a19800f28',
        alt: 'Speed-reference panel inside a practice session',
      },
    ],
    verification: [
      {
        id: 'screenshot',
        kind: 'screenshot',
        label: 'Upload a screenshot of your practice session setup',
      },
    ],
  },
  {
    slideId: 'section-3.step-5-mobile-login',
    sectionId: 'access-question-bank',
    indexWithinSection: 5,
    totalInSection: 8,
    section: 'Section 3 · Exam Resources',
    slideHeading: 'Log in to iLearn on mobile',
    eyebrow: 'Part 1 · Step 5 of 5',
    blocks: [
      {
        kind: 'paragraph',
        text: 'Strongly recommended. Follow the steps above on your phone and iLearn will prompt you to install its mobile app.',
      },
      {
        kind: 'image',
        src: 'https://assets.skool.com/f/8fc2f6045ea549398401f3cdbcc90878/bbd7b6da8be04f3d8c9be169b6d21595d789075e502b44df8916c8b029adf1a3-md.png',
        alt: 'iLearn mobile-app download prompt',
      },
    ],
    verification: [],
  },
  {
    slideId: 'section-3.part-2-study-tips',
    sectionId: 'access-question-bank',
    indexWithinSection: 6,
    totalInSection: 8,
    section: 'Section 3 · Exam Resources',
    slideHeading: 'Exam study tips & resources',
    eyebrow: 'Part 2 · Save yourself hours',
    blocks: [
      {
        kind: 'intro',
        text: 'Short walkthrough, then the two resource hubs we have curated for you.',
      },
      { kind: 'loom', videoId: '98d2a1ad005149bebdf1beeb5f11b94b', title: 'Exam study tips walkthrough' },
      {
        kind: 'list',
        items: [
          '[Exam resources · Google Drive](https://drive.google.com/drive/folders/1zPgxvcCkB7WKaIhDYPi1PYKLamUca2CQ?usp=sharing)',
          '[Exam resources · Larksuite wiki](https://xsgmrpwnwfee.sg.larksuite.com/wiki/HXsywc2UFijeSaktJ8dlbIKNgXf)',
        ],
      },
    ],
    linkResources: [
      { label: 'Exam resources (Google Drive)', href: 'https://drive.google.com/drive/folders/1zPgxvcCkB7WKaIhDYPi1PYKLamUca2CQ?usp=sharing' },
      { label: 'Exam resources (Lark wiki)', href: 'https://xsgmrpwnwfee.sg.larksuite.com/wiki/HXsywc2UFijeSaktJ8dlbIKNgXf' },
    ],
    verification: [],
  },
  {
    slideId: 'section-3.part-3-chatbot',
    sectionId: 'access-question-bank',
    indexWithinSection: 7,
    totalInSection: 8,
    section: 'Section 3 · Exam Resources',
    slideHeading: 'Chatbot access — your 24/7 CMFAS tutor',
    eyebrow: 'Part 3 · Ask anything anytime',
    blocks: [
      { kind: 'loom', videoId: '353d3c4931ad48669287fccdee69ab44', title: 'CMFAS chatbot walkthrough' },
      {
        kind: 'paragraph',
        text: 'Open [@cmfas_bot on Telegram](https://t.me/cmfas_bot) and start chatting. You can ask the bot literally anything about the CMFAS exams.',
      },
    ],
    linkResources: [
      { label: 'Chat with @cmfas_bot on Telegram', href: 'https://t.me/cmfas_bot' },
    ],
    verification: [],
  },
  {
    slideId: 'section-3.part-4-flashcards',
    sectionId: 'access-question-bank',
    indexWithinSection: 8,
    totalInSection: 8,
    section: 'Section 3 · Exam Resources',
    slideHeading: 'Learn faster with flashcards',
    eyebrow: 'Part 4 · Spaced repetition',
    blocks: [
      { kind: 'loom', videoId: '737f7da7b8204d928e4373bae84f4a61', title: 'Flashcards walkthrough' },
      { kind: 'heading', text: 'Decks' },
      {
        kind: 'list',
        items: [
          '[M9 flashcards](https://revisely.com/flashcards/decks/R9ikkh)',
          '[M9A flashcards](https://revisely.com/flashcards/decks/CVxXJ7)',
          '[HI flashcards](https://revisely.com/flashcards/decks/4Bz9fm)',
          '[RES5 flashcards](https://revisely.com/flashcards/decks/1KxDpT)',
        ],
      },
    ],
    linkResources: [
      { label: 'M9 flashcards', href: 'https://revisely.com/flashcards/decks/R9ikkh' },
      { label: 'M9A flashcards', href: 'https://revisely.com/flashcards/decks/CVxXJ7' },
      { label: 'HI flashcards', href: 'https://revisely.com/flashcards/decks/4Bz9fm' },
      { label: 'RES5 flashcards', href: 'https://revisely.com/flashcards/decks/1KxDpT' },
    ],
    verification: [],
  },

  // ── Section 4 · Rewards ──────────────────────────────────────────────────
  {
    slideId: 'section-4.rewards',
    sectionId: 'understand-costs-timeline',
    indexWithinSection: 1,
    totalInSection: 1,
    section: 'Section 4 · Rewards',
    slideHeading: 'Challenges & rewards — cash for passing well',
    paragraphs: GET_READY_SLIDE['understand-costs-timeline'].paragraphs,
    blocks: GET_READY_SLIDE['understand-costs-timeline'].blocks,
    verification: [],
  },

  // ── Section 5 · Register M9 ──────────────────────────────────────────────
  {
    slideId: 'section-5.step-1-register-path',
    sectionId: 'register-m9-exam',
    indexWithinSection: 1,
    totalInSection: 3,
    section: 'Section 5 · Register',
    slideHeading: 'Pick your registration path',
    eyebrow: 'Step 1 of 3',
    blocks: [
      {
        kind: 'intro',
        text: 'Book your first paper. A real exam date is the single biggest thing that pulls you through 20–30 hours of study.',
      },
      {
        kind: 'paragraph',
        text: 'Use the [CMFAS registration link](https://tinyurl.com/CMFASregistration2025), or message [@cmfas_bot](https://t.me/cmfas_bot) on Telegram. Either path works — pick one and do it.',
      },
    ],
    linkResources: [
      { label: 'Register for CMFAS exams', href: 'https://tinyurl.com/CMFASregistration2025' },
      { label: 'Ask @cmfas_bot on Telegram', href: 'https://t.me/cmfas_bot' },
    ],
    verification: [],
  },
  {
    slideId: 'section-5.step-2-book-date',
    sectionId: 'register-m9-exam',
    indexWithinSection: 2,
    totalInSection: 3,
    section: 'Section 5 · Register',
    slideHeading: 'Book your M9 exam date',
    eyebrow: 'Step 2 of 3',
    blocks: [
      { kind: 'heading', text: 'When to book' },
      {
        kind: 'list',
        items: [
          'Each paper is about 20–30 hours of study.',
          'Aim for 1–2 papers per month, starting with M9.',
          "Book before you start studying so you have a real deadline, or — if you'd rather warm up first — book once you've done 500 questions on iRecruit. Either way, lock in a date.",
        ],
      },
    ],
    verification: [],
  },
  {
    slideId: 'section-5.step-3-costs-support',
    sectionId: 'register-m9-exam',
    indexWithinSection: 3,
    totalInSection: 3,
    section: 'Section 5 · Register',
    slideHeading: 'Understand costs & our support',
    eyebrow: 'Step 3 of 3',
    blocks: [
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
    verification: [],
  },

  // ── Section 6 · First practice ───────────────────────────────────────────
  {
    slideId: 'section-6.first-practice',
    sectionId: 'first-practice',
    indexWithinSection: 1,
    totalInSection: 1,
    section: 'Section 6 · Practice',
    slideHeading: 'First practice set',
    paragraphs: GET_READY_SLIDE['first-practice'].paragraphs,
    linkResources: GET_READY_SLIDE['first-practice'].linkResources,
    verification: [],
  },
];

/** All slides under a section, in order. */
export function getSlidesForSection(sectionId: ReadyStepId): readonly SlideEntry[] {
  return GET_READY_SLIDES.filter((s) => s.sectionId === sectionId);
}

/** O(1) lookup by slide id. Memoised across the module. */
const SLIDE_BY_ID: Record<string, SlideEntry> = Object.fromEntries(
  GET_READY_SLIDES.map((s) => [s.slideId, s] as const),
);

export function getSlideById(slideId: string): SlideEntry | undefined {
  return SLIDE_BY_ID[slideId];
}
