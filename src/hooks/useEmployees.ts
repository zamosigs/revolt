import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/useAuthStore';

export function useEmployees() {
  const supabase = createClient();
  const { profile } = useAuthStore();

  return useQuery({
    queryKey: ['employees', profile?.id, profile?.role],
    queryFn: async () => {
      if (!profile) return [];
      
      console.log('--- useEmployees Debug ---');
      let query = supabase
        .from('profiles')
        .select('*')
        .neq('role', 'SUPER_ADMIN')
        .is('deleted_at', null);

      if (profile.role === 'DISPATCH_MANAGER') {
        query = query.in('role', ['DISPATCHER', 'DISPATCH_MANAGER']);
      } else if (profile.role === 'SALES_MANAGER') {
        query = query.in('role', ['SALES_AGENT', 'SALES_MANAGER']);
      }
      // CEO, MD, SUPER_ADMIN see all (except SUPER_ADMIN which is filtered above)

      const { data, error } = await query.order('full_name');

      if (error) {
        console.error('Supabase Query Error (profiles):', error);
        throw error;
      }

      console.log('Total Profiles Fetched:', data?.length);
      return data || [];
    },
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newEmployee: any) => {
      console.log('--- Employee Creation via Server Action Debug ---');
      console.log('Payload:', newEmployee);

      // We dynamically import it here or at the top of the file, but since this is a client component hook,
      // it's cleaner to just import it at the top of the file. Wait, I'll update the imports as well.
      // For now, I'll just put the import at the top of the file in a separate replace_file_content call.
      
      const { createEmployeeAction } = await import('@/app/actions/employees');
      
      const result = await createEmployeeAction({
        fullName: newEmployee.fullName,
        email: newEmployee.email,
        role: newEmployee.role,
        baseSalary: newEmployee.baseSalary,
        commissionPercentage: newEmployee.commissionPercentage,
        password: newEmployee.password
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    }
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ employeeId, updates }: { employeeId: string; updates: any }) => {
      console.log('--- Employee Update via Server Action Debug ---');
      console.log('Employee ID:', employeeId);
      console.log('Updates:', updates);

      const { updateEmployeeAction } = await import('@/app/actions/employees');
      
      const result = await updateEmployeeAction(employeeId, updates);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    }
  });
}
