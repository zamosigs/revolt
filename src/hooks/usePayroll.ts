import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export function usePayroll() {
  const supabase = createClient();

  return useQuery({
    queryKey: ['payroll'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payroll_records')
        .select(`
          *,
          employee:profiles(full_name, role)
        `)
        .is('deleted_at', null)
        .order('period', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
}
