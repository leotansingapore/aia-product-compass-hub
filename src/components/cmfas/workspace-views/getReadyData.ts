/**
 * Six setup steps; IDs match CMFASOnboardingWizard and CourseOutlineView checklist keys.
 * Reading copy lives in getReadySlideContent — no separate “full lesson” route from the study desk.
 */
export const GET_READY_STEPS = [
  { id: 'welcome', title: 'Read the welcome briefing', minutes: 5, outcome: "you'll know what CMFAS is and why it matters" },
  { id: 'create-student-account', title: 'Create your SCI College student account', minutes: 10, outcome: "you'll be a recognised exam candidate" },
  { id: 'access-question-bank', title: 'Unlock the question bank (iRecruit)', minutes: 10, outcome: "you can start drilling real exam questions" },
  { id: 'understand-costs-timeline', title: 'Know the costs + timeline', minutes: 3, outcome: "you'll know what each paper costs and how long to budget" },
  { id: 'register-m9-exam', title: 'Register for your first paper (M9)', minutes: 5, outcome: "a real booked exam date to study toward" },
  { id: 'first-practice', title: 'Do your first 10 practice questions', minutes: 15, outcome: "you stop stalling and start learning by doing" },
] as const;

export const GET_READY_VERIFICATION =
  "Completion is saved for your account. Mark a step when you are done with the slide. The same checklist is shared with the onboarding course module, and we use it to unlock the rest of exam prep.";

export type ReadyStepId = (typeof GET_READY_STEPS)[number]['id'];

export const READY_STEP_IDS: readonly ReadyStepId[] = GET_READY_STEPS.map((s) => s.id);
