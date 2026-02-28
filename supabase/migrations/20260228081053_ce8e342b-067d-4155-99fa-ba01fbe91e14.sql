
-- Create changelog_entries table
CREATE TABLE public.changelog_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  type TEXT NOT NULL CHECK (type IN ('new', 'improved', 'fixed')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Platform', 'AI', 'Scripts', 'Admin', 'Videos', 'New Page')),
  link_to TEXT NULL,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'ai_generated')),
  ai_week_start DATE NULL,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.changelog_entries ENABLE ROW LEVEL SECURITY;

-- Anyone can view published entries
CREATE POLICY "Anyone can view published changelog entries"
ON public.changelog_entries
FOR SELECT
USING (is_published = true);

-- Admins can manage all entries
CREATE POLICY "Admins can manage changelog entries"
ON public.changelog_entries
FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'master_admin'));

-- Service role can manage all entries (for edge functions)
CREATE POLICY "Service role can manage changelog entries"
ON public.changelog_entries
FOR ALL
USING (current_setting('role') = 'service_role')
WITH CHECK (current_setting('role') = 'service_role');

-- Updated_at trigger
CREATE TRIGGER update_changelog_entries_updated_at
BEFORE UPDATE ON public.changelog_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed with existing hardcoded entries
INSERT INTO public.changelog_entries (entry_date, type, title, description, category, link_to, source) VALUES
-- February 2026
('2026-02-28', 'new', 'Pitch Analysis — AI Video Pitch Evaluator', 'Submit a Loom or YouTube URL of your Pro Achiever sales pitch and receive an AI-generated scorecard across 5 dimensions: Product Knowledge, Needs Discovery, Objection Handling, Closing Technique, and Communication.', 'AI', '/roleplay/pitch-analysis', 'manual'),
('2026-02-28', 'new', 'Email Notifications — Pitch Analysis & Roleplay Results', 'You now receive an email when your AI pitch analysis or roleplay feedback is ready, with your scores summarised directly in the email so you don''t need to check the platform.', 'Platform', NULL, 'manual'),
('2026-02-28', 'new', 'Biweekly Changelog Digest Email', 'All users now receive a biweekly email digest every Monday summarising the latest platform updates, new features, and new training videos added in the past two weeks.', 'Platform', NULL, 'manual'),
('2026-02-28', 'new', 'Account Approval Email — Welcome & Login Credentials', 'New users now receive a polished welcome email when their account is approved by an admin, including their login email, a direct link to set their password, and an overview of platform features.', 'Admin', NULL, 'manual'),
('2026-02-27', 'new', 'Script Categories — Fact Finding & Sales Scripts', 'Added dedicated "Fact Finding" category to the Scripts Database for prospecting and discovery scripts. Sales-oriented scripts now live under their own "Sales Scripts" category for cleaner organisation.', 'Scripts', '/scripts', 'manual'),
('2026-02-27', 'improved', 'Admin Category Management', 'Admins can now delete script categories directly from the Scripts Database. Scripts inside a deleted category are automatically moved to Uncategorized so no content is lost.', 'Admin', NULL, 'manual'),
('2026-02-25', 'new', 'Script Flows — Visual Flow Builder', 'Brand-new drag-and-drop flow builder for mapping out conversation flows, decision trees, and sales processes. Create, share, and annotate flows visually.', 'New Page', '/flows', 'manual'),
('2026-02-22', 'new', 'Script Playbooks', 'Compile your favourite scripts and objection responses into shareable playbooks. Each playbook can be shared via a public link with optional editing permissions.', 'New Page', '/playbooks', 'manual'),
('2026-02-18', 'new', 'Servicing Templates Page', 'Dedicated page for post-sale servicing scripts — renewals, policy reviews, claims guidance, and client retention scripts.', 'New Page', '/servicing', 'manual'),
('2026-02-15', 'new', 'Scripts Database', 'Central hub for all sales scripts, categorised by stage, audience, and type. Scripts support versioning, community contributions, favourites, and admin moderation.', 'New Page', '/scripts', 'manual'),
('2026-02-12', 'new', 'Objections Tab — Community Responses', 'The Objections subtab now aggregates common client objections with community-contributed responses. Advisors can upvote the best responses and submit their own.', 'Scripts', '/objections', 'manual'),
-- January 2026
('2026-01-28', 'improved', 'AI Chat — Thread Persistence', 'AI chat conversations now persist across sessions. Your conversation history is saved per product so you can continue where you left off.', 'AI', NULL, 'manual'),
('2026-01-25', 'new', 'Training Videos — Pro Achiever & Platinum Wealth Venture', 'New training video series added for Pro Achiever and Platinum Wealth Venture products, covering product overview, key features, and objection handling.', 'Videos', '/category/investment', 'manual'),
('2026-01-22', 'new', 'Knowledge Base (KB)', 'Structured knowledge base portal for all products, organised by category. Each product page includes key highlights, useful links, explainer videos, and a direct link to its AI assistant.', 'New Page', '/kb', 'manual'),
('2026-01-20', 'new', 'Training Videos — Healthshield Gold Max & Solitaire PA', 'Medical insurance product training videos added — covering plan tiers, claims process, and common client questions for Healthshield Gold Max and Solitaire PA.', 'Videos', '/category/medical', 'manual'),
('2026-01-18', 'new', 'AI Roleplay Training', 'Practice sales conversations with a live AI avatar powered by Tavus. Choose from 4 difficulty scenarios ranging from Beginner to Advanced. Receive automated feedback with scores across communication, objection handling, and product knowledge.', 'New Page', '/roleplay', 'manual'),
('2026-01-10', 'new', 'CMFAS Exam Modules', 'Study portal for CMFAS licensing exams covering M9, M9A, HI, and RES5. Each module includes learning videos with progress tracking and a dedicated AI tutor chatbot.', 'New Page', '/cmfas-exams', 'manual'),
('2026-01-05', 'improved', 'Gamification — XP & Achievements', 'Earn XP by completing quizzes, watching videos, and engaging with products. Unlock achievement badges and track your learning streak. Daily XP limits prevent farming.', 'Platform', NULL, 'manual'),
-- December 2025
('2025-12-20', 'new', 'Product AI Assistants', 'Each product now has its own AI assistant pre-trained on product-specific knowledge. Ask questions, get benefit illustrations explained, and compare scenarios — all within the product page.', 'AI', NULL, 'manual'),
('2025-12-18', 'new', 'Training Videos — Guaranteed Protect Plus & Secure Flexi Term', 'Whole life and term product training videos added for Guaranteed Protect Plus and Secure Flexi Term, including pitch walkthroughs and comparison guides.', 'Videos', '/category/whole-life', 'manual'),
('2025-12-15', 'new', 'Product Categories & Detail Pages', 'Products are organised into categories: Investment, Endowment, Whole Life, Term, and Medical. Each product has a dedicated page with training videos, useful links, highlights, and an AI chatbot.', 'Platform', NULL, 'manual'),
('2025-12-08', 'new', 'FINternship Platform Launch', 'Initial launch of the FINternship Learning Platform — a centralised training and knowledge hub for financial advisors. Includes the dashboard, product library, bookmarks, and basic search.', 'Platform', NULL, 'manual');
