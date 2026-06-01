'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth/permissions';

export async function createEmployeeAction(employeeData: {
  fullName: string;
  email: string;
  role: string;
  baseSalary: string | number;
  commissionPercentage: string | number;
  password?: string;
}) {
  try {
    // 1. Verify caller has permission
    const supabaseClient = await createClient();
    const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
    
    if (sessionError || !session) {
      throw new Error('Unauthorized');
    }

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (!profile || !isAdmin(profile.role)) {
      throw new Error('Forbidden: Only admins can create employees');
    }

    // 2. Initialize admin client
    const adminClient = createAdminClient();

    // 3. Use the provided password, or generate a secure random password
    const temporaryPassword = employeeData.password && employeeData.password.trim() !== '' 
      ? employeeData.password 
      : crypto.randomUUID();

    // 4. Create the user in auth.users
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: employeeData.email,
      password: temporaryPassword,
      email_confirm: true, // Auto confirm so they don't have to verify email just to test
      user_metadata: {
        full_name: employeeData.fullName,
      },
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      throw new Error(authError.message);
    }

    const userId = authData.user.id;

    // 5. Create the profile record
    // We use the admin client here to bypass RLS entirely just in case
    const { data: profileData, error: profileError } = await adminClient
      .from('profiles')
      .insert([
        {
          id: userId,
          full_name: employeeData.fullName,
          email: employeeData.email,
          role: employeeData.role,
          base_salary: parseFloat(employeeData.baseSalary as string) || 0,
          commission_percentage: parseFloat(employeeData.commissionPercentage as string) || 0,
          status: 'ACTIVE',
        },
      ])
      .select()
      .single();

    if (profileError) {
      // Rollback auth user creation if profile fails
      await adminClient.auth.admin.deleteUser(userId);
      console.error('Error creating profile:', profileError);
      throw new Error(profileError.message);
    }

    return { 
      success: true, 
      data: profileData,
      temporaryPassword // We can return this to show in the UI if needed
    };

  } catch (error: any) {
    console.error('createEmployeeAction failed:', error);
    return { success: false, error: error.message || 'Internal Server Error' };
  }
}

export async function updateEmployeeAction(employeeId: string, updates: any) {
  try {
    // 1. Verify caller has permission
    const supabaseClient = await createClient();
    const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
    
    if (sessionError || !session) {
      throw new Error('Unauthorized');
    }

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (!profile || !isAdmin(profile.role)) {
      throw new Error('Forbidden: Only admins can update employees');
    }

    // 2. Initialize admin client
    const adminClient = createAdminClient();

    // 3. Update the profile record using the admin client
    const { data, error } = await adminClient
      .from('profiles')
      .update(updates)
      .eq('id', employeeId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      throw new Error(error.message);
    }

    return { 
      success: true, 
      data,
    };

  } catch (error: any) {
    console.error('updateEmployeeAction failed:', error);
    return { success: false, error: error.message || 'Internal Server Error' };
  }
}
