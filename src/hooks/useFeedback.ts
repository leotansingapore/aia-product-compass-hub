import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSimplifiedAuth } from '@/hooks/useSimplifiedAuth';
import { toast } from '@/hooks/use-toast';

export type FeedbackType = 'bug' | 'feedback' | 'feature';
export type FeedbackStatus = 'pending' | 'in_review' | 'resolved' | 'dismissed';

export interface FeedbackSubmission {
  id: string;
  user_id: string;
  user_email: string | null;
  user_name: string | null;
  type: FeedbackType;
  title: string;
  description: string;
  page_url: string | null;
  status: FeedbackStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useFeedback() {
  const { user } = useSimplifiedAuth();
  const [submitting, setSubmitting] = useState(false);

  const submitFeedback = async (data: {
    type: FeedbackType;
    title: string;
    description: string;
    page_url?: string;
  }) => {
    if (!user) {
      toast({ title: 'Please sign in to submit feedback', variant: 'destructive' });
      return false;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('feedback_submissions').insert({
        user_id: user.id,
        user_email: user.email ?? null,
        user_name: (user as any).user_metadata?.display_name ?? (user as any).user_metadata?.full_name ?? null,
        type: data.type,
        title: data.title,
        description: data.description,
        page_url: data.page_url ?? window.location.pathname,
        status: 'pending',
      });

      if (error) throw error;
      toast({ title: '✓ Submitted!', description: 'Thanks — we\'ll look into it.' });

      // Send email notification to admin (fire-and-forget)
      supabase.functions.invoke('notify-feedback-submitted', {
        body: {
          type: data.type,
          title: data.title,
          description: data.description,
          userEmail: user.email ?? 'Unknown',
          userName: (user as any).user_metadata?.display_name ?? (user as any).user_metadata?.full_name ?? 'Unknown User',
          pageUrl: data.page_url ?? window.location.pathname,
        },
      }).catch(err => console.warn('Feedback notification email failed:', err));

      return true;
    } catch (e: any) {
      toast({ title: 'Submission failed', description: e.message, variant: 'destructive' });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return { submitFeedback, submitting };
}

export function useAdminFeedback() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<FeedbackSubmission[]>([]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('feedback_submissions')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setItems((data ?? []) as FeedbackSubmission[]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: FeedbackStatus, admin_notes?: string) => {
    const { error } = await supabase
      .from('feedback_submissions')
      .update({ status, ...(admin_notes !== undefined ? { admin_notes } : {}) })
      .eq('id', id);
    if (error) throw error;
    setItems(prev => prev.map(i => i.id === id ? { ...i, status, ...(admin_notes !== undefined ? { admin_notes } : {}) } : i));
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase.from('feedback_submissions').delete().eq('id', id);
    if (error) throw error;
    setItems(prev => prev.filter(i => i.id !== id));
  };

  return { items, loading, fetchAll, updateStatus, deleteItem };
}
