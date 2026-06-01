'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function updateMyPasswordAction(newPassword: string) {
  try {
    const supabaseClient = await createClient();
    
    // Get the current user session
    const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
    
    if (sessionError || !session?.user?.id) {
      return { success: false, error: 'Unauthorized: No active session found.' };
    }

    const userId = session.user.id;

    // Use the admin client to forcefully and securely update the password
    // This bypasses any client-side session hanging issues
    const adminClient = createAdminClient();
    const { error: updateError } = await adminClient.auth.admin.updateUserById(userId, {
      password: newPassword,
    });

    if (updateError) {
      console.error('Admin password update error:', updateError);
      return { success: false, error: updateError.message };
    }

    // Since we used admin client, we should optionally sign out the user session globally
    // But we will let the client handle the signout redirect.
    return { success: true };

  } catch (error: any) {
    console.error('updateMyPasswordAction failed:', error);
    return { success: false, error: error.message || 'Internal Server Error' };
  }
}
