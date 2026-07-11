'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth/permissions';

export async function createClientAction(clientData: {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  contractPercentage: string | number;
  assignedDispatcher?: string;
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
      throw new Error('Forbidden: Only admins can create clients');
    }

    // 2. Initialize admin client
    const adminClient = createAdminClient();

    // 3. Create the client record
    const { data: newClient, error: clientError } = await adminClient
      .from('clients')
      .insert([{
        company_name: clientData.companyName,
        contact_person: clientData.contactName,
        email: clientData.email,
        phone: clientData.phone,
        contract_percentage: parseFloat(clientData.contractPercentage as string) || 8,
        status: 'ACTIVE'
      }])
      .select()
      .single();

    if (clientError) {
      console.error('Error creating client:', clientError);
      throw new Error(clientError.message);
    }

    // 4. Create the dispatcher assignment if provided
    if (clientData.assignedDispatcher) {
      const { error: assignError } = await adminClient
        .from('dispatcher_clients')
        .insert([{
          dispatcher_id: clientData.assignedDispatcher,
          client_id: newClient.id,
          assigned_by: session.user.id,
          status: 'ACTIVE'
        }]);
      
      if (assignError) {
        console.error('Dispatcher Assignment Error:', assignError);
      }
    }

    return { 
      success: true, 
      data: newClient
    };

  } catch (error: any) {
    console.error('createClientAction failed:', error);
    return { success: false, error: error.message || 'Internal Server Error' };
  }
}
