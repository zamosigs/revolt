import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/useAuthStore';

export function useClients() {
  const { profile } = useAuthStore();
  const supabase = createClient();

  return useQuery({
    queryKey: ['clients', profile?.id],
    queryFn: async () => {
      if (!profile) return [];

      let query = supabase
        .from('clients')
        .select('*, dispatcher_clients(dispatcher_id)')
        .is('deleted_at', null);

      // If dispatcher, only show assigned clients
      if (profile.role === 'DISPATCHER') {
        const { data: assignments } = await supabase
          .from('dispatcher_clients')
          .select('client_id')
          .eq('dispatcher_id', profile.id)
          .eq('status', 'ACTIVE');
        
        const clientIds = assignments?.map(a => a.client_id) || [];
        query = query.in('id', clientIds);
      }

      const { data, error } = await query.order('company_name');

      if (error) throw error;
      
      // Map dispatcher_clients assignment to client.assigned_dispatcher_id
      return (data || []).map((client: any) => ({
        ...client,
        assigned_dispatcher_id: client.dispatcher_clients?.[0]?.dispatcher_id || null
      }));
    },
    enabled: !!profile,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (newClient: any) => {
      console.log('--- Client Creation Debug ---');
      console.log('Payload:', newClient);

      const { data, error } = await supabase
        .from('clients')
        .insert([{
          company_name: newClient.companyName,
          contact_person: newClient.contactName,
          email: newClient.email,
          phone: newClient.phone,
          contract_percentage: parseFloat(newClient.contractPercentage),
          status: 'ACTIVE'
        }])
        .select()
        .single();

      if (error) {
        console.error('Supabase Client Creation Error:', error);
        throw error;
      }

      // If a dispatcher was assigned, we also need to create the assignment record
      if (newClient.assignedDispatcher && data && user) {
        const { error: assignError } = await supabase
          .from('dispatcher_clients')
          .insert([{
            dispatcher_id: newClient.assignedDispatcher,
            client_id: data.id,
            assigned_by: user.id,
            status: 'ACTIVE'
          }]);
        
        if (assignError) {
          console.error('Dispatcher Assignment Error:', assignError);
          // We don't throw here to avoid failing the whole creation if just assignment fails, 
          // but in production we might want more robust atomicity via RPC.
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    }
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ clientId, updates }: { clientId: string; updates: any }) => {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', clientId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    }
  });
}
