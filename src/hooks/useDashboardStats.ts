import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/useAuthStore';

export function useDashboardStats() {
  const { profile } = useAuthStore();
  const supabase = createClient();

  return useQuery({
    queryKey: ['dashboard-stats', profile?.id],
    queryFn: async () => {
      if (!profile) return null;
      
      const { data, error } = await supabase.rpc('get_dashboard_stats', {
        p_user_id: profile.id
      });

      if (error) throw error;
      return data;
    },
    enabled: !!profile,
  });
}
