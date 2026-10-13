// What every academy link should unfurl as. build-og.mjs turns this into pages.mjs + cards.
//
// SECTIONS are the fixed pages, worded from each page's own heading and meta description.
// collectPages() adds one entry per day, assignment, worksheet, cheat sheet, recap,
// reference, CMFAS module and lesson, product, lesson and category, read from docs/ and the
// products table, and points every <Navigate> route in App.tsx at its target's entry.
//
// `leaf: false` stops resolvePage naming an unlisted child from its URL: case vault cases,
// shared playbooks and AIA's internal course catalogue keep their section card only.
// `virtual` rows are not pages; they only catch children (/product/<new-id>).

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { ROOT } from './card.mjs';
import { appRoutes, categoryIdSlugs, clean, createSlug, frontmatter, summary } from './content.mjs';
import { cardSlug } from './resolve.mjs';

export const SECTIONS = [
  { path: '/', title: 'FINternship Learning Platform', pill: 'Adviser training', bar: 'academy.finternship.com',
    description: 'The training hub for FINternship advisers: the 14-day orientation, the first 60 days, AIA product lessons, CMFAS prep, sales scripts and roleplay.' },
  { path: '/auth', title: 'Sign in', pill: 'FINternship Learning Platform', description: 'Sign in to the FINternship Learning Platform.' },
  { path: '/roadmap', title: 'Roadmap', pill: 'What we are building', description: 'What the FINternship Learning Platform is building next, the feedback board and the changelog.' },
  { path: '/consultant-landing', title: 'How to use the platform', pill: 'Start here', description: 'What is on the FINternship Learning Platform and where to start.' },
  { path: '/bookmarks', title: 'My bookmarks', pill: 'Saved', description: 'The products and training you saved, in one place.' },
  { path: '/my-account', title: 'My account', pill: 'Account', description: 'Your profile, password and access.' },
  { path: '/feedback', title: 'Feedback', pill: 'Help us improve', description: 'Tell the team what to fix or build next.' },
  { path: '/admin', title: 'Admin', pill: 'Admin', leaf: false, description: 'Admin tools for the FINternship Learning Platform.' },
  { path: '/team-progress', title: 'Team progress', pill: 'Admin', leaf: false, description: 'How each trainee is moving through the learning track.' },

  { path: '/learning-track', title: 'Learning track', pill: 'Learning track', bar: 'Your training path',
    description: 'Your training path in order: First 14 Days, then First 60 Days and the pre-RNF assignments, then the Next 60 Days.' },
  { path: '/learning-track/first-14-days', title: 'First 14 Days', pill: 'Learning track', bar: '{n} short reads',
    description: 'Decide if this career, and this team, is right for you. {n} short reads, one a day.' },
  { path: '/learning-track/first-60-days', title: 'First 60 Days', pill: 'Learning track', bar: '{n} daily lessons',
    description: '{n} daily lessons for your months before the RNF, with a recap at the end of most weeks.' },
  { path: '/learning-track/next-60-days', title: 'Next 60 Days', pill: 'Learning track', bar: '{n} daily lessons',
    description: '{n} daily lessons for your first months as a licensed adviser.' },
  { path: '/learning-track/product-mastery', title: 'Product Mastery Track', pill: 'Learning track', bar: '{n} daily lessons',
    description: '{n} daily lessons on the AIA products you will present to clients.' },
  { path: '/learning-track/pre-rnf/assignments', title: 'Pre-RNF assignments', pill: 'First 60 Days', bar: '{n} deliverables',
    description: "{n} deliverables that prove you're ready for the field." },
  { path: '/learning-track/pre-rnf/worksheets', title: 'Worksheets', pill: 'First 60 Days', bar: 'Fill in online',
    description: 'Your pledge sheet and business plan, filled in online.' },
  { path: '/learning-track/post-rnf/next-60-days', title: 'Next 60 Days', pill: 'Learning track', bar: '{n} daily lessons',
    description: '{n} daily lessons for your first months as a licensed adviser.' },
  { path: '/learning-track/post-rnf/assignments', title: 'Post-RNF assignments', pill: 'Next 60 Days', bar: '{n} deliverables',
    description: '{n} deliverables that turn the first 60 days of your real business into a compounding practice.' },
  // AIA marks the catalogue internal use only: section words only, never a course name.
  { path: '/learning-track/post-rnf/aia-training', title: 'AIA Training Directory', pill: 'Next 60 Days', bar: 'Courses and dates', leaf: false,
    description: "AIA's training courses, roadmaps and session dates for the year, in one place." },
  { path: '/learning-track/post-rnf/aia-training/courses', title: 'AIA training courses', pill: 'AIA Training Directory', leaf: false,
    description: "Every AIA training course, laid out like the directory's contents pages." },
  { path: '/learning-track/post-rnf/aia-training/calendar', title: 'AIA training calendar', pill: 'AIA Training Directory', leaf: false,
    description: "AIA's training sessions by month." },
  { path: '/learning-track/post-rnf/aia-training/roadmaps', title: 'AIA training roadmaps', pill: 'AIA Training Directory', leaf: false,
    description: 'The course roadmap for each stage of an AIA career.' },
  { path: '/learning-track/resources', title: 'Resources', pill: 'Learning track', description: 'Reference reading for the learning track.' },
  { path: '/learning-track/resources/competitor-products', title: 'Competitor products', pill: 'Resources',
    description: "A reference to other insurers' plans in Singapore." },
  { path: '/learning-track/admin', title: 'Learning track admin', pill: 'Admin', description: 'Progress, assignments and question banks across the learning track.' },

  { path: '/library', title: 'Library', pill: 'Library', bar: 'All in one place',
    description: 'Product categories, question banks, cheat sheets and sales playbooks, all in one place.' },
  { path: '/library/products', title: 'Products', pill: 'Library', bar: 'By category', description: 'Every product the team trains on, by category.' },
  { path: '/library/question-banks', title: 'Question banks', pill: 'Library', description: 'Practice questions for each product.' },
  { path: '/library/cheat-sheets', title: 'Cheat sheets', pill: 'Library', bar: 'One page each', description: 'One-page cheat sheets for the learning track and core training.' },
  { path: '/library/playbooks', title: 'Sales playbooks', pill: 'Library', description: 'Scripts, flows and playbooks for every stage of a sale.' },
  { path: '/library/tools', title: 'Tools', pill: 'Library', description: 'Tools for your own advisory business.' },
  { path: '/library/tools/content-studio', title: 'Content Studio', pill: 'Tools', description: 'Write posts and content for your own advisory business.' },
  { path: '/cheat-sheets', virtual: true, title: 'Cheat sheets', pill: 'Library', description: 'One-page cheat sheets for the learning track and core training.' },
  { path: '/product', virtual: true, title: 'Product training', pill: 'Library', description: 'Lessons, videos and notes on a product the team sells.' },
  { path: '/category', virtual: true, title: 'Product category', pill: 'Library', description: 'The products in one category, with their lessons.' },

  { path: '/cmfas-exams', title: 'CMFAS exams', pill: 'CMFAS', bar: 'M9, M9A, HI, RES5',
    description: 'Prepare for your CMFAS exams with lecture videos, a question bank, study tips and the syllabus.' },
  { path: '/cmfas-exams/today', title: 'Get ready for CMFAS', pill: 'CMFAS', leaf: false, description: 'Step by step, from registering for the papers to exam day.' },
  { path: '/cmfas-exams/lecture-videos', title: 'CMFAS lecture videos', pill: 'CMFAS', description: 'Pick your next paper. Most people start with M9.' },
  { path: '/cmfas-exams/practice', title: 'CMFAS question bank', pill: 'CMFAS', description: 'Learn by doing: practice questions for each paper.' },
  { path: '/cmfas-exams/study-tips', title: 'CMFAS study tips', pill: 'CMFAS', description: 'Pass M9, M9A and HI in a month.' },
  { path: '/cmfas-exams/syllabus', title: 'CMFAS syllabus and format', pill: 'CMFAS', description: "Know what you're being tested on." },
  { path: '/cmfas-exams/papers', alias: '/cmfas-exams/lecture-videos' },
  { path: '/cmfas', virtual: true, title: 'CMFAS exams', pill: 'CMFAS', description: 'Prepare for your CMFAS exams with lecture videos, a question bank and an AI tutor.' },
  { path: '/cmfas/chat', title: 'CMFAS AI tutor', pill: 'CMFAS', leaf: false, description: 'Ask the AI tutor about any CMFAS paper.' },

  { path: '/roleplay', title: 'AI roleplay training', pill: 'Practice', bar: 'Video roleplay',
    description: 'Practise sales, objection handling and consultation skills with AI video avatars.' },
  { path: '/roleplay/feedback', virtual: true, leaf: false, title: 'Roleplay feedback', pill: 'Practice', description: 'Scored feedback on a roleplay session.' },
  { path: '/question-banks', title: 'Question banks', pill: 'Practice', description: 'Study each AIA product, sit a mock exam and track your progress.' },
  { path: '/review-bank', title: 'Review bank', pill: 'Practice', description: 'Practise the questions you saved again.' },
  { path: '/review-all', title: 'All questions and answers', pill: 'Practice', description: 'Every product mastery question and answer in one place.' },
  { path: '/leaderboard', title: 'Leaderboard', pill: 'Learning track', description: 'Rankings across the learning track, and the assignment tracker.' },
  { path: '/leaderboard/tracker', title: 'Assignment tracker', pill: 'Leaderboard', description: 'Who has handed in which assignment.' },

  { path: '/scripts', title: 'Scripts and objections', pill: 'Sales scripts', leaf: false, bar: 'Word for word',
    description: 'Reference scripts for cold calls, follow-up messages, referrals, appointment confirmations and common objections.' },
  { path: '/scripts/course', title: 'Scripts fundamentals', pill: 'Sales scripts', description: 'What to read before you use the sales scripts.' },
  { path: '/objections', title: 'Scripts and objections', pill: 'Sales scripts', description: 'Answers to the objections clients raise, with the scripts around them.' },
  { path: '/servicing', title: 'Servicing templates', pill: 'Sales scripts', leaf: false, description: 'Text templates for servicing and keeping in touch with clients.' },
  { path: '/playbooks', title: 'Script playbooks', pill: 'Sales scripts', leaf: false, description: 'Collections of scripts for each stage of a sale.' },
  { path: '/playbooks/share', virtual: true, leaf: false, title: 'Shared script playbook', pill: 'Sales scripts', description: 'A script playbook shared from the FINternship Learning Platform.' },
  { path: '/flows', title: 'Script flows', pill: 'Sales scripts', leaf: false, description: 'Branching scripts: what to say next, based on how the client answers.' },
  { path: '/flows/view', virtual: true, leaf: false, title: 'Shared script flow', pill: 'Sales scripts', description: 'A script flow shared from the FINternship Learning Platform.' },
  { path: '/concept-cards', title: 'Concept cards', pill: 'Sales tools', description: 'Visual concept flashcards for financial advisers.' },
  { path: '/appointment-flows', title: 'Appointment flows', pill: 'Sales tools', bar: '5 tracks',
    description: '5 appointment tracks drawn from 258 real recorded appointments. Pick a track at the opening, then run the branches.' },
  { path: '/case-vault', title: 'Case vault', pill: 'Sales tools', leaf: false, description: 'Client cases to study before you build your own.' },
  { path: '/drawings-playbook', title: 'Drawings playbook', pill: 'Sales tools', bar: '30+ drawings',
    description: 'The 30+ diagrams that close cases: method, scripts and drills for every drawing in the APA appointment flow.' },
];

