import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/useAuthStore';

export function useLoads() {
  const supabase = createClient();
  const { profile } = useAuthStore();

  return useQuery({
    queryKey: ['loads', profile?.id, profile?.role],
    queryFn: async () => {
      if (!profile) return [];

      let query = supabase
        .from('loads')
        .select(`
          *,
          client:clients(company_name),
          dispatcher:profiles!loads_dispatcher_id_fkey(full_name)
        `)
        .is('deleted_at', null);

      if (profile.role === 'DISPATCHER') {
        query = query.eq('dispatcher_id', profile.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile,
  });
}
