import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserVideoStat {
  user_id: string;
  display_name: string | null;
  email: string | null;
  total_videos: number;
  completed_videos: number;
  completion_percentage: number;
  total_watch_time_seconds: number;
  last_activity: string | null;
  product_breakdown: ProductBreakdown[];
}

export interface ProductBreakdown {
  product_id: string;
  product_title: string;
  videos_watched: number;
  videos_completed: number;
  total_watch_time_seconds: number;
  completion_percentage: number;
}

export interface RawVideoProgress {
  id: string;
  user_id: string;
  product_id: string;
  video_id: string;
  completed: boolean;
  watch_time_seconds: number | null;
  completion_percentage: number | null;
  completed_at: string | null;
  updated_at: string;
}

export function useAdminVideoProgress() {
  const [stats, setStats] = useState<UserVideoStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all video progress rows
      const { data: progressData, error: progressError } = await supabase
        .from('video_progress')
        .select('*')
        .order('updated_at', { ascending: false });

      if (progressError) throw progressError;

      // Fetch all profiles for display names
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, display_name, email, first_name, last_name');

      if (profilesError) throw profilesError;

      // Fetch all products for titles
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, title');

      if (productsError) throw productsError;

      const profileMap = new Map(
        (profilesData || []).map(p => [p.user_id, p])
      );
      const productMap = new Map(
        (productsData || []).map(p => [p.id, p.title])
      );

      // Group progress by user
      const userMap = new Map<string, RawVideoProgress[]>();
      for (const row of (progressData || []) as RawVideoProgress[]) {
        if (!userMap.has(row.user_id)) userMap.set(row.user_id, []);
        userMap.get(row.user_id)!.push(row);
      }

      const result: UserVideoStat[] = [];

      for (const [userId, rows] of userMap.entries()) {
        const profile = profileMap.get(userId);
        const displayName =
          profile?.display_name ||
          (profile?.first_name && profile?.last_name
            ? `${profile.first_name} ${profile.last_name}`
            : null);

        // Product breakdown
        const byProduct = new Map<string, RawVideoProgress[]>();
        for (const row of rows) {
          if (!byProduct.has(row.product_id)) byProduct.set(row.product_id, []);
          byProduct.get(row.product_id)!.push(row);
        }

        const product_breakdown: ProductBreakdown[] = [];
        for (const [productId, pRows] of byProduct.entries()) {
          const completed = pRows.filter(r => r.completed).length;
          const totalWatch = pRows.reduce(
            (sum, r) => sum + (r.watch_time_seconds || 0),
            0
          );
          product_breakdown.push({
            product_id: productId,
            product_title: productMap.get(productId) || productId,
            videos_watched: pRows.length,
            videos_completed: completed,
            total_watch_time_seconds: totalWatch,
            completion_percentage:
              pRows.length > 0 ? Math.round((completed / pRows.length) * 100) : 0,
          });
        }

        const totalCompleted = rows.filter(r => r.completed).length;
        const totalWatch = rows.reduce(
          (sum, r) => sum + (r.watch_time_seconds || 0),
          0
        );
        const lastActivity = rows.reduce(
          (latest, r) =>
            !latest || r.updated_at > latest ? r.updated_at : latest,
          null as string | null
        );

        result.push({
          user_id: userId,
          display_name: displayName,
          email: profile?.email || null,
          total_videos: rows.length,
          completed_videos: totalCompleted,
          completion_percentage:
            rows.length > 0 ? Math.round((totalCompleted / rows.length) * 100) : 0,
          total_watch_time_seconds: totalWatch,
          last_activity: lastActivity,
          product_breakdown,
        });
      }

      // Sort by total watch time desc
      result.sort((a, b) => b.total_watch_time_seconds - a.total_watch_time_seconds);
      setStats(result);
    } catch (err: any) {
      console.error('Error fetching admin video progress:', err);
      setError(err.message || 'Failed to load video progress data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { stats, loading, error, refetch: fetchData };
}