const CMFAS_MODULES = [
  { id: 'onboarding', product: null, title: 'CMFAS Onboarding', bar: 'Getting started', description: 'Getting started: your student account, exam registration and study plan.' },
  { id: 'm9', product: 'm9-module', title: 'CMFAS M9 Module', bar: 'Life insurance and ILPs', description: 'Life Insurance and Investment-Linked Policies.' },
  { id: 'm9a', product: 'm9a-module', title: 'CMFAS M9A Module', bar: 'Life insurance and ILPs II', description: 'Life Insurance and Investment-Linked Policies II.' },
  { id: 'hi', product: 'hi-module', title: 'CMFAS HI Module', bar: 'Health insurance', description: 'Health Insurance.' },
  { id: 'res5', product: 'res5-module', title: 'CMFAS RES5 Module', bar: 'Rules and ethics', description: 'Rules, Ethics and Skills for Financial Advisory Services.' },
];

// Routes nobody shares, or that must never carry a page's words.
export const IGNORED = ['/force-password', '/reset-password', '/oauth/authorize', '/*'];

const TRACKS = [
  { dir: 'first-14-days', base: '/learning-track/first-14-days', name: 'First 14 Days' },
  { dir: 'first-60-days', base: '/learning-track/first-60-days', name: 'First 60 Days' },
  { dir: 'next-60-days', base: '/learning-track/next-60-days', name: 'Next 60 Days' },
  { dir: 'product-mastery-track', base: '/learning-track/product-mastery', name: 'Product Mastery' },
];

const CHEAT_SECTIONS = { 'core-training': 'Core training', 'first-60-days': 'First 60 Days', 'next-60-days': 'Next 60 Days', 'product-mastery': 'Product Mastery' };

// Sub-routes of /product/:id that a lesson slug must not shadow.
const PRODUCT_SUBROUTES = new Set(['manage-videos', 'ai-assistant', 'exam', 'video', 'study']);

const docs = (...p) => path.join(ROOT, 'docs', ...p);
const mdFiles = (dir) => (existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.md')) : []);
const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export function collectPages({ products, categories, previous }) {
  const pages = {};
  const cards = {};
  const add = (p, page, card) => {
    const slug = card === undefined ? page.card : cardSlug(p);
    pages[p] = { title: clean(page.title), description: summary(page.description), card: slug, ...(page.leaf === false ? { leaf: false } : {}) };
    // A spaced hyphen wraps onto its own line in a poster headline; the first one reads as a colon.
    if (card) cards[slug] = { ...card, headline: clean(card.headline).replace(/\s+-\s+/, ': ') };
  };

  // Day tracks: docs/<track>/week-N/day-NN.md, URL = frontmatter `day`.
  const tracks = TRACKS.map((t) => {
    const days = [];
    for (const week of existsSync(docs(t.dir)) ? readdirSync(docs(t.dir)).filter((w) => /^week-\d+$/.test(w)) : []) {
      for (const f of mdFiles(docs(t.dir, week)).filter((f) => /^day-\d+\.md$/.test(f))) {
        const fm = frontmatter(docs(t.dir, week, f));
        if (fm.day && fm.title) days.push(fm);
      }
    }
    return { ...t, days };
  });
  const assignmentSets = [
    ['first-60-days', '/learning-track/pre-rnf/assignments', 'Pre-RNF assignment'],
    ['next-60-days', '/learning-track/post-rnf/assignments', 'Post-RNF assignment'],
  ].map(([dir, base, label]) => ({
    base,
    label,
    list: mdFiles(docs(dir, 'assignments'))
      .filter((f) => /^assignment-\d+\.md$/.test(f))
      .map((f) => ({ slug: f.replace(/\.md$/, ''), fm: frontmatter(docs(dir, 'assignments', f)) })),
  }));

  // Section copy that states a count says {n}, filled from the content it counts.
  const counts = {
    ...Object.fromEntries(tracks.map((t) => [t.base, t.days.length])),
    '/learning-track/post-rnf/next-60-days': tracks.find((t) => t.dir === 'next-60-days').days.length,
    ...Object.fromEntries(assignmentSets.map((a) => [a.base, a.list.length])),
  };
  for (const s of SECTIONS) {
    if (s.alias) continue;
    const n = (v) => (v && counts[s.path] != null ? v.replace(/\{n\}/g, String(counts[s.path])) : v);
    if (/\{n\}/.test(`${s.bar}${s.description}`) && counts[s.path] == null) throw new Error(`${s.path} says {n} but nothing counts it`);
    add(s.path, { ...s, description: n(s.description) }, { headline: s.title, pill: s.pill, bar: n(s.bar) });
  }

  for (const t of tracks) {
    const { days } = t;
    const total = days.length;
    for (const fm of days) {
      const n = Number(fm.day);
      const min = Number(fm.duration_minutes) || null;
      add(
        `${t.base}/day/${n}`,
        { title: `Day ${n}: ${fm.title}`, description: fm.big_idea || `Day ${n} of ${total} in ${t.name}.${min ? ` About ${min} minutes.` : ''}` },
        { headline: fm.title, pill: t.name, bar: `Day ${n} of ${total}`, badges: min ? [{ big: String(min), small: 'minutes' }] : [] },
      );
    }
  }

  // First 60 Days week recaps and reference pages.
  for (const week of readdirSync(docs('first-60-days')).filter((w) => /^week-\d+$/.test(w))) {
    const f = docs('first-60-days', week, 'recap.md');
    if (!existsSync(f)) continue;
    const n = Number(week.split('-')[1]);
    const fm = frontmatter(f);
    add(`/learning-track/first-60-days/recap/${n}`,
      { title: fm.title || `Week ${n} recap`, description: `The recap for week ${n} of First 60 Days.` },
      { headline: fm.title || `Week ${n} recap`, pill: 'First 60 Days', bar: `Week ${n} recap` });
  }
  for (const f of mdFiles(docs('first-60-days', '_source-supplementary'))) {
    const slug = f.replace(/\.md$/, '');
    const fm = frontmatter(docs('first-60-days', '_source-supplementary', f));
    const title = fm.title || slug.replace(/-/g, ' ');
    add(`/learning-track/first-60-days/reference/${slug}`, { title, description: fm.purpose || `A reference for First 60 Days.` },
      { headline: title, pill: 'First 60 Days', bar: 'Reference' });
  }

  // Assignments: pre-RNF by url_slug (the file name also resolves), post-RNF by file name.
  for (const { base, label, list } of assignmentSets) {
    for (const { slug, fm } of list) {
      const order = Number(fm.order) || 0;
      const p = `${base}/${fm.url_slug || slug}`;
      add(p, { title: fm.title || slug, description: fm.short || `${label}.` },
        { headline: fm.title || slug, pill: label, bar: order ? `Assignment ${order} of ${list.length}` : 'Assignment' });
      if (fm.url_slug) pages[`${base}/${slug}`] = pages[p];
    }
  }

  // Worksheets: two entries in src/features/pre-rnf-worksheets/worksheets.ts (it imports the
  // Supabase client, so it is read as text).
  const ws = readFileSync(path.join(ROOT, 'src/features/pre-rnf-worksheets/worksheets.ts'), 'utf8');
  for (const m of ws.matchAll(/slug:\s*["']([a-z0-9-]+)["'][\s\S]*?title:\s*["']([^"']+)["'][\s\S]*?short:\s*["']([^"']+)["']/g)) {
    add(`/learning-track/pre-rnf/worksheets/${m[1]}`, { title: m[2], description: m[3] }, { headline: m[2], pill: 'Worksheet', bar: 'Fill in online' });
  }

  // Cheat sheets: docs/cheat-sheets/<section>/<slug>.md; description is "The one idea".
  let sheets = 0;
  for (const section of Object.keys(CHEAT_SECTIONS)) {
    for (const f of mdFiles(docs('cheat-sheets', section)).filter((f) => !f.startsWith('_') && f !== 'index.md')) {
      const raw = readFileSync(docs('cheat-sheets', section, f), 'utf8');
      const fm = frontmatter(docs('cheat-sheets', section, f));
      const title = (fm.title || f.replace(/\.md$/, '')).replace(/\s+-\s+(One-Page )?Cheat Sheet$/i, '');
      const idea = raw.match(/^>\s*\*\*The one idea:?\*\*:?\s*(.+)$/m)?.[1];
      add(`/cheat-sheets/${section}/${f.replace(/\.md$/, '')}`,
        { title: `${title}: cheat sheet`, description: idea || `A one-page cheat sheet from ${CHEAT_SECTIONS[section]}.` },
        { headline: title, pill: 'Cheat sheet', bar: CHEAT_SECTIONS[section] });
      sheets++;
    }
  }
  cards['library-cheat-sheets'].badges = [{ big: String(sheets), small: 'cheat sheets' }];

  // Products, lessons, CMFAS lessons, categories. No key: keep last build's rows.
  if (products && categories) {
    const catName = Object.fromEntries(categories.map((c) => [c.id, clean(c.name)]));
    const byId = Object.fromEntries(products.map((p) => [p.id, p]));
    for (const p of products) {
      const title = clean(p.title);
      const lessons = Array.isArray(p.training_videos) ? p.training_videos.filter((v) => v && v.title) : [];
      const base = `/product/${p.id}`;
      add(base,
        { title, description: p.description || (lessons.length ? `${plural(lessons.length, 'lesson')} on ${title}.` : `Training notes on ${title}.`) },
        { headline: title, pill: catName[p.category_id] || 'Product training', bar: 'Product training',
          badges: lessons.length ? [{ big: String(lessons.length), small: lessons.length === 1 ? 'lesson' : 'lessons' }] : [] });
      const seen = new Set();
      lessons.forEach((v, i) => {
        const slug = createSlug(v.title);
        // Same title twice: the app opens the first, so the first one names the link.
        if (!slug || seen.has(slug) || PRODUCT_SUBROUTES.has(slug)) return;
        seen.add(slug);
        const lesson = clean(v.title);
        pages[`${base}/${slug}`] = {
          title: lesson.toLowerCase().includes(title.toLowerCase()) ? lesson : `${lesson} | ${title}`,
          description: summary(`Lesson ${i + 1} of ${lessons.length} in ${title}. ${clean(p.description)}`),
          card: cardSlug(base),
        };
      });
    }
    // Six old ids redirect to their core-* copy (ProductDetail.tsx LEGACY_TO_CORE_SLUG).
    const legacy = readFileSync(path.join(ROOT, 'src/pages/ProductDetail.tsx'), 'utf8').match(/LEGACY_TO_CORE_SLUG[^{]*\{([\s\S]*?)\};/);
    for (const m of legacy ? legacy[1].matchAll(/'([a-z0-9-]+)':\s*'([a-z0-9-]+)'/g) : []) {
      for (const k of Object.keys(pages).filter((k) => k === `/product/${m[2]}` || k.startsWith(`/product/${m[2]}/`))) {
        pages[k.replace(`/product/${m[2]}`, `/product/${m[1]}`)] = pages[k];
      }
    }

    for (const mod of CMFAS_MODULES) {
      const base = `/cmfas/module/${mod.id}`;
      const lessons = mod.product && byId[mod.product] ? (byId[mod.product].training_videos || []).filter((v) => v && v.title) : [];
      add(base, { title: mod.title, description: mod.description },
        { headline: mod.title, pill: 'CMFAS', bar: mod.bar,
          badges: lessons.length ? [{ big: String(lessons.length), small: lessons.length === 1 ? 'video' : 'videos' }] : [] });
      for (const v of lessons) {
        const slug = createSlug(v.title);
        if (slug && !pages[`${base}/video/${slug}`]) {
          pages[`${base}/video/${slug}`] = { title: `${clean(v.title)} | ${mod.title}`, description: summary(clean(v.description) || `A ${mod.title} lecture video.`), card: cardSlug(base) };
        }
      }
    }

    const idSlug = categoryIdSlugs();
    for (const c of categories) {
      const name = clean(c.name);
      const count = products.filter((p) => p.category_id === c.id && p.published).length;
      const slug = idSlug[c.id] || createSlug(name);
      const p = `/category/${slug}`;
      if (pages[p]) continue; // two names map to supplementary-training; the first keeps it
      add(p, { title: name, description: c.description || `${plural(count, 'product')} in ${name}.` },
        { headline: name, pill: 'Product category', bar: 'Library', badges: count ? [{ big: String(count), small: count === 1 ? 'product' : 'products' }] : [] });
      pages[`/category/${c.id}`] = pages[p];
      pages[`/category/${createSlug(name)}`] ??= pages[p];
    }
  } else {
    for (const [p, page] of Object.entries(previous)) {
      if (!/^\/(product|category|cmfas\/module)\//.test(p)) continue;
      pages[p] = page;
      if (!cards[page.card]) cards[page.card] = { reuse: true };
    }
  }

  // Redirects in App.tsx, and alias rows, preview as their target.
  const aliases = [...appRoutes().filter((r) => r.to).map((r) => [r.path, r.to]), ...SECTIONS.filter((s) => s.alias).map((s) => [s.path, s.alias])];
  for (const [from, to] of aliases) {
    if (!pages[from] && pages[to]) pages[from] = pages[to];
  }
  if (!pages['/categories']) pages['/categories'] = pages['/library/products'];

  return { pages, cards };
}
